const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const INTERESTS = new Set(['community', 'spiritual_growth', 'personal_development', 'mentoring', 'courses_workshops', 'exploring']);
const cleanText = (value, limit) => typeof value === 'string' ? value.trim().slice(0, limit) : '';

export function normalizeSubmission(input = {}) {
  const kind = input.kind;
  const values = {
    kind,
    name: cleanText(input.name, 120),
    email: cleanText(input.email, 254).toLowerCase(),
    program: cleanText(input.program, 120),
    message: cleanText(input.message, 3000),
    interest: cleanText(input.interest, 40),
    emailUpdates: kind === 'register' && input.emailUpdates === true,
    consent: kind === 'contact' && input.consent === true,
  };

  if (!['register', 'contact'].includes(kind)) return { error: 'Invalid submission type' };
  if (!EMAIL.test(values.email)) return { error: 'A valid email address is required' };
  if (kind === 'contact' && (!values.name || !values.message)) return { error: 'Name and message are required for contact requests' };
  if (kind === 'contact' && !values.consent) return { error: 'Consent is required for contact requests' };
  if (kind === 'register' && !INTERESTS.has(values.interest)) return { error: 'Please choose a valid area of interest' };
  if (input.age !== undefined && input.age !== '' && (!Number.isInteger(Number(input.age)) || Number(input.age) < 18 || Number(input.age) > 120)) {
    return { error: 'Age must be a valid number' };
  }

  values.age = input.age === '' || input.age === undefined ? undefined : Number(input.age);
  return { values };
}
