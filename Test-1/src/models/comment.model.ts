/**
 * Comment model definition.
 * Represents a comment on a post in the SNS, including author and post relationships.
 */
import { Model, DataTypes, InferAttributes, InferCreationAttributes, BelongsToGetAssociationMixin, BelongsToSetAssociationMixin } from "sequelize";

import sequelize from "../config/database";
import { Post } from "./post.model";
import { User } from "./user.model";

/**
 * Comment model class.
 * Includes fields and association mixins for post and author relationships.
 */
export class Comment extends Model<InferAttributes<Comment>, InferCreationAttributes<Comment>> {
  // --- Fields ---
  declare id?: number;
  declare content: string;
  declare postId: number;
  declare userId: number;
  declare readonly createdAt?: Date;
  declare readonly updatedAt?: Date;

  // --- Association Mixins ---
  // For post association
  declare getPost: BelongsToGetAssociationMixin<Post>;
  declare setPost: BelongsToSetAssociationMixin<Post, number>;
  // For author (user) association
  declare getAuthor: BelongsToGetAssociationMixin<User>;
  declare setAuthor: BelongsToSetAssociationMixin<User, number>;
}

Comment.init({
  // --- Field Definitions ---
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  postId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  sequelize,
  tableName: "comments",
  timestamps: true,
});
