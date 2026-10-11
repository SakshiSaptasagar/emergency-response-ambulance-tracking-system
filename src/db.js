const Database = require("better-sqlite3");
const path = require("path");
const bcrypt = require("bcrypt");

const db = new Database(
    path.join(__dirname, "..", "emergency_response.db")
);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    phone TEXT
);

CREATE TABLE IF NOT EXISTS emergency_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER,
    emergency_type TEXT NOT NULL,
    description TEXT,
    priority TEXT DEFAULT 'HIGH',
    pickup_address TEXT NOT NULL,
    pickup_latitude REAL,
    pickup_longitude REAL,
    hospital_id INTEGER,
    status TEXT DEFAULT 'PENDING',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ambulances (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vehicle_number TEXT NOT NULL UNIQUE,
    driver_id INTEGER,
    ambulance_type TEXT NOT NULL,
    latitude REAL,
    longitude REAL,
    status TEXT DEFAULT 'AVAILABLE',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    emergency_id INTEGER NOT NULL,
    ambulance_id INTEGER NOT NULL,
    status TEXT DEFAULT 'PENDING',
    assigned_at TEXT DEFAULT CURRENT_TIMESTAMP,
    accepted_at TEXT,
    completed_at TEXT
);

CREATE TABLE IF NOT EXISTS ambulance_locations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ambulance_id INTEGER NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    recorded_at TEXT DEFAULT CURRENT_TIMESTAMP
);
`);

function seedUser(name, email, password, role) {
    const hashedPassword = bcrypt.hashSync(password, 10);

    db.prepare(`
        INSERT INTO users (name, email, password, role)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(email) DO UPDATE SET
            name = excluded.name,
            password = excluded.password,
            role = excluded.role
    `).run(name, email, hashedPassword, role);
}

seedUser("Admin", "admin@test.com", "Admin@123", "ADMIN");
seedUser("Driver", "driver@test.com", "Driver@123", "DRIVER");

db.query = async (sql, params = []) => {
    const statement = db.prepare(sql);

    if (/^\s*(SELECT|PRAGMA|WITH)\b/i.test(sql)) {
        return [statement.all(...params)];
    }

    const result = statement.run(...params);

    return [{
        insertId: Number(result.lastInsertRowid),
        affectedRows: result.changes
    }];
};

module.exports = db;