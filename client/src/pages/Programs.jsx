import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSEO, usePrograms, useLoc } from '../hooks.js';
import { Section, PageHead, ProgramCard, Status, Photo } from '../components/UI.jsx';
import { NotFound } from './Info.jsx';

export default function Programs() {
  const { t } = useTranslation();
  useSEO('seo.programs');
  const s = usePrograms();

  return (
    <>
      <PageHead title={t('programs.h1')} lead={t('programs.lead')} />
      <Section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <span className="badge" style={{ fontSize: '0.88rem', padding: '0.4rem 0.9rem' }}>
            {t('programs.cohortBadge')} · {t('programs.applyDeadline')}
          </span>
        </div>
        <Status s={s} />
        <div className="grid3">
          {(s.data || []).map((p) => (
            <ProgramCard key={p.slug} p={p} />
          ))}
        </div>
      </Section>
    </>
  );
}

export function ProgramDetail() {
  const { slug } = useParams();
  const { t } = useTranslation();
  const { l, pick, date } = useLoc();
  const s = usePrograms();
  const p = (s.data || []).find((x) => x.slug === slug);

  useSEO('seo.programs');

  if (s.status !== 'ok') {
    return (
      <Section>
        <Status s={s} />
      </Section>
    );
  }

  if (!p) return <NotFound />;

  return (
    <>
      <PageHead title={pick(p.title)} lead={pick(p.summary)} />
      <Section>
        <p style={{ marginBottom: '2rem' }}>
          <Link className="more" to="/programs">
            ← {t('programs.back')}
          </Link>
        </p>

        <div className="detail">
          <div>
            <Photo
              src={p.image}
              alt={pick(p.title)}
              note={t('home.imgNote')}
            />
            <div style={{ fontSize: '1.12rem', lineHeight: '1.7', color: 'var(--ink)', margin: '2rem 0' }}>
              <p>{pick(p.description)}</p>
            </div>

            <h2 className="h3" style={{ marginTop: '2.5rem', color: 'var(--navy)' }}>
              {t('programs.outcomes')}
            </h2>
            <ul className="ticks">
              {((p.outcomes?.[l] || (l === 'en' ? (p.outcomes?.en || p.outcomes?.de) : (p.outcomes?.de || p.outcomes?.en))) || []).map((o) => (
                <li key={o}>{o}</li>
              ))}
            </ul>
          </div>

          <aside className="facts" aria-label={t('programs.facts') || 'Facts'}>
            <span className="badge" style={{ marginBottom: '1rem' }}>
              {t('programs.cohortBadge')}
            </span>
            <dl>
              <dt>{t('programs.start')}</dt>
              <dd>
                <time dateTime={p.start}>{date(p.start)}</time>
              </dd>

              <dt>{t('programs.format')}</dt>
              <dd>{pick(p.format)}</dd>

              <dt>{t('programs.place')}</dt>
              <dd>{pick(p.place)}</dd>
            </dl>

            <Link
              className="btn btn-gold"
              to={'/join?program=' + p.slug}
              style={{ width: '100%', textAlign: 'center' }}
            >
              {t('programs.signup')}
            </Link>
          </aside>
        </div>
      </Section>
    </>
  );
}
