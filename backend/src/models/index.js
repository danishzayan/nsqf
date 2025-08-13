// src/models/index.js
import State from "./State.js";
import District from "./District.js";
import City from "./City.js";
import SkillSchool from "./SkillSchool.js";
import Trainer from "./Trainer.js";
import User from "./User.js"; // Assuming you have a User model

// State → District
State.hasMany(District, { foreignKey: "stateId", as: "districts" });
District.belongsTo(State, { foreignKey: "stateId", as: "state" });

// District → City
District.hasMany(City, { foreignKey: "districtId", as: "cities" });
City.belongsTo(District, { foreignKey: "districtId", as: "district" });

// City → School
City.hasMany(SkillSchool, { foreignKey: "city_id", as: "schools" });
SkillSchool.belongsTo(City, { foreignKey: "city_id", as: "city" });

// School → Trainer
SkillSchool.hasMany(Trainer, { foreignKey: "school_id", as: "trainers" });
Trainer.belongsTo(SkillSchool, { foreignKey: "school_id", as: "school" });

// Trainer → User
Trainer.belongsTo(User, { foreignKey: "user_id", as: "user" });

// Trainer → Coordinator (Self Reference)
Trainer.belongsTo(Trainer, { foreignKey: "coordinator_id", as: "coordinator" });

export { State, District, City, SkillSchool, Trainer, User };
