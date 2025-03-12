/**
 * Handle API error responses consistently
 * @param {Error} error - The error object from axios
 * @returns {string} Formatted error message
 */
export const getErrorMessage = (error) => {
  // Check if it's an axios error with a response
  if (error.response && error.response.data) {
    if (error.response.data.error) {
      return error.response.data.error;
    }
    if (error.response.data.message) {
      return error.response.data.message;
    }
    return `Error: ${error.response.status} ${error.response.statusText}`;
  }
  
  // Network error or other issues
  if (error.message) {
    return error.message;
  }
  
  // Fallback
  return 'An unknown error occurred';
};

/**
 * Log errors to console in development mode
 * @param {Error} error - The error object
 * @param {string} context - Context where the error occurred
 */
export const logError = (error, context = '') => {
  if (process.env.NODE_ENV !== 'production') {
    if (context) {
      console.error(`Error in ${context}:`, error);
    } else {
      console.error('Error:', error);
    }
  }
};

// Create a named object before exporting as default
const errorHandler = {
  getErrorMessage,
  logError
};

export default errorHandler;
