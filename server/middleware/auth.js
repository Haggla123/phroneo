import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

export const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findOne({ email: decoded.email }).select('_id email');
    if (!admin) return res.status(401).json({ message: 'Admin account is no longer active' });
    req.user = { id: String(admin._id), email: admin.email };
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};
