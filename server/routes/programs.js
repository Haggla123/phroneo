import express from 'express';
import Program from '../models/Program.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get all programs (public)
router.get('/', async (req, res) => {
  try {
    const programs = await Program.find().sort({ start: 1 });
    res.json(programs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching programs', error: error.message });
  }
});

// Get single program by slug (public)
router.get('/:slug', async (req, res) => {
  try {
    const program = await Program.findOne({ slug: req.params.slug });
    if (!program) {
      return res.status(404).json({ message: 'Program not found' });
    }
    res.json(program);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching program', error: error.message });
  }
});

// Create program (admin only)
router.post('/', auth, async (req, res) => {
  try {
    const program = new Program(req.body);
    const saved = await program.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: 'Error creating program', error: error.message });
  }
});

// Update program (admin only)
router.put('/:slug', auth, async (req, res) => {
  try {
    const program = await Program.findOneAndUpdate(
      { slug: req.params.slug },
      req.body,
      { new: true, runValidators: true }
    );
    if (!program) {
      return res.status(404).json({ message: 'Program not found' });
    }
    res.json(program);
  } catch (error) {
    res.status(400).json({ message: 'Error updating program', error: error.message });
  }
});

// Delete program (admin only)
router.delete('/:slug', auth, async (req, res) => {
  try {
    const program = await Program.findOneAndDelete({ slug: req.params.slug });
    if (!program) {
      return res.status(404).json({ message: 'Program not found' });
    }
    res.json({ message: 'Program deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting program', error: error.message });
  }
});

export default router;
