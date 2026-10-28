# PHRONEO Backend

This backend provides a REST API for the PHRONEO website with MongoDB integration.

## Features

- **Programs CRUD API**: Create, read, update, and delete programs
- **Form Submissions API**: Store registration and contact form submissions
- **Admin Authentication**: JWT-based authentication for admin panel
- **MongoDB Integration**: Persistent data storage

## Setup

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local installation or MongoDB Atlas)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your settings:
```
MONGODB_URI=mongodb://localhost:27017/phroneo
JWT_SECRET=your-secret-key-change-in-production
PORT=5000
FRONTEND_URL=http://localhost:5173
```

3. Seed the database with initial programs:
```bash
node server/seed.js
```

### Running the Server

Development mode (with auto-reload):
```bash
npm run server:dev
```

Production mode:
```bash
npm run server
```

The server will start on `http://localhost:5000`

## API Endpoints

### Health Check
- `GET /api/health` - Check if API is running

### Programs (Public)
- `GET /api/programs` - Get all programs
- `GET /api/programs/:slug` - Get single program by slug
- `POST /api/programs` - Create program (admin only, requires auth)
- `PUT /api/programs/:slug` - Update program (admin only, requires auth)
- `DELETE /api/programs/:slug` - Delete program (admin only, requires auth)

### Submissions
- `POST /api/submissions` - Create new submission (public)
- `GET /api/submissions` - Get all submissions (admin only, requires auth)
- `PATCH /api/submissions/:id/status` - Update submission status (admin only, requires auth)
- `DELETE /api/submissions/:id` - Delete submission (admin only, requires auth)
- `DELETE /api/submissions` - Clear all submissions (admin only, requires auth)

### Authentication
- `POST /api/auth/register` - Register new admin
- `POST /api/auth/login` - Login admin
- `GET /api/auth/verify` - Verify JWT token

## Authentication

Admin routes require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

The token is obtained by logging in via `/api/auth/login` or registering via `/api/auth/register`.

## Frontend Integration

The frontend uses the API via `src/api.js`. Set the API URL in `.env`:
```
VITE_API_URL=http://localhost:5000/api
```

## Database Models

### Program
- slug (string, unique)
- image (string)
- start (string)
- format (object with de/en)
- place (object with de/en)
- title (object with de/en)
- summary (object with de/en)
- description (object with de/en)
- outcomes (object with de/en arrays)

### Submission
- id (string, unique)
- timestamp (date)
- kind (enum: 'register', 'contact')
- name (string)
- email (string)
- age (number, optional)
- program (string, optional)
- interest (string, optional)
- message (string, optional)
- status (enum: 'new', 'contacted', 'done')

### Admin
- email (string, unique)
- password (hashed)

## Development Notes

- The frontend has a fallback to the JSON file if the API is unavailable
- LocalStorage is no longer used for data persistence (replaced by MongoDB)
- Admin authentication is now server-side with JWT tokens
- Image uploads are stored as base64 data URLs in the database
