import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const Logo = ({ variant = '' }) => (
  <span className={`logo ${variant}`}>
    <img className="m" src="/brand/mark.png" alt="" />
    <img className="w" src="/brand/wordmark.png" alt="PHRONEO" />
  </span>
);

export function LangSwitch() {
  const { i18n, t } = useTranslation();
  return (
    <div className="lang" role="group" aria-label={t('langLabel')}>
      {['de', 'en'].map((l) => (
        <button
          key={l}
          type="button"
          lang={l}
          aria-pressed={i18n.language === l}
          onClick={() => i18n.changeLanguage(l)}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

export default function Header() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const k = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', k);
    return () => document.removeEventListener('keydown', k);
  }, []);

  const items = [
    ['/', 'home'],
    ['/about', 'about'],
    ['/programs', 'programs'],
    ['/stories', 'stories'],
    ['/impulses', 'impulses'],
    ['/support', 'support'],
    ['/faq', 'faq'],
    ['/contact', 'contact']
  ];

  return (
    <header className="hdr">
      <div className="wrap hdr-in">
        <Link to="/" className="brand" aria-label="PHRONEO Home">
          <Logo />
        </Link>
        <button
          type="button"
          className="burger"
          aria-expanded={open}
          aria-controls="nav"
          onClick={() => setOpen(!open)}
        >
          {open ? t('close') : t('menu')}
        </button>
        <nav id="nav" className={open ? 'open' : ''} aria-label={t('mainNav')}>
          <ul>
            {items.map(([to, k]) => (
              <li key={k}>
                <NavLink to={to} end={to === '/'}>
                  {t('nav.' + k)}
                </NavLink>
              </li>
            ))}
          </ul>
          <Link className="btn btn-gold sm" to="/join">
            {t('nav.join')}
          </Link>
          <LangSwitch />
        </nav>
      </div>
    </header>
  );
}
