const db = require('../models'); // Adjust the path as necessary
const UserProfile = db.UserProfile;
// Save or update user profile
const saveProfile = async (req, res) => {
  try {
    const {
      user_id,
      username,
      email,
      mobile,
      address,
      pincode,
      landmark,
      countryCode,
    } = req.body;

    if (!user_id || !mobile || !address || !pincode) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if profile already exists
    let profile = await UserProfile.findOne({ where: { user_id } });

    if (profile) {
      // Update existing profile
      await profile.update({
        username,
        email,
        mobile,
        address,
        pincode,
        landmark,
        country_code: countryCode,
      });

      return res.status(200).json({ message: 'Profile updated successfully', data: profile });
    } else {
      // Create new profile
      profile = await UserProfile.create({
        user_id,
        username,
        email,
        mobile,
        address,
        pincode,
        landmark,
        country_code: countryCode,
      });

      return res.status(201).json({ message: 'Profile created successfully', data: profile });
    }
  } catch (error) {
    console.error('Error saving profile:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
};
const getProfileByUserId = async (req, res) => {
  const user_id = req.params.id;

  try {
    const profile = await UserProfile.findOne({ where: { user_id } });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.status(200).json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
};

module.exports = {
  saveProfile,
  getProfileByUserId,
};