const db = require("../db");

const assignAmbulance = async (req, res) => {
    try {
        const { emergency_id, ambulance_id } = req.body;

        if (!emergency_id || !ambulance_id) {
            return res.status(400).json({
                message: "Emergency ID and ambulance ID are required"
            });
        }

        const [emergency] = await db.query(
            "SELECT id, status FROM emergency_requests WHERE id = ?",
            [emergency_id]
        );

        if (emergency.length === 0) {
            return res.status(404).json({
                message: "Emergency request not found"
            });
        }

        const [ambulance] = await db.query(
            "SELECT id, status FROM ambulances WHERE id = ?",
            [ambulance_id]
        );

        if (ambulance.length === 0) {
            return res.status(404).json({
                message: "Ambulance not found"
            });
        }

        if (ambulance[0].status !== "AVAILABLE") {
            return res.status(400).json({
                message: "Ambulance is not available"
            });
        }

        const [result] = await db.query(
            `INSERT INTO assignments
            (emergency_id, ambulance_id)
            VALUES (?, ?)`,
            [emergency_id, ambulance_id]
        );

        await db.query(
            `UPDATE emergency_requests
             SET status = 'ASSIGNED'
             WHERE id = ?`,
            [emergency_id]
        );

        await db.query(
            `UPDATE ambulances
             SET status = 'ASSIGNED'
             WHERE id = ?`,
            [ambulance_id]
        );

        res.status(201).json({
            message: "Ambulance assigned successfully",
            assignmentId: result.insertId
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error"
        });
    }
};

const getAllAssignments = async (req, res) => {
    try {
        const [assignments] = await db.query(
            `SELECT
                a.id,
                a.emergency_id,
                a.ambulance_id,
                a.assigned_at,
                a.accepted_at,
                a.completed_at,
                a.status,
                er.emergency_type,
                er.priority,
                er.pickup_address,
                amb.vehicle_number,
                amb.ambulance_type,
                u.name AS driver_name,
                u.phone AS driver_phone
             FROM assignments a
             JOIN emergency_requests er
                ON a.emergency_id = er.id
             JOIN ambulances amb
                ON a.ambulance_id = amb.id
             LEFT JOIN users u
                ON amb.driver_id = u.id
             ORDER BY a.assigned_at DESC`
        );

        res.json({ assignments });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error"
        });
    }
};

const acceptAssignment = async (req, res) => {
    try {
        const { id } = req.params;

        const [assignments] = await db.query(
            `SELECT
                a.id,
                a.ambulance_id,
                a.status,
                amb.driver_id
             FROM assignments a
             JOIN ambulances amb
                ON a.ambulance_id = amb.id
             WHERE a.id = ?`,
            [id]
        );

        if (assignments.length === 0) {
            return res.status(404).json({
                message: "Assignment not found"
            });
        }

        const assignment = assignments[0];

        if (assignment.driver_id !== req.user.id) {
            return res.status(403).json({
                message: "You are not assigned to this ambulance"
            });
        }

        if (assignment.status !== "PENDING") {
            return res.status(400).json({
                message: "Assignment cannot be accepted"
            });
        }

        await db.query(
            `UPDATE assignments
             SET status = 'ACCEPTED',
                 accepted_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [id]
        );

        await db.query(
            `UPDATE ambulances
             SET status = 'ON_TRIP'
             WHERE id = ?`,
            [assignment.ambulance_id]
        );

        await db.query(
            `UPDATE emergency_requests er
             JOIN assignments a
             ON er.id = a.emergency_id
             SET er.status = 'PICKED_UP'
             WHERE a.id = ?`,
            [id]
        );

        res.json({
            message: "Assignment accepted successfully"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error"
        });
    }
};

const completeAssignment = async (req, res) => {
    try {
        const { id } = req.params;

        const [assignments] = await db.query(
            `SELECT
                a.id,
                a.emergency_id,
                a.ambulance_id,
                a.status,
                amb.driver_id
             FROM assignments a
             JOIN ambulances amb
                ON a.ambulance_id = amb.id
             WHERE a.id = ?`,
            [id]
        );

        if (assignments.length === 0) {
            return res.status(404).json({
                message: "Assignment not found"
            });
        }

        const assignment = assignments[0];

        if (assignment.driver_id !== req.user.id) {
            return res.status(403).json({
                message: "You are not assigned to this ambulance"
            });
        }

        if (assignment.status !== "ACCEPTED") {
            return res.status(400).json({
                message: "Assignment cannot be completed"
            });
        }

        await db.query(
            `UPDATE assignments
             SET status = 'COMPLETED',
                 completed_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [id]
        );

        await db.query(
            `UPDATE ambulances
             SET status = 'AVAILABLE'
             WHERE id = ?`,
            [assignment.ambulance_id]
        );

        await db.query(
            `UPDATE emergency_requests
             SET status = 'COMPLETED'
             WHERE id = ?`,
            [assignment.emergency_id]
        );

        res.json({
            message: "Assignment completed successfully"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error"
        });
    }
};

module.exports = {
    assignAmbulance,
    getAllAssignments,
    acceptAssignment,
    completeAssignment
};