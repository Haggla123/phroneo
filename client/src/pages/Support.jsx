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
                  {t('support.option', { defaultValue: 'Option' })} {idx + 1}
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

        {/* Donation details are shown only after the organization confirms current account information. */}
        <div className="bank-card">
          <p className="kick gold" style={{ margin: 0 }}>{t('support.bankKick')}</p>
          <h3>{t('support.bankTitle')}</h3>
          <p style={{ opacity: 0.9, maxWidth: '65ch', margin: '0.5rem 0 1.5rem' }}>
            {t('support.taxNotice')}
          </p>

          <Link className="btn btn-gold" to="/contact">{t('support.contactForGiving')}</Link>
        </div>
      </Section>
    </>
  );
}
