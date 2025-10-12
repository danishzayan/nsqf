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
// import Student from '../models/Student.js';
import TrainerAttendance from '../models/Attendance.js';
import AttendanceCorrectionRequest from '../models/AttendanceCorrectionRequest.js';
import { getDistance } from 'geolib';
// controllers/trainerAttendanceController.js
// import Trainer from '../models/Trainer.js';
// import TrainerAttendance from '../models/TrainerAttendance.js';

export const markDailyStatus = async (req, res) => {
    try {
        const { status, latitude, longitude, date } = req.body;
        const { id: trainerId } = req.user;

        const attendanceDate = date ? new Date(date) : new Date();
        const startOfDay = new Date(attendanceDate.setHours(0, 0, 0, 0));

        // 1. Check if attendance has already been marked for the day
        const existingAttendance = await TrainerAttendance.findOne({ trainerId, date: startOfDay });
        if (existingAttendance) {
            return res.status(409).json({ message: `Attendance has already been marked for ${startOfDay.toDateString()}.` });
        }

        const trainer = await Trainer.findById(trainerId);

        // 2. Handle the 'present' case with location validation
        if (status.toLowerCase() === 'present') {
            if (!latitude || !longitude) {
                return res.status(400).json({ message: 'Location is required to mark status as present.' });
            }

            const school = await School.findById(trainer.schoolId);
            const distance = getDistance(
                { latitude, longitude },
                { latitude: school.location.coordinates[1], longitude: school.location.coordinates[0] }
            );

            // --- NEW LOGIC: Block if too far away ---
            if (distance > 100) {
                // Return an error and DO NOT save anything
                return res.status(400).json({ 
                    message: `You are ${Math.round(distance)} meters away from the school. Your attendance was not marked.` 
                });
            }
            // --- END OF NEW LOGIC ---

            // If the distance is okay, create the 'present' record
            const newAttendance = await TrainerAttendance.create({
                trainerId,
                schoolId: trainer.schoolId,
                date: startOfDay,
                status: 'present',
                checkInTime: new Date(),
            });
            return res.status(201).json({ message: `Attendance marked as present for ${startOfDay.toDateString()}.`, data: newAttendance });
        }
        
        // 3. Handle other statuses like 'absent' directly
        const newAttendance = await TrainerAttendance.create({
            trainerId,
            schoolId: trainer.schoolId,
            date: startOfDay,
            status: status.toLowerCase(),
            checkInTime: null,
        });

        return res.status(201).json({ message: `Attendance marked as ${status.toLowerCase()} for ${startOfDay.toDateString()}.`, data: newAttendance });

    } catch (error) {
        console.error('Error marking daily status:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};

// controllers/trainerAttendanceController.js (the second function)

export const checkOut = async (req, res) => {
    try {
        const { latitude, longitude, date } = req.body;
        const { id: trainerId } = req.user;

        if (!latitude || !longitude) {
            return res.status(400).json({ message: 'Location is required to check out.' });
        }

        const attendanceDate = date ? new Date(date) : new Date();
        const startOfDay = new Date(attendanceDate.setHours(0, 0, 0, 0));

        // 1. Fetch attendance record
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

        // 2. Get trainer and school for distance validation
        const trainer = await Trainer.findById(trainerId);
        const school = await School.findById(trainer.schoolId);

        if (!school || !school.location || !school.location.coordinates) {
            return res.status(400).json({ message: 'School location is not defined.' });
        }

        // 3. Calculate distance from school
        const distance = getDistance(
            { latitude, longitude },
            {
                latitude: school.location.coordinates[1],
                longitude: school.location.coordinates[0],
            }
        );

        // Block checkout if more than 100 meters away
        if (distance > 100) {
            return res.status(400).json({
                message: `You are ${Math.round(distance)} meters away from the school. Check-out not allowed.`,
            });
        }

        // 4. Set checkout time and calculate worked minutes
        attendanceRecord.checkOutTime = new Date();

        if (attendanceRecord.checkInTime) {
            const durationInMs = attendanceRecord.checkOutTime - attendanceRecord.checkInTime;
            attendanceRecord.totalMinutesWorked = Math.round(durationInMs / (1000 * 60));
        }

        await attendanceRecord.save();

        res.status(200).json({ message: 'Check-out successful.', data: attendanceRecord });

    } catch (error) {
        console.error('Error during checkout:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};

export const getCalendarAttendance = async (req, res) => {
    try {
        // --- NEW: Default to current year and month if not provided ---
        const now = new Date();
        const year = req.query.year || now.getFullYear();
        const month = req.query.month || (now.getMonth() + 1); // getMonth() is 0-indexed
        const { trainerId } = req.query;
        // --- END OF NEW LOGIC ---

        const startDate = new Date(Date.UTC(year, month - 1, 1));
        const endDate = new Date(Date.UTC(year, month, 1));

        const query = {
            date: { $gte: startDate, $lt: endDate }
        };

        if (trainerId) {
            query.trainerId = trainerId;
        }

        const attendanceRecords = await TrainerAttendance.find(query).select('date status totalMinutesWorked');

        const calendarData = {};
        for (const record of attendanceRecords) {
            const dateKey = record.date.toISOString().split('T')[0];
            
            calendarData[dateKey] = {
                status: record.status,
                totalHour: record.totalMinutesWorked 
  ? (record.totalMinutesWorked / 60).toFixed(2) 
  : 0
            };
        }

        res.status(200).json({
            message: 'Calendar data fetched successfully.',
            data: calendarData
        });

    } catch (error) {
        console.error('Error fetching calendar attendance:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};

// Controller for the trainer correction request of attendance
export const createCorrectionRequest = async (req, res) => {
    try {
        const { attendanceId, reason } = req.body;
        const trainerId = req.user.id; // From authenticated trainer's token

        // Find the original attendance record
        const attendance = await Attendance.findById(attendanceId);

        // Validation Checks
        if (!attendance) {
            return res.status(404).json({ message: "Attendance record not found." });
        }
        if (attendance.status !== 'absent') {
            return res.status(400).json({ message: "Can only request correction for an 'absent' record." });
        }

        // --- THE 4-DAY RULE ---
        const attendanceDate = new Date(attendance.date);
        const today = new Date();
        const fourDays = 4 * 24 * 60 * 60 * 1000; // 4 days in milliseconds
        
        if (today - attendanceDate > fourDays) {
            return res.status(403).json({ message: "Correction request denied. The 4-day window has passed." });
        }
        
        // Find the trainer to get their coordinatorId
        const trainer = await Trainer.findById(trainerId);
        if (!trainer || !trainer.coordinatorId) {
             return res.status(400).json({ message: "You are not assigned to a coordinator." });
        }

        // Create the new request
        const newRequest = new AttendanceCorrectionRequest({
            attendanceId,
            reason,
            trainerId,
            coordinatorId: trainer.coordinatorId,
            companyId: req.user.companyId
        });

        await newRequest.save();
        res.status(201).json({ message: "Your request has been sent to your coordinator for approval." });

    } catch (error) {
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
};