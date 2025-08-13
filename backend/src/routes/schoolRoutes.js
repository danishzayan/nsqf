import express from "express";
import { getSchoolsByCity ,getSchoolsByDistrict,getSchoolsByState ,createSkillSchool } from "../controllers/skillSchoolController.js";

const router = express.Router();
router.post("/createSchool", createSkillSchool);
router.get("/city/:cityId", getSchoolsByCity);
router.get("/district/:districtId", getSchoolsByDistrict);
router.get("/state/:stateId", getSchoolsByState);

export default router;