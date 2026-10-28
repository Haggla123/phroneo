import express from 'express';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Admin accounts can only be managed by an authenticated administrator.
router.get('/admins', auth, async (req, res) => {
  try {
    const admins = await Admin.find().select('email createdAt').sort({ createdAt: 1 });
    res.json(admins);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching admin accounts' });
  }
});

router.post('/admins', auth, async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ message: 'A valid email address is required' });
    }
    if (password.length < 10) {
      return res.status(400).json({ message: 'Password must be at least 10 characters' });
    }
    if (await Admin.exists({ email })) {
      return res.status(409).json({ message: 'An admin with this email already exists' });
    }
    const admin = await Admin.create({ email, password });
    res.status(201).json({ _id: admin._id, email: admin.email, createdAt: admin.createdAt });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: 'An admin with this email already exists' });
    res.status(500).json({ message: 'Error creating admin account' });
  }
});

router.delete('/admins/:id', auth, async (req, res) => {
  try {
    if (String(req.user.id) === req.params.id) {
      return res.status(400).json({ message: 'You cannot remove your own admin account' });
    }
    const count = await Admin.countDocuments();
    if (count <= 1) return res.status(400).json({ message: 'The last admin account cannot be removed' });
    const removed = await Admin.findByIdAndDelete(req.params.id);
    if (!removed) return res.status(404).json({ message: 'Admin account not found' });
    res.json({ message: 'Admin account removed' });
  } catch (error) {
    res.status(400).json({ message: 'Unable to remove admin account' });
  }
});

// Login admin
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      email: admin.email
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});

// Verify token
router.get('/verify', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findOne({ email: decoded.email });

    if (!admin) {
      return res.status(401).json({ message: 'Admin not found' });
    }

    res.json({ email: admin.email });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

export default router;
