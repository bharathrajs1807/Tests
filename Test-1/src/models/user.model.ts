/**
 * User model definition.
 * Represents a user in the SNS, including authentication, profile, and social relationships.
 */
import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  BelongsToManyGetAssociationsMixin,
  BelongsToManyAddAssociationMixin,
  BelongsToManyRemoveAssociationMixin,
  HasManyGetAssociationsMixin,
  HasManyAddAssociationMixin,
  HasManyRemoveAssociationMixin,
} from "sequelize";
import bcrypt from "bcryptjs";

import sequelize from "../config/database";
import { Post } from "./post.model";

/**
 * Helper to check if a password is already hashed.
 */
function isHashed(password: string): boolean {
  return /^\$2[aby]\$/.test(password);
}

/**
 * User model class.
 * Includes fields, association mixins, and password comparison logic.
 */
export class User extends Model<
  InferAttributes<User>,
  InferCreationAttributes<User>
> {
  // --- Fields ---
  declare id?: number;
  declare username: string;
  declare email: string;
  declare password: string;
  declare refreshToken: string | null;
  declare readonly createdAt?: Date;
  declare readonly updatedAt?: Date;

  // --- Association Mixins ---
  // Followers/following (self-referential many-to-many)
  declare getFollowers: BelongsToManyGetAssociationsMixin<User>;
  declare addFollower: BelongsToManyAddAssociationMixin<User, number>;
  declare removeFollower: BelongsToManyRemoveAssociationMixin<User, number>;
  declare getFollowing: BelongsToManyGetAssociationsMixin<User>;
  declare addFollowing: BelongsToManyAddAssociationMixin<User, number>;
  declare removeFollowing: BelongsToManyRemoveAssociationMixin<User, number>;
  // Posts (one-to-many)
  declare getPosts: HasManyGetAssociationsMixin<Post>;
  declare addPost: HasManyAddAssociationMixin<Post, number>;
  declare removePost: HasManyRemoveAssociationMixin<Post, number>;

  /**
   * Remove sensitive fields from the returned user object.
   */
  public toJSON(): object {
    const values = { ...this.get() } as Partial<User>;
    delete values.password;
    delete values.refreshToken;
    return values;
  }

  /**
   * Compare a plaintext password to the hashed password.
   */
  public async comparePassword(password: string): Promise<boolean> {
    if (!this.password) {
      throw new Error("Stored password is undefined");
    }
    return await bcrypt.compare(password, this.password);
  }
}

User.init(
  {
    // --- Field Definitions ---
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: [8, 100],
      },
    },
    refreshToken: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "users",
    timestamps: true,
    indexes: [{ fields: ["email"] }, { fields: ["username"] }],
    defaultScope: {
      attributes: { exclude: ["password", "refreshToken"] },
    },
    scopes: {
      withSensitive: {
        attributes: { include: ["password", "refreshToken"] },
      },
    },
    // --- Hooks ---
    hooks: {
      beforeSave: async (user: User) => {
        // Hash password if it has changed and is not already hashed
        if (user.changed("password") && !isHashed(user.password)) {
          user.password = await bcrypt.hash(user.password, 12);
        }
      },
      beforeValidate: (user: User) => {
        // Normalize email to lowercase
        if (user.email) {
          user.email = user.email.toLowerCase();
        }
      },
    },
  }
);
