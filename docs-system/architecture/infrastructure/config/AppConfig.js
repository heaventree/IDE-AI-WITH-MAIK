/**
 * Application Configuration
 * 
 * Centralized configuration management for the application.
 */

/**
 * Get the application configuration
 * 
 * @param {string} environment - Environment name (development, production, test)
 * @returns {Object} Application configuration
 */
function getConfig(environment = process.env.NODE_ENV || 'development') {
  // Base configuration common to all environments
  const baseConfig = {
    app: {
      name: 'Documentation System',
      version: '1.0.0'
    },
    server: {
      port: parseInt(process.env.PORT || '3000', 10),
      host: process.env.HOST || '0.0.0.0',
      cors: {
        enabled: true,
        origin: process.env.CORS_ORIGIN || '*'
      }
    },
    logLevel: process.env.LOG_LEVEL || 'info',
    mongodb: {
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017',
      dbName: process.env.MONGODB_DB_NAME || 'documentation-system'
    },
    auth: {
      jwtSecret: process.env.JWT_SECRET || 'default-jwt-secret-change-in-production',
      tokenExpiresIn: process.env.TOKEN_EXPIRES_IN || '1h',
      refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d'
    },
    rateLimit: {
      enabled: true,
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // Limit each IP to 100 requests per windowMs
      message: 'Too many requests, please try again later'
    }
  };
  
  // Environment-specific configurations
  const envConfigs = {
    development: {
      ...baseConfig,
      logLevel: 'debug',
      server: {
        ...baseConfig.server,
        port: 3000
      }
    },
    test: {
      ...baseConfig,
      logLevel: 'debug',
      mongodb: {
        ...baseConfig.mongodb,
        dbName: 'documentation-system-test'
      },
      server: {
        ...baseConfig.server,
        port: 3001
      }
    },
    production: {
      ...baseConfig,
      logLevel: 'info',
      mongodb: {
        ...baseConfig.mongodb,
        // In production, URI must be set through environment variable
        uri: process.env.MONGODB_URI || (() => {
          throw new Error('MONGODB_URI must be set in production');
        })()
      },
      auth: {
        ...baseConfig.auth,
        // In production, JWT secret must be set through environment variable
        jwtSecret: process.env.JWT_SECRET || (() => {
          throw new Error('JWT_SECRET must be set in production');
        })()
      },
      server: {
        ...baseConfig.server,
        cors: {
          ...baseConfig.server.cors,
          // In production, CORS origin should be restricted
          origin: process.env.CORS_ORIGIN || 'https://documentation-system.com'
        }
      }
    }
  };
  
  // Override with custom configuration from environment variables
  const config = envConfigs[environment] || envConfigs.development;
  
  // Validate the configuration
  validateConfig(config);
  
  return config;
}

/**
 * Validate the configuration
 * 
 * @param {Object} config - Configuration to validate
 * @throws {Error} If the configuration is invalid
 */
function validateConfig(config) {
  // Validate server port
  if (typeof config.server.port !== 'number' || config.server.port <= 0 || config.server.port >= 65536) {
    throw new Error('Invalid server port');
  }
  
  // Validate MongoDB URI
  if (!config.mongodb.uri) {
    throw new Error('MongoDB URI is required');
  }
  
  // Validate MongoDB database name
  if (!config.mongodb.dbName) {
    throw new Error('MongoDB database name is required');
  }
  
  // Validate authentication configuration
  if (!config.auth.jwtSecret) {
    throw new Error('JWT secret is required');
  }
}

module.exports = { getConfig };