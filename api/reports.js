module.exports = (req, res) => {
  try {
    // Return mock data
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
    res.status(500).json({ error: error.message });
  }
};
