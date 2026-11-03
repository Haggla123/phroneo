import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSEO, useTeam, useLoc } from '../hooks.js';
import { Section, PageHead, Photo } from '../components/UI.jsx';

export default function About() {
  const { t } = useTranslation();
  useSEO('seo.about');
  const { pick } = useLoc();
  const teamState = useTeam();

  const rawValues = t('about.s', { returnObjects: true });
  const values = Array.isArray(rawValues) ? rawValues : [];
  const rawTeam = t('about.team', { returnObjects: true });
  const fallbackTeam = Array.isArray(rawTeam) ? rawTeam : [];
  const team = teamState.data && teamState.data.length > 0 ? teamState.data : fallbackTeam;

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
            alt={t('about.missionAlt', { defaultValue: 'PHRONEO Mission & Spirit' })}
            note={t('about.missionNote', { defaultValue: 'PHRONEO Study & Mission' })}
          />
        </div>
      </Section>

      {/* Founder Spotlight */}
      <Section tone="cream-warm">
        <article className="founder-card">
          <div className="founder-photo-box">
            <img
              src="/images/topmanie-izuwa.jpg"
              alt={t('about.founderAlt', { defaultValue: 'Topmanie Izuwa' })}
              className="founder-photo"
            />
          </div>
          <div>
            <span className="founder-tag">{t('about.founderKick')}</span>
            <h2 className="founder-name">{t('about.founderTitle')}</h2>
            <div className="founder-role">{t('about.founderSubtitle')}</div>
            <div className="founder-text">
              <p>{t('about.founderP1')}</p>
              <p>{t('about.founderP2')}</p>
              <p>{t('about.founderP3')}</p>
              <p>{t('about.founderP4')}</p>
            </div>
          </div>
        </article>
      </Section>

      {/* Core Values */}
      <Section>
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
            alt={t('about.teamAlt', { defaultValue: 'PHRONEO Team & Mentors' })}
            note={t('about.teamNote', { defaultValue: 'PHRONEO Team Portrait' })}
          />
        </div>

        <div className="team-grid">
          {team.map((member) => {
            const role = typeof member.role === 'object' ? pick(member.role) : member.role;
            const bio = typeof member.bio === 'object' ? pick(member.bio) : member.bio;
            return (
              <div key={member.id || member.name} className={`team-card ${member.featured ? 'featured' : ''}`}>
                <div className="team-avatar">
                  {member.image ? (
                    <img src={member.image} alt={member.name} className="team-avatar-img" />
                  ) : (
                    member.name.charAt(0)
                  )}
                </div>
                <h3>{member.name}</h3>
                <div className="team-role">{role}</div>
                <p className="team-bio">{bio}</p>
              </div>
            );
          })}
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
