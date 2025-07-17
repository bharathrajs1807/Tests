/**
 * Post controller for CRUD operations, like/dislike, and post feed.
 * Handles post management and social interactions for the SNS backend.
 */
import { Request, Response, NextFunction } from "express";
import models from "../models";
import { AppError } from "../utils/AppError";
const { Post, User } = models;

/**
 * Create a new post by the authenticated user.
 */
export const createPost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { content } = req.body;
    // Use authenticated user's ID as author
    const userId = req.user?.id;
    if (!userId) return next(new AppError(401, "Unauthorized"));
    const post = await Post.create({ content, userId });
    res.status(201).json(post);
  } catch (err) {
    next(err);
  }
};

/**
 * Get all posts (feed), including author, comments, likes, and dislikes.
 */
export const getAllPosts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const posts = await Post.findAll({
      include: [
        { model: User, as: "author", attributes: ["id", "username", "email"] },
        { association: "comments" },
        { association: "likedBy", attributes: ["id", "username"] },
        { association: "dislikedBy", attributes: ["id", "username"] },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json(posts);
  } catch (err) {
    next(err);
  }
};

/**
 * Get a single post by ID, including author, comments, likes, and dislikes.
 */
export const getPostById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const post = await Post.findByPk(req.params.id, {
      include: [
        { model: User, as: "author", attributes: ["id", "username", "email"] },
        { association: "comments" },
        { association: "likedBy", attributes: ["id", "username"] },
        { association: "dislikedBy", attributes: ["id", "username"] },
      ],
    });
    if (!post) return next(new AppError(404, "Post not found"));
    res.json(post);
  } catch (err) {
    next(err);
  }
};

/**
 * Update a post (author only).
 * Only the post's author can update.
 */
export const updatePost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) return next(new AppError(404, "Post not found"));
    // Authorization: Only the author can update
    if (!req.user || req.user.id !== post.userId) {
      return next(new AppError(403, "Forbidden"));
    }
    post.content = req.body.content ?? post.content;
    await post.save();
    res.json(post);
  } catch (err) {
    next(err);
  }
};

/**
 * Delete a post (author only).
 * Only the post's author can delete.
 */
export const deletePost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) return next(new AppError(404, "Post not found"));
    // Authorization: Only the author can delete
    if (!req.user || req.user.id !== post.userId) {
      return next(new AppError(403, "Forbidden"));
    }
    await post.destroy();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

/**
 * Like a post. Removes dislike if present.
 */
export const likePost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) return next(new AppError(401, "Unauthorized"));
    const post = await Post.findByPk(req.params.id);
    if (!post) return next(new AppError(404, "Post not found"));
    const user = await User.findByPk(userId);
    if (!user) return next(new AppError(404, "User not found"));
    await post.addLikedBy(user);
    await post.removeDislikedBy(user); // Remove dislike if exists
    res.json({ message: "Post liked" });
  } catch (err) {
    next(err);
  }
};

/**
 * Unlike a post (remove like).
 */
export const unlikePost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) return next(new AppError(401, "Unauthorized"));
    const post = await Post.findByPk(req.params.id);
    if (!post) return next(new AppError(404, "Post not found"));
    const user = await User.findByPk(userId);
    if (!user) return next(new AppError(404, "User not found"));
    await post.removeLikedBy(user);
    res.json({ message: "Like removed" });
  } catch (err) {
    next(err);
  }
};

/**
 * Dislike a post. Removes like if present.
 */
export const dislikePost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) return next(new AppError(401, "Unauthorized"));
    const post = await Post.findByPk(req.params.id);
    if (!post) return next(new AppError(404, "Post not found"));
    const user = await User.findByPk(userId);
    if (!user) return next(new AppError(404, "User not found"));
    await post.addDislikedBy(user);
    await post.removeLikedBy(user); // Remove like if exists
    res.json({ message: "Post disliked" });
  } catch (err) {
    next(err);
  }
};

/**
 * Remove dislike from a post (undislike).
 */
export const undislikePost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) return next(new AppError(401, "Unauthorized"));
    const post = await Post.findByPk(req.params.id);
    if (!post) return next(new AppError(404, "Post not found"));
    const user = await User.findByPk(userId);
    if (!user) return next(new AppError(404, "User not found"));
    await post.removeDislikedBy(user);
    res.json({ message: "Dislike removed" });
  } catch (err) {
    next(err);
  }
};
