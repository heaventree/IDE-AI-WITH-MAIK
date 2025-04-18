# Variable Management and Placeholder Fulfillment Guide

This guide explains how to use the variable management and placeholder fulfillment features of the Documentation System. These features help maintain consistency across all documentation and track progress in completing documentation.

## Table of Contents

1. [Understanding Variables and Placeholders](#understanding-variables-and-placeholders)
2. [Using Variables in Documentation](#using-variables-in-documentation)
3. [Managing Variables](#managing-variables)
4. [Web Interface](#web-interface)
5. [Command Line Interface](#command-line-interface)
6. [API Reference](#api-reference)
7. [Best Practices](#best-practices)

## Understanding Variables and Placeholders

### Variables

Variables are key-value pairs stored in a centralized location (`variables.json` and `maik_ai_coding_app_variables.json`). They represent consistent information that might be used across multiple documentation files, such as:

- Project name and details
- Stakeholder information
- Architecture components
- Technical specifications
- Timeline milestones

Variables are organized into categories for easier management.

### Placeholders

Placeholders are references to variables in documentation files. They use the syntax `{{VARIABLE_NAME}}` and are automatically replaced with the corresponding variable value when applied.

Unfilled placeholders (those without corresponding variable values) are tracked by the system to help identify areas of documentation that need completion.

## Using Variables in Documentation

To use a variable in a documentation file, insert a placeholder using the following syntax:

```markdown
# Project Overview

This document provides an overview of the {{PROJECT_NAME}} project.

## Background

{{PROJECT_BACKGROUND}}

## Goals

1. {{PROJECT_GOAL_1}}
2. {{PROJECT_GOAL_2}}
3. {{PROJECT_GOAL_3}}
```

When variables are applied to this file, the placeholders will be replaced with their corresponding values from the variables files.

## Managing Variables

The Documentation System provides several ways to manage variables:

1. **Directly Edit Variables Files**: You can edit `variables.json` and `maik_ai_coding_app_variables.json` directly.
2. **Web Interface**: Use the web-based interface for a user-friendly way to manage variables.
3. **Command Line Interface**: Use the CLI tool for scriptable variable management.
4. **API**: Use the API endpoints programmatically.

## Web Interface

The Documentation System includes a web interface for managing variables and placeholders:

1. **Starting the Web Interface**:
   ```bash
   node docs-system/tools/web_interface.js
   ```

2. **Variables Management**:
   - View and edit variables by category
   - Save changes to update variable files
   - Import/export variables as JSON

3. **Placeholder Management**:
   - View unfilled placeholders
   - Filter placeholders by directory
   - Track documentation completion progress

4. **Apply Variables**:
   - Apply variables to specific files or directories
   - View results of variable application

## Command Line Interface

The Documentation System includes a command-line interface for managing variables and placeholders:

1. **Viewing Help**:
   ```bash
   node docs-system/tools/doc_cli.js help
   ```

2. **Scanning for Placeholders**:
   ```bash
   node docs-system/tools/doc_cli.js scan
   ```

3. **Listing Unfilled Placeholders**:
   ```bash
   node docs-system/tools/doc_cli.js list-placeholders [directory]
   ```

4. **Applying Variables**:
   ```bash
   node docs-system/tools/doc_cli.js apply-vars <path>
   ```

5. **Updating a Variable**:
   ```bash
   node docs-system/tools/doc_cli.js update-var <key> <value>
   ```

6. **Importing Variables**:
   ```bash
   node docs-system/tools/doc_cli.js import-vars <file>
   ```

7. **Exporting Variables**:
   ```bash
   node docs-system/tools/doc_cli.js export-vars [file]
   ```

## API Reference

The Documentation System provides API endpoints for programmatic access:

1. **Get Variables**:
   - Endpoint: `GET /api/variables`
   - Returns all project variables

2. **Update Variables**:
   - Endpoint: `POST /api/variables`
   - Body: JSON object with variables to update

3. **Get Unfilled Placeholders**:
   - Endpoint: `GET /api/placeholders?dirPath=<directory>&fileExtension=<extension>`
   - Returns unfilled placeholders in the specified directory

4. **Apply Variables**:
   - Endpoint: `POST /api/apply`
   - Body: `{ "path": "<path>", "isDirectory": <boolean>, "fileExtension": "<extension>" }`

5. **Get Documentation Progress**:
   - Endpoint: `GET /api/progress`
   - Returns documentation completion status

6. **Refresh Documentation Status**:
   - Endpoint: `GET /api/refresh`
   - Re-scans documentation and updates progress

## Best Practices

1. **Consistent Naming**: Use consistent naming for variables, following the UPPER_SNAKE_CASE convention.

2. **Categorize Variables**: Organize variables into logical categories.

3. **Regular Updates**: Regularly update and apply variables to keep documentation consistent.

4. **Track Progress**: Use the progress tracking features to identify areas of documentation that need attention.

5. **Version Control**: Include variable files in version control to track changes over time.

6. **Documentation**: Document the meaning and purpose of variables to help other contributors understand their usage.

7. **Automation**: Use the CLI tool in scripts to automate documentation tasks.

---

By effectively using the variable management and placeholder fulfillment features, you can maintain consistent, accurate, and up-to-date documentation across your entire project.