import express from 'express';
import { randomUUID } from 'node:crypto';
import Submission from '../models/Submission.js';
import { auth } from '../middleware/auth.js';
import { normalizeSubmission } from '../lib/submissionValidation.js';
import { deliverContactEmail } from '../lib/contactEmail.js';

const router = express.Router();

// Create new submission (public)
router.post('/', async (req, res) => {
  try {
    const normalized = normalizeSubmission(req.body);
    if (normalized.error) return res.status(400).json({ message: normalized.error });
    const { kind, name, email, program, message, interest, emailUpdates, consent, age } = normalized.values;

    const submission = new Submission({
      id: randomUUID(),
      kind,
      name,
      email,
      age,
      program,
      interest,
      message,
      emailUpdates,
      consent,
      consentAt: consent ? new Date() : undefined,
      status: 'new'
    });

    const saved = await submission.save();
    if (kind === 'contact') {
      try {
        const deliveryStatus = await deliverContactEmail(saved);
        saved.emailDeliveryStatus = deliveryStatus;
        if (deliveryStatus === 'sent') saved.emailSentAt = new Date();
        else saved.emailSentAt = undefined;
      } catch (error) {
        console.error('Contact email delivery failed:', error.message);
        saved.emailDeliveryStatus = 'failed';
      }
      await saved.save();
    }
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: 'Unable to save your request right now' });
  }
});

// Retry contact email delivery to the currently configured recipient (admin only).
router.post('/:id/resend-email', auth, async (req, res) => {
  try {
    const submission = await Submission.findOne({ id: req.params.id, kind: 'contact' });
    if (!submission) return res.status(404).json({ message: 'Contact submission not found' });
    const deliveryStatus = await deliverContactEmail(submission);
    submission.emailDeliveryStatus = deliveryStatus;
    if (deliveryStatus === 'sent') submission.emailSentAt = new Date();
    else submission.emailSentAt = undefined;
    await submission.save();
    if (deliveryStatus !== 'sent') {
      return res.status(503).json({ message: 'SMTP email delivery is not configured', submission });
    }
    res.json(submission);
  } catch (error) {
    console.error('Contact email retry failed:', error.message);
    await Submission.findOneAndUpdate(
      { id: req.params.id, kind: 'contact' },
      { $set: { emailDeliveryStatus: 'failed' }, $unset: { emailSentAt: 1 } }
    ).catch((updateError) => console.error('Could not record contact email retry failure:', updateError.message));
    res.status(502).json({ message: 'Contact email could not be sent' });
  }
});

// Get all submissions (admin only)
router.get('/', auth, async (req, res) => {
  try {
    const { kind, status } = req.query;
    const filter = {};
    if (kind) filter.kind = kind;
    if (status) filter.status = status;

    const submissions = await Submission.find(filter).sort({ timestamp: -1 }).limit(500);
    res.json(submissions);
  } catch (error) {
    console.error('Submission list failed:', error.message);
    res.status(500).json({ message: 'Unable to fetch submissions' });
  }
});

// Update submission status (admin only)
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['new', 'contacted', 'done'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const submission = await Submission.findOneAndUpdate(
      { id: req.params.id },
      { status },
      { new: true }
    );

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    res.json(submission);
  } catch (error) {
    console.error('Submission status update failed:', error.message);
    res.status(400).json({ message: 'Unable to update submission status' });
  }
});

// Delete submission (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const submission = await Submission.findOneAndDelete({ id: req.params.id });
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }
    res.json({ message: 'Submission deleted successfully' });
  } catch (error) {
    console.error('Submission delete failed:', error.message);
    res.status(500).json({ message: 'Unable to delete submission' });
  }
});

// Clear all submissions (admin only)
router.delete('/', auth, async (req, res) => {
  try {
    await Submission.deleteMany({});
    res.json({ message: 'All submissions cleared successfully' });
  } catch (error) {
    console.error('Submission clear failed:', error.message);
    res.status(500).json({ message: 'Unable to clear submissions' });
  }
});

export default router;
