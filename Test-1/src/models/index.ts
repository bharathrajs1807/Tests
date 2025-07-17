/**
 * Model initialization and association setup.
 * Imports all models, initializes associations, and exports the models object for use throughout the app.
 */
import { User } from "./user.model";
import { Post } from "./post.model";
import { Comment } from "./comment.model";

// Collect all models in a single object for easy access
const models = { User, Post, Comment };

// --- User <-> User (Followers/Following) ---
User.belongsToMany(User, {
  as: "followers",
  through: "Follows",
  foreignKey: "followingId",
  otherKey: "followerId",
});
User.belongsToMany(User, {
  as: "following",
  through: "Follows",
  foreignKey: "followerId",
  otherKey: "followingId",
});

// --- User <-> Post (Author/Posts) ---
User.hasMany(Post, { as: "posts", foreignKey: "userId" });
Post.belongsTo(User, { as: "author", foreignKey: "userId" });

// --- User <-> Comment (Author/Comments) ---
User.hasMany(Comment, { as: "comments", foreignKey: "userId" });
Comment.belongsTo(User, { as: "author", foreignKey: "userId" });

// --- Post <-> Comment ---
Post.hasMany(Comment, { as: "comments", foreignKey: "postId" });
Comment.belongsTo(Post, { foreignKey: "postId" });

// --- Post <-> User (Likes/Dislikes) ---
Post.belongsToMany(User, {
  through: "PostLikes",
  as: "likedBy",
  foreignKey: "postId",
  otherKey: "userId",
});
User.belongsToMany(Post, {
  through: "PostLikes",
  as: "likedPosts",
  foreignKey: "userId",
  otherKey: "postId",
});

Post.belongsToMany(User, {
  through: "PostDislikes",
  as: "dislikedBy",
  foreignKey: "postId",
  otherKey: "userId",
});
User.belongsToMany(Post, {
  through: "PostDislikes",
  as: "dislikedPosts",
  foreignKey: "userId",
  otherKey: "postId",
});

export default models;
