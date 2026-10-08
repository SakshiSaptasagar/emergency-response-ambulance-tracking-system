const express = require("express");
const authenticateToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
    addAmbulance,
    getAllAmbulances,
    assignDriverToAmbulance,
    updateAmbulanceLocation
} = require("../controllers/ambulanceController");

const router = express.Router();

router.post(
    "/",
    authenticateToken,
    authorizeRoles("ADMIN"),
    addAmbulance
);

router.get(
    "/",
    authenticateToken,
    authorizeRoles("ADMIN", "HOSPITAL"),
    getAllAmbulances
);

router.patch(
    "/:id/driver",
    authenticateToken,
    authorizeRoles("ADMIN"),
    assignDriverToAmbulance
);

router.patch(
    "/:id/location",
    authenticateToken,
    authorizeRoles("DRIVER"),
    updateAmbulanceLocation
);

module.exports = router;