// The home page, only what this task changes on it: the "הלידים שלי" card now shows who
// waits for an approval, a line about the bot, and a way back to the shark for whoever
// skipped it after the payment.
import { html, Icon, cx } from './lib.js';
import { Button, SharkAvatar } from './components.js';
import { Tag } from './ui.js';
import { USER, STEP } from './data.js';
import { needsYou } from './leads.js';

export function Home({ state, go, onLead }) {
  const leads = state.leads.filter((l) => !l.unrouted);
  const waiting = leads.filter(needsYou);
  const drafts = leads.filter((l) => l.draft).length;
  const auto = leads.flatMap((l) => l.msgs).filter((m) => ['opening', 'auto'].includes(m.tag)).length;
  const show = [...leads].sort((a, b) => needsYou(b) - needsYou(a)).slice(0, 4);
  return html`<div class="mx-auto max-w-[1040px] px-4 py-5 md:px-8 md:py-7">
    <h1 class="fb-h1 mb-1 text-[28px] md:text-[36px]">בוקר טוב, ${USER.firstName}</h1>
    <p class="mb-5 text-[16px]">${USER.business} · ${waiting.length ? `${waiting.length} ${waiting.length === 1 ? 'ליד מחכה' : 'לידים מחכים'} לך` : 'אין לידים שמחכים לך'}</p>
    <section class="fb-panel mb-5 flex flex-wrap items-center gap-4 !p-4 md:!p-5">
      <span class="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand-100 text-brand-600"><${Icon} name=${STEP.icon} size=${24} /></span>
      <span class="min-w-0 flex-1">
        <small class="fb-eyebrow block">${state.config.done ? `סיימת את פרק ${STEP.chapterNo}` : `הצעד הבא · פרק ${STEP.chapterNo}, ${STEP.chapter}`}</small>
        <b class="block font-display text-[20px]">שלב ${STEP.n}: ${STEP.name}</b>
      </span>
      <${Button} class="!h-11 !text-[16px]" onClick=${() => go({ view: 'step', screen: state.config.done ? 'done' : 'opening' })}>${state.config.done ? 'לסיכום השלב' : 'להתחיל'}<${Icon} name="arrow-left" size=${18} /><//>
    </section>
    <div class="grid items-start gap-5 md:grid-cols-[1.4fr_0.6fr]">
      <section class="fb-panel !p-0 overflow-hidden">
        <div class="flex items-center justify-between gap-2 px-4 pb-2 pt-4">
          <h2 class="fb-h3">הלידים שלי</h2>
          <span class="flex items-center gap-2">
            ${drafts > 0 && html`<${Tag} tone="blue">${drafts} לאישור שלך<//>`}
            <button type="button" class="text-[14px] font-bold text-brand-600 underline underline-offset-2 cursor-pointer" onClick=${() => go({ view: 'live' })}>לכל השיחות</button>
          </span>
        </div>
        <ul>
          ${show.map(
            (l) => html`<li key=${l.id} class="border-t border-line">
              <button type="button" class="flex w-full items-center gap-3 px-4 py-2.5 text-start hover:bg-brand-50 cursor-pointer" onClick=${() => onLead(l.id)}>
                <span class="min-w-0 flex-1">
                  <b class="block truncate text-[15px]">${l.name}</b>
                  <small class="block truncate text-[13px] text-muted">${l.draft ? `הכריש הכין תשובה: "${l.draft.q}"` : l.source}</small>
                </span>
                ${needsYou(l) ? html`<${Tag} tone="blue">מחכה לך<//>` : html`<${Tag}>${l.status}<//>`}
                <${Icon} name="chevron-left" size=${16} class="text-muted" />
              </button>
            </li>`,
          )}
        </ul>
      </section>
      <div class="flex flex-col gap-4">
        <section class="fb-panel !p-4">
          <h2 class="fb-h3 mb-1 flex items-center gap-2"><span class=${cx('h-2.5 w-2.5 rounded-full', state.ended || !state.config.active ? 'bg-error' : 'bg-brand-600')}></span>הבוט של העסק</h2>
          <p class="mb-2 text-[14px]">${state.ended ? 'מושהה, המנוי הסתיים' : state.config.active ? `פעיל · ${auto === 1 ? 'הודעה אחת יצאה' : `${auto} הודעות יצאו`} לבד` : 'מושהה'}</p>
          <${Button} variant="text" class="!h-auto !p-0" onClick=${() => go({ view: 'settings', tab: 'bot' })}>להגדרות הבוט<//>
        </section>
        ${!state.shark.connected &&
        html`<section class="fb-panel !p-4">
          <p class="mb-1 flex items-center gap-2"><${SharkAvatar} size=${34} /><b class="font-display text-[16px]">הכריש בוואטסאפ</b></p>
          <p class="mb-2 text-[14px]">אפשר להוסיף אותו כמו איש קשר, ולשאול כל שאלה על העסק.</p>
          <${Button} variant="mini" onClick=${() => go({ view: 'shark' })}>להוספה<//>
        </section>`}
      </div>
    </div>
  </div>`;
}
