import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSEO } from '../hooks.js';
import { Section, PageHead } from '../components/UI.jsx';

export default function Stories() {
  const { t } = useTranslation();
  useSEO('seo.stories');

  const raw = t('stories.items', { returnObjects: true });
  const items = Array.isArray(raw) ? raw : [];

  return (
    <>
      <PageHead title={t('stories.h1')} lead={t('stories.lead')} />

      <Section>
        <div className="grid3" style={{ alignItems: 'stretch' }}>
          {items.map((item, idx) => (
            <div key={idx} className="story-card">
              <div>
                <span className="badge" style={{ marginBottom: '1rem' }}>
                  {item.program}
                </span>
                <p className="story-quote">{item.quote}</p>
              </div>
              <div className="story-author">
                <div className="team-avatar" style={{ width: '48px', height: '48px', fontSize: '1.2rem', margin: 0 }}>
                  {item.name.charAt(0)}
                </div>
                <div className="story-meta">
                  <h4>{item.name}</h4>
                  <p>{item.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="navy">
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto' }}>
          <p className="kick gold">{t('stories.ctaTitle')}</p>
          <h2 style={{ color: '#FFFFFF', marginBottom: '1rem' }}>{t('stories.ctaTitle')}</h2>
          <p className="lead" style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '2rem' }}>
            {t('stories.ctaText')}
          </p>
          <Link className="btn btn-gold" to="/join">
            {t('stories.ctaBtn')} →
          </Link>
        </div>
      </Section>
    </>
  );
}
