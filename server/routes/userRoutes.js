import express from "express";
import { fetchUsers, setProfilePic, resetProfilePic } from "../controllers/userController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/", authenticateToken, fetchUsers);
router.post("/profile-pic", authenticateToken, upload.single("profilePic"), setProfilePic);
router.delete("/profile-pic", authenticateToken, resetProfilePic);

export default router;