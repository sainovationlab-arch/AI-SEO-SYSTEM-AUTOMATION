/**
 * Rate Limiting Configuration
 *
 * Defines limits for API usage to prevent abuse.
 */

module.exports = {
    // Global API rate limit
    global: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // Limit each IP to 100 requests per windowMs
    },

    // Specific limits for high-cost endpoints (Placeholder)
    aiGeneration: {
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 10,
    },
};
