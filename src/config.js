require("dotenv").config({
    path: require("path").resolve(__dirname, "../.env")
});

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "change-this-to-a-long-random-secret";

module.exports = {
    PORT,
    JWT_SECRET
};