const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const fs = require('fs');

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

// Debug information about the environment
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Current directory:', __dirname);
console.log('Files in current directory:', fs.existsSync(__dirname) ? fs.readdirSync(__dirname) : 'Directory not accessible');
console.log('Build directory exists:', fs.existsSync(path.join(__dirname, 'build')));

// Setup static file serving for React app
try {
  const buildPath = path.join(__dirname, 'build');
  if (fs.existsSync(buildPath)) {
    console.log('Serving static files from:', buildPath);
    app.use(express.static(buildPath));
    
    // List build directory contents for debugging
    console.log('Build directory contents:', fs.readdirSync(buildPath));
  } else {
    console.warn('Build directory does not exist at:', buildPath);
  }
} catch (error) {
  console.error('Static file serving setup failed:', error);
}

// Setup temporary upload directory
let uploadDir;
try {
  uploadDir = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch (error) {
  console.warn('Upload directory setup failed:', error.message);
  // Use OS temp directory as fallback
  uploadDir = require('os').tmpdir();
}

// Helper function to provide mock data for different scan types
function getMockDataForScript(scriptType, options) {
  if (scriptType === 'url') {
    return {
      "malicious": false,
      "url": options?.url || "example.com",
      "categories": [],
      "risk_level": "low",
      "message": "Scan completed (demo mode)",
      "scan_id": `demo-${Date.now()}`
    };
  } else if (scriptType === 'port') {
    return {
      "host": options?.host || "example.com",
      "scan_time": new Date().toISOString(),
      "open_ports": [
        {"port": 80, "service": "HTTP", "state": "Open", "risk": "Low"},
        {"port": 443, "service": "HTTPS", "state": "Open", "risk": "Low"}
      ],
      "ports_scanned": options?.port_range || "1-1000",
      "scan_id": `demo-${Date.now()}`
    };
  } else if (scriptType === 'file') {
    return {
      "malicious": false,
      "detections": [],
      "message": "File scan completed (demo mode)",
      "scan_id": `demo-${Date.now()}`
    };
  } else if (scriptType === 'reports') {
    return {
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
    };
  }
  return { "message": "Mock data not available", "scan_id": `demo-${Date.now()}` };
}

// Root health check endpoint
app.get('/', (req, res) => {
  res.send('ThreatLightHouse API is running. Go to /app for the main application.');
});

// API base route
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

    // Return mock data
    return res.json(getMockDataForScript('url', { url }));
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

    // Return mock data
    return res.json(getMockDataForScript('port', { host, port_range }));
  } catch (error) {
    console.error('Error in port scanning endpoint:', error);
    res.status(500).json({ error: error.message });
  }
});

// File scan endpoint using multer for file upload
const multer = require('multer');
const upload = multer({ dest: uploadDir });

app.post('/api/scan-file', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Return mock data
    const result = getMockDataForScript('file');
    
    // Clean up the uploaded file
    try {
      fs.unlinkSync(req.file.path);
    } catch (err) {
      console.error('Error deleting file:', err);
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error in file scanning endpoint:', error);
    res.status(500).json({ error: error.message });
  }
});

// Reports endpoint
app.get('/api/reports', async (req, res) => {
  try {
    // Return mock data
    return res.json(getMockDataForScript('reports'));
  } catch (error) {
    console.error('Error in reports endpoint:', error);
    res.status(500).json({ error: error.message });
  }
});

// Redirect all other requests to React app
app.get('*', (req, res) => {
  try {
    const indexPath = path.join(__dirname, 'build', 'index.html');
    console.log('Attempting to serve index.html from:', indexPath);
    
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      console.error('index.html file not found');
      res.status(404).send('Application files not found');
    }
  } catch (error) {
    console.error('Error sending index.html:', error);
    res.status(500).send('Error loading application');
  }
});

// For Vercel, export the Express app
module.exports = app;

// Only listen if not in production environment
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
