/**
 * Feature Flags
 *
 * Toggles for enabling/disabling features without deploying code.
 */

module.exports = {
    // Example feature flag
    enableNewDashboard: process.env.ENABLE_NEW_DASHBOARD === 'true',

    // System 2 specific flags
    salesSystem: {
        enableAutoOutreach: false,
    },

    // System 1 specific flags
    executionSystem: {
        enableParallelProcessing: true,
    },
};
