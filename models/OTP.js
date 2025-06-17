// Backend/models/OTP.js

module.exports = (sequelize, DataTypes) => {
  const OTP = sequelize.define('OTP', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    otp: {
      type: DataTypes.STRING(6),
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW, // Sequelize auto handles current timestamp
    },
  }, {
    tableName: 'user_otp',
    timestamps: false,
  });

  return OTP;
};
