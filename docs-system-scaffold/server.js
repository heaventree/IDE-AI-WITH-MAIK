/**
 * Documentation System Server
 * 
 * A Node.js server that handles API requests and serves static files.
 * Includes plugin architecture for themes and extensions.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const docManager = require('./agent/documentation_manager');
const PluginLoader = require('./plugins/plugin-loader');

// Initialize the documentation manager
docManager.initialize();

// Initialize the plugin system
const pluginLoader = new PluginLoader({
    pluginsDir: path.join(__dirname, 'plugins')
});

// Global reference to the plugin loader
global.pluginSystem = pluginLoader;

// Initialize plugins
pluginLoader.initialize()
    .then(result => {
        console.log(`Plugin system initialized with ${Object.keys(result.plugins.themes).length} themes`);
        if (result.plugins.themes.length > 0) {
            console.log('Available themes:');
            result.plugins.themes.forEach(theme => {
                console.log(`- ${theme.name} (${theme.version}): ${theme.status}`);
            });
        }
    })
    .catch(error => {
        console.error('Failed to initialize plugin system:', error);
    });

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
        handleApiRequest(req, res, pathname, parsedUrl);
        return;
    }
    
    // Serve static files
    serveStaticFile(res, pathname);
});

// Handle API requests
function handleApiRequest(req, res, pathname, parsedUrl) {
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
    
    // GET /api/documentation/status - Get documentation completion status
    if (pathname === '/api/documentation/status' && req.method === 'GET') {
        const progress = docManager.getDocumentationProgress();
        
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
    
    // GET /api/themes - Get all available themes
    if (pathname === '/api/themes' && req.method === 'GET') {
        try {
            const themeRegistry = pluginLoader.themeRegistry || { themes: [] };
            res.statusCode = 200;
            res.end(JSON.stringify({
                success: true,
                themes: themeRegistry.themes,
                activeTheme: pluginLoader.getActiveTheme()
            }));
        } catch (error) {
            res.statusCode = 500;
            res.end(JSON.stringify({
                success: false,
                error: error.message
            }));
        }
        return;
    }
    
    // POST /api/themes/activate - Activate a theme
    if (pathname === '/api/themes/activate' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            try {
                const { themeId } = JSON.parse(body);
                pluginLoader.activateTheme(themeId)
                    .then(result => {
                        res.statusCode = 200;
                        res.end(JSON.stringify({
                            success: true,
                            theme: result.theme
                        }));
                    })
                    .catch(error => {
                        res.statusCode = 400;
                        res.end(JSON.stringify({
                            success: false,
                            error: error.message
                        }));
                    });
            } catch (error) {
                res.statusCode = 400;
                res.end(JSON.stringify({
                    success: false,
                    error: 'Invalid request data: ' + error.message
                }));
            }
        });
        return;
    }
    
    // GET /api/plugins - Get all registered plugins
    if (pathname === '/api/plugins' && req.method === 'GET') {
        try {
            const pluginSummary = pluginLoader.getPluginSummary();
            res.statusCode = 200;
            res.end(JSON.stringify({
                success: true,
                plugins: pluginSummary
            }));
        } catch (error) {
            res.statusCode = 500;
            res.end(JSON.stringify({
                success: false,
                error: error.message
            }));
        }
        return;
    }
    
    // GET /api/components - Get all UI components from all themes
    if (pathname === '/api/components' && req.method === 'GET') {
        try {
            // Extract theme query parameter if provided
            const theme = parsedUrl.query.theme;
            const type = parsedUrl.query.type;
            
            // Get all components for all themes or a specific theme
            const components = getAllComponents(theme, type);
            
            res.statusCode = 200;
            res.end(JSON.stringify({
                success: true,
                components
            }));
        } catch (error) {
            res.statusCode = 500;
            res.end(JSON.stringify({
                success: false,
                error: error.message
            }));
        }
        return;
    }
    
    // GET /api/components/:theme/:component - Get details for a specific component
    if (pathname.match(/^\/api\/components\/[^\/]+\/[^\/]+$/) && req.method === 'GET') {
        try {
            const pathParts = pathname.split('/');
            const theme = pathParts[3];
            const component = pathParts[4];
            
            const componentDetails = getComponentDetails(theme, component);
            
            if (componentDetails) {
                res.statusCode = 200;
                res.end(JSON.stringify({
                    success: true,
                    component: componentDetails
                }));
            } else {
                res.statusCode = 404;
                res.end(JSON.stringify({
                    success: false,
                    error: `Component not found: ${theme}/${component}`
                }));
            }
        } catch (error) {
            res.statusCode = 500;
            res.end(JSON.stringify({
                success: false,
                error: error.message
            }));
        }
        return;
    }
    
    // Route not found
    res.statusCode = 404;
    res.end(JSON.stringify({ error: 'Not found' }));
}

// Serve static files
function serveStaticFile(res, pathname) {
    // Special handling for plugin assets
    if (pathname.startsWith('/plugins/')) {
        servePluginAsset(res, pathname);
        return;
    }
    
    // Determine the file path
    const filePath = path.join(__dirname, pathname);
    
    // First check if path exists and if it's a directory
    fs.stat(filePath, (err, stats) => {
        if (err) {
            if (err.code === 'ENOENT') {
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
                res.end(`Server Error: ${err.code}`);
            }
            return;
        }
        
        // If it's a directory, try to serve index.html from that directory
        if (stats.isDirectory()) {
            const indexPath = path.join(filePath, 'index.html');
            fs.readFile(indexPath, (err, indexContent) => {
                if (err) {
                    // If no index.html in directory, serve a directory listing
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end(`<h1>Directory: ${pathname}</h1><p>No index.html found in this directory.</p>
                            <p><a href="/">Return to home</a></p>`);
                } else {
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end(indexContent, 'utf-8');
                }
            });
            return;
        }
        
        // It's a file, serve it
        const extname = String(path.extname(filePath)).toLowerCase();
        const contentType = mimeTypes[extname] || 'application/octet-stream';
        
        // Read and serve the file
        fs.readFile(filePath, (error, content) => {
            if (error) {
                // Server error
                res.writeHead(500);
                res.end(`Server Error: ${error.code}`);
            } else {
                // Successful response
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content, 'utf-8');
            }
        });
    });
}

// Serve assets from plugins
function servePluginAsset(res, pathname) {
    // Extract plugin info from path: /plugins/[type]/[plugin-name]/[asset-path]
    const parts = pathname.split('/').filter(Boolean);
    
    if (parts.length < 3) {
        res.writeHead(404);
        res.end('Plugin asset not found: Invalid path format');
        return;
    }
    
    const pluginType = parts[1];
    const pluginName = parts[2];
    const assetPath = parts.slice(3).join('/');
    
    // Verify plugin exists
    if (!pluginLoader.plugins[pluginType] || !pluginLoader.plugins[pluginType][pluginName]) {
        res.writeHead(404);
        res.end(`Plugin not found: ${pluginType}/${pluginName}`);
        return;
    }
    
    // Get the plugin directory
    const pluginDir = pluginLoader.plugins[pluginType][pluginName].directory;
    const fullAssetPath = path.join(__dirname, 'plugins', pluginType, pluginDir, assetPath);
    
    // Serve the asset
    fs.readFile(fullAssetPath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404);
                res.end(`Asset not found: ${assetPath}`);
            } else {
                res.writeHead(500);
                res.end(`Server Error: ${error.code}`);
            }
        } else {
            const extname = String(path.extname(fullAssetPath)).toLowerCase();
            const contentType = mimeTypes[extname] || 'application/octet-stream';
            
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
}

/**
 * Get all UI components from available themes
 * @param {string} themeFilter - Optional theme name to filter components
 * @param {string} typeFilter - Optional component type to filter components
 * @returns {Array} Array of component objects
 */
function getAllComponents(themeFilter, typeFilter) {
    const components = [];
    
    // Component types mapping
    const componentTypes = {
        // Admin UI Components
        'card': 'content',
        'stats-card': 'data',
        'data-table': 'data',
        'chart-card': 'data',
        'form-inputs': 'form',
        'navbar': 'navigation',
        'sidebar': 'navigation',
        'modal': 'content',
        'notifications': 'content',
        'timeline': 'content',
        'timeline-block': 'content',
        'tabs': 'navigation',
        'alert': 'feedback',
        'progress': 'feedback',
        'toast': 'feedback',
        'accordion': 'content',
        
        // Frontend UI Components
        'hero-standard': 'content',
        'hero-fullscreen': 'content',
        'features-grid': 'content',
        'feature-card': 'content',
        'pricing-tables': 'content',
        'testimonials': 'content',
        'contact-form': 'form',
        'content-image-block': 'content',
        'cta-block': 'content',
        'header-navigation': 'navigation',
        'footer': 'layout',
        'blog-card': 'content'
    };
    
    // Loop through themes
    Object.keys(pluginLoader.plugins.themes).forEach(themeName => {
        // Skip if theme filter is provided and doesn't match
        if (themeFilter && themeName !== themeFilter) {
            return;
        }
        
        const theme = pluginLoader.plugins.themes[themeName];
        const componentsDir = path.join(__dirname, 'plugins/themes', theme.directory, 'components');
        
        // Check if components directory exists
        if (fs.existsSync(componentsDir)) {
            // Read all component files
            const componentFiles = fs.readdirSync(componentsDir)
                .filter(file => file.endsWith('.html'))
                .map(file => file.replace('.html', ''));
            
            // Add each component to the list
            componentFiles.forEach(component => {
                const componentType = componentTypes[component] || 'other';
                
                // Skip if type filter is provided and doesn't match
                if (typeFilter && componentType !== typeFilter) {
                    return;
                }
                
                // Get preview image path (fallback to placeholder)
                const previewDir = path.join(__dirname, 'plugins/themes', theme.directory, 'previews');
                const previewImagePath = fs.existsSync(path.join(previewDir, `${component}.png`)) ? 
                    `/plugins/themes/${theme.directory}/previews/${component}.png` : 
                    null;
                
                // Add component to the list
                components.push({
                    id: `${themeName}/${component}`,
                    name: formatComponentName(component),
                    theme: themeName,
                    themeTitle: theme.manifest?.title || themeName,
                    type: componentType,
                    description: getComponentDescription(component),
                    previewImage: previewImagePath,
                    componentPath: `/plugins/themes/${theme.directory}/components/${component}.html`
                });
            });
        }
    });
    
    return components;
}

/**
 * Get details for a specific component
 * @param {string} theme - Theme name
 * @param {string} component - Component name
 * @returns {Object|null} Component details or null if not found
 */
function getComponentDetails(theme, component) {
    // Check if theme exists
    if (!pluginLoader.plugins.themes[theme]) {
        return null;
    }
    
    const themeInfo = pluginLoader.plugins.themes[theme];
    const componentPath = path.join(__dirname, 'plugins/themes', themeInfo.directory, 'components', `${component}.html`);
    
    // Check if component exists
    if (!fs.existsSync(componentPath)) {
        return null;
    }
    
    // Read component HTML
    const componentHtml = fs.readFileSync(componentPath, 'utf8');
    
    // Get preview image path
    const previewDir = path.join(__dirname, 'plugins/themes', themeInfo.directory, 'previews');
    const previewImagePath = fs.existsSync(path.join(previewDir, `${component}.png`)) ? 
        `/plugins/themes/${themeInfo.directory}/previews/${component}.png` : 
        null;
    
    // Parse options from the HTML template
    const options = parseComponentOptions(componentHtml);
    
    return {
        id: `${theme}/${component}`,
        name: formatComponentName(component),
        theme,
        themeTitle: themeInfo.manifest?.title || theme,
        type: getComponentType(component),
        description: getComponentDescription(component),
        html: componentHtml,
        previewImage: previewImagePath,
        options,
        usage: getComponentUsage(component)
    };
}

/**
 * Format component name for display
 * @param {string} component - Component identifier
 * @returns {string} Formatted component name
 */
function formatComponentName(component) {
    // Convert kebab-case to Title Case
    return component
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

/**
 * Get component type
 * @param {string} component - Component identifier
 * @returns {string} Component type
 */
function getComponentType(component) {
    // Use the same mapping as defined in getAllComponents for consistency
    const typeMap = {
        // Admin UI Components
        'card': 'content',
        'stats-card': 'data',
        'data-table': 'data',
        'chart-card': 'data',
        'form-inputs': 'form',
        'navbar': 'navigation',
        'sidebar': 'navigation',
        'modal': 'content',
        'notifications': 'content',
        'timeline': 'content',
        'timeline-block': 'content',
        'tabs': 'navigation',
        'alert': 'feedback',
        'progress': 'feedback',
        'toast': 'feedback',
        'accordion': 'content',
        
        // Frontend UI Components
        'hero-standard': 'content',
        'hero-fullscreen': 'content',
        'features-grid': 'content',
        'feature-card': 'content',
        'pricing-tables': 'content',
        'testimonials': 'content',
        'contact-form': 'form',
        'content-image-block': 'content',
        'cta-block': 'content',
        'header-navigation': 'navigation',
        'footer': 'layout',
        'blog-card': 'content'
    };
    
    return typeMap[component] || 'other';
}

/**
 * Get component description
 * @param {string} component - Component identifier
 * @returns {string} Component description
 */
function getComponentDescription(component) {
    const descriptions = {
        // Admin UI Components
        'card': 'Standard content card with header, body, and footer sections.',
        'stats-card': 'Display key metrics and statistics with optional trend indicators.',
        'data-table': 'Interactive data table with sorting, pagination and search capabilities.',
        'chart-card': 'Data visualization card with various chart types and customization options.',
        'form-inputs': 'Various form input elements with validation and responsive layout.',
        'navbar': 'Top navigation bar with search, notifications, and user dropdown menu.',
        'sidebar': 'Collapsible sidebar with multi-level menu support and icons.',
        'modal': 'Customizable modal popups for alerts, forms, and content display.',
        'notifications': 'Display and manage system notifications with read/unread states.',
        'timeline': 'Timeline display for historical events, activities, or processes.',
        'timeline-block': 'Interactive timeline with icons, timestamps, and attachments for displaying events.',
        'tabs': 'Tabbed interface for organizing and displaying related content in separate views.',
        'accordion': 'Collapsible content panels for displaying information in a limited space.',
        'alert': 'Contextual feedback messages for typical user actions with optional icons and dismiss buttons.',
        'progress': 'Progress indicators for displaying the completion status of a task or operation.',
        'toast': 'Lightweight notification messages that appear temporarily on the screen.',
        
        // Frontend UI Components
        'hero-standard': 'Hero section with content and image for landing pages.',
        'hero-fullscreen': 'Fullscreen hero with background image and centered content.',
        'features-grid': 'Grid layout for highlighting product features with icons.',
        'feature-card': 'Individual feature showcase card with icon, title, and description.',
        'pricing-tables': 'Responsive pricing tables with feature comparison and call-to-actions.',
        'testimonials': 'Carousel slider showcasing customer testimonials and reviews.',
        'contact-form': 'Modern contact form with validation and optional contact information.',
        'content-image-block': 'Text content paired with an image, with customizable layout options.',
        'cta-block': 'Call-to-action section with heading, description, and action buttons.',
        'header-navigation': 'Website header with logo, navigation menu, and optional actions.',
        'footer': 'Website footer with multiple columns, links, and copyright information.',
        'blog-card': 'Card component for displaying blog post previews with image and metadata.'
    };
    
    return descriptions[component] || 'A customizable UI component.';
}

/**
 * Parse component options from the HTML template
 * @param {string} html - Component HTML template
 * @returns {Array} Array of option objects
 */
function parseComponentOptions(html) {
    const options = [];
    
    // Regular expression to find placeholder variables like {{variableName}}
    const placeholderRegex = /{{([^}]+)}}/g;
    let match;
    
    // Extract all placeholders
    const placeholders = new Set();
    while ((match = placeholderRegex.exec(html)) !== null) {
        // Extract the variable name
        const fullMatch = match[1];
        // Check if it contains a default value (e.g., variableName|default:'defaultValue')
        const parts = fullMatch.split('|');
        const varName = parts[0].trim();
        
        // Add to set to remove duplicates
        placeholders.add(varName);
    }
    
    // Convert placeholders to option objects
    placeholders.forEach(placeholder => {
        // Skip special placeholders used in control flow
        if (['if', 'each', 'for', 'else', 'this'].includes(placeholder)) {
            return;
        }
        
        // Add as an option
        options.push({
            name: placeholder,
            type: guessOptionType(placeholder),
            description: formatOptionDescription(placeholder),
            required: isRequiredOption(placeholder)
        });
    });
    
    return options;
}

/**
 * Guess the type of an option based on its name
 * @param {string} optionName - Option name
 * @returns {string} Guessed option type
 */
function guessOptionType(optionName) {
    const lowerName = optionName.toLowerCase();
    
    if (lowerName.includes('color') || lowerName.includes('badge') || lowerName.includes('class')) {
        return 'string';
    } else if (lowerName.includes('url') || lowerName.includes('link') || lowerName.includes('src') || lowerName.includes('href')) {
        return 'url';
    } else if (lowerName.includes('date')) {
        return 'date';
    } else if (lowerName.includes('height') || lowerName.includes('width') || lowerName.includes('size') || lowerName.includes('count')) {
        return 'number';
    } else if (lowerName === 'id') {
        return 'id';
    } else if (lowerName.startsWith('include') || lowerName.startsWith('show') || lowerName.startsWith('is') || lowerName.endsWith('enabled')) {
        return 'boolean';
    } else if (lowerName.includes('items') || lowerName.includes('options') || lowerName.includes('features') || lowerName.includes('list')) {
        return 'array';
    }
    
    return 'string';
}

/**
 * Format a readable description for an option
 * @param {string} optionName - Option name
 * @returns {string} Formatted description
 */
function formatOptionDescription(optionName) {
    // Convert camelCase or kebab-case to space-separated words
    let words = optionName
        .replace(/([A-Z])/g, ' $1') // Convert camelCase to space-separated
        .replace(/-/g, ' ')  // Convert kebab-case to space-separated
        .toLowerCase()
        .trim();
    
    // Capitalize first letter
    words = words.charAt(0).toUpperCase() + words.slice(1);
    
    // Add appropriate suffix based on option type
    const type = guessOptionType(optionName);
    switch (type) {
        case 'url':
            return `${words} URL or path`;
        case 'boolean':
            return `Whether to ${words.toLowerCase()}`;
        case 'array':
            return `List of ${words.toLowerCase()}`;
        case 'id':
            return `Unique identifier for the component`;
        default:
            return words;
    }
}

/**
 * Determine if an option is likely required
 * @param {string} optionName - Option name
 * @returns {boolean} Whether the option is likely required
 */
function isRequiredOption(optionName) {
    // Common required fields
    const commonRequired = ['id', 'title', 'content'];
    
    // Check if the option name is in the common required list
    return commonRequired.includes(optionName);
}

/**
 * Get usage instructions for a component
 * @param {string} component - Component identifier
 * @returns {string} Usage instructions HTML
 */
function getComponentUsage(component) {
    // Determine component category based on the component name
    let isAdminComponent = ['card', 'stats-card', 'data-table', 'chart-card', 'form-inputs', 
                            'navbar', 'sidebar', 'modal', 'notifications', 'timeline', 
                            'timeline-block', 'tabs', 'accordion', 'alert', 'progress', 'toast'].includes(component);
    
    let isLayoutComponent = ['footer', 'header-navigation'].includes(component);
    
    // Customize the usage instructions based on component type
    const usage = `
        <h5>Basic Usage</h5>
        <p>To use this component, copy the HTML template and replace the placeholder values with your content.</p>
        
        <h5>Integration</h5>
        <p>Add the following code to integrate this component:</p>
        <pre><code>const componentPath = '${component}.html';
const targetElement = document.querySelector('#componentContainer');
const themeName = '${isAdminComponent ? 'nobleui-admin' : 'martex-frontend'}';

fetch(\`/plugins/themes/\${themeName}/components/\${componentPath}\`)
  .then(response => response.text())
  .then(template => {
    // Replace placeholders with your data
    const html = template.replace(/{{title}}/g, 'Your Title')
                         .replace(/{{description}}/g, 'Your description goes here.')
                         ${isAdminComponent ? '.replace(/{{content}}/g, \'Your content goes here.\')' : ''}
                         // Replace other placeholders as needed
    
    // Insert into the page
    targetElement.innerHTML = html;
    
    // Initialize any required JavaScript${isAdminComponent ? ' (for interactive components)' : ''}
    ${component === 'chart-card' ? 'initializeCharts();' : 
      component === 'data-table' ? 'initializeTables();' : 
      component === 'tabs' || component === 'modal' || component === 'toast' ? 'initializeBootstrapComponents();' : 
      '// No initialization needed for this component'}
  });</code></pre>
        
        <h5>Required Libraries</h5>
        <p>Depending on the component, you may need to include additional CSS and JavaScript libraries:</p>
        <ul>
            <li>Bootstrap 5 for layout and styling</li>
            ${isAdminComponent ? '<li>Feather icons for icons</li>' : '<li>Font Awesome for icons</li>'}
            ${component === 'chart-card' ? '<li>Chart.js for data visualization</li>' : ''}
            ${component === 'data-table' ? '<li>DataTables for interactive tables</li>' : ''}
            ${isLayoutComponent ? '<li>Custom CSS for responsive layouts</li>' : ''}
        </ul>
        
        <h5>Customization</h5>
        <p>This component can be customized by modifying the following:</p>
        <ul>
            <li>HTML structure to match your layout requirements</li>
            <li>CSS classes to apply your design system</li>
            <li>Data placeholder replacements for dynamic content</li>
            ${isAdminComponent ? '<li>JavaScript event handlers for interactive features</li>' : ''}
        </ul>
        
        ${isLayoutComponent ? `
        <h5>Responsive Behavior</h5>
        <p>This component is designed to be fully responsive:</p>
        <ul>
            <li>Mobile: Stack layout with collapsible sections</li>
            <li>Tablet: Semi-fluid layout with optimized spacing</li>
            <li>Desktop: Full layout with all features visible</li>
        </ul>
        ` : ''}
        
        <h5>Accessibility Considerations</h5>
        <p>Ensure your implementation maintains accessibility standards:</p>
        <ul>
            <li>Maintain proper heading hierarchy</li>
            <li>Include alt text for images</li>
            <li>Ensure sufficient color contrast</li>
            ${component.includes('form') ? '<li>Add proper labels for form elements</li>' : ''}
            ${component === 'tabs' || component === 'accordion' ? '<li>Implement keyboard navigation</li>' : ''}
        </ul>
    `;
    
    return usage;
}

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Documentation System server running at http://0.0.0.0:${PORT}/`);
    console.log(`API endpoints available at http://0.0.0.0:${PORT}/api/`);
});