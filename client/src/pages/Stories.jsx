import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { fetchStories } from '../api.js';
import { useSEO } from '../hooks.js';
import { Section, PageHead } from '../components/UI.jsx';

export default function Stories() {
  const { t, i18n } = useTranslation();
  useSEO('seo.stories');
  const [items, setItems] = useState([]); const [loading, setLoading] = useState(true); const [failed, setFailed] = useState(false);
  useEffect(() => { let alive = true; fetchStories().then((data) => { if (alive) setItems(data); }).catch(() => { if (alive) setFailed(true); }).finally(() => { if (alive) setLoading(false); }); return () => { alive = false; }; }, []);
  const lang = i18n.resolvedLanguage === 'de' ? 'de' : 'en';

  return (
    <>
      <PageHead title={t('stories.h1')} lead={t('stories.lead')} />

      <Section>
        {items.length ? <div className="grid3" style={{ alignItems: 'stretch' }}>
          {items.map((item) => (
            <div key={item._id} className="story-card">
              <div>
                <span className="badge" style={{ marginBottom: '1rem' }}>
                  {item.program?.[lang] || item.program?.en || item.program?.de}
                </span>
                <p className="story-quote">{item.quote?.[lang] || item.quote?.en || item.quote?.de}</p>
              </div>
              <div className="story-author">
                <div className="team-avatar" style={{ width: '48px', height: '48px', fontSize: '1.2rem', margin: 0 }}>
                  {item.displayName?.charAt(0)}
                </div>
                <div className="story-meta">
                  <h4>{item.displayName}</h4>
                  <p>{item.role?.[lang] || item.role?.en || item.role?.de}</p>
                </div>
              </div>
            </div>
          ))}
        </div> : <p role={failed ? 'alert' : 'status'} className="narrow" style={{ textAlign: 'center', color: 'var(--muted)' }}>{loading ? t('stories.loading') : failed ? t('stories.loadError') : t('stories.emptyNotice')}</p>}
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
