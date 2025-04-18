#!/usr/bin/env node

/**
 * Documentation System Setup Script
 * 
 * This script installs the necessary dependencies for the documentation system
 * and performs initial setup.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const DOCS_ROOT = path.join(__dirname, '..');
const VARIABLES_FILE = path.join(DOCS_ROOT, 'variables.json');
const MAIK_VARIABLES_FILE = path.join(DOCS_ROOT, 'maik_ai_coding_app_variables.json');
const WEB_INTERFACE_DIR = path.join(DOCS_ROOT, 'web_interface');

console.log('Starting Documentation System Setup...');

// Check for required dependencies
try {
    console.log('Checking for required dependencies...');
    
    // Node.js - already running if we're here
    const nodeVersion = execSync('node --version').toString().trim();
    console.log(`Node.js version: ${nodeVersion}`);
    
    // Express - only needed if not already installed
    let expressInstalled = false;
    try {
        require.resolve('express');
        expressInstalled = true;
        console.log('Express is already installed.');
    } catch (error) {
        console.log('Express is not installed, will install it.');
    }
    
    if (!expressInstalled) {
        console.log('Installing Express...');
        execSync('npm install express', { stdio: 'inherit' });
        console.log('Express installed successfully.');
    }
    
    console.log('All dependencies are present.');
} catch (error) {
    console.error('Error checking dependencies:', error.message);
    process.exit(1);
}

// Create required directories if they don't exist
try {
    console.log('Creating required directories...');
    
    // Web interface directory
    if (!fs.existsSync(WEB_INTERFACE_DIR)) {
        fs.mkdirSync(WEB_INTERFACE_DIR, { recursive: true });
        console.log(`Created ${WEB_INTERFACE_DIR}`);
    }
    
    console.log('All required directories are present.');
} catch (error) {
    console.error('Error creating directories:', error.message);
    process.exit(1);
}

// Ensure variables files exist
try {
    console.log('Checking variables files...');
    
    // Base variables file
    if (!fs.existsSync(VARIABLES_FILE)) {
        console.log(`Creating ${VARIABLES_FILE}...`);
        // Create with default structure
        const defaultVariables = {
            project: {
                PROJECT_NAME: "Project name (e.g., 'Customer Dashboard')",
                PROJECT_DESCRIPTION: "Brief description of the project"
            }
        };
        fs.writeFileSync(VARIABLES_FILE, JSON.stringify(defaultVariables, null, 2));
        console.log(`Created ${VARIABLES_FILE}`);
    }
    
    // Project-specific variables file
    if (!fs.existsSync(MAIK_VARIABLES_FILE)) {
        console.log(`Creating ${MAIK_VARIABLES_FILE}...`);
        // Create with default structure for MAIK project
        const defaultMaikVariables = {
            project: {
                PROJECT_NAME: "MAIK-AI-CODING-APP",
                PROJECT_DESCRIPTION: "An advanced AI-powered collaborative IDE with intelligent code suggestions, error monitoring, and developer productivity tools"
            }
        };
        fs.writeFileSync(MAIK_VARIABLES_FILE, JSON.stringify(defaultMaikVariables, null, 2));
        console.log(`Created ${MAIK_VARIABLES_FILE}`);
    }
    
    console.log('Variables files are ready.');
} catch (error) {
    console.error('Error checking variables files:', error.message);
    process.exit(1);
}

// Initialize the documentation manager
try {
    console.log('Initializing documentation manager...');
    
    const documentationManager = require('./documentation_manager');
    const result = documentationManager.initialize();
    
    console.log(`Loaded ${Object.keys(result.variables).length} variable categories.`);
    console.log(`Placeholder Progress: ${result.placeholderProgress.filled}/${result.placeholderProgress.total} (${result.placeholderProgress.percentComplete}%)`);
    
    console.log('Documentation manager initialized successfully.');
} catch (error) {
    console.error('Error initializing documentation manager:', error.message);
    process.exit(1);
}

console.log('\nDocumentation System Setup Complete!');
console.log('\nYou can now use the following commands:');
console.log('  - Start Web Interface: node docs-system/tools/web_interface.js');
console.log('  - Use CLI Tool: node docs-system/tools/doc_cli.js help');
console.log('\nFor more information, see docs-system/docs/variable_management_guide.md');