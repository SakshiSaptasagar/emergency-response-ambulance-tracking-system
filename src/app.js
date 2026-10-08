const express = require("express");

const app = express();

app.get("/", (req, res) => {
    res.json({
        message: "Emergency Response & Ambulance Tracking API is running"
    });
});

module.exports = app;