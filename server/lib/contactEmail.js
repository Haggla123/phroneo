import nodemailer from 'nodemailer';
import SiteSettings from '../models/SiteSettings.js';

export const DEFAULT_CONTACT_EMAIL = 'izuwatopmann7@gmail.com';

export function isSmtpConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

export async function getContactRecipientEmail() {
  const setting = await SiteSettings.findById('site').select('contactRecipientEmail').lean();
  return setting?.contactRecipientEmail || process.env.CONTACT_RECIPIENT_EMAIL || DEFAULT_CONTACT_EMAIL;
}

export async function saveContactRecipientEmail(email) {
  const setting = await SiteSettings.findByIdAndUpdate(
    'site',
    { $set: { contactRecipientEmail: email } },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );
  return setting.contactRecipientEmail;
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}

export function createContactEmail(submission) {
  const safeName = String(submission.name || 'Website visitor').replace(/[\r\n]+/g, ' ').slice(0, 120);
  const subject = `PHRONEO contact request from ${safeName}`;
  const text = [
    `Name: ${submission.name || 'Not provided'}`,
    `Email: ${submission.email}`,
    '',
    'Message:',
    submission.message || ''
  ].join('\n');
  const html = `<h2>New PHRONEO contact request</h2><p><strong>Name:</strong> ${escapeHtml(submission.name || 'Not provided')}</p><p><strong>Email:</strong> ${escapeHtml(submission.email)}</p><p><strong>Message:</strong></p><p>${escapeHtml(submission.message || '').replace(/\n/g, '<br>')}</p>`;
  return { subject, text, html };
}

function createTransporter() {
  const port = Number(process.env.SMTP_PORT || 587);
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: process.env.SMTP_SECURE === 'true' || port === 465,
    requireTLS: true,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
}

export async function deliverContactEmail(submission) {
  if (!isSmtpConfigured()) return 'pending';
  const transporter = createTransporter();

  try {
    const recipient = await getContactRecipientEmail();
    await transporter.sendMail({
      from: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER,
      to: recipient,
      replyTo: submission.email,
      ...createContactEmail(submission)
    });
    return 'sent';
  } finally {
    transporter.close();
  }
}

export async function sendSmtpTestEmail() {
  if (!isSmtpConfigured()) return false;
  const transporter = createTransporter();
  try {
    const recipient = await getContactRecipientEmail();
    await transporter.sendMail({
      from: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER,
      to: recipient,
      subject: 'PHRONEO email delivery test',
      text: 'Email delivery is working. This test was sent from the PHRONEO admin dashboard.'
    });
    return true;
  } finally {
    transporter.close();
  }
}
