/**
 * Authentication controller for user registration, login, logout, and token refresh.
 * Handles JWT token issuance and session management.
 */
import { Request, Response, NextFunction } from "express";
import { Op } from "sequelize";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

import { User } from "../models/user.model";
import { AppError } from "../utils/AppError";
import { JwtPayload, generateTokens } from "../utils/generateTokens";

dotenv.config();

// Types for request bodies and responses
type IUser = {
  username: string;
  email: string;
  password: string;
};

type IdentifierUser =
  | { username: string; email?: string; password: string }
  | { username?: string; email: string; password: string };

type UserResponse = {
  message: string;
  user?: object;
};

interface IJwtPayload extends JwtPayload {
  id: number;
  username: string;
  email: string;
}

/**
 * Register a new user.
 * Checks for required fields and uniqueness, then creates the user.
 */
export const register = async (
  req: Request<{}, any, IUser>,
  res: Response<UserResponse>,
  next: NextFunction
) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
      return next(
        new AppError(400, "Username, email and password are required")
      );

    // Check if username or email already exists
    const existing = await User.findOne({
      where: { [Op.or]: [{ username }, { email }] },
    });

    if (existing)
      return next(new AppError(409, "Username or email already exists"));

    // Create the user
    const user = await User.create({ username, email, password });
    const safeUser = user.toJSON();
    res.status(201).json({ message: "Successfully registered", user: safeUser });
  } catch (error) {
    next(error);
  }
};

/**
 * Login a user and issue access/refresh tokens.
 * Accepts either username or email and password.
 * Sets tokens as HTTP-only cookies.
 */
export const login = async (
  req: Request<{}, any, IdentifierUser>,
  res: Response<UserResponse>,
  next: NextFunction
) => {
  try {
    const { username, email, password } = req.body;
    if (!username && !email)
      return next(new AppError(400, "Either username or email is required"));
    if (!password) return next(new AppError(400, "Password is required"));

    // Find user by username or email
    const user = await User.scope("withSensitive").findOne({
      where: username ? { username } : { email },
    });
    if (!user) return next(new AppError(401, "Invalid credentials"));

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return next(new AppError(401, "Invalid credentials"));

    if (!user.id) return next(new AppError(500, "User ID is missing"));
    const payload: IJwtPayload = {
      id: user.id!,
      username: user.username,
      email: user.email,
    };

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(payload);
    user.refreshToken = refreshToken;
    await user.save();

    // Set tokens as HTTP-only cookies
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const safeUser = user.toJSON();
    res.status(200).json({ message: "User successfully logged in", user: safeUser });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout a user by clearing tokens and removing refresh token from DB.
 * Accepts either access or refresh token for session identification.
 */
export const logout = async (
  req: Request,
  res: Response<{ message: string }>,
  next: NextFunction
) => {
  try {
    const accessToken = req.cookies?.accessToken;
    const refreshToken = req.cookies?.refreshToken;
    if (!accessToken && !refreshToken)
      return next(new AppError(401, "No active session found"));

    let decoded: string | IJwtPayload | null = null;
    let user: User | null = null;

    // Try to decode access token first
    if (accessToken) {
      try {
        decoded = jwt.verify(
          accessToken,
          process.env.ACCESS_TOKEN_SECRET_KEY!
        ) as IJwtPayload;
        if (typeof decoded !== "string") {
          const { id } = decoded;
          user = await User.findByPk(id);
        }
      } catch (error) {
        // fallback to refreshToken
      }
    }

    // If not found, try refresh token
    if (!user && refreshToken) {
      try {
        decoded = jwt.verify(
          refreshToken,
          process.env.REFRESH_TOKEN_SECRET_KEY!
        ) as IJwtPayload;
        if (typeof decoded !== "string") {
          const { id } = decoded;
          user = await User.findByPk(id);
        }
      } catch (error) {
        return next(new AppError(401, "Invalid or expired session"));
      }
    }

    if (!user) {
      return next(new AppError(401, "Invalid or expired session"));
    }

    // Remove refresh token from DB
    user.refreshToken = null;
    await user.save();

    // Clear cookies
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.status(200).json({ message: "Successfully logged out" });
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh the access token using a valid refresh token.
 * Sets a new access token as a cookie and returns the user.
 */
export const refresh = async (
  req: Request,
  res: Response<UserResponse>,
  next: NextFunction
) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken)
      return next(new AppError(401, "No active session found"));

    // Find user by refresh token
    const user = await User.findOne({ where: { refreshToken } });
    if (!user) return next(new AppError(403, "Invalid or expired session"));

    if (!user.id) return next(new AppError(500, "User ID is missing"));
    const payload: IJwtPayload = {
      id: user.id!,
      username: user.username,
      email: user.email,
    };

    // Generate new access token
    const { accessToken } = generateTokens(payload);
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    });

    const safeUser = user.toJSON();
    res.status(200).json({ message: "Access token successfully generated", user: safeUser });
  } catch (error) {
    next(error);
  }
};

/**
 * Get the current authenticated user (from req.user).
 * Returns the user info set by the auth middleware.
 */
export const me = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return next(new AppError(401, "Unauthorized"));
    res.status(200).json({
      message: "Authenticated user info",
      user: req.user,
    });
  } catch (err) {
    next(err);
  }
};
