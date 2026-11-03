import mongoose from 'mongoose';

const siteSettingsSchema = new mongoose.Schema({
  _id: { type: String, default: 'site' },
  contactRecipientEmail: { type: String, default: '', trim: true, lowercase: true },
  legalInfo: { type: mongoose.Schema.Types.Mixed, default: {} },
  privacyPolicy: {
    de: { type: String, default: '' },
    en: { type: String, default: '' }
  },
  privacyApproved: { type: Boolean, default: false },
  imprintApproved: { type: Boolean, default: false },
  legalReviewedAt: { type: Date }
}, { timestamps: true, versionKey: false });

export default mongoose.model('SiteSettings', siteSettingsSchema);
