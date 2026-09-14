import pool from "../db.js";

export async function getHabitsByUser(userId) {
    const result = await pool.query("SELECT * FROM habits WHERE user_id = $1", [userId]);
    return result.rows;
}

export async function createHabit(userId, title, description, frequency) {
    const result = await pool.query(
        "INSERT INTO habits (user_id, title, description, frequency) VALUES ($1, $2, $3, $4) RETURNING *",
        [userId, title, description, frequency]
    );
    return result.rows[0];
}

// Update habit
export async function updateHabit(userId, habitId, title, description, frequency) {
    const result = await pool.query(
        `UPDATE habits 
     SET title = $1, description = $2, frequency = $3
     WHERE id = $4 AND user_id = $5
     RETURNING *`,
        [title, description, frequency, habitId, userId]
    );
    return result.rows[0];
}

// Delete habit (and cascade logs if FK is set)
export async function deleteHabit(userId, habitId) {
    const result = await pool.query(
        `DELETE FROM habits 
     WHERE id = $1 AND user_id = $2
     RETURNING *`,
        [habitId, userId]
    );
    return result.rows[0];
}