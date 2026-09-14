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

app.use(express.json());

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

app.get("/users", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM users");
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});

app.use("/users", userRoutes);
app.use("/auth", authRoutes);
app.use("/habits", habitRoutes);
app.use("/habit-logs", habitLogRoutes);
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

export default app;
