import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import de from './locales/de.js';
import en from './locales/en.js';
let saved = 'de';
try { saved = localStorage.getItem('lng') || 'de'; } catch {}
i18n.use(initReactI18next).init({ resources: { de: { translation: de }, en: { translation: en } }, lng: saved, fallbackLng: 'de', interpolation: { escapeValue: false } });
i18n.on('languageChanged', (l) => { document.documentElement.lang = l; try { localStorage.setItem('lng', l); } catch {} });
document.documentElement.lang = saved;
export default i18n;
