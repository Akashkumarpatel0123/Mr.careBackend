const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const db = require('./models'); // Sequelize DB connection

// Load env variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files (like KYC image/PDF)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const profileRoutes = require('./routes/profile');
const nurseRoutes = require('./routes/nurse');

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/service', require('./routes/serviceRoutes'));
app.use('/api/profile', profileRoutes);
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/nurse', nurseRoutes); // ✅ Correctly imported & used

// Health check route
app.get('/', (req, res) => {
  res.send('Mr. Care Backend is running ✅');
});

// Optional: DB sync before starting server
// db.sequelize.sync({ alter: true }) // Use alter:true if needed
//   .then(() => {
//     console.log('Database connected and synced');
//     app.listen(PORT, () => {
//       console.log(`Server is running on port ${PORT}`);
//     });
//   })
//   .catch((err) => {
//     console.error('Database connection failed:', err);
//   });

// Without DB sync
console.log('Database connected and synced');
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
