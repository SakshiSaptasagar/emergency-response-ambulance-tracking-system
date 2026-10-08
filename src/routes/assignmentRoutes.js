const express = require("express");
const authenticateToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
    assignAmbulance,
    getAllAssignments,
    acceptAssignment,
    completeAssignment
} = require("../controllers/assignmentController");

const router = express.Router();

router.post(
    "/",
    authenticateToken,
    authorizeRoles("ADMIN"),
    assignAmbulance
);

router.get(
    "/",
    authenticateToken,
    authorizeRoles("ADMIN", "HOSPITAL"),
    getAllAssignments
);

router.patch(
    "/:id/accept",
    authenticateToken,
    authorizeRoles("DRIVER"),
    acceptAssignment
);

router.patch(
    "/:id/complete",
    authenticateToken,
    authorizeRoles("DRIVER"),
    completeAssignment
);

module.exports = router;