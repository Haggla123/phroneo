import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSEO } from '../hooks.js';
import { Section, PageHead } from '../components/UI.jsx';
import { fetchLegalPages } from '../api.js';

function useLegalPages() {
  const [data, setData] = useState(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => { let alive = true; fetchLegalPages().then((result) => { if (alive) setData(result); }).catch(() => { if (alive) setFailed(true); }); return () => { alive = false; }; }, []);
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
