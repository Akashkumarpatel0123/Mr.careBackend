// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../models');
const nodemailer = require('nodemailer');
const bcrypt = require("bcryptjs");
const authController = require('../controllers/authController');

const {
  sendOtpEmail,
  nurseRegister,
  nurseVerifyOtp,
  register,
  login,
  nurseLogin,
} = authController;

const OTP = db.OTP;
const NurseOTP = db.NurseOTP;

// ==================== Nodemailer Transport ====================
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  logger: true,
  debug: true,
});

// ==================== Generate 6-digit OTP ====================
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ==================== SEND OTP ====================
router.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

  try {
    await OTP.destroy({ where: { email } });
    await OTP.create({ email, otp, expiresAt });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP is: ${otp} (valid for 5 minutes)`,
    });

    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// ==================== Nurse Send OTP ====================
router.post('/nurse-send-otp', async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ error: 'Email is required' });

  const normalizedEmail = email.toLowerCase().trim();
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // Valid for 5 min

  try {
    // Remove any previous OTP for this email
    await NurseOTP.destroy({ where: { email: normalizedEmail } });

    // Save new OTP
    await NurseOTP.create({ email: normalizedEmail, otp, expiresAt });

    console.log(`✅ OTP ${otp} saved for ${normalizedEmail}`);

    // For debugging: check all OTPs for that email
    const allOTPs = await NurseOTP.findAll({ where: { email: normalizedEmail } });
    console.log("📦 Stored OTPs in DB:", allOTPs.map(o => o.otp));

    // Send OTP via email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: normalizedEmail,
      subject: 'Your Nurse OTP Code',
      text: `Your Nurse OTP is: ${otp} (valid for 5 minutes)`,
    });

    res.status(200).json({ message: 'OTP sent to nurse email successfully' });
  } catch (error) {
    console.error('❌ Error sending nurse OTP:', error);
    res.status(500).json({ error: 'Failed to send nurse OTP' });
  }
});

// ==================== VERIFY RESET OTP ====================
router.post("/verify-reset-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    const record = await OTP.findOne({ where: { email } });
    if (!record) return res.status(400).json({ error: "OTP not found" });
    if (new Date() > record.expiresAt) return res.status(400).json({ error: "OTP has expired" });
    if (record.otp !== otp) return res.status(400).json({ error: "Invalid OTP" });
    
    await OTP.destroy({ where: { email } });
    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ error: "OTP verification failed" });
  }
});

// ==================== RESEND OTP ====================
router.post("/resend-otp", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await OTP.upsert({ email, otp, expiresAt });
    await sendOtpEmail(email, otp);

    return res.status(200).json({ message: "OTP resent successfully" });
  } catch (error) {
    console.error("RESEND OTP ERROR:", error);
    return res.status(500).json({ error: "Failed to resend OTP" });
  }
});

// ==================== RESET PASSWORD ====================
router.post("/reset-password", async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const user = await db.User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashedPassword });

    await OTP.destroy({ where: { email } });
    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ==================== REGISTER & LOGIN ====================
router.post('/register', register);
router.post('/login', login);


// ==================== Nurse Auth ====================
router.post('/nurse-register', nurseRegister);
router.post('/nurse-verify-otp', nurseVerifyOtp); 
router.post("/nurse-login", nurseLogin);


// searching

router.get('/api/service/search',(req,res)=>{
  console.log(req.query);
})


module.exports = router;
