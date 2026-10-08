const express = require("express");

const authenticateToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
    getAssignments,
    getDriverAssignments,
    acceptAssignment,
    completeAssignment
} = require("../controllers/assignmentController");

const router = express.Router();

router.get(
    "/",
    authenticateToken,
    authorizeRoles("ADMIN", "HOSPITAL"),
    getAssignments
);

router.get(
    "/driver",
    authenticateToken,
    authorizeRoles("DRIVER"),
    getDriverAssignments
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