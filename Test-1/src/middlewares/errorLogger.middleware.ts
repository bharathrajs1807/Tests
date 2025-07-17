/**
 * Error logging middleware.
 * Logs error details to a file and the console for debugging and auditing.
 * Should be placed before the error responder middleware in the middleware stack.
 */
import fs from "fs";
import path from "path";

import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";

import { AppError } from "../utils/AppError";

dotenv.config();

export const errorLogger = function (err: Error, req: Request, res: Response, next: NextFunction) {
    // Ensure the logs directory exists (../logs)
    const logDir = path.join(__dirname, "../logs");
    const logPath = path.join(logDir, "error.log");
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    // Format the error log message with timestamp, method, URL, status, and message
    const timestamp = new Date().toISOString();
    const statusCode = err instanceof AppError ? err.statusCode : 500;
    const message = err.message;
    const logMessage = `[${timestamp}] ${req.method} ${req.url} - ${statusCode} ${message}\n`;
    // Append the error log to the error.log file
    fs.appendFileSync(logPath, logMessage, { encoding: "utf-8" });
    let consoleLogMessage = logMessage;
    // In development, include the stack trace in the console for easier debugging
    if (process.env.NODE_ENV === "development" && err.stack) consoleLogMessage += `${err.stack}\n`;
    // Output the error to the console
    console.error(consoleLogMessage);
    // Pass the error to the next error handler
    next(err);
};