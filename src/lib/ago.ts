// Words every <time data-ago> (Ago.astro) again while the page stays open:
// one timer, every 30 s while a time under an hour shows, every 5 minutes
// otherwise, stopped while the tab is hidden.
import { TIME_TEXT, type TimeKind } from './format';

const HOUR = 3_600_000;
let timer = 0;

function tick() {
  const now = Date.now();
  let fresh = false;
  for (const el of document.querySelectorAll<HTMLTimeElement>('time[data-ago]')) {
    const text = TIME_TEXT[el.dataset.ago as TimeKind]?.(el.dateTime, now);
    if (text && el.textContent !== text) el.textContent = text;
    fresh ||= now - Date.parse(el.dateTime) < HOUR;
  }
  timer = window.setTimeout(tick, fresh ? 30_000 : 300_000);
}

function restart() {
  clearTimeout(timer);
  if (!document.hidden) tick();
}

document.addEventListener('visibilitychange', restart);
// A page back from the browser's cache shows the words it left with.
addEventListener('pageshow', (e) => e.persisted && restart());
tick();
