import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchPrograms } from './api.js';

let cache;

export function usePrograms() {
  const [s, set] = useState({ status: cache ? 'ok' : 'loading', data: cache || [] });

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const programs = await fetchPrograms();
        cache = programs;
        if (mounted) set({ status: 'ok', data: programs });
      } catch (error) {
        console.error('Failed to load programs:', error);
        // Fallback to local JSON if API fails
        try {
          const response = await fetch('/content/programs.json');
          if (response.ok) {
            const j = await response.json();
            cache = Array.isArray(j.programs) ? j.programs : [];
            if (mounted) set({ status: 'ok', data: cache });
            return;
          }
        } catch {}
        if (mounted) set({ status: 'error', data: [] });
      }
    };
    const refresh = () => {
      cache = undefined;
      load();
    };
    load();
    window.addEventListener('phroneo_programs_updated', refresh);
    return () => {
      mounted = false;
      window.removeEventListener('phroneo_programs_updated', refresh);
    };
  }, []);

  return s;
}

export function updateProgramsCache(newPrograms) {
  cache = newPrograms;
  window.dispatchEvent(new Event('phroneo_programs_updated'));
  return true;
}

export function useSEO(titleKey, descKey = 'seo.genD') {
  const { t, i18n } = useTranslation();
  useEffect(() => {
    const title = t(titleKey);
    document.title = title.startsWith('PHRONEO') ? title : `${title} · PHRONEO`;
    const set = (sel, attr, val) => {
      let m = document.head.querySelector(sel);
      if (!m) {
        m = document.createElement('meta');
        const [k, v] = attr;
        m.setAttribute(k, v);
        document.head.appendChild(m);
      }
      m.setAttribute('content', val);
    };
    const d = t(descKey);
    set('meta[name="description"]', ['name', 'description'], d);
    set('meta[property="og:title"]', ['property', 'og:title'], document.title);
    set('meta[property="og:description"]', ['property', 'og:description'], d);
    set('meta[property="og:locale"]', ['property', 'og:locale'], i18n.language === 'de' ? 'de_DE' : 'en_US');
  }, [titleKey, descKey, t, i18n.language]);
}

export const useLoc = () => {
  const { i18n } = useTranslation();
  const l = i18n.language;
  return {
    l,
    pick: (o) => (o && (o[l] ?? o.de)) ?? '',
    date: (d) => {
      try {
        return new Intl.DateTimeFormat(l, { dateStyle: 'long' }).format(new Date(d));
      } catch {
        return d;
      }
    }
  };
};
