import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import State from "./State.js";

const District = sequelize.define("District", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

  name: { 
    type: DataTypes.STRING(100), 
    allowNull: false 
  },

 pincode: { 
  type: DataTypes.STRING(6), // Keep as string, not INTEGER
  allowNull: true,           // Optional if not always required
  validate: { 
    isNumeric: true,         // Only digits allowed
    len: [6, 6]               // Exactly 6 digits (India standard)
  }
} ,
}, {
  tableName: "districts",
  timestamps: true
});

// Relations
// District.belongsTo(State, { foreignKey: "stateId", as: "state" });
// State.hasMany(District, { foreignKey: "stateId", as: "districts" });

export default District;
