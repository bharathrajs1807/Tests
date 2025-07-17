/**
 * Error responder middleware.
 * Sends error responses to the client in a consistent format.
 * Should be placed after the error logger middleware in the middleware stack.
 * In development, includes the stack trace for easier debugging.
 */
import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";

import { AppError } from "../utils/AppError";

dotenv.config();

type ErrorResponse = {
  message: string;
  stack?: string;
};  

export const errorResponder = function (err: Error, req: Request, res: Response<ErrorResponse>, next: NextFunction) {
    // Determine the status code (use AppError's statusCode if available, else 500)
    const statusCode = err instanceof AppError ? err.statusCode : 500;
    // Use the error's message, or a generic fallback
    const message = err.message || "Internal Server Error";
    // Build the error response body
    const responseBody: ErrorResponse = { message };
    // In development, include the stack trace for easier debugging
    if (process.env.NODE_ENV === "development" && err.stack) responseBody.stack = err.stack;
    // Send the error response to the client
    res.status(statusCode).json(responseBody);
};