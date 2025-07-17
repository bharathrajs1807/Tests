/**
 * User controller for CRUD operations, follow/unfollow, and user wall.
 * Handles user management and social features for the SNS backend.
 */
import { Request, Response, NextFunction } from "express";
import models from "../models";
import { AppError } from "../utils/AppError";
const { User } = models;

/**
 * Create a new user.
 * Checks for required fields and uniqueness, then creates the user.
 */
export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return next(new AppError(400, "Username, email, and password are required"));
    }
    const existing = await User.findOne({ where: { email } });
    if (existing) return next(new AppError(409, "Email already exists"));
    const user = await User.create({ username, email, password });
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
};

/**
 * Get all users.
 */
export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (err) {
    next(err);
  }
};

/**
 * Get a user by ID.
 */
export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return next(new AppError(404, "User not found"));
    res.json(user);
  } catch (err) {
    next(err);
  }
};

/**
 * Update a user (self only).
 * Only the user themselves can update their profile.
 */
export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return next(new AppError(404, "User not found"));
    // Authorization: Only the user themselves can update
    if (!req.user || req.user.id !== user.id) return next(new AppError(403, "Forbidden"));
    const { username, email, password } = req.body;
    if (username) user.username = username;
    if (email) user.email = email;
    if (password) user.password = password;
    await user.save();
    res.json(user);
  } catch (err) {
    next(err);
  }
};

/**
 * Delete a user (self only).
 * Only the user themselves can delete their profile.
 */
export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return next(new AppError(404, "User not found"));
    // Authorization: Only the user themselves can delete
    if (!req.user || req.user.id !== user.id) return next(new AppError(403, "Forbidden"));
    await user.destroy();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

/**
 * Get all posts by a user (user's wall).
 */
export const getWall = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: [{
        model: models.Post,
        as: "posts",
        order: [["createdAt", "DESC"]],
        include: [
          { model: models.User, as: "author", attributes: ["id", "username", "email"] },
          { association: "comments" },
          { association: "likedBy", attributes: ["id", "username"] },
          { association: "dislikedBy", attributes: ["id", "username"] },
        ]
      }]
    });
    if (!user) return next(new AppError(404, "User not found"));
    res.json(user.get("posts"));
  } catch (err) {
    next(err);
  }
};

/**
 * Follow another user.
 * Prevents following self and checks both users exist.
 */
export const followUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const followerId = req.user?.id;
    const followingId = req.params.id;
    if (!followerId) return next(new AppError(401, "Unauthorized"));
    if (String(followerId) === String(followingId)) return next(new AppError(400, "Cannot follow yourself"));
    const follower = await User.findByPk(followerId);
    const following = await User.findByPk(followingId);
    if (!follower || !following) return next(new AppError(404, "User not found"));
    await follower.addFollowing(following);
    res.json({ message: "User followed" });
  } catch (err) {
    next(err);
  }
};

/**
 * Unfollow another user.
 * Prevents unfollowing self and checks both users exist.
 */
export const unfollowUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const followerId = req.user?.id;
    const followingId = req.params.id;
    if (!followerId) return next(new AppError(401, "Unauthorized"));
    if (String(followerId) === String(followingId)) return next(new AppError(400, "Cannot unfollow yourself"));
    const follower = await User.findByPk(followerId);
    const following = await User.findByPk(followingId);
    if (!follower || !following) return next(new AppError(404, "User not found"));
    await follower.removeFollowing(following);
    res.json({ message: "User unfollowed" });
  } catch (err) {
    next(err);
  }
}; 