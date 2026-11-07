import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSEO, useLoc } from '../hooks.js';
import { Section, PageHead } from '../components/UI.jsx';

export default function Impulses() {
  const { t } = useTranslation();
  const { date } = useLoc();
  useSEO('seo.impulses');

  const raw = t('impulses.items', { returnObjects: true });
  const items = Array.isArray(raw) ? raw : [];
  const [activeCategory, setActiveCategory] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  const categories = ['all', ...Array.from(new Set(items.map((i) => i.category)))];
  const filtered = activeCategory === 'all' ? items : items.filter((i) => i.category === activeCategory);

  return (
    <>
      <PageHead title={t('impulses.h1')} lead={t('impulses.lead')} />

      <Section>
        {/* Category Filter Pills */}
        <div className="filter-pills-bar" role="toolbar" aria-label={t('impulses.filterAll')}>
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                className={`filter-pill ${isActive ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
                aria-pressed={isActive}
              >
                {cat === 'all' ? t('impulses.filterAll') : cat}
              </button>
            );
          })}
        </div>

        {/* Impulses Grid */}
        <div className="grid3" style={{ alignItems: 'start' }}>
          {filtered.map((item) => (
            <article key={item.id} className="impulse-card">
              <div className="impulse-top">
                <span className="badge">{item.category}</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: '500' }}>
                  {item.read} {t('impulses.readTime')}
                </span>
              </div>
              <time dateTime={item.date} style={{ fontSize: '0.82rem', color: 'var(--muted-light)', display: 'block', marginBottom: '0.5rem' }}>
                {date(item.date)}
              </time>
              <h3 style={{ fontSize: '1.4rem', lineHeight: '1.3', marginBottom: '0.75rem' }}>{item.title}</h3>
              <p style={{ lineHeight: '1.65', color: 'var(--muted)' }}>{item.summary}</p>

              {expandedId === item.id ? (
                <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--line)', color: 'var(--ink)', lineHeight: '1.75' }}>
                  <p>{item.content}</p>
                  <button
                    type="button"
                    className="impulse-read-more"
                    onClick={() => setExpandedId(null)}
                    aria-expanded="true"
                  >
                    <span>{t('impulses.readLess') || '↑ Weniger anzeigen'}</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="impulse-read-more"
                  onClick={() => setExpandedId(item.id)}
                  aria-expanded="false"
                >
                  <span>{t('impulses.readMore') || 'Weiterlesen →'}</span>
                </button>
              )}
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
