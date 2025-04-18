const express = require('express');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

const app = express();
const PORT = 5001;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// API endpoint to run demo
app.get('/api/run-demo', async (req, res) => {
  try {
    // Create a buffer to capture output
    let output = '';
    
    try {
      // Run the demo script with a timeout
      output = execSync('npx tsx demo-bolt-diy.ts', {
        cwd: __dirname,
        encoding: 'utf8',
        timeout: 10000, // 10 seconds timeout
        maxBuffer: 1024 * 1024 // 1MB buffer
      });
    } catch (e) {
      // Even if the command times out, we want to capture the output
      output = e.stdout || '';
      
      if (!output) {
        output = `Execution error or timeout: ${e.message}`;
      }
    }
    
    res.json({ success: true, output });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// API endpoint to get files
app.get('/api/files/:filename(*)', (req, res) => {
  const { filename } = req.params;
  const safeFilename = filename.replace(/\.\.\//g, ''); // Basic security check
  
  try {
    const filePath = path.join(__dirname, safeFilename);
    
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        // Return directory listing
        const files = fs.readdirSync(filePath)
          .filter(file => !file.startsWith('.'))
          .map(file => {
            const isDir = fs.statSync(path.join(filePath, file)).isDirectory();
            return { name: file, isDirectory: isDir };
          });
        
        res.json({ success: true, isDirectory: true, files });
      } else {
        // Return file content
        const content = fs.readFileSync(filePath, 'utf8');
        res.json({ success: true, isDirectory: false, content });
      }
    } else {
      res.status(404).json({ success: false, error: 'File not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// API endpoint to get directory structure
app.get('/api/structure', (req, res) => {
  function readDirRecursive(dir, basePath = '') {
    const result = [];
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      // Skip node_modules and hidden files
      if (file === 'node_modules' || file.startsWith('.')) return;
      
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);
      const relativePath = path.join(basePath, file);
      
      if (stats.isDirectory()) {
        result.push({
          name: file,
          path: relativePath,
          type: 'directory',
          children: readDirRecursive(filePath, relativePath)
        });
      } else {
        result.push({
          name: file,
          path: relativePath,
          type: 'file',
          size: stats.size
        });
      }
    });
    
    return result;
  }
  
  try {
    const structure = readDirRecursive(__dirname);
    res.json({ success: true, structure });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Home page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Bolt DIY Reference Server</title>
      <style>
        body {
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          max-width: 1400px;
          margin: 0 auto;
          padding: 20px;
          line-height: 1.6;
          color: #333;
        }
        header {
          background-color: #f8f9fa;
          padding: 20px;
          margin-bottom: 20px;
          border-radius: 5px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1, h2, h3 {
          color: #0d6efd;
        }
        button {
          background-color: #0d6efd;
          color: white;
          border: none;
          padding: 10px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: background-color 0.3s;
        }
        button:hover {
          background-color: #0b5ed7;
        }
        pre {
          background-color: #f8f9fa;
          padding: 15px;
          border-radius: 5px;
          overflow: auto;
          max-height: 500px;
          border: 1px solid #e9ecef;
          font-size: 13px;
        }
        .container {
          display: flex;
          margin-top: 20px;
          border: 1px solid #e9ecef;
          border-radius: 5px;
          overflow: hidden;
        }
        .sidebar {
          width: 25%;
          overflow: auto;
          border-right: 1px solid #e9ecef;
          padding: 15px;
          max-height: 800px;
          background-color: #f8f9fa;
        }
        .main-content {
          width: 75%;
          padding: 15px;
          overflow: auto;
          max-height: 800px;
        }
        .file-tree {
          list-style-type: none;
          padding-left: 0;
        }
        .file-tree ul {
          list-style-type: none;
          padding-left: 20px;
        }
        .file-item {
          cursor: pointer;
          padding: 5px;
          border-radius: 3px;
          display: flex;
          align-items: center;
        }
        .file-item:hover {
          background-color: #e9ecef;
        }
        .file-icon {
          margin-right: 5px;
          font-size: 16px;
        }
        .folder-icon:before {
          content: "📁";
          color: #ffc107;
        }
        .file-icon:before {
          content: "📄";
          color: #6c757d;
        }
        .tab-container {
          margin-bottom: 20px;
        }
        .tab-buttons {
          display: flex;
          border-bottom: 1px solid #dee2e6;
        }
        .tab-button {
          padding: 10px 20px;
          border: none;
          background-color: transparent;
          cursor: pointer;
          font-weight: 500;
          color: #6c757d;
        }
        .tab-button.active {
          border-bottom: 2px solid #0d6efd;
          color: #0d6efd;
        }
        .tab-content {
          padding: 15px 0;
        }
        .tab-panel {
          display: none;
        }
        .tab-panel.active {
          display: block;
        }
        .loading {
          display: inline-block;
          width: 20px;
          height: 20px;
          border: 3px solid rgba(0, 0, 0, 0.1);
          border-radius: 50%;
          border-top-color: #0d6efd;
          animation: spin 1s ease-in-out infinite;
          margin-left: 10px;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        #file-path {
          font-size: 14px;
          color: #6c757d;
          margin-bottom: 10px;
        }
      </style>
    </head>
    <body>
      <header>
        <h1>Bolt DIY Reference Server</h1>
        <p>This server provides a reference implementation of the Bolt DIY system for comparison and testing.</p>
      </header>
      
      <div class="tab-container">
        <div class="tab-buttons">
          <button class="tab-button active" data-tab="explorer">File Explorer</button>
          <button class="tab-button" data-tab="demo">Run Demo</button>
        </div>
        
        <div class="tab-content">
          <div id="explorer-tab" class="tab-panel active">
            <div class="container">
              <div class="sidebar">
                <h3>Files</h3>
                <div id="file-tree" class="file-tree">Loading...</div>
              </div>
              <div class="main-content">
                <div id="file-path"></div>
                <h3 id="file-name">Select a file</h3>
                <pre id="file-content">Select a file from the tree to view its content</pre>
              </div>
            </div>
          </div>
          
          <div id="demo-tab" class="tab-panel">
            <button id="run-demo">Run Demo Script</button>
            <span id="loading-indicator" style="display:none;" class="loading"></span>
            <pre id="demo-output">Click "Run Demo" to execute the demo script</pre>
          </div>
        </div>
      </div>
      
      <script>
        // Tab navigation
        document.querySelectorAll('.tab-button').forEach(button => {
          button.addEventListener('click', () => {
            // Remove active class from all buttons and panels
            document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
            
            // Add active class to clicked button and corresponding panel
            button.classList.add('active');
            document.getElementById(button.dataset.tab + '-tab').classList.add('active');
          });
        });
        
        // Run demo script
        document.getElementById('run-demo').addEventListener('click', async () => {
          const outputEl = document.getElementById('demo-output');
          const loadingEl = document.getElementById('loading-indicator');
          
          outputEl.textContent = 'Running demo...';
          loadingEl.style.display = 'inline-block';
          
          try {
            const response = await fetch('/api/run-demo');
            const data = await response.json();
            
            if (data.success) {
              outputEl.textContent = data.output;
            } else {
              outputEl.textContent = 'Error: ' + data.error;
            }
          } catch (error) {
            outputEl.textContent = 'Error: ' + error.message;
          } finally {
            loadingEl.style.display = 'none';
          }
        });
        
        // File explorer
        async function loadFileExplorer() {
          const fileTreeEl = document.getElementById('file-tree');
          
          try {
            const response = await fetch('/api/structure');
            const data = await response.json();
            
            if (data.success) {
              fileTreeEl.innerHTML = renderFileTree(data.structure);
              
              // Add click handlers to file items
              document.querySelectorAll('.file-item').forEach(item => {
                item.addEventListener('click', async (e) => {
                  e.stopPropagation(); // Prevent parent folder clicks
                  
                  const path = item.dataset.path;
                  const type = item.dataset.type;
                  
                  if (type === 'file') {
                    loadFile(path);
                  } else {
                    // Toggle folder
                    const ul = item.nextElementSibling;
                    if (ul) {
                      ul.style.display = ul.style.display === 'none' ? 'block' : 'none';
                    }
                  }
                });
              });
              
              // Initial file load - core files
              const initialFiles = [
                'demo-bolt-diy.ts',
                'core/di-container.ts',
                'core/ai/base-ai-service.ts',
                'core/ai/openai-service.ts'
              ];
              
              // Find the first file that exists
              for (const file of initialFiles) {
                try {
                  await loadFile(file);
                  break;
                } catch (e) {
                  continue;
                }
              }
            } else {
              fileTreeEl.textContent = 'Error loading file structure: ' + data.error;
            }
          } catch (error) {
            fileTreeEl.textContent = 'Error: ' + error.message;
          }
        }
        
        function renderFileTree(items) {
          let html = '<ul>';
          
          items.sort((a, b) => {
            // Directories first
            if (a.type === 'directory' && b.type !== 'directory') return -1;
            if (a.type !== 'directory' && b.type === 'directory') return 1;
            
            // Then sort alphabetically
            return a.name.localeCompare(b.name);
          });
          
          items.forEach(item => {
            const iconClass = item.type === 'directory' ? 'folder-icon' : 'file-icon';
            
            html += `<li>
              <div class="file-item" data-path="${item.path}" data-type="${item.type}">
                <span class="${iconClass}"></span> ${item.name}
              </div>`;
            
            if (item.type === 'directory' && item.children.length > 0) {
              html += renderFileTree(item.children);
            }
            
            html += '</li>';
          });
          
          html += '</ul>';
          return html;
        }
        
        async function loadFile(path) {
          const fileNameEl = document.getElementById('file-name');
          const filePathEl = document.getElementById('file-path');
          const fileContentEl = document.getElementById('file-content');
          
          fileNameEl.textContent = path.split('/').pop();
          filePathEl.textContent = path;
          fileContentEl.textContent = 'Loading...';
          
          try {
            const response = await fetch('/api/files/' + path);
            const data = await response.json();
            
            if (data.success) {
              if (data.isDirectory) {
                fileContentEl.textContent = 'Directory: ' + path;
              } else {
                fileContentEl.textContent = data.content;
              }
            } else {
              fileContentEl.textContent = 'Error: ' + data.error;
            }
          } catch (error) {
            fileContentEl.textContent = 'Error: ' + error.message;
          }
        }
        
        // Initialize
        loadFileExplorer();
      </script>
    </body>
    </html>
  `);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Bolt DIY Reference Server running at http://localhost:${PORT}`);
  console.log(`Access http://localhost:${PORT} to view the reference implementation`);
});