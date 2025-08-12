// src/config/multerConfig.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Trainer, SkillSchool, City, District, State } = require('../models');

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const user_id = req.user.id; // from JWT middleware

      // Fetch trainer + location info
      const trainer = await Trainer.findOne({
        where: { user_id },
        include: [{
          model: SkillSchool,
          include: [{
            model: City,
            include: [{
              model: District,
              include: [ State ]
            }]
          }]
        }]
      });

      if (!trainer) {
        return cb(new Error('Trainer not found'));
      }

      const stateName = trainer.SkillSchool.City.District.State.name;
      const districtName = trainer.SkillSchool.City.District.name;
      const schoolName = trainer.SkillSchool.name;

      const uploadPath = path.join(
        __dirname,
        '../../uploads',
        stateName,
        districtName,
        schoolName
      );

      fs.mkdirSync(uploadPath, { recursive: true });

      cb(null, uploadPath);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const doc_type = req.body.doc_type; // "pan" or "adhar"
    const ext = path.extname(file.originalname);
    cb(null, `${req.user.id}_${doc_type}${ext}`);
  }
});

module.exports = multer({ storage });
