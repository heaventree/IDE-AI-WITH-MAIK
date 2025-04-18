# Technical Implementation Guide

## Purpose

This guide provides concrete implementation guidance for developers working on the Documentation System. It includes coding patterns, architectural principles, and specific implementation examples to maintain consistency and quality across the codebase.

## Architecture Principles

### Clean Architecture

The Documentation System follows clean architecture principles:

1. **Independence of Frameworks**: Core business logic is independent of UI and external libraries
2. **Testability**: Business rules can be tested without UI, database, or external services
3. **Independence of UI**: UI can change without changing the business rules
4. **Independence of Database**: Business rules are not bound to any specific database
5. **Independence of External Agencies**: Business rules don't know anything about the outside world

### Implementation Pattern

When implementing new features, follow this pattern:

1. Define the feature requirements and API contract first
2. Implement core business logic in the agent directory
3. Create the API endpoint in server.js
4. Implement the UI component in task_manager.html or a new HTML file
5. Connect the UI to the API
6. Test the entire flow

## Environment Setup

### Replit Environment

The project runs in a Replit environment with Node.js. No specific setup is required beyond ensuring the server is running:

```bash
# Start the server
node docs-system/server.js
```

The server will run on port 5000 and be accessible at http://0.0.0.0:5000/.

## Common Implementation Patterns

### Adding a New API Endpoint

```javascript
// In server.js
// Add your endpoint in the handleApiRequest function

// GET /api/your-feature - Description of your endpoint
if (pathname === '/api/your-feature' && req.method === 'GET') {
    const query = parsedUrl.query;
    const param = query.param || 'default';
    
    const result = docManager.yourFeatureFunction(param);
    res.statusCode = 200;
    res.end(JSON.stringify(result));
    return;
}

// POST /api/your-feature - Description of your endpoint
if (pathname === '/api/your-feature' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    
    req.on('end', () => {
        try {
            const data = JSON.parse(body);
            const result = docManager.yourFeatureFunction(data);
            res.statusCode = 200;
            res.end(JSON.stringify(result));
        } catch (error) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Invalid request data' }));
        }
    });
    return;
}
```

### Adding a New Feature to Documentation Manager

```javascript
// In documentation_manager.js

/**
 * Description of your feature function
 * @param {type} param - Description of parameter
 * @returns {Object} Result object with success indicator and data
 */
function yourFeatureFunction(param) {
    // Validate input
    if (!param) {
        return { success: false, error: 'Parameter is required' };
    }
    
    try {
        // Implement your feature logic
        const result = doSomethingWith(param);
        
        // Return success response
        return {
            success: true,
            data: result
        };
    } catch (error) {
        // Handle and return errors
        console.error('Error in yourFeatureFunction:', error);
        return {
            success: false,
            error: error.message || 'An unknown error occurred'
        };
    }
}

// Don't forget to export your function
module.exports = {
    // Existing exports...
    yourFeatureFunction
};
```

### Adding a New UI Component

```html
<!-- In task_manager.html or your feature's HTML file -->

<!-- Add a new tab button -->
<button class="tab-button" data-tab="your-feature">Your Feature</button>

<!-- Add the tab content -->
<div class="tab-content" id="your-feature">
    <div class="card">
        <h2>Your Feature</h2>
        <p>Description of your feature and how to use it.</p>
        
        <!-- Your feature UI elements -->
        <div class="your-feature-container">
            <div class="input-group">
                <input type="text" id="your-feature-input" placeholder="Enter something...">
                <button class="btn" id="your-feature-btn">Submit</button>
            </div>
            
            <div id="your-feature-result">
                <!-- Results will appear here -->
            </div>
        </div>
        
        <!-- Action buttons -->
        <div class="task-actions">
            <button id="your-feature-action-btn" class="btn btn-success">Perform Action</button>
        </div>
    </div>
</div>

<!-- Add JavaScript for your feature -->
<script>
    // Initialize your feature when the document is loaded
    document.addEventListener('DOMContentLoaded', function() {
        // Get references to your elements
        const yourFeatureBtn = document.getElementById('your-feature-btn');
        const yourFeatureInput = document.getElementById('your-feature-input');
        const yourFeatureResult = document.getElementById('your-feature-result');
        const yourFeatureActionBtn = document.getElementById('your-feature-action-btn');
        
        // Add event listeners
        yourFeatureBtn.addEventListener('click', function() {
            const inputValue = yourFeatureInput.value;
            if (!inputValue) {
                showNotification('Please enter a value', 'error');
                return;
            }
            
            // Call your API
            fetch('/api/your-feature?param=' + encodeURIComponent(inputValue))
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.success) {
                        // Handle successful response
                        yourFeatureResult.innerHTML = renderYourFeatureResult(data.data);
                        showNotification('Operation completed successfully!');
                    } else {
                        // Handle error response
                        showNotification(data.error || 'An error occurred', 'error');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    showNotification('An error occurred. Please try again.', 'error');
                });
        });
        
        // Handle action button
        yourFeatureActionBtn.addEventListener('click', function() {
            // Implement your action
            showNotification('Action performed!');
        });
    });
    
    // Helper function to render your feature result
    function renderYourFeatureResult(data) {
        // Create HTML for your result
        let html = '<div class="result-item">';
        html += `<h3>${data.title || 'Result'}</h3>`;
        html += `<p>${data.description || 'No description'}</p>`;
        // Add more result details as needed
        html += '</div>';
        
        return html;
    }
</script>
```

## File System Structure

### Adding New Files

When adding new files, follow these conventions:

1. **JavaScript Files**: Place in the appropriate subdirectory of `/docs-system/agent/`
2. **HTML Files**: Place in the root `/docs-system/` directory
3. **CSS Files**: Place in `/docs-system/css/`
4. **Templates**: Place in `/docs-system/templates/`
5. **Documentation**: Place in the appropriate subdirectory of `/docs-system/`

### File Naming Conventions

- Use snake_case for file names (e.g., `file_name.js`)
- Use descriptive names that indicate the file's purpose
- Group related files in appropriately named directories
- Always use lowercase for file and directory names

## Implementation Examples

### Example 1: Adding a New Documentation Task

```javascript
// In documentation_tasks.js

// Add your new task to the documentationTasks array
const documentationTasks = [
    // Existing tasks...
    {
        id: 5, // Use the next available ID
        name: "Your New Task",
        description: "Description of what this task involves and its purpose.",
        requiredFiles: [
            "templates/your_template.md"
        ],
        requiredPlaceholders: [
            "YOUR_PLACEHOLDER_1",
            "YOUR_PLACEHOLDER_2",
            "YOUR_PLACEHOLDER_3"
        ],
        dependencies: [1, 3], // IDs of tasks that must be completed first
        completionCriteria: "Detailed description of what constitutes a complete task."
    }
];
```

### Example 2: Creating a New Template

```markdown
// In templates/your_template.md

# {{YOUR_DOCUMENT_TITLE}}

## Purpose

{{YOUR_DOCUMENT_PURPOSE}}

## Details

{{YOUR_DOCUMENT_DETAILS}}

## Implementation

```javascript
// Example code
function exampleFunction() {
    // Implementation details
}
```

## Related Documentation

- [{{YOUR_RELATED_DOC_1}}]({{YOUR_RELATED_DOC_1_PATH}})
- [{{YOUR_RELATED_DOC_2}}]({{YOUR_RELATED_DOC_2_PATH}})
```

### Example 3: Implementing File Preview (Task #1)

This is a concrete implementation for the first task in the Implementation Priorities:

```javascript
// In server.js - Add new API endpoint

// GET /api/files/preview - Get file content for preview
if (pathname === '/api/files/preview' && req.method === 'GET') {
    const query = parsedUrl.query;
    const filePath = query.path || '';
    
    if (!filePath) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: 'File path is required' }));
        return;
    }
    
    const fullPath = path.join(__dirname, filePath);
    
    // Check if file exists and is not a directory
    fs.stat(fullPath, (err, stats) => {
        if (err) {
            res.statusCode = 404;
            res.end(JSON.stringify({ error: `File not found: ${err.message}` }));
            return;
        }
        
        if (stats.isDirectory()) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Path is a directory, not a file' }));
            return;
        }
        
        // Read the file
        fs.readFile(fullPath, 'utf8', (err, content) => {
            if (err) {
                res.statusCode = 500;
                res.end(JSON.stringify({ error: `Error reading file: ${err.message}` }));
                return;
            }
            
            // Get file extension for syntax highlighting info
            const extname = path.extname(fullPath).toLowerCase().substring(1);
            
            res.statusCode = 200;
            res.end(JSON.stringify({
                success: true,
                content,
                path: filePath,
                type: extname
            }));
        });
    });
    return;
}
```

```javascript
// In documentation_manager.js - Add file listing function

/**
 * Get a list of files for the file preview feature
 * @param {string} directory - Directory to list files from
 * @param {string} extension - Optional file extension filter
 * @returns {Object} Object with success flag and files array
 */
function getFilesList(directory = '', extension = '') {
    try {
        const dirPath = path.join(__dirname, '..', directory);
        let files = [];
        
        // Function to recursively get files
        function getFilesRecursive(dir, baseDir = '') {
            const dirItems = fs.readdirSync(dir);
            
            dirItems.forEach(item => {
                const fullPath = path.join(dir, item);
                const relativePath = path.join(baseDir, item);
                const stats = fs.statSync(fullPath);
                
                if (stats.isDirectory()) {
                    // Recursively get files from subdirectories
                    getFilesRecursive(fullPath, relativePath);
                } else if (!extension || path.extname(item).toLowerCase() === extension) {
                    // Add file if it matches the extension filter or no filter is provided
                    files.push({
                        path: relativePath,
                        name: item,
                        size: stats.size,
                        modified: stats.mtime
                    });
                }
            });
        }
        
        getFilesRecursive(dirPath, directory);
        
        // Sort files by name
        files.sort((a, b) => a.path.localeCompare(b.path));
        
        return {
            success: true,
            files
        };
    } catch (error) {
        console.error('Error in getFilesList:', error);
        return {
            success: false,
            error: error.message || 'An unknown error occurred',
            files: []
        };
    }
}

// Add to module.exports
module.exports = {
    // Existing exports...
    getFilesList
};
```

```html
<!-- In task_manager.html - Add File Preview Tab -->

<!-- Add tab button -->
<button class="tab-button" data-tab="file-preview">File Preview</button>

<!-- Add tab content -->
<div class="tab-content" id="file-preview">
    <div class="card">
        <h2>File Preview</h2>
        <p>Preview the content of documentation files.</p>
        
        <div class="file-preview-container">
            <div class="file-selector">
                <h3>Select a File</h3>
                <div class="input-group">
                    <select id="file-selector" style="flex-grow: 1; padding: 0.5rem; border: 1px solid #ced4da; border-radius: 4px;">
                        <option value="">-- Select a file --</option>
                    </select>
                    <button id="refresh-files-btn" class="btn">Refresh</button>
                </div>
            </div>
            
            <div class="file-content" style="margin-top: 1.5rem;">
                <h3>File Content</h3>
                <div id="file-content-display" style="font-family: monospace; white-space: pre-wrap; background-color: #f8f9fa; padding: 1rem; border-radius: 4px; max-height: 400px; overflow-y: auto; border: 1px solid #ced4da;">
                    Select a file to preview its content.
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Add JavaScript for File Preview -->
<script>
    document.addEventListener('DOMContentLoaded', function() {
        // Get references to elements
        const fileSelector = document.getElementById('file-selector');
        const refreshFilesBtn = document.getElementById('refresh-files-btn');
        const fileContentDisplay = document.getElementById('file-content-display');
        
        // Load the file list
        function loadFilesList() {
            fetch('/api/files/list')
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
                    }
                    return response.json();
                })
                .then(data => {
                    if (!data.success) {
                        showNotification('Error loading files: ' + (data.error || 'Unknown error'), 'error');
                        return;
                    }
                    
                    // Clear existing options
                    fileSelector.innerHTML = '<option value="">-- Select a file --</option>';
                    
                    // Add options for each file
                    if (data.files && data.files.length > 0) {
                        data.files.forEach(file => {
                            const option = document.createElement('option');
                            option.value = file.path;
                            option.textContent = file.path;
                            fileSelector.appendChild(option);
                        });
                    } else {
                        fileSelector.innerHTML += '<option disabled>No files found</option>';
                    }
                })
                .catch(error => {
                    console.error('Error loading files:', error);
                    showNotification('Error loading files. Please try refreshing.', 'error');
                });
        }
        
        // Load a specific file
        function loadFileContent(filePath) {
            if (!filePath) {
                fileContentDisplay.textContent = 'Select a file to preview its content.';
                return;
            }
            
            fetch(`/api/files/preview?path=${encodeURIComponent(filePath)}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
                    }
                    return response.json();
                })
                .then(data => {
                    if (!data.success) {
                        showNotification('Error loading file: ' + (data.error || 'Unknown error'), 'error');
                        fileContentDisplay.textContent = 'Error loading file content.';
                        return;
                    }
                    
                    // Display the file content
                    fileContentDisplay.textContent = data.content;
                    
                    // Highlight syntax if available (requires a syntax highlighting library)
                    if (window.hljs && data.type) {
                        hljs.highlightBlock(fileContentDisplay);
                    }
                })
                .catch(error => {
                    console.error('Error loading file content:', error);
                    fileContentDisplay.textContent = 'Error loading file content. Please try again.';
                    showNotification('Error loading file content.', 'error');
                });
        }
        
        // Add event listeners
        refreshFilesBtn.addEventListener('click', loadFilesList);
        
        fileSelector.addEventListener('change', function() {
            loadFileContent(this.value);
        });
        
        // Load files when tab is shown
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', function() {
                if (this.getAttribute('data-tab') === 'file-preview') {
                    loadFilesList();
                }
            });
        });
        
        // Initialize if starting on this tab
        if (document.querySelector('.tab-button[data-tab="file-preview"]').classList.contains('active')) {
            loadFilesList();
        }
    });
</script>
```

## Testing & Debugging

### Manual Testing Process

For each new feature:

1. Test all positive cases with valid input
2. Test edge cases and boundary conditions
3. Test error cases with invalid input
4. Test integration with existing features
5. Test UI responsiveness and usability

### Debugging Tips

- Use `console.log` for debugging server-side code
- Check the browser console for client-side errors
- Verify network requests in the browser developer tools
- Test API endpoints directly using curl or Postman
- For server errors, check server console output

## Documentation Standards

### Code Documentation

- Use JSDoc comments for all functions
- Document parameters, return values, and exceptions
- Include examples for complex functions
- Keep comments up-to-date with code changes

### User Documentation

- Write in clear, concise language
- Include step-by-step instructions
- Provide screenshots for complex UI workflows
- Structure with clear headings and sections
- Include troubleshooting guidance

## Performance Considerations

- Minimize file I/O operations
- Use asynchronous APIs for file operations
- Keep DOM manipulation efficient
- Implement pagination for large data sets
- Consider caching frequently accessed data

---

*This Technical Implementation Guide should be updated whenever new implementation patterns or best practices are established.*