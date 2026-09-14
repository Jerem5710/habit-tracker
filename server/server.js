//import express from "express";
import dotenv from "dotenv";
//import cors from "cors";
//import pool from "./db.js";
//import path from "path";
//import userRoutes from "./routes/userRoutes.js";
//import authRoutes from "./routes/authRoutes.js";
//import habitRoutes from "./routes/habitRoutes.js";
//import habitLogRoutes from "./routes/habitLogRoutes.js";
import app from "./app.js"; // exports the app instance for testing

dotenv.config();
// const app = express();
const PORT = process.env.PORT || 5000;

/* app.get("/health", (req, res) => {
    res.json({ status: "ok" });
}); */

// Test DB route
/*app.get("/users", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM users");
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
}); */

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
