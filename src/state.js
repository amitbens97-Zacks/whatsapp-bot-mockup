// All the mockup's data in one object, kept per browser tab and per demo user.
import { GENDER, USER, OTHER_BUSINESS, HOLD_TEXT, startAnswers, FIRST_TEXT } from './data.js';

const STORE = `flowbiz-wa-state-v2-${GENDER}`;
let seq = 100;
export const nextId = () => `m${++seq}`;

export const NOW = '10:12';

const lead = (o) => ({
  phone: '050-0000000', source: 'קישור ישיר', status: 'חדש', unread: 0, msgs: [], draft: null,
  paused: false, stopped: false, windowClosed: false, viaBot: true, lastAt: 'היום', ...o,
});

// Leads from before the bot sit in the same table (step 11, the landing page form).
const seedLeads = () => [
  lead({
    id: 'noa', name: 'נועה לוי', phone: '054-2223344', source: 'דף: טיפול בחרדה', status: 'מחכה לאישור', unread: 1, lastAt: 'אתמול 21:40',
    msgs: [
      { id: 'n1', who: 'lead', text: FIRST_TEXT, t: 'אתמול 21:38' },
      { id: 'n2', who: 'bot', tag: 'opening', text: `היי נועה, כאן ${USER.business}, העסק של ${USER.fullName}. כרגע אנחנו מחוץ לשעות הפעילות (א׳ עד ה׳, 09:00 עד 17:00). ההודעה אצלי ואחזור אליך עוד היום.`, t: 'אתמול 21:38' },
      { id: 'n3', who: 'lead', text: 'זה מתאים גם לבן שלי, בן 16?', t: 'אתמול 21:40' },
      { id: 'n4', who: 'bot', tag: 'hold', text: HOLD_TEXT, t: 'אתמול 21:40' },
    ],
    draft: {
      text: GENDER === 'f'
        ? 'היי נועה, כן. אני עובדת עם מבוגרים ועם נוער מגיל 16. עם נוער מתחילים בפגישה אחת עם ההורים, ואז ממשיכים רק איתו. רוצה שנקבע שיחת היכרות קצרה?'
        : 'היי נועה, כן. אני עובד עם מבוגרים ועם נוער מגיל 16. עם נוער מתחילים בפגישה אחת עם ההורים, ואז ממשיכים רק איתו. רוצה שנקבע שיחת היכרות קצרה?',
      why: 'מ"למי זה מתאים" בסל המוצרים, שלב 3',
      keep: 'למי זה מתאים?',
      q: 'זה מתאים גם לבן שלי, בן 16?',
    },
  }),
  lead({
    id: 'yael', name: 'יעל מור', phone: '052-7770011', source: 'פנייה חמה, שלב 11', status: 'בשיחה', lastAt: 'שני', viaBot: false,
    msgs: [{ id: 'y1', who: 'note', text: 'הליד נכנס מפנייה חמה בשלב 11, לפני שהבוט פעל. אין שיחה במספר הזה.', t: '' }],
  }),
  lead({
    id: 'oren', name: 'אורן דהן', phone: '053-1112233', source: 'טופס בדף העסק', status: 'נסגר', lastAt: 'ראשון', viaBot: false,
    msgs: [{ id: 'o1', who: 'note', text: 'הליד נכנס מהטופס בדף העסק. סומן "סגרתי!" ונכנס ללוח התשלומים במרכז הפיננסי.', t: '' }],
  }),
];

export function freshState() {
  return {
    config: {
      hours: { days: ['sun', 'mon', 'tue', 'wed', 'thu'], from: '09:00', to: '17:00' },
      replyTime: 'today',
      tone: 'friendly',
      custom: {},
      answers: startAnswers(),
      places: [],
      active: true,
      mail: true,
      tested: false,
      done: false,
    },
    leads: seedLeads(),
    sel: 'noa',
    isOpen: true,
    aiDown: false,
    ended: false,
    after14: false,
    log: [],
    bell: 1,
    made: 0,
  };
}

export function loadState() {
  try {
    const raw = sessionStorage.getItem(STORE);
    if (raw) return JSON.parse(raw);
  } catch {}
  return freshState();
}

export function saveState(s) {
  try {
    sessionStorage.setItem(STORE, JSON.stringify(s));
  } catch {}
}

// New leads the "ליד חדש נכנס" button brings in, in order.
const NAMES = [
  ['שירה אברהם', '050-3334455', 'דף: טיפול בחרדה'],
  ['Moshe', '052-9998877', 'קישור ישיר'],
  ['רונית שגב', '054-6667788', 'פלייר'],
  ['גיא נחום', '053-4445566', 'פוסט ממכונת התוכן'],
];
export const newLead = (n) => {
  const [name, phone, source] = NAMES[n % NAMES.length];
  return lead({ id: `l${Date.now() % 100000}`, name, phone, source, status: 'חדש' });
};

// The edge cases. Each one starts a clean thread and shows one rule of the task.
// `say` is what the lead writes when the case opens.
export const CASES = [
  { id: 'nocode', icon: 'circle-help', label: 'ליד בלי קוד', sub: 'כותב למספר בלי הקישור, ואין לאיזה עסק לשייך', say: 'היי, רציתי לשאול על השירות', hint: USER.business, make: () => lead({ id: 'c-nocode', name: 'שי נאור', phone: '050-1010101', unrouted: true }) },
  { id: 'two', icon: 'git-branch', label: 'ליד של שני עסקים', sub: 'השיחה עוברת לעסק האחרון, וכל עסק רואה רק את שלו', say: FIRST_TEXT, make: () => lead({ id: 'c-two', name: 'מיכל בר', phone: '050-2020202', other: true, msgs: [
    { id: 't1', who: 'lead', other: true, text: `היי, הגעתי מהעמוד של ${OTHER_BUSINESS.name} (${OTHER_BUSINESS.code})`, t: 'שלשום 12:03' },
    { id: 't2', who: 'bot', other: true, text: `היי מיכל, כאן ${OTHER_BUSINESS.name}. ההודעה אצלנו ונחזור אליך עוד היום.`, t: 'שלשום 12:03' },
  ] }) },
  { id: 'closed', icon: 'moon', label: 'מחוץ לשעות', sub: 'המענה הראשוני בנוסח של מחוץ לשעות', say: FIRST_TEXT, closed: true, make: () => lead({ id: 'c-closed', name: 'איתי רם', phone: '050-3030303' }) },
  { id: 'human', icon: 'user-round', label: 'ליד מבקש בן אדם', sub: 'הבוט עוצר בשיחה הזו, עד שמחזירים אותו', say: 'אפשר לדבר עם בן אדם?', make: () => lead({ id: 'c-human', name: 'תמר גל', phone: '050-4040404' }) },
  { id: 'voice', icon: 'mic', label: 'הודעה קולית', sub: 'הבוט לא מנחש, והשיחה מסומנת למשתמש', kind: 'voice', say: 'הודעה קולית', make: () => lead({ id: 'c-voice', name: 'בני עוז', phone: '050-5050505', status: 'בשיחה', msgs: [
    { id: 'v1', who: 'lead', text: FIRST_TEXT, t: '09:30' },
    { id: 'v2', who: 'bot', tag: 'opening', text: `היי בני, כאן ${USER.business}, העסק של ${USER.fullName}. תודה שכתבת, ההודעה אצלי ואחזור אליך עוד היום.`, t: '09:30' },
  ] }) },
  { id: 'window', icon: 'hourglass', label: 'עברו 24 שעות', sub: 'כותבים רק בתבנית, או מהוואטסאפ הפרטי', make: () => lead({ id: 'c-window', name: 'ליאור שחר', phone: '050-6060606', status: 'בשיחה', windowClosed: true, lastAt: 'שלשום', msgs: [
    { id: 'w1', who: 'lead', text: FIRST_TEXT, t: 'שלשום 09:40' },
    { id: 'w2', who: 'bot', tag: 'opening', text: `היי ליאור, כאן ${USER.business}, העסק של ${USER.fullName}. תודה שכתבת, ההודעה אצלי ואחזור אליך עוד היום.`, t: 'שלשום 09:40' },
    { id: 'w3', who: 'lead', text: 'מעולה, מחכה', t: 'שלשום 09:41' },
  ] }) },
  { id: 'stop', icon: 'ban', label: '"הסר אותי"', sub: 'לא שולחים לו יותר, גם לא בתבנית', say: 'הסר אותי בבקשה', make: () => lead({ id: 'c-stop', name: 'דנה קרן', phone: '050-7070707', status: 'בשיחה', msgs: [
    { id: 's1', who: 'lead', text: FIRST_TEXT, t: 'אתמול 16:20' },
    { id: 's2', who: 'bot', tag: 'opening', text: `היי דנה, כאן ${USER.business}, העסק של ${USER.fullName}. תודה שכתבת, ההודעה אצלי ואחזור אליך עוד היום.`, t: 'אתמול 16:20' },
  ] }) },
  { id: 'aidown', icon: 'cloud-off', label: 'הכריש לא זמין', sub: 'תקלה ב-AI: יוצאת רק תשובת ההעברה, והשיחה מסומנת למשתמש', say: 'יש החזר מהביטוח?', aiDown: true, make: () => lead({ id: 'c-ai', name: 'עומר טל', phone: '050-8080808', status: 'בשיחה', msgs: [
    { id: 'a1', who: 'lead', text: FIRST_TEXT, t: '09:58' },
    { id: 'a2', who: 'bot', tag: 'opening', text: `היי עומר, כאן ${USER.business}, העסק של ${USER.fullName}. תודה שכתבת, ההודעה אצלי ואחזור אליך עוד היום.`, t: '09:58' },
  ] }) },
  { id: 'ended', icon: 'credit-card', label: 'המנוי הסתיים', sub: 'הבוט לא עונה, והליד מקבל את המספר של העסק', say: FIRST_TEXT, ended: true, make: () => lead({ id: 'c-end', name: 'אביב רז', phone: '050-9090909' }) },
];
