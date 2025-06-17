const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config();
const { Op } = require('sequelize');
const db = require('../models');
const User = db.User;
const OTP = db.OTP;
const Nurse = db.Nurse;
const NurseOTP = db.NurseOTP;

// ==================== Nodemailer Setup ====================
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  logger: true,
  debug: true,
});

// ==================== Generate OTP ====================
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ==================== Send OTP Email ====================
exports.sendOtpEmail = async function (email, otp) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP is: ${otp} (valid for 5 minutes)`,
    });
    console.log(`✅ OTP sent to ${email}: ${otp}`);
  } catch (error) {
    console.error('❌ Failed to send OTP email:', error);
    throw error;
  }
};

// ==================== Send OTP (API) ====================
exports.sendOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  try {
    const otpCode = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await OTP.destroy({ where: { email } }); // Remove old OTP
    await OTP.create({ email, otp: otpCode, expiresAt }); // Save new OTP

    await exports.sendOtpEmail(email, otpCode);
    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('❌ Error sending OTP:', error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
};



// ==================== Register User ====================
exports.register = async (req, res) => {
  const { username, email, password, confirmPassword, otp } = req.body;

  if (!username || !email || !password || !confirmPassword || !otp) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  try {
    const validOtp = await OTP.findOne({ where: { email, otp } });
    if (!validOtp || new Date() > validOtp.expiresAt) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name: username,
      email,
      password: hashedPassword,
      role: 'user'
    });

    await OTP.destroy({ where: { email } });

    res.status(201).json({ message: 'User registered successfully', userId: newUser.id });
  } catch (error) {
    console.error('❌ Registration Error:', error);
    res.status(500).json({ message: 'Registration failed', error });
  }
};

// ==================== Login User ====================
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
};

// ==================== Nurse OTP Verification ====================
exports.nurseVerifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ success: false, message: 'Email and OTP are required.' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const otpInput = otp.toString().trim();

  try {
    const record = await NurseOTP.findOne({ where: { email: normalizedEmail } });

    if (!record) {
      return res.status(400).json({ success: false, message: 'OTP not found. Please request a new one.' });
    }

    if (new Date() > record.expiresAt) {
      await NurseOTP.destroy({ where: { email: normalizedEmail } });
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    if (record.otp !== otpInput) {
      return res.status(400).json({ success: false, message: 'Invalid OTP. Please try again.' });
    }

    const existingUser = await User.findOne({ where: { email: normalizedEmail } });

    if (existingUser && existingUser.role !== 'nurse') {
      existingUser.role = 'nurse';
      await existingUser.save();
    }

    await NurseOTP.destroy({ where: { email: normalizedEmail } });

    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully. Nurse role assigned.',
    });
  } catch (error) {
    console.error('❌ Error verifying nurse OTP:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// ==================== Nurse Registration ====================
exports.nurseRegister = async (req, res) => {
  try {
    const { name, email, mobile, password, confirmPassword } = req.body;

    if (!name || !email || !mobile || !password || !confirmPassword) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if nurse already exists
    const existingNurse = await Nurse.findOne({ where: { email: normalizedEmail } });
    if (existingNurse) {
      return res.status(400).json({ success: false, message: "Nurse already registered with this email" });
    }

    // Hash password and create nurse
    const hashedPassword = await bcrypt.hash(password, 10);
    const newNurse = await Nurse.create({
      name,
      email: normalizedEmail,
      mobile,
      password: hashedPassword,
      role: 'nurse',
      created_at: new Date(),
    });

    console.log("✅ Nurse registered successfully:", newNurse.id);

    return res.status(201).json({
      success: true,
      message: "Nurse registered successfully",
      nurseId: newNurse.id,
    });

  } catch (error) {
    console.error("❌ Nurse Registration Error:", error);
    return res.status(500).json({ success: false, message: "Server error during nurse registration." });
  }
};
// ==================== Nurse Login ====================
exports.nurseLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Email and password are required." });
  }

  try {
    const nurse = await Nurse.findOne({ where: { email } });

    if (!nurse) {
      return res
        .status(401)
        .json({ success: false, message: "Nurse not found." });
    }

    const isMatch = await bcrypt.compare(password, nurse.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid password." });
    }

    const token = jwt.sign(
      { id: nurse.id, email: nurse.email, role: nurse.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: nurse.id,
        name: nurse.name,
        email: nurse.email,
        mobile: nurse.mobile,
        role: nurse.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong on the server." });
  }
};