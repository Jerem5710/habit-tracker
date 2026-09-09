import { getAllUsers } from "../models/userModel.js";

export async function fetchUsers(req, res) {
    try {
        const users = await getAllUsers();
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
}