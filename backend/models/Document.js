const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
  title: { type: String, required: true },
  fileUrl: { type: String, required: true },
  isSigned: { type: Boolean, default: false },
  signerName: { type: String }, // NEW: Stores the typed signature
  status: { type: String, default: 'Pending' }, 
  signatureImage: { type: String },
  version: { type: Number, default: 1.0 },
  signedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('document', DocumentSchema);