const express = require("express");
const testRoutes = require("./routes/testRoutes");
const authRoutes = require("./routes/authRoutes");
const emergencyRoutes = require("./routes/emergencyRoutes");
const ambulanceRoutes = require("./routes/ambulanceRoutes");
const assignmentRoutes = require("./routes/assignmentRoutes");

const app = express();

app.use(express.json());

app.use("/api", testRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/emergency", emergencyRoutes);
app.use("/api/ambulances", ambulanceRoutes);
app.use("/api/assignments", assignmentRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "Emergency Response & Ambulance Tracking API is running"
    });
});

module.exports = app;