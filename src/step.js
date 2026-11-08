// Step 13, "שירות לקוחות אוטומטי" (chapter 5): opening, the link, the hours, the first
// answer, the automatic answers, a real test, and the finish. The forms are shared with
// the settings page, so everything stays editable after the step.
import { html, useState, useRef, useEffect, Icon, PencilCheck, PencilLine, cx, confetti, money } from './lib.js';
import { Button, Note, StepHeading, SharkAvatar } from './components.js';
import { Chips, Field, inputCls, Tag } from './ui.js';
import { Phone, QrBox, FlowBizAvatar } from './phone.js';
import { USER, SHORT_LINK, FIRST_TEXT, LINK_PLACES, SOURCES, DAYS, REPLY_TIMES, TONES, PARTS, SUGGESTED, openingTexts, g } from './data.js';
import { decide, draftFor, fillName, hoursText, openingOf, answerText, definedCount } from './engine.js';
import { nextId, NOW } from './state.js';

export function Toggle({ on, onChange, label }) {
  return html`<button
    type="button"
    role="switch"
    aria-checked=${on}
    aria-label=${label}
    onClick=${() => onChange(!on)}
    class=${cx('relative h-6 w-11 shrink-0 rounded-full transition-colors cursor-pointer', on ? 'bg-brand-600' : 'bg-[#cfd5e0]')}
  ><span class=${cx('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all', on ? 'start-[22px]' : 'start-0.5')}></span></button>`;
}

const FromTag = ({ children }) => html`<${Tag}>${children}<//>`;
const previewName = 'נועה';

// ---------- opening (first entry only) ----------

export function Opening({ config }) {
  const msgs = [
    { id: 1, side: 'out', text: FIRST_TEXT, time: '21:38' },
    { id: 2, side: 'in', text: fillName(openingOf(config, false), previewName, config), time: '21:38' },
    { id: 3, side: 'out', text: 'אם ארצה לבטל, מה קורה?', time: '21:39' },
    { id: 4, side: 'in', text: 'אפשר לבטל או להזיז פגישה עד 24 שעות לפני מועדה, בלי תשלום.', time: '21:39' },
  ];
  return html`<div class="mx-auto grid max-w-[1120px] items-center gap-8 px-4 py-6 md:grid-cols-[1.15fr_0.85fr] md:gap-12 md:px-8 md:py-8">
    <div>
      <${StepHeading} n="13" eyebrow="שלב 13 · מגדילים מכירות" title=${['כל ליד מקבל תשובה ', 'מיד', '']} />
      <p class="mb-6 max-w-[48ch] text-[18px] text-ink">הבוט עונה בשם העסק בוואטסאפ: מענה ראשוני תוך שניות, ותשובות שירות שקבעת מראש. על כל שאלה אחרת הליד מקבל מיד תשובת העברה, והתשובה עצמה מחכה לאישור שלך, עם הצעה מוכנה מהכריש.</p>
      <div class="flex flex-col gap-2 border-t border-line pt-4 text-[15px]">
        <p class="flex flex-wrap items-center gap-x-2 gap-y-1"><${Icon} name="list" size=${17} class="text-brand-600" /><b>החלקים:</b> ${PARTS.join(' · ')}</p>
        <p class="flex items-center gap-2"><${Icon} name="clock" size=${17} class="text-brand-600" /><b>זמן:</b> כ-20 דקות</p>
        <p class="flex items-center gap-2"><${Icon} name="file-check-2" size=${17} class="text-brand-600" /><b>התוצר:</b> הבוט של העסק, פעיל ובדוק</p>
      </div>
    </div>
    <div class="relative flex justify-center pb-6">
      <${Phone} class="h-[420px] w-[280px] rotate-[1.2deg]" name="FlowBiz" sub="חשבון עסקי" avatar=${html`<${FlowBizAvatar} />`} msgs=${msgs} />
      <span class="hand absolute bottom-0 left-2 rotate-[-4deg] whitespace-nowrap text-[26px]">${g('גם כשאתה באמצע טיפול', 'גם כשאת באמצע טיפול')}</span>
    </div>
  </div>`;
}

// ---------- part 1: the link ----------

export function LinkPanel({ notify, compact }) {
  const [src, setSrc] = useState('wa');
  const path = SOURCES.find((s) => s.id === src).path;
  const url = `${USER.slug}.flowbiz.co.il/${path}`;
  return html`<section class="fb-panel !p-4 md:!p-5">
    <div class="flex items-start gap-4">
      <div class="min-w-0 flex-1">
        <h2 class="fb-h3 mb-2">הקישור לוואטסאפ של העסק</h2>
        <div class="mb-3 flex items-center gap-2 rounded-xl border-[1.5px] border-line bg-white p-1 ps-3">
          <b class="min-w-0 flex-1 truncate text-[16px] font-bold" dir="ltr">${url}</b>
          <${Button} variant="mini" onClick=${() => notify('הקישור הועתק', 'copy')}><${Icon} name="copy" size=${15} />העתקה<//>
        </div>
        <p class="mb-1 text-[14px] font-bold">קישור לפי מקור</p>
        <${Chips} small options=${SOURCES} value=${src} onChange=${setSrc} />
        <p class="mt-2 text-[13px] text-muted">כל מקור נרשם על הליד, אז רואים מאיפה הוא הגיע.</p>
      </div>
      ${!compact && html`<div class="max-sm:hidden"><${QrBox} size=${112} /></div>`}
    </div>
  </section>`;
}

// Where the link goes. Nothing changes by itself: only the places the user marks.
export function PlacesForm({ config, setCfg, inSettings }) {
  const on = config.places || [];
  const flip = (id) => setCfg({ places: on.includes(id) ? on.filter((x) => x !== id) : [...on, id] });
  const all = on.length === LINK_PLACES.length;
  return html`<section class="fb-panel !p-4 md:!p-5">
    <div class="mb-1 flex flex-wrap items-center justify-between gap-2">
      <h2 class="fb-h3">איפה להוסיף את הקישור?</h2>
      <button type="button" class="text-[14px] font-bold text-brand-600 underline underline-offset-2 cursor-pointer" onClick=${() => setCfg({ places: all ? [] : LINK_PLACES.map((p) => p.id) })}>${all ? 'לבטל הכול' : 'לסמן הכול'}</button>
    </div>
    <p class="mb-3 text-[14px] text-muted">${inSettings ? 'רק המקומות המסומנים משתנים. מה שלא מסומן נשאר כמו שהוא.' : 'רק המקומות שסימנת משתנים, בסיום השלב. אפשר לשנות אחר כך בהגדרות.'}</p>
    <ul class="grid gap-2 sm:grid-cols-2">
      ${LINK_PLACES.map((p) => {
        const checked = on.includes(p.id);
        return html`<li key=${p.id}>
          <label class=${cx('flex h-full cursor-pointer items-start gap-2.5 rounded-xl border-[1.5px] bg-white p-2.5', checked ? 'border-brand-600 bg-brand-50' : 'border-line hover:border-brand-300')}>
            <input type="checkbox" class="mt-0.5 h-5 w-5 shrink-0 accent-brand-600" checked=${checked} onChange=${() => flip(p.id)} />
            <span class="mt-0.5 text-brand-600"><${Icon} name=${p.icon} size=${18} /></span>
            <span class="min-w-0"><b class="block text-[15px]">${p.label}</b><small class="block text-[13px] leading-snug text-muted">${p.sub}</small></span>
          </label>
        </li>`;
      })}
    </ul>
  </section>`;
}

export function LinkScreen({ notify, config, setCfg }) {
  const msgs = [{ id: 1, side: 'out', text: FIRST_TEXT, time: NOW }];
  return html`<div class="mx-auto max-w-[1120px] px-4 py-5 md:px-8 md:py-6">
    <${StepHeading} n="1" eyebrow="חלק 1 מתוך 5 · הקישור שלך" title=${['קישור אחד, וכל פנייה ', 'מגיעה אליך', '']} sub="לידים כותבים למספר של FlowBiz, והקישור הזה הוא מה שמחבר אותם לעסק שלך." />
    <div class="grid gap-5 md:grid-cols-[1.25fr_0.75fr]">
      <div class="flex min-w-0 flex-col gap-4">
        <${LinkPanel} notify=${notify} />
        <${PlacesForm} config=${config} setCfg=${setCfg} />
      </div>
      <div class="flex flex-col items-center gap-2 max-md:hidden">
        <${Phone} class="h-[300px] w-[260px]" name="FlowBiz" sub="חשבון עסקי" avatar=${html`<${FlowBizAvatar} />`} msgs=${msgs} />
        <p class="max-w-[260px] text-center text-[13px] text-muted">ההודעה מוכנה ללחיצה אחת. הקוד בסוף שלה מחבר את הליד לעסק שלך.</p>
      </div>
    </div>
  </div>`;
}

// ---------- part 2: the hours ----------

export function HoursForm({ config, setCfg, prefilled }) {
  const h = config.hours;
  const setH = (patch) => setCfg({ hours: { ...h, ...patch } });
  return html`<section class="fb-panel !p-4 md:!p-5">
    <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
      <h2 class="fb-h3">ימים ושעות</h2>
      ${prefilled && html`<span class="fb-filled-by"><${Icon} name="pencil" size=${14} />מילאנו לפי "אני והעסק"</span>`}
    </div>
    <div class="mb-4 flex flex-wrap gap-2" role="group" aria-label="ימי פעילות">
      ${DAYS.map((d) => {
        const on = h.days.includes(d.id);
        return html`<button
          key=${d.id}
          type="button"
          aria-pressed=${on}
          onClick=${() => setH({ days: on ? h.days.filter((x) => x !== d.id) : [...h.days, d.id] })}
          class=${cx('h-11 w-11 rounded-xl border-[1.5px] font-bold cursor-pointer', on ? 'border-brand-600 bg-brand-100 text-brand-600' : 'border-line bg-white text-muted hover:border-brand-300')}
        >${d.label}</button>`;
      })}
    </div>
    <div class="mb-4 grid max-w-[320px] grid-cols-2 gap-3">
      <${Field} label="משעה" class="!mb-0"><input type="time" class=${inputCls} dir="ltr" value=${h.from} onInput=${(e) => setH({ from: e.target.value })} /><//>
      <${Field} label="עד שעה" class="!mb-0"><input type="time" class=${inputCls} dir="ltr" value=${h.to} onInput=${(e) => setH({ to: e.target.value })} /><//>
    </div>
    <p class="mb-1.5 text-[14px] font-bold">תוך כמה זמן חוזרים ללקוח?</p>
    <${Chips} options=${REPLY_TIMES} value=${config.replyTime} onChange=${(v) => setCfg({ replyTime: v })} />
  </section>`;
}

export function HoursScreen({ config, setCfg }) {
  return html`<div class="mx-auto max-w-[1120px] px-4 py-5 md:px-8 md:py-6">
    <${StepHeading} n="2" eyebrow="חלק 2 מתוך 5 · שעות פעילות" title=${['מתי ', 'העסק פתוח', '?']} sub="לפי השעות האלה הבוט בוחר איזה מענה ראשוני לשלוח." />
    <div class="grid items-start gap-6 md:grid-cols-[1.25fr_0.75fr]">
      <${HoursForm} config=${config} setCfg=${setCfg} prefilled />
      <${Note} tone="white" tilt=${-1} class="mt-2">
        <span class="fb-note-kicker">כך זה ייכתב ללידים</span>
        <p class="text-[16px]">${answerText({ auto: 'hours' }, config)}</p>
      <//>
    </div>
  </div>`;
}

// ---------- part 3: the automatic first answer ----------

export function MessagesForm({ config, setCfg }) {
  const base = openingTexts(config.tone, config.replyTime);
  const c = config.custom || {};
  const edit = (k, v) => setCfg({ custom: { ...c, [k]: v } });
  const row = (k, title, icon) => html`<div class="mb-3 last:mb-0">
    <span class="mb-1 flex items-center gap-1.5 text-[14px] font-bold"><${Icon} name=${icon} size=${16} class="text-brand-600" />${title}</span>
    <textarea aria-label=${title} rows="3" class="w-full rounded-xl border-[1.5px] border-line bg-white p-3 text-[15px] leading-snug text-ink outline-none focus:border-brand-600 focus:ring-4 focus:ring-brand-100" value=${c[k] ?? base[k]} onInput=${(e) => edit(k, e.target.value)}></textarea>
  </div>`;
  return html`<section class="fb-panel !p-4 md:!p-5">
    <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
      <h2 class="fb-h3">הטון</h2>
      <${Chips} small options=${TONES} value=${config.tone} onChange=${(v) => setCfg({ tone: v, custom: {} })} />
    </div>
    ${row('open', 'בשעות הפעילות', 'sun')}
    ${row('closed', 'מחוץ לשעות הפעילות', 'moon')}
    <p class="text-[12px] text-muted">{שם} הוא השם של הליד בוואטסאפ, כשהוא בעברית. {שעות} נלקח מהשעות שקבעת.</p>
  </section>`;
}

export function MessagesScreen({ config, setCfg }) {
  const [open, setOpen] = useState(true);
  const msgs = [
    { id: 1, side: 'out', text: FIRST_TEXT, time: open ? '10:12' : '21:38' },
    { id: 2, side: 'in', text: fillName(openingOf(config, open), previewName, config), time: open ? '10:12' : '21:38' },
  ];
  return html`<div class="mx-auto max-w-[1120px] px-4 py-5 md:px-8 md:py-6">
    <${StepHeading} n="3" eyebrow="חלק 3 מתוך 5 · מענה ראשוני" title=${['מה כל ליד מקבל ', 'תוך שניות', '']} sub="ההודעה הזו יוצאת לבד, בלי אישור, לכל ליד חדש. זה הטקסט שלך ואפשר לשנות אותו." />
    <div class="grid items-start gap-6 md:grid-cols-[1.25fr_0.75fr]">
      <${MessagesForm} config=${config} setCfg=${setCfg} />
      <div class="flex flex-col items-center gap-2 max-md:hidden">
        <${Chips} small options=${[{ id: 'o', label: 'בשעות הפעילות' }, { id: 'c', label: 'מחוץ לשעות' }]} value=${open ? 'o' : 'c'} onChange=${(v) => setOpen(v === 'o')} />
        <${Phone} class="h-[320px] w-[260px]" name="FlowBiz" sub="חשבון עסקי" avatar=${html`<${FlowBizAvatar} />`} msgs=${msgs} />
      </div>
    </div>
  </div>`;
}

// ---------- part 4: the automatic answers ----------

function AnswerRow({ ans, config, onChange, onRemove }) {
  const computed = ans.auto === 'hours';
  return html`<li class=${cx('rounded-xl border-[1.5px] bg-white p-3', ans.on ? 'border-line' : 'border-dashed border-line opacity-80')}>
    <div class="flex items-center gap-2.5">
      <${Toggle} on=${ans.on} label=${`תשובה אוטומטית: ${ans.q}`} onChange=${(on) => onChange({ on })} />
      <b class="min-w-0 flex-1 text-[15px]">${ans.q}</b>
      <span class="max-sm:hidden"><${FromTag}>${ans.fromStep}<//></span>
      ${ans.own && html`<button type="button" aria-label="מחיקת התשובה" class="rounded-lg p-1 text-muted hover:bg-brand-50 cursor-pointer" onClick=${onRemove}><${Icon} name="trash-2" size=${16} /></button>`}
    </div>
    ${computed || ans.locked
      ? html`<p class="mt-1.5 text-[14px] leading-snug text-muted">${answerText(ans, config)}${ans.locked ? ' (משתנה בשלב 8)' : ''}</p>`
      : html`<textarea
          rows="3"
          aria-label=${`התשובה לשאלה ${ans.q}`}
          placeholder=${ans.ph || 'התשובה שתצא ללידים'}
          class="mt-1.5 w-full rounded-lg border border-transparent bg-canvas px-2.5 py-1.5 text-[14px] leading-snug text-ink outline-none focus:border-brand-600 focus:bg-white"
          value=${ans.a}
          onInput=${(e) => onChange({ a: e.target.value })}
        ></textarea>`}
  </li>`;
}

export function AnswersForm({ config, setCfg }) {
  const [q, setQ] = useState('');
  const [a, setA] = useState('');
  const list = config.answers;
  const hold = list.find((x) => x.auto === 'hold');
  const defined = list.filter((x) => x.auto !== 'hold');
  const patch = (id, p) => setCfg({ answers: list.map((x) => (x.id === id ? { ...x, ...p } : x)) });
  const add = (o) => setCfg({ answers: [...list, { own: true, on: true, ...o }] });
  const words = (s) => s.replace(/[?.,!]/g, ' ').split(/\s+/).filter((w) => w.length > 2);
  const offers = SUGGESTED.filter((s) => !list.some((x) => x.id === s.id || x.q === s.q));
  return html`<div class="grid items-start gap-5 md:grid-cols-[1.4fr_0.6fr]">
    <div class="flex min-w-0 flex-col gap-4">
      <ul class="flex flex-col gap-2.5">
        ${defined.map((x) => html`<${AnswerRow} key=${x.id} ans=${x} config=${config} onChange=${(p) => patch(x.id, p)} onRemove=${() => setCfg({ answers: list.filter((y) => y.id !== x.id) })} />`)}
      </ul>
      ${hold &&
      html`<section>
        <h3 class="mb-1 text-[16px] font-bold">כשאין תשובה מוגדרת</h3>
        <p class="mb-2 text-[13.5px] text-muted">התשובה הזו יוצאת לבד מיד, פעם אחת לכל שאלה פתוחה. ההצעה של הכריש מחכה לאישור שלך כרגיל.</p>
        <ul><${AnswerRow} ans=${{ ...hold, q: 'תשובת העברה' }} config=${config} onChange=${(p) => patch(hold.id, p)} /></ul>
      </section>`}
    </div>
    <div class="flex min-w-0 flex-col gap-3">
      <section class="fb-panel !p-3.5">
        <h2 class="fb-h3 mb-2">תשובה נוספת</h2>
        <input class=${inputCls} aria-label="השאלה" placeholder="השאלה" value=${q} onInput=${(e) => setQ(e.target.value)} />
        <textarea rows="2" aria-label="התשובה" placeholder="התשובה" class="mt-2 w-full rounded-xl border-[1.5px] border-line bg-white p-2.5 text-[15px] text-ink outline-none focus:border-brand-600" value=${a} onInput=${(e) => setA(e.target.value)}></textarea>
        <${Button} variant="mini" class="mt-1" disabled=${!q.trim() || !a.trim()} onClick=${() => (add({ id: `own-${Date.now()}`, q: q.trim(), a: a.trim(), fromStep: 'כתיבה שלך', keys: words(q) }), setQ(''), setA(''))}><${Icon} name="plus" size=${15} />הוספה<//>
      </section>
      ${offers.length > 0 &&
      html`<section class="rounded-2xl bg-brand-50 p-3.5">
        <p class="mb-2 flex items-center gap-2 text-[14px] font-bold"><${SharkAvatar} size=${30} />הכריש מציע להוסיף</p>
        <div class="flex flex-col gap-1.5">
          ${offers.map((s) => html`<button key=${s.id} type="button" class="flex items-center gap-1.5 text-start text-[14px] font-semibold text-brand-600 cursor-pointer hover:underline" onClick=${() => add(s)}><${Icon} name="plus" size=${14} />${s.q}</button>`)}
        </div>
      </section>`}
    </div>
  </div>`;
}

export function AnswersScreen({ config, setCfg }) {
  const n = definedCount(config);
  return html`<div class="mx-auto max-w-[1120px] px-4 py-5 md:px-8 md:py-6">
    <${StepHeading} n="4" eyebrow="חלק 4 מתוך 5 · תשובות אוטומטיות" title=${['מה יוצא ', 'לבד', '?']} sub=${`כל מה שמוגדר כאן הבוט עונה לבד, גם כשהשאלה מנוסחת אחרת. כרגע ${n} תשובות פעילות. על כל שאלה אחרת הליד מקבל מיד תשובת העברה, והיא מגיעה אליך עם הצעה מהכריש.`} />
    <${AnswersForm} config=${config} setCfg=${setCfg} />
  </div>`;
}

// ---------- part 5: a real test from the user's phone ----------

const TEST_TRIES = [
  { id: 'first', text: FIRST_TEXT, label: 'הודעה ראשונה מהקישור' },
  { id: 'hours', text: 'מה שעות הפעילות?', label: 'שאלת שירות' },
  { id: 'other', text: 'זה מתאים גם לבן שלי, בן 16?', label: 'שאלה בלי תשובה מוגדרת' },
];

export function TestScreen({ config, onPassed, phoneLayout }) {
  const [msgs, setMsgs] = useState([]);
  const [typing, setTyping] = useState(false);
  const [seen, setSeen] = useState({});
  const lead = useRef({ msgs: [], name: USER.firstName });
  const t = useRef();
  useEffect(() => () => clearTimeout(t.current), []);
  const push = (m) => setMsgs((l) => [...l, { id: nextId(), time: NOW, ...m }]);
  const send = (text) => {
    const d = decide({ config, isOpen: true, lead: lead.current, text });
    lead.current = { ...lead.current, msgs: [...lead.current.msgs, { who: 'lead' }] };
    push({ side: 'out', text });
    setTyping(true);
    clearTimeout(t.current);
    t.current = setTimeout(() => {
      setTyping(false);
      if (d.opening) push({ side: 'in', text: fillName(openingOf(config, true), USER.firstName, config) });
      if (d.reply) push({ side: 'in', text: d.reply });
      setSeen((s) => ({ ...s, opening: s.opening || d.opening, auto: s.auto || d.action === 'auto', draft: d.action === 'draft' ? draftFor(text).text : s.draft }));
      if (d.opening) onPassed();
    }, 900);
  };
  const checks = [
    ['opening', 'המענה הראשוני הגיע'],
    ['auto', 'תשובה אוטומטית יצאה לבד'],
    ['draft', 'שאלה אחרת: תשובת העברה, והצעה לאישור'],
  ];
  return html`<div class="mx-auto max-w-[1120px] px-4 py-5 md:px-8 md:py-6">
    <${StepHeading} n="5" eyebrow="חלק 5 מתוך 5 · בדיקה" title=${['בודקים ', 'מהטלפון שלך', '']} sub="כותבים לבוט כמו ליד, ורואים מה קורה. שיחת בדיקה לא נכנסת ללידים." />
    <div class="grid items-start gap-6 md:grid-cols-[300px_1fr] md:gap-10">
      <${Phone} class="mx-auto h-[400px] w-full max-w-[300px]" name="FlowBiz" sub="שיחת בדיקה" avatar=${html`<${FlowBizAvatar} />`} msgs=${msgs} typing=${typing} onSend=${send} placeholder="לכתוב כמו ליד" />
      <div class="min-w-0">
        ${!phoneLayout &&
        html`<div class="mb-4 flex items-center gap-4">
          <${QrBox} size=${96} />
          <p class="text-[15px]">בפועל סורקים את הקוד ושולחים מהטלפון. במוקאפ אפשר לכתוב בטלפון שכאן, או ללחוץ על אחת ההודעות:</p>
        </div>`}
        <div class="mb-4 flex flex-col gap-2">
          ${TEST_TRIES.map((x) => html`<button key=${x.id} type="button" class="lp-option !py-2" onClick=${() => send(x.text)}><span class="min-w-0 flex-1"><b class="block text-[15px]">${x.label}</b><small class="block truncate text-[13px] text-muted">${x.text}</small></span><${Icon} name="send" size=${16} class="text-brand-600" /></button>`)}
        </div>
        <ul class="flex flex-col gap-1.5">
          ${checks.map(
            ([k, label]) => html`<li key=${k} class=${cx('flex items-center gap-2 text-[15px]', seen[k] ? 'font-bold' : 'text-muted')}>
              ${seen[k] ? html`<${PencilCheck} size=${20} color="#0038b8" />` : html`<span class="h-5 w-5 rounded-full border-2 border-dashed border-line"></span>`}${label}
            </li>`,
          )}
        </ul>
        ${seen.draft &&
        html`<div class="rise mt-3 rounded-xl bg-brand-50 p-3 text-[14px] leading-snug">
          <p class="mb-1 flex items-center gap-2 font-bold"><${SharkAvatar} size=${28} />זה מה שיחכה לאישור שלך</p>
          ${seen.draft}
        </div>`}
      </div>
    </div>
  </div>`;
}

// ---------- the finish: step 13 closes chapter 5, so it ends in gold with a new rank ----------

export function Done({ config }) {
  useEffect(() => {
    const t = setTimeout(() => confetti('chapter'), 200);
    return () => clearTimeout(t);
  }, []);
  const n = definedCount(config);
  const places = LINK_PLACES.filter((p) => (config.places || []).includes(p.id));
  const rows = [
    ['link', 'הקישור', html`<b dir="ltr">${SHORT_LINK}</b>`],
    ['map-pin', 'נכנס ל', places.length ? places.map((p) => p.label).join(', ') : 'לא סימנת מקומות. אפשר בהגדרות'],
    ['clock', 'שעות פעילות', hoursText(config.hours)],
    ['zap', 'יוצא לבד', `מענה ראשוני ועוד ${n} תשובות`],
    ['shield-check', 'באישור שלך', 'כל השאר, אחרי תשובת העברה'],
  ];
  return html`<div class="mx-auto grid max-w-[1000px] items-center gap-8 px-4 py-6 md:grid-cols-[1.2fr_0.8fr] md:px-8 md:py-10">
    <div>
      <p class="fb-eyebrow mb-1">סיימת את פרק 5 · מגדילים מכירות</p>
      <h1 class="fb-h1 mb-4 text-[28px] md:text-[36px]">הבוט של ${USER.business} <span class="marker">פעיל</span></h1>
      <section class="fb-panel !p-4 md:!p-5">
        <ul class="flex flex-col divide-y divide-line">
          ${rows.map(([icon, k, v]) => html`<li key=${k} class="flex items-center gap-3 py-2"><span class="text-brand-600"><${Icon} name=${icon} size=${18} /></span><span class="w-[92px] shrink-0 text-[14px] font-bold">${k}</span><span class="min-w-0 truncate text-[15px]">${v}</span></li>`)}
        </ul>
      </section>
      <p class="mt-3 text-[15px]">לידים חדשים מופיעים ב"הלידים שלי" בדף הבית, עם השיחה שלהם.</p>
    </div>
    <div class="flex justify-center pt-8">
      <${Note} tone="gold" tilt=${-2} class="fb-badge-note !pt-10">
        <span class="fb-note-kicker">דרגה חדשה</span>
        <b class="font-display text-[26px]">${g('הבר סמכא', 'בת סמכא')}</b>
        <span class="text-[14px]">חסכת בשלב הזה</span>
        <span class="relative font-display text-[36px] font-black text-money">${money(1600)}<${PencilLine} color="#12805c" class="absolute inset-x-0 -bottom-1 h-2 w-full" /></span>
      <//>
    </div>
  </div>`;
}
