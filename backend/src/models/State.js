import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const State = sequelize.define("State", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  stateName: { type: DataTypes.STRING(100), allowNull: false, unique: true }
}, {
  tableName: "states",
  timestamps: true
});

export default State;
