import express from "express";
import { addState, addDistrict } from "../controllers/adminController.js";
// import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// Admin endpoints
router.post("/state",  addState);
router.post("/district",  addDistrict);

export default router;
