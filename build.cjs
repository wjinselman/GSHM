// Build the review site from the central content file. No packages required.
const fs = require('node:fs');
const path = require('node:path');
const root = __dirname;
const crypto = require('node:crypto');
// Changed seasonal files receive new URLs so browsers cannot reuse an old theme.
const versionedAsset = file => file+'?v='+crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file),'utf8').replace(/\r\n/g,'\n')).digest('hex').slice(0,12);
const d = JSON.parse(fs.readFileSync(path.join(root,'content.json'),'utf8'));
const {street,city,state,stateName,zip,country}=d.location;
const address=street+', '+city+', '+state+' '+zip;
const digits=d.phone.replace(/\D/g,'');
const phoneLink='tel:+'+(digits.length===10?'1':'')+digits;
const generalEmail=d.contacts[0][1];
const dayNames=d.openingHours.days;
function clockLabel(time) {
 const [hour,minutes]=time.split(':').map(Number);
 return (hour%12||12)+(minutes?':'+String(minutes).padStart(2,'0'):'')+(hour<12?' a.m.':' p.m.');
}
const contiguous=dayNames.every((day,i)=>i===0||['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].indexOf(day)===['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].indexOf(dayNames[i-1])+1);
const days=contiguous&&dayNames.length>1?dayNames[0]+'–'+dayNames.at(-1):dayNames.join(', ');
const hours=days+' · '+clockLabel(d.openingHours.opens)+'–'+clockLabel(d.openingHours.closes);
const values={name:d.name,phone:d.phone,address,hours,closed:d.closed,admission:d.admission,phoneLink,generalMail:'mailto:'+generalEmail,mapLink:'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(address)};
function resolve(text) {
 return String(text??'').replace(/\{(\w+)\}/g,(_,key)=>{
  if(!Object.hasOwn(values,key))throw Error('Unknown content field: '+key);
  return values[key];
 });
}
const esc = s => resolve(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function url(s) { s=resolve(s); if (!/^(https:\/\/|mailto:|tel:|[a-zA-Z0-9][a-zA-Z0-9._/-]*$)/.test(s) || s.includes('..')) throw Error('Invalid URL: '+s); return esc(s); }
const link = (label,href,cls='text-link') => '<a class="'+cls+'" href="'+url(href)+'">'+esc(label)+'<span aria-hidden="true"> '+(resolve(href).startsWith('https:')?'↗':'→')+'</span></a>';
function primaryNavigation(current) {
 const navLink = (id, label, cls='') => '<a'+(cls?' class="'+cls+'"':'')+' href="'+(id==='home'?'index':id)+'.html"'+(id===current?' aria-current="page"':'')+'>'+esc(label)+'</a>';
 const groups = d.navigation.groups.map(group=>{
  const pages=group.pages.map(id=>d.pages.find(p=>p.id===id)).filter(Boolean);
  if(pages.length===1) return navLink(pages[0].id,group.title);
  return '<details name="museum-navigation" class="nav-disclosure'+(group.pages.includes(current)?' nav-active':'')+'"><summary>'+esc(group.title)+'<span class="nav-chevron" aria-hidden="true"></span></summary><div class="nav-panel">'+pages.map(p=>navLink(p.id,p.label)).join('')+'</div></details>';
 });
 return navLink('home','Home','home-link')+groups.join('')+navLink('membership','Membership','support-link')+navLink('contribute','Give','support-link')+navLink('contact','Contact');
}
function header(current){return '<a class="skip" href="#main">Skip to content</a><div class="topbar"><span>'+esc(city+', '+stateName)+'</span><a href="visit.html">'+esc(d.admission)+' · Plan your visit</a></div><header class="header"><a class="brand" href="index.html" aria-label="Greater Southwest Historical Museum home"><img src="assets/logo.svg" alt="Greater Southwest Historical Museum oak tree logo" width="990" height="252"></a><nav id="main-nav" class="compact-nav" aria-label="Main navigation">'+primaryNavigation(current)+'</nav></header>';}
function footer(){return '<section class="closing"><div><p class="eyebrow">Your next chapter starts here</p><h2>Come discover your connection.</h2></div>'+link('Plan your visit','visit.html','button light')+'</section><footer><div class="footer-top"><div><img class="footer-logo" src="assets/logo.svg" alt="Greater Southwest Historical Museum" width="990" height="252"><p>'+esc(address)+'</p>'+link(d.phone,phoneLink)+'</div><div><h2>Visit the museum</h2><p>'+esc(hours)+'<br>'+esc(d.closed)+'<br><strong>'+esc(d.admission)+'</strong></p></div><div><h2>Stay connected</h2>'+link('Email the museum',values.generalMail)+'<br>'+link('Follow on Facebook','https://www.facebook.com/gshmuseum')+'</div></div><nav class="footer-links" aria-label="All museum pages">'+d.pages.map(p=>'<a href="'+p.id+'.html">'+esc(p.label)+'</a>').join('')+'</nav><div class="footer-bottom"><span>A nonprofit museum preserving the stories of South Central Oklahoma.</span></div></footer>';}
function metadata(label,current) {
 const page=d.pages.find(p=>p.id===current);
 const title=(current==='home'?'':label+' | ')+d.name+' | '+city+', '+stateName;
 const description=page?.intro||(current==='home'?'Explore South Central Oklahoma history at the historic armory in '+city+'. Find visitor information, exhibits and free admission.':'Read the latest event announcement from '+d.name+'.');
 const site=new URL(d.siteUrl);
 const location=new URL(current==='home'?'./':(page?.id||'event')+'.html',site).href;
 const image=new URL(page?.headingPhoto||d.hero.src,site).href;
 const schema={'@context':'https://schema.org','@type':'Museum','@id':site.href+'#museum',name:d.name,url:site.href,telephone:phoneLink.slice(4),email:generalEmail,image:new URL(d.hero.src,site).href,address:{'@type':'PostalAddress',streetAddress:street,addressLocality:city,addressRegion:state,postalCode:zip,addressCountry:country},openingHoursSpecification:{'@type':'OpeningHoursSpecification',dayOfWeek:dayNames.map(v=>'https://schema.org/'+v),opens:d.openingHours.opens,closes:d.openingHours.closes}};
 const og={title,description,type:'website',site_name:d.name,url:location,image};
 return '<title>'+esc(title)+'</title><meta name="description" content="'+esc(description)+'"><link rel="icon" href="assets/oak-tree.svg" type="image/svg+xml">'+Object.entries(og).map(([key,value])=>'<meta property="og:'+key+'" content="'+esc(value)+'">').join('')+(current==='home'?'<script type="application/ld+json">'+JSON.stringify(schema).replace(/</g,'\\u003c')+'</script>':'');
}
function shell(title,body,current='',theme='heritage'){return '<!doctype html><html lang="en" data-theme="'+theme+'"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex,nofollow"><meta http-equiv="Content-Security-Policy" content="default-src \'self\'; img-src \'self\' data:; style-src \'self\'; script-src \'self\'; connect-src \'none\'; object-src \'none\'; base-uri \'none\'; form-action \'none\'">'+metadata(title,current)+''+(current==='home'?'<link rel="preload" as="image" fetchpriority="high" href="'+url(d.hero.src)+'"'+responsivePhoto(d.hero.src,'100vw','image')+'>':'')+'<link rel="stylesheet" href="'+versionedAsset('styles.css')+'"><link rel="stylesheet" href="'+versionedAsset('appearance.css')+'"><link rel="stylesheet" href="'+versionedAsset('mobile.css')+'" media="screen and (max-width:800px)"><link rel="stylesheet" href="' +versionedAsset('seasonal.css')+'"><script defer src="current-event.js"></script><script defer src="'+versionedAsset('event.js')+'"></script><script defer src="'+versionedAsset('site.js')+'"></script><script defer src="'+versionedAsset('seasonal.js')+'"></script>'+(current==='home' && theme==='heritage'?'<link rel="stylesheet" href="'+versionedAsset('community-cabin.css')+'"><link rel="stylesheet" href="'+versionedAsset('desktop-slideshow.css')+'" media="screen and (min-width:801px)">':'')+''+(current==='visit'?'<link rel="stylesheet" href="'+versionedAsset('visit-sign.css')+'">':'')+'</head><body>'+header(current)+body+footer()+'<dialog id="photo-dialog" aria-label="Expanded museum photograph"><button type="button" class="photo-close" autofocus>Close photo ✕</button><img alt=""><p></p></dialog></body></html>';}
const cards = d.home.cards;
// Use smaller copies of the same photograph where available.
function responsivePhoto(src, sizes, prefix = '') {
 const widths = d.imageWidths?.[src];
 if (!widths) return '';
 const stem = src.replace(/\.jpg$/, '');
 const candidates = widths.map(width => url(stem+'-'+width+'.webp')+' '+width+'w');
 return ' '+prefix+'srcset="'+candidates.join(', ')+'" '+prefix+'sizes="'+sizes+'"';
}
function card(c){return '<article class="card"><picture><img loading="lazy" src="assets/'+c[3]+'"'+responsivePhoto('assets/'+c[3], '(max-width: 800px) 92vw, 410px')+' alt="'+esc(c[5])+'" width="1200" height="600"></picture><div><p class="eyebrow">'+esc(c[1])+'</p><h3>'+esc(c[2])+'</h3>'+link(c[4],c[0]+'.html')+'</div></article>';}
function slideshow(){
 const s=d.home.slideshow;if(!s?.slides?.length)return '';
 return '<section id="museum-highlights" class="museum-slideshow section" aria-roledescription="carousel" aria-label="Museum highlights" data-interval="'+Math.max(6000,Number(s.intervalMs)||8000)+'"><div class="slideshow-heading"><div><p class="eyebrow">'+esc(s.eyebrow)+'</p><h2>'+esc(s.title)+'</h2></div><p>A little preview of what’s waiting for you.</p></div><div class="slides">'+s.slides.map((p,i)=>'<figure class="museum-slide'+(p.fullPhoto?' full-photo':'')+'" role="group" aria-roledescription="slide" aria-label="'+(i+1)+' of '+s.slides.length+'"><img '+(i?'loading="lazy"':'loading="eager"')+' src="'+url(p.src)+'"'+responsivePhoto(p.src, '(max-width: 800px) 92vw, (max-width: 1200px) 90vw, 1100px')+' alt="'+esc(p.alt)+'" width="1600" height="800"><figcaption><h3>'+esc(p.title)+'</h3><p>'+esc(p.caption)+'</p></figcaption></figure>').join('')+'</div><div class="slideshow-controls" hidden><button type="button" class="slide-toggle">Pause slideshow</button><div class="slide-navigation"><button type="button" class="slide-previous" aria-label="Previous museum photo">← Previous</button><span class="slide-count">1 / '+s.slides.length+'</span><button type="button" class="slide-next" aria-label="Next museum photo">Next →</button></div></div><span class="sr-only slide-status" aria-live="polite" aria-atomic="true"></span></section>';
}

function home(){
const theme='heritage';
return shell('Welcome','<main id="main"><section class="hero"><img class="hero-image" src="'+url(d.hero.src)+'"'+responsivePhoto(d.hero.src, '100vw')+' alt="'+esc(d.hero.alt)+'" fetchpriority="high" width="1900" height="710"><div class="hero-shade"></div><div class="hero-masthead"><div class="hero-brandmark"><h1 class="museum-name"><img src="assets/logo.svg" alt="Greater Southwest Historical Museum" width="990" height="252"></h1><p>'+esc(d.home.mastheadCaption)+'</p></div></div><div class="hero-copy"><p>'+esc(d.home.intro)+'</p><div class="actions">'+link('Plan your visit','visit.html','button')+link('Explore the museum','explore.html','button outline')+'</div></div><div class="hero-foot"><span>'+esc(d.home.heroCaption)+'</span><a href="#discover">Discover what’s inside ↓</a></div></section><section class="visit-strip" aria-label="Visitor essentials"><div><span>Come on in</span><strong>'+esc(d.admission)+'</strong></div><div><span>Make time for history</span><strong>'+esc(hours)+'</strong></div><div><span>Find us in '+esc(city)+'</span><a href="visit.html">'+esc(street)+' ↗</a></div></section><div class="heritage-landscape">'+slideshow()+'<section id="discover" class="section"><div class="section-heading"><div><p class="eyebrow">A place for curious minds</p><h2>'+d.home.welcomeTitleLines.map(esc).join('<br>')+'</h2></div><p>'+esc(d.home.welcomeText)+'</p></div><div class="cards">'+cards.map(card).join('')+'</div></section><section class="story section"><div class="photo-frame"><img loading="lazy" src="'+url(d.home.storyPhoto.src)+'"'+responsivePhoto(d.home.storyPhoto.src, '(max-width: 800px) 92vw, 620px')+' alt="'+esc(d.home.storyPhoto.alt)+'" width="1900" height="710"><span>Strong roots, South Central Oklahoma</span></div><div><p class="eyebrow">A landmark with a purpose</p><h2>History worth<br>holding on to.</h2><p>'+esc(d.mission)+'</p>'+link('Get to know the museum','about.html')+'</div></section><section class="program-section section"><div class="section-heading"><div><p class="eyebrow">Learning, together</p><h2>Make a little history.</h2></div>'+link('All learning programs','education.html')+'</div><div class="program-grid">'+d.home.programs.map(p=>'<article><img loading="lazy" src="'+url(p.photo)+'" alt="'+esc(p.alt)+'" width="900" height="600"><div><p class="eyebrow">'+esc(p.eyebrow)+'</p><h3>'+esc(p.title)+'</h3><p>'+esc(p.text)+'</p>'+link(p.linkLabel,p.id+'.html')+'</div></article>').join('')+'</div></section><section class="support section"><p class="eyebrow">Keep the stories going</p><h2>A museum belongs<br>to its community.</h2><p>Become a member, support an educational program, or gather here for your next event. There’s more than one way to be part of the story.</p><div class="actions">'+link('Become a member','membership.html','button')+link('Give to the museum','contribute.html','button secondary')+link('Rent a space','rent.html','button secondary')+'</div></section></div></main>','home',''+theme);
}
function gallery(photos){if(!photos?.length)return '';return '<section class="gallery" aria-label="Museum photographs">'+photos.map(p=>'<figure><a class="photo-link" href="'+url(p.src)+'" data-caption="'+esc(p.caption||'')+'"><img src="'+url(p.src)+'" alt="'+esc(p.alt)+'" loading="lazy" width="1200" height="700"><span class="photo-label">View larger photo +</span></a>'+(p.caption?'<figcaption>'+esc(p.caption)+'</figcaption>':'')+'</figure>').join('')+'</section>';}
function photoAlbums(albums = []) {
  return albums.map(album => '<section class="museum-album"><h2>' + esc(album.title) + '</h2>' + gallery(album.photos) + '</section>').join('');
}
function page(p){
const sections=p.sections.map(s=>'<section class="content-section"><h2>'+esc(s.title)+'</h2>'+(s.text?'<p>'+esc(s.text)+'</p>':'')+(s.items?'<ul class="rates">'+s.items.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>':'')+(s.action?'<div class="actions">'+link(s.action.label,s.action.href,'button')+'</div>':'')+(s.links?'<div class="link-list">'+s.links.map(([l,h])=>link(l,h)).join('')+'</div>':'')+'</section>').join('');
const contacts=p.id==='contact'?'<div class="contacts">'+d.contacts.map(([n,e])=>'<section><h2>'+esc(n)+'</h2><a href="mailto:'+esc(e)+'">'+esc(e)+'</a></section>').join('')+'</div>':'';
return shell(p.label,'<main id="main"><div class="page-heading'+(p.headingPhoto?' page-heading-photo':'')+'" data-page="'+esc(p.id)+'">'+(p.headingPhoto?'<img class="heading-photo" src="'+url(p.headingPhoto)+'" alt="'+esc(p.headingPhotoAlt||'')+'" width="1900" height="710">':'')+'<div class="page-heading-inner"><nav class="breadcrumbs" aria-label="Breadcrumb"><a href="index.html">Home</a><span aria-hidden="true"> / </span><span>'+esc(p.label)+'</span></nav><p class="eyebrow">'+esc(p.eyebrow)+'</p><h1>'+esc(p.label)+'</h1><p class="page-tagline">'+esc(p.title)+'</p><p class="intro">'+esc(p.intro)+'</p></div></div><div class="inner-landscape"><div class="page-layout"><div class="page-content">'+sections+contacts+'</div><aside class="visit-aside"><p class="eyebrow">A warm welcome awaits</p><h2>Plan your visit</h2><p><strong>'+esc(d.admission)+'</strong></p><p>'+esc(address)+'</p>'+link('Visitor information','visit.html','button')+link('Call '+d.phone,phoneLink)+'</aside></div>'+gallery(p.photos)+photoAlbums(p.albums)+'</div></main>',p.id);
}
const appearance=d.appearance||{};
const colors=['paper','surface','green','ink','muted','line','soft','accent'].map(k=>{
const v=appearance[k];if(v&&!/^#[a-fA-F0-9]{6}$/.test(v))throw Error('Invalid appearance color: '+k);
return v?'--'+k+':'+v+';':'';
}).join('');
const map=appearance.mapImage;url(map);
const opacity=Math.min(.3,Math.max(.08,Number(appearance.mapOpacity)||.22));
fs.writeFileSync(path.join(root,'appearance.css'),':root[data-theme="heritage"]{'+colors+'}\n:root{--map-image:url('+JSON.stringify(map)+');--map-opacity:'+opacity+'}');

if (appearance.mobileMapImage) {
 const smallMap = url(appearance.mobileMapImage);
 fs.appendFileSync(path.join(root,'appearance.css'),'\n@media (max-width:800px){:root{--map-image:url('+JSON.stringify(smallMap)+')}}\n');
}

// Per-page photographic framing, maintained with the page content.
fs.appendFileSync(path.join(root,"appearance.css"),d.pages.filter(p=>p.headingPhoto).map(p=>{if(!/^[a-z-]+$/.test(p.id)||!/^([a-z]+|[0-9]+%)( ([a-z]+|[0-9]+%))?$/.test(p.headingPhotoPosition)||!["contain","cover"].includes(p.headingPhotoFit))throw Error("Invalid header framing");return `.page-heading-photo[data-page="${p.id}"] .heading-photo{object-fit:${p.headingPhotoFit};object-position:${p.headingPhotoPosition}}`;}).join("\n"));

fs.writeFileSync(path.join(root,'index.html'),home());
d.pages.forEach(p=>fs.writeFileSync(path.join(root,p.id+'.html'),page(p)));
fs.writeFileSync(path.join(root,'event.html'),shell('Museum update','<main id="main" class="section event-page"><article id="museum-event"><a href="index.html">Museum home</a><h1>Museum update</h1><p class="event-empty">There is no current announcement.</p><div class="event-details"></div></article></main>'));
console.log('Built '+(d.pages.length+2)+' HTML pages.');
