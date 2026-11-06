(() => {
  const event = window.museumEvent;
  if (!event || ![event.headline, event.details, event.endDate].every(value => typeof value === 'string' && value.trim())) return;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(event.endDate)) return;
  const end = new Date(event.endDate + 'T12:00:00Z');
  if (!Number.isFinite(end.getTime()) || end.toISOString().slice(0, 10) !== event.endDate) return;

  const calendar = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago', year: 'numeric', month: '2-digit', day: '2-digit'
  });
  function currentDate() {
    const parts = Object.fromEntries(calendar.formatToParts().map(part => [part.type, part.value]));
    return [parts.year, parts.month, parts.day].join('-');
  }
  if (currentDate() > event.endDate) return;

  const article = document.querySelector('#museum-event');
  let bar;
  if (article) {
    document.title = event.headline + ' | GSHM';
    article.querySelector('h1').textContent = event.headline;
    article.querySelector('.event-empty').hidden = true;
    const details = article.querySelector('.event-details');
    if (/^assets\/[\w/-]+\.(?:jpe?g|png|webp)$/i.test(event.photo) && event.photoAlt?.trim()) {
      const photo = new Image();
      photo.alt = event.photoAlt;
      photo.addEventListener('error', () => photo.remove());
      photo.src = event.photo;
      details.append(photo);
    }
    for (const paragraph of event.details.trim().split(/\n\s*\n/)) {
      const p = document.createElement('p');
      p.textContent = paragraph;
      details.append(p);
    }
  } else {
    bar = document.createElement('a');
    bar.className = 'event-bar';
    bar.href = 'event.html';
    const title = document.createElement('span');
    title.textContent = event.headline;
    const arrow = document.createElement('span');
    arrow.className = 'event-arrow';
    arrow.setAttribute('aria-hidden', 'true');
    arrow.textContent = '→';
    bar.append(title, arrow);
    document.querySelector('.topbar').before(bar);
  }
  function expire() {
    if (currentDate() <= event.endDate) return;
    if (article) location.reload();
    else bar.remove();
    clearInterval(timer);
    window.removeEventListener('pageshow', expire);
    document.removeEventListener('visibilitychange', expire);
  }
  const timer = setInterval(expire, 30000);
  window.addEventListener('pageshow', expire);
  document.addEventListener('visibilitychange', expire);
})();
