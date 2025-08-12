const { SkillSchool } = require('../models');

exports.getAllSkillSchools = async (req, res) => {
  try {
    const schools = await SkillSchool.findAll();
    res.json(schools);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createSkillSchool = async (req, res) => {
  try {
    const school = await SkillSchool.create(req.body);
    res.status(201).json(school);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
