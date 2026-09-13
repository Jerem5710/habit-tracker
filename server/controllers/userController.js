import { getAllUsers, updateUserProfilePic, clearUserProfilePic } from "../models/userModel.js";
import pool from "../db.js";

export async function fetchUsers(req, res) {
    try {
        const users = await getAllUsers();
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
}

export async function setProfilePic(req, res) {
    try {
        console.log("File received:", req.file); // debug line
        console.log("req.body:", req.body);
        console.log("req.file:", req.file);

        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const userId = req.user.id; // from JWT
        const filePath = `/uploads/${req.file.filename}`;

        const updatedUser = await updateUserProfilePic(userId, filePath);
        res.json(updatedUser);
    } catch (err) {
        console.error("Upload error:", err);
        res.status(500).json({ error: "Server error" });
    }
}

export async function resetProfilePic(req, res) {
    try {
        const userId = req.user.id; // from JWT
        const updatedUser = await clearUserProfilePic(userId);
        res.json(updatedUser);
    } catch (err) {
        console.error("Error resetting profile pic:", err.message);
        res.status(500).json({ error: "Server error" });
    }
}