/**
 * Main Express application setup.
 * Configures middleware, routes, and error handling for the SNS backend.
 */
import express, { Request, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";

// Import routers for different resource domains
import authRouter from "./routes/auth.route";
import userRouter from "./routes/user.route";
import postRouter from "./routes/post.route";
import commentRouter from "./routes/comment.route";

// Import custom middleware
import { requestLogger } from "./middlewares/requestLogger.middleware";
import { errorLogger } from "./middlewares/errorLogger.middleware";
import { errorResponder } from "./middlewares/errorResponder";
import { authMiddleware } from "./middlewares/auth.middleware";

const app = express();

// --- Global Middleware ---
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(helmet()); // Security headers
app.use(
  cors({
    origin: "http://localhost:5174",
    credentials: true,
  })
); // Enable CORS
app.use(
  rateLimit({
    // Rate limiting to prevent abuse
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Rate Limit Exceeded",
  })
);
app.use(cookieParser()); // Parse cookies

app.use(requestLogger); // Log all requests

// --- Health Check Endpoint ---
app.use("/health", (req: Request, res: Response) => {
  res.status(200).json({ message: "Healthy" });
});

// --- Main API Routes ---
app.use("/auth", authRouter); // Public auth endpoints
app.use("/user", authMiddleware, userRouter); // User endpoints (protected)
app.use("/post", authMiddleware, postRouter); // Post endpoints (protected)
app.use("/comment", authMiddleware, commentRouter); // Comment endpoints (protected)

// --- Error Handling Middleware ---
app.use(errorLogger); // Log errors
app.use(errorResponder); // Send error responses

export default app;
