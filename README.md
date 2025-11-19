# Quiz Master Backend

Backend API for Quiz Management System using Node.js, Express, and MongoDB.

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the `server` directory with the following variables:
```
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string_here
FRONTEND_URL=http://localhost:8080
```

3. Replace `your_mongodb_atlas_connection_string_here` with your actual MongoDB Atlas connection string.

4. Start the server:
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will run on `http://localhost:5000` by default.

## API Endpoints

### Quizzes
- `GET /api/quizzes` - Get all published quizzes
- `GET /api/quizzes/all` - Get all quizzes (admin)
- `GET /api/quizzes/:id` - Get quiz by ID
- `GET /api/quizzes/:id/questions` - Get questions for a quiz
- `POST /api/quizzes` - Create a new quiz
- `PUT /api/quizzes/:id` - Update a quiz
- `DELETE /api/quizzes/:id` - Delete a quiz
- `PATCH /api/quizzes/:id/publish` - Toggle publish status
- `POST /api/quizzes/:id/submit` - Submit a quiz

### Submissions
- `GET /api/submissions/:id` - Get submission results by ID

## MongoDB Connection

Make sure your MongoDB Atlas connection string is in the format:
```
mongodb+srv://username:password@cluster.mongodb.net/database_name?retryWrites=true&w=majority
```

