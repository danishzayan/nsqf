import { Trainer, User, SkillSchool } from '../models';

exports.getAllTrainers = async (req, res) => {
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

exports.createTrainer = async (req, res) => {
  try {
    const trainer = await Trainer.create(req.body);
    res.status(201).json(trainer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// controllers/trainerController.js
exports.uploadDoc = async (req, res) => {
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
    res.status(500).json({ error: error.message });
  }
};
