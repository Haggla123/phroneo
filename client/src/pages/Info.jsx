import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSEO } from '../hooks.js';
import { Section, PageHead } from '../components/UI.jsx';
import { fetchLegalPages } from '../api.js';

import { SITE } from '../config.js';

const FALLBACK_PRIVACY = {
  de: `# Entwurf der Datenschutzhinweise\n\nDies ist ein Arbeitsentwurf für PHRONEO PROJECT.\n\n## 1. Verantwortliche Stelle\nPHRONEO PROJECT\nE-Mail: izuwatopmann7@gmail.com\n\n## 2. Erhebung und Speicherung personenbezogener Daten\nWenn du unsere Website besuchst oder über unsere Formulare Interesse bekundest oder Kontakt aufnimmst, erheben wir nur die Daten, die du uns freiwillig mitteilst (z.B. Name, E-Mail-Adresse, Interessensbereiche und Nachricht).\n\n## 3. Zweck der Verarbeitung\nDie Datenverarbeitung dient ausschließlich der Beantwortung deiner Anfragen, der Organisation von Programmen und Mentoring sowie der Information über zukünftige Angebote, sofern gewünscht.\n\n## 4. Deine Rechte\nDu hast jederzeit das Recht auf Auskunft über deine bei uns gespeicherten Daten, deren Berichtigung oder Löschung. Wende dich hierzu gerne an izuwatopmann7@gmail.com.`,
  en: `# Privacy Notice (Working Draft)\n\nThis is a working draft for PHRONEO PROJECT.\n\n## 1. Controller & Contact\nPHRONEO PROJECT\nEmail: izuwatopmann7@gmail.com\n\n## 2. Collection and Processing of Personal Data\nWhen you visit our website, submit an expression of interest, or contact us through our forms, we only process the personal information you voluntarily provide (e.g., name, email address, program interests, and message).\n\n## 3. Purpose of Processing\nData is used solely to respond to your inquiries, organize cohorts and mentoring, and share updates about upcoming programs if requested.\n\n## 4. Your Rights\nYou have the right to request access to, rectification, or deletion of your stored personal information at any time. Feel free to contact izuwatopmann7@gmail.com.`
};

function useLegalPages() {
  const [data, setData] = useState(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let alive = true;
    fetchLegalPages()
      .then((result) => { if (alive) setData(result); })
      .catch(() => {
        if (alive) {
          setData({
            legalInfo: SITE.legal,
            privacyPolicy: FALLBACK_PRIVACY,
            imprintApproved: false,
            privacyApproved: false
          });
        }
      });
    return () => { alive = false; };
  }, []);
  return { data, failed };
}
function LegalCopy({ text }) {
  return String(text || '').split(/\n+/).map((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) return null;
    if (trimmed.startsWith('# ')) return <h2 className="h3" key={i}>{trimmed.slice(2)}</h2>;
    if (trimmed.startsWith('## ')) return <h2 className="h3" key={i}>{trimmed.slice(3)}</h2>;
    if (trimmed.startsWith('- ')) return <p key={i} className="legal-list-item">• {trimmed.slice(2)}</p>;
    return <p key={i}>{trimmed}</p>;
  });
}
export function FAQ() {
  const { t } = useTranslation(); useSEO('seo.faq');
  const raw = t('faq.items', { returnObjects: true });
  const items = Array.isArray(raw) ? raw : [];
  return (<><PageHead title={t('faq.h1')} /><Section><div className="narrow faq">{items.map((i) => <details key={i.q}><summary>{i.q}</summary><p>{i.a}</p></details>)}</div></Section></>);
}
export function Privacy() {
  const { t, i18n } = useTranslation(); useSEO('seo.privacy');
  const { data, failed } = useLegalPages(); const language = i18n.resolvedLanguage === 'de' ? 'de' : 'en';
  return (<><PageHead title={t('privacy.h1')} /><Section><div className="narrow legal">{(!data?.privacyApproved || failed) && <p className="alert">{t('privacy.warn')}</p>}{failed ? <p role="alert">{t('privacy.loadError')}</p> : data ? <LegalCopy text={data.privacyPolicy?.[language]} /> : <p role="status">{t('privacy.loading')}</p>}</div></Section></>);
}
export function Impressum() {
  const { t } = useTranslation(); useSEO('seo.imprint');
  const { data, failed } = useLegalPages(); const info = data?.legalInfo || {};
  const fields = ['name', 'form', 'street', 'city', 'representative', 'email', 'phone', 'register', 'vatId', 'editorial'];
  const raw = t('imprint.f', { returnObjects: true }); const f = typeof raw === 'object' && raw !== null ? raw : {};
  return (<><PageHead title={t('imprint.h1')} /><Section><div className="narrow legal">{(!data?.imprintApproved || failed) && <p className="alert">{t('imprint.warn')}</p>}
    {failed ? <p role="alert">{t('privacy.loadError')}</p> : !data ? <p role="status">{t('privacy.loading')}</p> : <dl>{fields.map((k) => <div key={k}><dt>{f[k]}</dt><dd className={info[k] ? '' : 'todo'}>{info[k] || t('imprint.missing')}</dd></div>)}</dl>}</div></Section></>);
}
export function NotFound() {
  const { t } = useTranslation(); useSEO('seo.nf');
  return <Section><h1>{t('nf.h1')}</h1><p>{t('nf.p')}</p><Link className="btn btn-navy" to="/">{t('nf.home')}</Link></Section>;
}
