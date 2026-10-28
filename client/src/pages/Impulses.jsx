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
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`btn sm ${activeCategory === cat ? 'btn-navy' : 'btn-ghost'}`}
              style={activeCategory !== cat ? { color: 'var(--navy)', borderColor: 'var(--line)' } : {}}
              onClick={() => setActiveCategory(cat)}
            >
              {cat === 'all' ? t('impulses.filterAll') : cat}
            </button>
          ))}
        </div>

        {/* Impulses Grid */}
        <div className="grid3" style={{ alignItems: 'start' }}>
          {filtered.map((item) => (
            <article key={item.id} className="impulse-card">
              <div className="impulse-top">
                <span className="badge">{item.category}</span>
                <span style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
                  {item.read} {t('impulses.readTime')}
                </span>
              </div>
              <time dateTime={item.date} style={{ fontSize: '0.82rem', color: 'var(--muted-light)', display: 'block', marginBottom: '0.4rem' }}>
                {date(item.date)}
              </time>
              <h3>{item.title}</h3>
              <p>{item.summary}</p>

              {expandedId === item.id ? (
                <div style={{ marginTop: '1.2rem', paddingTop: '1.2rem', borderTop: '1px solid var(--line)', color: 'var(--ink)', lineHeight: '1.7' }}>
                  <p>{item.content}</p>
                  <button
                    type="button"
                    className="more"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    onClick={() => setExpandedId(null)}
                  >
                    ↑ Weniger anzeigen
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="more"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginTop: '1rem' }}
                  onClick={() => setExpandedId(item.id)}
                >
                  Weiterlesen →
                </button>
              )}
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
