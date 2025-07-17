/**
 * Comment controller for CRUD operations on comments under posts.
 * Handles comment creation, retrieval, update, and deletion with proper authorization.
 */
import { Request, Response, NextFunction } from "express";
import models from "../models";
import { AppError } from "../utils/AppError";
const { Comment, Post, User } = models;

/**
 * Create a comment on a post by the authenticated user.
 * Requires authentication and a valid post.
 */
export const createComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return next(new AppError(401, "Unauthorized"));
    const userId = req.user.id;
    const { content } = req.body;
    const postId = Number(req.params.postId);
    // Ensure the post exists
    const post = await Post.findByPk(postId);
    if (!post) return next(new AppError(404, "Post not found"));
    const comment = await Comment.create({ content, postId, userId });
    res.status(201).json(comment);
  } catch (err) { next(err); }
};

/**
 * Get all comments for a given post.
 */
export const getAllCommentsForPost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const postId = Number(req.params.postId);
    const comments = await Comment.findAll({ where: { postId } });
    res.json(comments);
  } catch (err) { next(err); }
};

/**
 * Get a single comment by ID.
 */
export const getCommentById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const comment = await Comment.findByPk(req.params.id);
    if (!comment) return next(new AppError(404, "Comment not found"));
    res.json(comment);
  } catch (err) { next(err); }
};

/**
 * Update a comment (author only).
 * Only the comment's author can update.
 */
export const updateComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return next(new AppError(401, "Unauthorized"));
    const comment = await Comment.findByPk(req.params.id);
    if (!comment) return next(new AppError(404, "Comment not found"));
    // Authorization: Only the comment's author can update
    if (comment.userId !== req.user.id) return next(new AppError(403, "Forbidden"));
    comment.content = req.body.content ?? comment.content;
    await comment.save();
    res.json(comment);
  } catch (err) { next(err); }
};

/**
 * Delete a comment (author or post owner only).
 * Only the comment's author or the post's author can delete.
 */
export const deleteComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return next(new AppError(401, "Unauthorized"));
    const comment = await Comment.findByPk(req.params.id);
    if (!comment) return next(new AppError(404, "Comment not found"));
    // Fetch the post to check if the user is the post owner
    const post = await Post.findByPk(comment.postId);
    // Authorization: Only the comment's author or the post's author can delete
    if (comment.userId !== req.user.id && post?.userId !== req.user.id) {
      return next(new AppError(403, "Forbidden"));
    }
    await comment.destroy();
    res.status(204).send();
  } catch (err) { next(err); }
}; 