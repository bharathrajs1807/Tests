/**
 * Migration for creating the PostLikes join table.
 * This table supports the many-to-many relationship between users and posts for likes.
 */
import { QueryInterface, DataTypes } from "sequelize";

export async function up(queryInterface: QueryInterface): Promise<void> {
  // Create the PostLikes join table with userId and postId as foreign keys
  await queryInterface.createTable("PostLikes", {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    postId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "posts",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  }, {
    uniqueKeys: {
      unique_post_like: {
        fields: ["userId", "postId"],
      },
    },
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  // Drop the PostLikes join table
  await queryInterface.dropTable("PostLikes");
}
