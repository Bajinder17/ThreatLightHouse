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

// Simple logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Debug info on startup
console.log('Starting ThreatLightHouse server...');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('VERCEL_ENV:', process.env.VERCEL_ENV);

// Setup static file serving for React app
try {
  const buildPath = path.join(__dirname, 'build');
  if (fs.existsSync(buildPath)) {
    console.log('Serving static files from:', buildPath);
    app.use(express.static(buildPath));
  } else {
    console.warn('Build directory does not exist at:', buildPath);
  }
} catch (error) {
  console.error('Static file serving setup failed:', error);
}

// Setup temporary upload directory for file scanning
let uploadDir;
try {
  uploadDir = path.join(process.env.VERCEL ? '/tmp' : __dirname, 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch (error) {
  console.warn('Upload directory setup failed:', error.message);
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
app.get('/health', (req, res) => {
  res.json({
    status: "online",
    message: "ThreatLightHouse API is running",
    version: "1.0.0"
  });
});

// API base route
app.get('/api', (req, res) => {
  res.json({
    status: "online",
    message: "ThreatLightHouse API is running",
    version: "1.0.0",
    endpoints: {
      "file_scan": "/api/scan-file",
      "url_scan": "/api/scan-url",
      "port_scan": "/api/scan-ports",
      "reports": "/api/reports"
    }
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

// Generate a basic HTML response if build files are not available
const generateBasicHTML = () => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>ThreatLightHouse</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f8f9fa;
      color: #212529;
      line-height: 1.5;
      padding: 2rem;
      max-width: 800px;
      margin: 0 auto;
      text-align: center;
    }
    h1 { color: #4361ee; }
    .container {
      background-color: white;
      border-radius: 8px;
      padding: 2rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      margin-bottom: 2rem;
    }
    .feature {
      margin-bottom: 2rem;
      padding: 1rem;
      border-radius: 8px;
      background-color: #f1f3f9;
    }
    .feature h3 {
      color: #4361ee;
      margin-top: 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>ThreatLightHouse</h1>
    <p>Advanced threat detection platform that allows you to scan files, URLs, and network ports for potential security threats.</p>
  </div>
  <div class="feature">
    <h3>File Scanning</h3>
    <p>Scan files for malware, viruses, and other threats</p>
  </div>
  <div class="feature">
    <h3>URL Scanning</h3>
    <p>Check websites for malicious content, phishing, and safety issues</p>
  </div>
  <div class="feature">
    <h3>Port Scanning</h3>
    <p>Identify open ports and potential security vulnerabilities</p>
  </div>
</body>
</html>
`;

// Catch-all handler for all other routes - serve React app or fallback HTML
app.get('*', (req, res) => {
  try {
    const indexPath = path.join(__dirname, 'build', 'index.html');
    
    if (fs.existsSync(indexPath)) {
      // Serve the React app's index.html
      res.sendFile(indexPath);
    } else {
      // If build files are not available, send a basic HTML response
      res.send(generateBasicHTML());
    }
  } catch (error) {
    console.error('Error handling catch-all route:', error);
    res.send(generateBasicHTML());
  }
});

// For Vercel, export the Express app
module.exports = app;

// Start server if not in production environment
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
