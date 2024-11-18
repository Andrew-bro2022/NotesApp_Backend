# Notes API

A secure and scalable RESTful API that allows users to create, read, update, and delete notes. The application also supports note sharing between users and searching notes based on keywords.

## Features

- User authentication using JWT
- CRUD operations for notes
- Note sharing functionality
- Text-based search with MongoDB text indexing
- Rate limiting for API endpoints
- Unit and integration tests

## Technical Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Jest for testing

## Prerequisites

- Node.js (v14 or higher)
- MongoDB installed and running locally
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd notes-app
```

2. Install dependencies:
```bash
npm install
```

3. Create a .env file in the root directory with the following variables:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/notes_app
JWT_SECRET=your_jwt_secret_key_here
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Running the Application

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

Run tests:
```bash
npm test
```

## API Endpoints

### Authentication Endpoints

- `POST /api/auth/signup`: Create a new user account
  - Body: { username, email, password }

- `POST /api/auth/login`: Login to existing account
  - Body: { email, password }

### Note Endpoints (Requires Authentication)

- `GET /api/notes`: Get all notes for authenticated user
- `GET /api/notes/:id`: Get a specific note by ID
- `POST /api/notes`: Create a new note
  - Body: { title, content, tags }
- `PUT /api/notes/:id`: Update an existing note
  - Body: { title, content, tags }
- `DELETE /api/notes/:id`: Delete a note
- `POST /api/notes/:id/share`: Share a note with another user
  - Body: { username }
- `GET /api/notes/search?q=:query`: Search notes based on keywords

## Authentication

All note endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your_token_here>
```

## Rate Limiting

The API implements rate limiting to prevent abuse:
- 100 requests per 15-minute window per IP address

## Testing

The project includes both unit and integration tests. Run the test suite:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

## Error Handling

The API returns appropriate HTTP status codes and error messages:

- 200: Success
- 201: Resource created
- 400: Bad request
- 401: Unauthorized
- 403: Forbidden
- 404: Resource not found
- 429: Too many requests
- 500: Internal server error

## Security Features

- Password hashing using bcrypt
- JWT-based authentication
- Rate limiting
- MongoDB injection protection
- CORS enabled

## Technical Choices and Implementation Details

### Framework Choice: Express.js
- Express.js was chosen for its minimalist approach and flexibility
- Large ecosystem of middleware
- Excellent performance characteristics
- Easy to scale horizontally
- Great community support and documentation
- Simple routing system and middleware pipeline

### Database Choice: MongoDB
- MongoDB was selected for its:
  - Flexible schema design that works well with note-taking applications
  - Built-in text search capabilities
  - Horizontal scaling capabilities
  - Rich query language
  - Strong performance for read-heavy applications
  - Native support for JSON-like documents

### Third-Party Tools and Libraries
1. **bcryptjs**
   - Chosen for secure password hashing
   - Pure JavaScript implementation (no native dependencies)
   - Well-maintained and secure

2. **jsonwebtoken**
   - Industry standard for handling JWTs
   - Comprehensive feature set
   - Active maintenance and security updates

3. **express-rate-limit**
   - Simple and effective rate limiting
   - Easy to configure and customize
   - Minimal performance overhead

4. **mongoose**
   - Robust ODM for MongoDB
   - Schema validation
   - Middleware support
   - Rich query API

5. **jest & supertest**
   - Complete testing solution
   - Great assertion library
   - Excellent mocking capabilities
   - Active community and support

## Local Development Setup

1. **Database Setup**
```bash
# Start MongoDB locally
mongod --dbpath /path/to/data/directory

# Or using Docker
docker run -d -p 27017:27017 --name notes-mongo mongo:latest
```

2. **Environment Setup**
```bash
# Copy example env file
cp .env.example .env

# Edit .env file with your settings
nano .env
```

3. **Install Dependencies**
```bash
# Install all dependencies including dev dependencies
npm install

# If you only need production dependencies
npm install --production
```

4. **Database Initialization**
```bash
# Run database migrations (if any)
npm run db:setup
```

## Testing Environment Setup

1. **Test Database**
```bash
# The test suite will automatically use a separate test database
# (notes_app_test) as configured in the test files
```

2. **Running Tests**
```bash
# Run all tests
npm test

# Run tests with coverage report
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- src/tests/auth.test.js
```

3. **Test Environment Variables**
```bash
# Create a separate .env.test file for test environment
cp .env.example .env.test
```

The test suite uses an isolated database to prevent interference with development data. Tests will automatically clean up after themselves, ensuring a fresh state for each test run
