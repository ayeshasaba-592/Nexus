const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth'); // Path to your auth middleware

// @route    GET api/profile/me
// @desc     Get current user profile
router.get('/me', auth, async (req, res) => { // Added 'auth' here
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Update Profile API
router.put('/update', auth, async (req, res) => {
    try {
        // 1.  ALL FIELDS HERE s
        const { 
            userId, 
            bio, 
            location, 
            startupHistory, 
            industry, 
            fundingNeeded, 
            investmentRange 
        } = req.body;

        // 2. Security Check
        if (req.user.id !== userId) {
            return res.status(401).json({ msg: "User not authorized" });
        }

        // 3. Perform the Update
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { 
                $set: { 
                    bio: bio, 
                    location: location, 
                    startupHistory: startupHistory,
                    industry: industry, 
                    fundingNeeded: fundingNeeded, 
                    investmentRange: investmentRange,
                } 
            },
            { new: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ msg: "User not found" });
        }

        res.json(updatedUser);
    } catch (err) {
        console.error("Update Error:", err.message);
        //  .json so frontend doesn't get "Unexpected Token S"
        res.status(500).json({ msg: "Server Error", error: err.message });
    }
});
// @route    GET api/profile/user/:id
// @desc     Get profile by user ID
router.get('/user/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(500).send('Server Error');
  }
});
// @route    GET api/profile/all/investors
router.get('/all/investors', async (req, res) => {
  try {
    const investors = await User.find({ role: 'investor' }).select('-password');
    res.json(investors);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route    GET api/profile/all/entrepreneurs
router.get('/all/entrepreneurs', async (req, res) => {
  try {
    const entrepreneurs = await User.find({ role: 'entrepreneur' }).select('-password');
    res.json(entrepreneurs);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;