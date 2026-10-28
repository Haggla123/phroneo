import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Admin from '../models/Admin.js';

dotenv.config();

const email = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD || '';

if (!process.env.MONGODB_URI || !email || !password) {
  console.error('Set MONGODB_URI, ADMIN_EMAIL, and ADMIN_PASSWORD in your server environment first.');
  process.exit(1);
}

try {
  await mongoose.connect(process.env.MONGODB_URI);
  if (await Admin.countDocuments()) {
    console.error('Admin setup is already complete. Existing admins must add accounts from the dashboard.');
    process.exitCode = 1;
  } else if (password.length < 10) {
    console.error('ADMIN_PASSWORD must contain at least 10 characters.');
    process.exitCode = 1;
  } else {
    await Admin.create({ email, password });
    console.log(`Initial admin account created for ${email}.`);
  }
} catch (error) {
  console.error('Could not create the initial admin account:', error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
