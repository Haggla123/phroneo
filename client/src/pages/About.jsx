import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSEO } from '../hooks.js';
import { Section, PageHead, Photo } from '../components/UI.jsx';

export default function About() {
  const { t } = useTranslation();
  useSEO('seo.about');

  const rawValues = t('about.s', { returnObjects: true });
  const values = Array.isArray(rawValues) ? rawValues : [];
  const rawTeam = t('about.team', { returnObjects: true });
  const team = Array.isArray(rawTeam) ? rawTeam : [];

  return (
    <>
      <PageHead title={t('about.h1')} lead={t('about.lead')} />

      {/* Story & Vision */}
      <Section>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3.5rem', alignItems: 'center' }}>
          <div>
            <p className="kick">{t('about.storyTitle')}</p>
            <h2>{t('about.storyTitle')}</h2>
            <p style={{ color: 'var(--muted)', lineHeight: '1.7', marginBottom: '1.2rem' }}>
              {t('about.storyText1')}
            </p>
            <p style={{ color: 'var(--muted)', lineHeight: '1.7' }}>
              {t('about.storyText2')}
            </p>
          </div>
          <Photo
            src="/images/about-mission.jpg"
            alt="PHRONEO Mission & Spirit"
            note="PHRONEO Study & Mission"
          />
        </div>
      </Section>

      {/* Core Values */}
      <Section tone="cream-warm">
        <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 2.5rem' }}>
          <p className="kick">{t('about.sTitle')}</p>
          <h2>{t('about.sTitle')}</h2>
        </div>
        <div className="grid3">
          {values.map((v) => (
            <div key={v.t} className="pillar">
              <h2 className="h3">{v.t}</h2>
              <p>{v.d}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Team & Mentors */}
      <Section>
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 2rem' }}>
          <p className="kick">{t('about.teamTitle')}</p>
          <h2>{t('about.teamTitle')}</h2>
          <p className="lead" style={{ margin: '0 auto' }}>
            {t('about.teamLead')}
          </p>
        </div>

        <div style={{ maxWidth: '850px', margin: '0 auto 3rem' }}>
          <Photo
            src="/images/about-team.jpg"
            alt="PHRONEO Team & Mentors"
            note="PHRONEO Team Portrait"
          />
        </div>

        <div className="team-grid">
          {team.map((member) => (
            <div key={member.name} className="team-card">
              <div className="team-avatar">
                {member.name.charAt(0)}
              </div>
              <h3>{member.name}</h3>
              <div className="team-role">{member.role}</div>
              <p className="team-bio">{member.bio}</p>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '4rem' }}>
          <Link className="btn btn-gold" to="/join">
            {t('home.cta2')} →
          </Link>
        </div>
      </Section>
    </>
  );
}
