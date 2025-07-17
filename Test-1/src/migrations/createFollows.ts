/**
 * Migration for creating the Follows join table.
 * This table supports the self-referential many-to-many relationship for user followers/following.
 */
import { QueryInterface, DataTypes } from "sequelize";

export async function up(queryInterface: QueryInterface): Promise<void> {
  // Create the Follows join table with followerId and followingId as foreign keys
  await queryInterface.createTable(
    "Follows",
    {
      followerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      followingId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
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
    },
    {
      uniqueKeys: {
        unique_follows: {
          fields: ["followerId", "followingId"],
        },
      },
    }
  );
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  // Drop the Follows join table
  await queryInterface.dropTable("Follows");
}
