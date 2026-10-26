
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
 function label(){toggle.textContent=userPaused?'Play slideshow':'Pause slideshow';}
 function show(next,announce=true){index=(next+slides.length)%slides.length;slides.forEach((slide,i)=>slide.hidden=i!==index);count.textContent=(index+1)+' / '+slides.length;if(announce)status.textContent='Photo '+(index+1)+' of '+slides.length+': '+slides[index].querySelector('h3').textContent;}
 function manual(step){userPaused=true;show(index+step);label();schedule();}
 controls.hidden=false;show(0,false);label();
 toggle.addEventListener('click',()=>{userPaused=!userPaused;label();schedule();});
 carousel.querySelector('.slide-previous').addEventListener('click',()=>manual(-1));
 carousel.querySelector('.slide-next').addEventListener('click',()=>manual(1));
 carousel.addEventListener('mouseenter',()=>{hovered=true;schedule();});
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
