import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLoc } from '../hooks.js';
export const Section = ({ tone, children }) => <section className={'sec ' + (tone || '')}><div className="wrap">{children}</div></section>;
export const PageHead = ({ title, lead }) => <div className="phead"><div className="wrap"><div className="phead-copy"><h1>{title}</h1>{lead && <p className="lead">{lead}</p>}</div></div></div>;
export function Photo({ src, alt = '', note }) {
  return src ? <img className="photo" src={src} alt={alt} loading="lazy" /> : <div className="photo ph" role="img" aria-label={note}><span>{note}</span></div>;
}
export function ProgramCard({ p }) {
  const { t } = useTranslation(); const { pick, date } = useLoc();
  return (<article className="card">
    <Photo src={p.image} alt={pick(p.title)} note={t('home.imgNote')} />
    <div className="card-b">
      <time dateTime={p.start} className="kick">{t('programs.start')}: {date(p.start)}</time>
      <h3>{pick(p.title)}</h3><p>{pick(p.summary)}</p>
      <Link className="more" to={'/programs/' + p.slug}>{t('programs.details')}<span className="sr"> – {pick(p.title)}</span> →</Link>
    </div></article>);
}
export function Status({ s }) {
  const { t } = useTranslation();
  if (s.status === 'loading') return <p role="status">{t('programs.loading')}</p>;
  if (s.status === 'error') return <p role="alert">{t('programs.error')}</p>;
  if (!s.data.length) return <p>{t('programs.empty')}</p>;
  return null;
}
