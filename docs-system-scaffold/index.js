/**
 * Documentation System Entry Point
 * 
 * Bootstraps and starts the application.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const docManager = require('./agent/documentation_manager');

// Initialize the documentation manager
docManager.initialize();

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
    pathname = pathname === '/' ? '/index.html' : pathname;
    
    // API Routes
    if (pathname.startsWith('/api/')) {
        handleApiRequest(req, res, pathname);
        return;
    }
    
    // Serve static files
    serveStaticFile(res, pathname);
});

// Handle API requests
function handleApiRequest(req, res, pathname) {
    res.setHeader('Content-Type', 'application/json');
    
    // GET /api/tasks - Get all tasks and their status
    if (pathname === '/api/tasks' && req.method === 'GET') {
        const progress = docManager.getDocumentationProgress();
        res.statusCode = 200;
        res.end(JSON.stringify(progress));
        return;
    }
    
    // GET /api/tasks/current - Get current task details
    if (pathname === '/api/tasks/current' && req.method === 'GET') {
        const currentTask = docManager.getCurrentTask();
        res.statusCode = 200;
        res.end(JSON.stringify(currentTask));
        return;
    }
    
    // POST /api/tasks/complete - Mark current task as complete
    if (pathname === '/api/tasks/complete' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            try {
                const completionDetails = JSON.parse(body);
                const result = docManager.completeCurrentTask(completionDetails);
                res.statusCode = 200;
                res.end(JSON.stringify(result));
            } catch (error) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Invalid request data' }));
            }
        });
        return;
    }
    
    // GET /api/placeholders - Get list of unfilled placeholders
    if (pathname === '/api/placeholders' && req.method === 'GET') {
        const query = parsedUrl.query;
        const dirPath = query.dirPath || '';
        const fileExtension = query.fileExtension || '.md';
        
        const unfilledPlaceholders = docManager.getUnfilledPlaceholders(dirPath, fileExtension);
        res.statusCode = 200;
        res.end(JSON.stringify(unfilledPlaceholders));
        return;
    }
    
    // GET /api/roles - Get all available roles
    if (pathname === '/api/roles' && req.method === 'GET') {
        const roles = docManager.getAllRoles();
        res.statusCode = 200;
        res.end(JSON.stringify(roles));
        return;
    }
    
    // GET /api/roles/current - Get current role details
    if (pathname === '/api/roles/current' && req.method === 'GET') {
        const currentRole = docManager.getCurrentRole();
        res.statusCode = 200;
        res.end(JSON.stringify(currentRole));
        return;
    }
    
    // POST /api/roles/set - Set current role
    if (pathname === '/api/roles/set' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            try {
                const { roleId } = JSON.parse(body);
                const result = docManager.setAgentRole(roleId);
                res.statusCode = result.success ? 200 : 400;
                res.end(JSON.stringify(result));
            } catch (error) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Invalid request data' }));
            }
        });
        return;
    }
    
    // GET /api/roles/focus - Get documents focused for current role
    if (pathname === '/api/roles/focus' && req.method === 'GET') {
        const focusedDocs = docManager.getRoleFocusedDocuments();
        res.statusCode = focusedDocs.success ? 200 : 400;
        res.end(JSON.stringify(focusedDocs));
        return;
    }
    
    // GET /api/roles/guidance - Get detailed guidance for current role
    if (pathname === '/api/roles/guidance' && req.method === 'GET') {
        const guidance = docManager.getRoleGuidance();
        res.statusCode = guidance.success ? 200 : 400;
        res.end(JSON.stringify(guidance));
        return;
    }
    
    // GET /api/variables - Get all project variables
    if (pathname === '/api/variables' && req.method === 'GET') {
        res.statusCode = 200;
        res.end(JSON.stringify({ variables: docManager.projectVariables }));
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
                const result = docManager.updateProjectVariables(newVariables);
                res.statusCode = 200;
                res.end(JSON.stringify(result));
            } catch (error) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Invalid request data' }));
            }
        });
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
                    result = docManager.applyVariablesToDirectory(path, fileExtension || '.md');
                } else {
                    result = docManager.applyVariablesToFile(path);
                }
                
                res.statusCode = 200;
                res.end(JSON.stringify(result));
            } catch (error) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Invalid request data' }));
            }
        });
        return;
    }
    
    // Route not found
    res.statusCode = 404;
    res.end(JSON.stringify({ error: 'Not found' }));
}

// Serve static files
function serveStaticFile(res, pathname) {
    // Determine the file path
    const filePath = path.join(__dirname, pathname);
    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';
    
    // Read and serve the file
    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                // File not found - try to serve index.html for SPA routing
                const indexPath = path.join(__dirname, 'index.html');
                fs.readFile(indexPath, (err, indexContent) => {
                    if (err) {
                        res.writeHead(404);
                        res.end('File not found');
                    } else {
                        res.writeHead(200, { 'Content-Type': 'text/html' });
                        res.end(indexContent, 'utf-8');
                    }
                });
            } else {
                // Server error
                res.writeHead(500);
                res.end(`Server Error: ${error.code}`);
            }
        } else {
            // Successful response
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
}

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Documentation System server running at http://0.0.0.0:${PORT}/`);
    console.log(`API endpoints available at http://0.0.0.0:${PORT}/api/`);
});