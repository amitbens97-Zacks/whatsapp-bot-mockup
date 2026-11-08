// The shark on the user's own WhatsApp. It has nothing to do with the bot or with step 13:
// it is a contact the user adds once the payment went through, for any question or
// problem in the business. For now it only answers and never writes first.
import { html, useState, useRef, useEffect, Icon, PencilCheck, cx, confetti, money } from './lib.js';
import { Button, Mark, SharkAvatar } from './components.js';
import { Tag } from './ui.js';
import { Phone, QrBox, SharkPic } from './phone.js';
import { USER, SHARK_ASKS, SHARK_FALLBACK, SHARK_CONTACT, SHARK_CODE, PLANS, GENDER, g } from './data.js';

let seq = 500;
const nextId = () => `s${++seq}`;
const NOW = '10:12';

export const READY_TEXT = `היי כריש, ${g('זה', 'זאת')} ${USER.firstName} (${SHARK_CODE})`;

const CAN = [
  ['users', 'הלידים שלך', 'מי מחכה ומי הבא בתור'],
  ['wallet', 'הכסף שלך', 'מה נכנס, מה יצא ומה נשאר'],
  ['handshake', 'מכירות', 'מה עונים למי שמתלבט'],
  ['map', 'המסע', 'מה הצעד הבא שלך'],
];

// ---------- the home page card: locked until the payment ----------

export function SharkCard({ paid, connected, onAdd, onChat, onSettings }) {
  if (!paid)
    return html`<section class="fb-panel relative overflow-hidden !p-4" aria-label="הכריש בוואטסאפ, נעול">
      <p class="mb-1 flex items-center gap-2">
        <span class="relative"><span class="block opacity-50 grayscale"><${SharkAvatar} size=${38} /></span><span class="absolute -bottom-1 -end-1 grid h-5 w-5 place-items-center rounded-full bg-white text-muted ring-1 ring-line"><${Icon} name="lock" size=${12} /></span></span>
        <b class="font-display text-[16px]">הכריש בוואטסאפ</b>
      </p>
      <p class="mb-2 text-[14px] text-muted">שואלים אותו כל שאלה על העסק, ישר מהוואטסאפ שלך.</p>
      <${Tag}><${Icon} name="lock" size=${13} />נפתח אחרי התשלום<//>
    </section>`;
  if (!connected)
    return html`<section class="fb-panel !p-4">
      <p class="mb-1 flex items-center gap-2"><${SharkAvatar} size=${38} /><b class="font-display text-[16px]">הכריש בוואטסאפ</b></p>
      <p class="mb-2 text-[14px]">מוסיפים אותו כמו איש קשר, ושואלים כל שאלה על העסק.</p>
      <${Button} variant="mini" onClick=${onAdd}><${Icon} name="message-circle" size=${15} />להוספה לוואטסאפ<//>
    </section>`;
  return html`<section class="fb-panel !p-4">
    <p class="mb-1 flex items-center gap-2"><${SharkAvatar} size=${38} mood="happy" /><b class="font-display text-[16px]">הכריש בוואטסאפ</b><span class="ms-auto"><${Tag} tone="blue">מחובר<//></span></p>
    <p class="mb-2 text-[14px]">שומר אצלך בוואטסאפ בתור "${SHARK_CONTACT}".</p>
    <div class="flex flex-wrap items-center gap-3">
      <${Button} variant="mini" onClick=${onChat}>לדוגמת שיחה<//>
      <${Button} variant="text" class="!h-auto !p-0 !text-[14px]" onClick=${onSettings}>להגדרות<//>
    </div>
  </section>`;
}

// ---------- the paywall, as it is in the system today ----------

export function Paywall({ onPaid, onBack }) {
  const [cycle, setCycle] = useState('month');
  const [plan, setPlan] = useState('base');
  const [busy, setBusy] = useState(false);
  const t = useRef();
  useEffect(() => () => clearTimeout(t.current), []);
  const pay = () => {
    setBusy(true);
    t.current = setTimeout(onPaid, 900);
  };
  return html`<div class="mx-auto max-w-[880px] px-4 py-5 md:px-8 md:py-8">
    <button type="button" class="mb-3 flex w-fit items-center gap-1 text-[14px] font-bold text-muted hover:text-brand-600 cursor-pointer" onClick=${onBack}><${Icon} name="arrow-right" size=${16} />לדף הבית</button>
    <p class="fb-eyebrow mb-1">שלבים 1 ו-2 מאחוריך</p>
    <h1 class="fb-h1 mb-2 text-[28px] md:text-[34px]">ממשיכים <${Mark}>מכאן<//> יחד</h1>
    <p class="mb-5 max-w-[52ch] text-[17px]">מכאן נפתחים כל שאר השלבים, הכלים, והכריש בוואטסאפ שלך.</p>
    <div class="mb-4 inline-flex rounded-xl border border-line bg-white p-1" role="radiogroup" aria-label="תקופת חיוב">
      ${[
        ['month', 'חודשי'],
        ['year', 'שנתי'],
      ].map(
        ([id, label]) => html`<button key=${id} type="button" role="radio" aria-checked=${cycle === id} class=${cx('h-9 rounded-lg px-4 text-[14px] font-bold cursor-pointer', cycle === id ? 'bg-brand-600 text-white' : 'text-muted hover:text-brand-600')} onClick=${() => setCycle(id)}>${label}</button>`,
      )}
    </div>
    <div class="mb-5 grid gap-3 md:grid-cols-2" role="radiogroup" aria-label="מסלול">
      ${PLANS.map((p) => {
        const on = plan === p.id;
        return html`<button key=${p.id} type="button" role="radio" aria-checked=${on} onClick=${() => setPlan(p.id)} class=${cx('rounded-2xl border-2 bg-white p-4 text-start cursor-pointer', on ? 'border-brand-600 shadow-sm' : 'border-line hover:border-brand-300')}>
          <span class="mb-1 flex items-center gap-2"><b class="font-display text-[19px]">${p.name}</b>${on && html`<span class="ms-auto text-brand-600"><${Icon} name="circle-check" size=${20} /></span>`}</span>
          <span class="block text-[14px] text-muted">${p.sub}</span>
          <span class="mt-2 block font-display text-[26px] font-black">${money(cycle === 'month' ? p.month : p.year)}<small class="ms-1 text-[14px] font-semibold text-muted">${cycle === 'month' ? 'לחודש' : 'לשנה'}</small></span>
        </button>`;
      })}
    </div>
    <${Button} class="w-full md:w-auto" disabled=${busy} onClick=${pay}>${busy ? html`<${Icon} name="loader-circle" size=${18} class="animate-spin" />התשלום עובר...` : html`<${Icon} name="lock" size=${18} />לתשלום מאובטח`}<//>
    <p class="mt-2 text-[12.5px] text-muted">המסך הזה קיים במערכת היום. במוק-אפ הלחיצה מדמה תשלום שעבר.</p>
  </div>`;
}

// ---------- the welcome window, right after the payment ----------

export function SharkWelcome({ phoneLayout, onConnect, onLater, onChat, onClose }) {
  const [step, setStep] = useState('start');
  useEffect(() => {
    const t = setTimeout(() => confetti('step'), 250);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    const k = (e) => e.key === 'Escape' && (step === 'done' ? onClose() : onLater());
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [step]);
  const done = () => {
    setStep('done');
    onConnect();
    confetti('step');
  };
  return html`<div class="fixed inset-0 z-50 grid place-items-end md:place-items-center">
    <div class="absolute inset-0 bg-ink/40"></div>
    <div role="dialog" aria-modal="true" aria-label="הכריש עובר איתך לוואטסאפ" class="pop-in pb-safe thin-scroll relative max-h-[94dvh] w-full overflow-y-auto rounded-t-[24px] bg-canvas md:w-[620px] md:rounded-[22px] md:shadow-2xl">
      <button type="button" aria-label="סגירה" class="absolute end-3 top-3 z-10 rounded-lg p-2 text-muted hover:bg-white cursor-pointer" onClick=${step === 'done' ? onClose : onLater}><${Icon} name="x" size=${18} /></button>
      <div class="bg-brand-100 px-5 pb-4 pt-6 text-center md:px-8">
        <div class="relative mx-auto mb-2 w-fit">
          <${SharkAvatar} size=${phoneLayout ? 96 : 116} mood="happy" />
          <span class="hand absolute -bottom-2 -start-16 rotate-[-6deg] whitespace-nowrap text-[24px]">${step === 'done' ? 'נדבר בוואטסאפ' : 'זמין לך תמיד'}</span>
        </div>
        <p class="fb-eyebrow mb-1">${step === 'done' ? 'הכריש בוואטסאפ שלך' : 'התשלום עבר · הכול פתוח'}</p>
        <h1 class="fb-h1 text-[26px] md:text-[32px]">${step === 'done' ? html`מעכשיו אני <${Mark}>בכיס שלך<//>` : html`הכריש עובר איתך <${Mark}>לוואטסאפ<//>`}</h1>
      </div>
      <div class="px-5 py-4 md:px-8 md:py-5">
        ${step === 'start' &&
        html`<div class="rise">
          <p class="mb-4 text-center text-[17px]">מוסיפים אותו כמו איש קשר, ושואלים כל שאלה או בעיה בעסק, בכל שעה.</p>
          <ul class="mb-5 grid gap-2 sm:grid-cols-2">
            ${CAN.map(
              ([icon, t, s]) => html`<li key=${t} class="flex items-center gap-2.5 rounded-xl bg-white px-3 py-2 ring-1 ring-line">
                <span class="text-brand-600"><${Icon} name=${icon} size=${20} /></span>
                <span class="min-w-0"><b class="block text-[15px]">${t}</b><small class="block text-[13px] text-muted">${s}</small></span>
              </li>`,
            )}
          </ul>
          <div class="flex flex-col items-center gap-2">
            <${Button} class="w-full sm:w-auto" onClick=${() => setStep('qr')}><${Icon} name="message-circle" size=${20} />להוספה לוואטסאפ<//>
            <${Button} variant="text" onClick=${onLater}>אחר כך<//>
          </div>
        </div>`}
        ${step === 'qr' &&
        html`<div class="rise grid items-center gap-5 sm:grid-cols-[auto_1fr]">
          ${!phoneLayout && html`<div class="flex justify-center"><${QrBox} size=${150} /></div>`}
          <div>
            <h2 class="fb-h3 mb-1">שתי לחיצות וזה מוכן</h2>
            <ol class="mb-3 list-decimal space-y-1 ps-5 text-[15px]">
              <li>${phoneLayout ? 'לוחצים על הכפתור, וואטסאפ נפתח' : 'סורקים את הקוד בטלפון, וואטסאפ נפתח'}</li>
              <li>שולחים את ההודעה המוכנה, והכריש עונה</li>
            </ol>
            <p class="mb-3 rounded-xl bg-white px-3 py-2 text-[14px] ring-1 ring-line">ההודעה המוכנה: <b>${READY_TEXT}</b></p>
            <${Button} class="w-full" onClick=${done}><${Icon} name=${phoneLayout ? 'external-link' : 'send'} size=${18} />${phoneLayout ? 'לפתוח בוואטסאפ' : 'שלחתי'}<//>
            <p class="mt-2 text-[12px] text-muted">הקוד מחבר את המספר שלך לחשבון. אפשר לנתק בכל רגע בהגדרות.</p>
          </div>
        </div>`}
        ${step === 'done' &&
        html`<div class="rise flex flex-col items-center gap-3 text-center">
          <p class="flex items-center gap-2 text-[16px] font-bold"><${PencilCheck} size=${20} color="#0038b8" />שמור אצלך בתור "${SHARK_CONTACT}"</p>
          <p class="max-w-[44ch] text-[15px]">אני רק עונה, ולא שולח הודעות ביוזמתי. מה ${g('שתצטרך', 'שתצטרכי')} בעסק, פשוט לכתוב לי.</p>
          <div class="flex flex-wrap justify-center gap-3">
            <${Button} onClick=${onChat}>לדוגמת שיחה<//>
            <${Button} variant="text" onClick=${onClose}>לדף הבית<//>
          </div>
        </div>`}
      </div>
    </div>
  </div>`;
}

// ---------- a sample conversation ----------

const toPhone = (msgs) => msgs.map((m) => ({ id: m.id, side: m.who === 'me' ? 'out' : 'in', text: m.text, time: NOW }));

export function SharkChat({ shark, setShark, onBack }) {
  const [typing, setTyping] = useState(false);
  const t = useRef();
  useEffect(() => () => clearTimeout(t.current), []);
  useEffect(() => {
    if (shark.msgs.length) return;
    setShark((s) => ({
      ...s,
      msgs: [
        { id: nextId(), who: 'me', text: READY_TEXT },
        { id: nextId(), who: 'shark', text: `היי ${USER.firstName}, מעולה שהגעת. אני מכיר את ${USER.business}, את המספרים ואת המסע שלך. מה ${g('שתצטרך', 'שתצטרכי')} בעסק, פשוט לכתוב כאן.` },
      ],
    }));
  }, []);

  const ask = (q, a) => {
    setShark((s) => ({ ...s, msgs: [...s.msgs, { id: nextId(), who: 'me', text: q }] }));
    setTyping(true);
    clearTimeout(t.current);
    t.current = setTimeout(() => {
      setTyping(false);
      setShark((s) => ({ ...s, msgs: [...s.msgs, { id: nextId(), who: 'shark', text: a }] }));
    }, 1100);
  };
  const answerOf = (x) => (GENDER === 'f' && x.aF) || x.a;
  const free = (text) => {
    const hit = SHARK_ASKS.find((x) => x.q === text);
    ask(text, hit ? answerOf(hit) : SHARK_FALLBACK);
  };

  return html`<div class="mx-auto grid h-full max-w-[1020px] gap-5 px-4 py-4 md:grid-cols-[320px_1fr] md:gap-10 md:px-8 md:py-6">
    <${Phone}
      class="h-[520px] md:h-full md:max-h-[600px]"
      name=${SHARK_CONTACT}
      sub="זמין תמיד"
      avatar=${html`<${SharkPic} />`}
      msgs=${toPhone(shark.msgs)}
      typing=${typing}
      onSend=${free}
      placeholder="לשאול את הכריש"
    />
    <div class="min-w-0">
      <button type="button" class="mb-2 flex w-fit items-center gap-1 text-[14px] font-bold text-muted hover:text-brand-600 cursor-pointer" onClick=${onBack}><${Icon} name="arrow-right" size=${16} />לדף הבית</button>
      <h1 class="fb-h2 mb-1">שיחה עם הכריש</h1>
      <p class="mb-3 text-[15px] text-muted">כך זה נראה בוואטסאפ של ${USER.firstName}. חלק מהדוגמאות מהמשך המסע, כשכבר יש לידים וכסף. אותו כריש כמו במערכת, עם אותם נתונים.</p>
      <p class="mb-2 text-[14px] font-bold">אפשר לנסות:</p>
      <div class="flex flex-col gap-2">
        ${SHARK_ASKS.map(
          (x) => html`<button key=${x.q} type="button" class="lp-option !py-2" onClick=${() => ask(x.q, answerOf(x))}>
            <span class="min-w-0 flex-1 text-[15px] font-semibold">${x.q}</span><${Tag}>${x.from}<//>
          </button>`,
        )}
      </div>
      <p class="mt-4 flex items-start gap-2 text-[14px]"><span class="text-brand-600"><${Icon} name="info" size=${17} /></span>הכריש עונה רק כשכותבים לו. הוא לא שולח הודעות ביוזמתו, ולא מדבר עם הלידים.</p>
    </div>
  </div>`;
}

// ---------- settings ----------

export function SharkSettings({ shark, onAdd, onDisconnect }) {
  const on = shark.connected;
  return html`<div class="mx-auto max-w-[760px] px-4 py-5 md:px-8 md:py-6">
    <h1 class="fb-h2 mb-3">הכריש בוואטסאפ</h1>
    <section class="fb-panel !p-4 md:!p-5">
      <p class="mb-3 flex items-center gap-3"><${SharkAvatar} size=${46} /><span><b class="block font-display text-[18px]">${SHARK_CONTACT}</b><small class="text-[14px] text-muted">${on ? `מחובר למספר ${USER.phone}` : 'עוד לא בוואטסאפ שלך'}</small></span>
        <span class="ms-auto"><${Tag} tone=${on ? 'blue' : 'muted'}>${on ? 'מחובר' : 'לא מחובר'}<//></span></p>
      <p class="mb-3 text-[15px]">הכריש עונה לכל שאלה או בעיה בעסק. הוא רק עונה, ולא שולח הודעות ביוזמתו.</p>
      ${on
        ? html`<${Button} variant="secondary" onClick=${onDisconnect}>ניתוק<//>`
        : html`<${Button} onClick=${onAdd}><${Icon} name="message-circle" size=${18} />להוספה לוואטסאפ<//>`}
    </section>
  </div>`;
}
