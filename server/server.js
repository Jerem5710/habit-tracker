import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import pool from "./db.js";
import path from "path";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import habitRoutes from "./routes/habitRoutes.js";
import habitLogRoutes from "./routes/habitLogRoutes.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.use(cors({
    origin: "http://localhost:5173", // allow your Vite frontend
    credentials: true                // allow cookies/headers if needed
}));

app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

// Test DB route
app.get("/users", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM users");
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});

// Use /users route
app.use("/users", userRoutes);
// Use /auth route
app.use("/auth", authRoutes);
// Use /habits route
app.use("/habits", habitRoutes);
// Use /logs route
app.use("/habit-logs", habitLogRoutes);
// Serve static files from the uploads directory
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
