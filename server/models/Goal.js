const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Goal name is required'],
    trim: true,
    maxlength: 100
  },
  targetAmount: {
    type: Number,
    required: [true, 'Target amount is required'],
    min: [1, 'Target amount must be positive']
  },
  currentAmount: {
    type: Number,
    default: 0,
    min: [0, 'Current amount cannot be negative']
  },
  targetDate: {
    type: Date
  },
  category: {
    type: String,
    default: 'education'
  },
  color: {
    type: String,
    default: '#10b981'
  }
}, {
  timestamps: true
});

goalSchema.index({ user: 1, targetDate: 1 });

module.exports = mongoose.model('Goal', goalSchema);
