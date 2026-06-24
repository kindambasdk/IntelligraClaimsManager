// src/utils/config.js

/**
 * Application configuration manager
 * Centralizes all environment variables and app settings
 */
export const config = {
  // API Configuration
  get apiUrl() {
    return process.env.REACT_APP_API_URL || 'https://tz-prod.intelligra.io';
  },
  
  get apiEndpoint() {
    return process.env.REACT_APP_API_ENDPOINT || '/sharedService/api/Insurance/get-claim-details';
  },
  
  get apiFullUrl() {
    return `${this.apiUrl}${this.apiEndpoint}`;
  },

  // Environment
  get environment() {
    return process.env.REACT_APP_ENV || 'development';
  },
  
  get isDevelopment() {
    return this.environment === 'development';
  },
  
  get isProduction() {
    return this.environment === 'production';
  },
  
  get isStaging() {
    return this.environment === 'staging';
  },
  
  get isTest() {
    return this.environment === 'test';
  },

  // Feature Flags
  get enableMock() {
    return process.env.REACT_APP_ENABLE_MOCK_DATA === 'true' || this.isDevelopment;
  },
  
  get enableLogging() {
    return process.env.REACT_APP_ENABLE_LOGGING === 'true' || this.isDevelopment;
  },
  
  get enableDebug() {
    return process.env.REACT_APP_DEBUG === 'true' || this.isDevelopment;
  },

  // App Configuration
  get appName() {
    return process.env.REACT_APP_APP_NAME || 'INTELLIGRAClaim';
  },
  
  get version() {
    return process.env.REACT_APP_VERSION || '1.0.0';
  },
  
  get defaultPhone() {
    return process.env.REACT_APP_DEFAULT_PHONE || '255781518973';
  },

  // Authentication
  get authTokenKey() {
    return process.env.REACT_APP_AUTH_TOKEN_KEY || 'intelligra_auth_token';
  },
  
  get userKey() {
    return process.env.REACT_APP_USER_KEY || 'intelligra_user';
  },

  // Timeouts and Durations (in milliseconds)
  get apiTimeout() {
    return 30000; // 30 seconds
  },
  
  get popupDuration() {
    return 4000; // 4 seconds
  },
  
  get searchDebounce() {
    return 300; // 300ms
  },

  // Pagination
  get itemsPerPage() {
    return 10;
  },

  // File upload
  get maxFileSize() {
    return 5 * 1024 * 1024; // 5MB
  },
  
  get allowedFileTypes() {
    return ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
  }
};

/**
 * Log configuration on startup (only in development)
 */
if (config.enableLogging) {
  console.log('🚀 App Configuration:', {
    environment: config.environment,
    apiUrl: config.apiUrl,
    apiEndpoint: config.apiEndpoint,
    enableMock: config.enableMock,
    enableLogging: config.enableLogging,
    enableDebug: config.enableDebug,
    version: config.version,
    appName: config.appName,
    defaultPhone: config.defaultPhone
  });
}

// Export individual config values for convenience
export const {
  apiUrl,
  apiEndpoint,
  apiFullUrl,
  environment,
  isDevelopment,
  isProduction,
  isStaging,
  enableMock,
  enableLogging,
  enableDebug,
  appName,
  version,
  defaultPhone,
  authTokenKey,
  userKey,
  apiTimeout,
  popupDuration,
  searchDebounce,
  itemsPerPage,
  maxFileSize,
  allowedFileTypes
} = config;

// Default export
export default config;