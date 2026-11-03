import express from 'express';
import { auth } from '../middleware/auth.js';
import { getContactRecipientEmail, isSmtpConfigured, saveContactRecipientEmail, sendSmtpTestEmail } from '../lib/contactEmail.js';
import SiteSettings from '../models/SiteSettings.js';
import { DEFAULT_PRIVACY_POLICY, EMPTY_LEGAL_INFO, normalizeLegalPages } from '../lib/legalPages.js';

const router = express.Router();
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const legalResponse = (settings) => ({
  legalInfo: { ...EMPTY_LEGAL_INFO, ...(settings?.legalInfo || {}) },
  privacyPolicy: Object.fromEntries(['de', 'en'].map((language) => [
    language,
    settings?.privacyPolicy?.[language]?.trim() ? settings.privacyPolicy[language] : DEFAULT_PRIVACY_POLICY[language]
  ])),
  privacyApproved: Boolean(settings?.privacyApproved),
  imprintApproved: Boolean(settings?.imprintApproved),
  legalReviewedAt: settings?.legalReviewedAt || null
});
export const normalizeContactRecipient = (value) => {
  const email = String(value || '').trim().toLowerCase();
  return email.length <= 254 && EMAIL.test(email) ? email : null;
};

router.get('/legal-pages', async (req, res) => {
  try {
    const settings = await SiteSettings.findById('site').select('legalInfo privacyPolicy privacyApproved imprintApproved legalReviewedAt').lean();
    res.json(legalResponse(settings));
  } catch (error) {
    console.error('Legal pages read failed:', error.message);
    res.status(500).json({ message: 'Unable to load legal pages' });
  }
});

router.put('/legal-pages', auth, async (req, res) => {
  const legalPages = normalizeLegalPages(req.body);
  if (req.body?.imprintApproved && !legalPages.imprintApproved) {
    return res.status(400).json({ message: 'Complete the required legal identity and address fields before approving the legal notice.' });
  }
  if (req.body?.privacyApproved && !legalPages.privacyApproved) {
    return res.status(400).json({ message: 'Complete both language versions and remove draft markers before approving the privacy notice.' });
  }
  try {
    const settings = await SiteSettings.findByIdAndUpdate(
      'site',
      { $set: legalPages },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    ).lean();
    res.json(legalResponse(settings));
  } catch (error) {
    console.error('Legal pages save failed:', error.message);
    res.status(500).json({ message: 'Unable to save legal pages' });
  }
});

router.get('/contact-delivery', auth, async (req, res) => {
  try {
    res.json({
      recipientEmail: await getContactRecipientEmail(),
      smtpConfigured: isSmtpConfigured()
    });
  } catch (error) {
    console.error('Contact delivery settings read failed:', error.message);
    res.status(500).json({ message: 'Unable to load contact delivery settings' });
  }
});

router.put('/contact-delivery', auth, async (req, res) => {
  const email = normalizeContactRecipient(req.body?.recipientEmail);
  if (!email) {
    return res.status(400).json({ message: 'Enter a valid recipient email address' });
  }
  try {
    const recipientEmail = await saveContactRecipientEmail(email);
    res.json({ recipientEmail, smtpConfigured: isSmtpConfigured() });
  } catch (error) {
    console.error('Contact delivery settings save failed:', error.message);
    res.status(500).json({ message: 'Unable to save contact delivery settings' });
  }
});

router.post('/contact-delivery/test', auth, async (req, res) => {
  try {
    if (!isSmtpConfigured()) return res.status(503).json({ message: 'SMTP email delivery is not configured' });
    await sendSmtpTestEmail();
    res.json({ message: 'Test email sent' });
  } catch (error) {
    console.error('Contact delivery test failed:', error.message);
    res.status(502).json({ message: 'Test email could not be sent' });
  }
});

export default router;
