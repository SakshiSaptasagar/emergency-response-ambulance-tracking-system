CREATE DATABASE IF NOT EXISTS emergency_response_db;

USE emergency_response_db;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'DRIVER', 'PATIENT', 'HOSPITAL') NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ambulances (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vehicle_number VARCHAR(50) NOT NULL UNIQUE,
    driver_id INT,
    ambulance_type VARCHAR(50) NOT NULL,
    status ENUM('AVAILABLE', 'ASSIGNED', 'ON_TRIP', 'MAINTENANCE') DEFAULT 'AVAILABLE',
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (driver_id) REFERENCES users(id)
);

CREATE TABLE hospitals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    address VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    available_beds INT DEFAULT 0,
    emergency_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE emergency_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    emergency_type VARCHAR(100) NOT NULL,
    description TEXT,
    priority ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') DEFAULT 'HIGH',
    pickup_address VARCHAR(255) NOT NULL,
    pickup_latitude DECIMAL(10, 7),
    pickup_longitude DECIMAL(10, 7),
    hospital_id INT,
    status ENUM('REQUESTED', 'ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED') DEFAULT 'REQUESTED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (patient_id) REFERENCES users(id),
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id)
);

CREATE TABLE assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    emergency_id INT NOT NULL,
    ambulance_id INT NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    accepted_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    status ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED') DEFAULT 'PENDING',

    FOREIGN KEY (emergency_id) REFERENCES emergency_requests(id),
    FOREIGN KEY (ambulance_id) REFERENCES ambulances(id)
);

CREATE TABLE ambulance_locations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ambulance_id INT NOT NULL,
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (ambulance_id) REFERENCES ambulances(id)
);