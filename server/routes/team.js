import express from 'express';
import TeamMember from '../models/TeamMember.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get all team members (public)
router.get('/', async (req, res) => {
  try {
    const team = await TeamMember.find().sort({ order: 1, createdAt: 1 });
    res.json(team);
  } catch (error) {
    console.error('Team list failed:', error.message);
    res.status(500).json({ message: 'Unable to fetch team members' });
  }
});

// Get single team member (public)
router.get('/:id', async (req, res) => {
  try {
    const member = await TeamMember.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ message: 'Team member not found' });
    }
    res.json(member);
  } catch (error) {
    console.error('Team member read failed:', error.message);
    res.status(500).json({ message: 'Unable to fetch team member' });
  }
});

// Create team member (admin only)
router.post('/', auth, async (req, res) => {
  try {
    const member = new TeamMember(req.body);
    const saved = await member.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error('Team member create failed:', error.message);
    res.status(400).json({ message: 'Unable to create team member; check required fields and values' });
  }
});

// Update team member (admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    const member = await TeamMember.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!member) {
      return res.status(404).json({ message: 'Team member not found' });
    }
    res.json(member);
  } catch (error) {
    console.error('Team member update failed:', error.message);
    res.status(400).json({ message: 'Unable to update team member; check required fields and values' });
  }
});

// Delete team member (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const member = await TeamMember.findByIdAndDelete(req.params.id);
    if (!member) {
      return res.status(404).json({ message: 'Team member not found' });
    }
    res.json({ message: 'Team member deleted successfully' });
  } catch (error) {
    console.error('Team member delete failed:', error.message);
    res.status(500).json({ message: 'Unable to delete team member' });
  }
});

export default router;
