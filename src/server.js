const http = require("http");
const { Server } = require("socket.io");

const app = require("./app");
const { PORT } = require("./config");
const db = require("./db");

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://emergency-response-frontend-avqf.onrender.com",
    ],
    methods: ["GET", "POST", "PATCH"],
  },
});

io.on("connection", (socket) => {
  console.log("WebSocket client connected:", socket.id);

  socket.on("ambulance:location", async (data) => {
    try {
      const ambulanceId = Number(data?.ambulanceId);
      const latitude = Number(data?.latitude);
      const longitude = Number(data?.longitude);

      const validCoordinates =
        Number.isInteger(ambulanceId) &&
        ambulanceId > 0 &&
        Number.isFinite(latitude) &&
        Number.isFinite(longitude) &&
        latitude >= -90 &&
        latitude <= 90 &&
        longitude >= -180 &&
        longitude <= 180;

      if (!validCoordinates) {
        socket.emit("ambulance:location:error", {
          message: "Invalid ambulance ID or coordinates.",
        });
        return;
      }

      const [result] = await db.query(
        `UPDATE ambulances
         SET latitude = ?, longitude = ?
         WHERE id = ?`,
        [latitude, longitude, ambulanceId]
      );

      if (result.affectedRows === 0) {
        socket.emit("ambulance:location:error", {
          message: "Ambulance not found.",
        });
        return;
      }

      const locationUpdate = {
        ambulanceId,
        latitude,
        longitude,
        updatedAt: new Date().toISOString(),
      };

      io.emit("ambulance:location:update", locationUpdate);

      console.log("Ambulance location updated:", locationUpdate);
    } catch (error) {
      console.error("LOCATION UPDATE ERROR:", error.message);

      socket.emit("ambulance:location:error", {
        message: "Could not save the ambulance location.",
      });
    }
  });

  socket.on("disconnect", () => {
    console.log("WebSocket client disconnected:", socket.id);
  });
});

async function startServer() {
  try {
    await db.query("SELECT 1");

    console.log("MySQL connected successfully");

    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
}

startServer();