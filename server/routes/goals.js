const express = require('express');
const { body, validationResult } = require('express-validator');
const Goal = require('../models/Goal');
const Activity = require('../models/Activity');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// GET /api/goals — list all goals for user
router.get('/', async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user._id }).sort({ createdAt: -1 }).lean();
    res.json({ goals });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/goals — create new savings goal
router.post('/', [
  body('name').trim().notEmpty().withMessage('Goal name is required'),
  body('targetAmount').isFloat({ min: 1 }).withMessage('Target amount must be at least 1'),
  body('currentAmount').optional().isFloat({ min: 0 }).withMessage('Current amount cannot be negative'),
  body('targetDate').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const goal = await Goal.create({
      ...req.body,
      user: req.user._id
    });

    await Activity.create({
      user: req.user._id,
      action: 'goal_created',
      entityType: 'goal',
      entityId: goal._id,
      metadata: { name: goal.name, targetAmount: goal.targetAmount }
    }).catch(() => {});

    res.status(201).json(goal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/goals/:id — update goal
router.put('/:id', async (req, res) => {
  try {
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!goal) return res.status(404).json({ error: 'Goal not found' });
    res.json(goal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/goals/:id/contribute — add amount towards goal
router.post('/:id/contribute', [
  body('amount').isFloat({ min: 1 }).withMessage('Contribution amount must be positive')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });
    if (!goal) return res.status(404).json({ error: 'Goal not found' });

    goal.currentAmount = +(goal.currentAmount + parseFloat(req.body.amount)).toFixed(2);
    await goal.save();

    await Activity.create({
      user: req.user._id,
      action: 'goal_contributed',
      entityType: 'goal',
      entityId: goal._id,
      metadata: { name: goal.name, contribution: parseFloat(req.body.amount), currentAmount: goal.currentAmount }
    }).catch(() => {});

    res.json(goal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/goals/:id — delete goal
router.delete('/:id', async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!goal) return res.status(404).json({ error: 'Goal not found' });
    res.json({ message: 'Goal deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
