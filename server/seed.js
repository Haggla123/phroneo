import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Program from './models/Program.js';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
dotenv.config({ path: resolve(root, '.env') });
dotenv.config({ path: fileURLToPath(new URL('.env', import.meta.url)) });

try {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required.');
  const source = JSON.parse(readFileSync(resolve(root, 'public/content/programs.json'), 'utf8'));
  if (!Array.isArray(source.programs)) throw new Error('Expected programs.json to contain a programs array.');
  await mongoose.connect(process.env.MONGODB_URI);
  const operations = source.programs.map((program) => ({
    updateOne: { filter: { slug: program.slug }, update: { $set: program }, upsert: true }
  }));
  if (operations.length) await Program.bulkWrite(operations, { ordered: true });
  console.log(`Seeded or updated ${operations.length} programs without deleting other records.`);
} catch (error) {
  console.error('Program seed failed:', error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect().catch(() => {});
}