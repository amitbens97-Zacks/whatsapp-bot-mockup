// The shark on the user's own WhatsApp. It has nothing to do with the bot: it is a
// contact the user adds right after the payment screen, for any question or problem in
// the business. For now it only answers and never writes first.
import { html, useState, useRef, useEffect, Icon, PencilCheck } from './lib.js';
import { Button, Mark, SharkAvatar } from './components.js';
import { Tag } from './ui.js';
import { Phone, QrBox, SharkPic } from './phone.js';
import { USER, SHARK_ASKS, SHARK_FALLBACK, SHARK_CONTACT, SHARK_CODE, GENDER, g } from './data.js';
import { nextId, NOW } from './state.js';

const CAN = [
  ['users', 'הלידים שלך', 'מי מחכה ומי הבא בתור'],
  ['wallet', 'הכסף שלך', 'מה נכנס, מה יצא ומה נשאר'],
  ['handshake', 'מכירות', 'מה עונים ללקוח שמתלבט'],
  ['map', 'המסע', 'מה הצעד הבא שלך'],
];

// The screen right after a successful payment.
export function SharkAfterPay({ connected, onConnect, onSkip, onChat, phoneLayout }) {
  const [step, setStep] = useState(connected ? 'done' : 'start');
  return html`<div class="mx-auto grid max-w-[1120px] items-center gap-8 px-4 py-6 md:grid-cols-[1.1fr_0.9fr] md:gap-12 md:px-8 md:py-10">
    <div>
      <p class="fb-eyebrow mb-1">התשלום עבר · הכול פתוח</p>
      <h1 class="fb-h1 mb-3 text-[28px] md:text-[36px]">הכריש עובר איתך <${Mark}>לוואטסאפ<//></h1>
      <p class="mb-5 max-w-[46ch] text-[18px] text-ink">מוסיפים אותו כמו איש קשר, ושואלים אותו כל שאלה או בעיה בעסק, בכל שעה.</p>
      <ul class="mb-6 grid gap-2 sm:grid-cols-2">
        ${CAN.map(
          ([icon, t, s]) => html`<li key=${t} class="flex items-center gap-2.5 rounded-xl bg-white/70 px-3 py-2 ring-1 ring-line">
            <span class="text-brand-600"><${Icon} name=${icon} size=${20} /></span>
            <span class="min-w-0"><b class="block text-[15px]">${t}</b><small class="block text-[13px] text-muted">${s}</small></span>
          </li>`,
        )}
      </ul>
      ${step === 'start' &&
      html`<div class="flex flex-wrap items-center gap-3">
        <${Button} onClick=${() => setStep('qr')}><${Icon} name="message-circle" size=${20} />להוספה לוואטסאפ<//>
        <${Button} variant="text" onClick=${onSkip}>אחר כך<//>
      </div>`}
      ${step === 'done' &&
      html`<div class="rise flex flex-wrap items-center gap-3">
        <${Tag} tone="blue"><${PencilCheck} size=${14} color="#0038b8" />הכריש בוואטסאפ שלך<//>
        <${Button} variant="secondary" onClick=${onChat}>לדוגמת שיחה<//>
      </div>`}
    </div>

    <div class="flex justify-center">
      ${step === 'qr'
        ? html`<div class="fb-panel rise w-full max-w-[380px]">
            <h2 class="fb-h3 mb-1">שתי לחיצות וזה מוכן</h2>
            <ol class="mb-4 list-decimal space-y-1 ps-5 text-[15px]">
              <li>${phoneLayout ? 'לוחצים על הכפתור, וואטסאפ נפתח' : 'סורקים את הקוד בטלפון, וואטסאפ נפתח'}</li>
              <li>שולחים את ההודעה המוכנה, והכריש עונה</li>
            </ol>
            ${!phoneLayout && html`<div class="mb-3 flex justify-center"><${QrBox} /></div>`}
            <p class="mb-3 rounded-xl bg-canvas px-3 py-2 text-[14px]">ההודעה המוכנה: <b>היי כריש, ${g('זה', 'זאת')} ${USER.firstName} (${SHARK_CODE})</b></p>
            <${Button} class="w-full" onClick=${() => (setStep('done'), onConnect())}><${Icon} name="send" size=${18} />שלחתי<//>
            <p class="mt-2 text-center text-[12px] text-muted">הקוד מחבר את המספר הזה לחשבון שלך. אפשר לנתק בכל רגע בהגדרות.</p>
          </div>`
        : html`<div class="relative pb-8">
            <${SharkAvatar} size=${150} mood=${step === 'done' ? 'happy' : 'calm'} />
            <span class="hand absolute bottom-0 right-2 rotate-[-4deg] whitespace-nowrap text-[26px]">זמין לך תמיד</span>
          </div>`}
    </div>
  </div>`;
}

const toPhone = (msgs) => msgs.map((m) => ({ id: m.id, side: m.who === 'me' ? 'out' : 'in', text: m.text, time: NOW }));

// A sample conversation. The examples are from later in the journey, when there are leads.
export function SharkChat({ shark, setShark }) {
  const [typing, setTyping] = useState(false);
  const t = useRef();
  useEffect(() => () => clearTimeout(t.current), []);
  useEffect(() => {
    if (shark.msgs.length) return;
    setShark((s) => ({
      ...s,
      msgs: [
        { id: nextId(), who: 'me', text: `היי כריש, ${g('זה', 'זאת')} ${USER.firstName} (${SHARK_CODE})` },
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
      <h1 class="fb-h2 mb-1">שיחה עם הכריש</h1>
      <p class="mb-3 text-[15px] text-muted">דוגמה מהמשך המסע, כשכבר יש לידים. אותו כריש כמו במערכת, עם אותם נתונים.</p>
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
