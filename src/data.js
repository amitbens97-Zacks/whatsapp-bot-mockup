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

// The demo user. FlowBiz knows how each user asked to be addressed (זכר / נקבה).
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
  business: 'שיווק שעובד',
  code: 'SH482',
  phone: '052-4567890',
};

export const ROOT_DOMAIN = 'flowbiz.co.il';
export const SHORT_LINK = `${USER.slug}.${ROOT_DOMAIN}/wa`;
export const FIRST_TEXT = `היי, הגעתי מהעמוד של ${USER.business} (${USER.code})`;

// A second demo business, for the lead that writes to two businesses.
export const OTHER_BUSINESS = { name: 'קליניקה לשינה', code: 'KL207' };

// Where the short link goes in by itself once the step is finished.
export const LINK_PLACES = [
  { icon: 'layout-template', label: 'דף העסק ודפי ההצעות', sub: 'כפתור הוואטסאפ עובר לקישור הזה. כל דף עם מקור משלו' },
  { icon: 'image', label: 'הפליירים', sub: 'קוד QR שפותח את השיחה' },
  { icon: 'megaphone', label: 'הפוסטים ממכונת התוכן', sub: 'הקישור נכנס לפוסט' },
  { icon: 'user-round', label: 'ביו באינסטגרם ובפייסבוק', sub: 'להעתיק ולהדביק פעם אחת' },
];

export const SOURCES = [
  { id: 'wa', label: 'קישור ישיר', path: 'wa' },
  { id: 'page', label: 'דף: ליווי 90 יום', path: 'wa/90-yom' },
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
    a: 'מתחילים בשיחת התאמה קצרה. אם מתאים, נפגשים פעם בשבוע לשעה, בונים יחד אסטרטגיה כתובה ומקימים את הקמפיינים והתוכן.',
    keys: ['איך', 'עובד', 'תהליך', 'מתחילים', 'מה כולל', 'כולל', 'מפגשים'],
  },
  {
    id: 'cancel', q: 'מה מדיניות הביטולים?', on: true, fromStep: 'הצעה מנצחת, שלב 8', locked: true,
    a: 'אפשר לבטל ולקבל החזר מלא עד 14 יום מההרשמה. פגישה שמבטלים עד 24 שעות לפני מועדה עוברת למועד אחר בלי תשלום.',
    keys: ['ביטול', 'לבטל', 'מבטל', 'מבטלים', 'החזר', 'ביטולים', 'להחזיר'],
  },
  {
    id: 'place', q: 'איפה נפגשים?', on: true, fromStep: 'כתיבה שלך', ph: 'למשל: בזום, או במשרד בתל אביב',
    a: '',
    keys: ['איפה', 'כתובת', 'מיקום', 'זום', 'משרד', 'מגיעים', 'נפגשים'],
  },
  {
    id: 'price', q: 'כמה זה עולה?', on: false, fromStep: 'סל מוצרים, שלב 3',
    a: 'תוכנית ליווי 90 יום עולה 7,500 ₪, ואפשר ב-3 תשלומים של 2,500 ₪. יש גם סדנה אישית של 3 שעות ב-890 ₪.',
    keys: ['כמה זה', 'כמה עולה', 'עולה', 'מחיר', 'מחירים', 'עלות', 'תשלום', 'תשלומים'],
  },
];

// Answers the shark offers to add, from the objections in step 8.
export const SUGGESTED = [
  { id: 'fit', q: 'למי זה מתאים?', a: 'לעסקי שירות מקומיים עם 1 עד 5 עובדים, שכבר יש להם לקוחות ורוצים פניות באופן קבוע.', keys: ['מתאים', 'מתאימה', 'למי'], fromStep: 'הצעה מנצחת, שלב 8' },
  { id: 'budget', q: 'צריך תקציב פרסום?', a: 'לא בהתחלה. בונים קודם את הבסיס, ורק אחר כך מחליטים יחד אם ובכמה לפרסם.', keys: ['תקציב', 'פרסום'], fromStep: 'הצעה מנצחת, שלב 8' },
  { id: 'time', q: 'כמה זמן אצטרך להשקיע?', a: 'מפגש של שעה בשבוע, ועוד כשעתיים של עבודה בין המפגשים.', keys: ['כמה זמן', 'להשקיע'], fromStep: 'הצעה מנצחת, שלב 8' },
];

// The shark's suggested replies, for messages with no defined answer. In production the
// model writes them from the conversation, the business data and the user's tone.
export const DRAFTS = [
  {
    keys: ['מתאים', 'קוסמטיקאית', 'מספרה', 'מטפלת', 'קליניקה', 'סטודיו', 'לעסק שלי'],
    text: 'היי, נשמע שזה בדיוק העסקים שאני עובד איתם. אני מלווה עסקי שירות מקומיים עם 1 עד 5 עובדים, שכבר יש להם לקוחות ורוצים פניות באופן קבוע. רוצה שנקבע שיחת התאמה קצרה השבוע?',
    textF: 'היי, נשמע שזה בדיוק העסקים שאני עובדת איתם. אני מלווה עסקי שירות מקומיים עם 1 עד 5 עובדים, שכבר יש להם לקוחות ורוצים פניות באופן קבוע. רוצה שנקבע שיחת התאמה קצרה השבוע?',
    why: 'מההתנגדויות בשלב 8: "למי זה מתאים?"',
    keep: 'למי זה מתאים?',
  },
  {
    keys: ['תקציב', 'פרסום', 'קמפיין', 'כסף על'],
    text: 'לא חייבים תקציב פרסום בהתחלה. בונים קודם את הבסיס, ורק אחר כך מחליטים יחד אם ובכמה לפרסם. רוצה שנדבר על המצב אצלך?',
    why: 'מההתנגדויות בשלב 8: "צריך תקציב פרסום?"',
    keep: 'צריך תקציב פרסום?',
  },
  {
    keys: ['זמן', 'שעות בשבוע', 'להשקיע', 'כמה זמן'],
    text: 'זה מפגש של שעה בשבוע, ועוד כשעתיים של עבודה בין המפגשים. אם השבוע שלך עמוס, נתאים את הקצב יחד.',
    why: 'מההתנגדויות בשלב 8: "כמה זמן אצטרך להשקיע?"',
    keep: 'כמה זמן אצטרך להשקיע?',
  },
  {
    keys: ['הנחה', 'יקר', 'להוריד'],
    text: 'אני מבין, זו השקעה רצינית. אפשר לפרוס ל-3 תשלומים, ויש גם סדנה אישית של 3 שעות למי שרוצה להתחיל בקטן. מה יעזור לך להחליט?',
    textF: 'אני מבינה, זו השקעה רצינית. אפשר לפרוס ל-3 תשלומים, ויש גם סדנה אישית של 3 שעות למי שרוצה להתחיל בקטן. מה יעזור לך להחליט?',
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
  { id: 'offer', name: 'ההצעה שדיברנו עליה', text: `היי {שם}, כאן ${USER.business}. שלחתי לך את ההצעה שדיברנו עליה. אשמח לשמוע מה חשבת.` },
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
    q: 'לקוח אמר לי שזה יקר, מה עונים?',
    from: 'התנגדויות, שלב 8',
    a: 'קודם לשאול יקר לעומת מה. אחר כך להזכיר מה יוצא בסוף: מערך שמביא פניות גם בלי ליווי. ואם זה באמת התקציב, יש 3 תשלומים של 2,500 ₪, או הסדנה האישית ב-890 ₪ כצעד ראשון.',
  },
  {
    q: 'מה הצעד הבא שלי?',
    from: 'המסע',
    a: 'אתה בשלב 12, "חדר התרגול". נשארה שיחת תרגול אחת כדי לסיים אותו, ואחריו מחכה הבוט של העסק.',
    aF: 'את בשלב 12, "חדר התרגול". נשארה שיחת תרגול אחת כדי לסיים אותו, ואחריו מחכה הבוט של העסק.',
  },
  {
    q: 'כמה נשאר לי החודש?',
    from: 'המרכז הפיננסי',
    a: 'נכנסו 9,200 ₪ ויצאו 4,350 ₪. עד סוף החודש מחכים עוד 2,500 ₪ מיעל מור, אז כרגע החודש נסגר ב-7,350 ₪ לטובתך.',
  },
  {
    q: 'איזה סרט כדאי לראות הערב?',
    from: 'מחוץ לנושאי העסק',
    a: 'בזה אני פחות עוזר. אני כאן בשביל העסק שלך: לידים, כסף, מכירות והצעד הבא. על מה נעבוד?',
  },
];
export const SHARK_FALLBACK = 'אני כאן לכל שאלה על העסק שלך: לידים, כסף, מכירות, שיווק והצעד הבא. על מה נעבוד?';
