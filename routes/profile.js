const express = require('express');
const router = express.Router();
const { saveProfile, getProfileByUserId } = require('../controllers/profile.controller');

// POST /api/profile
router.post('/', saveProfile);

// GET /api/profile/:id
router.get('/:id', getProfileByUserId);

module.exports = router;
