/**
 * Application configuration settings
 */

// Determine if we're in production
const isProduction = process.env.NODE_ENV === 'production';

// Set the API base URL based on environment
const getApiBaseUrl = () => {
  // If there's a REACT_APP_API_URL env variable, use that
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Otherwise, use environment-specific defaults
  return isProduction 
    ? 'https://threatlighthouse-api.herokuapp.com/api'  // Update this with your actual Heroku app name
    : 'http://localhost:5000/api';                      // Default development URL
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
