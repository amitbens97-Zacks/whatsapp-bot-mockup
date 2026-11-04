// Task 4: the WhatsApp bot and the shark. Three places:
//   1. the shark on the user's WhatsApp, right after the payment screen (shark.js);
//   2. step 13 "שירות לקוחות אוטומטי", where the bot is set up (step.js);
//   3. the bot at work: the lead's phone next to the system (leads.js), the home card
//      (home.js) and the settings (settings.js).
// There is no frame around the product: it opens on step 13, and everything else is
// reached the way a user reaches it, from the home page. The dashed lead's phone on the
// leads page and the developer notes are the only parts that belong to the mockup.
// Link params: ?view=shark|sharkchat|step|live|home|settings, ?screen=opening|link|hours|
// opening_msg|answers|test|done, ?case=<edge case>, ?user=f, ?embed = phone layout.
// Shift+D opens the developer notes.
import { html, render, useState, useEffect, useRef, Icon, cx } from './lib.js';
import { Logo, PartnerBubble, Progress, TopBar, BottomBar, Status, PrimaryButton, Button, Toast } from './components.js';
import { Sheet } from './ui.js';
import { STEP, PARTS, STEP_SCREENS, USER, g } from './data.js';
import { loadState, saveState, freshState, newLead, nextId, NOW, CASES } from './state.js';
import { decide, fillName, openingOf, answerFromDraft, SWITCH_TEXT } from './engine.js';
import { SharkAfterPay, SharkChat } from './shark.js';
import { Opening, LinkScreen, HoursScreen, MessagesScreen, AnswersScreen, TestScreen, Done } from './step.js';
import { LiveView } from './leads.js';
import { Home } from './home.js';
import { Settings } from './settings.js';
import { DevPanel } from './devnotes.js';
import { EMBED, IS_PHONE, readView, saveView, writeHandoff, takeHandoff, applyPhoneViewport, ViewToggle, PhonePreview } from './viewswitch.js';

const params = new URLSearchParams(location.search);
const VIEWS = ['shark', 'sharkchat', 'step', 'live', 'home', 'settings'];
const SCREENS = ['opening', ...STEP_SCREENS, 'done'];

function startRoute() {
  const view = params.get('view');
  if (params.get('case')) return { view: 'live' };
  if (VIEWS.includes(view)) {
    if (view === 'step') return { view, screen: SCREENS.includes(params.get('screen')) ? params.get('screen') : 'opening' };
    if (view === 'settings') return { view, tab: params.get('tab') === 'shark' ? 'shark' : 'bot' };
    return { view };
  }
  return { view: 'step', screen: 'opening' };
}

const SHARK_LINE = {
  opening: 'ליד שמקבל תשובה בדקה הראשונה נשאר איתך. נגדיר את זה פעם אחת, והבוט עושה את השאר.',
  link: 'כל הקישורים של העסק כבר מעודכנים. הקישור הזה הוא גם מה שמראה לך מאיפה כל ליד הגיע.',
  hours: 'לקחתי את השעות מ"אני והעסק". אם הן השתנו, עכשיו זה הזמן.',
  opening_msg: 'כתבתי בטון שבחרת בדף המסרים. כדאי לקרוא פעם אחת בקול.',
  answers: 'כל תשובה שמוגדרת כאן חוסכת לך עוד הודעה. מחיר כדאי להדליק רק אם נוח לך שיופיע בלי שיחה.',
  test: 'בדיקה אחת מהטלפון וזה באוויר.',
  home: 'השלב הבא שלך מחכה: הבוט שעונה ללידים. אפשר גם לשאול אותי כל דבר בוואטסאפ.',
};

function App({ view: shellView, onViewChange }) {
  const handoff = useRef(takeHandoff()).current;
  const [route, setRoute] = useState(handoff?.route || startRoute());
  const [state, setState] = useState(handoff?.state || loadState());
  const [caseId, setCaseId] = useState(null);
  const [casesOpen, setCasesOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [dev, setDev] = useState(false);
  const [save, setSave] = useState(null);
  const [unread, setUnread] = useState(true);
  const [maxPart, setMaxPart] = useState(0);
  const timers = useRef({});
  const started = useRef(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  const phoneLayout = EMBED || window.innerWidth < 768;

  useEffect(() => {
    saveState(state);
    window.__flowbizSnapshot = () => ({ route, state });
  });
  useEffect(() => {
    const q = new URLSearchParams();
    q.set('view', route.view);
    if (route.view === 'step') q.set('screen', route.screen);
    if (route.view === 'settings') q.set('tab', route.tab);
    if (EMBED) q.set('embed', '1');
    if (params.get('user')) q.set('user', params.get('user'));
    history.replaceState(null, '', `${location.pathname}?${q}`);
    setUnread(true);
  }, [route.view, route.screen, route.tab]);
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
    clearTimeout(timers.current.toast);
    timers.current.toast = setTimeout(() => setToast(null), 2800);
  };
  const go = (r) => setRoute(r);
  const patch = (p) => setState((s) => ({ ...s, ...p }));
  const setCfg = (p) => {
    setState((s) => ({ ...s, config: { ...s.config, ...p } }));
    setSave('saving');
    clearTimeout(timers.current.save);
    timers.current.save = setTimeout(() => setSave('saved'), 450);
  };
  const setShark = (fn) => setState((s) => ({ ...s, shark: fn(s.shark) }));
  const setLead = (id, p) =>
    setState((s) => ({ ...s, leads: s.leads.map((l) => (l.id === id ? { ...l, ...(typeof p === 'function' ? p(l) : p) } : l)) }));
  const addMsg = (id, m) => setLead(id, (l) => ({ msgs: [...l.msgs, { id: nextId(), t: NOW, ...m }] }));

  // ---------- a message reaches the FlowBiz number ----------
  const leadSays = (id, text, kind = 'text', flags = {}) => {
    const s = stateRef.current;
    const lead = s.leads.find((l) => l.id === id);
    if (!lead || lead.typing) return;
    if (lead.stopped) return notify('הליד הוסר, הבוט לא עונה לו', 'ban');
    const d = decide({ config: s.config, isOpen: flags.closed ? false : s.isOpen, lead, text, kind, aiDown: flags.aiDown ?? s.aiDown, ended: flags.ended ?? s.ended });
    const switching = lead.other && d.opening;
    setLead(id, (l) => ({ msgs: [...l.msgs, { id: nextId(), who: 'lead', text, t: NOW, kind }], lastAt: NOW, typing: !['silent'].includes(d.action), unrouted: d.routedNow ? false : l.unrouted, windowClosed: false }));
    patch({ log: [...stateRef.current.log, ...d.log] });
    if (d.action === 'silent') {
      setLead(id, { status: 'מחכה לך', unread: 1 });
      return;
    }
    clearTimeout(timers.current[id]);
    timers.current[id] = setTimeout(() => {
      const cur = stateRef.current;
      const isOpen = flags.closed ? false : cur.isOpen;
      const out = [];
      if (switching) out.push({ who: 'bot', tag: 'switch', text: SWITCH_TEXT });
      if (d.opening) out.push({ who: 'bot', tag: 'opening', text: fillName(openingOf(cur.config, isOpen), lead.name, cur.config) });
      if (d.reply) out.push({ who: 'bot', tag: d.action === 'auto' ? 'auto' : d.action, text: d.reply });
      const waits = ['draft', 'human', 'media', 'nodraft'].includes(d.action);
      setLead(id, (l) => ({
        typing: false,
        msgs: [...l.msgs, ...out.map((m) => ({ id: nextId(), t: NOW, ...m }))],
        draft: d.draft ? d.draft : l.draft,
        paused: d.action === 'human' ? true : l.paused,
        stopped: d.action === 'stop' ? true : l.stopped,
        status: d.action === 'stop' ? 'הוסר' : d.action === 'draft' ? 'מחכה לאישור' : waits ? 'מחכה לך' : d.action === 'ended' ? 'בשיחה' : l.status === 'מחכה לאישור' ? l.status : 'בשיחה',
      }));
      if (d.action === 'nodraft') addMsg(id, { who: 'note', text: 'הכריש לא זמין כרגע, אז אין הצעה. השיחה מחכה לך.', t: '' });
      if (waits) {
        patch({ bell: stateRef.current.bell + 1 });
        if (cur.config.mail) notify(`נשלח מייל: ${lead.name} ${d.action === 'draft' ? 'מחכה לאישור שלך' : 'מחכה לך'}`, 'mail');
      }
    }, 900);
  };

  const act = {
    select: (id) => {
      const l = stateRef.current.leads.find((x) => x.id === id);
      patch({ sel: id, bell: Math.max(0, stateRef.current.bell - (l?.unread ? 1 : 0)) });
      setLead(id, { unread: 0 });
    },
    newLead: () => {
      const l = newLead(stateRef.current.made || 0);
      setCaseId(null);
      setState((s) => ({ ...s, leads: [l, ...s.leads], sel: l.id, made: (s.made || 0) + 1, aiDown: false, ended: false }));
      setTimeout(() => leadSays(l.id, `היי, הגעתי מהעמוד של ${USER.business} (${USER.code})`), 150);
    },
    leadSays,
    approve: (id, text, keep) => {
      const l = stateRef.current.leads.find((x) => x.id === id);
      if (keep) {
        const ans = answerFromDraft(l.draft.q, text, l.draft.keep);
        setState((s) => ({ ...s, config: { ...s.config, answers: [...s.config.answers, ans] } }));
      }
      addMsg(id, { who: 'me', tag: 'approved', text });
      setLead(id, { draft: null, status: 'בשיחה', unread: 0 });
      patch({ log: [...stateRef.current.log, keep ? 'התשובה נשלחה ונשמרה כתשובה אוטומטית' : 'התשובה נשלחה באישור המשתמש'] });
      notify(keep ? 'נשלח, ומעכשיו זו תשובה אוטומטית' : 'נשלח', 'send');
    },
    dismiss: (id) => {
      setLead(id, { draft: null, status: 'מחכה לך' });
      notify('ההצעה נסגרה. אפשר לכתוב בעצמך', 'x');
    },
    manual: (id, text) => {
      addMsg(id, { who: 'me', tag: 'me', text });
      setLead(id, { status: 'בשיחה', unread: 0 });
    },
    template: (id, t) => {
      const l = stateRef.current.leads.find((x) => x.id === id);
      addMsg(id, { who: 'me', tag: 'template', text: fillName(t.text, l.name, stateRef.current.config).replace('{תאריך}', 'יום ראשון ב-10:00') });
      patch({ log: [...stateRef.current.log, 'תבנית מאושרת נשלחה. אם הליד יענה, נפתחות עוד 24 שעות'] });
    },
    resume: (id) => {
      setLead(id, { paused: false, status: 'בשיחה' });
      notify('הבוט חזר לענות בשיחה הזו', 'play');
    },
    closed: (id) => {
      setLead(id, { status: 'נסגר', draft: null });
      notify('נסגר! העסקה נכנסה ללוח התשלומים במרכז הפיננסי', 'party-popper');
    },
    bell: () => notify(stateRef.current.bell ? 'השיחות שמחכות לך מסומנות בנקודה כחולה' : 'אין התראות חדשות', 'bell'),
    toast: notify,
  };

  const runCase = (id) => {
    const c = CASES.find((x) => x.id === id);
    if (!c) return;
    const l = c.make();
    setCasesOpen(false);
    setDev(false);
    setCaseId(id);
    setRoute({ view: 'live' });
    setState((s) => ({ ...s, leads: [l, ...s.leads.filter((x) => x.id !== l.id)], sel: l.id, log: [], aiDown: !!c.aiDown, ended: !!c.ended }));
    if (c.say) setTimeout(() => leadSays(l.id, c.say, c.kind || 'text', { closed: c.closed, aiDown: c.aiDown, ended: c.ended }), 500);
  };
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    if (params.get('case')) runCase(params.get('case'));
  }, []);

  const jump = (id) => {
    setDev(false);
    if (id === 'shark' || id === 'sharkchat' || id === 'live' || id === 'home') go({ view: id });
    else if (id === 'settings') go({ view: 'settings', tab: 'bot' });
    else go({ view: 'step', screen: id });
  };
  const reset = () => {
    setState(freshState());
    setCaseId(null);
    setDev(false);
    notify('הנתונים אופסו', 'rotate-ccw');
  };

  const caseInfo = route.view === 'live' && caseId ? CASES.find((c) => c.id === caseId) : null;

  const cases = casesOpen &&
    html`<${Sheet} title="מקרי קצה" wide onClose=${() => setCasesOpen(false)}>
      <p class="mb-3 text-[14px] text-muted">כל מקרה נפתח בעמוד הלידים, עם ליד משלו.</p>
      <div class="grid gap-2 sm:grid-cols-2">
        ${CASES.map(
          (c) => html`<button key=${c.id} type="button" class="lp-option !items-start" onClick=${() => runCase(c.id)}>
            <span class="mt-0.5 text-brand-600"><${Icon} name=${c.icon} size=${19} /></span>
            <span class="min-w-0"><b class="block text-[15px]">${c.label}</b><small class="block text-[13px] leading-snug text-muted">${c.sub}</small></span>
          </button>`,
        )}
      </div>
    <//>`;

  const shell = (inner) => html`<div class="fb-notebook flex h-dvh flex-col text-ink" dir="rtl">
    ${inner}
    <${Toast} toast=${toast} />
    ${cases}
    <${DevPanel}
      open=${dev}
      onClose=${() => setDev(false)}
      onJump=${jump}
      onCase=${runCase}
      onReset=${reset}
      after14=${state.after14}
      setAfter14=${(v) => patch({ after14: v })}
      isOpen=${state.isOpen}
      setIsOpen=${(v) => patch({ isOpen: v })}
    />
  </div>`;

  // ---------- the app bar on the pages outside the step ----------
  const waiting = state.leads.filter((l) => !l.unrouted && (l.draft || l.status === 'מחכה לך')).length;
  const nav = [
    ['home', 'בית', 'house'],
    ['calendar', 'יומן', 'calendar-days'],
    ['tasks', 'משימות', 'list-checks'],
    ['finance', 'כספים', 'wallet'],
    ['files', 'קבצים', 'folder-open'],
    ['leads', 'לידים', 'users'],
    ['pages', 'הדפים שלי', 'layout-template'],
  ];
  const devBtn = html`<button type="button" onClick=${() => setDev((d) => !d)} title="הערות למפתחים (Shift+D)" aria-label="הערות למפתחים" class="inline-flex h-10 w-10 items-center justify-center rounded-xl text-muted hover:bg-brand-50 hover:text-brand-600 cursor-pointer max-md:hidden"><${Icon} name="code-xml" size=${18} /></button>`;
  const leadsActive = route.view === 'live' && state.after14;
  const appBar = html`<header class="no-print z-20 flex h-16 shrink-0 items-center gap-3 border-b border-line bg-surface px-3 md:px-6">
    <button type="button" aria-label="דף הבית" class="cursor-pointer" onClick=${() => go({ view: 'home' })}><${Logo} size="sm" /></button>
    <nav class="ms-4 hidden items-center gap-1 lg:flex">
      ${nav.map(([id, label, icon]) => {
        const locked = id === 'leads' && !state.after14;
        return html`<button
          key=${id}
          type="button"
          class=${cx('inline-flex h-10 items-center gap-1.5 rounded-xl px-3 text-[14px] font-bold cursor-pointer', route.view === id || (id === 'leads' && leadsActive) ? 'bg-brand-100 text-brand-600' : locked ? 'text-faint' : 'text-muted hover:bg-brand-50 hover:text-brand-600')}
          onClick=${() => (id === 'home' ? go({ view: 'home' }) : id === 'leads' && !locked ? go({ view: 'live' }) : notify(locked ? '"לידים" נפתח בשלב 14. עד אז הלידים בכרטיס בדף הבית' : 'במוק-אפ הפריט הזה לא פעיל', 'info'))}
        ><${Icon} name=${locked ? 'lock' : icon} size=${17} />${label}</button>`;
      })}
    </nav>
    <span class="ms-auto"></span>
    <button type="button" class="relative rounded-lg p-2 text-muted hover:bg-brand-50 cursor-pointer" aria-label=${`התראות: ${waiting}`} onClick=${() => go({ view: 'live' })}>
      <${Icon} name="bell" size=${20} />
      ${waiting > 0 && html`<span class="absolute -end-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white">${waiting}</span>`}
    </button>
    <button type="button" class="rounded-lg p-2 text-muted hover:bg-brand-50 cursor-pointer" aria-label="הגדרות" onClick=${() => go({ view: 'settings', tab: 'bot' })}><${Icon} name="settings" size=${20} /></button>
    ${!EMBED && html`<${ViewToggle} view=${shellView} onChange=${onViewChange} class="max-md:hidden" />`}
    ${devBtn}
  </header>`;

  // ---------- the routes ----------
  if (route.view === 'shark')
    return shell(html`${appBar}<main class="thin-scroll relative min-h-0 flex-1 overflow-y-auto">
      <${SharkAfterPay}
        key=${state.shark.connected}
        connected=${state.shark.connected}
        phoneLayout=${phoneLayout}
        onConnect=${() => setShark((s) => ({ ...s, connected: true }))}
        onSkip=${() => (notify('אפשר להוסיף אותו מדף הבית או מההגדרות', 'info'), go({ view: 'home' }))}
        onChat=${() => go({ view: 'sharkchat' })}
      />
    </main>`);
  if (route.view === 'sharkchat')
    return shell(html`${appBar}<main class="thin-scroll relative min-h-0 flex-1 overflow-y-auto"><${SharkChat} shark=${state.shark} setShark=${setShark} /></main>`);
  if (route.view === 'home')
    return shell(html`${appBar}<main class="thin-scroll relative min-h-0 flex-1 overflow-y-auto"><${Home} state=${state} go=${go} onLead=${(id) => (act.select(id), go({ view: 'live' }))} /><${PartnerBubble} message=${SHARK_LINE.home} unread=${unread} onRead=${() => setUnread(false)} /></main>`);
  if (route.view === 'settings')
    return shell(html`${appBar}<main class="thin-scroll relative min-h-0 flex-1 overflow-y-auto"><${Settings} state=${state} tab=${route.tab || 'bot'} go=${go} setCfg=${setCfg} setShark=${setShark} notify=${notify} /></main>`);
  if (route.view === 'live')
    return shell(html`${appBar}<main class="relative min-h-0 flex-1 overflow-hidden"><${LiveView} state=${state} act=${act} phoneLayout=${window.innerWidth < 1024} caseInfo=${caseInfo} onCases=${() => setCasesOpen(true)} onHome=${() => go({ view: 'home' })} /></main>`);

  // ---------- step 13 ----------
  const screen = route.screen;
  const part = STEP_SCREENS.indexOf(screen);
  const toScreen = (s) => {
    setSave(null);
    setRoute({ view: 'step', screen: s });
    const i = STEP_SCREENS.indexOf(s);
    if (i > maxPart) setMaxPart(i);
  };
  const cfg = state.config;
  const onCount = cfg.answers.filter((a) => a.on && (a.a || a.auto)).length;
  const reason = screen === 'hours' && !cfg.hours.days.length
    ? 'צריך לבחור לפחות יום אחד'
    : screen === 'answers' && onCount === 0
      ? 'צריך לפחות תשובה אוטומטית אחת'
      : screen === 'test' && !cfg.tested
        ? 'צריך לשלוח הודעת בדיקה אחת'
        : null;
  const next = screen === 'opening' ? STEP_SCREENS[0] : STEP_SCREENS[part + 1] || 'done';
  const body = {
    opening: html`<${Opening} config=${cfg} />`,
    link: html`<${LinkScreen} notify=${notify} />`,
    hours: html`<${HoursScreen} config=${cfg} setCfg=${setCfg} />`,
    opening_msg: html`<${MessagesScreen} config=${cfg} setCfg=${setCfg} />`,
    answers: html`<${AnswersScreen} config=${cfg} setCfg=${setCfg} />`,
    test: html`<${TestScreen} config=${cfg} phoneLayout=${phoneLayout} onPassed=${() => setCfg({ tested: true })} />`,
    done: html`<${Done} config=${cfg} />`,
  }[screen];
  const top = html`<${TopBar}
    step=${STEP}
    progress=${screen === 'opening' ? null : html`<${Progress} parts=${PARTS} current=${part} maxReached=${Math.max(maxPart, part)} done=${screen === 'done'} onJump=${(i) => toScreen(STEP_SCREENS[i])} />`}
    tools=${html`${screen !== 'done' && html`<button type="button" class="fb-home cursor-pointer whitespace-nowrap max-md:hidden" onClick=${() => (notify('דילגת על השלב. הוא נשאר פתוח במפה, ואפשר לחזור בדיוק לכאן', 'skip-forward'), go({ view: 'home' }))}><${Icon} name="skip-forward" size=${16} />דילוג על השלב</button>`}${!EMBED && html`<${ViewToggle} view=${shellView} onChange=${onViewChange} class="max-md:hidden" />`}${devBtn}`}
    onHome=${() => go({ view: 'home' })}
  />`;
  const bottom = screen === 'done'
    ? html`<${BottomBar}
        extra=${html`<${Button} variant="text" onClick=${() => go({ view: 'live' })}><${Icon} name="users" size=${16} />הלידים שלי<//>`}
        primary=${html`<${PrimaryButton} label="לשלב הבא" onClick=${() => (notify('השלב הבא נפתח במפה: שלב 14', 'arrow-left'), go({ view: 'home' }))} />`}
      />`
    : html`<${BottomBar}
      back=${screen !== 'opening' && html`<${Button} variant="secondary" onClick=${() => toScreen(part === 0 ? 'opening' : STEP_SCREENS[part - 1])}>חזרה<//>`}
      status=${html`<${Status} reason=${reason} save=${save} />`}
      primary=${html`<${PrimaryButton}
        label=${screen === 'opening' ? 'מתחילים' : screen === 'test' ? 'סיום השלב' : 'המשך'}
        check=${screen === 'test'}
        disabled=${!!reason}
        onClick=${() => {
          if (screen === 'test') setCfg({ done: true });
          toScreen(next);
        }}
      />`}
    />`;
  return shell(html`${top}
    <main class="thin-scroll relative min-h-0 flex-1 overflow-y-auto">
      ${body}
      ${SHARK_LINE[screen] && html`<${PartnerBubble} message=${SHARK_LINE[screen]} unread=${unread} onRead=${() => setUnread(false)} />`}
    </main>
    ${bottom}`);
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
  if (!EMBED && !IS_PHONE && view === 'mobile') return html`<${PhonePreview} onSwitch=${change} />`;
  return html`<${App} view=${view} onViewChange=${change} />`;
}

applyPhoneViewport(readView());
render(html`<${Root} />`, document.getElementById('app'));
