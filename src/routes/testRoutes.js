const express = require("express");
const authenticateToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/test", (req, res) => {
    res.json({
        message: "Test route is working"
    });
});

router.get("/protected", authenticateToken, (req, res) => {
    res.json({
        message: "You accessed a protected route",
        user: req.user
    });
});

router.get(
    "/admin-test",
    authenticateToken,
    authorizeRoles("ADMIN"),
    (req, res) => {
        res.json({
            message: "Admin route accessed successfully",
            user: req.user
        });
    }
);

module.exports = router;