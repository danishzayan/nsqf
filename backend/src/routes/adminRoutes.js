import express from "express";
import { addState, addDistrict,getDistrictsByState,getCitiesByDistrict,addCity ,getAllStates } from "../controllers/adminController.js";
import authMiddleware from "../middleware/auth.js";


const router = express.Router();

// Admin endpoints
router.post("/state",authMiddleware, addState);
router.get("getAllStates", authMiddleware,getAllStates);
router.post("/district",authMiddleware,  addDistrict);
router.post("/city", authMiddleware, addCity); // Assuming you have an addCity function
router.get("/states/:stateId/districts", getDistrictsByState);
router.get("/districts/:districtId/cities", getCitiesByDistrict);


export default router;
