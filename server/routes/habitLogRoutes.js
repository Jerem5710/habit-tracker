import express from "express";
import { fetchHabitLogs, createHabitLog, editHabitLog, removeHabitLog, undoHabitCompletion } from "../controllers/habitLogController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { validateHabitLog } from "../middleware/validateHabitLog.js";

const router = express.Router();

router.get("/", authenticateToken, fetchHabitLogs);
router.post("/", authenticateToken, validateHabitLog, createHabitLog);
router.put("/:id", authenticateToken, validateHabitLog, editHabitLog);
router.delete("/undo", authenticateToken, undoHabitCompletion);
router.delete("/:id", authenticateToken, removeHabitLog);

export default router;
