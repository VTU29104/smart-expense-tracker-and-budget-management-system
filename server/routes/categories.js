const express = require('express');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

const EXPENSE_CATEGORIES = [
  { id: 'food', label: 'Canteen, Mess & Food', icon: '🍔', color: '#f97316' },
  { id: 'transport', label: 'Bus, Metro & Commute', icon: '🚌', color: '#3b82f6' },
  { id: 'housing', label: 'Hostel & PG Rent', icon: '🏠', color: '#8b5cf6' },
  { id: 'utilities', label: 'Wi-Fi, Recharge & Power', icon: '⚡', color: '#eab308' },
  { id: 'entertainment', label: 'Outings, Movies & Hangouts', icon: '🎬', color: '#ec4899' },
  { id: 'healthcare', label: 'Health & Pharmacy', icon: '🏥', color: '#14b8a6' },
  { id: 'shopping', label: 'Supplies, Stationery & Gear', icon: '🛍️', color: '#f43f5e' },
  { id: 'education', label: 'Tuition, Books & Exams', icon: '📚', color: '#6366f1' },
  { id: 'travel', label: 'Home Visits & Vacation', icon: '🚆', color: '#0ea5e9' },
  { id: 'subscriptions', label: 'EdTech, Tools & OTT', icon: '📱', color: '#a855f7' },
  { id: 'other', label: 'Other Student Expenses', icon: '📌', color: '#64748b' }
];

const INCOME_CATEGORIES = [
  { id: 'allowance', label: 'Monthly Allowance / Pocket Money', icon: '💵', color: '#10b981' },
  { id: 'scholarship', label: 'Scholarship / Fellowship', icon: '🎓', color: '#059669' },
  { id: 'part_time', label: 'Part-Time Job / Tutoring', icon: '💼', color: '#047857' },
  { id: 'stipend', label: 'Internship Stipend', icon: '💰', color: '#0d9488' },
  { id: 'freelance', label: 'Freelancing & Projects', icon: '💻', color: '#0284c7' },
  { id: 'gift', label: 'Gifts & Rewards', icon: '🎁', color: '#e11d48' },
  { id: 'other_income', label: 'Other Student Income', icon: '✨', color: '#64748b' }
];

// GET /api/categories
router.get('/', (req, res) => {
  res.json({
    categories: EXPENSE_CATEGORIES,
    expenseCategories: EXPENSE_CATEGORIES,
    incomeCategories: INCOME_CATEGORIES
  });
});

module.exports = router;
