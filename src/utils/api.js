import axios from 'axios';
import config from './config';

const API = {
  /**
   * Scan a file for threats
   * @param {File} file - The file to scan
   * @returns {Promise} - Response from the API
   */
  scanFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('filename', file.name);
    
    const response = await axios.post(
      `${config.api.baseUrl}${config.api.fileScan}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    
    // Ensure scan-complete event is always dispatched
    try {
      window.dispatchEvent(new CustomEvent('scan-complete', { 
        detail: { type: 'file', result: response.data } 
      }));
    } catch (e) {
      console.warn('Could not dispatch custom event');
      // Fallback for older browsers
      const event = document.createEvent('Event');
      event.initEvent('scan-complete', true, true);
      window.dispatchEvent(event);
    }
    
    return response;
  },
  
  /**
   * Scan a URL for threats
   * @param {string} url - The URL to scan
   * @returns {Promise} - Response from the API
   */
  scanUrl: async (url) => {
    const response = await axios.post(
      `${config.api.baseUrl}${config.api.urlScan}`,
      { url }
    );
    
    // Ensure scan-complete event is always dispatched
    try {
      window.dispatchEvent(new CustomEvent('scan-complete', { 
        detail: { type: 'url', result: response.data } 
      }));
    } catch (e) {
      console.warn('Could not dispatch custom event');
      // Fallback for older browsers
      const event = document.createEvent('Event');
      event.initEvent('scan-complete', true, true);
      window.dispatchEvent(event);
    }
    
    return response;
  },
  
  /**
   * Scan ports on a host
   * @param {string} host - The host to scan
   * @param {string} portRange - The port range to scan
   * @returns {Promise} - Response from the API
   */
  scanPorts: async (host, port_range) => {
    const response = await axios.post(
      `${config.api.baseUrl}${config.api.portScan}`,
      { host, port_range }
    );
    
    // Ensure scan-complete event is always dispatched
    try {
      window.dispatchEvent(new CustomEvent('scan-complete', { 
        detail: { type: 'port', result: response.data } 
      }));
    } catch (e) {
      console.warn('Could not dispatch custom event');
      // Fallback for older browsers
      const event = document.createEvent('Event');
      event.initEvent('scan-complete', true, true);
      window.dispatchEvent(event);
    }
    
    return response;
  },
  
  /**
   * Get all reports with optional filters
   * @param {Object} filters - Optional filters
   * @returns {Promise} - Response from the API
   */
  getReports: async (filters = {}) => {
    const params = new URLSearchParams();
    
    // Add filters to query params
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    
    return await axios.get(
      `${config.api.baseUrl}${config.api.reports}`,
      { params }
    );
  },
  
  /**
   * Get a report by ID
   * @param {string} reportId - The ID of the report
   * @returns {Promise} - Response from the API
   */
  getReportById: async (reportId) => {
    return await axios.get(
      `${config.api.baseUrl}${config.api.reports}/${reportId}`
    );
  }
};

export default API;
