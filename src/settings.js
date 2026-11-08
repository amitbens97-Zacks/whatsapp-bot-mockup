// Settings: everything from step 13 stays editable here.
import { html } from './lib.js';
import { USER } from './data.js';
import { Toggle, LinkPanel, PlacesForm, HoursForm, MessagesForm, AnswersForm } from './step.js';

function BotTab({ state, setCfg, notify }) {
  const c = state.config;
  return html`<div class="flex flex-col gap-4">
    <section class="fb-panel !p-4 md:!p-5">
      <div class="mb-3 flex items-center gap-3 border-b border-line pb-3">
        <${Toggle} on=${c.active} label="הבוט פעיל" onChange=${(active) => (setCfg({ active }), notify(active ? 'הבוט פעיל' : 'הבוט מושהה. הלידים רואים רק את המספר שלך', active ? 'play' : 'pause'))} />
        <span class="min-w-0"><b class="block text-[16px]">${c.active ? 'הבוט פעיל' : 'הבוט מושהה'}</b><small class="block text-[13px] text-muted">כשהוא מושהה הקישור פותח שיחה עם ${USER.phone}, ולא נשלחות תשובות.</small></span>
      </div>
      <div class="flex items-center gap-3">
        <${Toggle} on=${c.mail} label="מייל על ליד שמחכה לך" onChange=${(mail) => setCfg({ mail })} />
        <span class="min-w-0"><b class="block text-[16px]">מייל על ליד שמחכה לך</b><small class="block text-[13px] text-muted">מייל אחד לשיחה, אל ${USER.email}. הפעמון והכרטיס בדף הבית תמיד פועלים.</small></span>
      </div>
    </section>
    <${LinkPanel} notify=${notify} compact />
    <${PlacesForm} config=${c} setCfg=${setCfg} inSettings />
    <${HoursForm} config=${c} setCfg=${setCfg} />
    <${MessagesForm} config=${c} setCfg=${setCfg} />
    <div>
      <h2 class="fb-h2 mb-2 !text-[20px]">תשובות אוטומטיות</h2>
      <${AnswersForm} config=${c} setCfg=${setCfg} />
    </div>
  </div>`;
}

export function Settings({ state, setCfg, notify }) {
  return html`<div class="mx-auto max-w-[960px] px-4 py-5 md:px-8 md:py-6">
    <h1 class="fb-h2 mb-3">הגדרות הבוט</h1>
    <${BotTab} state=${state} setCfg=${setCfg} notify=${notify} />
  </div>`;
}
