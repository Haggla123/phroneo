import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Program from './models/Program.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const seedPrograms = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    // Read programs.json
    const programsPath = join(process.cwd(), 'public/content/programs.json');
    const programsData = JSON.parse(readFileSync(programsPath, 'utf-8'));

    // Clear existing programs
    await Program.deleteMany({});
    console.log('Cleared existing programs');

    // Insert programs
    await Program.insertMany(programsData.programs);
    console.log(`Inserted ${programsData.programs.length} programs`);

    console.log('Seed completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedPrograms();
