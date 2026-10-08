const app = require("./app");
const { PORT } = require("./config");
const db = require("./db");

async function startServer() {
    try {
        await db.query("SELECT 1");

        console.log("MySQL connected successfully");

        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("MySQL connection failed:", error.message);
    }
}

startServer();