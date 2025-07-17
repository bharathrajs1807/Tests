/**
 * Utility for generating JWT access and refresh tokens for authentication.
 * Uses user info to create signed tokens with different expiration times.
 */
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables from .env file

/**
 * Payload type for JWT tokens, containing user identification info.
 */
export type JwtPayload = {
    id: number; // User ID
    username: string; // Username
    email: string; // Email address
}

/**
 * Generates access and refresh JWT tokens for a user.
 * @param user - The user payload to encode in the tokens
 * @returns An object with accessToken and refreshToken
 */
export const generateTokens = function (user: JwtPayload) { 
    // Access token: short-lived (15m)
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET_KEY as string, { expiresIn: "15m" });
    // Refresh token: longer-lived (7d)
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET_KEY as string, { expiresIn: "7d" });
    return { accessToken, refreshToken };
}