// This file helps Vercel recognize the existence of API routes

module.exports = (req, res) => {
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
};
