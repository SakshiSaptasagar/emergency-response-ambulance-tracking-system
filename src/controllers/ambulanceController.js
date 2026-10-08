const db = require("../db");

const addAmbulance = async (req, res) => {
    try {
        const {
            vehicle_number,
            driver_id,
            ambulance_type,
            latitude,
            longitude
        } = req.body;

        if (!vehicle_number || !ambulance_type) {
            return res.status(400).json({
                message: "Vehicle number and ambulance type are required"
            });
        }

        const [existing] = await db.query(
            "SELECT id FROM ambulances WHERE vehicle_number = ?",
            [vehicle_number]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                message: "Ambulance already exists"
            });
        }

        if (driver_id) {
            const [driver] = await db.query(
                "SELECT id, role FROM users WHERE id = ?",
                [driver_id]
            );

            if (driver.length === 0 || driver[0].role !== "DRIVER") {
                return res.status(400).json({
                    message: "Invalid driver"
                });
            }
        }

        const [result] = await db.query(
            `INSERT INTO ambulances
            (vehicle_number, driver_id, ambulance_type, latitude, longitude)
            VALUES (?, ?, ?, ?, ?)`,
            [
                vehicle_number,
                driver_id || null,
                ambulance_type,
                latitude || null,
                longitude || null
            ]
        );

        res.status(201).json({
            message: "Ambulance added successfully",
            ambulanceId: result.insertId
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

const getAllAmbulances = async (req, res) => {
    try {
        const [ambulances] = await db.query(
            `SELECT
                a.*,
                u.name AS driver_name,
                u.phone AS driver_phone
             FROM ambulances a
             LEFT JOIN users u ON a.driver_id = u.id
             ORDER BY a.created_at DESC`
        );

        res.json({ ambulances });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

const assignDriverToAmbulance = async (req, res) => {
    try {
        const { id } = req.params;
        const { driver_id } = req.body;

        if (!driver_id) {
            return res.status(400).json({
                message: "Driver ID is required"
            });
        }

        const [driver] = await db.query(
            "SELECT id, role FROM users WHERE id = ?",
            [driver_id]
        );

        if (driver.length === 0 || driver[0].role !== "DRIVER") {
            return res.status(400).json({
                message: "Invalid driver"
            });
        }

        const [ambulance] = await db.query(
            "SELECT id FROM ambulances WHERE id = ?",
            [id]
        );

        if (ambulance.length === 0) {
            return res.status(404).json({
                message: "Ambulance not found"
            });
        }

        await db.query(
            "UPDATE ambulances SET driver_id = ? WHERE id = ?",
            [driver_id, id]
        );

        res.json({
            message: "Driver assigned to ambulance successfully"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

const updateAmbulanceLocation = async (req, res) => {
    try {
        const { id } = req.params;
        const { latitude, longitude } = req.body;

        if (latitude === undefined || longitude === undefined) {
            return res.status(400).json({
                message: "Latitude and longitude are required"
            });
        }

        const [ambulance] = await db.query(
            "SELECT id, driver_id FROM ambulances WHERE id = ?",
            [id]
        );

        if (ambulance.length === 0) {
            return res.status(404).json({
                message: "Ambulance not found"
            });
        }

        if (ambulance[0].driver_id !== req.user.id) {
            return res.status(403).json({
                message: "You are not assigned to this ambulance"
            });
        }

        await db.query(
            `UPDATE ambulances
             SET latitude = ?, longitude = ?
             WHERE id = ?`,
            [latitude, longitude, id]
        );

        await db.query(
            `INSERT INTO ambulance_locations
            (ambulance_id, latitude, longitude)
            VALUES (?, ?, ?)`,
            [id, latitude, longitude]
        );

        res.json({
            message: "Ambulance location updated successfully"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
    addAmbulance,
    getAllAmbulances,
    assignDriverToAmbulance,
    updateAmbulanceLocation
};