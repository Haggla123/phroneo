// Legal details intentionally default to blank until the organization verifies them.
const savedLegal = (() => {
  try {
    const raw = localStorage.getItem('phroneo_legal_config');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
})();

export const SITE = {
  legal: savedLegal || {
    name: '',
    form: '',
    street: '',
    city: '',
    representative: '',
    email: '',
    phone: '',
    register: '',
    vatId: '',
    editorial: ''
  }
};

export function updateLegalConfig(newLegal) {
  SITE.legal = newLegal;
  try {
    localStorage.setItem('phroneo_legal_config', JSON.stringify(newLegal));
  } catch {}
}
