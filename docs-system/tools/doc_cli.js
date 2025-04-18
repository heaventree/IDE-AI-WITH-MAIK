#!/usr/bin/env node

/**
 * Documentation CLI Tool
 * 
 * Command-line tool for interacting with the documentation system.
 * Provides commands for managing variables, placeholders, and documentation tasks.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const documentationManager = require('./documentation_manager');

// Initialize the documentation manager
documentationManager.initialize();

// Parse command-line arguments
const args = process.argv.slice(2);
const command = args[0];

// Create readline interface for interactive prompts
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

/**
 * Display help information
 */
function showHelp() {
    console.log(`
Documentation CLI Tool

Usage:
  node doc_cli.js <command> [options]

Commands:
  scan                           Scan for placeholders and show progress
  list-placeholders [directory]  List unfilled placeholders (optional directory)
  apply-vars <path>              Apply variables to a file or directory
  update-var <key> <value>       Update a specific variable
  import-vars <file>             Import variables from a JSON file
  export-vars [file]             Export variables to a JSON file
  help                           Show this help information

Examples:
  node doc_cli.js scan
  node doc_cli.js list-placeholders templates
  node doc_cli.js apply-vars docs/architecture
  node doc_cli.js update-var project.PROJECT_NAME "New Project Name"
  node doc_cli.js import-vars custom_variables.json
  node doc_cli.js export-vars backup_variables.json
`);
}

/**
 * Scan for placeholders and show progress
 */
function scanPlaceholders() {
    console.log('Scanning for placeholders...');
    const progress = documentationManager.scanForPlaceholders();
    
    console.log(`
Placeholder Progress:
  Total placeholders: ${progress.total}
  Filled placeholders: ${progress.filled}
  Unfilled placeholders: ${progress.unfilled}
  Completion: ${progress.percentComplete}%
`);

    if (progress.unfilled > 0) {
        console.log('Top unfilled placeholders:');
        progress.placeholders.unfilled.slice(0, 10).forEach(placeholder => {
            console.log(`  - {{${placeholder}}}`);
        });
        
        if (progress.placeholders.unfilled.length > 10) {
            console.log(`  ... and ${progress.placeholders.unfilled.length - 10} more`);
        }
    }
    
    process.exit(0);
}

/**
 * List unfilled placeholders
 * @param {string} directory - Optional directory to scan
 */
function listPlaceholders(directory = '') {
    console.log(`Listing unfilled placeholders in ${directory || 'all directories'}...`);
    
    const result = documentationManager.getUnfilledPlaceholders(directory);
    
    if (result.unfilled.length === 0) {
        console.log('No unfilled placeholders found.');
    } else {
        console.log(`Found ${result.count} unfilled placeholders:`);
        
        result.unfilled.forEach(item => {
            console.log(`  - {{${item.placeholder}}} in ${item.file} (line ${item.line})`);
        });
    }
    
    process.exit(0);
}

/**
 * Apply variables to a file or directory
 * @param {string} targetPath - Path to file or directory
 */
function applyVariables(targetPath) {
    if (!targetPath) {
        console.error('Error: Path is required');
        process.exit(1);
    }
    
    const fullPath = path.resolve(targetPath);
    const relativePath = path.relative(path.join(__dirname, '..'), fullPath);
    
    console.log(`Applying variables to ${relativePath}...`);
    
    let result;
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
        result = documentationManager.applyVariablesToDirectory(relativePath);
        
        if (result.success) {
            console.log(`
Applied variables to ${result.processedFiles} files:
  - Files with replacements: ${result.filesWithReplacements}
  - Total replacements: ${result.totalReplacements}
`);
            
            if (result.errors.length > 0) {
                console.log('Errors:');
                result.errors.forEach(error => {
                    console.log(`  - ${error.file || error.directory}: ${error.error}`);
                });
            }
        }
    } else {
        result = documentationManager.applyVariablesToFile(relativePath);
        
        if (result.success) {
            console.log(`
Applied variables to ${relativePath}:
  - Replacements: ${result.replacements}
`);
            
            if (result.remainingPlaceholders.length > 0) {
                console.log('Remaining placeholders:');
                result.remainingPlaceholders.forEach(placeholder => {
                    console.log(`  - ${placeholder}`);
                });
            }
        }
    }
    
    if (!result.success) {
        console.error(`Error: ${result.error}`);
        process.exit(1);
    }
    
    process.exit(0);
}

/**
 * Update a specific variable
 * @param {string} key - Variable key
 * @param {string} value - New value
 */
function updateVariable(key, value) {
    if (!key) {
        console.error('Error: Variable key is required');
        process.exit(1);
    }
    
    if (value === undefined) {
        console.error('Error: Variable value is required');
        process.exit(1);
    }
    
    console.log(`Updating variable ${key} to "${value}"...`);
    
    // Build nested object from dot notation
    const keyParts = key.split('.');
    const newVars = {};
    let currentObj = newVars;
    
    keyParts.forEach((part, index) => {
        if (index === keyParts.length - 1) {
            currentObj[part] = value;
        } else {
            currentObj[part] = {};
            currentObj = currentObj[part];
        }
    });
    
    const result = documentationManager.updateProjectVariables(newVars);
    
    if (result.success) {
        console.log(`Variable ${key} updated successfully`);
    } else {
        console.error(`Error: ${result.error}`);
        process.exit(1);
    }
    
    process.exit(0);
}

/**
 * Import variables from a JSON file
 * @param {string} filePath - Path to JSON file
 */
function importVariables(filePath) {
    if (!filePath) {
        console.error('Error: File path is required');
        process.exit(1);
    }
    
    try {
        const fullPath = path.resolve(filePath);
        console.log(`Importing variables from ${fullPath}...`);
        
        if (!fs.existsSync(fullPath)) {
            console.error(`Error: File ${fullPath} not found`);
            process.exit(1);
        }
        
        const variables = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
        
        if (!variables || typeof variables !== 'object') {
            console.error('Error: Invalid variables file. Expected JSON object.');
            process.exit(1);
        }
        
        const result = documentationManager.updateProjectVariables(variables);
        
        if (result.success) {
            console.log(`Variables imported successfully from ${fullPath}`);
            console.log(`Placeholder progress: ${result.placeholderProgress.filled}/${result.placeholderProgress.total} (${result.placeholderProgress.percentComplete}%)`);
        } else {
            console.error(`Error: ${result.error}`);
            process.exit(1);
        }
    } catch (error) {
        console.error(`Error importing variables: ${error.message}`);
        process.exit(1);
    }
    
    process.exit(0);
}

/**
 * Export variables to a JSON file
 * @param {string} filePath - Path to output JSON file
 */
function exportVariables(filePath = 'variables_export.json') {
    try {
        const fullPath = path.resolve(filePath);
        console.log(`Exporting variables to ${fullPath}...`);
        
        fs.writeFileSync(fullPath, JSON.stringify(documentationManager.projectVariables, null, 2));
        
        console.log(`Variables exported successfully to ${fullPath}`);
    } catch (error) {
        console.error(`Error exporting variables: ${error.message}`);
        process.exit(1);
    }
    
    process.exit(0);
}

// Execute the appropriate command
switch (command) {
    case 'scan':
        scanPlaceholders();
        break;
        
    case 'list-placeholders':
        listPlaceholders(args[1]);
        break;
        
    case 'apply-vars':
        applyVariables(args[1]);
        break;
        
    case 'update-var':
        updateVariable(args[1], args[2]);
        break;
        
    case 'import-vars':
        importVariables(args[1]);
        break;
        
    case 'export-vars':
        exportVariables(args[1]);
        break;
        
    case 'help':
    case '--help':
    case '-h':
        showHelp();
        process.exit(0);
        break;
        
    default:
        console.error(`Unknown command: ${command}`);
        console.log('Use "node doc_cli.js help" for available commands');
        process.exit(1);
}

// Close readline interface
rl.close();