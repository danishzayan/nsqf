// src/routes/attendanceRoutes.js
import express from "express";
import { markAttendance ,getTrainerAttendance } from "../controllers/attendanceController.js";

const router = express.Router();

router.post("/trainer/attendance", markAttendance);
router.get("/trainer/:id/attendance", getTrainerAttendance);

export default router;
