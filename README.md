# Lead Management Platform

A full-stack Lead Management Platform built with a React + Vite frontend and a Node.js + Express + MongoDB backend.

## Project Structure

- `frontend/` – existing React application
- `backend/` – Express + MongoDB API

## Tech Stack

### Frontend
- React
- React Router
- Tailwind CSS
- Axios

### Backend
- Node.js
- Express
- MongoDB
- Mongoose
- JWT
- bcryptjs
- express-validator

## Features

### Public
- Public lead capture form
- Lead persistence in MongoDB

### Authentication
- JWT login
- Admin and member roles

### Admin
- View all leads
- Assign leads
- Change lead status
- Create / delete members
- View activity timeline
- Add notes

### Member
- View assigned leads only
- Update lead status
- Add notes

## Environment Variables

Copy `backend/.env.example` to `backend/.env` and fill in real values. Do **not** commit `backend/.env` — it is ignored by `.gitignore`.

Example `backend/.env` contents:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/lead-management-platform
JWT_SECRET=supersecretjwtkey
CLIENT_URL=http://localhost:5173
```

## Setup

### 1. Frontend

```bash
cd frontend
npm install
npm run dev
```

### 2. Backend

```bash
cd backend
npm install
npm run dev
```

## API Documentation

Base URL: `http://localhost:5000/api`

### Authentication
- `POST /api/auth/login`
  - Body: `{ email, password }`

### Leads
- `POST /api/leads/public`
  - Public form submission
- `GET /api/leads`
  - Pagination, search, filtering
- `GET /api/leads/:id`
- `PUT /api/leads/:id`
- `POST /api/leads/:id/notes`
- `PATCH /api/leads/:id/assign`

### Users
- `GET /api/users`
- `POST /api/users`
- `DELETE /api/users/:id`

## Testing

```bash
cd backend
npm test
```

## Deployment

1. Provision MongoDB Atlas or another managed MongoDB service.
2. Set the production environment variables in your hosting service.
3. Deploy the backend to a Node.js-compatible host.
4. Build and deploy the frontend with Vite.
5. Point `VITE_API_URL` at the deployed backend.

## Footer

Every page includes the following footer:

Built for Digital Heroes Training Task
https://digitalheroesco.com

## Data Model

- `User`:
  - `name` (string)
  - `email` (string, unique)
  - `password` (hashed string)
  - `role` (enum: `admin` | `member`)

- `Lead`:
  - `name`, `email`, `phone`, `company`, `source`, `message`
  - `status` (string, e.g. `New`, `Contacted`, `Qualified`, ...)
  - `assignedTo` (ref -> `User`)
  - `activity` (array of events: actor, action, details, createdAt)

## Auth approach

- The backend uses JWTs for authentication. Tokens are issued at `/api/auth/login` and set as an `httpOnly` cookie (`lm-token`) to protect against XSS. The frontend sends credentials with requests via `withCredentials: true` and stores only the current user's profile in `localStorage` for UI state. Protected API routes read the JWT from the cookie (or `Authorization` header as fallback) and verify it using the `JWT_SECRET` environment variable.

## Important notes

- `JWT_SECRET` is required in production; the server will exit if it's not set.
- For deployment, set `CLIENT_URL` and `JWT_SECRET` in your hosting provider's env vars and configure the frontend `VITE_API_URL` to point to the deployed backend.
