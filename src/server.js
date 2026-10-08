const http = require("http");
const { Server } = require("socket.io");

const app = require("./app");
const { PORT } = require("./config");
const db = require("./db");

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: "*"
    }
});

io.on("connection", (socket) => {
    console.log("WebSocket client connected:", socket.id);

    socket.on("disconnect", () => {
        console.log("WebSocket client disconnected:", socket.id);
    });
});

async function startServer() {
    try {
        await db.query("SELECT 1");

        console.log("MySQL connected successfully");

        httpServer.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("MySQL connection failed:", error.message);
    }
}

startServer();