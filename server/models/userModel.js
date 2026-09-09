import pool from "../db.js";

export async function getAllUsers() {
    const result = await pool.query("SELECT * FROM users");
    return result.rows;
}