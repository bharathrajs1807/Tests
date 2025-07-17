/**
 * Post model definition.
 * Represents a post in the SNS, including content, author, comments, and social interactions (likes/dislikes).
 */
import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  BelongsToManyAddAssociationMixin,
  BelongsToManyRemoveAssociationMixin,
  BelongsToManyGetAssociationsMixin,
} from "sequelize";

import sequelize from "../config/database";
import { User } from "./user.model";
import { Comment } from "./comment.model";

/**
 * Post model class.
 * Includes fields, association mixins, and social interaction helpers.
 */
export class Post extends Model<
  InferAttributes<Post>,
  InferCreationAttributes<Post>
> {
    // --- Fields ---
    declare id?: number;
    declare content: string;
    declare userId: number;
    declare comments?: Comment[];

    // --- Association Mixins ---
    // For likes
    declare addLikedBy: BelongsToManyAddAssociationMixin<User, number>;
    declare removeLikedBy: BelongsToManyRemoveAssociationMixin<User, number>;
    declare getLikedBy: BelongsToManyGetAssociationsMixin<User>;
    // For dislikes
    declare addDislikedBy: BelongsToManyAddAssociationMixin<User, number>;
    declare removeDislikedBy: BelongsToManyRemoveAssociationMixin<User, number>;
    declare getDislikedBy: BelongsToManyGetAssociationsMixin<User>;
}

Post.init(
  {
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
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
  },
  {
    sequelize,
    modelName: "Post",
    tableName: "posts",
    timestamps: true,
  }
);

