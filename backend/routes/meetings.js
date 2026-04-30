const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Meeting = require('../models/Meeting');

// 1. Request a Meeting
/**
 * @swagger
 * /api/meetings:
 *   post:
 *     summary: Schedule a new meeting
 *     tags: [Meetings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: {type: string}
 *               date: {type: string, format: date-time}
 *               invitee: {type: string}
 *     responses:
 *       201:
 *         description: Meeting scheduled
 */
router.post('/request', auth, async (req, res) => {
  try {
    const { recipientId, title, date } = req.body;

    // Conflict Detection
    const conflict = await Meeting.findOne({
      recipient: recipientId,
      date: date,
      status: 'accepted'
    });

    if (conflict) {
      return res.status(400).json({ msg: 'This time slot is already booked!' });
    }

    const newMeeting = new Meeting({
      requester: req.user.id,
      recipient: recipientId,
      title,
      date
    });

    await newMeeting.save();
    
    // FETCH THE SAVED MEETING WITH NAMES FOR THE FRONTEND
    const meeting = await Meeting.findById(newMeeting._id)
      .populate('requester recipient', ['name', 'email']);

    res.json(meeting);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// 2. Get My Meetings
router.get('/me', auth, async (req, res) => {
  try {
    const meetings = await Meeting.find({
      $or: [{ requester: req.user.id }, { recipient: req.user.id }]
    })
    .sort({ date: -1 }) // Show newest meetings first
    .populate('requester recipient', ['name', 'email']);
    
    res.json(meetings);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// 3. Accept/Reject Meeting
router.put('/status/:id', auth, async (req, res) => {
  try {
    const { status } = req.body; 
    let meeting = await Meeting.findById(req.params.id);

    if (!meeting) return res.status(404).json({ msg: 'Meeting not found' });
    
    // Only the recipient can accept/reject
    if (meeting.recipient.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    meeting.status = status;
    await meeting.save();
    
    // Populate again so the frontend sees the updated names/emails
    const updatedMeeting = await Meeting.findById(meeting._id)
      .populate('requester recipient', ['name', 'email']);

    res.json(updatedMeeting);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;