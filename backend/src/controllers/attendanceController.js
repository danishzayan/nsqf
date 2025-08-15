// src/controllers/attendanceController.js
import Attendance from "../models/Attendance.js";
// import Trainer from "../models/Trainer.js";
// import SkillSchool from "../models/SkillSchool.js";
import { Trainer, SkillSchool ,User} from "../models/index.js";

// import { haversineDistance } from "../utils/geoUtils.js";

export const markAttendance = async (req, res) => {
  try {
    const { trainer_id, latitude, longitude, status } = req.body;

    console.log("Marking attendance for trainer (user.id):", trainer_id);

    // 1️⃣ Check if trainer user exists and has role 'trainer'
    const userExists = await User.findOne({
      where: { id: trainer_id, role: "trainer" }
    });

  console.log("User exists:", userExists); 
    if (!userExists) {
      return res.status(404).json({
        message: "Trainer user not found or role is not 'trainer'"
      });
    }

    // 2️⃣ Find trainer record linked to this user
    const trainer = await Trainer.findOne({
      where: { user_id: trainer_id },
      include: [
        {
          model: SkillSchool,
          as: "school",
          attributes: ["id", "latitude", "longitude", "geofence_radius_m"]
        }
      ]
    });
    console.log("Trainer record found:", trainer);
    if (!trainer) {
      return res.status(404).json({
        message: "Trainer record not found"
      });
    }

    if (!trainer.school) {
      return res.status(404).json({
        message: "Trainer is not assigned to a school"
      });
    }

    // ✅ Optional distance calculation
    // const distance = haversineDistance(
    //   latitude,
    //   longitude,
    //   trainer.school.latitude,
    //   trainer.school.longitude
    // );

    // 3️⃣ Create attendance record
    const attendance = await Attendance.create({
  trainer_id,          // now valid FK to users.id
  school_id: trainer.school.id,
  latitude,
  longitude,
  status
});

    res.status(201).json({
      message: "Attendance marked successfully",
      data: attendance
    });

  } catch (error) {
    console.error("Error marking attendance:", error);
    res.status(500).json({
      message: "Error marking attendance",
      error: error.message
    });
  }
};




import { Op, fn, col, literal } from "sequelize";

export const getAttendanceByTrainer = async (req, res) => {
  try {
    const { trainer_id } = req.params; // trainer_id = users.id
    const { start_date, end_date } = req.query; // optional filters

    console.log("Fetching attendance for trainer (user.id):", trainer_id);

    // 1️⃣ Verify trainer exists
    const trainerUser = await User.findOne({
      where: { id: trainer_id, role: "trainer" },
    });
    if (!trainerUser) {
      return res.status(404).json({
        message: "Trainer user not found or role is not 'trainer'",
      });
    }

    // 2️⃣ Build filter
    const whereCondition = { trainer_id };
    if (start_date && end_date) {
      whereCondition.timestamp = {
        [Op.between]: [
          new Date(start_date + " 00:00:00"),
          new Date(end_date + " 23:59:59"),
        ],
      };
    } else if (start_date) {
      whereCondition.timestamp = {
        [Op.gte]: new Date(start_date + " 00:00:00"),
      };
    } else if (end_date) {
      whereCondition.timestamp = {
        [Op.lte]: new Date(end_date + " 23:59:59"),
      };
    }

    // 3️⃣ Fetch only one record per day (latest one)
    const attendanceRecords = await Attendance.findAll({
      where: whereCondition,
      attributes: [
        [fn("DATE", col("timestamp")), "date"], // only date part
        [fn("MAX", col("timestamp")), "latest_timestamp"], // latest time in that day
        "status"
      ],
      group: [literal("DATE(`timestamp`)"), "status"], // group by date & status
      order: [[fn("MAX", col("timestamp")), "DESC"]],
    });

    if (!attendanceRecords.length) {
      return res.status(404).json({
        message: "No attendance records found for this trainer",
      });
    }

    res.status(200).json({
      message: "Attendance records fetched successfully (one per day)",
      data: attendanceRecords,
    });

  } catch (error) {
    console.error("Error fetching attendance:", error);
    res.status(500).json({
      message: "Error fetching attendance",
      error: error.message,
    });
  }
};
