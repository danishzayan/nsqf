// src/models/Trainer.js
import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Trainer = sequelize.define("Trainer", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  school_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  coordinator_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  pan_doc: {
    type: DataTypes.STRING,
    allowNull: true
  },
  bank_account: {
    type: DataTypes.STRING,
    allowNull: true
  },
  ifsc_code: {
    type: DataTypes.STRING,
    allowNull: true
  },
  doc_status: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: "trainers",
  timestamps: false
});

export default Trainer;
