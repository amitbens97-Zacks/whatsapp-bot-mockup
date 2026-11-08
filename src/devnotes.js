// Developer notes for task 4, plus a jump list of every screen (Shift+D).
import { html, Icon, cx } from './lib.js';
import { GENDER, setDemoGender } from './data.js';
import { CASES } from './state.js';

export const JUMPS = [
  { id: 'opening', label: 'שלב 13: מסך פתיחה' },
  { id: 'link', label: 'חלק 1: הקישור' },
  { id: 'hours', label: 'חלק 2: שעות פעילות' },
  { id: 'opening_msg', label: 'חלק 3: מענה ראשוני' },
  { id: 'answers', label: 'חלק 4: תשובות אוטומטיות' },
  { id: 'test', label: 'חלק 5: בדיקה' },
  { id: 'done', label: 'סיום השלב והפרק' },
  { id: 'live', label: 'הלידים והשיחות' },
  { id: 'home', label: 'דף הבית' },
  { id: 'settings', label: 'הגדרות' },
];

const NOTES = [
  {
    title: 'מה יש כאן',
    items: [
      'הבוט: המענה האוטומטי של FlowBiz ללידים של המשתמש. עובד על מספר FlowBiz אחד לכל המשתמשים, ומוגדר בשלב 13.',
      'העסק לדוגמה: קליניקה פרטית של מטפל רגשי, "מרחב שקט".',
      'הכריש בוואטסאפ האישי של המשתמש הוא דבר נפרד, במוק-אפ משלו (shark.html). הוא לא קשור לשלב 13 ולא מדבר עם לידים.',
    ],
  },
  {
    title: 'ניתוב',
    items: [
      'קישור קצר לכל עסק: danielcohen.flowbiz.co.il/wa, עם נתיב לכל מקור (wa/cbt). הוא מעביר ל-wa.me עם הודעה מוכנה שכוללת קוד עסק.',
      'הקישור לא נכנס לבד לשום מקום. המשתמש מסמן: דף העסק ודפי ההצעות, פליירים, פוסטים ממכונת התוכן, ביו. רק המסומנים משתנים, בסיום השלב או בשמירה בהגדרות. לביו אין גישה, אז נוצרת משימה עם הקישור להעתקה.',
      'הקוד בהודעה הראשונה קובע את העסק ואת המקור. משתמש עם כמה עסקים מקבל קוד לכל עסק.',
      'ליד חוזר נשאר עם העסק האחרון. קוד של עסק אחר מעביר את השיחה, ושולח שורה שמציינת עם מי השיחה עכשיו.',
      'בלי קוד: הבוט שואל לאיזה עסק. לא נוצר ליד, ואין גישה להודעה לאף עסק.',
      'כל עסק רואה רק את ההודעות שנכתבו אליו.',
    ],
  },
  {
    title: 'מה יוצא לבד',
    items: [
      'מענה ראשוני, ותשובות שהמשתמש הגדיר או השאיר פעילות. הן יוצאות בלי אישור, גם כשהשאלה מנוסחת אחרת.',
      'ההתאמה לפי משמעות. בלי התאמה ברורה לא שולחים תשובה מהרשימה.',
      'במקום זה יוצאת לבד תשובת העברה: "שאלה טובה, העברתי לשירות לקוחות." פעם אחת לכל שאלה פתוחה, ניתנת לעריכה ולכיבוי בחלק 4. במקביל הכריש מכין הצעה שמחכה לאישור. תשובת ההעברה יוצאת גם כשהכריש לא זמין.',
      'המוקאפ מדמה את ההתאמה ברשימות מילים (src/engine.js). סדר הבדיקות שם הוא הסדר המחייב.',
    ],
  },
  {
    title: 'מקור הטקסטים',
    items: [
      'שעות וימים: "אני והעסק" (שלב 2). מדיניות ביטולים: ההצעה (שלב 8), מוצגת ולא נשאלת שוב. מחירים ומה כלול: הסל (שלב 3).',
      'הטון: דף המסרים (שלב 7), והבחירה בחלק 3. הצעות הכריש מקבלות גם את היסטוריית השיחה.',
      'שם הליד מהפרופיל בוואטסאפ נכנס לברכה רק כשהוא בעברית. אחרת "היי" בלבד.',
    ],
  },
  {
    title: 'התראות',
    items: [
      'פעמון, כרטיס "הלידים שלי" בדף הבית, ומייל אחד לשיחה עד שפותחים אותה. אין התראה בוואטסאפ, כי הכריש לא יוזם.',
    ],
  },
  {
    title: 'וואטסאפ',
    items: [
      'אפשר לענות בטקסט חופשי עד 24 שעות מההודעה האחרונה של הליד. אחרי זה רק תבנית מאושרת.',
      'התבניות הן של FlowBiz ואחידות לכולם. אין יותר ניהול תבניות לכל משתמש.',
      'כפתור "להמשיך מהוואטסאפ שלי" פותח wa.me אל הליד מהמספר הפרטי של המשתמש.',
    ],
  },
];

export function DevPanel({ open, onClose, onJump, onCase, onReset, after14, setAfter14, isOpen, setIsOpen }) {
  return html`<aside
    class=${cx(
      'fixed inset-y-0 end-0 z-[70] flex w-full max-w-sm flex-col border-s border-slate-200 bg-white shadow-2xl transition-transform duration-200',
      open ? 'translate-x-0' : '-translate-x-full pointer-events-none invisible',
    )}
    aria-hidden=${!open}
  >
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
            ([id, name, sub]) => html`<button
              key=${id}
              type="button"
              role="radio"
              aria-checked=${GENDER === id}
              onClick=${() => GENDER !== id && setDemoGender(id)}
              class=${cx('rounded-lg border px-3 py-1.5 text-start cursor-pointer', GENDER === id ? 'border-brand-600 bg-brand-100 text-brand-600' : 'border-brand-200 bg-white text-brand-900')}
            ><b class="block text-[14px]">${name}</b><small class="text-[12px]">${sub}</small></button>`,
          )}
        </div>
        <label class="mt-3 flex cursor-pointer items-center gap-2 font-semibold"><input type="checkbox" class="h-4 w-4 accent-brand-600" checked=${after14} onChange=${(e) => setAfter14(e.target.checked)} />שלב 14 נפתח: טבלת לידים מלאה</label>
        <label class="mt-1 flex cursor-pointer items-center gap-2 font-semibold"><input type="checkbox" class="h-4 w-4 accent-brand-600" checked=${!isOpen} onChange=${(e) => setIsOpen(!e.target.checked)} />עכשיו מחוץ לשעות הפעילות</label>
        <button type="button" class="mt-2 text-[13px] font-bold text-brand-600 underline underline-offset-2 cursor-pointer" onClick=${onReset}>לאפס את כל הנתונים</button>
      </section>
      <section class="mb-4 rounded-xl border border-dashed border-brand-300 bg-brand-50/60 p-3">
        <h3 class="mb-2 font-bold text-brand-900">מעבר מהיר בין המסכים</h3>
        <div class="flex flex-col gap-1.5">
          ${JUMPS.map(
            (j) => html`<button key=${j.id} type="button" onClick=${() => onJump(j.id)} class="rounded-lg border border-brand-200 bg-white px-2.5 py-1 text-start text-[13px] font-semibold hover:bg-brand-50 cursor-pointer">${j.label}</button>`,
          )}
        </div>
      </section>
      <section class="mb-5 rounded-xl border border-dashed border-brand-300 bg-brand-50/60 p-3">
        <h3 class="mb-2 font-bold text-brand-900">מקרי קצה</h3>
        <div class="flex flex-col gap-1.5">
          ${CASES.map(
            (c) => html`<button key=${c.id} type="button" onClick=${() => onCase(c.id)} class="rounded-lg border border-brand-200 bg-white px-2.5 py-1 text-start text-[13px] font-semibold hover:bg-brand-50 cursor-pointer">${c.label}</button>`,
          )}
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
