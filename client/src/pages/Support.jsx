import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSEO } from '../hooks.js';
import { Section, PageHead } from '../components/UI.jsx';

export default function Support() {
  const { t } = useTranslation();
  useSEO('seo.support');

  const raw = t('support.ways', { returnObjects: true });
  const ways = Array.isArray(raw) ? raw : [];

  return (
    <>
      <PageHead title={t('support.h1')} lead={t('support.lead')} />

      <Section>
        <div style={{ maxWidth: '780px', margin: '0 auto 3.5rem', textAlign: 'center' }}>
          <p className="kick">{t('support.introTitle')}</p>
          <h2>{t('support.introTitle')}</h2>
          <p className="lead" style={{ margin: '0 auto' }}>
            {t('support.introText')}
          </p>
        </div>

        <div className="grid3" style={{ alignItems: 'stretch' }}>
          {ways.map((w, idx) => (
            <div key={idx} className="support-tier">
              <div>
                <span className="badge" style={{ marginBottom: '1rem' }}>
                  Option {idx + 1}
                </span>
                <h3 style={{ color: 'var(--navy)', marginBottom: '0.8rem' }}>{w.title}</h3>
                <p style={{ color: 'var(--muted)', lineHeight: '1.6' }}>{w.desc}</p>
              </div>
              <div style={{ marginTop: '2rem' }}>
                <Link className="btn btn-navy sm" to="/contact" style={{ width: '100%' }}>
                  {t('nav.contact')} →
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Bank Details Card */}
        <div className="bank-card">
          <p className="kick gold" style={{ margin: 0 }}>Spenden & Fördern</p>
          <h3>{t('support.bankTitle')}</h3>
          <p style={{ opacity: 0.9, maxWidth: '65ch', margin: '0.5rem 0 1.5rem' }}>
            {t('support.taxNotice')}
          </p>

          <div className="bank-grid">
            <div>
              <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.7, display: 'block' }}>
                Empfänger / Kontoinhaber
              </span>
              <strong>PHRONEO e.V. (i. Gr.)</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.7, display: 'block' }}>
                IBAN
              </span>
              <strong style={{ letterSpacing: '0.05em' }}>DE89 5005 0201 0000 1234 56</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.7, display: 'block' }}>
                BIC / Swift
              </span>
              <strong>HELA DE F1 FRA</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.7, display: 'block' }}>
                Verwendungszweck
              </span>
              <strong>Spende PHRONEO / Name</strong>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
