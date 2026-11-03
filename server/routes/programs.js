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
    console.error('Program list failed:', error.message);
    res.status(500).json({ message: 'Unable to fetch programs' });
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
    console.error('Program read failed:', error.message);
    res.status(500).json({ message: 'Unable to fetch program' });
  }
});

// Create program (admin only)
router.post('/', auth, async (req, res) => {
  try {
    const program = new Program(req.body);
    const saved = await program.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error('Program create failed:', error.message);
    res.status(400).json({ message: 'Unable to create program; check required fields and values' });
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
    console.error('Program update failed:', error.message);
    res.status(400).json({ message: 'Unable to update program; check required fields and values' });
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
    console.error('Program delete failed:', error.message);
    res.status(500).json({ message: 'Unable to delete program' });
  }
});

export default router;
