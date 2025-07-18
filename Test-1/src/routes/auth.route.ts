// Auth routes for registration, login, logout, and token refresh
import express from "express";

// Import authentication controllers
import { register, login, logout, refresh, me } from '../controllers/auth.controller';
import { authMiddleware } from "../middlewares/auth.middleware";

const authRouter = express.Router();

// Register a new user
authRouter.post("/register", register);
// Login and receive tokens
authRouter.post("/login", login);
// Logout and clear tokens
authRouter.post("/logout", logout);
// Refresh access token using refresh token
authRouter.post("/refresh", refresh);
// Get current authenticated user
authRouter.get("/me", authMiddleware, me);

export default authRouter;
