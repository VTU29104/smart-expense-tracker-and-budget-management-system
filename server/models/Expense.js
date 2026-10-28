const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be positive']
  },
  type: {
    type: String,
    enum: ['expense', 'income'],
    default: 'expense',
    index: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: 200
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      // Expense categories
      'food', 'transport', 'housing', 'utilities',
      'entertainment', 'healthcare', 'shopping',
      'education', 'travel', 'subscriptions', 'other',
      // Income categories
      'allowance', 'scholarship', 'part_time', 'stipend',
      'freelance', 'gift', 'other_income'
    ]
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 500
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'credit_card', 'debit_card', 'bank_transfer', 'other'],
    default: 'debit_card'
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }],
  splits: [{
    label: { type: String, trim: true },
    amount: { type: Number, min: 0 }
  }],
  receipt: {
    type: String // URL to receipt image
  },
  currency: {
    type: String,
    default: 'INR',
    uppercase: true,
    trim: true
  },
  originalAmount: {
    type: Number
  },
  exchangeRate: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

// Compound index for common query patterns — optimises aggregation pipelines
expenseSchema.index({ user: 1, date: -1 });
expenseSchema.index({ user: 1, category: 1, date: -1 });

module.exports = mongoose.model('Expense', expenseSchema);
