import express from "express";
import { getSchoolsByCity ,getSchoolsByDistrict,getSchoolsByState ,createSkillSchool ,searchSkillSchools  } from "../controllers/skillSchoolController.js";

const router = express.Router();
router.post("/createSchool", createSkillSchool);
// router.get("/all", getAllSkillSchools);
router.get("/searchSchool", searchSkillSchools);
router.get("/city/:cityId", getSchoolsByCity);
router.get("/district/:districtId", getSchoolsByDistrict);
router.get("/state/:stateId", getSchoolsByState);

// router.get("/city/:cityId/schools", getSchoolsByCity);


export default router;