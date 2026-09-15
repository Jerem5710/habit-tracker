import { getHabitsByUser, createHabit, updateHabit, deleteHabit } from "../models/habitModel.js";
import { getHabitLogsByUser } from "../models/habitLogModel.js";
import { calculateStreaks } from "../utils/streaks.js"; 

export async function fetchHabits(req, res) {
    try {
        const habits = await getHabitsByUser(req.user.id);
        res.json(habits);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
}

export async function addHabit(req, res) {
    console.log("Habit creation body:", req.body);
    const { title, description, frequency, goal } = req.body;
    try {
        const habit = await createHabit(req.user.id, title, description, frequency, goal);

        // Fetch logs for this habit (will be empty initially)
        const logs = await getHabitLogsByUser(req.user.id);
        const habitLogs = logs.filter(log => log.habit_id === habit.id && log.log_id !== null);
        const streaks = calculateStreaks(habitLogs);

        res.status(201).json({
            id: habit.id,
            title: habit.title,
            description: habit.description,
            frequency: habit.frequency,
            goal: habit.goal,
            completedCount: habitLogs.length, // 0 on creation
            logs: habitLogs,                  // []
            ...streaks                        // { currentStreak: 0, longestStreak: 0 }
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
}

// Update habit
export async function editHabit(req, res) {
    const { title, description, frequency, goal } = req.body;
    const habitId = req.params.id;

    try {
        const habit = await updateHabit(req.user.id, habitId, title, description, frequency, goal);
        if (!habit) return res.status(404).json({ error: "Habit not found or unauthorized" });

        // Fetch logs for this habit to hydrate progress
        const logs = await getHabitLogsByUser(req.user.id);
        const habitLogs = logs.filter(log => log.habit_id === parseInt(habitId, 10) && log.log_id !== null);
        const streaks = calculateStreaks(habitLogs);

        res.json({
            id: habit.id,
            title: habit.title,
            description: habit.description,
            frequency: habit.frequency,
            goal: habit.goal,
            completedCount: habitLogs.length,
            logs: habitLogs,
            ...streaks
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
}

// Delete habit
export async function removeHabit(req, res) {
    const habitId = req.params.id;

    try {
        const habit = await deleteHabit(req.user.id, habitId);
        if (!habit) return res.status(404).json({ error: "Habit not found or unauthorized" });
        res.json({ message: "Habit deleted successfully", habit });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
}