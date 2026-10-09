const db = require("../db");

const createEmergencyRequest = async (req, res) => {
    try {
        const {
            emergency_type,
            description,
            priority,
            pickup_address,
            pickup_latitude,
            pickup_longitude,
            hospital_id
        } = req.body;

        if (!emergency_type || !pickup_address) {
            return res.status(400).json({
                message: "Emergency type and pickup address are required"
            });
        }

        const allowedPriorities = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

        if (priority && !allowedPriorities.includes(priority)) {
            return res.status(400).json({ message: "Invalid priority" });
        }

        const [result] = await db.query(
            `INSERT INTO emergency_requests
            (patient_id, emergency_type, description, priority, pickup_address,
             pickup_latitude, pickup_longitude, hospital_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                req.user.id,
                emergency_type,
                description || null,
                priority || "HIGH",
                pickup_address,
                pickup_latitude ?? null,
                pickup_longitude ?? null,
                hospital_id ?? null
            ]
        );

        return res.status(201).json({
            message: "Emergency request created successfully",
            emergencyId: result.insertId
        });
    } catch (error) {
        console.error("CREATE EMERGENCY ERROR:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

const getMyEmergencyRequests = async (req, res) => {
    try {
        const [requests] = await db.query(
            `SELECT * FROM emergency_requests
             WHERE patient_id = ?
             ORDER BY created_at DESC`,
            [req.user.id]
        );

        return res.json({ requests });
    } catch (error) {
        console.error("MY EMERGENCY REQUESTS ERROR:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

const getAllEmergencyRequests = async (req, res) => {
    try {
        const [requests] = await db.query(
            `SELECT er.*, u.name AS patient_name, u.phone AS patient_phone
             FROM emergency_requests er
             JOIN users u ON er.patient_id = u.id
             ORDER BY CASE er.priority
                WHEN 'CRITICAL' THEN 1
                WHEN 'HIGH' THEN 2
                WHEN 'MEDIUM' THEN 3
                WHEN 'LOW' THEN 4
                ELSE 5
             END, er.created_at DESC`
        );

        return res.json({ requests });
    } catch (error) {
        console.error("ALL EMERGENCY REQUESTS ERROR:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
    createEmergencyRequest,
    getMyEmergencyRequests,
    getAllEmergencyRequests
};