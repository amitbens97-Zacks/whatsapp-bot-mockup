// Settings: everything from step 13 stays editable here, next to the shark's connection.
import { html, Icon, cx } from './lib.js';
import { Button, SharkAvatar } from './components.js';
import { Tag } from './ui.js';
import { USER, SHARK_CONTACT } from './data.js';
import { Toggle, LinkPanel, HoursForm, MessagesForm, AnswersForm } from './step.js';

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
    <${HoursForm} config=${c} setCfg=${setCfg} />
    <${MessagesForm} config=${c} setCfg=${setCfg} />
    <div>
      <h2 class="fb-h2 mb-2 !text-[20px]">תשובות אוטומטיות</h2>
      <${AnswersForm} config=${c} setCfg=${setCfg} />
    </div>
  </div>`;
}

function SharkTab({ state, setShark, go, notify }) {
  const on = state.shark.connected;
  return html`<section class="fb-panel !p-4 md:!p-5">
    <p class="mb-3 flex items-center gap-3"><${SharkAvatar} size=${46} /><span><b class="block font-display text-[18px]">${SHARK_CONTACT}</b><small class="text-[14px] text-muted">${on ? `מחובר למספר ${USER.phone}` : 'עוד לא בוואטסאפ שלך'}</small></span>
      <span class="ms-auto"><${Tag} tone=${on ? 'blue' : 'muted'}>${on ? 'מחובר' : 'לא מחובר'}<//></span></p>
    <p class="mb-3 text-[15px]">הכריש עונה לכל שאלה או בעיה בעסק. הוא רק עונה, ולא שולח הודעות ביוזמתו.</p>
    ${on
      ? html`<${Button} variant="secondary" onClick=${() => (setShark((s) => ({ ...s, connected: false })), notify('הכריש נותק מהוואטסאפ', 'unplug'))}>ניתוק<//>`
      : html`<${Button} onClick=${() => go({ view: 'shark' })}><${Icon} name="message-circle" size=${18} />להוספה לוואטסאפ<//>`}
  </section>`;
}

export function Settings({ state, tab, go, setCfg, setShark, notify }) {
  const tabs = [
    ['bot', 'הבוט של העסק', 'message-circle'],
    ['shark', 'הכריש בוואטסאפ', 'fish'],
  ];
  return html`<div class="mx-auto max-w-[960px] px-4 py-5 md:px-8 md:py-6">
    <h1 class="fb-h2 mb-3">הגדרות</h1>
    <div class="mb-4 flex gap-2" role="tablist">
      ${tabs.map(
        ([id, label, icon]) => html`<button key=${id} type="button" role="tab" aria-selected=${tab === id} class=${cx('inline-flex h-10 items-center gap-1.5 rounded-xl px-3 text-[14px] font-bold cursor-pointer', tab === id ? 'bg-brand-100 text-brand-600' : 'text-muted hover:bg-white')} onClick=${() => go({ view: 'settings', tab: id })}><${Icon} name=${icon} size=${16} />${label}</button>`,
      )}
    </div>
    ${tab === 'shark'
      ? html`<${SharkTab} state=${state} setShark=${setShark} go=${go} notify=${notify} />`
      : html`<${BotTab} state=${state} setCfg=${setCfg} notify=${notify} />`}
  </div>`;
}
