import mongoose from 'mongoose';

const localizedText = { de: { type: String, default: '' }, en: { type: String, default: '' } };
const storySchema = new mongoose.Schema({
  displayName: { type: String, required: true, trim: true, maxlength: 120 },
  role: { type: localizedText, default: () => ({}) },
  program: { type: localizedText, default: () => ({}) },
  quote: { type: localizedText, required: true },
  publicationConsent: { type: Boolean, required: true, default: false },
  published: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('Story', storySchema);
