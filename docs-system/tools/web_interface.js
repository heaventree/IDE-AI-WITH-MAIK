/**
 * Documentation Web Interface
 * 
 * This script provides a simple web server for interacting with the documentation system.
 * It includes a web interface for managing variables, placeholders, and documentation tasks.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const documentationManager = require('./documentation_manager');

// Configuration
const PORT = process.env.PORT || 5000;
const DOCS_ROOT = path.join(__dirname, '..');

// Initialize the documentation manager
documentationManager.initialize();

// Define MIME types for different file extensions
const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.md': 'text/markdown',
    '.pdf': 'application/pdf'
};

// Create the HTTP server
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    let pathname = parsedUrl.pathname;
    
    // Normalize pathname
    pathname = pathname === '/' ? '/web_interface/index.html' : pathname;
    
    // API Routes
    if (pathname.startsWith('/api/')) {
        handleApiRequest(req, res, pathname, parsedUrl);
        return;
    }
    
    // Serve static files
    if (pathname.startsWith('/web_interface/')) {
        serveStaticFile(res, pathname);
        return;
    }
    
    // Redirect to web interface
    res.writeHead(302, { 'Location': '/web_interface/index.html' });
    res.end();
});

// Handle API requests
function handleApiRequest(req, res, pathname, parsedUrl) {
    res.setHeader('Content-Type', 'application/json');
    
    // GET /api/variables - Get all project variables
    if (pathname === '/api/variables' && req.method === 'GET') {
        res.statusCode = 200;
        res.end(JSON.stringify({
            success: true,
            variables: documentationManager.projectVariables
        }));
        return;
    }
    
    // POST /api/variables - Update project variables
    if (pathname === '/api/variables' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            try {
                const newVariables = JSON.parse(body);
                const result = documentationManager.updateProjectVariables(newVariables);
                res.statusCode = 200;
                res.end(JSON.stringify(result));
            } catch (error) {
                res.statusCode = 400;
                res.end(JSON.stringify({ success: false, error: 'Invalid request data' }));
            }
        });
        return;
    }
    
    // GET /api/placeholders - Get list of unfilled placeholders
    if (pathname === '/api/placeholders' && req.method === 'GET') {
        const query = parsedUrl.query;
        const dirPath = query.dirPath || '';
        const fileExtension = query.fileExtension || '.md';
        
        const unfilledPlaceholders = documentationManager.getUnfilledPlaceholders(dirPath, fileExtension);
        res.statusCode = 200;
        res.end(JSON.stringify({
            success: true,
            ...unfilledPlaceholders
        }));
        return;
    }
    
    // POST /api/apply - Apply variables to a file or directory
    if (pathname === '/api/apply' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            try {
                const { path, isDirectory, fileExtension } = JSON.parse(body);
                let result;
                
                if (isDirectory) {
                    result = documentationManager.applyVariablesToDirectory(path, fileExtension || '.md');
                } else {
                    result = documentationManager.applyVariablesToFile(path);
                }
                
                res.statusCode = 200;
                res.end(JSON.stringify(result));
            } catch (error) {
                res.statusCode = 400;
                res.end(JSON.stringify({ success: false, error: 'Invalid request data' }));
            }
        });
        return;
    }
    
    // GET /api/progress - Get documentation completion status
    if (pathname === '/api/progress' && req.method === 'GET') {
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
        
        res.statusCode = 200;
        res.end(JSON.stringify({
            success: true,
            progress,
            completionMessage,
            isComplete: overallCompletion === 100
        }));
        return;
    }
    
    // GET /api/refresh - Refresh documentation status
    if (pathname === '/api/refresh' && req.method === 'GET') {
        documentationManager.scanForPlaceholders();
        res.statusCode = 200;
        res.end(JSON.stringify({
            success: true,
            message: 'Documentation status refreshed',
            progress: documentationManager.getDocumentationProgress()
        }));
        return;
    }
    
    // Route not found
    res.statusCode = 404;
    res.end(JSON.stringify({ success: false, error: 'Not found' }));
}

// Serve static files
function serveStaticFile(res, pathname) {
    const filePath = path.join(DOCS_ROOT, pathname);
    
    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // File not found
                res.writeHead(404);
                res.end('File not found');
            } else {
                // Server error
                res.writeHead(500);
                res.end(`Server Error: ${err.code}`);
            }
            return;
        }
        
        // Determine the content type
        const extname = path.extname(filePath);
        const contentType = mimeTypes[extname] || 'application/octet-stream';
        
        // Serve the file
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
    });
}

// Create web interface directory and files if they don't exist
const webInterfaceDir = path.join(DOCS_ROOT, 'web_interface');
if (!fs.existsSync(webInterfaceDir)) {
    fs.mkdirSync(webInterfaceDir, { recursive: true });
    
    // Create index.html
    fs.writeFileSync(path.join(webInterfaceDir, 'index.html'), `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Documentation System</title>
    <link rel="stylesheet" href="/web_interface/styles.css">
</head>
<body>
    <header>
        <h1>Documentation System</h1>
        <div class="progress-container">
            <div class="progress-label">Documentation Progress:</div>
            <div class="progress-bar">
                <div class="progress-fill" id="progressFill"></div>
            </div>
            <div class="progress-percentage" id="progressPercentage">0%</div>
        </div>
    </header>
    
    <nav>
        <ul>
            <li><a href="#variables" class="active">Variables</a></li>
            <li><a href="#placeholders">Placeholders</a></li>
            <li><a href="#apply">Apply Variables</a></li>
            <li><a href="#help">Help</a></li>
        </ul>
    </nav>
    
    <main>
        <section id="variables-section" class="active">
            <h2>Variables Management</h2>
            <p>Manage the variables used throughout the documentation.</p>
            
            <div class="card">
                <h3>Project Variables</h3>
                <div class="variables-container" id="variablesContainer">
                    <div class="loading">Loading variables...</div>
                </div>
                <div class="actions">
                    <button id="saveVariables" class="primary">Save Changes</button>
                    <button id="exportVariables">Export Variables</button>
                    <button id="importVariables">Import Variables</button>
                    <input type="file" id="importFile" style="display: none" accept=".json">
                </div>
            </div>
        </section>
        
        <section id="placeholders-section">
            <h2>Placeholder Management</h2>
            <p>View and manage unfilled placeholders in the documentation.</p>
            
            <div class="card">
                <h3>Unfilled Placeholders</h3>
                <div class="filter-container">
                    <label>
                        Directory:
                        <input type="text" id="directoryFilter" placeholder="Leave empty for all">
                    </label>
                    <button id="applyFilter" class="secondary">Apply Filter</button>
                    <button id="refreshPlaceholders" class="secondary">Refresh</button>
                </div>
                <div class="placeholders-container" id="placeholdersContainer">
                    <div class="loading">Loading placeholders...</div>
                </div>
            </div>
        </section>
        
        <section id="apply-section">
            <h2>Apply Variables</h2>
            <p>Apply variables to specific files or directories.</p>
            
            <div class="card">
                <h3>Apply to Directory or File</h3>
                <form id="applyForm">
                    <div class="form-group">
                        <label for="applyPath">Path:</label>
                        <input type="text" id="applyPath" required placeholder="e.g., templates/architecture">
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="isDirectory" checked>
                            This is a directory
                        </label>
                    </div>
                    <div class="form-group" id="fileExtensionGroup">
                        <label for="fileExtension">File Extension:</label>
                        <input type="text" id="fileExtension" value=".md" placeholder="e.g., .md">
                    </div>
                    <div class="actions">
                        <button type="submit" class="primary">Apply Variables</button>
                    </div>
                </form>
                <div id="applyResult" class="apply-result"></div>
            </div>
        </section>
        
        <section id="help-section">
            <h2>Help & Documentation</h2>
            <p>Learn how to use the documentation system effectively.</p>
            
            <div class="card">
                <h3>Quick Guide</h3>
                <p>This Documentation System helps you maintain and generate project documentation with variable substitution.</p>
                
                <h4>Variables</h4>
                <p>Variables are stored in a structured format and can be referenced in documentation files using the format <code>{{VARIABLE_NAME}}</code>.</p>
                
                <h4>Placeholders</h4>
                <p>The system tracks unfilled placeholders in your documentation, helping you identify areas that need attention.</p>
                
                <h4>Applying Variables</h4>
                <p>You can apply variables to specific files or entire directories, replacing placeholders with their values.</p>
                
                <h4>Command Line Interface</h4>
                <p>For advanced usage, you can use the CLI tool:</p>
                <pre><code>node doc_cli.js help</code></pre>
            </div>
        </section>
    </main>
    
    <footer>
        <p>Documentation System &copy; 2025</p>
    </footer>
    
    <script src="/web_interface/script.js"></script>
</body>
</html>
    `);
    
    // Create styles.css
    fs.writeFileSync(path.join(webInterfaceDir, 'styles.css'), `
:root {
    --primary-color: #3B82F6;
    --primary-dark: #1E40AF;
    --primary-light: #93C5FD;
    --success-color: #22C55E;
    --warning-color: #F59E0B;
    --error-color: #EF4444;
    --neutral-100: #F3F4F6;
    --neutral-200: #E5E7EB;
    --neutral-300: #D1D5DB;
    --neutral-700: #374151;
    --neutral-900: #111827;
    --radius: 4px;
}

* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    line-height: 1.6;
    color: var(--neutral-900);
    background-color: var(--neutral-100);
}

header {
    background-color: var(--primary-color);
    color: white;
    padding: 1rem 2rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

header h1 {
    margin-bottom: 0.5rem;
}

.progress-container {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.5rem;
}

.progress-label {
    font-weight: 500;
}

.progress-bar {
    flex-grow: 1;
    height: 12px;
    background-color: rgba(255, 255, 255, 0.3);
    border-radius: var(--radius);
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background-color: white;
    width: 0%;
    transition: width 0.5s ease;
}

.progress-percentage {
    font-weight: 500;
    min-width: 40px;
}

nav {
    background-color: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

nav ul {
    display: flex;
    list-style: none;
    padding: 0 2rem;
}

nav ul li {
    margin-right: 1rem;
}

nav ul li a {
    display: block;
    padding: 1rem 0;
    color: var(--neutral-700);
    text-decoration: none;
    font-weight: 500;
    border-bottom: 2px solid transparent;
    transition: all 0.2s ease;
}

nav ul li a:hover, nav ul li a.active {
    color: var(--primary-color);
    border-bottom-color: var(--primary-color);
}

main {
    max-width: 1200px;
    margin: 2rem auto;
    padding: 0 2rem;
}

section {
    display: none;
    margin-bottom: 2rem;
}

section.active {
    display: block;
}

h2 {
    margin-bottom: 1rem;
    color: var(--neutral-900);
}

p {
    margin-bottom: 1rem;
    color: var(--neutral-700);
}

.card {
    background-color: white;
    border-radius: var(--radius);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    padding: 1.5rem;
    margin-bottom: 1.5rem;
}

.card h3 {
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--neutral-200);
}

.loading {
    padding: 2rem 0;
    text-align: center;
    color: var(--neutral-700);
}

.actions {
    display: flex;
    gap: 0.5rem;
    margin-top: 1rem;
    justify-content: flex-end;
}

button {
    padding: 0.5rem 1rem;
    border-radius: var(--radius);
    font-weight: 500;
    cursor: pointer;
    border: 1px solid transparent;
    background-color: white;
    transition: all 0.2s ease;
}

button.primary {
    background-color: var(--primary-color);
    color: white;
}

button.primary:hover {
    background-color: var(--primary-dark);
}

button.secondary {
    border-color: var(--neutral-300);
}

button.secondary:hover {
    background-color: var(--neutral-100);
}

.variables-container {
    max-height: 500px;
    overflow-y: auto;
    margin-bottom: 1rem;
    border: 1px solid var(--neutral-200);
    border-radius: var(--radius);
}

.variable-group {
    margin-bottom: 1rem;
    padding: 1rem;
    border-bottom: 1px solid var(--neutral-200);
}

.variable-group:last-child {
    border-bottom: none;
}

.variable-group h4 {
    margin-bottom: 0.5rem;
    color: var(--primary-dark);
}

.variable-row {
    display: flex;
    margin-bottom: 0.5rem;
    gap: 1rem;
    align-items: center;
}

.variable-name {
    flex: 1;
    font-weight: 500;
}

.variable-value {
    flex: 2;
}

.variable-value input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid var(--neutral-300);
    border-radius: var(--radius);
}

.placeholders-container {
    max-height: 500px;
    overflow-y: auto;
    margin-bottom: 1rem;
    border: 1px solid var(--neutral-200);
    border-radius: var(--radius);
}

.placeholder-item {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--neutral-200);
    display: flex;
    align-items: center;
    gap: 1rem;
}

.placeholder-item:last-child {
    border-bottom: none;
}

.placeholder-name {
    font-family: monospace;
    padding: 0.2rem 0.5rem;
    background-color: var(--neutral-100);
    border-radius: var(--radius);
}

.placeholder-file {
    flex: 1;
    color: var(--neutral-700);
    font-size: 0.9rem;
}

.placeholder-line {
    color: var(--neutral-700);
    font-size: 0.9rem;
}

.placeholder-actions {
    display: flex;
    gap: 0.5rem;
}

.filter-container {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
    align-items: center;
}

.filter-container label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.filter-container input {
    padding: 0.5rem;
    border: 1px solid var(--neutral-300);
    border-radius: var(--radius);
    width: 300px;
}

.form-group {
    margin-bottom: 1rem;
}

.form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
}

.form-group input[type="text"] {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid var(--neutral-300);
    border-radius: var(--radius);
}

.apply-result {
    margin-top: 1rem;
    padding: 1rem;
    border-radius: var(--radius);
    display: none;
}

.apply-result.success {
    display: block;
    background-color: rgba(34, 197, 94, 0.1);
    border: 1px solid var(--success-color);
    color: var(--success-color);
}

.apply-result.error {
    display: block;
    background-color: rgba(239, 68, 68, 0.1);
    border: 1px solid var(--error-color);
    color: var(--error-color);
}

pre {
    background-color: var(--neutral-900);
    color: white;
    padding: 1rem;
    border-radius: var(--radius);
    overflow-x: auto;
    margin: 1rem 0;
}

code {
    font-family: monospace;
    background-color: var(--neutral-100);
    padding: 0.2rem 0.4rem;
    border-radius: var(--radius);
    font-size: 0.9em;
}

pre code {
    background-color: transparent;
    padding: 0;
    border-radius: 0;
}

footer {
    background-color: var(--neutral-900);
    color: white;
    text-align: center;
    padding: 1.5rem;
    margin-top: 3rem;
}

/* Responsive */
@media (max-width: 768px) {
    header, nav ul, main {
        padding-left: 1rem;
        padding-right: 1rem;
    }
    
    .filter-container {
        flex-direction: column;
        align-items: flex-start;
    }
    
    .filter-container input {
        width: 100%;
    }
    
    .variable-row {
        flex-direction: column;
        align-items: flex-start;
    }
    
    .variable-name, .variable-value {
        width: 100%;
    }
}
    `);
    
    // Create script.js
    fs.writeFileSync(path.join(webInterfaceDir, 'script.js'), `
document.addEventListener('DOMContentLoaded', function() {
    // Navigation
    const navLinks = document.querySelectorAll('nav a');
    const sections = document.querySelectorAll('main section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const target = this.getAttribute('href').substring(1);
            
            // Update active nav link
            navLinks.forEach(link => link.classList.remove('active'));
            this.classList.add('active');
            
            // Show target section
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === target + '-section') {
                    section.classList.add('active');
                }
            });
        });
    });
    
    // Load progress
    loadProgress();
    
    // Load variables
    loadVariables();
    
    // Load placeholders
    loadPlaceholders();
    
    // Save variables
    document.getElementById('saveVariables').addEventListener('click', saveVariables);
    
    // Export variables
    document.getElementById('exportVariables').addEventListener('click', exportVariables);
    
    // Import variables
    document.getElementById('importVariables').addEventListener('click', function() {
        document.getElementById('importFile').click();
    });
    
    document.getElementById('importFile').addEventListener('change', importVariables);
    
    // Apply filter for placeholders
    document.getElementById('applyFilter').addEventListener('click', function() {
        const directory = document.getElementById('directoryFilter').value;
        loadPlaceholders(directory);
    });
    
    // Refresh placeholders
    document.getElementById('refreshPlaceholders').addEventListener('click', function() {
        const directory = document.getElementById('directoryFilter').value;
        refreshDocumentation().then(() => loadPlaceholders(directory));
    });
    
    // Apply variables form
    document.getElementById('applyForm').addEventListener('submit', function(e) {
        e.preventDefault();
        applyVariables();
    });
    
    // Toggle file extension field based on isDirectory checkbox
    document.getElementById('isDirectory').addEventListener('change', function() {
        document.getElementById('fileExtensionGroup').style.display = this.checked ? 'block' : 'none';
    });
});

// Load progress
function loadProgress() {
    fetch('/api/progress')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updateProgressBar(data.progress.overallProgress);
            }
        })
        .catch(error => console.error('Error loading progress:', error));
}

// Update progress bar
function updateProgressBar(percentage) {
    const progressFill = document.getElementById('progressFill');
    const progressPercentage = document.getElementById('progressPercentage');
    
    progressFill.style.width = percentage + '%';
    progressPercentage.textContent = percentage + '%';
}

// Load variables
function loadVariables() {
    const container = document.getElementById('variablesContainer');
    container.innerHTML = '<div class="loading">Loading variables...</div>';
    
    fetch('/api/variables')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                renderVariables(data.variables);
            } else {
                container.innerHTML = '<div class="error">Error loading variables: ' + data.error + '</div>';
            }
        })
        .catch(error => {
            container.innerHTML = '<div class="error">Error loading variables: ' + error.message + '</div>';
        });
}

// Render variables
function renderVariables(variables) {
    const container = document.getElementById('variablesContainer');
    container.innerHTML = '';
    
    Object.entries(variables).forEach(([category, categoryVars]) => {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'variable-group';
        
        const categoryTitle = document.createElement('h4');
        categoryTitle.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        categoryDiv.appendChild(categoryTitle);
        
        Object.entries(categoryVars).forEach(([name, value]) => {
            const row = document.createElement('div');
            row.className = 'variable-row';
            
            const nameDiv = document.createElement('div');
            nameDiv.className = 'variable-name';
            nameDiv.textContent = name;
            
            const valueDiv = document.createElement('div');
            valueDiv.className = 'variable-value';
            
            const input = document.createElement('input');
            input.type = 'text';
            input.value = value;
            input.dataset.category = category;
            input.dataset.name = name;
            
            valueDiv.appendChild(input);
            row.appendChild(nameDiv);
            row.appendChild(valueDiv);
            categoryDiv.appendChild(row);
        });
        
        container.appendChild(categoryDiv);
    });
}

// Save variables
function saveVariables() {
    const inputs = document.querySelectorAll('.variable-value input');
    const newVariables = {};
    
    inputs.forEach(input => {
        const category = input.dataset.category;
        const name = input.dataset.name;
        const value = input.value;
        
        if (!newVariables[category]) {
            newVariables[category] = {};
        }
        
        newVariables[category][name] = value;
    });
    
    fetch('/api/variables', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newVariables)
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Variables saved successfully!');
                updateProgressBar(data.placeholderProgress.percentComplete);
            } else {
                alert('Error saving variables: ' + data.error);
            }
        })
        .catch(error => {
            alert('Error saving variables: ' + error.message);
        });
}

// Export variables
function exportVariables() {
    fetch('/api/variables')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const blob = new Blob([JSON.stringify(data.variables, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                
                const a = document.createElement('a');
                a.href = url;
                a.download = 'variables_export.json';
                a.click();
                
                URL.revokeObjectURL(url);
            } else {
                alert('Error exporting variables: ' + data.error);
            }
        })
        .catch(error => {
            alert('Error exporting variables: ' + error.message);
        });
}

// Import variables
function importVariables(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const variables = JSON.parse(e.target.result);
            
            fetch('/api/variables', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(variables)
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert('Variables imported successfully!');
                        loadVariables();
                        updateProgressBar(data.placeholderProgress.percentComplete);
                    } else {
                        alert('Error importing variables: ' + data.error);
                    }
                })
                .catch(error => {
                    alert('Error importing variables: ' + error.message);
                });
        } catch (error) {
            alert('Error parsing JSON: ' + error.message);
        }
    };
    reader.readAsText(file);
    
    // Reset the file input
    e.target.value = '';
}

// Load placeholders
function loadPlaceholders(directory = '') {
    const container = document.getElementById('placeholdersContainer');
    container.innerHTML = '<div class="loading">Loading placeholders...</div>';
    
    fetch('/api/placeholders' + (directory ? '?dirPath=' + encodeURIComponent(directory) : ''))
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                renderPlaceholders(data);
            } else {
                container.innerHTML = '<div class="error">Error loading placeholders: ' + data.error + '</div>';
            }
        })
        .catch(error => {
            container.innerHTML = '<div class="error">Error loading placeholders: ' + error.message + '</div>';
        });
}

// Render placeholders
function renderPlaceholders(data) {
    const container = document.getElementById('placeholdersContainer');
    container.innerHTML = '';
    
    if (data.unfilled.length === 0) {
        container.innerHTML = '<div style="padding: 1rem; text-align: center;">No unfilled placeholders found.</div>';
        return;
    }
    
    data.unfilled.forEach(item => {
        const div = document.createElement('div');
        div.className = 'placeholder-item';
        
        const name = document.createElement('div');
        name.className = 'placeholder-name';
        name.textContent = '{{' + item.placeholder + '}}';
        
        const file = document.createElement('div');
        file.className = 'placeholder-file';
        file.textContent = item.file;
        
        const line = document.createElement('div');
        line.className = 'placeholder-line';
        line.textContent = 'Line ' + item.line;
        
        div.appendChild(name);
        div.appendChild(file);
        div.appendChild(line);
        
        container.appendChild(div);
    });
}

// Apply variables
function applyVariables() {
    const path = document.getElementById('applyPath').value;
    const isDirectory = document.getElementById('isDirectory').checked;
    const fileExtension = isDirectory ? document.getElementById('fileExtension').value : '';
    
    if (!path) {
        alert('Please enter a path.');
        return;
    }
    
    const resultDiv = document.getElementById('applyResult');
    resultDiv.innerHTML = 'Applying variables...';
    resultDiv.className = '';
    
    fetch('/api/apply', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            path,
            isDirectory,
            fileExtension
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                resultDiv.className = 'apply-result success';
                
                if (isDirectory) {
                    resultDiv.innerHTML = \`
                        <strong>Success!</strong>
                        <p>Applied variables to \${data.processedFiles} files.</p>
                        <p>Files with replacements: \${data.filesWithReplacements}</p>
                        <p>Total replacements: \${data.totalReplacements}</p>
                    \`;
                    
                    if (data.errors && data.errors.length > 0) {
                        resultDiv.innerHTML += '<p><strong>Errors:</strong></p><ul>';
                        data.errors.forEach(error => {
                            resultDiv.innerHTML += \`<li>\${error.file || error.directory}: \${error.error}</li>\`;
                        });
                        resultDiv.innerHTML += '</ul>';
                    }
                } else {
                    resultDiv.innerHTML = \`
                        <strong>Success!</strong>
                        <p>Applied variables to \${path}.</p>
                        <p>Replacements: \${data.replacements}</p>
                    \`;
                    
                    if (data.remainingPlaceholders && data.remainingPlaceholders.length > 0) {
                        resultDiv.innerHTML += '<p><strong>Remaining placeholders:</strong></p><ul>';
                        data.remainingPlaceholders.forEach(placeholder => {
                            resultDiv.innerHTML += \`<li>\${placeholder}</li>\`;
                        });
                        resultDiv.innerHTML += '</ul>';
                    }
                }
                
                // Refresh progress
                loadProgress();
            } else {
                resultDiv.className = 'apply-result error';
                resultDiv.innerHTML = '<strong>Error:</strong> ' + data.error;
            }
        })
        .catch(error => {
            resultDiv.className = 'apply-result error';
            resultDiv.innerHTML = '<strong>Error:</strong> ' + error.message;
        });
}

// Refresh documentation
function refreshDocumentation() {
    return fetch('/api/refresh')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updateProgressBar(data.progress.overallProgress);
                return data;
            }
            return null;
        })
        .catch(error => {
            console.error('Error refreshing documentation:', error);
            return null;
        });
}
    `);
    
    console.log(`Web interface files created in ${webInterfaceDir}`);
}

// Start the server
server.listen(PORT, () => {
    console.log(`Documentation web interface running at http://localhost:${PORT}`);
});