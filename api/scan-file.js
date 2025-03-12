module.exports = (req, res) => {
  try {
    // Return mock data for file scanning
    return res.json({
      "malicious": false,
      "detections": [],
      "message": "File scan completed (demo mode)",
      "scan_id": `demo-${Date.now()}`
    });
  } catch (error) {
    console.error('Error in file scanning endpoint:', error);
    res.status(500).json({ error: error.message });
  }
};
