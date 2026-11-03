import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Logo } from './Header.jsx';

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="ftr">
      <div className="wrap">
        <div className="ftr-in">
          <div className="ftr-col">
            <Logo />
            <p style={{ marginTop: '1.2rem', lineHeight: '1.6', maxWidth: '38ch' }}>
              {t('footer.blurb')}
            </p>
            <p className="tag">{t('footer.tagline')}</p>
          </div>
          <div className="ftr-col">
            <h4>{t('mainNav')}</h4>
            <ul>
              <li><Link to="/">{t('nav.home')}</Link></li>
              <li><Link to="/about">{t('nav.about')}</Link></li>
              <li><Link to="/programs">{t('nav.programs')}</Link></li>
              <li><Link to="/stories">{t('nav.stories')}</Link></li>
              <li><Link to="/impulses">{t('nav.impulses')}</Link></li>
              <li><Link to="/support">{t('nav.support')}</Link></li>
            </ul>
          </div>
          <div className="ftr-col">
            <h4>{t('nav.contact')} &amp; {t('footer.privacy')}</h4>
            <ul>
              <li><Link to="/contact">{t('nav.contact')}</Link></li>
              <li><Link to="/faq">{t('nav.faq')}</Link></li>
              <li><Link to="/privacy">{t('footer.privacy')}</Link></li>
              <li><Link to="/impressum">{t('footer.imprint')}</Link></li>
              <li>
                <Link to="/admin" style={{ color: 'var(--gold-light)' }}>
                  ⚙ {t('footer.adminLink')}
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="ftr-bottom">
          <small>© {new Date().getFullYear()} PHRONEO PROJECT. {t('footer.rights')}</small>
          <small>{t('footer.verse')}</small>
        </div>
      </div>
    </footer>
  );
}
