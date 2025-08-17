import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import District from "./District.js";

const City = sequelize.define("City", {
  id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true 
  },

  name: { 
    type: DataTypes.STRING(100), 
    allowNull: false 
  },

  // pincode: { 
  //   type: DataTypes.STRING(6), // Keep as string, not INTEGER
  //   allowNull: true,           // Optional if not always required
  //   validate: { 
  //     isNumeric: true,         // Only digits allowed
  //     len: [6, 6]              // Exactly 6 digits (India standard)
  //   }
  // }
}, {
  tableName: "City",
  timestamps: true
});

// Relation
// City.belongsTo(District, { foreignKey: "districtId", as: "district" });
// District.hasMany(City, { foreignKey: "districtId", as: "cities" });
;

export default City;
