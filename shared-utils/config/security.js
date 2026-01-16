/**
 * Security Configuration
 *
 * Settings for authentication, encryption, and other security measures.
 */

module.exports = {
    // Secret for signing JWTs or sessions (Placeholder)
    // CRITICAL: Must be set in environment variables in production
    jwtSecret: process.env.JWT_SECRET || 'dev-secret-do-not-use-in-prod',

    // Token expiration time
    tokenExpiration: '1h',

    // CORS settings (allowed origins)
    cors: {
        allowedOrigins: (process.env.CORS_ALLOWED_ORIGINS || '').split(','),
    },

    // Encryption keys (placeholders)
    encryptionKey: process.env.ENCRYPTION_KEY,
};
