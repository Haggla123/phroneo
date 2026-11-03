import test from 'node:test';
import assert from 'node:assert/strict';
import { createContactEmail, deliverContactEmail } from '../lib/contactEmail.js';
import { normalizeContactRecipient } from '../routes/settings.js';

test('contact delivery recipient is normalized and validated', () => {
  assert.equal(normalizeContactRecipient('  OWNER@Example.com '), 'owner@example.com');
  assert.equal(normalizeContactRecipient('not-an-email'), null);
  assert.equal(normalizeContactRecipient('a@b.co'.repeat(50)), null);
});

test('contact email has safe headers and escapes HTML content', () => {
  const mail = createContactEmail({
    name: 'Visitor\r\nBcc: attacker@example.com',
    email: 'visitor@example.com',
    message: '<script>alert(1)</script>\nHello'
  });
  assert.equal(mail.subject.includes('\r'), false);
  assert.equal(mail.subject.includes('\n'), false);
  assert.match(mail.html, /&lt;script&gt;/);
  assert.doesNotMatch(mail.html, /<script>/);
});

test('email delivery remains pending when SMTP credentials are absent', async () => {
  const prior = Object.fromEntries(['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS'].map((key) => [key, process.env[key]]));
  try {
    delete process.env.SMTP_HOST;
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASS;
    assert.equal(await deliverContactEmail({ email: 'visitor@example.com' }), 'pending');
  } finally {
    for (const [key, value] of Object.entries(prior)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});
