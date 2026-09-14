import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";
import jwt from "jsonwebtoken";
import pool from "../db.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

// New route to get user info
router.get("/me", async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ error: "No token provided" });

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const result = await pool.query(
            "SELECT id, username, email, profile_pic_url FROM users WHERE id = $1",
            [decoded.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(401).json({ error: "Invalid token" });
    }
});

export default router;
