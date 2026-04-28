const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../middleware/auth');
const Document = require('../models/Document');
const fs = require('fs');   // NEW: Required to delete files
const path = require('path'); // NEW: Required to handle file paths

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// 1. UPLOAD ROUTE
router.post('/upload', [auth, upload.single('pdf')], async (req, res) => {
  try {
    const newDoc = new Document({
      owner: req.user.id,
      title: req.body.title || req.file.originalname,
      fileUrl: `/uploads/${req.file.filename}`,
      status: 'Action Required',
      version: 1.0
    });
    const doc = await newDoc.save();
    res.json(doc);
  } catch (err) { res.status(500).json({ msg: 'Server Error' }); }
});

// 2. GET ALL ROUTE
router.get('/', auth, async (req, res) => {
  try {
    const docs = await Document.find({ owner: req.user.id }).sort({ createdAt: -1 });
    res.json(docs);
  } catch (err) { res.status(500).json({ msg: 'Server Error' }); }
});

// 3. SIGN ROUTE
router.put('/sign/:id', auth, async (req, res) => {
  try {
    const { signatureImage } = req.body; // Receive the drawing
    const doc = await Document.findById(req.params.id);
    
    doc.isSigned = true;
    doc.signatureImage = signatureImage; // Save the image string
    doc.status = 'Signed & Verified';
    doc.signedAt = Date.now();
    
    await doc.save();
    res.json(doc);
  } catch (err) {
    res.status(500).json({ msg: 'Signature Error' });
  }
});

// 4. DELETE ROUTE (The missing piece!)
router.delete('/:id', auth, async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    
    if (!doc) {
      return res.status(404).json({ msg: 'Document not found' });
    }

    // Optional: Delete the actual file from the 'uploads' folder
    const filePath = path.join(__dirname, '..', doc.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Document.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Document deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Delete Error' });
  }
});

module.exports = router;