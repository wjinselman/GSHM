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
 // URL-only presentation previews: never saved to storage or applied to others.
 const requested = new URLSearchParams(location.search).get('season');
 let preview = ['none',...Object.values(seasons)].includes(requested) ? requested : null;
 if(preview) document.querySelectorAll('a[href]').forEach(link => {
  const target = new URL(link.getAttribute('href'),location.href);
  const siteRoot = new URL('.',location.href).pathname;
  if(target.origin === location.origin && target.pathname.startsWith(siteRoot) &&
     (target.pathname.endsWith('.html') || target.pathname === siteRoot)) {
   target.searchParams.set('season',preview);link.href = target.href;
  }
 });
 const preferenceKey = 'gshm-hide-seasonal-decorations';
 const readPreference = () => {try {return localStorage.getItem(preferenceKey) === 'true';} catch {return false;}};
 let hideDecorations = readPreference();
 const toggle = document.createElement('button');
 toggle.type = 'button';toggle.className = 'seasonal-toggle';
 document.querySelector('.footer-bottom')?.append(toggle);
 toggle.addEventListener('click',() => {
  hideDecorations = !(hideDecorations || preview === 'none');
  try {if(hideDecorations)localStorage.setItem(preferenceKey,'true');else localStorage.removeItem(preferenceKey);} catch {}
  // Showing decorations from the plain preview returns to the automatic schedule.
  if(!hideDecorations && preview === 'none') {
   preview = null;
   const current = new URL(location.href);current.searchParams.delete('season');history.replaceState(null,'',current);
   document.querySelectorAll('a[href]').forEach(link => {
    const target = new URL(link.getAttribute('href'),location.href);
    if(target.origin === location.origin && target.pathname.startsWith(new URL('.',location.href).pathname) && target.searchParams.get('season') === 'none') {
     target.searchParams.delete('season');link.href = target.href;
    }
   });
  }
  refresh();
 });
 window.addEventListener('storage',event => {if(event.key === preferenceKey || event.key === null){hideDecorations=readPreference();refresh();}});
 const root = document.documentElement;
 let timer;
 function refresh() {
  clearTimeout(timer);
  const season = seasonForDate(new Date(),hideDecorations ? 'none' : (preview || settings.mode));
  toggle.textContent = hideDecorations || preview === 'none' ? 'Show seasonal decorations' : 'Hide seasonal decorations';
  if(season) root.dataset.season = season;
  else delete root.dataset.season;
  // Check at the next minute boundary, including local midnight. Returning tabs
  // refresh immediately even when the browser suspended their background timers.
  if(!document.hidden) timer = setTimeout(refresh, 60000 - Date.now() % 60000);
 }
 document.addEventListener('visibilitychange',refresh);
 window.addEventListener('pageshow',() => {hideDecorations=readPreference();refresh();});
 refresh();
})();
