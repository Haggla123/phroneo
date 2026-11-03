import { useLayoutEffect, useRef } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import Programs, { ProgramDetail } from './pages/Programs.jsx';
import Stories from './pages/Stories.jsx';
import Impulses from './pages/Impulses.jsx';
import Support from './pages/Support.jsx';
import Admin from './pages/Admin.jsx';
import { Join, Contact } from './pages/Forms.jsx';
import { FAQ, Privacy, Impressum, NotFound } from './pages/Info.jsx';
import { useTranslation } from 'react-i18next';

export default function App() {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith('/admin');
  const { t } = useTranslation();
  const main = useRef(null);
  useLayoutEffect(() => {
    // Browsers may restore a mid-page scroll offset after refresh, placing
    // the sticky navigation over the page heading. Keep route entry at top.
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      <a className="skip" href="#main">
        {t('skip')}
      </a>
      {!isAdmin && <Header />}
      <main id="main" ref={main} tabIndex={-1}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/programs" element={<Programs />} />
          <Route path="/programs/:slug" element={<ProgramDetail />} />
          <Route path="/stories" element={<Stories />} />
          <Route path="/impulses" element={<Impulses />} />
          <Route path="/support" element={<Support />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/join" element={<Join />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/impressum" element={<Impressum />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!isAdmin && <Footer />}
    </>
  );
}
