// Comment routes for CRUD operations on comments under posts
import express from "express";
import {
  createComment,           // Create a comment on a post
  getAllCommentsForPost,   // Get all comments for a post
  getCommentById,          // Get a single comment by ID
  updateComment,           // Edit a comment (author only)
  deleteComment,           // Delete a comment (author or post owner)
} from "../controllers/comment.controller";

const commentRouter = express.Router();

// Create a comment on a post
commentRouter.post("/posts/:postId/comments", createComment);
// Get all comments for a post
commentRouter.get("/posts/:postId/comments", getAllCommentsForPost);
// Get a single comment by ID
commentRouter.get("/comments/:id", getCommentById);
// Edit a comment (author only)
commentRouter.put("/comments/:id", updateComment);
// Delete a comment (author or post owner)
commentRouter.delete("/comments/:id", deleteComment);

export default commentRouter; 