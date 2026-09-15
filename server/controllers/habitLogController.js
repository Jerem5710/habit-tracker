import { addHabitLog, getHabitLogsByUser, updateHabitLog, deleteHabitLog, undoLatestHabitLog } from "../models/habitLogModel.js";
import { calculateStreaks } from "../utils/streaks.js";

export async function fetchHabitLogs(req, res) {
    try {
        /*const logs = await getHabitLogsByUser(req.user.id); ( - older implementation commented out)

        // group logs by habit_id
        const habitsWithStreaks = {};
        logs.forEach(log => {
            if (!habitsWithStreaks[log.habit_id]) {
                habitsWithStreaks[log.habit_id] = [];
            }
            habitsWithStreaks[log.habit_id].push(log);
        }); */
        const rows = await getHabitLogsByUser(req.user.id);

        // group logs by habit_id
        const habitsWithLogs = {};
        rows.forEach(row => {
            if (!habitsWithLogs[row.habit_id]) {
                habitsWithLogs[row.habit_id] = {
                    habitId: row.habit_id,
                    title: row.title,
                    description: row.description,
                    goal: row.goal,
                    logs: []
                };
            }
            if (row.log_id) {
                habitsWithLogs[row.habit_id].logs.push(row);
            }
        });
        // calculate streaks for each habit - older implementation commented out
        /* const result = Object.entries(habitsWithStreaks).map(([habitId, habitLogs]) => {
            const streaks = calculateStreaks(habitLogs);
            return {
                habitId,
                title: habitLogs[0].title,
                description: habitLogs[0].description,
                goal: habitLogs[0].goal, // comes from the habit table, ensure it's included in the SELECT query in getHabitLogsByUser
                completedCount: habitLogs.length || 0, // count of completed logs
                logs: habitLogs,
                ...streaks
            };
        }); */
        // calculate streaks + completedCount
        const result = Object.values(habitsWithLogs).map(habit => {
            const streaks = calculateStreaks(habit.logs || []);
            return {
                ...habit,
                completedCount: habit.logs.length, // ? habit.logs.length : 0,
                currentStreak: streaks.currentStreak,
                longestStreak: streaks.longestStreak
                //...streaks
            };
        });

        res.json(result);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
}

export async function createHabitLog(req, res) {
    const { habitId, dateCompleted, notes } = req.body;
    try {
        await addHabitLog(req.user.id, habitId, dateCompleted, notes);

        // Fetch updated logs for this habit
        const logs = await getHabitLogsByUser(req.user.id);
        const habitLogs = logs.filter(log => log.habit_id === parseInt(habitId));
        const streaks = calculateStreaks(habitLogs);

        res.status(201).json({
            habitId,
            title: habitLogs[0]?.title,
            description: habitLogs[0]?.description,
            goal: habitLogs[0]?.goal,
            logs: habitLogs,
            completedCount: habitLogs.length,
            ...streaks
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
}

// Update habit log
export async function editHabitLog(req, res) {
    const { dateCompleted, notes } = req.body;
    const logId = req.params.id;

    if (!dateCompleted) {
        return res.status(400).json({ error: "dateCompleted is required" });
    }

    try {
        const log = await updateHabitLog(req.user.id, logId, dateCompleted, notes);
        if (!log) return res.status(404).json({ error: "Habit log not found or unauthorized" });
        res.json(log);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
}

// Delete habit log
export async function removeHabitLog(req, res) {
    const logId = req.params.id;

    try {
        const log = await deleteHabitLog(req.user.id, logId);
        if (!log) return res.status(404).json({ error: "Habit log not found or unauthorized" });
        res.json({ message: "Habit log deleted successfully", log });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
}

// Undo the latest habit log for a specific habit
export async function undoHabitCompletion(req, res) {
    try {
        const userId = req.user.id;
        const habitId = parseInt(req.body.habitId, 10);
        // const { habitId } = req.body;

        const undoneLog = await undoLatestHabitLog(userId, habitId);

        if (!undoneLog) {
            return res.status(404).json({ error: "No habit log found to undo" });
        }

        // Fetch remaining logs for this habit
        const logs = await getHabitLogsByUser(userId);
        const habitLogs = logs.filter(log => log.habit_id === parseInt(habitId));

        // Recalculate streaks
        const streaks = calculateStreaks(habitLogs);

        res.json({
            habitId,
            title: habitLogs[0]?.title,
            description: habitLogs[0]?.description,
            logs: habitLogs,
            ...streaks
        });
    } catch (err) {
        console.error("Error undoing habit completion:", err.message);
        res.status(500).json({ error: "Server error" });
    }
}