import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSEO, usePrograms } from '../hooks.js';
import { Section, Photo, ProgramCard, Status } from '../components/UI.jsx';
import { JoinForm } from './Forms.jsx';

const ICONS = [
  <><path d="M12 6c-2-1.5-5-2-8-1.5V18c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5V4.5C17 4 14 4.5 12 6z" /><path d="M12 6v13.5" /></>,
  <><path d="M4 18l6-6 4 4 6-8" /><path d="M15 8h5v5" /></>,
  <><circle cx="9" cy="8" r="3" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" /><circle cx="17" cy="9" r="2.5" /><path d="M17 14c2.5 0 4.5 2 4.5 5" /></>,
];
const LINKS = ['/about', '/programs', '/join'];

export default function Home() {
  const { t } = useTranslation();
  useSEO('seo.home', 'seo.homeD');
  const progs = usePrograms();
  const rawPillars = t('home.pillars', { returnObjects: true });
  const pillars = Array.isArray(rawPillars) ? rawPillars : [];
  const rawSteps = t('home.steps', { returnObjects: true });
  const steps = Array.isArray(rawSteps) ? rawSteps : [];

  return (
    <>
      <div className="hero">
        <div className="wrap hero-in">
          <div className="rise">
            <p className="kick gold">{t('home.eyebrow')}</p>
            <h1>{t('home.h1')}</h1>
            <p className="lead">{t('home.lead')}</p>
            <div className="row">
              <Link className="btn btn-gold" to="/programs">{t('home.cta1')}</Link>
              <Link className="btn btn-ghost" to="/join">{t('home.cta2')}</Link>
            </div>
          </div>
          <div className="ring">
            <Photo src="/images/hero-community.jpg" alt={t('home.imgNote')} />
          </div>
        </div>
      </div>

      <div className="wrap">
        <div className="fc">
          {pillars.map((p, i) => (
            <div key={p.t}>
              <div className="ic">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#C7A86C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  {ICONS[i]}
                </svg>
              </div>
              <h2 className="h3">{p.t}</h2>
              <p>{p.d}</p>
              <Link className="more" to={LINKS[i]}>{t('home.more')} →</Link>
            </div>
          ))}
        </div>
      </div>

      <Section>
        <div className="split">
          <Photo src="/images/about-mission.jpg" alt={t('home.vH')} />
          <div className="nv">
            <p className="kick gold">{t('home.vK')}</p>
            <h2>{t('home.vH')}</h2>
            <p>{t('home.vP')}</p>
            <p><Link className="more gold" to="/about">{t('home.story')} →</Link></p>
          </div>
        </div>
      </Section>

      <section className="progs">
        <div className="wrap">
          <p className="kick">{t('home.pK')}</p>
          <h2>{t('home.nTitle')}</h2>
          <p className="sub">{t('home.pP')}</p>
          <Status s={progs} />
          <div className="grid3">
            {progs.data.slice(0, 3).map((p) => (
              <ProgramCard key={p.slug} p={p} />
            ))}
          </div>
          <p style={{ marginTop: '2rem' }}>
            <Link className="more" to="/programs">{t('home.all')} →</Link>
          </p>
        </div>
      </section>

      <section className="bt" id="join">
        <div className="wrap bt-in">
          <div>
            <p className="kick">{t('home.jK')}</p>
            <h2>{t('home.jH')}</h2>
            <p className="sub">{t('home.jP')}</p>
            <ol className="steps">
              {steps.map((s, i) => (
                <li key={s.t}>
                  <b aria-hidden="true">{i + 1}</b>
                  <p><strong>{s.t}</strong>{s.d}</p>
                </li>
              ))}
            </ol>
          </div>
          <div className="fm">
            <h2 className="h3">{t('home.fH')}</h2>
            <JoinForm />
          </div>
        </div>
      </section>

      <Section tone="sc">
        <span className="qm" aria-hidden="true">“</span>
        <blockquote><p>{t('home.verseText')}</p></blockquote>
        <p className="ref">{t('home.verseRef')}</p>
        <Link className="btn btn-gold" to="/join">{t('home.sCta')}</Link>
      </Section>
    </>
  );
}
