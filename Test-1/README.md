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
- `POST /comment/post/:postId/` — Create a comment on a post
- `GET /comment/post/:postId/` — Get all comments for a post
- `GET /comment/:id` — Get a single comment by ID
- `PUT /comment/:id` — Edit a comment (author only)
- `DELETE /comment/:id` — Delete a comment (author or post owner)

## Auth API: Request & Response Format

All auth routes are mounted at `/auth` in the Express app (see `src/app.ts`).

### 1. Register
**POST /auth/register**
- **Request Body:**
  ```json
  {
    "username": "string",
    "email": "string",
    "password": "string"
  }
  ```
- **Response:**
  - `201 Created`
  ```json
  {
    "message": "Successfully registered",
    "user": {
      "id": 1,
      "username": "string",
      "email": "string",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
  ```
- **Error Responses:**
  - `400`, `409` with `{ "message": "..." }`

### 2. Login
**POST /auth/login**
- **Request Body:**
  ```json
  {
    "username": "string", // or "email": "string"
    "password": "string"
  }
  ```
- **Response:**
  - `200 OK` (Sets `accessToken` and `refreshToken` as HTTP-only cookies)
  ```json
  {
    "message": "User successfully logged in",
    "user": {
      "id": 1,
      "username": "string",
      "email": "string",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
  ```
- **Error Responses:**
  - `400`, `401` with `{ "message": "..." }`

### 3. Logout
**POST /auth/logout**
- **Request:**
  - No body required. Requires valid `accessToken` or `refreshToken` cookie.
- **Response:**
  - `200 OK`
  ```json
  { "message": "Successfully logged out" }
  ```
- **Error Responses:**
  - `401` with `{ "message": "No active session found" }` or `{ "message": "Invalid or expired session" }`

### 4. Refresh Token
**POST /auth/refresh**
- **Request:**
  - No body required. Requires valid `refreshToken` cookie.
- **Response:**
  - `200 OK` (Sets new `accessToken` as HTTP-only cookie)
  ```json
  {
    "message": "Access token successfully generated",
    "user": {
      "id": 1,
      "username": "string",
      "email": "string",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
  ```
- **Error Responses:**
  - `401`, `403` with `{ "message": "..." }`

---

## User API: Request & Response Format

All user routes are mounted at `/user` in the Express app (see `src/app.ts`). All endpoints require authentication (JWT in HTTP-only cookie).

### 1. Create User
**POST /user/**
- **Request Body:**
  ```json
  {
    "username": "string",
    "email": "string",
    "password": "string"
  }
  ```
- **Response:**
  - `201 Created`
  ```json
  {
    "id": 1,
    "username": "string",
    "email": "string",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
  ```
- **Error Responses:**
  - `400`, `409` with `{ "message": "..." }`

### 2. Get All Users
**GET /user/**
- **Response:**
  - `200 OK`
  ```json
  [
    {
      "id": 1,
      "username": "string",
      "email": "string",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    // ...
  ]
  ```

### 3. Get User by ID
**GET /user/:id**
- **Response:**
  - `200 OK`
  ```json
  {
    "id": 1,
    "username": "string",
    "email": "string",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
  ```
- **Error Responses:**
  - `404` with `{ "message": "User not found" }`

### 4. Update User (Self Only)
**PUT /user/:id**
- **Request Body:** (any or all fields)
  ```json
  {
    "username": "string",
    "email": "string",
    "password": "string"
  }
  ```
- **Response:**
  - `200 OK`
  ```json
  {
    "id": 1,
    "username": "string",
    "email": "string",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
  ```
- **Error Responses:**
  - `403` with `{ "message": "Forbidden" }`
  - `404` with `{ "message": "User not found" }`

### 5. Delete User (Self Only)
**DELETE /user/:id**
- **Response:**
  - `204 No Content`
- **Error Responses:**
  - `403` with `{ "message": "Forbidden" }`
  - `404` with `{ "message": "User not found" }`

### 6. Get User Wall (All Posts by User)
**GET /user/:id/wall**
- **Response:**
  - `200 OK`
  ```json
  [
    {
      "id": 1,
      "content": "string",
      "userId": 1,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "author": { "id": 1, "username": "string", "email": "string" },
      "comments": [ /* ... */ ],
      "likedBy": [ /* ... */ ],
      "dislikedBy": [ /* ... */ ]
    },
    // ...
  ]
  ```
- **Error Responses:**
  - `404` with `{ "message": "User not found" }`

### 7. Follow User
**POST /user/:id/follow**
- **Response:**
  - `200 OK`
  ```json
  { "message": "User followed" }
  ```
- **Error Responses:**
  - `400` with `{ "message": "Cannot follow yourself" }`
  - `401` with `{ "message": "Unauthorized" }`
  - `404` with `{ "message": "User not found" }`

### 8. Unfollow User
**POST /user/:id/unfollow**
- **Response:**
  - `200 OK`
  ```json
  { "message": "User unfollowed" }
  ```
- **Error Responses:**
  - `400` with `{ "message": "Cannot unfollow yourself" }`
  - `401` with `{ "message": "Unauthorized" }`
  - `404` with `{ "message": "User not found" }`

---

## Post API: Request & Response Format

All post routes are mounted at `/post` in the Express app (see `src/app.ts`). All endpoints require authentication (JWT in HTTP-only cookie).

### 1. Create Post
**POST /post/**
- **Request Body:**
  ```json
  {
    "content": "string"
  }
  ```
- **Response:**
  - `201 Created`
  ```json
  {
    "id": 1,
    "content": "string",
    "userId": 1,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "author": { "id": 1, "username": "string", "email": "string" },
    "comments": [ /* ... */ ],
    "likedBy": [ /* ... */ ],
    "dislikedBy": [ /* ... */ ]
  }
  ```
- **Error Responses:**
  - `401` with `{ "message": "Unauthorized" }`

### 2. Get All Posts (Feed)
**GET /post/**
- **Response:**
  - `200 OK`
  ```json
  [
    {
      "id": 1,
      "content": "string",
      "userId": 1,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "author": { "id": 1, "username": "string", "email": "string" },
      "comments": [ /* ... */ ],
      "likedBy": [ /* ... */ ],
      "dislikedBy": [ /* ... */ ]
    },
    // ...
  ]
  ```

### 3. Get Post by ID
**GET /post/:id**
- **Response:**
  - `200 OK`
  ```json
  {
    "id": 1,
    "content": "string",
    "userId": 1,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "author": { "id": 1, "username": "string", "email": "string" },
    "comments": [ /* ... */ ],
    "likedBy": [ /* ... */ ],
    "dislikedBy": [ /* ... */ ]
  }
  ```
- **Error Responses:**
  - `404` with `{ "message": "Post not found" }`

### 4. Update Post (Author Only)
**PUT /post/:id**
- **Request Body:**
  ```json
  {
    "content": "string"
  }
  ```
- **Response:**
  - `200 OK`
  ```json
  {
    "id": 1,
    "content": "string",
    "userId": 1,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "author": { "id": 1, "username": "string", "email": "string" },
    "comments": [ /* ... */ ],
    "likedBy": [ /* ... */ ],
    "dislikedBy": [ /* ... */ ]
  }
  ```
- **Error Responses:**
  - `403` with `{ "message": "Forbidden" }`
  - `404` with `{ "message": "Post not found" }`

### 5. Delete Post (Author Only)
**DELETE /post/:id**
- **Response:**
  - `204 No Content`
- **Error Responses:**
  - `403` with `{ "message": "Forbidden" }`
  - `404` with `{ "message": "Post not found" }`

### 6. Like Post
**POST /post/:id/like**
- **Response:**
  - `200 OK`
  ```json
  { "message": "Post liked" }
  ```
- **Error Responses:**
  - `401` with `{ "message": "Unauthorized" }`
  - `404` with `{ "message": "Post not found" }` or `{ "message": "User not found" }`

### 7. Unlike Post
**POST /post/:id/unlike**
- **Response:**
  - `200 OK`
  ```json
  { "message": "Like removed" }
  ```
- **Error Responses:**
  - `401` with `{ "message": "Unauthorized" }`
  - `404` with `{ "message": "Post not found" }` or `{ "message": "User not found" }`

### 8. Dislike Post
**POST /post/:id/dislike**
- **Response:**
  - `200 OK`
  ```json
  { "message": "Post disliked" }
  ```
- **Error Responses:**
  - `401` with `{ "message": "Unauthorized" }`
  - `404` with `{ "message": "Post not found" }` or `{ "message": "User not found" }`

### 9. Remove Dislike (Undislike)
**POST /post/:id/undislike**
- **Response:**
  - `200 OK`
  ```json
  { "message": "Dislike removed" }
  ```
- **Error Responses:**
  - `401` with `{ "message": "Unauthorized" }`
  - `404` with `{ "message": "Post not found" }` or `{ "message": "User not found" }`

---

## Comments
- `POST /comment/post/:postId/` — Create a comment on a post
- `GET /comment/post/:postId/` — Get all comments for a post
- `GET /comment/:id` — Get a single comment by ID
- `PUT /comment/:id` — Edit a comment (author only)
- `DELETE /comment/:id` — Delete a comment (author or post owner)

## Comments API: Request & Response Format

All comment routes are mounted at `/comment` in the Express app (see `src/app.ts`). All endpoints require authentication (JWT in HTTP-only cookie).

### 1. Create Comment on Post
**POST /comment/post/:postId/**
- **Request Body:**
  ```json
  {
    "content": "string"
  }
  ```
- **Response:**
  - `201 Created`
  ```json
  {
    "id": 1,
    "content": "string",
    "postId": 1,
    "userId": 1,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
  ```
- **Error Responses:**
  - `401` with `{ "message": "Unauthorized" }`
  - `404` with `{ "message": "Post not found" }` or `{ "message": "User not found" }`

### 2. Get All Comments for a Post
**GET /comment/post/:postId/**
- **Response:**
  - `200 OK`
  ```json
  [
    {
      "id": 1,
      "content": "string",
      "postId": 1,
      "userId": 1,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "author": { "id": 1, "username": "string", "email": "string" }
    },
    // ...
  ]
  ```

### 3. Get Comment by ID
**GET /comment/:id**
- **Response:**
  - `200 OK`
  ```json
  {
    "id": 1,
    "content": "string",
    "postId": 1,
    "userId": 1,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "author": { "id": 1, "username": "string", "email": "string" }
  }
  ```
- **Error Responses:**
  - `404` with `{ "message": "Comment not found" }`

### 4. Update Comment (Author Only)
**PUT /comment/:id**
- **Request Body:**
  ```json
  {
    "content": "string"
  }
  ```
- **Response:**
  - `200 OK`
  ```json
  {
    "id": 1,
    "content": "string",
    "postId": 1,
    "userId": 1,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
  ```
- **Error Responses:**
  - `403` with `{ "message": "Forbidden" }`
  - `404` with `{ "message": "Comment not found" }`

### 5. Delete Comment (Author or Post Owner)
**DELETE /comment/:id**
- **Response:**
  - `204 No Content`
- **Error Responses:**
  - `403` with `{ "message": "Forbidden" }`
  - `404` with `{ "message": "Comment not found" }`

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