import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  kind: {
    type: String,
    enum: ['register', 'contact'],
    required: true
  },
  name: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    required: true
  },
  age: {
    type: Number
  },
  program: {
    type: String
  },
  interest: {
    type: String
  },
  message: {
    type: String
  },
  emailUpdates: {
    type: Boolean,
    default: false
  },
  consent: { type: Boolean, default: false },
  consentAt: { type: Date },
  emailDeliveryStatus: { type: String, enum: ['pending', 'sent', 'failed'], default: 'pending' },
  emailSentAt: { type: Date },
  status: {
    type: String,
    enum: ['new', 'contacted', 'done'],
    default: 'new'
  }
}, {
  timestamps: true
});

export default mongoose.model('Submission', submissionSchema);
