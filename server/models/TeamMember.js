import mongoose from 'mongoose';

const teamMemberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  role: {
    de: { type: String, default: '' },
    en: { type: String, default: '' }
  },
  bio: {
    de: { type: String, default: '' },
    en: { type: String, default: '' }
  },
  image: {
    type: String,
    default: ''
  },
  featured: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

export default mongoose.model('TeamMember', teamMemberSchema);
