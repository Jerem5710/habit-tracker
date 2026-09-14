export function validateHabitLog(req, res, next) {
    const { habitId, dateCompleted } = req.body;

    // For POST requests (create)
    if (req.method === "POST") {
        if (!habitId) return res.status(400).send("habitId is required");
        if (!dateCompleted) return res.status(400).send("dateCompleted is required");
    }

    // For PUT requests (update)
    if (req.method === "PUT") {
        if (!dateCompleted) return res.status(400).send("dateCompleted is required");
    }

    next();
}