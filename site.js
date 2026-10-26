
'use strict';
document.documentElement.classList.add('js');
const dialog = document.querySelector('#photo-dialog');
if (dialog && typeof dialog.showModal === 'function') {
 document.querySelectorAll('.photo-link').forEach(link => link.addEventListener('click', event => {
  event.preventDefault();
  const picture = link.querySelector('img');
  dialog.querySelector('img').src = picture.src;
  dialog.querySelector('img').alt = picture.alt;
  dialog.querySelector('p').textContent = link.dataset.caption || '';
  dialog.showModal();
 }));
 dialog.querySelector('button').addEventListener('click', () => dialog.close());
 dialog.addEventListener('click', event => { if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();} });
}

document.querySelectorAll('.museum-slideshow').forEach(carousel => {
 const slides=[...carousel.querySelectorAll('.museum-slide')],controls=carousel.querySelector('.slideshow-controls');
 if(slides.length<2)return;
 const toggle=carousel.querySelector('.slide-toggle'),count=carousel.querySelector('.slide-count'),status=carousel.querySelector('.slide-status');
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 let index=0,userPaused=motion.matches,hovered=false,visible=false,timer;
 const interval=Math.max(6000,Number(carousel.dataset.interval)||8000);
 function schedule(){clearTimeout(timer);if(!userPaused&&!hovered&&visible&&!document.hidden)timer=setTimeout(()=>{show(index+1,false);schedule();},interval);}
 function label(){toggle.textContent=userPaused?'Play slideshow':'Pause slideshow';toggle.dataset.paused=String(userPaused);toggle.dataset.mobileLabel=userPaused?'Play':'Pause';toggle.setAttribute('aria-label',toggle.textContent);}
 function show(next,announce=true){index=(next+slides.length)%slides.length;slides.forEach((slide,i)=>{slide.hidden=i!==index;slide.setAttribute('aria-hidden',String(i!==index));});count.textContent=(index+1)+' / '+slides.length;if(announce)status.textContent='Photo '+(index+1)+' of '+slides.length+': '+slides[index].querySelector('h3').textContent;}
 function manual(step){userPaused=true;show(index+step);label();schedule();}
 controls.hidden=false;show(0,false);label();
 toggle.addEventListener('click',()=>{userPaused=!userPaused;label();schedule();});
 carousel.querySelector('.slide-previous').addEventListener('click',()=>manual(-1));
 carousel.querySelector('.slide-next').addEventListener('click',()=>manual(1));
 carousel.addEventListener('mouseenter',()=>{hovered=matchMedia('(hover: hover)').matches;schedule();});
 carousel.addEventListener('mouseleave',()=>{hovered=false;schedule();});
 carousel.addEventListener('focusin',e=>{if(e.target!==toggle){userPaused=true;label();schedule();}});
 carousel.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();manual(e.key==='ArrowLeft'?-1:1);}});
 document.addEventListener('visibilitychange',schedule);
 motion.addEventListener('change',()=>{if(motion.matches){userPaused=true;label();schedule();}});
 if('IntersectionObserver' in window)new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;schedule();},{threshold:.3}).observe(carousel);
 else{visible=true;schedule();}
});


const navigationGroups=[...document.querySelectorAll('.nav-disclosure')];
navigationGroups.forEach(group=>{
 group.addEventListener('toggle',()=>{if(group.open)navigationGroups.forEach(other=>{if(other!==group)other.open=false;});});
 group.addEventListener('focusout',()=>{setTimeout(()=>{if(!group.contains(document.activeElement))group.open=false;},0);});
});
document.addEventListener('click',event=>navigationGroups.forEach(group=>{if(!group.contains(event.target))group.open=false;}));
document.addEventListener('keydown',event=>{if(event.key==='Escape'){const opened=navigationGroups.find(group=>group.open);if(opened){opened.open=false;opened.querySelector('summary').focus();}}});

// Enhance the mobile header without hiding navigation when JavaScript is unavailable.
const mobileNav=document.querySelector('.header .compact-nav');
if(mobileNav){
 const header=mobileNav.closest('.header'),phone=matchMedia('(max-width: 800px)');
 const trigger=document.createElement('button');
 trigger.type='button';trigger.className='mobile-menu-toggle';
 trigger.setAttribute('aria-controls',mobileNav.id);trigger.setAttribute('aria-expanded','false');
 trigger.innerHTML='<span aria-hidden="true" class="mobile-menu-icon"></span><span>Menu</span>';
 header.insertBefore(trigger,mobileNav);header.classList.add('mobile-nav-ready');
 function closeMenu(returnFocus=false){mobileNav.classList.remove('mobile-open');trigger.setAttribute('aria-expanded','false');navigationGroups.forEach(group=>group.open=false);if(returnFocus)trigger.focus();}
 trigger.addEventListener('click',()=>{const open=trigger.getAttribute('aria-expanded')==='true';if(open)closeMenu();else{mobileNav.classList.add('mobile-open');trigger.setAttribute('aria-expanded','true');}});
 document.addEventListener('click',event=>{if(phone.matches&&!header.contains(event.target))closeMenu();});
 // Capture Escape so one keypress returns the visitor to the compact header.
 header.addEventListener('keydown',event=>{if(event.key==='Escape'&&phone.matches&&mobileNav.classList.contains('mobile-open')){event.preventDefault();event.stopPropagation();closeMenu(true);}});
 mobileNav.addEventListener('click',event=>{if(phone.matches&&event.target.closest('a'))closeMenu();});
 phone.addEventListener('change',()=>{const focusInside=mobileNav.contains(document.activeElement);closeMenu(phone.matches&&focusInside);});
}


/* Mobile scroll reveals and contextual navigation. No content depends on these enhancements. */
(()=>{
 const phone=matchMedia('(max-width:800px)'),motion=matchMedia('(prefers-reduced-motion:reduce)');
 const header=document.querySelector('.header'),source=document.querySelector('#main-nav');
 if(!header||!source)return;
 const dock=document.createElement('nav');dock.className='mobile-quick-nav';dock.hidden=true;dock.setAttribute('aria-label','Quick navigation');
 dock.innerHTML='<a href="index.html" aria-label="Museum home"><img class="quick-nav-tree" src="assets/oak-tree.svg" alt="" width="30" height="34"><span>Home</span></a><button type="button" data-top>Top <span aria-hidden="true">↑</span></button><button type="button" data-menu aria-haspopup="dialog" aria-controls="mobile-quick-dialog">Menu <span aria-hidden="true">☰</span></button>';
 const panel=document.createElement('dialog');panel.id='mobile-quick-dialog';panel.className='mobile-quick-dialog';panel.setAttribute('aria-labelledby','mobile-quick-title');
 panel.innerHTML='<div class="mobile-quick-heading"><h2 id="mobile-quick-title">Explore the museum</h2><button type="button" class="mobile-quick-close" aria-label="Close menu">✕</button></div>';
 const links=source.cloneNode(true);links.removeAttribute('id');links.className='mobile-quick-links';links.setAttribute('aria-label','Museum pages');links.querySelectorAll('[id]').forEach(e=>e.removeAttribute('id'));links.querySelectorAll('details').forEach(e=>{e.open=false;e.removeAttribute('name');});panel.append(links);
 document.body.append(dock,panel);
 const menu=dock.querySelector('[data-menu]');
 const smooth=()=>motion.matches?'instant':'smooth';
 dock.querySelector('[data-top]').addEventListener('click',()=>{window.scrollTo({top:0,behavior:smooth()});const brand=header.querySelector(document.body.classList.contains('home-identity-preview')&&phone.matches?'.mobile-menu-toggle':'.brand');brand?.focus({preventScroll:true});});
 menu.addEventListener('click',()=>{if(typeof panel.showModal==='function'){panel.showModal();document.documentElement.classList.add('mobile-menu-modal');}else{window.scrollTo({top:0,behavior:smooth()});document.querySelector('.mobile-menu-toggle')?.click();}});
 panel.querySelector('.mobile-quick-close').addEventListener('click',()=>panel.close());
 panel.addEventListener('close',()=>{document.documentElement.classList.remove('mobile-menu-modal');if(phone.matches&&!dock.hidden)menu.focus({preventScroll:true});});
 panel.addEventListener('click',e=>{if(e.target===panel){const r=panel.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)panel.close();}if(e.target.closest('a'))panel.close();});
 links.querySelectorAll('details').forEach(group=>group.addEventListener('toggle',()=>{if(group.open)links.querySelectorAll('details').forEach(other=>{if(other!==group)other.open=false;});}));
 let observer;
 function updateDock(){dock.hidden=!phone.matches;}
 const seen=new WeakSet();
 function reveals(){observer?.disconnect();document.querySelectorAll('.mobile-reveal').forEach(e=>e.classList.remove('mobile-reveal'));
  if(!phone.matches||motion.matches||!('IntersectionObserver' in window))return;
  observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.remove('mobile-reveal');seen.add(entry.target);observer.unobserve(entry.target);}}),{threshold:0,rootMargin:'0px 0px -32px 0px'});
  document.querySelectorAll('.slideshow-heading,.section-heading,.card,.photo-frame,.story>div:last-child,.program-grid article,.support,.home-mission,.content-section,.visit-aside,.gallery figure').forEach(e=>{if(!seen.has(e)&&e.getBoundingClientRect().top>innerHeight){e.classList.add('mobile-reveal');observer.observe(e);}});
 }
 function sync(){if(!phone.matches&&panel.open)panel.close();updateDock();reveals();}
 phone.addEventListener('change',sync);motion.addEventListener('change',reveals);sync();
})();

/* Homepage mobile composition; existing desktop and interior headers stay intact. */
if(document.querySelector('.hero .museum-name')){
 document.body.classList.add('home-identity-preview');
 const admission=document.createElement('a');
 admission.className='home-mobile-admission';admission.href='visit.html';admission.textContent='Free admission';
 document.querySelector('.header').prepend(admission);
}
/* Keep the same navigation controls while arranging homepage actions for phones. */
if(document.body.classList.contains('home-identity-preview')){
 const homeHeader=document.querySelector('.header'),hero=document.querySelector('.hero'),actions=hero.querySelector('.actions'),nav=homeHeader.querySelector('nav');
 const headerSlot=document.createComment('Desktop header position'),actionSlot=document.createComment('Desktop hero actions position');
 homeHeader.before(headerSlot);actions.before(actionSlot);
 const phoneLayout=matchMedia('(max-width:800px)');
 function arrangeHomeActions(){
  if(phoneLayout.matches){hero.querySelector('.hero-masthead').after(homeHeader);nav.before(actions);}
  else{headerSlot.after(homeHeader);actionSlot.after(actions);}
 }
 phoneLayout.addEventListener('change',arrangeHomeActions);arrangeHomeActions();
}
