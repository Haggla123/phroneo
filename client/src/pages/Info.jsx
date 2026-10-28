import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSEO } from '../hooks.js';
import { Section, PageHead } from '../components/UI.jsx';
import { SITE } from '../config.js';
export function FAQ() {
  const { t } = useTranslation(); useSEO('seo.faq');
  const raw = t('faq.items', { returnObjects: true });
  const items = Array.isArray(raw) ? raw : [];
  return (<><PageHead title={t('faq.h1')} /><Section><div className="narrow faq">{items.map((i) => <details key={i.q}><summary>{i.q}</summary><p>{i.a}</p></details>)}</div></Section></>);
}
export function Privacy() {
  const { t } = useTranslation(); useSEO('seo.privacy');
  const raw = t('privacy.s', { returnObjects: true });
  const items = Array.isArray(raw) ? raw : [];
  return (<><PageHead title={t('privacy.h1')} /><Section><div className="narrow legal"><p className="alert">{t('privacy.warn')}</p>
    <ol>{items.map((s) => <li key={s}><h2 className="h3">{s}</h2><p className="todo">{t('privacy.todo')}</p></li>)}</ol></div></Section></>);
}
export function Impressum() {
  const { t } = useTranslation(); useSEO('seo.imprint');
  const raw = t('imprint.f', { returnObjects: true });
  const f = typeof raw === 'object' && raw !== null ? raw : {};
  return (<><PageHead title={t('imprint.h1')} /><Section><div className="narrow legal"><p className="alert">{t('imprint.warn')}</p>
    <dl>{Object.keys(f).map((k) => <div key={k}><dt>{f[k]}</dt><dd className={SITE.legal[k] ? '' : 'todo'}>{SITE.legal[k] || t('imprint.missing')}</dd></div>)}</dl></div></Section></>);
}
export function NotFound() {
  const { t } = useTranslation(); useSEO('seo.nf');
  return <Section><h1>{t('nf.h1')}</h1><p>{t('nf.p')}</p><Link className="btn btn-navy" to="/">{t('nf.home')}</Link></Section>;
}
