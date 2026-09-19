# SKOVIO Technical Assessment

## Overview

SKOVIO is a full-stack authentication application with registration, email OTP verification, verified-only login, JWT-protected dashboard access, and logout.

## Technology Stack

- Frontend: React, Vite, React Router, Tailwind CSS, Framer Motion, Axios
- Backend: Node.js, Express
- Database: MongoDB with Mongoose
- Authentication: JWT and bcryptjs
- Email: Nodemailer with Gmail SMTP

## Project Structure

- `client/`: React frontend
- `server/`: Express API and MongoDB integration

## Frontend Setup

```powershell
cd client
npm install
```

## Backend Setup

```powershell
cd server
npm install
```

Create `server/.env` with the required values:

```dotenv
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email
EMAIL_PASS=your_email_app_password
```

Never commit `server/.env` or place these values in frontend source code.

## Database Setup

Create a MongoDB database and use its connection string as `MONGO_URI`. The server creates and updates the `User` collection through Mongoose.

## Email Setup

Use a Gmail account with two-step verification enabled and an app password. Put the account address in `EMAIL_USER` and the app password in `EMAIL_PASS`.

## Run the Application

Start the backend:

```powershell
cd server
npm run dev
```

Start the frontend in a second terminal:

```powershell
cd client
npm run dev
```

## Test the Complete Flow

1. Register with a valid name, phone, email, and password.
2. Enter the six-digit OTP received by email.
3. Confirm that verification returns to Login.
4. Log in with the verified account and confirm the Dashboard opens.
5. Test an incorrect OTP, expired OTP, resend cooldown, and invalid credentials.
6. Log out and confirm the protected Dashboard redirects to Login.

For static checks:

```powershell
cd client
npm run lint
npm run build
```

Backend modules can be syntax-checked with Node's `--check` command.
