const express = require('express');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 5002;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint to run demo
app.get('/api/run-demo', async (req, res) => {
  try {
    // Create a buffer to capture output
    let output = '';
    
    try {
      // Run the demo script
      output = execSync('cd .. && timeout 10 npx tsx demo-bolt-diy.ts', {
        encoding: 'utf8',
        maxBuffer: 1024 * 1024 // 1MB buffer
      });
    } catch (e) {
      // Even if the command times out, we want to capture the output
      output = e.stdout || '';
    }
    
    res.json({ success: true, output });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// API endpoint to get files
app.get('/api/files/:filename', (req, res) => {
  const { filename } = req.params;
  const safeFilename = filename.replace(/\.\./g, ''); // Basic security check
  
  try {
    const filePath = path.join('..', safeFilename);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      res.json({ success: true, content });
    } else {
      res.status(404).json({ success: false, error: 'File not found' });
    }
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
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          line-height: 1.6;
        }
        header {
          background-color: #f8f9fa;
          padding: 20px;
          margin-bottom: 20px;
          border-radius: 5px;
        }
        button {
          background-color: #007bff;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
        }
        button:hover {
          background-color: #0069d9;
        }
        pre {
          background-color: #f8f9fa;
          padding: 15px;
          border-radius: 5px;
          overflow: auto;
          max-height: 500px;
        }
        .file-explorer {
          margin-top: 20px;
          display: flex;
        }
        .file-list {
          width: 30%;
          overflow: auto;
          border-right: 1px solid #dee2e6;
          padding-right: 15px;
        }
        .file-content {
          width: 70%;
          padding-left: 15px;
        }
        .file-item {
          cursor: pointer;
          padding: 5px;
          border-radius: 3px;
        }
        .file-item:hover {
          background-color: #f8f9fa;
        }
      </style>
    </head>
    <body>
      <header>
        <h1>Bolt DIY Reference Server</h1>
        <p>This server provides a reference implementation of the Bolt DIY system.</p>
      </header>
      
      <section>
        <h2>Demo Output</h2>
        <button id="run-demo">Run Demo Script</button>
        <div id="loading" style="display:none;">Running demo, please wait...</div>
        <pre id="output"></pre>
      </section>
      
      <section class="file-explorer">
        <div class="file-list">
          <h2>Key Files</h2>
          <div id="files">
            <div class="file-item" data-file="demo-bolt-diy.ts">demo-bolt-diy.ts</div>
            <div class="file-item" data-file="core/di-container.ts">core/di-container.ts</div>
            <div class="file-item" data-file="core/ai/openai-service.ts">core/ai/openai-service.ts</div>
            <div class="file-item" data-file="core/ai/anthropic-service.ts">core/ai/anthropic-service.ts</div>
            <div class="file-item" data-file="core/ai/gemini-service.ts">core/ai/gemini-service.ts</div>
            <div class="file-item" data-file="core/ai/base-ai-service.ts">core/ai/base-ai-service.ts</div>
          </div>
        </div>
        <div class="file-content">
          <h2 id="file-name">File Content</h2>
          <pre id="file-content">Select a file to view its content</pre>
        </div>
      </section>
      
      <script>
        document.getElementById('run-demo').addEventListener('click', async () => {
          const outputEl = document.getElementById('output');
          const loadingEl = document.getElementById('loading');
          
          outputEl.textContent = '';
          loadingEl.style.display = 'block';
          
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
        document.querySelectorAll('.file-item').forEach(item => {
          item.addEventListener('click', async () => {
            const filename = item.dataset.file;
            const fileNameEl = document.getElementById('file-name');
            const fileContentEl = document.getElementById('file-content');
            
            fileNameEl.textContent = filename;
            fileContentEl.textContent = 'Loading...';
            
            try {
              const response = await fetch('/api/files/' + filename);
              const data = await response.json();
              
              if (data.success) {
                fileContentEl.textContent = data.content;
              } else {
                fileContentEl.textContent = 'Error: ' + data.error;
              }
            } catch (error) {
              fileContentEl.textContent = 'Error: ' + error.message;
            }
          });
        });
      </script>
    </body>
    </html>
  `);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Bolt DIY Reference Server running at http://localhost:${PORT}`);
  console.log(`Access http://localhost:${PORT} to view the demo`);
});