/* Annual museum decorations. Use 'none' to disable or a season name to override. */
(() => {
 'use strict';
 const settings = {mode:'auto', timeZone:'America/Chicago'};
 const seasons = {10:'october', 11:'november', 12:'december'};
 function seasonForDate(date = new Date(), mode = settings.mode, timeZone = settings.timeZone) {
  if(mode === 'none') return '';
  if(Object.values(seasons).includes(mode)) return mode;
  if(mode !== 'auto') return '';
  try {
   const month = Number(new Intl.DateTimeFormat('en-US', {timeZone, month:'numeric'}).format(date));
   return seasons[month] || '';
  } catch { return ''; }
 }
 if(typeof module !== 'undefined' && module.exports) module.exports = {seasonForDate};
 if(typeof document === 'undefined') return;
 const root = document.documentElement;
 const decorations = [];
 const greetings = [];
 // Separate decorative layers never change image sources, layout or link targets.
 document.querySelectorAll('.hero,.page-heading,.closing').forEach(host => {
  const accent = document.createElement('span');
  accent.className = 'seasonal-accent';
  accent.setAttribute('aria-hidden','true');
  host.append(accent);decorations.push(accent);
  if(host.classList.contains('hero')) {
   const leaves = document.createElement('span');
   leaves.className = 'seasonal-leaves';leaves.setAttribute('aria-hidden','true');
   host.append(leaves);decorations.push(leaves);
   const greeting = document.createElement('span');
   greeting.className = 'seasonal-greeting';greeting.textContent = 'Happy Fall, Y’all';
   host.append(greeting);greetings.push(greeting);
  }
  if(!host.classList.contains('closing')) {
   const trim = document.createElement('span');
   trim.className = 'seasonal-trim';trim.setAttribute('aria-hidden','true');
   host.append(trim);decorations.push(trim);
  }
 });
 let timer;
 function refresh() {
  clearTimeout(timer);
  const season = seasonForDate();
  if(season) root.dataset.season = season;
  else delete root.dataset.season;
  decorations.forEach(el => {el.hidden = !season;});
  greetings.forEach(el => {el.hidden = season !== 'november';});
  // Check at the next minute boundary, including local midnight. Returning tabs
  // refresh immediately even when the browser suspended their background timers.
  if(!document.hidden) timer = setTimeout(refresh, 60000 - Date.now() % 60000);
 }
 document.addEventListener('visibilitychange',refresh);
 window.addEventListener('pageshow',refresh);
 refresh();
})();
