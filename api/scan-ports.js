module.exports = (req, res) => {
  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return res.status(405).json({ error: "Method not allowed" });
    }
    
    const { host, port_range } = req.body;
    
    if (!host) {
      return res.status(400).json({ error: "Host is required" });
    }
    
    // Return mock data
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
    res.status(500).json({ error: error.message });
  }
};
