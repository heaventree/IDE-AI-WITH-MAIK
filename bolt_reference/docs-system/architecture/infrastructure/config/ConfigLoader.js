/**
 * Configuration Loader
 * 
 * Loads and manages application configuration.
 */

/**
 * Load application configuration
 * 
 * @param {string} [environment=process.env.NODE_ENV] - Environment
 * @returns {Object} Configuration
 */
function loadConfig(environment = process.env.NODE_ENV) {
  // Normalize environment
  const env = (environment || 'development').toLowerCase();
  
  // Default configuration
  const config = {
    env,
    
    // Server configuration
    server: {
      host: process.env.HOST || '0.0.0.0',
      port: parseInt(process.env.PORT || '5000', 10)
    },
    
    // Database configuration
    database: {
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/docs-system',
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true
      }
    },
    
    // Logging configuration
    logging: {
      level: process.env.LOG_LEVEL || (env === 'production' ? 'info' : 'debug'),
      pretty: env !== 'production'
    },
    
    // Authentication configuration
    auth: {
      enabled: process.env.AUTH_ENABLED === 'true',
      jwtSecret: process.env.JWT_SECRET || 'docs-system-secret',
      expiresIn: process.env.JWT_EXPIRES_IN || '1d'
    },
    
    // Events configuration
    events: {
      driver: process.env.EVENT_DRIVER || 'memory'
    },
    
    // CORS configuration
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      exposedHeaders: ['X-Total-Count']
    }
  };
  
  // Override with environment-specific configuration
  if (env === 'production') {
    Object.assign(config, {
      logging: {
        ...config.logging,
        pretty: false
      }
    });
  } else if (env === 'test') {
    Object.assign(config, {
      database: {
        ...config.database,
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/docs-system-test'
      }
    });
  }
  
  return config;
}

module.exports = { loadConfig };