import express from "express";
import { fetchUsers } from "../controllers/userController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authenticateToken, fetchUsers);

export default router;