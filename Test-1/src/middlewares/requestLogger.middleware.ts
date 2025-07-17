/**
 * Request logging middleware.
 * Logs details of every incoming HTTP request to a file for auditing and debugging.
 */
import fs from "fs";
import path from "path";

import { Request, Response, NextFunction } from "express";

export const requestLogger = function (req: Request, res: Response, next: NextFunction) {
    // Ensure the logs directory exists
    const logDir = path.join(__dirname, "../logs");
    const logPath = path.join(logDir, "request.log");
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
    }
    // Start timing the request
    const start = Date.now();
    res.on("finish", () => {
        // Log the request details and duration after response is sent
        const duration = Date.now() - start;
        const logMessage = `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms\n`;
        fs.appendFileSync(logPath, logMessage, { encoding: "utf-8" });
    });
    next();
};