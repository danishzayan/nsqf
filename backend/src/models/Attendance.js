// src/models/Attendance.js
import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Trainer from "./Trainer.js";
import SkillSchool from "./SkillSchool.js";

const Attendance = sequelize.define("Attendance", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  trainer_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  school_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },

  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: false
  },

  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: false
  },

//   geo_distance_m: {
//     type: DataTypes.INTEGER,
//     allowNull: true // distance from school in meters
//   },

  status: {
    type: DataTypes.ENUM("present", "absent", "late", "pending"),
    allowNull: false,
    defaultValue: "pending"
  },

  reason: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: "attendance",
  timestamps: false
});

// ✅ Associations
Attendance.belongsTo(Trainer, { foreignKey: "trainer_id", as: "trainer" });
Trainer.hasMany(Attendance, { foreignKey: "trainer_id", as: "attendanceRecords" });

Attendance.belongsTo(SkillSchool, { foreignKey: "school_id", as: "school" });
SkillSchool.hasMany(Attendance, { foreignKey: "school_id", as: "attendance" });

export default Attendance;
