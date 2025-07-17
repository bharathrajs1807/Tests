/**
 * Entry point for the SNS backend service.
 * Loads environment variables, initializes the database, and starts the Express server.
 */
import dotenv from "dotenv";

import app from "./app";
import sequelize from "./config/database";
import { User } from "./models/user.model";
import { Post } from "./models/post.model";
import { Comment } from "./models/comment.model";

dotenv.config();

const PORT = process.env.PORT;

/**
 * Initialize the database connection and start the server.
 */
async function init() {
  try {
    // Authenticate and sync the database
    await sequelize.authenticate();
    console.log("Database connected");
    await sequelize.sync({ alter: true });
    console.log("Models synced");
    // Start the Express server
    app.listen(PORT, (err) => {
      if (err) console.error(err);
      console.log(`The server is running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Unable to start", error);
  }
}

init();
