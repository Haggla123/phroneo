import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchPrograms, fetchTeamMembers } from './api.js';

let cache;
let teamCache;

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

export function useTeam() {
  const [s, set] = useState({ status: teamCache ? 'ok' : 'loading', data: teamCache || [] });

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      // Use persisted API data as the source of truth when it exists.
      try {
        const team = await fetchTeamMembers();
        if (Array.isArray(team) && team.length > 0) {
          teamCache = team;
          if (mounted) set({ status: 'ok', data: team });
          return;
        }
      } catch {}

      // Legacy/local fallback only when the API has no team records.
      try {
        const local = localStorage.getItem('phroneo_team_members');
        if (local) {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed) && parsed.length > 0) {
            teamCache = parsed;
            if (mounted) set({ status: 'ok', data: parsed });
            return;
          }
        }
      } catch {}

      try {
        const response = await fetch('/content/team.json');
        if (response.ok) {
          const j = await response.json();
          teamCache = Array.isArray(j.team) ? j.team : [];
          if (mounted) set({ status: 'ok', data: teamCache });
          return;
        }
      } catch {}

      if (mounted) set({ status: 'error', data: [] });
    };

    const refresh = () => {
      teamCache = undefined;
      load();
    };

    load();
    window.addEventListener('phroneo_team_updated', refresh);
    return () => {
      mounted = false;
      window.removeEventListener('phroneo_team_updated', refresh);
    };
  }, []);

  return s;
}

export function updateTeamCache(newTeam) {
  teamCache = newTeam;
  try {
    localStorage.setItem('phroneo_team_members', JSON.stringify(newTeam));
  } catch {}
  window.dispatchEvent(new Event('phroneo_team_updated'));
  return true;
}

export function useSEO(titleKey, descKey = 'seo.genD') {
  const { t, i18n } = useTranslation();
  useEffect(() => {
    const title = t(titleKey);
    document.title = title.includes('PHRONEO') ? title : `${title} · PHRONEO`;
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
  const rawLang = i18n.resolvedLanguage || i18n.language || 'de';
  const l = rawLang.split('-')[0].toLowerCase();
  return {
    l,
    pick: (o) => {
      if (!o) return '';
      if (typeof o === 'string') return o;
      if (typeof o === 'object') {
        return o[l] || (l === 'en' ? (o.en || o.de) : (o.de || o.en)) || '';
      }
      return String(o);
    },
    date: (d) => {
      try {
        return new Intl.DateTimeFormat(l === 'en' ? 'en-US' : 'de-DE', { dateStyle: 'long' }).format(new Date(d));
      } catch {
        return d;
      }
    }
  };
};
