/**
 * Template Population Script for Bolt DIY
 *
 * This script replaces template variables in documentation files with 
 * Bolt DIY-specific values from the bolt_diy_variables.json file.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const TEMPLATES_DIR = path.join(__dirname, '..', 'templates');
const OUTPUT_DIR = path.join(__dirname, '..', 'docs');
const VARIABLES_FILE = path.join(__dirname, '..', 'maik_ai_coding_app_variables.json');

// Create output directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Load variables from file
let variables;
try {
  variables = JSON.parse(fs.readFileSync(VARIABLES_FILE, 'utf8'));
  console.log(`Loaded variables from ${VARIABLES_FILE}`);
} catch (err) {
  console.error(`Error loading variables: ${err.message}`);
  process.exit(1);
}

// Flatten nested variables object for easy lookup
const flattenVariables = (obj, prefix = '') => {
  return Object.keys(obj).reduce((acc, key) => {
    const prefixedKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      Object.assign(acc, flattenVariables(obj[key], prefixedKey));
    } else {
      acc[prefixedKey] = obj[key];
    }
    return acc;
  }, {});
};

const flatVariables = flattenVariables(variables);

// Function to replace variables in a file
const processFile = (filePath, outputPath) => {
  console.log(`Processing ${filePath}...`);
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace all {{VARIABLE_NAME}} occurrences
    for (const [key, value] of Object.entries(flatVariables)) {
      const variableName = key.split('.').pop();
      const regex = new RegExp(`{{${variableName}}}`, 'g');
      content = content.replace(regex, value);
    }
    
    // Check if any template variables remain
    const remainingVars = content.match(/{{[A-Z_]+}}/g);
    if (remainingVars) {
      console.warn(`Warning: ${outputPath} contains unpopulated variables: ${remainingVars.join(', ')}`);
    }
    
    // Write the processed file
    fs.writeFileSync(outputPath, content);
    console.log(`  Created ${outputPath}`);
  } catch (err) {
    console.error(`  Error processing ${filePath}: ${err.message}`);
  }
};

// Function to process a directory recursively
const processDirectory = (dir, outDir) => {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const itemPath = path.join(dir, item);
    const outputPath = path.join(outDir, item);
    
    const stats = fs.statSync(itemPath);
    
    if (stats.isDirectory()) {
      // Create the output subdirectory if it doesn't exist
      if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath, { recursive: true });
      }
      // Process the subdirectory recursively
      processDirectory(itemPath, outputPath);
    } else if (stats.isFile() && item.endsWith('.md')) {
      // Process markdown files
      processFile(itemPath, outputPath);
    }
  }
};

// Main execution
console.log('Starting template population...');
processDirectory(TEMPLATES_DIR, OUTPUT_DIR);
console.log('Template population complete!');