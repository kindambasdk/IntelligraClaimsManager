// src/utils/helpers.js

/**
 * General helper functions for the application
 */

/**
 * Extract date from transaction ID
 * Format: MP260610.2000.X08195
 * Where: MP + YYMMDD + . + random + . + X + random
 * @param {string} txId - Transaction ID
 * @returns {string} Formatted date string or null
 */
export const extractDateFromTransactionId = (txId) => {
  if (!txId) return null;
  
  try {
    // Pattern: MP + YYMMDD + . + rest
    // Example: MP260610.2000.X08195
    const match = txId.match(/^[A-Z]{2}(\d{2})(\d{2})(\d{2})/);
    
    if (match) {
      const year = `20${match[1]}`;
      const month = match[2];
      const day = match[3];
      
      // Create date object
      const date = new Date(`${year}-${month}-${day}`);
      
      // Check if valid date
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });
      }
    }
    return null;
  } catch (error) {
    console.error('Error extracting date from transaction ID:', error);
    return null;
  }
};

/**
 * Check if string is a valid transaction ID format
 * @param {string} txId - Transaction ID to validate
 * @returns {boolean} True if valid format
 */
export const isValidTransactionId = (txId) => {
  if (!txId) return false;
  // Pattern: 2 letters + 6 digits + . + 4 digits + . + X + 5 digits
  const pattern = /^[A-Z]{2}\d{6}\.\d{4}\.X\d{5}$/;
  return pattern.test(txId);
};

/**
 * Parse transaction ID to get components
 * @param {string} txId - Transaction ID to parse
 * @returns {Object} Parsed components or null
 */
export const parseTransactionId = (txId) => {
  if (!txId) return null;
  
  try {
    const match = txId.match(/^([A-Z]{2})(\d{2})(\d{2})(\d{2})\.(\d{4})\.X(\d{5})$/);
    
    if (match) {
      return {
        prefix: match[1],
        year: `20${match[2]}`,
        month: match[3],
        day: match[4],
        random1: match[5],
        random2: match[6],
        date: new Date(`20${match[2]}-${match[3]}-${match[4]}`)
      };
    }
    return null;
  } catch (error) {
    console.error('Error parsing transaction ID:', error);
    return null;
  }
};

/**
 * Format a phone number for display
 * @param {string} phone - Phone number to format
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  if (cleaned.length === 12 && cleaned.startsWith('255')) {
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
  }
  return phone;
};

/**
 * Format date for display
 * @param {string|Date} date - Date to format
 * @param {string} format - Format string (default: 'MM/DD/YYYY')
 * @returns {string} Formatted date string
 */
export const formatDate = (date, format = 'MM/DD/YYYY') => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid Date';

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
};

/**
 * Format currency
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: 'TZS')
 * @returns {string} Formatted currency
 */
export const formatCurrency = (amount, currency = 'TZS') => {
  if (!amount && amount !== 0) return '';
  return new Intl.NumberFormat('sw-TZ', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * Check if a string is a valid phone number
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid
 */
export const isValidPhoneNumber = (phone) => {
  if (!phone) return false;
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 10 && cleaned.length <= 15;
};

/**
 * Check if a string is a valid email
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
export const isValidEmail = (email) => {
  if (!email) return false;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} length - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, length = 50) => {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
};

/**
 * Generate a random ID
 * @param {number} length - Length of the ID
 * @returns {string} Random ID
 */
export const generateId = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Debounce function for search inputs
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, delay = 300) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Throttle function for rate limiting
 * @param {Function} func - Function to throttle
 * @param {number} limit - Limit in milliseconds
 * @returns {Function} Throttled function
 */
export const throttle = (func, limit = 1000) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Deep clone an object
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
export const deepClone = (obj) => {
  if (!obj) return obj;
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Get nested object value by path
 * @param {Object} obj - Object to search
 * @param {string} path - Path to value (e.g., 'user.profile.name')
 * @returns {*} Value at path or undefined
 */
export const getNestedValue = (obj, path) => {
  if (!obj || !path) return undefined;
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
};

/**
 * Check if object is empty
 * @param {Object} obj - Object to check
 * @returns {boolean} True if empty
 */
export const isEmpty = (obj) => {
  if (!obj) return true;
  if (Array.isArray(obj)) return obj.length === 0;
  return Object.keys(obj).length === 0;
};

/**
 * Capitalize first letter of string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Convert object to query string
 * @param {Object} params - Parameters to convert
 * @returns {string} Query string
 */
export const toQueryString = (params) => {
  if (!params || Object.keys(params).length === 0) return '';
  return '?' + Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
};

/**
 * Parse query string to object
 * @param {string} queryString - Query string to parse
 * @returns {Object} Parsed object
 */
export const parseQueryString = (queryString) => {
  if (!queryString) return {};
  const params = new URLSearchParams(queryString);
  const result = {};
  for (const [key, value] of params) {
    result[key] = value;
  }
  return result;
};

const helpers = {
  extractDateFromTransactionId,
  isValidTransactionId,
  parseTransactionId,
  formatPhoneNumber,
  formatDate,
  formatCurrency,
  isValidPhoneNumber,
  isValidEmail,
  truncateText,
  generateId,
  debounce,
  throttle,
  deepClone,
  getNestedValue,
  isEmpty,
  capitalize,
  toQueryString,
  parseQueryString
};

// Default export
export default helpers;