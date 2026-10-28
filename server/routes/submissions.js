import express from 'express';
import { randomUUID } from 'node:crypto';
import Submission from '../models/Submission.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const INTERESTS = new Set(['community', 'spiritual_growth', 'personal_development', 'mentoring', 'courses_workshops', 'exploring']);
const cleanText = (value, limit) => typeof value === 'string' ? value.trim().slice(0, limit) : '';

// Create new submission (public)
router.post('/', async (req, res) => {
  try {
    const kind = req.body.kind;
    const name = cleanText(req.body.name, 120);
    const email = cleanText(req.body.email, 254).toLowerCase();
    const program = cleanText(req.body.program, 120);
    const message = cleanText(req.body.message, 3000);
    const interest = cleanText(req.body.interest, 40);
    const emailUpdates = kind === 'register' && req.body.emailUpdates === true;

    if (!['register', 'contact'].includes(kind)) return res.status(400).json({ message: 'Invalid submission type' });
    if (!EMAIL.test(email)) return res.status(400).json({ message: 'A valid email address is required' });
    if (kind === 'contact' && (!name || !message)) return res.status(400).json({ message: 'Name and message are required for contact requests' });
    if (kind === 'register' && !INTERESTS.has(interest)) return res.status(400).json({ message: 'Please choose a valid area of interest' });
    if (req.body.age !== undefined && req.body.age !== '' && (!Number.isInteger(Number(req.body.age)) || Number(req.body.age) < 18 || Number(req.body.age) > 120)) {
      return res.status(400).json({ message: 'Age must be a valid number' });
    }

    const submission = new Submission({
      id: randomUUID(),
      kind,
      name,
      email,
      age: req.body.age === '' || req.body.age === undefined ? undefined : Number(req.body.age),
      program,
      interest,
      message,
      emailUpdates,
      status: 'new'
    });

    const saved = await submission.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: 'Unable to save your request right now' });
  }
});

// Get all submissions (admin only)
router.get('/', auth, async (req, res) => {
  try {
    const { kind, status } = req.query;
    const filter = {};
    if (kind) filter.kind = kind;
    if (status) filter.status = status;

    const submissions = await Submission.find(filter).sort({ timestamp: -1 });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching submissions', error: error.message });
  }
});

// Update submission status (admin only)
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['new', 'contacted', 'done'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const submission = await Submission.findOneAndUpdate(
      { id: req.params.id },
      { status },
      { new: true }
    );

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    res.json(submission);
  } catch (error) {
    res.status(400).json({ message: 'Error updating submission', error: error.message });
  }
});

// Delete submission (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const submission = await Submission.findOneAndDelete({ id: req.params.id });
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }
    res.json({ message: 'Submission deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting submission', error: error.message });
  }
});

// Clear all submissions (admin only)
router.delete('/', auth, async (req, res) => {
  try {
    await Submission.deleteMany({});
    res.json({ message: 'All submissions cleared successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error clearing submissions', error: error.message });
  }
});

export default router;
