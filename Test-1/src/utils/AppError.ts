/**
 * Custom error class for application-specific errors.
 * Used to provide consistent error handling and status codes throughout the app.
 */
export class AppError extends Error{
    /** HTTP status code for the error (e.g., 404, 500) */
    statusCode: number;
    /** Indicates if the error is operational (expected) or a programming error */
    isOperational: boolean;

    /**
     * Constructs a new AppError instance.
     * @param statusCode - HTTP status code (default: 500)
     * @param message - Error message
     */
    constructor(statusCode: number = 500, message: string) {
        super(message); // Call parent Error constructor
        this.statusCode = statusCode;
        this.isOperational = true; // Used to distinguish operational errors
        Error.captureStackTrace(this, this.constructor); // Captures stack trace
    }
}