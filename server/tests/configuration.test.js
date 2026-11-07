import test from 'node:test';
import assert from 'node:assert/strict';
import { requireMongoUri } from '../config/db.js';
import { getAllowedOrigins, isAllowedOrigin } from '../lib/allowedOrigins.js';

test('database configuration requires an explicit connection string', () => {
  assert.throws(() => requireMongoUri({}), /MONGODB_URI must be configured/);
  assert.equal(requireMongoUri({ MONGODB_URI: 'mongodb://db.example/phroneo' }), 'mongodb://db.example/phroneo');
});

test('production CORS allows only exact configured origins', () => {
  const origins = getAllowedOrigins('https://site.example, https://admin.example', { production: true });
  assert.equal(isAllowedOrigin('https://site.example', origins), true);
  assert.equal(isAllowedOrigin('https://preview.vercel.app', origins), false);
  assert.equal(isAllowedOrigin('https://site.example.attacker.test', origins), false);
  assert.equal(isAllowedOrigin(undefined, origins), true);
});

test('development CORS includes the local Vite origins', () => {
  const origins = getAllowedOrigins('', { production: false });
  assert.equal(isAllowedOrigin('http://localhost:5173', origins), true);
});
