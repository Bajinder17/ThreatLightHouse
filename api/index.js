// API Handler for Vercel Serverless Functions

// Import required modules for serverless environment
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client (if environment variables are available)
let supabase = null;
if (process.env.SUPABASE_URL && process.env.SUPABASE_KEY) {
  supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
}

// In-memory store as fallback (this will reset between function calls)
const inMemoryStore = {
  reports: [
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

// Helper function to store scan data
async function storeScanReport(reportData) {
  try {
    // Add timestamps
    const now = new Date().toISOString();
    reportData.created_at = now;
    reportData.updated_at = now;
    
    // Add ID if not present
    if (!reportData.id) {
      reportData.id = `scan-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }
    
    // Try to store in Supabase if available
    if (supabase) {
      console.log('Storing report in Supabase:', reportData.id);
      const { data, error } = await supabase
        .from('reports')
        .insert([reportData]);
        
      if (error) {
        console.error('Supabase storage error:', error);
        // Fall back to memory storage
        inMemoryStore.reports.push(reportData);
      } else {
        console.log('Successfully stored in Supabase');
      }
    } else {
      // Store in memory as fallback
      console.log('Storing report in memory (no Supabase):', reportData.id);
      inMemoryStore.reports.push(reportData);
    }
    
    return reportData;
  } catch (error) {
    console.error('Error storing scan report:', error);
    return null;
  }
}

// Helper function to get reports
async function getStoredReports(filters = {}) {
  try {
    // Try to get from Supabase if available
    if (supabase) {
      console.log('Fetching reports from Supabase with filters:', filters);
      let query = supabase.from('reports').select('*').order('created_at', { ascending: false });
      
      // Apply filters
      if (filters.type) {
        query = query.eq('type', filters.type);
      }
      if (filters.start_date) {
        query = query.gte('created_at', filters.start_date);
      }
      if (filters.end_date) {
        query = query.lte('created_at', filters.end_date);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Supabase fetch error:', error);
        // Fall back to in-memory data
        return inMemoryStore.reports;
      }
      
      return data || [];
    }
    
    // Use in-memory store as fallback
    console.log('Fetching reports from memory (no Supabase)');
    return inMemoryStore.reports;
  } catch (error) {
    console.error('Error fetching reports:', error);
    return inMemoryStore.reports;
  }
}

// Main API handler
module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  
  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

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
      
      // Create scan result
      const scanId = `url-${Date.now()}`;
      const result = {
        "malicious": false,
        "url": url,
        "categories": [],
        "risk_level": "low",
        "message": "Scan completed (demo mode)",
        "scan_id": scanId
      };
      
      // Store report in database
      const reportData = {
        "id": scanId,
        "type": "url",
        "target": url,
        "status": "clean",
        "details": result
      };
      
      await storeScanReport(reportData);
      
      return res.json(result);
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
      
      // Create scan result
      const scanId = `port-${Date.now()}`;
      const result = {
        "host": host,
        "scan_time": new Date().toISOString(),
        "open_ports": [
          {"port": 80, "service": "HTTP", "state": "Open", "risk": "Low"},
          {"port": 443, "service": "HTTPS", "state": "Open", "risk": "Low"}
        ],
        "ports_scanned": port_range || "1-1000",
        "scan_id": scanId
      };
      
      // Store report in database
      const reportData = {
        "id": scanId,
        "type": "port",
        "target": host,
        "status": "suspicious", // Port scans with open ports are suspicious
        "details": result
      };
      
      await storeScanReport(reportData);
      
      return res.json(result);
    } catch (error) {
      console.error('Error in port scanning endpoint:', error);
      return res.status(500).json({ error: error.message });
    }
  }
  
  // File Scan endpoint
  if ((pathname === '/api/scan-file' || pathname === '/api/scan-file/') && req.method === 'POST') {
    try {
      // In a serverless function, we can't handle file uploads the same way
      // as in a traditional server, so we'll just create a mock response
      
      // Create scan result
      const scanId = `file-${Date.now()}`;
      const result = {
        "malicious": false,
        "detections": [],
        "message": "File scan completed (demo mode)",
        "scan_id": scanId
      };
      
      // Get filename from form data if available
      let filename = "unknown-file";
      try {
        // This is a simplistic approach - proper file handling would need
        // a different solution for serverless environments
        if (req.body && req.body.filename) {
          filename = req.body.filename;
        }
      } catch (e) {
        console.warn("Couldn't extract filename from request");
      }
      
      // Store report in database
      const reportData = {
        "id": scanId,
        "type": "file",
        "target": filename,
        "status": "clean",
        "details": result
      };
      
      await storeScanReport(reportData);
      
      return res.json(result);
    } catch (error) {
      console.error('Error in file scanning endpoint:', error);
      return res.status(500).json({ error: error.message });
    }
  }
  
  // Reports endpoint
  if (pathname === '/api/reports' || pathname === '/api/reports/') {
    try {
      // Extract query parameters
      const queryParams = new URL(req.url, `http://${req.headers.host}`).searchParams;
      const filters = {
        type: queryParams.get('type'),
        start_date: queryParams.get('start_date'),
        end_date: queryParams.get('end_date')
      };
      
      // Get reports from store
      const reports = await getStoredReports(filters);
      
      return res.json({ reports });
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
      version: "1.0.0",
      supabase: supabase ? "connected" : "not configured"
    });
  }
  
  // Not found handler for API routes
  if (pathname.startsWith('/api/')) {
    return res.status(404).json({ error: "API endpoint not found" });
  }
  
  // For any other route, return 404
  res.status(404).json({ error: "Not found" });
};
