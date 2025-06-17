require('dotenv').config();  // load .env variables
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  protocol: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,  // for some cloud providers like Neon
    },
  },
  logging: false,  // disable SQL logging; set to true for debugging
});

module.exports = sequelize;
