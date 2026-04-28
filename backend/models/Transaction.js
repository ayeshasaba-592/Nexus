const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
  type: { 
    type: String, 
    enum: ['deposit', 'withdraw', 'transfer'], 
    required: true 
  },
  amount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'Completed', 'Failed'], 
    default: 'Completed' 
  },
  recipient: { type: String }, // For transfers
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('transaction', TransactionSchema);