// This file helps Vercel recognize the existence of API routes

module.exports = (req, res) => {
  const { pathname } = new URL(req.url, `http://${req.headers.host}`);
  
  console.log(`Processing request for: ${pathname} (Method: ${req.method})`);
  
  // Handle root API path
  if (pathname === '/api' || pathname === '/api/') {
    return res.json({
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
  }
  
  // URL Scan endpoint
  if ((pathname === '/api/scan-url' || pathname === '/api/scan-url/') && req.method === 'POST') {
    try {
      const { url } = req.body;
      
      if (!url) {
        return res.status(400).json({ error: "URL is required" });
      }
      
      return res.json({
        "malicious": false,
        "url": url,
        "categories": [],
        "risk_level": "low",
        "message": "Scan completed (demo mode)",
        "scan_id": `demo-${Date.now()}`
      });
    } catch (error) {
      console.error('Error in URL scanning endpoint:', error);
      return res.status(500).json({ error: error.message });
    }
  }
  
  // Port Scan endpoint
  if ((pathname === '/api/scan-ports' || pathname === '/api/scan-ports/') && req.method === 'POST') {
    try {
      const { host, port_range } = req.body;
      
      if (!host) {
        return res.status(400).json({ error: "Host is required" });
      }
      
      return res.json({
        "host": host,
        "scan_time": new Date().toISOString(),
        "open_ports": [
          {"port": 80, "service": "HTTP", "state": "Open", "risk": "Low"},
          {"port": 443, "service": "HTTPS", "state": "Open", "risk": "Low"}
        ],
        "ports_scanned": port_range || "1-1000",
        "scan_id": `demo-${Date.now()}`
      });
    } catch (error) {
      console.error('Error in port scanning endpoint:', error);
      return res.status(500).json({ error: error.message });
    }
  }
  
  // File Scan endpoint
  if ((pathname === '/api/scan-file' || pathname === '/api/scan-file/') && req.method === 'POST') {
    try {
      return res.json({
        "malicious": false,
        "detections": [],
        "message": "File scan completed (demo mode)",
        "scan_id": `demo-${Date.now()}`
      });
    } catch (error) {
      console.error('Error in file scanning endpoint:', error);
      return res.status(500).json({ error: error.message });
    }
  }
  
  // Reports endpoint
  if (pathname === '/api/reports' || pathname === '/api/reports/') {
    try {
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
    } catch (error) {
      console.error('Error in reports endpoint:', error);
      return res.status(500).json({ error: error.message });
    }
  }
  
  // Health check endpoint
  if (pathname === '/health' || pathname === '/api/health') {
    return res.json({
      status: "online",
      message: "ThreatLightHouse API is running",
      version: "1.0.0"
    });
  }
  
  // Not found handler for API routes
  if (pathname.startsWith('/api/')) {
    return res.status(404).json({ error: "API endpoint not found" });
  }
  
  // For any other route, let the frontend handle it
  res.status(404).json({ error: "Not found" });
};
