import SkillSchool from "../models/SkillSchool.js";
import { Op } from "sequelize";

export const getAllSkillSchools = async (req, res) => {
  try {
    res.json({ message: "All Skill Schools" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export const searchSkillSchools = async (req, res) => {
  try {
    const { name } = req.query; // e.g. ?name=schoolName
    console.log("Searching skill schools with name:", name);  
    let whereCondition = {};
    if (name) {
      whereCondition.schoolName = {
        [Op.like]: `%${name}%`, // partial match
      };
    }
    const skillSchools = await SkillSchool.findAll({
      where: whereCondition,
      attributes: ["id", "schoolName"],
    });
    res.json(skillSchools);
  }
  catch (error) {
    res.status(500).json({ message: "Error fetching skill schools", error: error.message });
  }
  };
export const createSkillSchool = async (req, res) => {
  try {
    const { schoolName, address, cities_id, latitude, longitude } = req.body;
    console.log("Creating Skill School:", schoolName, address, cities_id, latitude, longitude);

    if (!cities_id || !address || !schoolName) {
      return res.status(400).json({ message: "City ID, address, and school name are required" });
    }

    const school = await SkillSchool.create({
      schoolName,
      address,
      city_id: cities_id, // match your model's field name
      latitude,
      longitude
    });

    res.status(201).json(
      { success: true, school }
      );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


  export const getSchoolsByCity = async (req, res) => {
    try {
      const { cityId } = req.params;

      const schools = await SkillSchool.findAll({
        where: { city_id: cityId },
        include: [
          {
            model: City,
            as: "city",
            attributes: ["id", "name", "pincode"],
            include: [
              {
                model: District,
                as: "district",
                attributes: ["id", "name", "pincode"],
                include: [
                  {
                    model: State,
                    as: "state",
                    attributes: ["id", "name", "code"]
                  }
                ]
              }
            ]
          }
        ],
        order: [["id", "ASC"]]
      });

      if (!schools.length) {
        return res.status(404).json({ message: "No schools found for this city" });
      }

      res.json(schools);

    } catch (error) {
      res.status(500).json({ message: "Error fetching schools", error: error.message });
    }
  };

  export const getSchoolsByDistrict = async (req, res) => {
  try {
    const { districtId } = req.params;

    const schools = await SkillSchool.findAll({
      include: [
        {
          model: City,
          as: "city",
          attributes: ["id", "name", "pincode"],
          where: { districtId }, // filter cities by districtId
          include: [
            {
              model: District,
              as: "district",
              attributes: ["id", "name", "pincode"],
              include: [
                {
                  model: State,
                  as: "state",
                  attributes: ["id", "name", "code"]
                }
              ]
            }
          ]
        }
      ],
      order: [["id", "ASC"]]
    });

    if (!schools.length) {
      return res.status(404).json({ message: "No schools found for this district" });
    }

    res.json(schools);

  } catch (error) {
    res.status(500).json({ message: "Error fetching schools", error: error.message });
  }
};
export const getSchoolsByState = async (req, res) => {
  try {
    const { stateId } = req.params;

    const schools = await SkillSchool.findAll({
      include: [
        {
          model: City,
          as: "city",
          attributes: ["id", "name", "pincode"],
          include: [
            {
              model: District,
              as: "district",
              attributes: ["id", "name", "pincode"],
              where: { stateId }, // filter districts by stateId
              include: [
                {
                  model: State,
                  as: "state",
                  attributes: ["id", "name", "code"]
                }
              ]
            }
          ]
        }
      ],
      order: [["id", "ASC"]]
    });

    if (!schools.length) {
      return res.status(404).json({ message: "No schools found for this state" });
    }

    res.json(schools);

  } catch (error) {
    res.status(500).json({ message: "Error fetching schools", error: error.message });
  }
};

