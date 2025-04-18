const express = require('express');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

const app = express();
const PORT = 5001;

// Tell Node.js this is a CommonJS module
// @ts-check

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
  res.sendFile(path.join(__dirname, 'public', 'explorer.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Bolt DIY Reference Server running at http://localhost:${PORT}`);
  console.log(`Access http://localhost:${PORT} to view the reference implementation`);
});