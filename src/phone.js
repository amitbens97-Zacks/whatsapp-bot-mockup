// WhatsApp as people really see it: this is the one place in the mockup that keeps
// WhatsApp's own colors instead of the brand's, since it shows WhatsApp itself.
import { html, useState, useEffect, useRef, Icon, cx } from './lib.js';

export function Typing() {
  return html`<div class="wa-bubble wa-in !px-3 !py-2.5" aria-label="מקליד"><i class="wa-dot"></i> <i class="wa-dot"></i> <i class="wa-dot"></i></div>`;
}

export function Bubble({ side, text, time, kind }) {
  return html`<div class=${cx('wa-bubble rise', side === 'out' ? 'wa-out' : 'wa-in')}>
    ${kind === 'voice'
      ? html`<span class="flex items-center gap-2 py-1"><${Icon} name="mic" size=${16} /><span class="h-1 w-24 rounded-full bg-[#8696a0]"></span><span class="text-[11px]">0:14</span></span>`
      : text}
    <span class="wa-time">${time}${side === 'out' ? ' ✓✓' : ''}</span>
  </div>`;
}

// msgs: [{ id, side: 'in' | 'out', text, time, kind }] or [{ id, day: 'היום' }].
export function Phone({ name, sub, avatar, msgs, typing, onSend, placeholder = 'הודעה', class: cls = '', frame = true, disabled, footer }) {
  const box = useRef();
  const [text, setText] = useState('');
  useEffect(() => {
    if (box.current) box.current.scrollTop = box.current.scrollHeight;
  }, [msgs.length, typing]);
  const send = () => {
    const t = text.trim();
    if (!t || disabled) return;
    setText('');
    onSend(t);
  };
  return html`<div class=${cx('flex min-h-0 flex-col overflow-hidden bg-white', frame && 'rounded-[30px] border-[9px] border-ink shadow-[0_24px_50px_-26px_rgba(45,62,102,.55)]', cls)}>
    <div class="wa-head flex h-14 shrink-0 items-center gap-2 px-2.5">
      <${Icon} name="arrow-right" size=${18} />
      <span class="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full bg-white">${avatar}</span>
      <span class="min-w-0 flex-1 leading-tight">
        <b class="block truncate text-[15px]">${name}</b>
        <small class="block truncate text-[11.5px] opacity-80">${typing ? 'מקליד...' : sub}</small>
      </span>
      <${Icon} name="ellipsis-vertical" size=${18} />
    </div>
    <div ref=${box} class="wa-screen thin-scroll flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto p-2.5">
      ${msgs.map((m) =>
        m.day
          ? html`<span key=${m.id} class="wa-day">${m.day}</span>`
          : html`<${Bubble} key=${m.id} side=${m.side} text=${m.text} time=${m.time} kind=${m.kind} />`,
      )}
      ${typing && html`<${Typing} />`}
    </div>
    ${footer}
    ${onSend &&
    html`<div class="wa-input flex shrink-0 items-center gap-1.5 p-1.5">
      <input
        class="h-9 min-w-0 flex-1 rounded-full border-0 bg-white px-3.5 text-[14px] text-[#111b21] outline-none"
        value=${text}
        placeholder=${placeholder}
        aria-label="הודעה"
        disabled=${disabled}
        onInput=${(e) => setText(e.target.value)}
        onKeyDown=${(e) => e.key === 'Enter' && send()}
      />
      <button type="button" aria-label="שליחה" onClick=${send} class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#00a884] text-white cursor-pointer"><${Icon} name="send-horizontal" size=${17} class="rotate-180" /></button>
    </div>`}
  </div>`;
}

export const FlowBizAvatar = () => html`<img src="assets/flowbiz-mark-color.png" alt="" class="h-7 w-7 object-contain" />`;
export const SharkPic = () => html`<img src="assets/shark/shark-calm-sm.svg" alt="" class="h-full w-full object-cover" />`;

// A stand-in for the QR code the user scans from the computer.
export function QrBox({ size = 132 }) {
  return html`<span class="relative block overflow-hidden rounded-xl bg-white p-2 ring-1 ring-line" style=${{ width: `${size}px`, height: `${size}px` }} aria-label="קוד QR לדוגמה" role="img">
    <span class="wa-qr block h-full w-full opacity-90"></span>
    <span class="absolute left-1/2 top-1/2 grid h-9 w-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-lg bg-white"><${FlowBizAvatar} /></span>
  </span>`;
}
