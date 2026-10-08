
const db = require("../db");

const getAssignments = async (req, res) => {
    try {
        const [assignments] = await db.query(
            `SELECT a.id, a.emergency_id, a.ambulance_id,
                    a.status, a.assigned_at, a.accepted_at,
                    a.completed_at, amb.vehicle_number,
                    amb.ambulance_type AS ambulance_type
             FROM assignments a
             JOIN ambulances amb ON amb.id = a.ambulance_id
             ORDER BY a.id DESC`
        );

        return res.status(200).json({ assignments });
    } catch (error) {
        console.error("GET ASSIGNMENTS ERROR:", error);
        return res.status(500).json({
            message: error.message,
            code: error.code
        });
    }
};

const getDriverAssignments = async (req, res) => {
    try {
        const driverId = Number(req.user.id);

        const [assignments] = await db.query(
            `SELECT a.id, a.emergency_id, a.ambulance_id,
                    a.status, a.assigned_at, a.accepted_at,
                    a.completed_at, amb.vehicle_number,
                    amb.ambulance_type AS ambulance_type,
                    e.emergency_type AS emergency_type,
                    e.description,
                    e.priority,
                    e.pickup_address
             FROM assignments a
             JOIN ambulances amb ON amb.id = a.ambulance_id
             JOIN emergency_requests e ON e.id = a.emergency_id
             WHERE amb.driver_id = ?
             ORDER BY a.id DESC`,
            [driverId]
        );

        return res.status(200).json({ assignments });
    } catch (error) {
        console.error("DRIVER ASSIGNMENTS ERROR:", error);

        return res.status(500).json({
            message: error.message,
            code: error.code
        });
    }
};

const acceptAssignment = async (req, res) => {
    try {
        const assignmentId = req.params.id;
        const driverId = Number(req.user.id);

        const [rows] = await db.query(
            `SELECT a.id, a.emergency_id, a.ambulance_id,
                    a.status, amb.driver_id
             FROM assignments a
             JOIN ambulances amb ON amb.id = a.ambulance_id
             WHERE a.id = ?`,
            [assignmentId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: "Assignment not found" });
        }

        const assignment = rows[0];

        if (Number(assignment.driver_id) !== driverId) {
            return res.status(403).json({ message: "Access denied" });
        }

        if (assignment.status !== "PENDING") {
            return res.status(400).json({
                message: "Only pending assignments can be accepted"
            });
        }

        await db.query(
            `UPDATE assignments
             SET status = 'ACCEPTED', accepted_at = NOW()
             WHERE id = ?`,
            [assignmentId]
        );

        await db.query(
            "UPDATE ambulances SET status = 'ON_TRIP' WHERE id = ?",
            [assignment.ambulance_id]
        );

        await db.query(
            "UPDATE emergency_requests SET status = 'PICKED_UP' WHERE id = ?",
            [assignment.emergency_id]
        );

        return res.status(200).json({
            message: "Assignment accepted successfully"
        });
    } catch (error) {
        console.error("ACCEPT ASSIGNMENT ERROR:", error);

        return res.status(500).json({
            message: error.message,
            code: error.code
        });
    }
};

const completeAssignment = async (req, res) => {
    try {
        const assignmentId = req.params.id;
        const driverId = Number(req.user.id);

        const [rows] = await db.query(
            `SELECT a.id, a.emergency_id, a.ambulance_id,
                    a.status, amb.driver_id
             FROM assignments a
             JOIN ambulances amb ON amb.id = a.ambulance_id
             WHERE a.id = ?`,
            [assignmentId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: "Assignment not found" });
        }

        const assignment = rows[0];

        if (Number(assignment.driver_id) !== driverId) {
            return res.status(403).json({ message: "Access denied" });
        }

        if (assignment.status !== "ACCEPTED") {
            return res.status(400).json({
                message: "Only accepted assignments can be completed"
            });
        }

        await db.query(
            `UPDATE assignments
             SET status = 'COMPLETED', completed_at = NOW()
             WHERE id = ?`,
            [assignmentId]
        );

        await db.query(
            "UPDATE emergency_requests SET status = 'COMPLETED' WHERE id = ?",
            [assignment.emergency_id]
        );

        await db.query(
            "UPDATE ambulances SET status = 'AVAILABLE' WHERE id = ?",
            [assignment.ambulance_id]
        );

        return res.status(200).json({
            message: "Assignment completed successfully"
        });
    } catch (error) {
        console.error("COMPLETE ASSIGNMENT ERROR:", error);

        return res.status(500).json({
            message: error.message,
            code: error.code
        });
    }
};

module.exports = {
    getAssignments,
    getDriverAssignments,
    acceptAssignment,
    completeAssignment
};
