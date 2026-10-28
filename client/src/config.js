// Site configuration and legal defaults.
const savedLegal = (() => {
  try {
    const raw = localStorage.getItem('phroneo_legal_config');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
})();

export const SITE = {
  formEndpoint: import.meta.env.VITE_FORM_ENDPOINT || '',
  legal: savedLegal || {
    name: 'PHRONEO Initiative e.V. (i. Gr.)',
    form: 'Gemeinnütziger Verein in Gründung',
    street: 'Kaiserstraße 42',
    city: '60311 Frankfurt am Main',
    representative: 'Miriam Weber, David Keller',
    email: 'hallo@phroneo.de',
    phone: '+49 (0) 69 1234 5678',
    register: 'Amtsgericht Frankfurt am Main (in Vorbereitung)',
    vatId: 'Befreit nach § 4 Nr. 22 UStG',
    editorial: 'Miriam Weber (inhaltlich verantwortlich)'
  }
};

export function updateLegalConfig(newLegal) {
  SITE.legal = newLegal;
  try {
    localStorage.setItem('phroneo_legal_config', JSON.stringify(newLegal));
  } catch {}
}
