/**
 * Documentation API Module
 * 
 * This module provides API endpoints for interacting with the documentation system.
 * It serves as the interface for managing variables, placeholders, and documentation tasks.
 */

const express = require('express');
const router = express.Router();
const documentationManager = require('../tools/documentation_manager');

// Initialize the documentation manager
documentationManager.initialize();

/**
 * GET /api/documentation/variables
 * Get all project variables
 */
router.get('/variables', (req, res) => {
    res.json({
        success: true,
        variables: documentationManager.projectVariables
    });
});

/**
 * POST /api/documentation/variables
 * Update project variables
 */
router.post('/variables', (req, res) => {
    const newVariables = req.body;
    
    if (!newVariables || Object.keys(newVariables).length === 0) {
        return res.status(400).json({
            success: false,
            error: 'No variables provided'
        });
    }
    
    const result = documentationManager.updateProjectVariables(newVariables);
    
    if (result.success) {
        res.json(result);
    } else {
        res.status(500).json(result);
    }
});

/**
 * GET /api/documentation/placeholders
 * Get unfilled placeholders
 */
router.get('/placeholders', (req, res) => {
    const dirPath = req.query.dirPath || '';
    const fileExtension = req.query.fileExtension || '.md';
    
    const unfilledPlaceholders = documentationManager.getUnfilledPlaceholders(dirPath, fileExtension);
    res.json({
        success: true,
        ...unfilledPlaceholders
    });
});

/**
 * POST /api/documentation/apply
 * Apply variables to a file or directory
 */
router.post('/apply', (req, res) => {
    const { path, isDirectory, fileExtension = '.md' } = req.body;
    
    if (!path) {
        return res.status(400).json({
            success: false,
            error: 'Path is required'
        });
    }
    
    let result;
    if (isDirectory) {
        result = documentationManager.applyVariablesToDirectory(path, fileExtension);
    } else {
        result = documentationManager.applyVariablesToFile(path);
    }
    
    if (result.success) {
        res.json(result);
    } else {
        res.status(500).json(result);
    }
});

/**
 * GET /api/documentation/progress
 * Get documentation completion status
 */
router.get('/progress', (req, res) => {
    // Re-scan to ensure the latest status
    documentationManager.scanForPlaceholders();
    
    const progress = documentationManager.getDocumentationProgress();
    
    // Calculate overall completion percentage
    const placeholderCompletion = progress.placeholderProgress.percentComplete || 0;
    const taskCompletion = progress.taskProgress.progress.percentComplete || 0;
    const overallCompletion = progress.overallProgress || 0;
    
    // Generate completion message
    let completionMessage = '';
    if (overallCompletion === 100) {
        completionMessage = 'Congratulations! All documentation tasks are complete. The documentation is fully prepared and ready for review.';
    } else if (overallCompletion >= 90) {
        completionMessage = 'Almost there! Just a few more placeholders to fill in to complete the documentation.';
    } else if (overallCompletion >= 70) {
        completionMessage = 'Good progress! Continue filling in placeholders and creating any missing files.';
    } else if (overallCompletion >= 50) {
        completionMessage = 'Halfway there. Focus on completing the documentation files and filling in remaining placeholders.';
    } else {
        completionMessage = 'Documentation needs attention. Please prioritize creating missing files and filling in placeholders.';
    }
    
    res.json({
        success: true,
        progress,
        completionMessage,
        isComplete: overallCompletion === 100
    });
});

/**
 * GET /api/documentation/refresh
 * Refresh documentation status by re-scanning
 */
router.get('/refresh', (req, res) => {
    documentationManager.scanForPlaceholders();
    res.json({
        success: true,
        message: 'Documentation status refreshed',
        progress: documentationManager.getDocumentationProgress()
    });
});

module.exports = router;