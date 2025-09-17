// // import Trainer  from '../models';
// import Trainer from '../models/Trainer.js';
// import User from '../models/User.js';
// import SkillSchool from '../models/SkillSchool.js';

// export const getAllTrainers = async (req, res) => {
//   try {
//     const trainers = await Trainer.findAll({
//       include: [
//         { model: User, as: 'user' },
//         { model: SkillSchool, as: 'school' }
//       ]
//     });
//     res.json(trainers);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// export const createTrainer = async (req, res) => {
//   try {
//     const { userIds, schoolId } = req.body;

//     if (!Array.isArray(userIds) || userIds.length === 0 || !schoolId) {
//       return res.status(400).json({ message: "userIds (array) and schoolId are required" });
//     }

//     // Check if school exists
//     const school = await SkillSchool.findByPk(schoolId);
//     if (!school) {
//       return res.status(404).json({ message: "School not found" });
//     }

//     let results = [];

//     for (const userId of userIds) {
//       // Check if user exists
//       const user = await User.findByPk(userId);
//       if (!user) {
//         results.push({ userId, status: "failed", message: "User not found" });
//         continue;
//       }

//       // Check if already assigned
//       const existingTrainer = await Trainer.findOne({
//         where: { user_id: userId, school_id: schoolId }
//       });
//       if (existingTrainer) {
//         results.push({ userId, status: "skipped", message: "Already assigned" });
//         continue;
//       }

//       // Assign trainer
//       const trainer = await Trainer.create({ user_id: userId, school_id: schoolId });
//       results.push({ userId, status: "success", trainer });
//     }

//     res.status(201).json({ message: "Assignment process completed", results });
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// // controllers/trainerController.js
// export const uploadDoc = async (req, res) => {
//   try {
//     const { doc_type } = req.body;
//     const filePath = req.file.path;

//     const trainer = await Trainer.findOne({ where: { user_id: req.user.id } });
//     if (!trainer) return res.status(404).json({ message: 'Trainer not found' });

//     if (doc_type === 'pan') {
//       trainer.pan_doc = filePath;
//     } else if (doc_type === 'adhar') {
//       trainer.adhar_doc = filePath;
//     }

//     await trainer.save();

//     res.status(200).json({ message: 'File uploaded successfully', filePath });
//   } catch (error) {
//     res.status(500).json({ message:"Server error",error: error.message });
//   }
// };

// controllers/attendanceController.js
import School from '../models/School.js';
import Trainer from '../models/Trainer.js';
import Student from '../models/Student.js';
import Attendance from '../models/Attendance.js';
import { getDistance } from 'geolib';
// controllers/trainerAttendanceController.js
import Trainer from '../models/Trainer.js';
import TrainerAttendance from '../models/TrainerAttendance.js';
import School from '../models/School.js';
import { getDistance } from 'geolib';

export const markDailyStatus = async (req, res) => {
    try {
        // Destructure date from the request body
        const { status, latitude, longitude, date } = req.body;
        const { id: trainerId } = req.user;

        // Use the provided date or default to the current date
        const attendanceDate = date ? new Date(date) : new Date();
        const startOfDay = new Date(attendanceDate.setHours(0, 0, 0, 0));
        
        const existingAttendance = await TrainerAttendance.findOne({ trainerId, date: startOfDay });
        if (existingAttendance) {
            return res.status(409).json({ message: `Attendance has already been marked for ${startOfDay.toDateString()}.` });
        }

        let finalStatus = status.toLowerCase();
        let checkInTime = null;
        let checkInLocation = null;
        let responseMessage = '';

        const trainer = await Trainer.findById(trainerId);

        // --- Core Logic for 'present' status ---
        if (finalStatus === 'present') {
            if (!latitude || !longitude) {
                return res.status(400).json({ message: 'Location is required to mark status as present.' });
            }

            const school = await School.findById(trainer.schoolId);
            const distance = getDistance({ latitude, longitude }, { latitude: school.location.coordinates[1], longitude: school.location.coordinates[0] });

            // ** Override logic: If too far, mark as absent **
            if (distance > 100) {
                finalStatus = 'absent';
                responseMessage = `You were ${distance} meters away and have been marked absent for ${startOfDay.toDateString()}.`;
            } else {
                checkInTime = new Date(); // Record current time for check-in
                checkInLocation = { type: 'Point', coordinates: [longitude, latitude] };
                responseMessage = `Attendance marked as present for ${startOfDay.toDateString()}.`;
            }
        } else {
             responseMessage = `Attendance marked as ${finalStatus} for ${startOfDay.toDateString()}.`;
        }

        // Create the final attendance record
        const newAttendance = await TrainerAttendance.create({
            trainerId,
            schoolId: trainer.schoolId,
            date: startOfDay,
            status: finalStatus,
            checkInTime,
            checkInLocation,
        });

        res.status(201).json({ message: responseMessage, data: newAttendance });

    } catch (error) {
        console.error('Error marking daily status:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};

// controllers/trainerAttendanceController.js (the second function)

export const checkOut = async (req, res) => {
    try {
        // Destructure date from the request body
        const { latitude, longitude, date } = req.body;
        const { id: trainerId } = req.user;

        if (!latitude || !longitude) {
            return res.status(400).json({ message: 'Location is required to check out.' });
        }

        // Use the provided date or default to the current date
        const attendanceDate = date ? new Date(date) : new Date();
        const startOfDay = new Date(attendanceDate.setHours(0, 0, 0, 0));

        const attendanceRecord = await TrainerAttendance.findOne({ trainerId, date: startOfDay });

        if (!attendanceRecord) {
            return res.status(404).json({ message: `No attendance record found for ${startOfDay.toDateString()}.` });
        }
        if (attendanceRecord.status !== 'present') {
             return res.status(400).json({ message: 'Cannot check out as you were not marked present.' });
        }
        if (attendanceRecord.checkOutTime) {
            return res.status(409).json({ message: 'You have already checked out for this day.' });
        }
        
        attendanceRecord.checkOutTime = new Date(); // Record current time for checkout
        attendanceRecord.checkOutLocation = { type: 'Point', coordinates: [longitude, latitude] };
        await attendanceRecord.save();

        res.status(200).json({ message: 'Check-out successful.', data: attendanceRecord });

    } catch (error)
    {
        console.error('Error during checkout:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};