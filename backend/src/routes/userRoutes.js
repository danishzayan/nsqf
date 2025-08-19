import express from "express";
import { register, login ,searchTrainers } from "../controllers/authController.js";

const router = express.Router();


router.post("/register", register);
router.post("/login", login);
router.get("/searchTrainer",searchTrainers)

export default router;
