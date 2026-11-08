// What happens to each message that reaches the FlowBiz number. This file is the rule
// book of the task, in the order production checks it:
//   1. An ended subscription: no bot, the lead gets the business's own number.
//   2. Routing: the code decides the business; no code and no name, no lead.
//   3. "הסר" stops everything for this lead and this business.
//   4. A voice note, image or file: a short "קיבלנו", and the conversation is marked.
//   5. A bot stopped in this conversation, or paused by the user: silence, the user answers.
//   6. A lead asking for a person: the bot stops and says so.
//   7. A first message: the automatic first answer, by the hours.
//   8. A defined answer that fits by meaning: it goes out alone.
//   9. Nothing fits: the holding answer goes out alone ("שאלה טובה, העברתי לשירות
//      לקוחות"), once per open question, and the shark's suggestion waits for the user.
// Matching by meaning is faked here with word lists. Nothing is ever sent as a guess.
import { DAYS, REPLY_TIMES, DRAFTS, FALLBACK_DRAFT, USER, GENDER, OTHER_BUSINESS, openingTexts, g } from './data.js';

const has = (text, words) => words.some((w) => text.includes(w));
const HUMAN = ['נציג', 'בן אדם', 'בנאדם', 'אדם אמיתי', 'לדבר עם', 'לדבר איתך', 'בעל העסק', USER.firstName];
const STOP = ['הסר', 'הסירו', 'תפסיקו', 'לא מעוניין', 'לא מעוניינת', 'stop'];

export const NO_CODE_TEXT = 'היי, הגעת ל-FlowBiz. לאיזה עסק רצית לכתוב? אפשר לכתוב כאן את שם העסק, או ללחוץ שוב על הקישור שקיבלת ממנו.';
export const MEDIA_TEXT = 'קיבלתי. ההודעה אצלי ואחזור אליך בהקדם.';
export const HUMAN_TEXT = `בשמחה. ${USER.firstName} ${g('רואה את ההודעה וחוזר', 'רואה את ההודעה וחוזרת')} אליך ישירות.`;
export const STOP_TEXT = 'הוסרת. לא נשלח לך יותר הודעות מהעסק הזה.';
export const ENDED_TEXT = `העסק לא עונה כאן כרגע. אפשר לכתוב ישירות ל${USER.fullName}: ${USER.phone}`;
export const SWITCH_TEXT = `מעכשיו השיחה עם ${USER.business}, העסק של ${USER.fullName}.`;

export function hoursText(hours) {
  const on = DAYS.filter((d) => hours.days.includes(d.id));
  const days = !on.length ? 'אין ימים' : on.length === 1 ? on[0].label : `${on[0].label} עד ${on[on.length - 1].label}`;
  return `${days}, ${hours.from} עד ${hours.to}`;
}

export const answerText = (ans, config) => {
  if (ans.auto !== 'hours') return ans.a;
  const when = REPLY_TIMES.find((r) => r.id === config.replyTime)?.text || 'עוד היום';
  return `אנחנו זמינים ${hoursText(config.hours)}. הודעות שמגיעות בשעות האלה מקבלות תשובה ${when}.`;
};

// A Hebrew WhatsApp name goes into the greeting; anything else becomes a plain "היי".
export function fillName(text, name, config) {
  const he = /^[֐-׿\s'׳"-]+$/.test(name || '') ? name.split(' ')[0] : '';
  return text.replace(/ \{שם\}/g, he ? ` ${he}` : '').replace(/\{שעות\}/g, hoursText(config.hours));
}

export const openingOf = (config, isOpen) => {
  const base = openingTexts(config.tone, config.replyTime);
  const custom = config.custom || {};
  return isOpen ? custom.open ?? base.open : custom.closed ?? base.closed;
};

export function matchAnswer(text, answers) {
  let best = null;
  let score = 0;
  for (const a of answers) {
    if (a.auto === 'hold' || !a.on || !(a.a || a.auto)) continue;
    const hit = (a.keys || []).filter((k) => text.includes(k)).length;
    if (hit > score) (best = a), (score = hit);
  }
  return best;
}

// The holding answer, when it is on and the lead has no open question waiting already.
export const holdOf = (config, lead) => {
  const h = config.answers.find((a) => a.auto === 'hold');
  return h && h.on && h.a.trim() && !lead.draft ? h.a.trim() : null;
};

// Defined answers, without the holding answer.
export const definedCount = (config) => config.answers.filter((a) => a.auto !== 'hold' && a.on && (a.a || a.auto)).length;

export function draftFor(text) {
  const d = DRAFTS.find((x) => has(text, x.keys)) || FALLBACK_DRAFT;
  return { text: (GENDER === 'f' && d.textF) || d.text, why: d.why, keep: d.keep, q: text };
}

export function decide({ config, isOpen, lead, text, kind = 'text', aiDown, ended }) {
  const t = (text || '').trim();
  const log = [];
  const first = !lead.msgs.some((m) => m.who === 'lead' && !m.other);
  const out = (o) => ({ log, ...o });

  if (ended) {
    log.push('המנוי של העסק הסתיים: הבוט לא עונה, והקישור עובר למספר של המשתמש');
    return out({ action: 'ended', reply: ENDED_TEXT });
  }
  let routedNow = false;
  if (lead.unrouted) {
    if (t.includes(USER.business) || t.includes(USER.code)) {
      log.push(`זוהה העסק: ${USER.business}`, 'נוצר ליד חדש בטבלה של העסק');
      routedNow = true;
    } else {
      log.push('אין קוד ואין שם עסק: לא נוצר ליד, ולאף עסק אין גישה להודעה');
      return out({ action: 'nocode', reply: NO_CODE_TEXT });
    }
  } else if (t.includes(`(${USER.code})`)) {
    log.push(`קוד ${USER.code} זוהה: ${USER.business}`);
    if (lead.other) log.push(`השיחה עוברת מ"${OTHER_BUSINESS.name}" ל"${USER.business}"`);
    else if (first) log.push('נוצר ליד חדש בטבלה של העסק');
  }

  if (has(t.toLowerCase(), STOP)) {
    log.push('הליד הוסר: הבוט לא שולח לו יותר, וגם תבניות חסומות');
    return out({ action: 'stop', reply: STOP_TEXT });
  }
  if (kind !== 'text') {
    log.push('הודעה קולית או קובץ: הבוט לא מנחש מה נאמר', 'השיחה מסומנת למשתמש');
    return out({ action: 'media', reply: MEDIA_TEXT });
  }
  if (lead.paused || config.active === false) {
    log.push(lead.paused ? 'הבוט עצור בשיחה הזו, וההודעה מחכה למשתמש' : 'המשתמש השהה את הבוט: ההודעה מחכה לו, בלי תשובה');
    return out({ action: 'silent' });
  }
  if (has(t, HUMAN)) {
    log.push('הליד ביקש בן אדם: הבוט עוצר בשיחה הזו');
    return out({ action: 'human', reply: HUMAN_TEXT });
  }

  const opening = first || routedNow;
  if (opening) log.push(`מענה ראשוני, ${isOpen ? 'בשעות הפעילות' : 'מחוץ לשעות הפעילות'}: יוצא לבד`);
  // A first message from the link holds no question. Anything else is answered too.
  if (routedNow || t.includes(`(${USER.code})`)) return out({ action: 'opening', opening: true, routedNow });

  const ans = matchAnswer(t, config.answers);
  if (ans) {
    log.push(`יש תשובה מוגדרת, "${ans.q}": יוצאת לבד`);
    return out({ action: 'auto', opening, answer: ans, reply: answerText(ans, config) });
  }
  const hold = holdOf(config, lead);
  if (hold) log.push('אין תשובה מוגדרת: "שאלה טובה, העברתי לשירות לקוחות" יוצא לבד');
  if (aiDown) {
    log.push('הכריש לא זמין: אין הצעה, והשיחה מסומנת למשתמש');
    return out({ action: 'nodraft', opening, reply: hold, replyTag: 'hold' });
  }
  log.push(hold ? 'הכריש כותב הצעה שמחכה לאישור' : 'אין תשובה מוגדרת: הכריש כותב הצעה שמחכה לאישור', 'התראה למשתמש: פעמון, כרטיס בדף הבית ומייל');
  return out({ action: 'draft', opening, draft: draftFor(t), reply: hold, replyTag: 'hold' });
}

// "לענות על זה לבד מעכשיו": a draft the user approved becomes a defined answer.
export function answerFromDraft(question, text, keep) {
  const words = (question || '').replace(/[?.,!]/g, ' ').split(/\s+/).filter((w) => w.length > 2);
  return { id: `own-${Date.now()}`, q: keep || question, a: text, on: true, fromStep: 'נוסף מתשובה לליד', keys: words };
}
