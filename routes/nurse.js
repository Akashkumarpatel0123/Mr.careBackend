const express = require('express');
const router = express.Router();
const { Nurse, NurseKYC } = require('../models');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// ✅ Get all nurse registrations (admin)
router.get('/nurses', async (req, res) => {
  try {
    const nurses = await Nurse.findAll({
      include: NurseKYC,
      order: [['createdAt', 'DESC']],
    });
    res.json(nurses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch nurses' });
  }
});

// ✅ Approve/Reject nurse KYC
router.patch('/nurses/:id/status', async (req, res) => {
  const { status } = req.body;
  if (!['Approved', 'Rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const kyc = await NurseKYC.findOne({ where: { nurseId: req.params.id } });
    if (!kyc) return res.status(404).json({ message: 'KYC not found' });

    kyc.status = status;
    await kyc.save();

    res.json({ success: true, kyc });
  } catch (err) {
    console.error('Status update error:', err);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// ✅ New: KYC Route (replaces /register)
router.post(
  '/kyc',
  upload.fields([
    { name: 'aadharFront' },
    { name: 'aadharBack' },
    { name: 'resume' },
    { name: 'profilePhoto' },
    { name: 'experienceCertificate' },
    { name: 'policeVerification' },
  ]),
  async (req, res) => {
    try {
      const { fullName, email, phoneNumber,  ...kycData } = req.body;

      // 1. Create nurse basic info
      const nurse = await Nurse.create({
         name: fullName,
        email,
        mobile: phoneNumber,
        
      });

      // 2. Upload KYC details
      const kyc = await NurseKYC.create({
        nurseId: nurse.id,
        ...kycData,
        services: kycData.services ? JSON.parse(kycData.services) : [],
        aadharFront: req.files?.aadharFront?.[0]?.path,
        aadharBack: req.files?.aadharBack?.[0]?.path,
        resume: req.files?.resume?.[0]?.path,
        profilePhoto: req.files?.profilePhoto?.[0]?.path,
        experienceCertificate: req.files?.experienceCertificate?.[0]?.path,
        policeVerification: req.files?.policeVerification?.[0]?.path,
        termsAccepted: kycData.termsAccepted === 'true',
        documentVerification: kycData.documentVerification === 'true',
        status: 'Pending',
      });

      res.status(201).json({ success: true, nurse, kyc });
    } catch (error) {
      console.error('Error in KYC submission:', error);
      res.status(500).json({ success: false, error: 'KYC submission failed' });
    }
  }
);

module.exports = router;
