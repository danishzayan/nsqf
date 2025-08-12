import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const User = sequelize.define("User", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },
  phone: {
    type: DataTypes.STRING(15),
    allowNull: true,
    validate: { isNumeric: true, len: [10, 15]  },},
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
    },
  // new: role
  role: {
    type: DataTypes.ENUM("admin", "coordinator", "trainer" ),
    allowNull: false,
    defaultValue: "trainer"
  }
}, 
{
  tableName: "users",
  timestamps: true
});

export default User;
