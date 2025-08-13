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
    // const trainer = await Trainer.create(req.body);
    const { userId, schoolId, } = req.body;
    // const user = await trainer.findOne(userId);
    // if (user) {
    //   return res.status(404).json({ message: "user" });
    // }
    if (!userId || !schoolId) {
      return res.status(400).json({ message: "user_id and school_id are required" });
    }
    const trainer = await Trainer.create({
      
      user_id: userId,
      school_id: schoolId
    });
    res.status(201).json(trainer);
  } catch (err) {
    res.status(500).json({  message:"Server error",error: err.message });
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
