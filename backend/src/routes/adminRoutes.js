import express from "express";
import { addState, addDistrict } from "../controllers/admin.controller.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// Admin endpoints
router.post("/state", authMiddleware, addState);
router.post("/district", authMiddleware, addDistrict);

export default router;
