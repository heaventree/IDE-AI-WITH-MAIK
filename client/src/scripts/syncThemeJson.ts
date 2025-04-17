/**
 * MAIK AI Coding App - Theme JSON Synchronizer
 * 
 * This script ensures the theme.json file stays in sync with the design tokens.
 * It should be run when significant design token changes are made.
 * 
 * Usage:
 * > npx tsx client/src/scripts/syncThemeJson.ts
 */

import fs from 'fs';
import path from 'path';
import { themeConfig } from '../lib/designTokens';

// Root directory of the project
const rootDir = path.resolve(__dirname, '../../../');

// Path to theme.json
const themeJsonPath = path.join(rootDir, 'theme.json');

/**
 * Synchronize theme.json with current design tokens
 */
function syncThemeJson() {
  try {
    // Create new theme.json content
    const themeJson = JSON.stringify(themeConfig, null, 2);
    
    // Check if current theme.json exists
    let currentTheme = '{}';
    try {
      currentTheme = fs.readFileSync(themeJsonPath, 'utf8');
    } catch (err) {
      console.log('No existing theme.json found. Creating new file...');
    }
    
    // Compare with existing content
    if (currentTheme.trim() === themeJson.trim()) {
      console.log('✓ theme.json is already in sync with design tokens.');
      return;
    }
    
    // Backup existing theme.json if it exists
    if (fs.existsSync(themeJsonPath)) {
      const backupPath = `${themeJsonPath}.backup.${Date.now()}`;
      fs.copyFileSync(themeJsonPath, backupPath);
      console.log(`✓ Backup created at ${backupPath}`);
    }
    
    // Write new theme.json
    fs.writeFileSync(themeJsonPath, themeJson);
    console.log('✓ theme.json has been updated from design tokens!');
    
  } catch (error) {
    console.error('Error synchronizing theme.json:', error);
    process.exit(1);
  }
}

// Execute sync
syncThemeJson();