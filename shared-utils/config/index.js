/**
 * Global Configuration Entry Point
 *
 * This module aggregates configuration from specific domains (app, security, etc.)
 * and exports a unified config object.
 *
 * HOW TO READ CONFIG:
 * Import this module and access properties directly.
 * Example: const config = require('@shared/config'); console.log(config.app.env);
 *
 * ENVIRONMENT SEPARATION:
 * - Default values are set in the specific config files.
 * - Overrides should be provided via environment variables (process.env).
 * - This allows seamless switching between DEV, STAGING, and PROD without code changes.
 */

const appSettings = require('./app-settings');
const security = require('./security');
const rateLimits = require('./rate-limits');
const featureFlags = require('./feature-flags');

module.exports = {
    app: appSettings,
    security: security,
    rateLimits: rateLimits,
    features: featureFlags,
};
