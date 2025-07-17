// User routes for CRUD operations and follow/unfollow functionality
import express from "express";
import {
  createUser,    // Create a new user
  getAllUsers,   // Get all users
  getUserById,   // Get a user by ID
  updateUser,    // Update a user (self only)
  deleteUser,    // Delete a user (self only)
  followUser,    // Follow another user
  unfollowUser,  // Unfollow another user
  getWall,       // Get all posts by a user (user's wall)
} from "../controllers/user.controller";

const userRouter = express.Router();

// Create a new user
userRouter.post("/", createUser);
// Get all users
userRouter.get("/", getAllUsers);
// Get a user by ID
userRouter.get("/:id", getUserById);
// Update a user (self only)
userRouter.put("/:id", updateUser);
// Delete a user (self only)
userRouter.delete("/:id", deleteUser);
// Get all posts by a user (user's wall)
userRouter.get("/:id/wall", getWall);
// Follow another user
userRouter.post("/:id/follow", followUser);
// Unfollow another user
userRouter.post("/:id/unfollow", unfollowUser);

export default userRouter; 