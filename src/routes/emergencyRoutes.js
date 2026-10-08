const express = require("express");
const authenticateToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
    createEmergencyRequest,
    getMyEmergencyRequests,
    getAllEmergencyRequests
} = require("../controllers/emergencyRequestController");

const router = express.Router();

router.post(
    "/",
    authenticateToken,
    authorizeRoles("PATIENT"),
    createEmergencyRequest
);

router.get(
    "/my",
    authenticateToken,
    authorizeRoles("PATIENT"),
    getMyEmergencyRequests
);

router.get(
    "/all",
    authenticateToken,
    authorizeRoles("ADMIN", "HOSPITAL"),
    getAllEmergencyRequests
);

module.exports = router;