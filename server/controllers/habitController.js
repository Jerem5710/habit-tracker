import { getHabitsByUser, createHabit, updateHabit, deleteHabit } from "../models/habitModel.js";

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
    const { title, description, frequency } = req.body;
    try {
        const habit = await createHabit(req.user.id, title, description, frequency);
        res.status(201).json(habit);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
}

// Update habit
export async function editHabit(req, res) {
    const { title, description, frequency } = req.body;
    const habitId = req.params.id;

    try {
        const habit = await updateHabit(req.user.id, habitId, title, description, frequency);
        if (!habit) return res.status(404).json({ error: "Habit not found or unauthorized" });
        res.json(habit);
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