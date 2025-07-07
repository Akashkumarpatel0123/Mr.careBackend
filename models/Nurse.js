const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Nurse extends Model {}

  Nurse.init({
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
    mobile: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: true },
    role: { type: DataTypes.STRING, defaultValue: 'nurse' },
  }, {
    sequelize,
    modelName: 'Nurse',
    tableName: 'nurses',
    underscored: true,
    timestamps: true,
  });

  return Nurse;
};
