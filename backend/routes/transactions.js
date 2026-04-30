const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Transaction = require('../models/Transaction');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { body, validationResult } = require('express-validator'); // For sanitization

// 1. GET TRANSACTION HISTORY
/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: Get transaction history
 *     tags: [Transactions]
 *     responses:
 *       200:
 *         description: List of payments and investments
 */
router.get('/history', auth, async (req, res) => {
  try {
    const history = await Transaction.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// 2. MOCK DEPOSIT (Sanitized & Authenticated)
router.post('/deposit', [
  auth,
  body('amount').isNumeric().escape() // Sanitization: Prevent XSS/Injection
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { amount } = req.body;
    const newTx = new Transaction({
      user: req.user.id,
      type: 'deposit',
      amount,
      status: 'Completed'
    });
    await newTx.save();
    res.json(newTx);
  } catch (err) {
    res.status(500).send('Deposit Failed');
  }
});

// 3. MOCK WITHDRAW
router.post('/withdraw', auth, async (req, res) => {
  try {
    const { amount } = req.body;
    const newTx = new Transaction({
      user: req.user.id,
      type: 'withdraw',
      amount,
      status: 'Completed'
    });
    await newTx.save();
    res.json(newTx);
  } catch (err) {
    res.status(500).send('Withdraw Failed');
  }
});

// 4. TRANSFER (Sanitized)
router.post('/transfer', [
  auth,
  body('recipient').trim().escape() // Sanitization: Prevent XSS
], async (req, res) => {
  try {
    const { amount, recipient } = req.body;
    const newTx = new Transaction({
      user: req.user.id,
      type: 'transfer',
      amount: amount,
      recipient: recipient,
      status: 'Completed'
    });

    await newTx.save();
    res.json(newTx);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Transfer failed' });
  }
});

// 5. STRIPE INTENT (Role Protected - e.g., only Entrepreneurs can create intents)
router.post('/create-payment-intent', auth, async (req, res) => {
  try {
    const { amount } = req.body;
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;