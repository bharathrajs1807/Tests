# Social Networking Service (SNS) Backend

A robust, secure, and fully-commented Node.js/Express backend for a social networking service (SNS) with Sequelize ORM and PostgreSQL. This backend supports user authentication, posts, comments, likes/dislikes, following, and more.

---

## Features
- **User Authentication**: Register, login, logout, JWT-based sessions, refresh tokens, password hashing.
- **User Management**: CRUD, follow/unfollow, user wall (posts by user).
- **Posts**: CRUD, like/unlike, dislike/undislike, feed (all posts).
- **Comments**: CRUD on post comments, with author and post owner permissions.
- **Social Interactions**: Like/dislike posts, follow/unfollow users.
- **Security**: Rate limiting, helmet, CORS, HTTP-only cookies, centralized error handling.
- **Logging**: Request and error logging to files.
- **Comprehensive Comments**: All files and functions are documented.

---

## Project Structure

```
src/
  app.ts                # Express app setup, middleware, routes
  index.ts              # Entry point, DB init, server start
  models/               # Sequelize models (User, Post, Comment, associations)
  controllers/          # Business logic for users, posts, comments, auth
  routes/               # Express routers for each resource
  middlewares/          # Auth, error, and request logging middleware
  migrations/           # Sequelize migration files (tables, join tables)
  config/               # Database config (Sequelize instance)
  utils/                # Utility functions (AppError, JWT token generation)
  logs/                 # Request and error logs
```

---

## Setup & Installation

1. **Clone the repository**
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Configure environment variables**
   - Create a `.env` file in the root directory with the following variables:
     ```env
     PORT=3000
     DB_NAME=your_db_name
     DB_USER=your_db_user
     PASS=your_db_password
     DB_HOST=localhost
     DB_PORT=5432
     ACCESS_TOKEN_SECRET_KEY=your_access_secret
     REFRESH_TOKEN_SECRET_KEY=your_refresh_secret
     NODE_ENV=development
     ```
4. **Run migrations** (using Sequelize CLI or programmatically)
5. **Start the server**
   ```bash
   npm run dev   # For development (with nodemon)
   npm start     # For production
   ```

---

## Scripts
- `npm run dev`   — Start in development mode (with hot reload)
- `npm start`     — Start in production mode

---

## Data Models

### User
- `id`, `username`, `email`, `password`, `refreshToken`, `createdAt`, `updatedAt`
- Associations: posts, comments, followers, following, likedPosts, dislikedPosts

### Post
- `id`, `content`, `userId`, `createdAt`, `updatedAt`
- Associations: author, comments, likedBy, dislikedBy

### Comment
- `id`, `content`, `postId`, `userId`, `createdAt`, `updatedAt`
- Associations: post, author

### Join Tables
- `Follows` (followerId, followingId)
- `PostLikes` (userId, postId)
- `PostDislikes` (userId, postId)

---

## API Endpoints

### Auth
- `POST /auth/register` — Register a new user
- `POST /auth/login` — Login and receive tokens
- `POST /auth/logout` — Logout and clear tokens
- `POST /auth/refresh` — Refresh access token

### Users
- `POST /user/` — Create a new user
- `GET /user/` — Get all users
- `GET /user/:id` — Get a user by ID
- `PUT /user/:id` — Update a user (self only)
- `DELETE /user/:id` — Delete a user (self only)
- `GET /user/:id/wall` — Get all posts by a user
- `POST /user/:id/follow` — Follow another user
- `POST /user/:id/unfollow` — Unfollow another user

### Posts
- `POST /post/` — Create a new post
- `GET /post/` — Get all posts (feed)
- `GET /post/:id` — Get a single post by ID
- `PUT /post/:id` — Edit a post (author only)
- `DELETE /post/:id` — Delete a post (author only)
- `POST /post/:id/like` — Like a post
- `POST /post/:id/unlike` — Unlike a post
- `POST /post/:id/dislike` — Dislike a post
- `POST /post/:id/undislike` — Remove dislike from a post

### Comments
- `POST /comment/posts/:postId/comments` — Create a comment on a post
- `GET /comment/posts/:postId/comments` — Get all comments for a post
- `GET /comment/comments/:id` — Get a single comment by ID
- `PUT /comment/comments/:id` — Edit a comment (author only)
- `DELETE /comment/comments/:id` — Delete a comment (author or post owner)

---

## Middleware
- **authMiddleware**: Protects routes, verifies JWT, attaches user to request.
- **errorLogger**: Logs errors to file and console.
- **errorResponder**: Sends consistent error responses.
- **requestLogger**: Logs all incoming requests.
- **rateLimit, helmet, cors, cookieParser**: Security and request handling.

---

## Error Handling
- Uses a custom `AppError` class for all operational errors.
- Centralized error logging and response middleware.
- All errors are returned in a consistent JSON format.

---

## Best Practices
- Passwords are hashed with bcrypt before storage.
- JWT tokens are stored in HTTP-only cookies.
- All endpoints are protected by authentication and authorization checks.
- All code is fully commented and follows RESTful conventions.
- Request and error logs are written to the `logs/` directory.

---

## Development & Contribution
- TypeScript strict mode is enabled.
- All models, controllers, and routes are modular and documented.
- Add new features by creating new models, controllers, and routes as needed.

---

## License
ISC 