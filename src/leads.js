// The leads page. Conversations live inside the leads, not on a page of their own: the
// simple view from step 11, and the full table with the numbers from step 14. Both read
// the same one leads table. Next to it, marked as a mockup tool, the lead's phone.
import { html, useState, useEffect, useRef, Icon, cx } from './lib.js';
import { Button, SharkAvatar } from './components.js';
import { Tag, Sheet } from './ui.js';
import { Phone, FlowBizAvatar } from './phone.js';
import { TEMPLATES, FIRST_TEXT } from './data.js';

const STATUS_TONE = { 'מחכה לאישור': 'blue', 'מחכה לך': 'blue', חדש: 'muted', בשיחה: 'muted', נסגר: 'live', הוסר: 'fix' };

const TAGS = {
  opening: ['zap', 'מענה ראשוני · יצא לבד'],
  auto: ['zap', 'תשובה אוטומטית · יצאה לבד'],
  media: ['zap', 'אישור קבלה · יצא לבד'],
  human: ['zap', 'העברה אליך · יצאה לבד'],
  hold: ['zap', 'העברה לשירות לקוחות · יצאה לבד'],
  stop: ['zap', 'אישור הסרה · יצא לבד'],
  ended: ['zap', 'הודעת סיום מנוי · יצאה לבד'],
  approved: ['check', 'נשלח באישור שלך'],
  me: ['pencil', 'נכתב על ידך'],
  template: ['file-text', 'תבנית של FlowBiz'],
  switch: ['git-branch', 'מעבר עסק · יצא לבד'],
};

export const needsYou = (l) => !!l.draft || l.status === 'מחכה לך';

function Msg({ m }) {
  if (m.who === 'note') return html`<p class="mx-auto my-1 max-w-[86%] rounded-lg bg-canvas px-3 py-1.5 text-center text-[13px] text-muted">${m.text}</p>`;
  const mine = m.who !== 'lead';
  const tag = TAGS[m.tag];
  return html`<div class=${cx('rise flex max-w-[86%] flex-col', mine ? 'items-end self-end' : 'items-start self-start')}>
    <div class=${cx('whitespace-pre-wrap rounded-2xl px-3 py-2 text-[14px] leading-snug', mine ? 'bg-brand-100 text-ink' : 'bg-white ring-1 ring-line')}>
      ${m.kind === 'voice' ? html`<span class="flex items-center gap-2"><${Icon} name="mic" size=${16} class="text-brand-600" />הודעה קולית, 0:14</span>` : m.text}
    </div>
    <span class="mt-0.5 flex items-center gap-1 px-1 text-[11.5px] text-muted">
      ${tag && html`<${Icon} name=${tag[0]} size=${12} />${tag[1]} · `}${m.t}
    </span>
  </div>`;
}

function DraftBox({ lead, act }) {
  const [text, setText] = useState(lead.draft.text);
  const [keep, setKeep] = useState(false);
  useEffect(() => setText(lead.draft.text), [lead.draft.text]);
  return html`<div class="rise border-t border-line bg-brand-50 p-3">
    <p class="mb-1.5 flex items-center gap-2 text-[14px] font-bold"><${SharkAvatar} size=${30} />הכריש מציע תשובה בקול שלך</p>
    <textarea aria-label="הצעת התשובה" rows="3" class="w-full rounded-xl border-[1.5px] border-brand-300 bg-white p-2.5 text-[14px] leading-snug text-ink outline-none focus:border-brand-600" value=${text} onInput=${(e) => setText(e.target.value)}></textarea>
    <p class="mb-2 mt-1 text-[12px] text-muted">${lead.draft.why}</p>
    <label class="mb-2 flex cursor-pointer items-center gap-2 text-[13px] font-semibold">
      <input type="checkbox" class="h-4 w-4 accent-brand-600" checked=${keep} onChange=${(e) => setKeep(e.target.checked)} />
      מעכשיו לענות על שאלה כזו לבד
    </label>
    <div class="flex items-center gap-2">
      <${Button} class="!h-10 !px-4 !text-[15px]" disabled=${!text.trim()} onClick=${() => act.approve(lead.id, text.trim(), keep)}><${Icon} name="send" size=${16} />לשלוח<//>
      <${Button} variant="text" onClick=${() => act.dismiss(lead.id)}>לא עכשיו<//>
    </div>
  </div>`;
}

function Composer({ lead, act }) {
  const [text, setText] = useState('');
  const send = () => {
    if (!text.trim()) return;
    act.manual(lead.id, text.trim());
    setText('');
  };
  return html`<div class="flex items-center gap-2 border-t border-line bg-white p-2">
    <input class="h-10 min-w-0 flex-1 rounded-xl border-[1.5px] border-line bg-white px-3 text-[15px] text-ink outline-none focus:border-brand-600" aria-label="תשובה ללקוח" placeholder=${`תשובה ל${lead.name}`} value=${text} onInput=${(e) => setText(e.target.value)} onKeyDown=${(e) => e.key === 'Enter' && send()} />
    <button type="button" aria-label="שליחה" class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-600 text-white cursor-pointer" onClick=${send}><${Icon} name="send" size=${17} /></button>
  </div>`;
}

const WaOut = ({ lead, act }) => html`<button type="button" class="inline-flex h-9 items-center gap-1.5 rounded-lg px-2 text-[13px] font-bold text-brand-600 hover:bg-brand-50 cursor-pointer" onClick=${() => act.toast(`נפתח וואטסאפ מהמספר הפרטי שלך אל ${lead.name}`, 'external-link')}><${Icon} name="external-link" size=${15} />להמשיך מהוואטסאפ שלי</button>`;

function WindowClosed({ lead, act }) {
  return html`<div class="border-t border-line bg-warn-50 p-3">
    <p class="mb-2 text-[14px] font-bold">עברו 24 שעות מההודעה האחרונה של הליד</p>
    <p class="mb-2 text-[13px]">וואטסאפ מאפשר עכשיו לפתוח שיחה רק בתבנית מאושרת:</p>
    <div class="mb-1 flex flex-wrap gap-2">
      ${TEMPLATES.map((t) => html`<button key=${t.id} type="button" title=${t.text} class="fb-chip !h-9 !text-[13px]" onClick=${() => act.template(lead.id, t)}>${t.name}</button>`)}
    </div>
    <${WaOut} lead=${lead} act=${act} />
  </div>`;
}

export function Thread({ lead, act, onBack, ended }) {
  const box = useRef();
  const shown = lead.msgs.filter((m) => !m.other);
  useEffect(() => {
    if (box.current) box.current.scrollTop = box.current.scrollHeight;
  }, [shown.length, lead.typing]);
  const closed = lead.status === 'נסגר';
  return html`<div class="flex h-full min-h-0 flex-col bg-surface">
    <div class="flex shrink-0 items-center gap-2 border-b border-line bg-white px-3 py-2">
      ${onBack && html`<button type="button" aria-label="חזרה לרשימה" class="rounded-lg p-1.5 text-muted hover:bg-brand-50 cursor-pointer" onClick=${onBack}><${Icon} name="arrow-right" size=${18} /></button>`}
      <div class="min-w-0 flex-1">
        <b class="block truncate font-display text-[16px]">${lead.name}</b>
        <small class="block truncate text-[12.5px] text-muted"><span dir="ltr">${lead.phone}</span> · ${lead.source}</small>
      </div>
      ${closed
        ? html`<${Tag} tone="live">נסגר<//>`
        : !lead.stopped && html`<${Button} variant="mini" onClick=${() => act.closed(lead.id)}>סגרתי!<//>`}
    </div>
    ${lead.paused &&
    html`<div class="flex shrink-0 items-center justify-between gap-2 bg-brand-50 px-3 py-1.5 text-[13px] font-semibold">
      <span>הבוט עצור בשיחה הזו, והיא מחכה לך</span>
      <button type="button" class="font-bold text-brand-600 underline underline-offset-2 cursor-pointer" onClick=${() => act.resume(lead.id)}>להחזיר את הבוט</button>
    </div>`}
    <div ref=${box} class="thin-scroll flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-3">
      ${shown.map((m) => html`<${Msg} key=${m.id} m=${m} />`)}
    </div>
    ${lead.draft && html`<${DraftBox} key=${lead.id + lead.draft.q} lead=${lead} act=${act} />`}
    ${lead.stopped
      ? html`<div class="border-t border-line bg-canvas p-3 text-[14px] font-semibold">הליד ביקש להסיר אותו. אי אפשר לכתוב לו מכאן, גם לא בתבנית.</div>`
      : ended
        ? html`<div class="border-t border-line bg-canvas p-3 text-[14px] font-semibold">המנוי הסתיים, אז אי אפשר לענות מכאן. כל השיחות נשמרות.</div>`
      : lead.windowClosed
        ? html`<${WindowClosed} lead=${lead} act=${act} />`
        : lead.viaBot
          ? !lead.draft && html`<${Composer} lead=${lead} act=${act} />`
          : html`<div class="border-t border-line bg-white p-2"><${WaOut} lead=${lead} act=${act} /></div>`}
  </div>`;
}

export function LeadRow({ lead, on, onClick }) {
  const wait = needsYou(lead);
  return html`<button type="button" onClick=${onClick} aria-current=${on} class=${cx('flex w-full items-start gap-2 border-b border-line px-3 py-2.5 text-start cursor-pointer', on ? 'bg-brand-100' : 'bg-white hover:bg-brand-50')}>
    <span class="min-w-0 flex-1">
      <b class="block truncate text-[15px]">${lead.name}</b>
      <small class="block truncate text-[12.5px] text-muted">${lead.source}</small>
      ${lead.status !== 'חדש' && html`<span class="mt-1 block"><${Tag} tone=${STATUS_TONE[lead.status] || 'muted'}>${lead.status}<//></span>`}
    </span>
    <span class="flex shrink-0 flex-col items-end gap-1">
      <small class="text-[11.5px] text-muted">${lead.lastAt}</small>
      ${wait && html`<span class="h-2.5 w-2.5 rounded-full bg-brand-600" aria-label="מחכה לך"></span>`}
    </span>
  </button>`;
}

function LeadsTable({ leads, onOpen }) {
  const bot = leads.filter((l) => l.viaBot).length;
  const auto = leads.flatMap((l) => l.msgs).filter((m) => ['opening', 'auto'].includes(m.tag)).length;
  const closed = leads.filter((l) => l.status === 'נסגר').length;
  const stats = [
    ['לידים', leads.length],
    ['מהבוט', bot],
    ['מענה ראשוני, בממוצע', '4 שניות'],
    ['הודעות שיצאו לבד', auto],
    ['נסגרו', closed],
  ];
  return html`<div class="flex h-full min-h-0 flex-col bg-surface">
    <div class="grid shrink-0 grid-cols-2 gap-2 border-b border-line p-3 sm:grid-cols-5">
      ${stats.map(([k, v]) => html`<div key=${k} class="rounded-xl bg-canvas px-3 py-2"><b class="block font-display text-[20px]">${v}</b><small class="block text-[12px] text-muted">${k}</small></div>`)}
    </div>
    <div class="thin-scroll min-h-0 flex-1 overflow-auto">
      <table class="w-full min-w-[560px] text-start text-[14px]">
        <thead><tr class="text-[12.5px] text-muted [&>th]:px-3 [&>th]:py-2 [&>th]:text-start"><th>שם</th><th>טלפון</th><th>מקור</th><th>סטטוס</th><th>אחרון</th></tr></thead>
        <tbody>
          ${leads.map(
            (l) => html`<tr key=${l.id} class="cursor-pointer border-t border-line hover:bg-brand-50 [&>td]:px-3 [&>td]:py-2" onClick=${() => onOpen(l.id)}>
              <td class="font-bold">${l.name}${needsYou(l) ? html` <span class="ms-1 inline-block h-2 w-2 rounded-full bg-brand-600"></span>` : ''}</td>
              <td dir="ltr" class="text-end">${l.phone}</td>
              <td>${l.source}</td>
              <td><${Tag} tone=${STATUS_TONE[l.status] || 'muted'}>${l.status}<//></td>
              <td class="text-muted">${l.lastAt}</td>
            </tr>`,
          )}
        </tbody>
      </table>
    </div>
  </div>`;
}

// The leads page of the system: the simple list and conversation before step 14, the
// full table from step 14. Same one leads table in both.
export function SystemPane({ state, act, phoneLayout }) {
  const leads = state.leads.filter((l) => !l.unrouted);
  const sel = leads.find((l) => l.id === state.sel);
  const [open, setOpen] = useState(false);
  const pick = (id) => {
    act.select(id);
    setOpen(true);
  };
  const thread = (back) => html`<${Thread} lead=${sel} act=${act} ended=${state.ended} onBack=${back ? () => setOpen(false) : undefined} />`;
  if (state.after14) return open && sel ? thread(true) : html`<${LeadsTable} leads=${leads} onOpen=${pick} />`;
  if (phoneLayout)
    return open && sel
      ? thread(true)
      : html`<div class="thin-scroll h-full overflow-y-auto bg-white">${leads.map((l) => html`<${LeadRow} key=${l.id} lead=${l} on=${false} onClick=${() => pick(l.id)} />`)}</div>`;
  return html`<div class="grid h-full min-h-0 grid-cols-[240px_minmax(0,1fr)]">
    <div class="thin-scroll min-h-0 overflow-y-auto border-e border-line bg-white">${leads.map((l) => html`<${LeadRow} key=${l.id} lead=${l} on=${l.id === state.sel} onClick=${() => act.select(l.id)} />`)}</div>
    ${sel ? thread(false) : html`<div class="grid place-items-center p-6 text-center text-[14px] text-muted">הודעה בלי קוד לא מגיעה לאף עסק, עד שיודעים למי היא.</div>`}
  </div>`;
}

const toPhone = (lead) =>
  lead.msgs
    .filter((m) => m.who !== 'note')
    .map((m) => ({ id: m.id, side: m.who === 'lead' ? 'out' : 'in', text: m.text, time: (m.t || '').split(' ').pop(), kind: m.kind }));

const TRIES = [
  { text: FIRST_TEXT, label: 'הודעה ראשונה מהקישור', tag: 'לבד' },
  { text: 'מה שעות הפעילות?', label: 'מה שעות הפעילות?', tag: 'לבד' },
  { text: 'אם ארצה לבטל, מה קורה?', label: 'אם ארצה לבטל, מה קורה?', tag: 'לבד' },
  { text: 'זה מתאים גם לבן שלי, בן 16?', label: 'זה מתאים גם לבן שלי, בן 16?', tag: 'לאישור' },
  { text: 'יש הנחה?', label: 'יש הנחה?', tag: 'לאישור' },
];

// The one thing here that is not the product: the lead's phone, to play the lead with.
function LeadSim({ state, act, caseInfo, onCases, phoneLayout }) {
  const lead = state.leads.find((l) => l.id === state.sel) || state.leads[0];
  const tries = caseInfo?.hint ? [{ text: caseInfo.hint, label: `לכתוב: ${caseInfo.hint}`, tag: 'ניתוב' }] : TRIES;
  return html`<div class="flex flex-col gap-3">
    ${caseInfo &&
    html`<div class="rounded-xl bg-brand-100 px-3 py-2 text-[13px] leading-snug">
      <b class="flex items-center gap-1.5"><${Icon} name=${caseInfo.icon} size=${15} class="text-brand-600" />${caseInfo.label}</b>${caseInfo.sub}
    </div>`}
    <${Phone}
      class=${phoneLayout ? 'mx-auto h-[420px] w-full max-w-[340px]' : 'h-[380px] w-full'}
      name="FlowBiz"
      sub="חשבון עסקי"
      avatar=${html`<${FlowBizAvatar} />`}
      msgs=${toPhone(lead)}
      typing=${lead.typing}
      onSend=${(t) => act.leadSays(lead.id, t)}
      placeholder="לכתוב כמו הליד"
    />
    <div>
      <p class="mb-1.5 text-[13px] font-bold">מה הליד כותב?</p>
      <div class="flex flex-col gap-1.5">
        ${tries.map(
          (x) => html`<button key=${x.text} type="button" class="flex items-center gap-2 rounded-lg border border-line bg-white px-2.5 py-1.5 text-start text-[13px] font-semibold hover:border-brand-300 cursor-pointer" onClick=${() => act.leadSays(lead.id, x.text)}>
            <span class="min-w-0 flex-1 truncate">${x.label}</span><span class="shrink-0 text-[11px] font-bold text-brand-600">${x.tag}</span>
          </button>`,
        )}
      </div>
    </div>
    <div class="grid grid-cols-2 gap-2">
      <button type="button" class="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border-[1.5px] border-brand-300 bg-white text-[13px] font-bold text-brand-600 cursor-pointer" onClick=${act.newLead}><${Icon} name="user-plus" size=${16} />ליד חדש נכנס</button>
      <button type="button" class="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border-[1.5px] border-brand-300 bg-white text-[13px] font-bold text-brand-600 cursor-pointer" onClick=${onCases}><${Icon} name="split" size=${16} />מקרי קצה</button>
    </div>
    <div>
      <p class="mb-1 flex items-center gap-1.5 text-[13px] font-bold"><${Icon} name="git-commit-horizontal" size=${15} class="text-brand-600" />מה קרה מאחורי הקלעים</p>
      <ol class="text-[12.5px] leading-snug text-ink">
        ${state.log.length === 0 && html`<li class="text-muted">אחרי ההודעה הבאה יופיע כאן מה המערכת עשתה איתה.</li>`}
        ${state.log.map((l, i) => html`<li key=${i} class="rise border-s-2 border-brand-300 py-0.5 ps-2">${l}</li>`)}
      </ol>
    </div>
  </div>`;
}

const SIM_LABEL = 'כלי של המוק-אפ, לא חלק מהמוצר';

export function LiveView({ state, act, phoneLayout, caseInfo, onCases, onHome }) {
  const [sim, setSim] = useState(false);
  const panel = html`<div class="fb-panel h-full min-h-0 overflow-hidden !p-0"><${SystemPane} state=${state} act=${act} phoneLayout=${phoneLayout} /></div>`;
  const simProps = { state, act, caseInfo, onCases, phoneLayout };
  return html`<div class="mx-auto flex h-full max-w-[1320px] flex-col px-3 py-3 md:px-6 md:py-4">
    <div class="mb-3 flex shrink-0 items-center gap-2">
      ${!state.after14 && html`<button type="button" aria-label="לדף הבית" class="rounded-lg p-1.5 text-muted hover:bg-brand-50 cursor-pointer" onClick=${onHome}><${Icon} name="arrow-right" size=${19} /></button>`}
      <h1 class="fb-h2 !text-[24px]">${state.after14 ? 'לידים' : 'הלידים שלי'}</h1>
      ${state.ended && html`<${Tag} tone="fix">הבוט מושהה, המנוי הסתיים<//>`}
    </div>
    ${phoneLayout
      ? html`<div class="min-h-0 flex-1">${panel}</div>
          <button type="button" class="fixed bottom-4 start-4 z-30 inline-flex h-11 items-center gap-2 rounded-full border-2 border-dashed border-brand-300 bg-white px-4 text-[14px] font-bold text-brand-600 shadow-lg cursor-pointer" onClick=${() => setSim(true)}><${Icon} name="smartphone" size=${17} />לשחק את הליד</button>
          ${sim && html`<${Sheet} title="לשחק את הליד" full onClose=${() => setSim(false)}><p class="mb-2 text-[12.5px] font-semibold text-muted">${SIM_LABEL}</p><${LeadSim} ...${simProps} /><//>`}`
      : html`<div class="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_316px] gap-5">
          ${panel}
          <aside class="thin-scroll min-h-0 overflow-y-auto rounded-2xl border-2 border-dashed border-brand-300 bg-brand-50/60 p-3" aria-label=${SIM_LABEL}>
            <p class="mb-2 text-[12.5px] font-bold text-muted">${SIM_LABEL}: הטלפון של הליד</p>
            <${LeadSim} ...${simProps} />
          </aside>
        </div>`}
  </div>`;
}
