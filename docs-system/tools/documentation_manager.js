/**
 * Documentation Manager for Bolt DIY
 * 
 * This module provides centralized functionality for managing documentation variables,
 * placeholders, and tasks. It serves as the backbone for the documentation system,
 * ensuring consistency across all documentation files.
 * 
 * Key features:
 * - Variable management and placeholder fulfillment
 * - Documentation task tracking
 * - Placeholder identification and progress monitoring
 * - Theme support and plugin architecture
 */

const fs = require('fs');
const path = require('path');

// Configuration
const DOCS_ROOT = path.join(__dirname, '..');
const VARIABLES_FILE = path.join(DOCS_ROOT, 'variables.json');
const MAIK_VARIABLES_FILE = path.join(DOCS_ROOT, 'maik_ai_coding_app_variables.json');
const TEMPLATES_DIR = path.join(DOCS_ROOT, 'templates');
const DOCS_DIR = path.join(DOCS_ROOT, 'docs');

// Regular expression to find placeholder variables like {{variableName}}
const PLACEHOLDER_REGEX = /{{([A-Z_][A-Z0-9_]*)}}/g;

// Base state
let projectVariables = {};
let documentationTasks = [];
let placeholderProgress = {
    total: 0,
    filled: 0,
    percentComplete: 0
};
let overallProgress = 0;

/**
 * Initialize the documentation manager
 * Loads variables and sets up initial state
 */
function initialize() {
    loadVariables();
    scanForPlaceholders();
    console.log('Documentation Manager initialized');
    return {
        variables: projectVariables,
        placeholderProgress: placeholderProgress,
        overallProgress: overallProgress
    };
}

/**
 * Load variables from both general and project-specific variable files
 */
function loadVariables() {
    try {
        // Load base variables
        if (fs.existsSync(VARIABLES_FILE)) {
            const baseVars = JSON.parse(fs.readFileSync(VARIABLES_FILE, 'utf8'));
            projectVariables = baseVars;
        }
        
        // Load and merge MAIK-specific variables
        if (fs.existsSync(MAIK_VARIABLES_FILE)) {
            const maikVars = JSON.parse(fs.readFileSync(MAIK_VARIABLES_FILE, 'utf8'));
            
            // Merge with existing variables, favoring MAIK values
            projectVariables = mergeVariables(projectVariables, maikVars);
        }
        
        console.log('Variables loaded successfully');
    } catch (error) {
        console.error('Error loading variables:', error);
        projectVariables = {};
    }
    
    return projectVariables;
}

/**
 * Merge two variable objects, with the second object's values taking precedence
 * @param {Object} baseVars - Base variables
 * @param {Object} overrideVars - Override variables
 * @returns {Object} Merged variables
 */
function mergeVariables(baseVars, overrideVars) {
    const merged = { ...baseVars };
    
    // Recursively merge nested objects
    for (const [key, value] of Object.entries(overrideVars)) {
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            merged[key] = mergeVariables(merged[key] || {}, value);
        } else {
            merged[key] = value;
        }
    }
    
    return merged;
}

/**
 * Get flattened variables for easy lookup
 * @returns {Object} Flattened variables
 */
function getFlattenedVariables() {
    const flattenVariables = (obj, prefix = '') => {
        return Object.keys(obj).reduce((acc, key) => {
            const prefixedKey = prefix ? `${prefix}.${key}` : key;
            if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
                Object.assign(acc, flattenVariables(obj[key], prefixedKey));
            } else {
                acc[prefixedKey] = obj[key];
                // Also create entries with just the key name for simple replacements
                const simpleName = key.toUpperCase();
                acc[simpleName] = obj[key];
            }
            return acc;
        }, {});
    };
    
    return flattenVariables(projectVariables);
}

/**
 * Scan all documentation files for placeholders and update progress
 */
function scanForPlaceholders() {
    const allPlaceholders = new Set();
    const filledPlaceholders = new Set();
    const flatVars = getFlattenedVariables();
    
    // Function to scan a file for placeholders
    function scanFile(filePath) {
        const content = fs.readFileSync(filePath, 'utf8');
        let match;
        
        // Reset the regex
        PLACEHOLDER_REGEX.lastIndex = 0;
        
        // Find all placeholders
        while ((match = PLACEHOLDER_REGEX.exec(content)) !== null) {
            const placeholder = match[1];
            allPlaceholders.add(placeholder);
            
            // Check if this placeholder has a value
            const dotNotation = placeholder.split('_').join('.');
            if (flatVars[placeholder] && flatVars[placeholder] !== placeholder) {
                filledPlaceholders.add(placeholder);
            } else if (flatVars[dotNotation] && flatVars[dotNotation] !== dotNotation) {
                filledPlaceholders.add(placeholder);
            }
        }
    }
    
    // Recursive function to scan directories
    function scanDir(dir) {
        const items = fs.readdirSync(dir);
        
        for (const item of items) {
            const itemPath = path.join(dir, item);
            const stats = fs.statSync(itemPath);
            
            if (stats.isDirectory()) {
                scanDir(itemPath);
            } else if (stats.isFile() && (item.endsWith('.md') || item.endsWith('.html'))) {
                scanFile(itemPath);
            }
        }
    }
    
    // Start scanning
    try {
        scanDir(DOCS_DIR);
        scanDir(TEMPLATES_DIR);
        
        // Update progress
        placeholderProgress = {
            total: allPlaceholders.size,
            filled: filledPlaceholders.size,
            unfilled: allPlaceholders.size - filledPlaceholders.size,
            percentComplete: allPlaceholders.size ? 
                Math.round((filledPlaceholders.size / allPlaceholders.size) * 100) : 100,
            placeholders: {
                all: [...allPlaceholders],
                filled: [...filledPlaceholders],
                unfilled: [...allPlaceholders].filter(p => !filledPlaceholders.has(p))
            }
        };
        
        // Calculate overall progress as a combination of placeholder completion and document coverage
        overallProgress = placeholderProgress.percentComplete;
        
        console.log(`Placeholder scan complete: ${placeholderProgress.filled}/${placeholderProgress.total} (${placeholderProgress.percentComplete}%)`);
    } catch (error) {
        console.error('Error scanning for placeholders:', error);
        placeholderProgress = { total: 0, filled: 0, percentComplete: 0, placeholders: { all: [], filled: [], unfilled: [] } };
        overallProgress = 0;
    }
    
    return placeholderProgress;
}

/**
 * Get unfilled placeholders in a specific directory or file
 * @param {string} dirPath - Directory path relative to docs root
 * @param {string} fileExtension - File extension to scan
 * @returns {Object} Unfilled placeholders information
 */
function getUnfilledPlaceholders(dirPath = '', fileExtension = '.md') {
    const targetPath = path.join(DOCS_ROOT, dirPath);
    const unfilled = new Set();
    const flatVars = getFlattenedVariables();
    
    // Function to scan a file for unfilled placeholders
    function scanFile(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            let match;
            
            // Reset the regex
            PLACEHOLDER_REGEX.lastIndex = 0;
            
            // Find all placeholders
            while ((match = PLACEHOLDER_REGEX.exec(content)) !== null) {
                const placeholder = match[1];
                
                // Check if this placeholder has a value
                const dotNotation = placeholder.split('_').join('.');
                if ((!flatVars[placeholder] || flatVars[placeholder] === placeholder) && 
                    (!flatVars[dotNotation] || flatVars[dotNotation] === dotNotation)) {
                    unfilled.add({
                        placeholder: placeholder,
                        file: path.relative(DOCS_ROOT, filePath),
                        line: getLineNumber(content, match.index)
                    });
                }
            }
        } catch (error) {
            console.error(`Error scanning file ${filePath}:`, error);
        }
    }
    
    // Helper to get line number for a position
    function getLineNumber(content, position) {
        const lines = content.slice(0, position).split('\n');
        return lines.length;
    }
    
    // Recursive function to scan directories
    function scanDir(dir) {
        try {
            const items = fs.readdirSync(dir);
            
            for (const item of items) {
                const itemPath = path.join(dir, item);
                const stats = fs.statSync(itemPath);
                
                if (stats.isDirectory()) {
                    scanDir(itemPath);
                } else if (stats.isFile() && itemPath.endsWith(fileExtension)) {
                    scanFile(itemPath);
                }
            }
        } catch (error) {
            console.error(`Error scanning directory ${dir}:`, error);
        }
    }
    
    // Start scanning
    if (fs.existsSync(targetPath)) {
        if (fs.statSync(targetPath).isDirectory()) {
            scanDir(targetPath);
        } else if (targetPath.endsWith(fileExtension)) {
            scanFile(targetPath);
        }
    }
    
    return {
        path: dirPath,
        fileExtension,
        unfilled: [...unfilled],
        count: unfilled.size
    };
}

/**
 * Apply variables to a specific file
 * @param {string} filePath - Path to the file relative to docs root
 * @returns {Object} Result of the operation
 */
function applyVariablesToFile(filePath) {
    const fullPath = path.join(DOCS_ROOT, filePath);
    
    if (!fs.existsSync(fullPath)) {
        return { success: false, error: 'File not found' };
    }
    
    try {
        let content = fs.readFileSync(fullPath, 'utf8');
        const flatVars = getFlattenedVariables();
        let replacements = 0;
        
        // Replace placeholders
        for (const [key, value] of Object.entries(flatVars)) {
            const simpleName = key.split('.').pop().toUpperCase();
            const regex = new RegExp(`{{${simpleName}}}`, 'g');
            const before = content;
            content = content.replace(regex, value);
            
            if (before !== content) {
                replacements++;
            }
        }
        
        // Write the processed file
        fs.writeFileSync(fullPath, content);
        
        // Re-scan to update progress
        scanForPlaceholders();
        
        return { 
            success: true, 
            replacements,
            file: filePath,
            remainingPlaceholders: content.match(PLACEHOLDER_REGEX) || []
        };
    } catch (error) {
        console.error(`Error applying variables to ${filePath}:`, error);
        return { success: false, error: error.message };
    }
}

/**
 * Apply variables to all files in a directory
 * @param {string} dirPath - Path to the directory relative to docs root
 * @param {string} fileExtension - File extension to process
 * @returns {Object} Result of the operation
 */
function applyVariablesToDirectory(dirPath, fileExtension = '.md') {
    const fullPath = path.join(DOCS_ROOT, dirPath);
    
    if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isDirectory()) {
        return { success: false, error: 'Directory not found' };
    }
    
    const results = { 
        success: true,
        processedFiles: 0,
        filesWithReplacements: 0,
        totalReplacements: 0,
        errors: []
    };
    
    // Recursive function to process directories
    function processDir(dir) {
        try {
            const items = fs.readdirSync(dir);
            
            for (const item of items) {
                const itemPath = path.join(dir, item);
                const stats = fs.statSync(itemPath);
                
                if (stats.isDirectory()) {
                    processDir(itemPath);
                } else if (stats.isFile() && itemPath.endsWith(fileExtension)) {
                    const relPath = path.relative(DOCS_ROOT, itemPath);
                    const result = applyVariablesToFile(relPath);
                    
                    results.processedFiles++;
                    
                    if (result.success) {
                        results.totalReplacements += result.replacements;
                        if (result.replacements > 0) {
                            results.filesWithReplacements++;
                        }
                    } else {
                        results.errors.push({
                            file: relPath,
                            error: result.error
                        });
                    }
                }
            }
        } catch (error) {
            console.error(`Error processing directory ${dir}:`, error);
            results.errors.push({
                directory: dir,
                error: error.message
            });
        }
    }
    
    // Start processing
    processDir(fullPath);
    
    // Re-scan to update progress
    scanForPlaceholders();
    
    return results;
}

/**
 * Update project variables
 * @param {Object} newVariables - New variables to merge
 * @returns {Object} Result of the operation
 */
function updateProjectVariables(newVariables) {
    try {
        // Merge with existing variables
        projectVariables = mergeVariables(projectVariables, newVariables);
        
        // Write variables to file
        fs.writeFileSync(VARIABLES_FILE, JSON.stringify(projectVariables, null, 2));
        
        // Update MAIK-specific variables
        const maikVars = getMaikSpecificVariables();
        const updatedMaikVars = mergeVariables(maikVars, newVariables);
        fs.writeFileSync(MAIK_VARIABLES_FILE, JSON.stringify(updatedMaikVars, null, 2));
        
        // Re-scan to update progress
        scanForPlaceholders();
        
        return { 
            success: true, 
            variables: projectVariables,
            placeholderProgress
        };
    } catch (error) {
        console.error('Error updating variables:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get MAIK-specific variables from file
 * @returns {Object} MAIK-specific variables
 */
function getMaikSpecificVariables() {
    try {
        if (fs.existsSync(MAIK_VARIABLES_FILE)) {
            return JSON.parse(fs.readFileSync(MAIK_VARIABLES_FILE, 'utf8'));
        }
    } catch (error) {
        console.error('Error loading MAIK variables:', error);
    }
    
    return {};
}

/**
 * Get current documentation progress
 * @returns {Object} Documentation progress
 */
function getDocumentationProgress() {
    return {
        placeholderProgress,
        overallProgress,
        taskProgress: getTaskProgress(),
        lastUpdated: new Date().toISOString()
    };
}

/**
 * Get task progress
 * @returns {Object} Task progress information
 */
function getTaskProgress() {
    // This is a placeholder for task tracking functionality
    // It will be expanded in future implementations
    return {
        total: 0,
        completed: 0,
        inProgress: 0,
        notStarted: 0,
        progress: {
            percentComplete: 0
        }
    };
}

module.exports = {
    initialize,
    loadVariables,
    getUnfilledPlaceholders,
    applyVariablesToFile,
    applyVariablesToDirectory,
    updateProjectVariables,
    getDocumentationProgress,
    getFlattenedVariables,
    scanForPlaceholders,
    projectVariables  // Expose variables for API access
};