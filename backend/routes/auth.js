const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: {type: string}
 *               email: {type: string}
 *               password: {type: string}
 *               role: {type: string}
 *     responses:
 *       201:
 *         description: Registered Successfully
 *       400:
 *         description: User already exists
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "User already exists" });
    user = new User({ name, email, password, role });
    await user.save();
    const payload = { user: { id: user.id, role: user.role } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '2h' }, (err, token) => {
      if (err) throw err;
      return res.status(201).json({ token, msg: "Registered Successfully" });
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err.message);
    res.status(500).json({ error: "Server Error" });
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Authenticate user & get token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: {type: string}
 *               password: {type: string}
 *               role: {type: string}
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid Credentials
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body; 
    const user = await User.findOne({ email, role }); 
    if (!user) return res.status(400).json({ msg: "Invalid Credentials or Wrong Role" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid Credentials" });
    const payload = { user: { id: user.id } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    });
  } catch (err) {
    console.error("CRITICAL LOGIN ERROR:", err.message);
    res.status(500).send("Server Error");
  }
});

/**
 * @swagger
 * /api/auth/users:
 *   get:
 *     summary: Get all registered users
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: List of users
 */
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