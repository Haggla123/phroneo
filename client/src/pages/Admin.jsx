import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LangSwitch } from '../components/Header.jsx';
import { Logo } from '../components/Header.jsx';
import { useSEO, usePrograms, updateProgramsCache, useTeam, updateTeamCache, useLoc } from '../hooks.js';
import { SITE } from '../config.js';
import {
  loginAdmin,
  verifyToken,
  logoutAdmin,
  fetchAdmins,
  createAdmin,
  deleteAdmin,
  fetchSubmissions,
  updateSubmissionStatus,
  deleteSubmission,
  clearSubmissions,
  createProgram,
  updateProgram,
  deleteProgram,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
  fetchContactDeliverySettings,
  saveContactDeliverySettings,
  sendContactDeliveryTest,
  resendContactEmail,
  fetchAdminLegalPages,
  saveLegalPages,
  fetchAdminStories,
  createStory,
  updateStory,
  deleteStory
} from '../api.js';

function optimizeProgramImage(file) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const scale = Math.min(1, 1400 / Math.max(image.naturalWidth, image.naturalHeight));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(objectUrl);
      resolve(canvas.toDataURL('image/webp', 0.82));
    };
    image.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error('Image could not be read')); };
    image.src = objectUrl;
  });
}

function AdminSignIn({ onSignIn }) {
  const { t } = useTranslation();
  useSEO('seo.admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      const data = await loginAdmin(email.trim().toLowerCase(), password);
      onSignIn(data.email);
    } catch (err) {
      setError(t(err.message === 'API_UNAVAILABLE' ? 'admin.apiUnavailable' : err.message === 'INVALID_CREDENTIALS' ? 'admin.authError' : 'admin.loginFailed'));
    } finally {
      setBusy(false);
    }
  };

  return <div className="admin-auth-screen"><div className="admin-auth-top"><Link to="/" className="admin-brand"><span className="admin-top-mark"><img src="/brand/mark.png" alt="" /></span><span>{t('admin.console')}</span></Link><LangSwitch /></div><section className="admin-auth-card"><div className="admin-auth-emblem"><img src="/brand/mark.png" alt="" /></div><span className="admin-welcome-kicker">PHRONEO · ADMIN</span><h1>{t('admin.signInTitle')}</h1><p>{t('admin.signInIntro')}</p><form className="form" onSubmit={submit}><div className="field"><label htmlFor="admin-email">{t('admin.email')}</label><input id="admin-email" type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} /></div><div className="field"><label htmlFor="admin-password">{t('admin.password')}</label><input id="admin-password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} /></div>{error && <div className="alert" role="alert">{error}</div>}<button className="btn btn-navy" disabled={busy}>{busy ? '…' : t('admin.signIn')}</button></form><p className="admin-auth-notice">{t('admin.inviteOnly')}</p><Link to="/" className="admin-auth-return">← {t('admin.viewWebsite')}</Link></section></div>;
}

function TeamIcon() {
  return <svg className="admin-team-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M16 20v-1.5a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4V20" />
    <circle cx="9" cy="7" r="4" />
    <path d="M20 20v-1.5a4 4 0 0 0-3-3.87M16 3.2a4 4 0 0 1 0 7.6" />
  </svg>;
}

function ContactDeliverySettings() {
  const { t } = useTranslation();
  const [recipientEmail, setRecipientEmail] = useState('');
  const [savedRecipientEmail, setSavedRecipientEmail] = useState('');
  const [smtpConfigured, setSmtpConfigured] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [testSent, setTestSent] = useState(false);

  useEffect(() => {
    let active = true;
    fetchContactDeliverySettings()
      .then((settings) => {
        if (!active) return;
        setRecipientEmail(settings.recipientEmail || '');
        setSavedRecipientEmail(settings.recipientEmail || '');
        setSmtpConfigured(Boolean(settings.smtpConfigured));
      })
      .catch(() => { if (active) setError(t('admin.contactDeliveryLoadFailed')); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [t]);

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSaved(false);
    setTestSent(false);
    try {
      const settings = await saveContactDeliverySettings(recipientEmail.trim());
      setRecipientEmail(settings.recipientEmail);
      setSavedRecipientEmail(settings.recipientEmail);
      setSmtpConfigured(Boolean(settings.smtpConfigured));
      setSaved(true);
    } catch (saveError) {
      setError(saveError.message === 'Enter a valid recipient email address' ? t('admin.contactEmailInvalid') : t('admin.contactDeliverySaveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const testDelivery = async () => {
    setTesting(true);
    setError('');
    setSaved(false);
    setTestSent(false);
    try {
      await sendContactDeliveryTest();
      setTestSent(true);
    } catch (testError) {
      setError(testError.message === 'SMTP email delivery is not configured' ? t('admin.smtpMissing') : t('admin.smtpTestFailed'));
    } finally {
      setTesting(false);
    }
  };

  return <section className="admin-insight-card admin-contact-delivery" style={{ marginBottom: '2rem' }}>
    <h3 style={{ color: 'var(--navy)', marginBottom: '0.5rem' }}>{t('admin.contactDeliveryHeading')}</h3>
    <p className="note">{t('admin.contactDeliveryHelp')}</p>
    <form className="form" onSubmit={submit}>
      <div className="field">
        <label htmlFor="contact-recipient-email">{t('admin.contactRecipientEmail')}</label>
        <input id="contact-recipient-email" type="email" autoComplete="email" required maxLength={254} value={recipientEmail} disabled={loading} onChange={(event) => { setRecipientEmail(event.target.value); setSaved(false); setTestSent(false); }} />
      </div>
      <p className={smtpConfigured ? 'note' : 'alert'} role="status">{smtpConfigured ? t('admin.smtpReady') : t('admin.smtpMissing')}</p>
      {error && <p className="alert" role="alert">{error}</p>}
      {saved && <p className="msg ok" role="status">{t('admin.contactDeliverySaved')}</p>}
      {testSent && <p className="msg ok" role="status">{t('admin.smtpTestSent')}</p>}
      <button className="btn btn-navy" disabled={loading || saving}>{saving ? '…' : t('admin.saveChanges')}</button>
      <button type="button" className="btn btn-ghost" disabled={!smtpConfigured || loading || saving || testing || recipientEmail.trim() !== savedRecipientEmail} onClick={testDelivery}>
        {testing ? '…' : t('admin.sendTestEmail')}
      </button>
      {smtpConfigured && recipientEmail.trim() !== savedRecipientEmail && <p className="note">{t('admin.saveBeforeTesting')}</p>}
    </form>
  </section>;
}

const blankStory = () => ({ displayName: '', role: { de: '', en: '' }, program: { de: '', en: '' }, quote: { de: '', en: '' }, publicationConsent: false, published: false });
function StoriesEditor() {
  const { t } = useTranslation();
  const [items, setItems] = useState([]); const [form, setForm] = useState(blankStory); const [editing, setEditing] = useState('');
  const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [notice, setNotice] = useState('');
  const reload = () => fetchAdminStories().then(setItems).catch(() => setError(t('admin.storiesLoadFailed')));
  useEffect(() => { reload(); }, []);
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const updateLocalized = (key, lang, value) => setForm((current) => ({ ...current, [key]: { ...current[key], [lang]: value } }));
  const edit = (item) => { setEditing(item._id); setForm({ ...blankStory(), ...item }); setNotice(''); setError(''); };
  const reset = () => { setEditing(''); setForm(blankStory()); };
  const submit = async (event) => { event.preventDefault(); setBusy(true); setError(''); setNotice(''); try { if (editing) await updateStory(editing, form); else await createStory(form); await reload(); reset(); setNotice(t('admin.storySaved')); } catch (err) { setError(err.message.toLowerCase().includes('consent') || err.message.toLowerCase().includes('permission') ? t('admin.storyConsentRequired') : t('admin.storySaveFailed')); } finally { setBusy(false); } };
  const remove = async (item) => { if (!window.confirm(t('admin.storyDeleteConfirm'))) return; setError(''); try { await deleteStory(item._id); setItems((all) => all.filter((story) => story._id !== item._id)); if (editing === item._id) reset(); } catch { setError(t('admin.storySaveFailed')); } };
  return <div className="admin-account-page"><div className="admin-account-heading"><div><h3>{t('admin.storiesHeading')}</h3><p className="note">{t('admin.storiesIntro')}</p></div><span className="admin-account-count">{items.length}</span></div>
    <form className="admin-account-form" onSubmit={submit}><h4>{editing ? t('admin.storyEdit') : t('admin.storyAdd')}</h4>
      <div className="admin-account-fields"><div className="field"><label>{t('admin.storyDisplayName')}</label><input required maxLength={90} value={form.displayName} onChange={(e) => update('displayName', e.target.value)} /></div>
      {['role', 'program', 'quote'].map((key) => ['de', 'en'].map((lang) => <div className="field" key={`${key}-${lang}`}><label>{t(`admin.story${key[0].toUpperCase()}${key.slice(1)}`)} ({lang.toUpperCase()})</label>{key === 'quote' ? <textarea required maxLength={1200} rows="4" value={form[key]?.[lang] || ''} onChange={(e) => updateLocalized(key, lang, e.target.value)} /> : <input maxLength={160} value={form[key]?.[lang] || ''} onChange={(e) => updateLocalized(key, lang, e.target.value)} />}</div>))}</div>
      <label className="check"><input type="checkbox" required checked={Boolean(form.publicationConsent)} onChange={(e) => update('publicationConsent', e.target.checked)} /> {t('admin.storyConsent')}</label>
      <label className="check"><input type="checkbox" checked={Boolean(form.published)} onChange={(e) => update('published', e.target.checked)} /> {t('admin.storyPublish')}</label>
      {error && <p className="alert" role="alert">{error}</p>}{notice && <p className="msg ok" role="status">{notice}</p>}
      <button className="btn btn-navy sm" disabled={busy || !form.publicationConsent}>{busy ? '…' : t('admin.saveChanges')}</button>{editing && <button type="button" className="btn btn-ghost sm" onClick={reset}>{t('admin.cancel')}</button>}
    </form>
    <div className="admin-account-list"><h4>{t('admin.storyList')}</h4>{items.length ? items.map((item) => <div className="admin-upcoming" key={item._id}><span><b>{item.displayName}</b><small>{item.published ? t('admin.storyPublished') : t('admin.storyDraft')} · {item.program?.en || item.program?.de}</small></span><button type="button" className="btn sm btn-ghost" onClick={() => edit(item)}>{t('admin.edit')}</button><button type="button" className="btn sm btn-ghost" onClick={() => remove(item)}>{t('admin.delete')}</button></div>) : <p className="admin-empty">{t('admin.storyNone')}</p>}</div>
  </div>;
}

function LegalPagesEditor() {
  const { t } = useTranslation(); const [data, setData] = useState(null); const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false); const [error, setError] = useState(''); const [saved, setSaved] = useState(false);
  useEffect(() => { fetchAdminLegalPages().then(setData).catch(() => setError(t('admin.legalLoadFailed'))).finally(() => setLoading(false)); }, [t]);
  const setLegal = (key, value) => setData((current) => ({ ...current, legalInfo: { ...current.legalInfo, [key]: value }, imprintApproved: false }));
  const setPolicy = (lang, value) => setData((current) => ({ ...current, privacyPolicy: { ...current.privacyPolicy, [lang]: value }, privacyApproved: false }));
  const submit = async (event) => { event.preventDefault(); setSaving(true); setError(''); setSaved(false); try { const result = await saveLegalPages(data); setData(result); setSaved(true); } catch (e) { setError(e.message.toLowerCase().includes('language') ? t('admin.privacyApprovalIncomplete') : t('admin.imprintApprovalIncomplete')); } finally { setSaving(false); } };
  const fieldLabels = t('imprint.f', { returnObjects: true });
  if (loading) return <p className="note" role="status">{t('privacy.loading')}</p>;
  if (!data) return <p className="alert" role="alert">{error || t('admin.legalLoadFailed')}</p>;
  return <section className="admin-insight-card" style={{ marginTop: '2rem' }}><h3>{t('admin.legalHeading')}</h3><p className="note">{t('admin.legalLead')} <Link to="/privacy" target="_blank">{t('footer.privacy')}</Link> · <Link to="/impressum" target="_blank">{t('footer.imprint')}</Link></p>
    <form className="form" onSubmit={submit}><h4>{t('footer.imprint')}</h4><div className="admin-account-fields">{Object.entries(fieldLabels).map(([key, label]) => <div className="field" key={key}><label>{label}</label><input maxLength={300} value={data.legalInfo?.[key] || ''} onChange={(e) => setLegal(key, e.target.value)} /></div>)}</div>
      <label className="check"><input type="checkbox" checked={Boolean(data.imprintApproved)} onChange={(e) => setData({ ...data, imprintApproved: e.target.checked })} /> {t('admin.imprintApproval')}</label><p className="note">{data.imprintApproved ? t('admin.legalApproved') : t('admin.legalDraft')}</p>
      <h4>{t('footer.privacy')}</h4>{['de', 'en'].map((lang) => <div className="field" key={lang}><label>{t('admin.privacyPolicyLanguage', { language: lang.toUpperCase() })}</label><textarea rows="16" maxLength={30000} value={data.privacyPolicy?.[lang] || ''} onChange={(e) => setPolicy(lang, e.target.value)} /></div>)}
      <label className="check"><input type="checkbox" checked={Boolean(data.privacyApproved)} onChange={(e) => setData({ ...data, privacyApproved: e.target.checked })} /> {t('admin.privacyApproval')}</label><p className="note">{data.privacyApproved ? t('admin.legalApproved') : t('admin.legalDraft')}</p>
      {error && <p className="alert" role="alert">{error}</p>}{saved && <p className="msg ok" role="status">{t('admin.legalSaved')}</p>}<button className="btn btn-navy" disabled={saving}>{saving ? '…' : t('admin.saveChanges')}</button>
    </form></section>;
}

export default function Admin() {
  const [email, setEmail] = useState('');
  const [authChecked, setAuthChecked] = useState(false);
  useEffect(() => {
    verifyToken().then((data) => { if (data) setEmail(data.email); }).catch(() => null).finally(() => setAuthChecked(true));
  }, []);
  const login = (userEmail) => {
    setEmail(userEmail);
  };
  const logout = () => {
    logoutAdmin();
    sessionStorage.removeItem('phroneo_admin_active_tab');
    localStorage.removeItem('phroneo_admin_active_tab');
    setEmail('');
  };
  if (!authChecked) return <div className="admin-auth-screen" role="status">PHRONEO · ADMIN</div>;
  return email ? <AdminWorkspace email={email} onLogout={logout} /> : <AdminSignIn onSignIn={login} />;
}

function AdminWorkspace({ email, onLogout }) {
  const { t } = useTranslation();
  const { date } = useLoc();
  useSEO('seo.admin');

  const s = usePrograms();
  const teamState = useTeam();
  const validTabs = ['dashboard', 'programs', 'team', 'stories', 'submissions', 'admins', 'settings', 'decap'];
  const [activeTab, setActiveTabState] = useState(() => {
    const saved = localStorage.getItem('phroneo_admin_active_tab') || sessionStorage.getItem('phroneo_admin_active_tab');
    return validTabs.includes(saved) ? saved : 'dashboard';
  });
  const setActiveTab = (tab) => {
    if (validTabs.includes(tab)) {
      localStorage.setItem('phroneo_admin_active_tab', tab);
      sessionStorage.setItem('phroneo_admin_active_tab', tab);
    }
    setActiveTabState(tab);
  };
  const [programsList, setProgramsList] = useState([]);
  const [teamList, setTeamList] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [submissionsError, setSubmissionsError] = useState('');
  const [resendingId, setResendingId] = useState('');
  const [submissionFilter, setSubmissionFilter] = useState('all');
  const [notice, setNotice] = useState('');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('phroneo_admin_theme') === 'dark');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingMemberImage, setUploadingMemberImage] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [adminForm, setAdminForm] = useState({ email: '', password: '', confirm: '' });
  const [adminError, setAdminError] = useState('');
  const [adminBusy, setAdminBusy] = useState(false);

  // Editing program modal state
  const [isEditing, setIsEditing] = useState(false);
  const [editProgram, setEditProgram] = useState(null);

  // Editing team member modal state
  const [isEditingMember, setIsEditingMember] = useState(false);
  const [editMember, setEditMember] = useState(null);

  // Sync programs on mount
  useEffect(() => {
    if (s.status === 'ok') {
      setProgramsList(s.data);
    }
  }, [s.data, s.status]);

  // Sync team on mount
  useEffect(() => {
    if (teamState.status === 'ok') {
      setTeamList(teamState.data);
    }
  }, [teamState.data, teamState.status]);

  useEffect(() => {
    let mounted = true;
    const loadSubmissions = async () => {
      try {
        const data = await fetchSubmissions();
        if (mounted) {
          setSubmissions(data);
          setSubmissionsError('');
        }
      } catch {
        if (mounted) setSubmissionsError(t('admin.submissionsLoadError'));
      }
    };
    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') loadSubmissions();
    };
    loadSubmissions();
    const interval = window.setInterval(loadSubmissions, 15000);
    window.addEventListener('focus', refreshWhenVisible);
    document.addEventListener('visibilitychange', refreshWhenVisible);
    return () => {
      mounted = false;
      window.clearInterval(interval);
      window.removeEventListener('focus', refreshWhenVisible);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
    };
  }, [t]);

  useEffect(() => {
    if (activeTab !== 'admins') return;
    fetchAdmins().then(setAdmins).catch(() => setAdminError(t('admin.accountsLoadError')));
  }, [activeTab, t]);

  const flashNotice = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(''), 4000);
  };

  // Program Handlers
  const handleOpenAdd = () => {
    setEditProgram({
      slug: 'neu-' + Date.now().toString().slice(-4),
      image: '/images/program-renew.jpg',
      start: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      format: { de: 'Präsenz · Samstags', en: 'In person · Saturdays' },
      place: { de: 'Frankfurt am Main', en: 'Frankfurt am Main' },
      title: { de: '', en: '' },
      summary: { de: '', en: '' },
      description: { de: '', en: '' },
      outcomes: {
        de: ['Klarheit und Orientierung', 'Gemeinschaft auf Augenhöhe'],
        en: ['Clarity and direction', 'Encouraging community']
      }
    });
    setIsEditing(true);
  };

  const handleOpenEdit = (p) => {
    setEditProgram(JSON.parse(JSON.stringify(p)));
    setIsEditing(true);
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert(t('admin.imageTypeError')); return; }
    if (file.size > 6 * 1024 * 1024) { alert(t('admin.imageSizeError')); return; }
    setUploadingImage(true);
    try {
      const image = await optimizeProgramImage(file);
      setEditProgram((program) => ({ ...program, image }));
    } catch {
      alert(t('admin.imageReadError'));
    } finally {
      setUploadingImage(false);
      event.target.value = '';
    }
  };

  const handleSaveProgram = async (e) => {
    e.preventDefault();
    if (!editProgram.title.de || !editProgram.slug) {
      alert(t('admin.titleSlugRequired', { defaultValue: 'Please provide Title (DE) and Slug.' }));
      return;
    }
    try {
      const exists = programsList.some((x) => x.slug === editProgram.slug);
      let saved;
      if (exists) {
        saved = await updateProgram(editProgram.slug, editProgram);
      } else {
        saved = await createProgram(editProgram);
      }
      const updated = programsList.map((x) => (x.slug === saved.slug ? saved : x));
      if (!exists) updated.push(saved);
      updateProgramsCache(updated);
      setProgramsList(updated);
      setIsEditing(false);
      flashNotice(t('admin.savedNotice'));
    } catch {
      flashNotice(t('admin.storageError'));
    }
  };

  const handleDeleteProgram = async (slug) => {
    if (!window.confirm(t('admin.confirmDelete'))) return;
    try {
      await deleteProgram(slug);
      const updated = programsList.filter((x) => x.slug !== slug);
      updateProgramsCache(updated);
      setProgramsList(updated);
      flashNotice(t('admin.entryDeleted'));
    } catch {
      flashNotice(t('admin.storageError'));
    }
  };

  const handleExportJson = () => {
    const data = JSON.stringify({ programs: programsList }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'programs.json';
    a.click();
    URL.revokeObjectURL(url);
    flashNotice(t('admin.exportDone'));
  };

  // Team Member Handlers
  const handleOpenAddMember = () => {
    setEditMember({
      id: 'member-' + Date.now(),
      name: '',
      role: { de: '', en: '' },
      bio: { de: '', en: '' },
      image: '',
      featured: false,
      order: teamList.length + 1
    });
    setIsEditingMember(true);
  };

  const handleOpenEditMember = (m) => {
    setEditMember({
      id: m.id || m._id || 'member-' + Date.now(),
      _id: m._id,
      name: m.name || '',
      role: {
        de: typeof m.role === 'object' ? (m.role?.de || '') : (m.role || ''),
        en: typeof m.role === 'object' ? (m.role?.en || '') : ''
      },
      bio: {
        de: typeof m.bio === 'object' ? (m.bio?.de || '') : (m.bio || ''),
        en: typeof m.bio === 'object' ? (m.bio?.en || '') : ''
      },
      image: m.image || '',
      featured: Boolean(m.featured),
      order: m.order ?? 1
    });
    setIsEditingMember(true);
  };

  const handleMemberImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setUploadingMemberImage(true);
      const optimized = await optimizeProgramImage(file);
      setEditMember((prev) => ({ ...prev, image: optimized }));
    } catch (error) {
      alert(error.message || 'Image processing failed');
    } finally {
      setUploadingMemberImage(false);
    }
  };

  const handleSaveMember = async (e) => {
    e.preventDefault();
    if (!editMember.name.trim()) {
      alert(t('admin.memberNameRequired'));
      return;
    }
    const memberId = editMember.id || editMember._id;
    const exists = teamList.some((x) => (x.id === memberId || (x._id && x._id === memberId)));

    let saved;
    try {
      if (editMember._id) {
        saved = await updateTeamMember(editMember._id, editMember);
      } else {
        saved = await createTeamMember(editMember);
      }
    } catch {
      setNotice(t('admin.teamSaveFailed'));
      return;
    }

    const updated = exists
      ? teamList.map((x) => ((x.id === memberId || (x._id && x._id === memberId)) ? { ...saved, id: memberId } : x))
      : [...teamList, { ...saved, id: memberId }];

    updated.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));

    updateTeamCache(updated);
    setTeamList(updated);
    setIsEditingMember(false);
    flashNotice(t('admin.savedNotice'));
  };

  const handleDeleteMember = async (member) => {
    if (!member?._id) return;
    if (!window.confirm(t('admin.confirmDeleteMember'))) return;
    const memberId = member.id || member._id;
    try {
      await deleteTeamMember(member._id);
    } catch {
      setNotice(t('admin.teamSaveFailed'));
      return;
    }
    const updated = teamList.filter((x) => (x.id !== memberId && x._id !== memberId));
    updateTeamCache(updated);
    setTeamList(updated);
    flashNotice(t('admin.entryDeleted'));
  };

  const handleExportTeamJson = () => {
    const data = JSON.stringify({ team: teamList }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'team.json';
    a.click();
    URL.revokeObjectURL(url);
    flashNotice(t('admin.exportDone'));
  };

  // Submission Handlers
  const setSubmissionStatus = async (id, status) => {
    try {
      const updated = await updateSubmissionStatus(id, status);
      setSubmissions((current) => current.map((s) => (s.id === id ? updated : s)));
    } catch {
      flashNotice(t('admin.storageError'));
    }
  };

  const handleDeleteSubmission = async (id) => {
    try {
      await deleteSubmission(id);
      setSubmissions(submissions.filter((s) => s.id !== id));
    } catch {
      flashNotice(t('admin.storageError'));
    }
  };

  const handleResendContactEmail = async (id) => {
    setResendingId(id);
    try {
      const updated = await resendContactEmail(id);
      setSubmissions((current) => current.map((submission) => submission.id === id ? updated : submission));
      flashNotice(t('admin.contactEmailSent'));
    } catch (error) {
      flashNotice(error.message === 'SMTP email delivery is not configured' ? t('admin.smtpMissing') : t('admin.contactEmailSendFailed'));
    } finally {
      setResendingId('');
    }
  };

  const handleClearSubmissions = async () => {
    if (!window.confirm(t('admin.clearConfirm'))) return;
    try {
      await clearSubmissions();
      setSubmissions([]);
      flashNotice(t('admin.submissionsCleared'));
    } catch {
      flashNotice(t('admin.storageError'));
    }
  };

  const handleCreateAdmin = async (event) => {
    event.preventDefault();
    setAdminError('');
    if (adminForm.password.length < 10) return setAdminError(t('admin.passwordMinimum'));
    if (adminForm.password !== adminForm.confirm) return setAdminError(t('admin.passwordMismatch'));
    setAdminBusy(true);
    try {
      const created = await createAdmin(adminForm.email.trim().toLowerCase(), adminForm.password);
      setAdmins((current) => [...current, created]);
      setAdminForm({ email: '', password: '', confirm: '' });
      flashNotice(t('admin.accountCreated'));
    } catch (error) {
      setAdminError(error.message === 'An admin with this email already exists' ? t('admin.accountExists') : t('admin.accountCreateError'));
    } finally {
      setAdminBusy(false);
    }
  };

  const handleDeleteAdmin = async (admin) => {
    if (admin.email === email) return;
    if (!window.confirm(t('admin.removeAdminConfirm', { email: admin.email }))) return;
    try {
      await deleteAdmin(admin._id);
      setAdmins((current) => current.filter((item) => item._id !== admin._id));
      flashNotice(t('admin.accountRemoved'));
    } catch {
      setAdminError(t('admin.accountRemoveError'));
    }
  };

  const filteredSubmissions =
    submissionFilter === 'all'
      ? submissions
      : submissions.filter((s) => s.kind === submissionFilter);

  const signupsCount = submissions.filter((s) => s.kind === 'register').length;
  const contactsCount = submissions.filter((s) => s.kind === 'contact').length;
  const plannedCohortsCount = programsList.filter((program) => program.start && program.start >= new Date().toISOString().slice(0, 10)).length;

  return (
    <div className={`admin-shell ${darkMode ? 'admin-dark' : 'admin-light'}`}>
      <aside className={`admin-sidebar ${sidebarOpen ? 'is-open' : ''}`}>
        <Link to="/" className="admin-brand"><span className="admin-top-mark"><img src="/brand/mark.png" alt="" /></span><span>{t('admin.console')}</span></Link>
        <div className="admin-nav-label">{t('admin.workspace').toUpperCase()}</div>
        {[
          ['dashboard', '▦', t('admin.navDashboard')],
          ['programs', '◈', t('admin.navPrograms')],
          ['team', '', t('admin.navTeam')],
          ['stories', '◇', t('admin.navStories')],
          ['submissions', '◉', t('admin.navSubmissions')],
          ['admins', '♙', t('admin.navAdmins')],
          ['settings', '⚙', t('admin.navSettings')],
          ['decap', '◇', t('admin.navContent')]
        ].map(([tab, icon, label]) => <button key={tab} type="button" className={`admin-nav-item ${activeTab === tab ? 'active' : ''}`} onClick={() => { setActiveTab(tab); setSidebarOpen(false); }}><span className="admin-nav-icon">{tab === 'team' ? <TeamIcon /> : icon}</span><span>{label}</span>{tab === 'submissions' && submissions.filter((x) => x.status === 'new').length > 0 && <b className="admin-nav-count">{submissions.filter((x) => x.status === 'new').length}</b>}</button>)}
        <div className="admin-sidebar-spacer" />
        <div className="admin-profile"><span className="admin-avatar">{(email[0] || 'P').toUpperCase()}</span><span><b>{email}</b><small>{t('admin.administrator')}</small></span></div>
        <button type="button" className="admin-signout" onClick={onLogout}>↪ <span>{t('admin.signOut')}</span></button>
        <button type="button" className="admin-theme-toggle" onClick={() => setDarkMode((v) => { localStorage.setItem('phroneo_admin_theme', v ? 'light' : 'dark'); return !v; })}><span>{darkMode ? '☼' : '☾'}</span>{darkMode ? t('admin.lightMode') : t('admin.darkMode')}</button>
      </aside>
      {sidebarOpen && <button className="admin-backdrop" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} />}
      <div className="admin-main">
        <header className="admin-topbar"><button type="button" className="admin-menu-button" aria-label="Open navigation" onClick={() => setSidebarOpen(true)}>☰</button><div className="admin-crumb">{t('admin.workspace')} <span>/</span> <b>{({dashboard:t('admin.navDashboard'),programs:t('admin.navPrograms'),team:t('admin.navTeam'),stories:t('admin.navStories'),submissions:t('admin.navSubmissions'),admins:t('admin.navAdmins'),settings:t('admin.navSettings'),decap:t('admin.navContent')})[activeTab]}</b></div><div className="admin-top-actions"><span className="admin-live"><i />{t('admin.adminReady')}</span><LangSwitch /></div></header>
        <div className="admin-page-content">
        {notice && (
          <div className="alert" style={{ marginBottom: '1.5rem', background: '#E8F5E9', borderColor: '#2E7D32' }}>
            ✓ {notice}
          </div>
        )}
        {submissionsError && <div className="alert admin-api-alert" role="alert">{submissionsError}</div>}

        <div className="admin-container">
          {/* Header Bar */}
          <div className="admin-header">
            <div>
              <span className="badge" style={{ background: 'var(--gold)', color: 'var(--navy)', marginBottom: '0.4rem' }}>
                {t('admin.badge')}
              </span>
              <h2 style={{ color: '#FFFFFF', margin: 0, fontSize: '1.5rem' }}>
                PHRONEO Management Console
              </h2>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="admin-tabs">
            <button
              type="button"
              className={`admin-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              📊 {t('admin.tabDashboard')}
            </button>
            <button
              type="button"
              className={`admin-tab ${activeTab === 'programs' ? 'active' : ''}`}
              onClick={() => setActiveTab('programs')}
            >
              🗓️ {t('admin.tabPrograms')} ({programsList.length})
            </button>
            <button
              type="button"
              className={`admin-tab ${activeTab === 'team' ? 'active' : ''}`}
              onClick={() => setActiveTab('team')}
            >
              <TeamIcon /> {t('admin.navTeam')} ({teamList.length})
            </button>
            <button
              type="button"
              className={`admin-tab ${activeTab === 'submissions' ? 'active' : ''}`}
              onClick={() => setActiveTab('submissions')}
            >
              📥 {t('admin.tabSubmissions')} ({submissions.length})
            </button>
            <button
              type="button"
              className={`admin-tab ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              ⚖️ {t('admin.tabSettings')}
            </button>
            <button
              type="button"
              className={`admin-tab ${activeTab === 'decap' ? 'active' : ''}`}
              onClick={() => setActiveTab('decap')}
            >
              🐙 {t('admin.tabDecap')}
            </button>
          </div>

          <div className="admin-body">
            {/* TAB 1: DASHBOARD */}
            {activeTab === 'dashboard' && (
              <div>
                <div className="admin-welcome"><div><span className="admin-welcome-kicker">{t('admin.welcomeKicker')}</span><h2>{t('admin.welcomeTitle')}</h2><p>{t('admin.welcomeText')}</p></div><button type="button" className="btn btn-navy sm" onClick={() => setActiveTab('programs')}>{t('admin.managePrograms')} <span aria-hidden="true">→</span></button></div>
                <div className="stat-grid">
                  <div className="stat-box">
                    <div className="stat-num">{programsList.length}</div>
                    <div className="stat-label">{t('admin.totalPrograms')}</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-num">{signupsCount}</div>
                    <div className="stat-label">{t('admin.totalSignups')}</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-num">{contactsCount}</div>
                    <div className="stat-label">{t('admin.totalContacts')}</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-num">{plannedCohortsCount}</div>
                    <div className="stat-label">{t('admin.plannedCohorts')}</div>
                  </div>
                </div>

                <div className="admin-insight-grid">
                  <section className="admin-insight-card"><div className="admin-insight-heading"><div><h3>{t('admin.communityActivity')}</h3><p>{t('admin.activitySubtitle')}</p></div><button type="button" className="more admin-view-all" onClick={() => { setSubmissionFilter('all'); setActiveTab('submissions'); }}>{t('admin.viewInbox')} →</button></div><div className="admin-activity"><div className="admin-donut" style={{'--signup-share': `${submissions.length ? signupsCount / submissions.length * 100 : 0}%`}}><span><b>{submissions.length}</b><small>{t('admin.total')}</small></span></div><div className="admin-legend"><div><i className="signup-dot"/><span>{t('admin.programApplications')}</span><b>{signupsCount}</b></div><div><i className="contact-dot"/><span>{t('admin.contactMessages')}</span><b>{contactsCount}</b></div><div><i className="resolved-dot"/><span>{t('admin.completed')}</span><b>{submissions.filter((x) => x.status === 'done').length}</b></div></div></div></section>
                  <section className="admin-insight-card"><div className="admin-insight-heading"><div><h3>{t('admin.navPrograms')}</h3><p>{t('admin.latestPrograms')}</p></div><button type="button" className="more admin-view-all" onClick={() => setActiveTab('programs')}>{t('admin.viewAll')} →</button></div>{programsList.length ? <div className="admin-upcoming-list">{programsList.slice(0, 3).map((program) => <div className="admin-upcoming" key={program.slug}><span className="admin-program-icon">◈</span><span><b>{program.title?.de || program.title?.en || program.slug}</b><small>{program.start || '—'}</small></span><span className="admin-program-arrow">↗</span></div>)}</div> : <p className="admin-empty">{t('admin.noPrograms')}</p>}</section>
                </div>

                <div className="admin-section-heading">
                  <h3 style={{ margin: 0, color: 'var(--navy)' }}>{t('admin.recentRequests')}</h3>
                  <button type="button" className="more admin-view-all" onClick={() => { setSubmissionFilter('all'); setActiveTab('submissions'); }}>
                    {t('admin.showAll')} ({submissions.length}) →
                  </button>
                </div>

                {submissions.length === 0 ? (
                  <p className="note">{t('admin.noSubmissions')}</p>
                ) : (
                  <div className="table-responsive">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>{t('admin.date')}</th>
                          <th>{t('admin.type')}</th>
                          <th>{t('admin.name')}</th>
                          <th>E-Mail</th>
                          <th>{t('admin.programMessage')}</th>
                          <th>{t('admin.emailDelivery')}</th>
                          <th>{t('admin.status')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {submissions.slice(0, 5).map((sub) => (
                          <tr key={sub.id}>
                            <td style={{ whiteSpace: 'nowrap', color: 'var(--muted)' }}>
                              {date(sub.timestamp)}
                            </td>
                            <td>
                              <span className="badge" style={sub.kind === 'register' ? { background: '#E8F5E9', color: '#2E7D32' } : {}}>
                                {sub.kind === 'register' ? t('admin.joinType') : t('admin.contactType')}
                              </span>
                            </td>
                            <td><strong>{sub.name || t('admin.anonymousName')}</strong></td>
                            <td><a href={'mailto:' + sub.email}>{sub.email}</a></td>
                            <td style={{ maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {sub.program ? `[${sub.program}] ` : ''}{sub.interest ? `· ${sub.interest} ` : ''}{sub.message || '–'}
                            </td>
                            <td>
                              {sub.kind === 'contact' && <button
                                type="button"
                                className="admin-resend-button"
                                disabled={resendingId === sub.id}
                                onClick={() => handleResendContactEmail(sub.id)}
                                title={t('admin.resendContactEmail')}
                              >{resendingId === sub.id ? '…' : t('admin.resendContactEmail')}</button>}
                              {sub.kind !== 'contact' ? '–' : t(`admin.emailDelivery_${sub.emailDeliveryStatus || 'pending'}`)}
                            </td>
                            <td>
                              <select className={`admin-status-select status-${sub.status}`} aria-label={t('admin.changeStatus')} title={t('admin.statusHelp')} value={sub.status} onChange={(event) => setSubmissionStatus(sub.id, event.target.value)}>
                                <option value="new">{t('admin.newStatus')}</option>
                                <option value="contacted">{t('admin.contactedStatus')}</option>
                                <option value="done">{t('admin.doneStatus')}</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: PROGRAMS MANAGER */}
            {activeTab === 'programs' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h3 style={{ margin: 0, color: 'var(--navy)' }}>{t('admin.manageProgramsHeading')}</h3>
                    <p className="note" style={{ margin: 0 }}>
                      {t('admin.programChangesHelp')}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.6rem' }}>
                    <button type="button" className="btn btn-navy sm" onClick={handleOpenAdd}>
                      {t('admin.addNewProgram')}
                    </button>
                    <button type="button" className="btn btn-gold sm" onClick={handleExportJson}>
                      {t('admin.exportJson')}
                    </button>
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>{t('admin.columnImage')}</th>
                        <th>{t('admin.columnTitle')}</th>
                        <th>{t('admin.columnStart')}</th>
                        <th>{t('admin.columnFormat')}</th>
                        <th>{t('admin.columnPlace')}</th>
                        <th style={{ textAlign: 'right' }}>{t('admin.columnActions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {programsList.map((p) => (
                        <tr key={p.slug}>
                          <td style={{ width: '80px' }}>
                            <img
                              src={p.image || '/images/hero-community.jpg'}
                              alt=""
                              style={{ width: '60px', height: '42px', objectFit: 'cover', borderRadius: '4px' }}
                            />
                          </td>
                          <td>
                            <strong>{p.title?.de || p.title?.en || p.slug}</strong>
                            <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>/{p.slug}</div>
                          </td>
                          <td>{p.start}</td>
                          <td>{p.format?.de}</td>
                          <td>{p.place?.de}</td>
                          <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                            <button
                              type="button"
                              className="btn sm"
                              style={{ padding: '0.3rem 0.7rem', marginRight: '0.4rem', border: '1px solid var(--line)', background: '#fff' }}
                              onClick={() => handleOpenEdit(p)}
                            >
                              {t('admin.editProgram')}
                            </button>
                            <button
                              type="button"
                              className="btn sm"
                              style={{ padding: '0.3rem 0.7rem', background: '#FFEBEE', color: '#C62828', border: 'none' }}
                              onClick={() => handleDeleteProgram(p.slug)}
                            >
                              {t('admin.deleteProgram')}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: TEAM MEMBERS */}
            {activeTab === 'team' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h3 style={{ margin: 0, color: 'var(--navy)' }}>{t('admin.manageTeamHeading')}</h3>
                    <p className="note" style={{ margin: 0 }}>
                      {t('admin.teamChangesHelp')}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.6rem' }}>
                    <button type="button" className="btn btn-navy sm" onClick={handleOpenAddMember}>
                      {t('admin.addNewMember')}
                    </button>
                    <button type="button" className="btn btn-gold sm" onClick={handleExportTeamJson}>
                      {t('admin.exportTeamJson')}
                    </button>
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>{t('admin.columnImage')}</th>
                        <th>{t('admin.name')}</th>
                        <th>{t('admin.memberRoleDe')}</th>
                        <th>{t('admin.memberRoleEn')}</th>
                        <th>{t('admin.memberOrder')}</th>
                        <th style={{ textAlign: 'right' }}>{t('admin.columnActions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teamList.map((m) => {
                        const roleDe = typeof m.role === 'object' ? (m.role?.de || '') : (m.role || '');
                        const roleEn = typeof m.role === 'object' ? (m.role?.en || '') : '';
                        const bioDe = typeof m.bio === 'object' ? (m.bio?.de || '') : (m.bio || '');
                        return (
                          <tr key={m.id || m._id || m.name}>
                            <td style={{ width: '70px' }}>
                              {m.image ? (
                                <img
                                  src={m.image}
                                  alt=""
                                  style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '50%', border: '2px solid var(--gold)' }}
                                />
                              ) : (
                                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--gold), var(--navy2))', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 'bold' }}>
                                  {m.name ? m.name.charAt(0) : '?'}
                                </div>
                              )}
                            </td>
                            <td>
                              <strong>{m.name}</strong>
                              {m.featured && (
                                <span style={{ marginLeft: '0.5rem', fontSize: '0.72rem', background: 'var(--cream-warm)', color: 'var(--gold-d)', padding: '0.15rem 0.5rem', borderRadius: '99px', fontWeight: 600 }}>
                                  ★ {t('admin.memberFeatured')}
                                </span>
                              )}
                              <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '0.2rem', maxWidth: '380px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {bioDe}
                              </div>
                            </td>
                            <td>{roleDe || '—'}</td>
                            <td>{roleEn || '—'}</td>
                            <td>{m.order ?? 0}</td>
                            <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                              <button
                                type="button"
                                className="btn sm"
                                style={{ padding: '0.3rem 0.7rem', marginRight: '0.4rem', border: '1px solid var(--line)', background: '#fff' }}
                                onClick={() => handleOpenEditMember(m)}
                              >
                                {t('admin.editMember')}
                              </button>
                              <button
                                type="button"
                                className="btn sm"
                                style={{ padding: '0.3rem 0.7rem', background: '#FFEBEE', color: '#C62828', border: 'none' }}
                                disabled={!m._id}
                                onClick={() => handleDeleteMember(m)}
                              >
                                {t('admin.deleteMember')}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {!teamList.length && (
                        <tr>
                          <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>
                            {t('admin.noTeamMembers')}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'stories' && <StoriesEditor />}

            {/* TAB 3: SUBMISSIONS INBOX */}
            {activeTab === 'submissions' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      className={`btn sm ${submissionFilter === 'all' ? 'btn-navy' : 'btn-ghost'}`}
                      style={submissionFilter !== 'all' ? { color: 'var(--navy)', borderColor: 'var(--line)' } : {}}
                      onClick={() => setSubmissionFilter('all')}
                    >
                      {t('admin.showAll')} ({submissions.length})
                    </button>
                    <button
                      type="button"
                      className={`btn sm ${submissionFilter === 'register' ? 'btn-navy' : 'btn-ghost'}`}
                      style={submissionFilter !== 'register' ? { color: 'var(--navy)', borderColor: 'var(--line)' } : {}}
                      onClick={() => setSubmissionFilter('register')}
                    >
                      {t('admin.registrations')} ({signupsCount})
                    </button>
                    <button
                      type="button"
                      className={`btn sm ${submissionFilter === 'contact' ? 'btn-navy' : 'btn-ghost'}`}
                      style={submissionFilter !== 'contact' ? { color: 'var(--navy)', borderColor: 'var(--line)' } : {}}
                      onClick={() => setSubmissionFilter('contact')}
                    >
                      {t('admin.contacts')} ({contactsCount})
                    </button>
                  </div>

                  {submissions.length > 0 && (
                    <button
                      type="button"
                      className="btn sm"
                      style={{ background: '#FFEBEE', color: '#C62828', border: 'none' }}
                      onClick={handleClearSubmissions}
                    >
                      {t('admin.clearSubmissions')}
                    </button>
                  )}
                </div>

                <p className="note admin-inbox-help">{t('admin.statusHelp')}</p>

                {filteredSubmissions.length === 0 ? (
                  <p className="note">{t('admin.noSubmissions')}</p>
                ) : (
                  <div className="table-responsive">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>{t('admin.date')}</th>
                          <th>{t('admin.type')}</th>
                          <th>{t('admin.name')}</th>
                          <th>E-Mail</th>
                          <th>{t('admin.age')}</th>
                          <th>{t('admin.program')}</th>
                          <th>{t('admin.interest')}</th>
                          <th>{t('admin.emailUpdates')}</th>
                          <th>{t('admin.emailDelivery')}</th>
                          <th>{t('admin.message')}</th>
                          <th>{t('admin.status')}</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredSubmissions.map((sub) => (
                          <tr key={sub.id}>
                            <td style={{ whiteSpace: 'nowrap', color: 'var(--muted)', fontSize: '0.85rem' }}>
                              {date(sub.timestamp)}
                            </td>
                            <td>
                              <span className="badge" style={sub.kind === 'register' ? { background: '#E8F5E9', color: '#2E7D32' } : {}}>
                                {sub.kind === 'register' ? t('admin.joinType') : t('admin.contactType')}
                              </span>
                            </td>
                            <td><strong>{sub.name || t('admin.anonymousName')}</strong></td>
                            <td><a href={'mailto:' + sub.email}>{sub.email}</a></td>
                            <td>{sub.age || '–'}</td>
                            <td>{sub.program || '–'}</td>
                            <td>{sub.interest ? t(`join.options.${sub.interest}`) : '–'}</td>
                            <td>{sub.emailUpdates ? t('admin.optedIn') : t('admin.notOptedIn')}</td>
                            <td>
                              {sub.kind !== 'contact' ? '–' : <div className="admin-email-delivery">
                                <span>{t(`admin.emailDelivery_${sub.emailDeliveryStatus || 'pending'}`)}</span>
                                <button type="button" className="admin-resend-button" disabled={resendingId === sub.id} onClick={() => handleResendContactEmail(sub.id)}>
                                  {resendingId === sub.id ? '…' : t('admin.resendContactEmail')}
                                </button>
                              </div>}
                            </td>
                            <td style={{ maxWidth: '300px', lineHeight: '1.4', fontSize: '0.9rem' }}>
                              {sub.message || '–'}
                            </td>
                            <td>
                              <select className={`admin-status-select status-${sub.status}`} aria-label={t('admin.changeStatus')} title={t('admin.statusHelp')} value={sub.status} onChange={(event) => setSubmissionStatus(sub.id, event.target.value)}>
                                <option value="new">{t('admin.newStatus')}</option>
                                <option value="contacted">{t('admin.contactedStatus')}</option>
                                <option value="done">{t('admin.doneStatus')}</option>
                              </select>
                            </td>
                            <td>
                              <button
                                type="button"
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C62828' }}
                                onClick={() => handleDeleteSubmission(sub.id)}
                                title={t('admin.removeEntry')}
                              >
                                ✕
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'admins' && (
              <div className="admin-account-page">
                <div className="admin-account-heading"><div><h3>{t('admin.accountsHeading')}</h3><p className="note">{t('admin.accountsIntro')}</p></div><span className="admin-account-count">{admins.length} {t('admin.adminAccounts')}</span></div>
                <form className="admin-account-form" onSubmit={handleCreateAdmin}>
                  <h4>{t('admin.addAdminHeading')}</h4>
                  <p className="note">{t('admin.addAdminIntro')}</p>
                  <div className="admin-account-fields">
                    <div className="field"><label htmlFor="new-admin-email">{t('admin.email')}</label><input id="new-admin-email" type="email" required autoComplete="off" value={adminForm.email} onChange={(event) => setAdminForm({ ...adminForm, email: event.target.value })} /></div>
                    <div className="field"><label htmlFor="new-admin-password">{t('admin.password')}</label><input id="new-admin-password" type="password" required minLength={10} autoComplete="new-password" value={adminForm.password} onChange={(event) => setAdminForm({ ...adminForm, password: event.target.value })} /></div>
                    <div className="field"><label htmlFor="new-admin-confirm">{t('admin.confirmPassword')}</label><input id="new-admin-confirm" type="password" required minLength={10} autoComplete="new-password" value={adminForm.confirm} onChange={(event) => setAdminForm({ ...adminForm, confirm: event.target.value })} /></div>
                  </div>
                  {adminError && <div className="alert" role="alert">{adminError}</div>}
                  <button className="btn btn-navy sm" disabled={adminBusy}>{adminBusy ? '…' : t('admin.createAccount')}</button>
                </form>
                <div className="admin-account-list"><h4>{t('admin.currentAdmins')}</h4><div className="table-responsive"><table className="admin-table"><thead><tr><th>{t('admin.email')}</th><th>{t('admin.date')}</th><th>{t('admin.columnActions')}</th></tr></thead><tbody>{admins.map((admin) => <tr key={admin._id}><td><strong>{admin.email}</strong>{admin.email === email && <span className="admin-you-badge">{t('admin.you')}</span>}</td><td>{admin.createdAt ? date(admin.createdAt) : '—'}</td><td><button type="button" className="btn sm admin-remove-account" disabled={admin.email === email || admins.length <= 1} onClick={() => handleDeleteAdmin(admin)}>{t('admin.removeAdmin')}</button></td></tr>)}</tbody></table></div></div>
              </div>
            )}

            {/* TAB 4: SETTINGS & IMPRESSUM */}
            {activeTab === 'settings' && (
              <div>
                <ContactDeliverySettings />
                <LegalPagesEditor />
              </div>
            )}

            {/* TAB 5: DECAP CMS */}
            {activeTab === 'decap' && (
              <div>
                <h3 style={{ color: 'var(--navy)' }}>{t('admin.cmsHeading')}</h3>
                <p style={{ color: 'var(--muted)', lineHeight: '1.6', maxWidth: '70ch' }}>
                  {t('admin.cmsLead')}
                </p>
                <div style={{ background: 'var(--navy)', color: '#fff', padding: '1rem', borderRadius: '8px', fontFamily: 'monospace', margin: '1.5rem 0' }}>
                  npx decap-server
                </div>
                <p style={{ color: 'var(--muted)', lineHeight: '1.6' }}>
                  {t('admin.cmsProxyLead')}
                </p>
                <a
                  href="/admin/index.html"
                  className="btn btn-navy"
                  target="_blank"
                  rel="noreferrer"
                >
                  {t('admin.openCms')} ↗
                </a>
              </div>
            )}
          </div>
        </div>
        </div>
      </div>

      {/* Program Edit / Add Modal */}
      {isEditing && editProgram && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 27, 45, 0.75)',
            display: 'grid',
            placeItems: 'center',
            zIndex: 1000,
            padding: '1.5rem',
            overflowY: 'auto'
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 'var(--r-lg)',
              maxWidth: '680px',
              width: '100%',
              padding: '2.5rem',
              boxShadow: 'var(--shadow-lg)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <h3 style={{ color: 'var(--navy)', marginTop: 0 }}>
              {programsList.some((x) => x.slug === editProgram.slug) ? t('admin.editProgramHeading') : t('admin.newProgramHeading')}
            </h3>

            <form onSubmit={handleSaveProgram} className="form" style={{ marginTop: '1.5rem' }}>
              <div className="field">
                <label>{t('admin.slugLabel')}:</label>
                <input
                  required
                  value={editProgram.slug}
                  onChange={(e) => setEditProgram({ ...editProgram, slug: e.target.value })}
                />
              </div>

              <div className="field">
                <label>{t('admin.fieldTitleDe')}:</label>
                <input
                  required
                  value={editProgram.title.de || ''}
                  onChange={(e) =>
                    setEditProgram({
                      ...editProgram,
                      title: { ...editProgram.title, de: e.target.value }
                    })
                  }
                />
              </div>

              <div className="field">
                <label>{t('admin.fieldTitleEn')}:</label>
                <input
                  value={editProgram.title.en || ''}
                  onChange={(e) =>
                    setEditProgram({
                      ...editProgram,
                      title: { ...editProgram.title, en: e.target.value }
                    })
                  }
                />
              </div>

              <div className="field">
                <label>{t('admin.fieldStart')}:</label>
                <input
                  type="date"
                  value={editProgram.start || ''}
                  onChange={(e) => setEditProgram({ ...editProgram, start: e.target.value })}
                />
              </div>

              <div className="field">
                <label>{t('admin.fieldImage')}:</label>
                <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} />
                <p className="note">{uploadingImage ? t('admin.optimizingImage') : t('admin.imageUploadHint')}</p>
                <label htmlFor="program-image-path">{t('admin.imagePath')}</label>
                <input id="program-image-path" value={editProgram.image || ''} onChange={(e) => setEditProgram({ ...editProgram, image: e.target.value })} />
                {editProgram.image && <img className="admin-image-preview" src={editProgram.image} alt={t('admin.imagePreview')} />}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="badge"
                    style={{ cursor: 'pointer', border: 'none' }}
                    onClick={() => setEditProgram({ ...editProgram, image: '/images/program-renew.jpg' })}
                  >
                    Preset: Renew
                  </button>
                  <button
                    type="button"
                    className="badge"
                    style={{ cursor: 'pointer', border: 'none' }}
                    onClick={() => setEditProgram({ ...editProgram, image: '/images/program-purpose.jpg' })}
                  >
                    Preset: Purpose
                  </button>
                  <button
                    type="button"
                    className="badge"
                    style={{ cursor: 'pointer', border: 'none' }}
                    onClick={() => setEditProgram({ ...editProgram, image: '/images/program-community.jpg' })}
                  >
                    Preset: Community
                  </button>
                </div>
              </div>

              <div className="field">
                <label>{t('admin.fieldFormatDe')}:</label>
                <input
                  value={editProgram.format.de || ''}
                  onChange={(e) =>
                    setEditProgram({
                      ...editProgram,
                      format: { ...editProgram.format, de: e.target.value }
                    })
                  }
                />
              </div>

              <div className="field">
                <label>{t('admin.fieldPlaceDe')}:</label>
                <input
                  value={editProgram.place.de || ''}
                  onChange={(e) =>
                    setEditProgram({
                      ...editProgram,
                      place: { ...editProgram.place, de: e.target.value }
                    })
                  }
                />
              </div>

              <div className="field">
                <label>{t('admin.fieldSummaryDe')}:</label>
                <textarea
                  rows="2"
                  value={editProgram.summary.de || ''}
                  onChange={(e) =>
                    setEditProgram({
                      ...editProgram,
                      summary: { ...editProgram.summary, de: e.target.value }
                    })
                  }
                />
              </div>

              <div className="field">
                <label>{t('admin.fieldDescDe')}:</label>
                <textarea
                  rows="4"
                  value={editProgram.description.de || ''}
                  onChange={(e) =>
                    setEditProgram({
                      ...editProgram,
                      description: { ...editProgram.description, de: e.target.value }
                    })
                  }
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{ color: 'var(--navy)' }}
                  onClick={() => setIsEditing(false)}
                >
                  {t('admin.cancel')}
                </button>
                <button type="submit" className="btn btn-gold">
                  {t('admin.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Team Member Edit / Add Modal */}
      {isEditingMember && editMember && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 27, 45, 0.75)',
            display: 'grid',
            placeItems: 'center',
            zIndex: 1000,
            padding: '1.5rem',
            overflowY: 'auto'
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 'var(--r-lg)',
              maxWidth: '680px',
              width: '100%',
              padding: '2.5rem',
              boxShadow: 'var(--shadow-lg)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <h3 style={{ color: 'var(--navy)', marginTop: 0 }}>
              {teamList.some((x) => (x.id === editMember.id || (x._id && x._id === editMember._id)))
                ? t('admin.editMemberHeading')
                : t('admin.newMemberHeading')}
            </h3>

            <form onSubmit={handleSaveMember} className="form" style={{ marginTop: '1.5rem' }}>
              <div className="field">
                <label>{t('admin.memberName')}:</label>
                <input
                  required
                  value={editMember.name}
                  onChange={(e) => setEditMember({ ...editMember, name: e.target.value })}
                  placeholder="e.g. Topmanie Izuwa"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="field">
                  <label>{t('admin.memberRoleDe')}:</label>
                  <input
                    value={editMember.role?.de || ''}
                    onChange={(e) =>
                      setEditMember({
                        ...editMember,
                        role: { ...editMember.role, de: e.target.value }
                      })
                    }
                    placeholder="z.B. Gründer & Initiator"
                  />
                </div>
                <div className="field">
                  <label>{t('admin.memberRoleEn')}:</label>
                  <input
                    value={editMember.role?.en || ''}
                    onChange={(e) =>
                      setEditMember({
                        ...editMember,
                        role: { ...editMember.role, en: e.target.value }
                      })
                    }
                    placeholder="e.g. Founder & Lead"
                  />
                </div>
              </div>

              <div className="field">
                <label>{t('admin.memberBioDe')}:</label>
                <textarea
                  rows={4}
                  value={editMember.bio?.de || ''}
                  onChange={(e) =>
                    setEditMember({
                      ...editMember,
                      bio: { ...editMember.bio, de: e.target.value }
                    })
                  }
                  placeholder="Deutsche Biografie / Kurzbeschreibung..."
                />
              </div>

              <div className="field">
                <label>{t('admin.memberBioEn')}:</label>
                <textarea
                  rows={4}
                  value={editMember.bio?.en || ''}
                  onChange={(e) =>
                    setEditMember({
                      ...editMember,
                      bio: { ...editMember.bio, en: e.target.value }
                    })
                  }
                  placeholder="English biography / short summary..."
                />
              </div>

              <div className="field">
                <label>{t('admin.memberImage')}:</label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                  {editMember.image && (
                    <img
                      src={editMember.image}
                      alt="Preview"
                      style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--gold)' }}
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleMemberImageUpload}
                    disabled={uploadingMemberImage}
                  />
                </div>
                <input
                  type="text"
                  placeholder="Or enter image URL (e.g. /images/topmanie-izuwa.jpg)"
                  value={editMember.image || ''}
                  onChange={(e) => setEditMember({ ...editMember, image: e.target.value })}
                />
                <p className="note">{uploadingMemberImage ? t('admin.optimizingImage') : t('admin.imageUploadHint')}</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignItems: 'center' }}>
                <div className="field">
                  <label>{t('admin.memberOrder')}:</label>
                  <input
                    type="number"
                    min="1"
                    value={editMember.order ?? 1}
                    onChange={(e) => setEditMember({ ...editMember, order: parseInt(e.target.value, 10) || 1 })}
                  />
                </div>
                <div className="field" style={{ paddingTop: '1.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={Boolean(editMember.featured)}
                      onChange={(e) => setEditMember({ ...editMember, featured: e.target.checked })}
                    />
                    <span>{t('admin.memberFeatured')}</span>
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginTop: '2rem' }}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{ color: 'var(--navy)' }}
                  onClick={() => setIsEditingMember(false)}
                >
                  {t('admin.cancel')}
                </button>
                <button type="submit" className="btn btn-gold" disabled={uploadingMemberImage}>
                  {t('admin.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
