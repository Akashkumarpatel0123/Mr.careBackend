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

// Import models after defining sequelize
db.OTP = require('./OTP')(sequelize, Sequelize.DataTypes);
db.User = require('./User')(sequelize, Sequelize.DataTypes);
db.Nurse = require('./Nurse')(sequelize, Sequelize.DataTypes);
db.NurseOTP = require('./NurseOTP')(sequelize, Sequelize.DataTypes);
module.exports = db;
