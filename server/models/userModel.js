import pool from "../db.js";

export async function getAllUsers() {
    const result = await pool.query("SELECT id, username, email, profile_pic_url FROM users");
    return result.rows;
}

export async function updateUserProfilePic(userId, url) {
    const result = await pool.query(
        "UPDATE users SET profile_pic_url = $1 WHERE id = $2 RETURNING *",
        [url, userId]
    );
    return result.rows[0];
}

export async function clearUserProfilePic(userId) {
    const result = await pool.query(
        "UPDATE users SET profile_pic_url = NULL WHERE id = $1 RETURNING *",
        [userId]
    );
    return result.rows[0];
}
