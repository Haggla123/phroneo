import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeSubmission } from '../lib/submissionValidation.js';

test('contact requires valid identity fields and explicit consent', () => {
  const base = { kind: 'contact', name: '  Test Person ', email: ' TEST@example.com ', message: ' Hello ', consent: true };
  const result = normalizeSubmission(base);
  assert.equal(result.error, undefined);
  assert.equal(result.values.name, 'Test Person');
  assert.equal(result.values.email, 'test@example.com');
  assert.equal(normalizeSubmission({ ...base, consent: false }).error, 'Consent is required for contact requests');
});

test('join interest, email, and age are validated and fields are bounded', () => {
  const base = { kind: 'register', email: 'person@example.com', interest: 'mentoring', age: 24, message: 'x'.repeat(5000) };
  const result = normalizeSubmission(base);
  assert.equal(result.error, undefined);
  assert.equal(result.values.message.length, 3000);
  assert.equal(result.values.age, 24);
  assert.match(normalizeSubmission({ ...base, email: 'invalid' }).error, /valid email/);
  assert.match(normalizeSubmission({ ...base, age: 17 }).error, /Age must/);
  assert.match(normalizeSubmission({ ...base, interest: 'invalid' }).error, /valid area/);
});

test('unknown submission types are rejected', () => {
  assert.equal(normalizeSubmission({ kind: 'other' }).error, 'Invalid submission type');
});
