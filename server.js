const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const { PythonShell } = require('python-shell');

// Initialize app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(helmet({
  contentSecurityPolicy: false, // To allow loading of various resources
}));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup static file serving for React app
app.use(express.static(path.join(__dirname, 'build')));

// Setup temporary upload directory
const uploadDir = path.join(__dirname, 'uploads');
const fs = require('fs');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Helper function to execute Python scripts
function executePythonScript(scriptPath, options = {}) {
  return new Promise((resolve, reject) => {
    // Check if we're in Vercel environment (serverless)
    if (process.env.VERCEL) {
      console.log('Running in Vercel environment - mocking Python execution');
      // Return mock data for Vercel environment
      return resolve([getMockDataForScript(scriptPath, options)]);
    }
    
    // Normal execution for local environment
    PythonShell.run(scriptPath, options, (err, results) => {
      if (err) return reject(err);
      return resolve(results);
    });
  });
}

// Helper function to provide mock data for different scan types
function getMockDataForScript(scriptPath, options) {
  if (scriptPath.includes('url_scanner')) {
    return {
      "malicious": false,
      "url": options.args[0],
      "categories": [],
      "risk_level": "low",
      "message": "Scan completed (demo mode)",
      "scan_id": `demo-${Date.now()}`
    };
  } else if (scriptPath.includes('port_scanner')) {
    return {
      "host": options.args[0],
      "scan_time": new Date().toISOString(),
      "open_ports": [
        {"port": 80, "service": "HTTP", "state": "Open", "risk": "Low"},
        {"port": 443, "service": "HTTPS", "state": "Open", "risk": "Low"}
      ],
      "ports_scanned": options.args[1] || "1-1000",
      "scan_id": `demo-${Date.now()}`
    };
  } else if (scriptPath.includes('file_scanner')) {
    return {
      "malicious": false,
      "detections": [],
      "message": "File scan completed (demo mode)",
      "scan_id": `demo-${Date.now()}`
    };
  }
  return { "message": "Mock data not available", "scan_id": `demo-${Date.now()}` };
}

// API routes
app.get('/api', (req, res) => {
  res.json({
    status: "online",
    message: "ThreatLightHouse API is running",
    version: "1.0.0",
  });
});

// URL scan endpoint
app.post('/api/scan-url', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    const options = {
      mode: 'json',
      pythonPath: 'python',
      pythonOptions: ['-u'],
      scriptPath: './api/scanner',
      args: [url]
    };

    const results = await executePythonScript('url_scanner_bridge.py', options);
    res.json(results[0]);
  } catch (error) {
    console.error('Error in URL scanning endpoint:', error);
    res.status(500).json({ error: error.message });
  }
});

// Port scan endpoint
app.post('/api/scan-ports', async (req, res) => {
  try {
    const { host, port_range } = req.body;
    if (!host) {
      return res.status(400).json({ error: "Host is required" });
    }

    const options = {
      mode: 'json',
      pythonPath: 'python',
      pythonOptions: ['-u'],
      scriptPath: './api/scanner',
      args: [host, port_range || '1-1000']
    };

    const results = await executePythonScript('port_scanner_bridge.py', options);
    res.json(results[0]);
  } catch (error) {
    console.error('Error in port scanning endpoint:', error);
    res.status(500).json({ error: error.message });
  }
});

// File scan endpoint using multer for file upload
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

app.post('/api/scan-file', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const options = {
      mode: 'json',
      pythonPath: 'python',
      pythonOptions: ['-u'],
      scriptPath: './api/scanner',
      args: [req.file.path]
    };

    const results = await executePythonScript('file_scanner_bridge.py', options);
    
    // Clean up the uploaded file
    try {
      fs.unlinkSync(req.file.path);
    } catch (err) {
      console.error('Error deleting file:', err);
    }
    
    res.json(results[0]);
  } catch (error) {
    console.error('Error in file scanning endpoint:', error);
    res.status(500).json({ error: error.message });
  }
});

// Reports endpoint
app.get('/api/reports', async (req, res) => {
  try {
    const reportType = req.query.type || 'all';
    const startDate = req.query.start_date;
    const endDate = req.query.end_date;

    const options = {
      mode: 'json',
      pythonPath: 'python',
      pythonOptions: ['-u'],
      scriptPath: './api/scanner',
      args: ['all', reportType, startDate, endDate].filter(Boolean)
    };

    // In Vercel environment, return mock data
    if (process.env.VERCEL) {
      return res.json({
        "reports": [
          {
            "id": "demo-file-1",
            "type": "file",
            "target": "sample.pdf",
            "status": "clean",
            "created_at": new Date(Date.now() - 86400000).toISOString(),
            "scan_id": "demo-scan-1"
          },
          {
            "id": "demo-url-1",
            "type": "url",
            "target": "https://example.com",
            "status": "clean",
            "created_at": new Date(Date.now() - 43200000).toISOString(),
            "scan_id": "demo-scan-2"
          },
          {
            "id": "demo-port-1",
            "type": "port",
            "target": "example.com",
            "status": "suspicious",
            "created_at": new Date().toISOString(),
            "scan_id": "demo-scan-3"
          }
        ]
      });
    }

    const results = await executePythonScript('reports_bridge.py', options);
    res.json(results[0]);
  } catch (error) {
    console.error('Error in reports endpoint:', error);
    res.status(500).json({ error: error.message });
  }
});

// Catch-all for React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Start server
// For Vercel, we need to export the Express app
if (process.env.VERCEL) {
  console.log('Exporting app for Vercel deployment');
  module.exports = app;
} else {
  // Start the server normally for local development
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
