import { useState, useRef, useId } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSEO, usePrograms, useLoc } from '../hooks.js';
import { Section, PageHead } from '../components/UI.jsx';
import { SITE } from '../config.js';
import { createSubmission } from '../api.js';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const Field = ({ id, label, error, children }) => (
  <div className="field">
    <label htmlFor={id}>{label}</label>
    {children}
    {error && (
      <p id={id + '-e'} className="err">
        {error}
      </p>
    )}
  </div>
);

function FormShell({ kind, extra, withAge, withMessage, requireName = true, requireMessage = withMessage, requireConsent = true, requireInterest = false, withEmailUpdates = false, privacyInfo = false, submitLabel, onSuccess, initial = {} }) {
  const { t } = useTranslation();
  const uid = useId();
  const [v, setV] = useState({
    name: '',
    email: '',
    age: '',
    message: '',
    program: '',
    interest: '',
    emailUpdates: false,
    consent: false,
    website: '',
    ...initial
  });
  const [err, setErr] = useState({});
  const [st, setSt] = useState('idle');
  const sum = useRef(null);

  const set = (k) => (e) =>
    setV({ ...v, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const validate = () => {
    const e = {};
    if (requireName && !v.name.trim()) e.name = t('form.req');
    if (!v.email.trim()) e.email = t('form.req');
    else if (!EMAIL.test(v.email)) e.email = t('form.email_');
    if (withAge) {
      const a = Number(v.age);
      if (!v.age) e.age = t('form.req');
      else if (!Number.isInteger(a) || a < 18 || a > 30) e.age = t('form.age_');
    }
    if (requireInterest && !v.interest) e.interest = t('form.req');
    if (requireMessage && !v.message.trim()) e.message = t('form.req');
    if (requireConsent && !v.consent) e.consent = t('form.consent_');
    return e;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    setErr(e);
    setSt('idle');
    if (Object.keys(e).length) {
      setTimeout(() => sum.current?.focus(), 0);
      return;
    }
    if (v.website) {
      setSt('fail');
      return;
    }

    setSt('sending');
    try {
      const { consent, website, ...data } = v;
      await createSubmission({ kind, ...data });
      setSt('ok');
      setV({ ...v, name: '', email: '', age: '', message: '', consent: false });
      onSuccess?.();
    } catch {
      setSt('fail');
    }
  };

  const id = (k) => uid + k;
  const ap = (k) => ({
    id: id(k),
    'aria-invalid': !!err[k],
    'aria-describedby': err[k] ? id(k) + '-e' : undefined
  });
  const n = Object.keys(err).length;
  const [c1, c2] = t('form.consent', { link: '\u0000' }).split('\u0000');

  return (
    <form onSubmit={submit} noValidate className="form">
      <p className="note">{t('form.requiredNote')}</p>
      {n > 0 && (
        <div ref={sum} tabIndex={-1} className="alert" role="alert">
          {t('form.errCount', { count: n })}
        </div>
      )}
      <Field id={id('name')} label={requireName ? t('form.name') + ' *' : t('join.nameOptional')} error={err.name}>
        <input {...ap('name')} autoComplete="name" required={requireName} placeholder={kind === 'register' ? t('join.namePlaceholder') : undefined} value={v.name} onChange={set('name')} />
      </Field>
      <Field id={id('email')} label={t('form.email') + ' *'} error={err.email}>
        <input
          {...ap('email')}
          type="email"
          autoComplete="email"
          required
          placeholder={kind === 'register' ? t('join.emailPlaceholder') : undefined}
          value={v.email}
          onChange={set('email')}
        />
      </Field>
      {withAge && (
        <Field id={id('age')} label={t('form.age') + ' (18–30) *'} error={err.age}>
          <input
            {...ap('age')}
            type="number"
            inputMode="numeric"
            min="18"
            max="30"
            value={v.age}
            onChange={set('age')}
          />
        </Field>
      )}
      {extra && extra(v, set, id('program'), err, ap)}
      {withMessage && (
        <Field id={id('message')} label={requireMessage ? t('contact.message') + ' *' : t('join.moreLabel')} error={err.message}>
          <textarea
            {...ap('message')}
            rows="5"
            required={requireMessage}
            placeholder={kind === 'register' ? t('join.morePlaceholder') : undefined}
            value={v.message}
            onChange={set('message')}
          />
        </Field>
      )}
      {withEmailUpdates && <div className="field check"><input id={id('emailUpdates')} type="checkbox" checked={v.emailUpdates} onChange={set('emailUpdates')} /><label htmlFor={id('emailUpdates')}>{t('join.emailUpdates')}</label></div>}
      <div className="hp" aria-hidden="true">
        <label>
          Website
          <input
            tabIndex={-1}
            autoComplete="off"
            value={v.website}
            onChange={set('website')}
          />
        </label>
      </div>
      {requireConsent && <div className="field check">
        <input
          {...ap('consent')}
          type="checkbox"
          checked={v.consent}
          onChange={set('consent')}
        />
        <label htmlFor={id('consent')}>
          {c1}
          <Link to="/privacy" target="_blank">
            {t('footer.privacy')}
          </Link>
          {c2}
        </label>
        {err.consent && (
          <p id={id('consent') + '-e'} className="err">
            {err.consent}
          </p>
        )}
      </div>}
      {privacyInfo && <p className="join-privacy-note">{t('join.privacyNote')} <Link to="/privacy">{t('footer.privacy')}</Link>.</p>}
      <button className="btn btn-navy" disabled={st === 'sending'}>
        {st === 'sending' ? t('form.sending') : submitLabel || t('form.submit')}
      </button>
      <div role="status" aria-live="polite" className={'msg ' + st}>
        {st === 'ok' && t('form.ok')}
        {st === 'off' && t('form.off')}
        {st === 'fail' && t('form.fail')}
      </div>
    </form>
  );
}

export function JoinForm({ withProgram }) {
  const { t } = useTranslation();
  const s = usePrograms();
  const { pick } = useLoc();
  const [q] = useSearchParams();
  const [submitted, setSubmitted] = useState(false);
  const options = t('join.options', { returnObjects: true });
  const hasOptions = options && typeof options === 'object' && !Array.isArray(options);

  if (submitted) return <div className="join-success" role="status"><span className="join-success-mark" aria-hidden="true">✓</span><h2>{t('join.successTitle')}</h2><p>{t('join.successText')}</p><Link className="btn btn-navy" to="/">{t('join.homeLink')}</Link></div>;

  return (
    <FormShell
      kind="register"
      requireName={false}
      requireConsent={false}
      requireInterest
      withEmailUpdates
      privacyInfo
      requireMessage={false}
      submitLabel={t('join.submit')}
      onSuccess={() => setSubmitted(true)}
      initial={{ program: q.get('program') || '' }}
      extra={(v, set, id, err, ap) => (
        <>
          {hasOptions && (
            <Field id={id + '-interest'} label={t('join.interestLabel') + ' *'} error={err.interest}>
              <select {...ap('interest')} required value={v.interest} onChange={set('interest')}>
                <option value="">{t('join.choose')}</option>
                {Object.entries(options).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </Field>
          )}
          {withProgram && (
            <Field id={id} label={t('join.program')}>
              <select id={id} value={v.program} onChange={set('program')}>
                <option value="">{t('join.general')}</option>
                {(s.data || []).map((p) => (
                  <option key={p.slug} value={p.slug}>
                    {pick(p.title)}
                  </option>
                ))}
              </select>
            </Field>
          )}
        </>
      )}
    />
  );
}

export function Join() {
  const { t } = useTranslation();
  useSEO('seo.join');

  return (
    <>
      <PageHead title={t('join.h1')} lead={t('join.lead')} />
      <Section tone="join-section">
        <div className="narrow join-form-wrap">
          <JoinForm withProgram />
        </div>
      </Section>
    </>
  );
}

export function Contact() {
  const { t } = useTranslation();
  useSEO('seo.contact');
  return (
    <>
      <PageHead title={t('contact.h1')} lead={t('contact.lead')} />
      <Section tone="contact-section">
        <div className="contact-layout">
          <FormShell kind="contact" withMessage />
          <aside className="contact-card">
            <h2>{t('contact.helpTitle')}</h2>
            <p>{t('contact.helpText')}</p>
            <a href="mailto:izuwatopmann7@gmail.com"><span>{t('contact.emailLabel')}</span><strong>izuwatopmann7@gmail.com</strong></a>
            <a href="https://wa.me/4917683381923" target="_blank" rel="noreferrer"><span>{t('contact.whatsappLabel')}</span><strong>+49 176 83381923</strong></a>
            <div className="contact-card-note">{t('contact.brand')}<br/>{t('contact.tagline')}</div>
          </aside>
        </div>
      </Section>
    </>
  );
}
