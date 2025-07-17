/**
 * Authentication middleware.
 * Verifies the JWT access token from cookies and attaches the user to req.user if valid.
 * Returns 401 Unauthorized if the token is missing or invalid.
 */
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { User } from "../models/user.model";
import { AppError } from "../utils/AppError";

dotenv.config();

export const authMiddleware = async function (req: Request, res: Response, next: NextFunction) {
    try {
        // Get the access token from cookies
        const accessToken = req.cookies?.accessToken;
        if (!accessToken) return next(new AppError(401, "No active session found"));
        // Verify the access token
        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET_KEY!);
        // Attach user info to req.user for downstream handlers
        if (typeof decoded === "string" || !decoded) return next(new AppError(401, "Invalid token"));
        const { id, username, email } = decoded as { id: number, username: string, email: string };
        // Optionally, check if the user still exists in the database
        const user = await User.findByPk(id);
        if (!user) return next(new AppError(403, "Invalid token or session"));
        req.user = { id, username, email };
        next();
    } catch (error) {
        next(new AppError(401, "Invalid or expired token"));
    }
};