/**
 * Application configuration settings
 */

// Set the API base URL based on environment
const getApiBaseUrl = () => {
  // If there's a REACT_APP_API_URL env variable, use that
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Otherwise, use environment-specific defaults
  // In this unified setup, the API is served from the same domain 
  return '/api';
};

const config = {
  // API endpoints
  api: {
    baseUrl: getApiBaseUrl(),
    fileScan: '/scan-file',
    urlScan: '/scan-url',
    portScan: '/scan-ports',
    reports: '/reports'
  },
  
  // Maximum file size for uploads (in bytes)
  maxFileSize: 32 * 1024 * 1024, // 32MB
  
  // Default port range for port scanning
  defaultPortRange: '1-1000'
};

export default config;
