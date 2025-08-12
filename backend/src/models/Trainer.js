// src/models/Trainer.js
module.exports = (sequelize, DataTypes) => {
  const Trainer = sequelize.define('Trainer', {
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
    tableName: 'trainers',
    timestamps: false
  });

  Trainer.associate = models => {
    Trainer.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
    Trainer.belongsTo(models.SkillSchool, {
      foreignKey: 'school_id',
      as: 'school'
    });
    Trainer.belongsTo(models.Trainer, {
      foreignKey: 'coordinator_id',
      as: 'coordinator'
    });
  };

  return Trainer;
};
