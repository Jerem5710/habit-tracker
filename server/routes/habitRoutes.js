import express from "express";
import { fetchHabits, addHabit, editHabit, removeHabit } from "../controllers/habitController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authenticateToken, fetchHabits);
router.post("/", authenticateToken, addHabit);
router.put("/:id", authenticateToken, editHabit);
router.delete("/:id", authenticateToken, removeHabit);

export default router;
