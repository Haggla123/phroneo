import mongoose from 'mongoose';

const programSchema = new mongoose.Schema({
  slug: {
    type: String,
    required: true,
    unique: true
  },
  image: {
    type: String,
    default: '/images/program-default.jpg'
  },
  start: {
    type: String,
    required: true
  },
  format: {
    de: String,
    en: String
  },
  place: {
    de: String,
    en: String
  },
  title: {
    de: String,
    en: String
  },
  summary: {
    de: String,
    en: String
  },
  description: {
    de: String,
    en: String
  },
  outcomes: {
    de: [String],
    en: [String]
  }
}, {
  timestamps: true
});

export default mongoose.model('Program', programSchema);
