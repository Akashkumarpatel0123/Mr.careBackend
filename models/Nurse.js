const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Nurse extends Model {}

  Nurse.init(
    {
      name: { type: DataTypes.STRING, allowNull: false },
      email: { type: DataTypes.STRING, allowNull: false, unique: true },
      mobile: { type: DataTypes.STRING },
      password: { type: DataTypes.STRING },
      role: { type: DataTypes.STRING, defaultValue: 'nurse' },
      
     
    },
    {
      sequelize,
      modelName: 'Nurse',
      tableName: 'nurses',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return Nurse;
};
