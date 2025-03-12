module.exports = (req, res) => {
  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return res.status(405).json({ error: "Method not allowed" });
    }
    
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }
    
    // Return mock data
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
    res.status(500).json({ error: error.message });
  }
};
