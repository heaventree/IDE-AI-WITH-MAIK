/**
 * MAIK AI Coding App - Styling Validator
 * 
 * This tool analyzes component files to ensure they follow the styling guidelines.
 * It detects potential styling issues like hardcoded values or mixed styling approaches.
 * 
 * Usage:
 * > npx tsx client/src/scripts/validateStyling.ts [path]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Get current file path (ESM compatible)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Default folder to scan
const DEFAULT_SCAN_PATH = 'client/src/components';

// Color regex patterns to detect hardcoded colors
const COLOR_PATTERNS = [
  /#[0-9a-fA-F]{3,8}\b/g, // Hex colors
  /rgba?\([^)]+\)/g, // RGB/RGBA colors
  /hsla?\([^)]+\)/g, // HSL/HSLA colors
];

// CSS dimension patterns to detect hardcoded values
const DIMENSION_PATTERNS = [
  /\b\d+px\b/g, // px values
  /\b\d+rem\b/g, // rem values 
  /\b\d+em\b/g, // em values
  /\b\d+vh\b/g, // vh values
  /\b\d+vw\b/g, // vw values
];

// Design token patterns to look for
const DESIGN_TOKEN_PATTERNS = [
  /var\(--[a-z-]+\)/g, // CSS variables
  /colors\.[a-zA-Z]+/g, // Design system color references
  /spacing\[\d+\]/g, // Design system spacing references
  /typography\.[a-zA-Z]+/g, // Design system typography references
];

// Mixed styling patterns to detect
const MIXED_STYLING_PATTERNS = {
  tailwind: /className="[^"]*"/g,
  themeUI: /sx=\{[^}]*\}/g,
  inlineStyle: /style=\{[^}]*\}/g,
  cssModule: /styles\.[a-zA-Z]+/g,
};

interface ValidationResult {
  file: string;
  issues: {
    type: string;
    line: number;
    content: string;
    suggestion: string;
  }[];
}

/**
 * Validates a single file for styling issues
 */
function validateFile(filePath: string): ValidationResult {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const issues: ValidationResult['issues'] = [];

  let usedStylingApproaches: string[] = [];

  // Check each line
  lines.forEach((line, index) => {
    // Check for hardcoded colors
    COLOR_PATTERNS.forEach(pattern => {
      const matches = line.match(pattern);
      if (matches) {
        matches.forEach(match => {
          issues.push({
            type: 'Hardcoded Color',
            line: index + 1,
            content: line.trim(),
            suggestion: `Replace "${match}" with a design token reference (colors.* or CSS variable)`,
          });
        });
      }
    });

    // Check for hardcoded dimensions
    DIMENSION_PATTERNS.forEach(pattern => {
      const matches = line.match(pattern);
      if (matches) {
        matches.forEach(match => {
          issues.push({
            type: 'Hardcoded Dimension',
            line: index + 1,
            content: line.trim(),
            suggestion: `Replace "${match}" with a design token reference (spacing[] or CSS variable)`,
          });
        });
      }
    });

    // Track styling approaches used
    Object.entries(MIXED_STYLING_PATTERNS).forEach(([approach, pattern]) => {
      if (line.match(pattern) && !usedStylingApproaches.includes(approach)) {
        usedStylingApproaches.push(approach);
      }
    });
  });

  // Check for mixed styling approaches
  if (usedStylingApproaches.length > 1) {
    issues.push({
      type: 'Mixed Styling Approaches',
      line: 0,
      content: `File uses multiple styling approaches: ${usedStylingApproaches.join(', ')}`,
      suggestion: 'Standardize on a single styling approach (preferably Tailwind CSS)',
    });
  }

  return {
    file: filePath,
    issues,
  };
}

/**
 * Scans a directory for component files and validates them
 */
function scanDirectory(dir: string, results: ValidationResult[] = []) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      scanDirectory(filePath, results);
    } else if (
      stat.isFile() && 
      (filePath.endsWith('.tsx') || filePath.endsWith('.jsx'))
    ) {
      // Skip generated files
      if (filePath.includes('node_modules') || filePath.includes('.next')) {
        continue;
      }

      const result = validateFile(filePath);
      if (result.issues.length > 0) {
        results.push(result);
      }
    }
  }

  return results;
}

/**
 * Main function to run the validation
 */
function main() {
  try {
    // Get directory to scan from command line args or use default
    const targetDir = process.argv[2] || DEFAULT_SCAN_PATH;
    console.log(`Scanning ${targetDir} for styling issues...`);

    // Run the scan
    const results = scanDirectory(targetDir);

    // Report results
    if (results.length === 0) {
      console.log('\n✅ No styling issues found!');
    } else {
      console.log(`\n❌ Found styling issues in ${results.length} files:`);
      
      results.forEach(result => {
        console.log(`\n📄 ${result.file} (${result.issues.length} issues):`);
        
        result.issues.forEach(issue => {
          console.log(`  Line ${issue.line}: ${issue.type}`);
          if (issue.content) {
            console.log(`    ${issue.content.slice(0, 100)}${issue.content.length > 100 ? '...' : ''}`);
          }
          console.log(`    💡 ${issue.suggestion}`);
        });
      });

      console.log('\nReview the STYLING_GUIDE.md for more information on proper styling guidelines.');
    }
  } catch (error) {
    console.error('Error running styling validation:', error);
    process.exit(1);
  }
}

// Run the validation
main();