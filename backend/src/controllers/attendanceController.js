// src/controllers/attendanceController.js
import Attendance from "../models/Attendance.js";
import Trainer from "../models/Trainer.js";
import SkillSchool from "../models/SkillSchool.js";
// import { haversineDistance } from "../utils/geoUtils.js";

export const markAttendance = async (req, res) => {
  try {
    const { trainer_id, latitude, longitude } = req.body;

    // 1️⃣ Find Trainer & School
    const trainer = await Trainer.findByPk(trainer_id, {
      include: {
        model: SkillSchool,
        as: "school",
        attributes: ["id", "latitude", "longitude", "geofence_radius_m"]
      }
    });

    if (!trainer) {
      return res.status(404).json({ message: "Trainer not found" });
    }

    const school = trainer.school;
    if (!school) {
      return res.status(404).json({ message: "Trainer is not assigned to a school" });
    }

    // 2️⃣ Calculate Distance
    const distance = haversineDistance(
      latitude,
      longitude,
      school.latitude,
      school.longitude
    );

    // 3️⃣ Determine Status
    let status = "absent";
    if (distance <= (school.geofence_radius_m || 100)) {
      status = "present";
    }

    // 4️⃣ Save Attendance
    const attendance = await Attendance.create({
      trainer_id,
      school_id: school.id,
      latitude,
      longitude,
      geo_distance_m: Math.round(distance),
      status
    });

    res.status(201).json({
      message: "Attendance marked successfully",
      data: attendance
    });

  } catch (error) {
    res.status(500).json({ message: "Error marking attendance", error: error.message });
  }
};


export const getTrainerAttendance = async (req, res) => {
  try {
    const { id } = req.params; // trainer_id
    const { startDate, endDate } = req.query;

    // Build date filter if provided
    const where = { trainer_id: id };
    if (startDate && endDate) {
      where.timestamp = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const attendanceRecords = await Attendance.findAll({
      where,
      include: [
        {
          model: SkillSchool,
          as: "school",
          attributes: ["id", "schoolName", "address", "latitude", "longitude"]
        }
      ],
      order: [["timestamp", "DESC"]]
    });

    if (!attendanceRecords.length) {
      return res.status(404).json({ message: "No attendance records found" });
    }

    res.json({
      trainer_id: id,
      total_records: attendanceRecords.length,
      records: attendanceRecords
    });

  } catch (error) {
    res.status(500).json({ message: "Error fetching attendance history", error: error.message });
  }
};