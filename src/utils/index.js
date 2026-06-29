// src/utils/index.js

// Export all utilities from a single entry point
// Default export
import config from './config.js';
import helpers from './helpers.js';

export { default as config } from './config.js';
export { default as helpers } from './helpers.js';

// Also export individual helpers
export * from './config.js';
export * from './helpers.js';

const utils = {
  config,
  helpers,
  ...config,
  ...helpers
};

export default utils;