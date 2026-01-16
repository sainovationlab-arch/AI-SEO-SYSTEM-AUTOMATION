/**
 * Centralized Error Handling Pattern
 *
 * Defines the base structure for application errors.
 * Standardizes error responses across services.
 */

class AppError extends Error {
    /**
     * @param {string} message - Error message
     * @param {number} statusCode - HTTP status code
     * @param {boolean} isOperational - True if error is known/expected (user input), false if system failure
     */
    constructor(message, statusCode, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;

        // Capture stack trace for debugging
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;
