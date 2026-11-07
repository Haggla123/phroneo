import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { fetchStories } from '../api.js';
import { useSEO } from '../hooks.js';
import { Section, PageHead } from '../components/UI.jsx';

const DEFAULT_STORIES = [
  {
    _id: 'story-sarah',
    displayName: 'Sarah M.',
    role: {
      de: 'Medizinstudentin, Frankfurt',
      en: 'Medical Student, Frankfurt'
    },
    program: {
      de: 'Renew Kohorte',
      en: 'Renew Cohort'
    },
    quote: {
      de: '„Durch das Renew-Programm habe ich verstanden, wie sehr mein Selbstwert an Noten und Leistung hing. Das bewusste Umdenken ist für mich zu einer täglichen Befreiung von Leistungsdruck geworden.“',
      en: '“Through the Renew cohort, I realized how deeply my identity was tied to grades and external validation. Reframing my thought patterns has become a daily source of freedom from performance pressure.”'
    }
  },
  {
    _id: 'story-lukas',
    displayName: 'Lukas B.',
    role: {
      de: 'Softwareentwickler, Darmstadt',
      en: 'Software Engineer, Darmstadt'
    },
    program: {
      de: 'Purpose Mentoring',
      en: 'Purpose Mentoring'
    },
    quote: {
      de: '„Das Purpose-Mentoring hat mir geholfen, meine berufliche Laufbahn nicht aus Angst oder Vergleich zu planen, sondern mit echtem Sinn, Gelassenheit und klaren Werten.“',
      en: '“Purpose mentoring helped me plan my career without anxiety or peer comparison. I learned to make vocational choices rooted in clarity, peace, and long-term vision.”'
    }
  },
  {
    _id: 'story-elena',
    displayName: 'Elena K.',
    role: {
      de: 'Auszubildende Medienkauffrau, Mainz',
      en: 'Media Apprentice, Mainz'
    },
    program: {
      de: 'Together Retreat',
      en: 'Together Retreat'
    },
    quote: {
      de: '„Das Together-Retreat war der erste Ort, an dem ich offen über Überforderung, Zukunftsfragen und mentale Gesundheit sprechen konnte, ohne bewertet zu werden.“',
      en: '“The Together retreat was the first place where I could talk openly about mental health, future uncertainties, and big life questions without feeling judged.”'
    }
  }
];

export default function Stories() {
  const { t, i18n } = useTranslation();
  useSEO('seo.stories');
  const [items, setItems] = useState(DEFAULT_STORIES);

  useEffect(() => {
    let alive = true;
    fetchStories()
      .then((data) => {
        if (alive && Array.isArray(data) && data.length > 0) {
          setItems(data);
        }
      })
      .catch(() => {
        // Fall back cleanly to DEFAULT_STORIES - page never breaks
        if (alive) {
          setItems(DEFAULT_STORIES);
        }
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
        <div className="grid3" style={{ alignItems: 'stretch' }}>
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
