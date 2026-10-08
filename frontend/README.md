# Emergency Response & Ambulance Tracking System

A full-stack web application designed to manage emergency requests, ambulance assignments, driver operations, and ambulance location updates in real time.

## Features

- **Admin Dashboard:** View emergency requests and ambulance assignments.
- **Driver Dashboard:** View assigned emergencies and update assignment status.
- **Emergency Management:** Display emergency type, priority, pickup location, and status.
- **Ambulance Tracking:** Display ambulance locations on an interactive map.
- **Real-Time Communication:** Use WebSockets to transmit ambulance location updates.
- **REST API:** Connect frontend and backend services.
- **Database Integration:** Store emergency requests, ambulance details, users, and assignments in MySQL.
- **Authentication:** Secure API routes using token-based authentication and role-based access control.

## Technology Stack

- **Frontend:** React.js, Vite, JavaScript, CSS
- **Backend:** Node.js, Express.js
- **Database:** MySQL
- **APIs:** REST API
- **Real-Time Communication:** Socket.IO
- **Mapping:** React Leaflet, Leaflet, OpenStreetMap
- **Authentication:** JSON Web Tokens (JWT), bcrypt

## Project Structure

```text
emergency-response-ambulance-tracking-system/
├── src/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── app.js
│   └── server.js
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
├── database/
├── .env
├── .gitignore
└── README.md
```

## Prerequisites

- Node.js and npm
- MySQL Server
- Git

## Setup and Installation

### 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd emergency-response-ambulance-tracking-system
```

### 2. Install backend dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root and configure your MySQL connection, server port, and JWT secret according to your backend configuration.

Never commit your `.env` file or expose passwords and secrets.

### 4. Set up the database

Create the `emergency_response_db` database in MySQL and import or execute the project's database schema and seed data.

### 5. Start the backend

```bash
node src/server.js
```

The backend runs at `http://localhost:5000`.

### 6. Start the frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed by Vite, usually `http://localhost:5173`.

## Main Modules

| Module | Purpose |
|---|---|
| Admin Dashboard | Review emergency requests and assignments |
| Driver Dashboard | View assignments and update their status |
| Live Tracking | Visualize ambulance location updates on a map |
| Backend API | Process requests and enforce access control |
| MySQL Database | Persist application data |

## Current Limitations

- Location updates currently use demonstration coordinates, not verified live GPS hardware data.
- Actual deployment requires production environment configuration, secure secrets, and appropriate access controls.

## Future Enhancements

- Integrate GPS hardware or mobile-device location services.
- Calculate optimal ambulance routes and estimated arrival times.
- Add hospital dashboards and emergency notifications.
- Deploy the application to a cloud platform.
- Add automated testing, monitoring, and CI/CD.

## Author

Developed as a full-stack software engineering project using React.js, Node.js, Express.js, MySQL, REST APIs, and Socket.IO.
