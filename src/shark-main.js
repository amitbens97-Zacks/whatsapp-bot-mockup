// A separate mockup: the shark on the user's own WhatsApp. It is not part of step 13.
// It opens on the window that shows right after the payment; the rest is reached from
// there, or from the developer notes (Shift+D), which also go back to before the payment.
//   1. The home page before the payment: the shark's card is locked.
//   2. The paywall (as in the system today) after step 2.
//   3. Right after the payment: a celebration window over the home page, to add the
//      shark to the user's personal WhatsApp. "אחר כך" leaves the card open on home.
//   4. A sample conversation, and the settings to disconnect.
// Link params: ?view=home|pay|chat|settings, ?paid=1, ?welcome=1, ?user=f, ?embed=1.
// Shift+D opens the developer notes.
import { html, render, useState, useEffect, useRef, Icon, cx } from './lib.js';
import { Logo, PartnerBubble, Button, Toast } from './components.js';
import { USER, GENDER, g, setDemoGender } from './data.js';
import { SharkCard, Paywall, SharkWelcome, SharkChat, SharkSettings } from './shark.js';
import { EMBED, IS_PHONE, readView, saveView, writeHandoff, takeHandoff, applyPhoneViewport, ViewToggle, PhonePreview } from './viewswitch.js';

const params = new URLSearchParams(location.search);
const VIEWS = ['home', 'pay', 'chat', 'settings'];
const STORE = `flowbiz-shark-state-v2-${GENDER}`;

const fresh = () => ({ paid: false, connected: false, welcome: false, msgs: [] });
// Where the mockup opens: the payment just went through, and the window is up.
const afterPay = () => ({ ...fresh(), paid: true, welcome: true });
function load() {
  const s = (() => {
    try {
      return JSON.parse(sessionStorage.getItem(STORE)) || afterPay();
    } catch {
      return afterPay();
    }
  })();
  if (params.get('paid') === '1') s.paid = true;
  if (params.get('welcome') === '1') Object.assign(s, { paid: true, welcome: true, connected: false });
  return s;
}

const BUBBLE = {
  before: 'שלבים 1 ו-2 מאחוריך. מכאן ממשיכים לסל המוצרים.',
  after: 'הכול פתוח. ואם משהו נתקע, אפשר לכתוב לי גם בוואטסאפ.',
};

const JUMPS = [
  ['home-before', 'דף הבית לפני התשלום'],
  ['pay', 'מסך התשלום'],
  ['welcome', 'החלונית אחרי התשלום'],
  ['home-after', 'דף הבית אחרי ההוספה'],
  ['chat', 'דוגמת שיחה'],
  ['settings', 'הגדרות: ניתוק'],
];

const NOTES = [
  {
    title: 'מתי זה נפתח',
    items: [
      'עד התשלום הכרטיס בדף הבית נעול, עם "נפתח אחרי התשלום".',
      'מיד כשהתשלום עובר, החלונית נפתחת מעל דף הבית, פעם אחת, עם קונפטי. לא מסך נפרד ולא חלק משלב.',
      '"אחר כך" סוגר אותה. הכרטיס בדף הבית ובהגדרות נשאר פתוח להוספה בכל זמן.',
      'מסך התשלום עצמו הוא המסך הקיים במערכת. במוק-אפ הוא רק מדמה תשלום שעבר.',
    ],
  },
  {
    title: 'החיבור',
    items: [
      'מספר וואטסאפ של FlowBiz לכריש, נפרד מהמספר של בוט הלידים.',
      'במחשב: קוד QR. בטלפון: כפתור שפותח את וואטסאפ. בשניהם הודעה מוכנה עם קוד אישי (FB-7K2Q) שמחבר את המספר של המשתמש לחשבון שלו.',
      'הכריש עונה רק למספר שחובר. הודעה ממספר אחר בלי קוד: הסבר קצר איך מתחברים מתוך המערכת.',
      'ניתוק בהגדרות. מנוי שהסתיים: הכריש עונה שהמנוי הסתיים, עם קישור לחידוש.',
    ],
  },
  {
    title: 'מה הוא עושה',
    items: [
      'אותו כריש כמו במערכת, עם אותם נתונים: לידים, כספים, ההצעה, המסע.',
      'רק עונה. לא שולח ביוזמתו, אין תבניות, ולא מדבר עם לידים.',
      'שאלה מחוץ לנושאי העסק: עונה שהוא כאן בשביל העסק. זה גם מה שמרחיק אותו מסעיף 4.7 בתנאי Meta (AI כשירות העיקרי).',
    ],
  },
];

function DevPanel({ open, onClose, onJump, onReset }) {
  return html`<aside class=${cx('fixed inset-y-0 end-0 z-[70] flex w-full max-w-sm flex-col border-s border-slate-200 bg-white shadow-2xl transition-transform duration-200', open ? 'translate-x-0' : '-translate-x-full pointer-events-none invisible')} aria-hidden=${!open}>
    <div class="flex items-center justify-between border-b border-slate-200 px-4 py-3">
      <h2 class="flex items-center gap-2 text-[16px] font-bold text-slate-900"><${Icon} name="code-xml" size=${17} /> הערות למפתחים</h2>
      <button type="button" onClick=${onClose} aria-label="סגירה" class="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 cursor-pointer"><${Icon} name="x" size=${18} /></button>
    </div>
    <div class="thin-scroll flex-1 overflow-y-auto p-4 text-[14px] leading-relaxed text-slate-700">
      <section class="mb-4 rounded-xl border border-dashed border-brand-300 bg-brand-50/60 p-3">
        <h3 class="mb-2 font-bold text-brand-900">המשתמש לדוגמה</h3>
        <div class="grid grid-cols-2 gap-1.5" role="radiogroup" aria-label="המשתמש לדוגמה">
          ${[
            ['m', 'דניאל', 'פנייה בלשון זכר'],
            ['f', 'דניאלה', 'פנייה בלשון נקבה'],
          ].map(
            ([id, name, sub]) => html`<button key=${id} type="button" role="radio" aria-checked=${GENDER === id} onClick=${() => GENDER !== id && setDemoGender(id)} class=${cx('rounded-lg border px-3 py-1.5 text-start cursor-pointer', GENDER === id ? 'border-brand-600 bg-brand-100 text-brand-600' : 'border-brand-200 bg-white text-brand-900')}><b class="block text-[14px]">${name}</b><small class="text-[12px]">${sub}</small></button>`,
          )}
        </div>
        <button type="button" class="mt-2 text-[13px] font-bold text-brand-600 underline underline-offset-2 cursor-pointer" onClick=${onReset}>להתחיל מחדש, מהחלונית</button>
      </section>
      <section class="mb-5 rounded-xl border border-dashed border-brand-300 bg-brand-50/60 p-3">
        <h3 class="mb-2 font-bold text-brand-900">מעבר מהיר בין המסכים</h3>
        <div class="flex flex-col gap-1.5">
          ${JUMPS.map(([id, label]) => html`<button key=${id} type="button" onClick=${() => onJump(id)} class="rounded-lg border border-brand-200 bg-white px-2.5 py-1 text-start text-[13px] font-semibold hover:bg-brand-50 cursor-pointer">${label}</button>`)}
        </div>
      </section>
      ${NOTES.map(
        (n) => html`<section key=${n.title} class="mb-4 p-1">
          <h3 class="mb-1.5 font-bold text-slate-900">${n.title}</h3>
          <ul class="list-disc space-y-1 ps-4">${n.items.map((t) => html`<li>${t}</li>`)}</ul>
        </section>`,
      )}
    </div>
  </aside>`;
}

function App({ view: shellView, onViewChange }) {
  const handoff = useRef(takeHandoff()).current;
  const [view, setView] = useState(handoff?.view || (VIEWS.includes(params.get('view')) ? params.get('view') : 'home'));
  const [s, setS] = useState(handoff?.state || load());
  const [toast, setToast] = useState(null);
  const [dev, setDev] = useState(false);
  const [unread, setUnread] = useState(true);
  const timer = useRef();
  const phoneLayout = EMBED || window.innerWidth < 768;

  useEffect(() => {
    try {
      sessionStorage.setItem(STORE, JSON.stringify(s));
    } catch {}
    window.__flowbizSnapshot = () => ({ view, state: s });
  });
  useEffect(() => {
    const q = new URLSearchParams();
    q.set('view', view);
    if (EMBED) q.set('embed', '1');
    if (params.get('user')) q.set('user', params.get('user'));
    history.replaceState(null, '', `${location.pathname}?${q}`);
    setUnread(true);
  }, [view]);
  useEffect(() => {
    const k = (e) => {
      const typing = ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName);
      if (e.key === 'D' && e.shiftKey && !typing) setDev((d) => !d);
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, []);

  const notify = (text, icon = 'info') => {
    setToast({ id: Date.now(), text, icon });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 2800);
  };
  const patch = (p) => setS((x) => ({ ...x, ...p }));
  const go = (v) => setView(v);

  const jump = (id) => {
    setDev(false);
    if (id === 'home-before') return setS(fresh()), go('home');
    if (id === 'pay') return patch({ paid: false, welcome: false, connected: false }), go('pay');
    if (id === 'welcome') return patch({ paid: true, welcome: true, connected: false }), go('home');
    if (id === 'home-after') return patch({ paid: true, welcome: false, connected: true }), go('home');
    if (id === 'chat') return patch({ paid: true, welcome: false, connected: true }), go('chat');
    if (id === 'settings') return patch({ paid: true, welcome: false, connected: true }), go('settings');
  };

  const nav = [
    ['home', 'בית', 'house'],
    ['calendar', 'יומן', 'calendar-days'],
    ['tasks', 'משימות', 'list-checks'],
    ['finance', 'כספים', 'wallet'],
    ['files', 'קבצים', 'folder-open'],
    ['pages', 'הדפים שלי', 'layout-template'],
  ];
  const appBar = html`<header class="no-print z-20 flex h-16 shrink-0 items-center gap-3 border-b border-line bg-surface px-3 md:px-6">
    <button type="button" aria-label="דף הבית" class="cursor-pointer" onClick=${() => go('home')}><${Logo} size="sm" /></button>
    <nav class="ms-4 hidden items-center gap-1 lg:flex">
      ${nav.map(([id, label, icon]) => {
        const locked = !s.paid && id !== 'home';
        return html`<button key=${id} type="button" class=${cx('inline-flex h-10 items-center gap-1.5 rounded-xl px-3 text-[14px] font-bold cursor-pointer', view === id ? 'bg-brand-100 text-brand-600' : locked ? 'text-faint' : 'text-muted hover:bg-brand-50 hover:text-brand-600')} onClick=${() => (id === 'home' ? go('home') : notify(locked ? 'נפתח אחרי התשלום' : 'במוק-אפ הפריט הזה לא פעיל', 'info'))}><${Icon} name=${locked ? 'lock' : icon} size=${17} />${label}</button>`;
      })}
    </nav>
    <span class="ms-auto"></span>
    <button type="button" class="rounded-lg p-2 text-muted hover:bg-brand-50 cursor-pointer" aria-label="התראות" onClick=${() => notify('אין התראות חדשות', 'bell')}><${Icon} name="bell" size=${20} /></button>
    <button type="button" class="rounded-lg p-2 text-muted hover:bg-brand-50 cursor-pointer" aria-label="הגדרות" onClick=${() => (s.paid ? go('settings') : notify('ההגדרות של הכריש נפתחות אחרי התשלום', 'lock'))}><${Icon} name="settings" size=${20} /></button>
    ${!EMBED && html`<${ViewToggle} view=${shellView} onChange=${onViewChange} class="max-md:hidden" />`}
    <button type="button" onClick=${() => setDev((d) => !d)} title="הערות למפתחים (Shift+D)" aria-label="הערות למפתחים" class="inline-flex h-10 w-10 items-center justify-center rounded-xl text-muted hover:bg-brand-50 hover:text-brand-600 cursor-pointer max-md:hidden"><${Icon} name="code-xml" size=${18} /></button>
  </header>`;

  const home = html`<div class="mx-auto max-w-[1040px] px-4 py-5 md:px-8 md:py-7">
    <h1 class="fb-h1 mb-1 text-[28px] md:text-[36px]">בוקר טוב, ${USER.firstName}</h1>
    <p class="mb-5 text-[16px]">${USER.business} · ${s.paid ? 'המנוי פעיל' : 'שלבים 1 ו-2 מאחוריך'}</p>
    <div class="grid items-start gap-5 md:grid-cols-[1.4fr_0.6fr]">
      <section class="fb-panel flex flex-wrap items-center gap-4 !p-4 md:!p-5">
        <span class="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand-100 text-brand-600"><${Icon} name="package" size=${24} /></span>
        <span class="min-w-0 flex-1">
          <small class="fb-eyebrow block">הצעד הבא · פרק 1</small>
          <b class="block font-display text-[20px]">שלב 3: סל מוצרים</b>
          ${!s.paid && html`<small class="block text-[13px] text-muted">מכאן ממשיכים עם מנוי</small>`}
        </span>
        <${Button} class="!h-11 !text-[16px]" onClick=${() => (s.paid ? notify('שלב 3 לא חלק מהמוק-אפ הזה', 'info') : go('pay'))}>${s.paid ? 'להתחיל' : 'להמשיך'}<${Icon} name="arrow-left" size=${18} /><//>
      </section>
      <${SharkCard} paid=${s.paid} connected=${s.connected} onAdd=${() => patch({ welcome: true })} onChat=${() => go('chat')} onSettings=${() => go('settings')} />
    </div>
  </div>`;

  let body;
  if (view === 'pay') body = html`<${Paywall} onBack=${() => go('home')} onPaid=${() => (patch({ paid: true, welcome: true }), go('home'))} />`;
  else if (view === 'chat') body = html`<${SharkChat} shark=${s} setShark=${(fn) => setS((x) => fn(x))} onBack=${() => go('home')} />`;
  else if (view === 'settings')
    body = html`<${SharkSettings} shark=${s} onAdd=${() => (patch({ welcome: true }), go('home'))} onDisconnect=${() => (patch({ connected: false, msgs: [] }), notify('הכריש נותק מהוואטסאפ', 'unplug'))} />`;
  else body = html`${home}${!s.welcome && html`<${PartnerBubble} message=${s.paid ? BUBBLE.after : BUBBLE.before} unread=${unread} onRead=${() => setUnread(false)} />`}`;

  return html`<div class="fb-notebook flex h-dvh flex-col text-ink" dir="rtl">
    ${appBar}
    <main class="thin-scroll relative min-h-0 flex-1 overflow-y-auto">${body}</main>
    ${s.welcome &&
    view === 'home' &&
    html`<${SharkWelcome}
      phoneLayout=${phoneLayout}
      onConnect=${() => patch({ connected: true })}
      onLater=${() => (patch({ welcome: false }), notify('אפשר להוסיף אותו מהכרטיס בדף הבית, או מההגדרות', 'info'))}
      onClose=${() => patch({ welcome: false })}
      onChat=${() => (patch({ welcome: false }), go('chat'))}
    />`}
    <${Toast} toast=${toast} />
    <${DevPanel} open=${dev} onClose=${() => setDev(false)} onJump=${jump} onReset=${() => (setS(afterPay()), go('home'), setDev(false))} />
  </div>`;
}

function Root() {
  const [view, setView] = useState(readView);
  useEffect(() => applyPhoneViewport(view), [view]);
  const change = (v) => {
    if (v === 'mobile') {
      try {
        writeHandoff(window.__flowbizSnapshot?.());
      } catch {}
    }
    saveView(v);
    setView(v);
  };
  if (!EMBED && !IS_PHONE && view === 'mobile') return html`<${PhonePreview} onSwitch=${change} title="הכריש בוואטסאפ" />`;
  return html`<${App} view=${view} onViewChange=${change} />`;
}

applyPhoneViewport(readView());
render(html`<${Root} />`, document.getElementById('app'));
