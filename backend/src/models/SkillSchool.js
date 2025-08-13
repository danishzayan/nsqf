// src/models/SkillSchool.js
import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const SkillSchool = sequelize.define("SkillSchool", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  city_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  schoolName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: false
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: false
  },
  geofence_radius_m: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: "skill_schools",
  timestamps: false
});

export default SkillSchool;
