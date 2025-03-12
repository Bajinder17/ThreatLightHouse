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
    
    return axios.post(`${config.api.baseUrl}${config.api.fileScan}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  /**
   * Scan a URL for threats
   * @param {string} url - The URL to scan
   * @returns {Promise} - Response from the API
   */
  scanUrl: async (url) => {
    return axios.post(`${config.api.baseUrl}${config.api.urlScan}`, { url });
  },
  
  /**
   * Scan ports on a host
   * @param {string} host - The host to scan
   * @param {string} portRange - The port range to scan
   * @returns {Promise} - Response from the API
   */
  scanPorts: async (host, portRange) => {
    return axios.post(`${config.api.baseUrl}${config.api.portScan}`, { 
      host,
      port_range: portRange
    });
  },
  
  /**
   * Get all reports with optional filters
   * @param {Object} filters - Optional filters
   * @returns {Promise} - Response from the API
   */
  getReports: async (filters = {}) => {
    return axios.get(`${config.api.baseUrl}${config.api.reports}`, { params: filters });
  }
};

export default API;
