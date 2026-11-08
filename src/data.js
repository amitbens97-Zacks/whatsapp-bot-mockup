// Mock data for task 4. In production:
//   business name, tone, what the user wrote -> "שם ולוגו" (6), "דף המסרים" (7)
//   days and hours                           -> "אני והעסק" (2), editable in step 13
//   prices and what is included              -> "סל מוצרים" (3)
//   cancellation policy, objections          -> "בניית הצעה מנצחת" (8)
//   leads                                    -> the one leads table (crm_leads)
//   the shark's answers                      -> the same shark as inside the system
// The mockup's "today" is fixed so every date on the page stays the same.

export const PARTNER = { name: 'הכריש', role: 'השותף העסקי' };

export const STEP = { n: 13, name: 'שירות לקוחות אוטומטי', chapterNo: 5, chapter: 'מגדילים מכירות', icon: 'message-circle' };
export const PARTS = ['הקישור שלך', 'שעות פעילות', 'מענה ראשוני', 'תשובות אוטומטיות', 'בדיקה'];
export const STEP_SCREENS = ['link', 'hours', 'opening_msg', 'answers', 'test'];

// The demo user: a therapist with a small private clinic. FlowBiz knows how each user
// asked to be addressed (זכר / נקבה).
// In the mockup: ?user=f or ?user=m, or the developer panel. Kept per browser.
const PROFILES = {
  m: { gender: 'm', firstName: 'דניאל', fullName: 'דניאל כהן', slug: 'danielcohen', email: 'daniel@example.co.il' },
  f: { gender: 'f', firstName: 'דניאלה', fullName: 'דניאלה כהן', slug: 'danielacohen', email: 'daniela@example.co.il' },
};
const GENDER_KEY = 'flowbiz-wa-gender';
function pickGender() {
  try {
    const q = new URLSearchParams(location.search).get('user');
    if (q === 'f' || q === 'm') {
      localStorage.setItem(GENDER_KEY, q);
      return q;
    }
    return localStorage.getItem(GENDER_KEY) === 'f' ? 'f' : 'm';
  } catch {
    return 'm';
  }
}
export const GENDER = pickGender();
// The masculine or feminine form, by how the user asked to be addressed.
export const g = (m, f) => (GENDER === 'f' ? f : m);
export function setDemoGender(v) {
  try {
    localStorage.setItem(GENDER_KEY, v);
  } catch {}
  const u = new URL(location.href);
  u.searchParams.set('user', v);
  location.href = u.toString();
}

export const USER = {
  ...PROFILES[GENDER],
  business: 'מרחב שקט',
  kind: g('מטפל רגשי', 'מטפלת רגשית'),
  code: 'MS482',
  phone: '052-4567890',
};

export const ROOT_DOMAIN = 'flowbiz.co.il';
export const SHORT_LINK = `${USER.slug}.${ROOT_DOMAIN}/wa`;
export const FIRST_TEXT = `היי, הגעתי מהעמוד של ${USER.business} (${USER.code})`;

// A second demo business, for the lead that writes to two businesses.
export const OTHER_BUSINESS = { name: 'פילאטיס בכרמל', code: 'PK207' };

// Where the short link can go. Nothing changes by itself: the user marks each place,
// and only the marked ones change, when the step is finished (or saved in settings).
export const LINK_PLACES = [
  { id: 'pages', icon: 'layout-template', label: 'דף העסק ודפי ההצעות', sub: 'כפתור הוואטסאפ בדפים עובר לקישור הזה, עם מקור לכל דף' },
  { id: 'flyers', icon: 'image', label: 'הפליירים', sub: 'קוד QR שפותח את השיחה, בפליירים הבאים' },
  { id: 'posts', icon: 'megaphone', label: 'הפוסטים ממכונת התוכן', sub: 'הקישור נכנס לפוסטים הבאים' },
  { id: 'bio', icon: 'user-round', label: 'ביו באינסטגרם ובפייסבוק', sub: 'אין לנו גישה לשם: נוסיף משימה עם הקישור להעתקה' },
];

export const SOURCES = [
  { id: 'wa', label: 'קישור ישיר', path: 'wa' },
  { id: 'page', label: 'דף: טיפול בחרדה', path: 'wa/cbt' },
  { id: 'flyer', label: 'פלייר', path: 'wa/flyer' },
];

export const DAYS = [
  { id: 'sun', label: 'א׳' },
  { id: 'mon', label: 'ב׳' },
  { id: 'tue', label: 'ג׳' },
  { id: 'wed', label: 'ד׳' },
  { id: 'thu', label: 'ה׳' },
  { id: 'fri', label: 'ו׳' },
  { id: 'sat', label: 'ש׳' },
];

export const REPLY_TIMES = [
  { id: 'hour', label: 'תוך שעה', text: 'תוך שעה' },
  { id: 'today', label: 'עוד היום', text: 'עוד היום' },
  { id: 'next', label: 'יום העסקים הבא', text: 'ביום העסקים הבא' },
];

export const TONES = [
  { id: 'friendly', label: 'חברי' },
  { id: 'formal', label: 'מקצועי' },
  { id: 'direct', label: 'תכליתי' },
];

const BACK = 'אחזור';
// The automatic first answer: one text for inside the hours and one for outside them.
export const openingTexts = (tone, replyTime) => {
  const when = REPLY_TIMES.find((r) => r.id === replyTime)?.text || 'עוד היום';
  const set = {
    friendly: {
      open: `היי {שם}, כאן ${USER.business}, העסק של ${USER.fullName}. תודה שכתבת, ההודעה אצלי ו${BACK} אליך ${when}.\nבינתיים אפשר לשאול אותי כאן על שעות, ביטולים ואיך זה עובד.`,
      closed: `היי {שם}, כאן ${USER.business}, העסק של ${USER.fullName}. כרגע אנחנו מחוץ לשעות הפעילות ({שעות}). ההודעה אצלי ו${BACK} אליך ${when === 'תוך שעה' ? 'כשנפתח' : when}.`,
    },
    formal: {
      open: `שלום {שם}, הגעת אל ${USER.business}, העסק של ${USER.fullName}. פנייתך התקבלה ונחזור אליך ${when}.\nאפשר לשאול כאן על שעות הפעילות, מדיניות הביטולים ואופן העבודה.`,
      closed: `שלום {שם}, הגעת אל ${USER.business}, העסק של ${USER.fullName}. אנחנו מחוץ לשעות הפעילות ({שעות}). פנייתך התקבלה ונחזור אליך ${when === 'תוך שעה' ? 'עם הפתיחה' : when}.`,
    },
    direct: {
      open: `היי {שם}, כאן ${USER.business} של ${USER.fullName}. קיבלתי, ${BACK} אליך ${when}.`,
      closed: `היי {שם}, כאן ${USER.business} של ${USER.fullName}. סגור עכשיו ({שעות}). קיבלתי, ${BACK} אליך ${when === 'תוך שעה' ? 'כשנפתח' : when}.`,
    },
  };
  return set[tone] || set.friendly;
};

// When nothing defined fits: this goes out at once, alone, and the shark's draft waits
// for the user. Editable, and can be turned off, in part 4.
export const HOLD_TEXT = 'שאלה טובה, העברתי לשירות לקוחות.';

// The automatic answers the step starts with. `from` says where the text came from.
// `keys` stand in for matching by meaning: production compares the lead's question to
// each defined question, not to fixed keywords.
export const startAnswers = () => [
  {
    id: 'hours', q: 'מתי אתם זמינים?', auto: 'hours', on: true, fromStep: 'שעות פעילות', a: '',
    keys: ['שעות', 'מתי', 'פתוח', 'פתוחים', 'זמינים', 'זמין', 'פעילות', 'שישי', 'שבת'],
  },
  {
    id: 'how', q: 'איך זה עובד?', on: true, fromStep: 'סל מוצרים, שלב 3',
    a: 'מתחילים בשיחת היכרות קצרה בטלפון, בלי עלות. אם מתאים, נפגשים פעם בשבוע ל-50 דקות, בקליניקה או בזום.',
    keys: ['איך', 'עובד', 'תהליך', 'מתחילים', 'מה כולל', 'כולל', 'מפגשים', 'פגישה ראשונה'],
  },
  {
    id: 'cancel', q: 'מה מדיניות הביטולים?', on: true, fromStep: 'הצעה מנצחת, שלב 8', locked: true,
    a: 'אפשר לבטל או להזיז פגישה עד 24 שעות לפני מועדה, בלי תשלום. ביטול מאוחר יותר מחויב במחיר הפגישה.',
    keys: ['ביטול', 'לבטל', 'מבטל', 'מבטלים', 'ביטולים', 'להזיז', 'לדחות'],
  },
  {
    id: 'place', q: 'איפה נפגשים?', on: true, fromStep: 'כתיבה שלך', ph: 'למשל: בקליניקה ברמת גן, או בזום',
    a: '',
    keys: ['איפה', 'כתובת', 'מיקום', 'זום', 'קליניקה', 'מגיעים', 'נפגשים', 'חניה'],
  },
  {
    id: 'price', q: 'כמה זה עולה?', on: false, fromStep: 'סל מוצרים, שלב 3',
    a: 'פגישה של 50 דקות עולה 380 ₪. סדרה של 12 פגישות עולה 4,200 ₪, ואפשר לשלם אותה ב-3 תשלומים.',
    keys: ['כמה זה', 'כמה עולה', 'עולה', 'מחיר', 'מחירים', 'עלות', 'תשלום', 'תשלומים'],
  },
  { id: 'hold', q: 'שאלה בלי תשובה מוגדרת', auto: 'hold', on: true, fromStep: 'ברירת מחדל', a: HOLD_TEXT },
];

// Answers the shark offers to add, from the objections in step 8.
export const SUGGESTED = [
  { id: 'fit', q: 'למי זה מתאים?', a: 'למבוגרים ולנוער מגיל 16 שמתמודדים עם חרדה, לחץ או תקופה של שינוי. בשיחת ההיכרות בודקים יחד אם זה מתאים.', keys: ['מתאים', 'מתאימה', 'למי'], fromStep: 'סל מוצרים, שלב 3' },
  { id: 'insurance', q: 'יש החזר מהביטוח?', a: 'אין הסדר עם קופות החולים, אבל אחרי כל פגישה מקבלים קבלה שאפשר להגיש לביטוח המשלים.', keys: ['ביטוח', 'קופת חולים', 'קופה', 'החזר'], fromStep: 'הצעה מנצחת, שלב 8' },
  { id: 'time', q: 'כמה זמן נמשך טיפול?', a: 'זה משתנה מאדם לאדם. רוב המטופלים מרגישים שינוי אחרי 8 עד 12 פגישות.', keys: ['כמה זמן', 'כמה פגישות', 'נמשך'], fromStep: 'הצעה מנצחת, שלב 8' },
];

// The shark's suggested replies, for messages with no defined answer. In production the
// model writes them from the conversation, the business data and the user's tone.
export const DRAFTS = [
  {
    keys: ['מתאים', 'הבן שלי', 'הבת שלי', 'בן 1', 'בת 1', 'נוער', 'ילד'],
    text: 'היי, כן. אני עובד עם מבוגרים ועם נוער מגיל 16. עם נוער מתחילים בפגישה אחת עם ההורים, ואז ממשיכים רק איתו. רוצה שנקבע שיחת היכרות קצרה?',
    textF: 'היי, כן. אני עובדת עם מבוגרים ועם נוער מגיל 16. עם נוער מתחילים בפגישה אחת עם ההורים, ואז ממשיכים רק איתו. רוצה שנקבע שיחת היכרות קצרה?',
    why: 'מ"למי זה מתאים" בסל המוצרים, שלב 3',
    keep: 'למי זה מתאים?',
  },
  {
    keys: ['ביטוח', 'קופת חולים', 'קופה', 'מכבי', 'כללית', 'החזר'],
    text: 'אין לי הסדר עם קופות החולים, אבל אחרי כל פגישה מקבלים קבלה שאפשר להגיש לביטוח המשלים. כדאי לבדוק מולם כמה פגישות הם מחזירים.',
    why: 'מתנאי התשלום בשלב 8',
    keep: 'יש החזר מהביטוח?',
  },
  {
    keys: ['כמה זמן', 'כמה פגישות', 'נמשך'],
    text: 'זה משתנה מאדם לאדם. רוב המטופלים מרגישים שינוי אחרי 8 עד 12 פגישות, וכל כמה שבועות בודקים יחד איך מתקדמים.',
    why: 'מההתנגדויות בשלב 8: "כמה זמן נמשך טיפול?"',
    keep: 'כמה זמן נמשך טיפול?',
  },
  {
    keys: ['הנחה', 'יקר', 'להוריד'],
    text: 'אני מבין, זו השקעה. בסדרה של 12 פגישות כל פגישה יוצאת זולה יותר, ואפשר לפרוס אותה ל-3 תשלומים. רוצה שנדבר על זה בשיחת ההיכרות?',
    textF: 'אני מבינה, זו השקעה. בסדרה של 12 פגישות כל פגישה יוצאת זולה יותר, ואפשר לפרוס אותה ל-3 תשלומים. רוצה שנדבר על זה בשיחת ההיכרות?',
    why: 'מהסל ומתנאי התשלום בשלב 8',
    keep: 'יש הנחה?',
  },
];
export const FALLBACK_DRAFT = {
  text: 'תודה על ההודעה. אני רוצה לענות לך כמו שצריך, אפשר לדבר דקה היום?',
  why: 'אין על זה מידע בעסק, אז הכריש לא ממציא תשובה ומציע שיחה',
  keep: '',
};

// Ready templates of FlowBiz, already approved by Meta: the only way to write first
// once 24 hours passed since the lead's last message.
export const TEMPLATES = [
  { id: 'followup', name: 'פולואפ', text: `היי {שם}, כאן ${USER.business}. רציתי לבדוק אם עדיין רלוונטי לך לדבר.` },
  { id: 'reminder', name: 'תזכורת לפגישה', text: `היי {שם}, תזכורת מ${USER.business}: נפגשים ב-{תאריך}. אפשר לכתוב כאן אם משהו השתנה.` },
  { id: 'offer', name: 'קביעת שיחת היכרות', text: `היי {שם}, כאן ${USER.business}. רציתי לבדוק אם נוח לך לקבוע שיחת היכרות קצרה השבוע.` },
];

// ---------- The shark on the user's WhatsApp ----------

export const SHARK_CONTACT = 'הכריש · FlowBiz';
export const SHARK_CODE = 'FB-7K2Q';

// Questions the mockup can ask the shark, and what it reads to answer.
export const SHARK_ASKS = [
  {
    q: 'כמה לידים מחכים לי?',
    from: 'טבלת הלידים',
    a: `יש לך 3 לידים פתוחים. נועה לוי מחכה לתשובה מאתמול, אז הייתי מתחיל איתה.`,
    aF: `יש לך 3 לידים פתוחים. נועה לוי מחכה לתשובה מאתמול, אז הייתי מתחיל איתה.`,
  },
  {
    q: 'מטופלת אמרה לי שזה יקר, מה עונים?',
    from: 'התנגדויות, שלב 8',
    a: 'קודם לשאול יקר לעומת מה. אחר כך להזכיר שבסדרה של 12 פגישות כל פגישה יוצאת 350 ₪ במקום 380 ₪, ושאפשר 3 תשלומים. ואם זה באמת התקציב, אפשר להתחיל בפגישה אחת ולהחליט אחריה.',
  },
  {
    q: 'מה הצעד הבא שלי?',
    from: 'המסע',
    a: 'אתה בשלב 3, "סל מוצרים". נבנה יחד מה אתה מציע ובכמה, וזה הבסיס לכל מה שבא אחריו.',
    aF: 'את בשלב 3, "סל מוצרים". נבנה יחד מה את מציעה ובכמה, וזה הבסיס לכל מה שבא אחריו.',
  },
  {
    q: 'כמה נשאר לי החודש?',
    from: 'המרכז הפיננסי',
    a: 'נכנסו 9,120 ₪ ויצאו 2,350 ₪. עד סוף החודש מחכים עוד 1,400 ₪ מיעל מור, אז כרגע החודש נסגר ב-8,170 ₪ לטובתך.',
  },
  {
    q: 'איזה סרט כדאי לראות הערב?',
    from: 'מחוץ לנושאי העסק',
    a: 'בזה אני פחות עוזר. אני כאן בשביל העסק שלך: לידים, כסף, מכירות והצעד הבא. על מה נעבוד?',
  },
];
// When it is hard. The shark supports first, then gives real examples of people who failed
// many times before it worked, and ends with one small step. Free text is matched by keys.
export const SHARK_SUPPORT = [
  {
    q: g('אני מרגיש חסר ביטחון', 'אני מרגישה חסרת ביטחון'),
    keys: ['ביטחון', 'בטוח בעצמי', 'בטוחה בעצמי', 'לא מספיק טוב', 'לא מספיק טובה', 'מפחד', 'מפחדת', 'מתחזה', 'לא מאמין בעצמי', 'לא מאמינה בעצמי', 'אין לי מושג', 'לא יודע מה אני עושה', 'לא יודעת מה אני עושה', 'מבולבל', 'מבולבלת'],
    a: `זה טבעי לגמרי, ${USER.firstName}. כמעט כל מי שבונה עסק מרגיש ככה, גם מי שנראה מבחוץ הכי בטוח.
ביטחון לא מגיע לפני שעושים, הוא מגיע אחרי. כל פגישה שעברה טוב וכל מטופל שחזר בונים אותו, לאט.
ותסתכל${g('', 'י')} מה כבר עשית: הקמת את ${USER.business}, ויש לך 3 לידים שמחכים לך. זה לא מזל, זה ${g('אתה', 'את')}.
רוצה שנכין יחד את השיחה עם נועה, כדי ${g('שתיכנס אליה מוכן', 'שתיכנסי אליה מוכנה')}?`,
  },
  {
    q: g('אני מרגיש לבד בעסק', 'אני מרגישה לבד בעסק'),
    keys: ['לבד', 'בודד', 'בודדה', 'בדידות', 'אין עם מי', 'אין לי עם מי', 'אין לי עם מי לדבר'],
    a: `מבין אותך. עצמאות יכולה להיות בודדה, במיוחד כשכל ההחלטות עליך.
אבל ${g('אתה לא לבד', 'את לא לבד')}. אני כאן בכל שעה, גם בשתיים בלילה, ואני מכיר את העסק שלך לעומק.
ועוד דבר שכדאי לדעת: רוב העצמאים מרגישים בדיוק ככה, הם פשוט לא מדברים על זה. שיחה עם עוד ${g('מטפל', 'מטפלת')} שגם בונה קליניקה עושה הרבה.
וכשיתחשק לך מישהו בשר ודם, בסוף המסע יש פגישה עם יועץ של FlowBiz.
מה הכי מעיק עליך עכשיו?`,
  },
  {
    q: 'ניסיתי ולא הצלחתי',
    keys: ['ניסיתי', 'לא הצלחתי', 'נכשל', 'כישלון', 'לא עובד', 'להרים ידיים', 'מיואש', 'מיואשת', 'לוותר', 'אין תוצאות', 'לא יוצא לי', 'אף אחד לא פנה', 'אין פניות', 'אין תגובות', 'לסגור את העסק', 'לסגור עסק', 'להפסיק עם העסק', 'לחזור להיות שכיר', 'לחזור להיות שכירה', 'לחזור לעבוד כשכיר', 'לחזור לעבוד כשכירה'],
    a: `זה מתסכל, ואני שמח שסיפרת לי.
ג'יימס דייסון בנה 5,127 אבות טיפוס עד ששואב האבק שלו עבד. את "הארי פוטר" דחו 12 הוצאות לאור. מייסדי Airbnb מכרו קופסאות דגני בוקר כדי לשרוד, אחרי שמשקיעים אמרו להם לא שוב ושוב.
מה שמשותף להם: כל ניסיון לימד אותם משהו, והם ניסו שוב, קצת יותר טוב. ככה זה עובד, משתפרים מפעם לפעם.
אז זה לא כישלון, זה מידע. ${g('ספר', 'ספרי')} לי מה ניסית ומה קרה, ונמצא יחד דבר אחד לשנות בפעם הבאה.`,
  },
];
// A message that sounds like real distress gets a human, not a pep talk. Matched by keys, never in the list.
export const SHARK_DISTRESS = {
  keys: ['לא רוצה לחיות', 'לגמור עם הכול', 'לגמור עם הכל', 'להתאבד', 'לפגוע בעצמי', 'אין טעם לחיות', 'אין לי בשביל מה'],
  a: `מה שכתבת חשוב לי, ואני רוצה ${g('שתדבר', 'שתדברי')} עם בן אדם עכשיו.
ער"ן, עזרה ראשונה נפשית, זמינים בכל שעה בטלפון 1201, ויש גם צ'אט באתר שלהם. אם יש סכנה מיידית, מד"א 101.
אני כאן, אבל בזה אדם יעזור לך יותר ממני.`,
};
export const SHARK_FALLBACK = 'אני כאן לכל שאלה על העסק שלך: לידים, כסף, מכירות, שיווק והצעד הבא. על מה נעבוד?';

// The paywall, as it is in the system today (steps 1 and 2 are free).
export const PLANS = [
  { id: 'base', name: 'FlowBiz', month: 350, year: 3500, sub: 'כל המסע, הכלים והכריש' },
  { id: 'cpa', name: 'FlowBiz + רואה חשבון', month: 500, year: 4950, sub: 'הכול, ועוד רואה חשבון שמלווה אותך' },
];
