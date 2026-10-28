import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from './models/Admin.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    const email = process.env.ADMIN_EMAIL || 'admin@phroneo.com';
    const password = process.env.ADMIN_PASSWORD || 'admin12345';

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      console.log('Admin account already exists:', email);
      console.log('To reset, delete the admin from MongoDB or use force mode');
      process.exit(0);
    }

    // Create admin account
    const admin = new Admin({
      email,
      password
    });

    await admin.save();
    console.log('Admin account created successfully');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('\nPlease change the password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
