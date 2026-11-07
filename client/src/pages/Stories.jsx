import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { fetchStories } from '../api.js';
import { useSEO } from '../hooks.js';
import { Section, PageHead } from '../components/UI.jsx';

export default function Stories() {
  const { t, i18n } = useTranslation();
  useSEO('seo.stories');
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let alive = true;
    fetchStories()
      .then((data) => {
        if (!alive) return;
        setItems(Array.isArray(data) ? data : []);
        setStatus('loaded');
      })
      .catch(() => {
        if (alive) setStatus('error');
      });
    return () => {
      alive = false;
    };
  }, []);

  const lang = i18n.resolvedLanguage === 'de' ? 'de' : 'en';

  return (
    <>
      <PageHead title={t('stories.h1')} lead={t('stories.lead')} />

      <Section>
        {status === 'loading' && <p role="status">{t('stories.loading')}</p>}
        {status === 'error' && <p role="alert">{t('stories.loadError')}</p>}
        {status === 'loaded' && items.length === 0 && <p>{t('stories.emptyNotice')}</p>}
        {status === 'loaded' && items.length > 0 && <div className="grid3" style={{ alignItems: 'stretch' }}>
          {items.map((item) => {
            const programText = typeof item.program === 'object'
              ? (item.program?.[lang] || item.program?.en || item.program?.de || '')
              : (item.program || '');
            const quoteText = typeof item.quote === 'object'
              ? (item.quote?.[lang] || item.quote?.en || item.quote?.de || '')
              : (item.quote || '');
            const roleText = typeof item.role === 'object'
              ? (item.role?.[lang] || item.role?.en || item.role?.de || '')
              : (item.role || '');

            return (
              <div key={item._id || item.displayName} className="story-card">
                <div>
                  {programText && (
                    <span className="badge" style={{ marginBottom: '1rem' }}>
                      {programText}
                    </span>
                  )}
                  <p className="story-quote">{quoteText}</p>
                </div>
                <div className="story-author">
                  <div className="team-avatar" style={{ width: '48px', height: '48px', fontSize: '1.2rem', margin: 0 }}>
                    {item.displayName?.charAt(0) || 'P'}
                  </div>
                  <div className="story-meta">
                    <h4>{item.displayName}</h4>
                    {roleText && <p>{roleText}</p>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>}
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
