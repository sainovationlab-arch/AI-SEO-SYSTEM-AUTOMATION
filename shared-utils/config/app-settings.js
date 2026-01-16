/**
 * Application Settings
 *
 * Basic application details and environment configuration.
 */

module.exports = {
  // Current environment (development, production, test)
  // Read from NODE_ENV, default to 'development'
  env: process.env.NODE_ENV || 'development',

  // Service name for logging and identification
  serviceName: process.env.SERVICE_NAME || 'ai-visibility-platform',

  // Port number (can be overridden by specific services)
  port: parseInt(process.env.PORT, 10) || 3000,

  // Log level (debug, info, warn, error)
  logLevel: process.env.LOG_LEVEL || 'info',
};
