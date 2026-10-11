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

const seed = db.transaction(() => {
    const insertUser = db.prepare(`
        INSERT OR IGNORE INTO users (id, name, email, password, role, phone)
        VALUES (?, ?, ?, ?, ?, ?)
    `);

    insertUser.run(
        1, "Sakshi", "sakshi@test.com",
        bcrypt.hashSync("Patient@123", 10), "PATIENT", "9876543210"
    );

    insertUser.run(
        2, "Sakshi", "sakshi2@test.com",
        bcrypt.hashSync("Patient@123", 10), "PATIENT", "9876543210"
    );

    insertUser.run(
        3, "Admin", "admin@test.com",
        bcrypt.hashSync("Admin@123", 10), "ADMIN", "9999999999"
    );

    insertUser.run(
        4, "Test User", "testuser@test.com",
        bcrypt.hashSync("Patient@123", 10), "PATIENT", "8888888888"
    );

    insertUser.run(
        5, "Driver", "driver@test.com",
        bcrypt.hashSync("Driver@123", 10), "DRIVER", "7777777777"
    );

    if (db.prepare("SELECT COUNT(*) AS count FROM emergency_requests").get().count === 0) {
        db.prepare(`
            INSERT INTO emergency_requests
            (id, patient_id, emergency_type, description, priority,
             pickup_address, pickup_latitude, pickup_longitude,
             hospital_id, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            1, 2, "Accident", "Road accident emergency", "CRITICAL",
            "MIT-ADT University, Pune", 18.5204, 73.8567,
            null, "COMPLETED", "2026-10-08 14:01:13"
        );

        db.prepare(`
            INSERT INTO emergency_requests
            (id, patient_id, emergency_type, description, priority,
             pickup_address, pickup_latitude, pickup_longitude,
             hospital_id, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            2, 2, "Medical", "Severe chest pain", "HIGH",
            "MIT-ADT University, Pune", 18.5204, 73.8567,
            null, "COMPLETED", "2026-10-08 17:49:30"
        );

        db.prepare(`
            INSERT INTO emergency_requests
            (id, patient_id, emergency_type, description, priority,
             pickup_address, pickup_latitude, pickup_longitude,
             hospital_id, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            3, 2, "Accident", "Road Accident", "CRITICAL",
            "MIT-ADT University, Pune", null, null,
            null, "COMPLETED", "2026-10-08 19:34:02"
        );
    }

    if (db.prepare("SELECT COUNT(*) AS count FROM ambulances").get().count === 0) {
        db.prepare(`
            INSERT INTO ambulances
            (id, vehicle_number, driver_id, ambulance_type, status,
             latitude, longitude, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            1, "AMB-001", 5, "Advanced Life Support",
            "AVAILABLE", 18.5204, 73.8567, "2026-10-08 14:19:47"
        );
    }

    if (db.prepare("SELECT COUNT(*) AS count FROM assignments").get().count === 0) {
        const insertAssignment = db.prepare(`
            INSERT INTO assignments
            (id, emergency_id, ambulance_id, assigned_at,
             accepted_at, completed_at, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

        insertAssignment.run(
            1, 1, 1, "2026-10-08 14:27:52",
            "2026-10-08 17:00:27", "2026-10-08 17:05:17", "COMPLETED"
        );

        insertAssignment.run(
            2, 2, 1, "2026-10-08 17:53:23",
            "2026-10-08 18:01:28", "2026-10-08 18:02:17", "COMPLETED"
        );

        insertAssignment.run(
            3, 3, 1, "2026-10-08 19:49:05",
            "2026-10-09 03:28:58", "2026-10-09 03:29:20", "COMPLETED"
        );
    }
});

seed();

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