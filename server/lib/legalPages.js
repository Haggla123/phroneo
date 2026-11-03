export const EMPTY_LEGAL_INFO = {
  name: '', form: '', street: '', city: '', representative: '',
  email: '', phone: '', register: '', vatId: '', editorial: ''
};

export const DEFAULT_PRIVACY_POLICY = {
  en: `# Draft privacy notice\n\nThis is a working draft. The bracketed details must be completed and the notice reviewed before publication.\n\n## 1. Who is responsible\n[Enter the controller’s verified legal name, postal address, and privacy contact email. Add data protection officer details if one is appointed or legally required.]\n\n## 2. Information collected through forms\nContact requests include the name, email address, message, consent record, and submission time. Community-interest requests may also include age, program choice, interests, and an optional message. The optional email-updates choice is stored with the request; this website does not currently run a newsletter mailing service.\n\n## 3. Why information is used and legal basis\nInformation is used to respond to contact requests and community-interest submissions. [The controller must confirm the applicable legal basis for each purpose and explain any separate consent-based processing.]\n\n## 4. Storage, recipients, and transfers\nSubmissions are stored in the website database and are visible to authorized administrators. If SMTP delivery is enabled, a contact request is also emailed through the configured Gmail account to the current recipient address. [Name the production database, hosting and email providers, their locations, and any international-transfer safeguards.]\n\n## 5. Retention\n[Set the actual retention period for contact and community-interest submissions, explain deletion criteria, and describe any backup retention.]\n\n## 6. Your rights and complaints\nDepending on the circumstances, you may request access, correction, erasure, restriction, or portability, object to processing, or withdraw consent where processing relies on consent. You may also complain to your competent data protection supervisory authority. [Add the controller’s privacy contact and the competent authority’s details.]\n\n## 7. Required information and consequences\nThe contact name is optional, but an email address and message are needed to respond. Community-interest fields marked as required are needed to process that request. [Confirm whether any legal or contractual requirement applies.]\n\n## 8. Cookies and browser storage\nThe website stores the selected language in browser local storage. The admin portal stores its sign-in token in session storage. [Confirm the production hosting logs, cookies, embedded services, and any analytics or other tracking before publication.]`,
  de: `# Entwurf der Datenschutzhinweise\n\nDies ist ein Arbeitsentwurf. Die Angaben in eckigen Klammern müssen ergänzt und die Hinweise vor der Veröffentlichung geprüft werden.\n\n## 1. Verantwortliche Stelle\n[Bitte den verifizierten Namen und die Postanschrift der verantwortlichen Stelle sowie eine Datenschutz-Kontakt-E-Mail eintragen. Angaben zu einer oder einem Datenschutzbeauftragten ergänzen, falls bestellt oder gesetzlich erforderlich.]\n\n## 2. Angaben aus Formularen\nKontaktanfragen enthalten Name, E-Mail-Adresse, Nachricht, Einwilligungsnachweis und Eingangszeitpunkt. Interessenbekundungen können zusätzlich Alter, Programmauswahl, Interessen und eine optionale Nachricht enthalten. Die optionale Auswahl für E-Mail-Neuigkeiten wird mit der Anfrage gespeichert; diese Website betreibt derzeit keinen Newsletter-Versand.\n\n## 3. Zwecke und Rechtsgrundlagen\nDie Angaben werden verwendet, um Kontaktanfragen und Interessenbekundungen zu beantworten. [Die verantwortliche Stelle muss die Rechtsgrundlage für jeden Zweck bestätigen und eine gesonderte einwilligungsbasierte Verarbeitung erläutern.]\n\n## 4. Speicherung, Empfänger und Übermittlungen\nFormulareingaben werden in der Website-Datenbank gespeichert und sind für berechtigte Administratoren sichtbar. Wenn SMTP aktiviert ist, wird eine Kontaktanfrage zusätzlich über das eingerichtete Gmail-Konto an die aktuelle Empfängeradresse gesendet. [Bitte Produktionsanbieter für Datenbank, Hosting und E-Mail, deren Standorte sowie etwaige Garantien für Drittlandübermittlungen angeben.]\n\n## 5. Speicherdauer\n[Bitte tatsächliche Aufbewahrungsfristen für Kontaktanfragen und Interessenbekundungen, Löschkriterien und die Aufbewahrungsdauer von Sicherungskopien festlegen.]\n\n## 6. Rechte und Beschwerden\nJe nach Situation können Sie Auskunft, Berichtigung, Löschung, Einschränkung oder Datenübertragbarkeit verlangen, der Verarbeitung widersprechen oder eine Einwilligung mit Wirkung für die Zukunft widerrufen. Außerdem können Sie sich bei der zuständigen Datenschutzaufsichtsbehörde beschweren. [Datenschutzkontakt und zuständige Aufsichtsbehörde ergänzen.]\n\n## 7. Pflichtangaben und Folgen\nDer Name im Kontaktformular ist optional; E-Mail-Adresse und Nachricht sind erforderlich, damit wir antworten können. Als Pflichtfelder markierte Angaben zur Community-Anfrage werden für deren Bearbeitung benötigt. [Bitte prüfen, ob gesetzliche oder vertragliche Bereitstellungspflichten bestehen.]\n\n## 8. Cookies und Browser-Speicher\nDie Website speichert die ausgewählte Sprache im lokalen Browserspeicher. Das Admin-Portal speichert das Anmeldetoken im Sitzungsspeicher. [Bitte vor Veröffentlichung Produktions-Serverprotokolle, Cookies, eingebettete Dienste sowie Analyse- und Trackingdienste prüfen.]`
};

const containsDraftMarkers = (value) => /\[[^\]]+\]|\b(TODO|TBD|PLACEHOLDER)\b/i.test(value || '');

export function normalizeLegalPages(input = {}) {
  const legalInfo = Object.fromEntries(Object.keys(EMPTY_LEGAL_INFO).map((key) => [
    key,
    String(input.legalInfo?.[key] || '').trim().slice(0, 2000)
  ]));
  const privacyPolicy = Object.fromEntries(['de', 'en'].map((language) => [
    language,
    String(input.privacyPolicy?.[language] || '').trim().slice(0, 30000)
  ]));
  const hasDraftMarkers = Object.values(legalInfo).some(containsDraftMarkers)
    || Object.values(privacyPolicy).some(containsDraftMarkers);
  const requiredImprint = ['name', 'street', 'city', 'email'];
  const imprintReady = requiredImprint.every((field) => legalInfo[field])
    && !requiredImprint.some((field) => containsDraftMarkers(legalInfo[field]));
  const privacyReady = ['de', 'en'].every((language) => privacyPolicy[language].length >= 500)
    && !Object.values(privacyPolicy).some(containsDraftMarkers);

  return {
    legalInfo,
    privacyPolicy,
    imprintApproved: Boolean(input.imprintApproved) && imprintReady,
    privacyApproved: Boolean(input.privacyApproved) && privacyReady && !hasDraftMarkers,
    legalReviewedAt: input.imprintApproved || input.privacyApproved ? new Date() : undefined
  };
}
