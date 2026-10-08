# Emergency Response & Ambulance Tracking System

A backend system for managing emergency requests, ambulance assignments, driver operations, and real-time ambulance location tracking.

## Features

- User authentication and JWT authorization
- Role-based access control
- Emergency request management
- Ambulance management
- Driver assignment
- Emergency-to-ambulance assignment
- Driver accept/complete workflow
- Ambulance location updates
- Ambulance location history
- REST API architecture
- MySQL database
- WebSocket support with Socket.IO

## Tech Stack

- Node.js
- Express.js
- MySQL
- REST APIs
- JWT
- bcrypt
- Socket.IO
- Postman
- Git & GitHub

## User Roles

- ADMIN
- DRIVER
- PATIENT
- HOSPITAL

## Project Structure

```text
database/
src/
├── controllers/
├── middleware/
├── routes/
├── app.js
├── config.js
├── db.js
└── server.js