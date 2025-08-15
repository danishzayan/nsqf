// src/routes/attendanceRoutes.js
import express from "express";
import { markAttendance ,getAttendanceByTrainer } from "../controllers/attendanceController.js";

const router = express.Router();

router.post("/trainer/attendance", markAttendance);
router.get("/attendance/:trainer_id", getAttendanceByTrainer);


export default router;
