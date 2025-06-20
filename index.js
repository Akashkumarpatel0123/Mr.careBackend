const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./models');


dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

// Middlewares
app.use(cors());
app.use(express.json());

// Routes

//auth 

app.use('/api/auth', require('./routes/authRoutes'));

//services
app.use('/api/service' , require('./routes/serviceRoutes'));



//TODO: here the start for the db
// Sync database and start server
// db.sequelize.sync() // Use { alter: true } if you want to auto-update models
//   .then(() => {
    console.log('Database connected and synced');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  // })
  // .catch((err) => {
  //   console.error('Database connection failed:', err);
  // });
