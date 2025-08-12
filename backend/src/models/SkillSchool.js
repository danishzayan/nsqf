// src/models/SkillSchool.js
module.exports = (sequelize, DataTypes) => {
  const SkillSchool = sequelize.define('SkillSchool', {
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
    tableName: 'skill_schools',
    timestamps: false
  });

  SkillSchool.associate = models => {
    SkillSchool.hasMany(models.Trainer, {
      foreignKey: 'school_id',
      as: 'trainers'
    });
  };

  return SkillSchool;
};
