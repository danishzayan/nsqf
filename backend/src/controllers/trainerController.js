// import Trainer  from '../models';
import Trainer from '../models/Trainer.js';
import User from '../models/User.js';
import SkillSchool from '../models/SkillSchool.js';

export const getAllTrainers = async (req, res) => {
  try {
    const trainers = await Trainer.findAll({
      include: [
        { model: User, as: 'user' },
        { model: SkillSchool, as: 'school' }
      ]
    });
    res.json(trainers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createTrainer = async (req, res) => {
  try {
    const { userIds, schoolId } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0 || !schoolId) {
      return res.status(400).json({ message: "userIds (array) and schoolId are required" });
    }

    // Check if school exists
    const school = await SkillSchool.findByPk(schoolId);
    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }

    let results = [];

    for (const userId of userIds) {
      // Check if user exists
      const user = await User.findByPk(userId);
      if (!user) {
        results.push({ userId, status: "failed", message: "User not found" });
        continue;
      }

      // Check if already assigned
      const existingTrainer = await Trainer.findOne({
        where: { user_id: userId, school_id: schoolId }
      });
      if (existingTrainer) {
        results.push({ userId, status: "skipped", message: "Already assigned" });
        continue;
      }

      // Assign trainer
      const trainer = await Trainer.create({ user_id: userId, school_id: schoolId });
      results.push({ userId, status: "success", trainer });
    }

    res.status(201).json({ message: "Assignment process completed", results });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// controllers/trainerController.js
export const uploadDoc = async (req, res) => {
  try {
    const { doc_type } = req.body;
    const filePath = req.file.path;

    const trainer = await Trainer.findOne({ where: { user_id: req.user.id } });
    if (!trainer) return res.status(404).json({ message: 'Trainer not found' });

    if (doc_type === 'pan') {
      trainer.pan_doc = filePath;
    } else if (doc_type === 'adhar') {
      trainer.adhar_doc = filePath;
    }

    await trainer.save();

    res.status(200).json({ message: 'File uploaded successfully', filePath });
  } catch (error) {
    res.status(500).json({ message:"Server error",error: error.message });
  }
};
