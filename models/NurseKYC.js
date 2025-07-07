const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class NurseKYC extends Model {}

  NurseKYC.init({
    nurseId: { type: DataTypes.INTEGER, allowNull: false },
    dob: DataTypes.DATE,
    services: DataTypes.ARRAY(DataTypes.STRING),
    aadharNumber: DataTypes.STRING,
    higherEducationInstitute: DataTypes.STRING,
    experienceYears: DataTypes.INTEGER,
    highestEducationMarks: DataTypes.STRING,
    workHours: DataTypes.STRING,
    preferredLocation: DataTypes.STRING,
    immediateJoining: DataTypes.STRING,
    termsAccepted: DataTypes.BOOLEAN,
    documentVerification: DataTypes.BOOLEAN,
    aadharFront: DataTypes.STRING,
    aadharBack: DataTypes.STRING,
    resume: DataTypes.STRING,
    profilePhoto: DataTypes.STRING,
    experienceCertificate: DataTypes.STRING,
    policeVerification: DataTypes.STRING,
    status: { type: DataTypes.STRING, defaultValue: 'pending' },
  }, {
    sequelize,
    modelName: 'NurseKYC',
    tableName: 'nurse_kyc',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  return NurseKYC;
};
