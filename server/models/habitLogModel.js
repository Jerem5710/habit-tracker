import pool from "../db.js";

export async function getHabitLogsByUser(userId) {
    const result = await pool.query(
        `SELECT hl.*, h.title, h.description
     FROM habit_logs hl
     JOIN habits h ON hl.habit_id = h.id
     WHERE h.user_id = $1`,
        [userId]
    );
    return result.rows;
}

export async function addHabitLog(userId, habitId, dateCompleted, notes) {
    const result = await pool.query(
        `INSERT INTO habit_logs (habit_id, date_completed, notes, created_at)
        SELECT h.id, $2, $3, NOW()
        FROM habits h
        WHERE h.id = $1 AND h.user_id = $4
        RETURNING *`,
        [habitId, dateCompleted, notes, userId]
    );
    return result.rows[0];
}

// Update habit log
export async function updateHabitLog(userId, logId, dateCompleted, notes) {
    const result = await pool.query(
        `UPDATE habit_logs hl
     SET date_completed = $1, notes = $2
     FROM habits h
     WHERE hl.id = $3 AND hl.habit_id = h.id AND h.user_id = $4
     RETURNING hl.*`,
        [dateCompleted, notes, logId, userId]
    );
    return result.rows[0];
}

// Delete habit log
export async function deleteHabitLog(userId, logId) {
    const result = await pool.query(
        `DELETE FROM habit_logs hl
     USING habits h
     WHERE hl.id = $1 AND hl.habit_id = h.id AND h.user_id = $2
     RETURNING hl.*`,
        [logId, userId]
    );
    return result.rows[0];
}

// Undo the latest habit log for a specific habit
/* export async function undoLatestHabitLog(userId, habitId) {
    const result = await pool.query(
        `DELETE FROM habit_logs hl
     USING habits h
     WHERE hl.id = (
       SELECT id FROM habit_logs
       WHERE habit_id = $1
       ORDER BY date_completed DESC, created_at DESC
       LIMIT 1
     )
     AND h.id = hl.habit_id
     AND h.user_id = $2
     RETURNING hl.*`,
        [habitId, userId]
    );
    return result.rows[0];
} */

export async function undoLatestHabitLog(userId, habitId) {
    const result = await pool.query(
    `DELETE FROM habit_logs hl
     USING habits h
     WHERE hl.habit_id = h.id
       AND h.user_id = $2
       AND hl.id = (
         SELECT hl2.id
         FROM habit_logs hl2
         JOIN habits h2 ON hl2.habit_id = h2.id
         WHERE hl2.habit_id = $1 AND h2.user_id = $2
         ORDER BY hl2.date_completed DESC, hl2.created_at DESC
         LIMIT 1
       )
     RETURNING hl.*`,
        [habitId, userId]
    );
    return result.rows[0];
}