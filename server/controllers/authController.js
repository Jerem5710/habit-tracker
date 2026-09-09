import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../db.js";

export async function registerUser(req, res) {
    const { username, email, password } = req.body;
    try {
        // hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // insert into DB
        const result = await pool.query(
            "INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING *",
            [username, email, hashedPassword]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
}

export async function loginUser(req, res) {
    const { email, password } = req.body;
    try {
        const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        const user = result.rows[0];
        if (!user) return res.status(400).send("Invalid credentials");

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) return res.status(400).send("Invalid credentials");

        // issue JWT
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.json({ token });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
}
