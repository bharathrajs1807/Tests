// Post routes for CRUD operations and like/dislike functionality
import express from "express";
import {
  createPost,      // Create a new post
  getAllPosts,     // Get all posts (feed)
  getPostById,     // Get a single post by ID
  updatePost,      // Edit a post (author only)
  deletePost,      // Delete a post (author only)
  likePost,        // Like a post
  unlikePost,      // Unlike a post
  dislikePost,     // Dislike a post
  undislikePost,   // Remove dislike from a post
} from "../controllers/post.controller";

const postRouter = express.Router();

// Create a new post
postRouter.post("/", createPost);
// Get all posts (feed)
postRouter.get("/", getAllPosts);
// Get a single post by ID
postRouter.get("/:id", getPostById);
// Edit a post (author only)
postRouter.put("/:id", updatePost);
// Delete a post (author only)
postRouter.delete("/:id", deletePost);
// Like a post
postRouter.post("/:id/like", likePost);
// Unlike a post
postRouter.post("/:id/unlike", unlikePost);
// Dislike a post
postRouter.post("/:id/dislike", dislikePost);
// Remove dislike from a post
postRouter.post("/:id/undislike", undislikePost);

export default postRouter;
