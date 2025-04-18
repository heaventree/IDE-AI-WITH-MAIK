# Troubleshooting Guide

## Purpose

This guide helps resolve common issues encountered when working with the Documentation System. Use this as your first resource when facing problems before asking for assistance.

## Server Issues

### Server Won't Start

**Symptoms:**
- Error message when trying to start the server
- Command exits immediately with an error code
- "Address already in use" errors

**Possible Causes and Solutions:**

1. **Port 5000 already in use**
   - Check if another process is using port 5000:
     ```bash
     lsof -i :5000
     ```
   - If found, terminate that process or use a different port:
     ```bash
     # In server.js, change the port
     const PORT = process.env.PORT || 3000;
     ```

2. **Missing dependencies**
   - Ensure all required packages are installed:
     ```bash
     npm install
     ```

3. **File permission issues**
   - Ensure you have execute permissions on the server file:
     ```bash
     chmod +x docs-system/server.js
     ```

4. **Syntax errors in server code**
   - Check for syntax errors in recent changes
   - Run Node.js with the `--check` flag to validate syntax:
     ```bash
     node --check docs-system/server.js
     ```

### EISDIR Error

**Symptoms:**
- "Server Error: EISDIR" in browser
- Server log shows EISDIR error when accessing certain pages

**Possible Causes and Solutions:**

1. **Trying to serve a directory as a file**
   - This should be fixed in the latest code, but if it occurs:
     - Check that the server.js file includes the directory handling code
     - Ensure you're using the latest version of server.js
     - Restart the server after making any changes

2. **Missing index.html in a directory**
   - Create an index.html file in the directory being accessed
   - Or modify the directory handler to serve a better directory listing

### 404 Not Found Errors

**Symptoms:**
- "File not found" messages
- Pages that should exist return 404 errors

**Possible Causes and Solutions:**

1. **Incorrect file paths**
   - Check relative vs. absolute paths in links
   - Ensure filenames have correct case (the system is case-sensitive)
   - Verify the file actually exists in the specified location

2. **Server not finding files in correct location**
   - The server looks for files relative to the docs-system directory
   - Make sure paths start from docs-system as the root

3. **Incorrect route configuration**
   - Check for typos in URL paths
   - Verify the route is correctly defined in server.js

## API Issues

### API Returns Error Responses

**Symptoms:**
- API calls return error status codes (400, 404, 500)
- Error messages in API responses
- UI shows error notifications when performing actions

**Possible Causes and Solutions:**

1. **Invalid request parameters**
   - Check the request format matches what the API expects
   - Ensure required parameters are included
   - Verify parameter types (strings, numbers, objects)

2. **Server-side errors**
   - Check server logs for error details
   - Look for exceptions in the API handler code
   - Verify the API endpoint exists and is correctly implemented

3. **File system permission issues**
   - Ensure the server has read/write permissions for required files
   - Check ownership of files being accessed

### API Not Responding

**Symptoms:**
- API requests time out
- No response from server for specific requests
- Server appears to hang

**Possible Causes and Solutions:**

1. **Infinite loops or blocking operations**
   - Check for synchronous blocking code in API handlers
   - Look for infinite loops in recent changes
   - Ensure promises are properly resolved or rejected

2. **Server overload**
   - Check if the server is handling too many requests
   - Look for memory leaks or high CPU usage
   - Consider implementing rate limiting for high-volume endpoints

## Task Manager Issues

### Task Manager Not Loading Tasks

**Symptoms:**
- Task list is empty
- "No current task" message when tasks should be available
- Console errors when accessing task data

**Possible Causes and Solutions:**

1. **Task configuration issues**
   - Check if documentation_tasks.js has valid task definitions
   - Verify task dependencies are correctly configured
   - Ensure required files for tasks exist

2. **API connectivity problems**
   - Check browser console for network errors
   - Verify API endpoints for tasks are responding correctly
   - Check for CORS issues if accessing from a different origin

3. **JavaScript errors**
   - Look for console errors in the browser
   - Check for syntax errors in task_manager.html scripts
   - Verify all required functions are defined

### Task Completion Not Working

**Symptoms:**
- Tasks can't be marked as complete
- Completion status not saving
- Progress not updating

**Possible Causes and Solutions:**

1. **Validation failures**
   - Check if all required placeholders are filled
   - Verify all required files exist
   - Look for validation errors in the console

2. **API errors**
   - Check network requests when completing tasks
   - Verify the completion API endpoint is working
   - Look for server-side errors in logs

3. **Storage issues**
   - Check if task progress is being saved correctly
   - Verify the file system has write permissions
   - Look for corrupted data files

## File and Template Issues

### Placeholders Not Being Detected

**Symptoms:**
- Placeholders showing as unfilled when they should be detected
- Variables not being substituted in templates
- Inconsistent placeholder detection

**Possible Causes and Solutions:**

1. **Format issues**
   - Ensure placeholders use the correct format: {{PLACEHOLDER_NAME}}
   - Check for spaces or special characters in placeholder names
   - Verify case sensitivity in placeholder names

2. **Placeholder detection regex issues**
   - Check the placeholder detection regex in placeholder_util.js
   - Ensure it handles all valid placeholder formats
   - Test with problematic placeholders to isolate issues

3. **File encoding problems**
   - Ensure files are saved with UTF-8 encoding
   - Check for invisible characters or BOM markers
   - Try re-saving problematic files with a standard text editor

### Templates Not Loading

**Symptoms:**
- Template files not found
- Empty or corrupted templates
- Templates missing expected placeholders

**Possible Causes and Solutions:**

1. **File path issues**
   - Verify templates are in the correct location
   - Check for case sensitivity in template file paths
   - Ensure template directory exists and is accessible

2. **Permission issues**
   - Check read permissions for template files
   - Verify server can access template directory

3. **Template format problems**
   - Ensure templates follow the expected format
   - Check for malformed Markdown or HTML in templates
   - Validate placeholder syntax in templates

## Documentation Manager Issues

### Variable Substitution Not Working

**Symptoms:**
- Variables not being replaced in documents
- Placeholders remaining after substitution
- Inconsistent substitution behavior

**Possible Causes and Solutions:**

1. **Variable definition issues**
   - Check if variables are correctly defined in variables.json
   - Verify variable names match placeholder names exactly
   - Ensure variables have non-empty values

2. **Substitution logic issues**
   - Check the substitution code in placeholder_util.js
   - Verify it correctly handles all placeholder formats
   - Test with specific problematic variables

3. **Process ordering issues**
   - Ensure variables are loaded before substitution occurs
   - Check if substitution is running at the right time
   - Verify substitution is applied to the correct files

## UI Issues

### UI Not Responsive or Styles Missing

**Symptoms:**
- UI elements misaligned or unstyled
- Functionality works but appearance is broken
- Buttons or controls not working correctly

**Possible Causes and Solutions:**

1. **CSS loading issues**
   - Check if CSS is being properly loaded
   - Verify style links in HTML files
   - Look for 404 errors on CSS resources

2. **JavaScript errors affecting UI**
   - Check browser console for JavaScript errors
   - Verify all required scripts are loaded
   - Look for DOM manipulation errors

3. **Browser compatibility issues**
   - Test in different browsers
   - Check for unsupported CSS or JavaScript features
   - Add polyfills or fallbacks if needed

## General Troubleshooting Steps

### Step 1: Check Logs
- Server logs in the terminal running the server
- Browser console logs (F12 in most browsers)
- Network request logs in browser developer tools

### Step 2: Isolate the Problem
- Determine if it's server-side or client-side
- Check if it affects all features or just one
- Try to reproduce the issue consistently

### Step 3: Review Recent Changes
- Look at recently modified files
- Check for unintended side effects of changes
- Consider reverting recent changes to test

### Step 4: Check Configuration
- Verify environment variables
- Check server and API configurations
- Ensure file paths and URLs are correct

### Step 5: Test in a Clean Environment
- Try in a different browser
- Clear cache and reload
- Restart the server completely

## When All Else Fails

If you've tried all relevant troubleshooting steps and still can't resolve the issue:

1. Document the problem completely:
   - Exact steps to reproduce
   - Expected vs. actual behavior
   - All relevant error messages
   - Screenshots if applicable
   - Logs from both client and server

2. Check the GitHub repository for similar issues or ask for help

3. Create a minimal reproducible example if possible

---

*This troubleshooting guide should be updated whenever new issues and solutions are discovered.*