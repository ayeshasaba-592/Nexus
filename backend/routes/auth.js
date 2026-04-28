const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// @route   POST api/auth/register
// @desc    Register a new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "User already exists" });

    // Create the user. THE MODEL WILL HASH THE PASSWORD AUTOMATICALLY.
    user = new User({ name, email, password, role });
    await user.save();

    // Generate JWT immediately after saving
    const payload = { user: { id: user.id, role: user.role } };
    
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '2h' },
      (err, token) => {
        if (err) throw err;
        return res.status(201).json({ token, msg: "Registered Successfully" });
      }
    );
  } catch (err) {
    console.error("REGISTER ERROR:", err.message);
    res.status(500).json({ error: "Server Error" });
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body; 

    // 1. Find the user first
    const user = await User.findOne({ email, role }); 
    
    if (!user) {
      console.log("❌ User not found with this email and role.");
      return res.status(400).json({ msg: "Invalid Credentials or Wrong Role" });
    }

    // 2. NOW compare the password
    const isMatch = await bcrypt.compare(password, user.password);
    
    console.log("--- Login Debug ---");
    console.log("Password Matches:", isMatch);

    if (!isMatch) {
      console.log("❌ Password does not match.");
      return res.status(400).json({ msg: "Invalid Credentials" });
    }

    // 3. Create and return JWT
    const payload = { user: { id: user.id } };

    jwt.sign(
      payload,
      process.env.JWT_SECRET, 
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({ 
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
          }
        });
      }
    );

  } catch (err) {
    console.error("CRITICAL LOGIN ERROR:", err.message);
    res.status(500).send("Server Error");
  }
});

// @route   POST api/auth/forgot-password
// @desc    Generate reset token
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ msg: "User with this email does not exist" });
    }
    res.json({ msg: "If an account exists, a reset link has been sent to your email." });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   POST api/auth/reset-password
// @desc    Update user password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    res.json({ msg: "Password has been successfully reset. You can now login." });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route    GET api/auth/users
// @desc     Get all registered users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password'); 
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;