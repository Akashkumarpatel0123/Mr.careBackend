const Sequelize = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  protocol: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  logging: false,
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Register models
db.OTP = require('./OTP')(sequelize, Sequelize.DataTypes);
db.User = require('./User')(sequelize, Sequelize.DataTypes);
db.Nurse = require('./Nurse')(sequelize, Sequelize.DataTypes);
db.NurseOTP = require('./NurseOTP')(sequelize, Sequelize.DataTypes);
db.UserProfile = require('./UserProfile')(sequelize, Sequelize.DataTypes);
db.NurseKYC = require('./NurseKYC')(sequelize, Sequelize.DataTypes);

// Association
db.Nurse.hasOne(db.NurseKYC, { foreignKey: 'nurseId', as: 'kyc' });
db.NurseKYC.belongsTo(db.Nurse, { foreignKey: 'nurseId', as: 'nurse' });

module.exports = db;
