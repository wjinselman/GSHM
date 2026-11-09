const fs=require('node:fs'),path=require('node:path');const root=path.join(__dirname,'..');let count=0;for(const f of fs.readdirSync(root).filter(f=>f.endsWith('.html'))){const h=fs.readFileSync(path.join(root,f),'utf8');if((h.match(/<h1[ >]/g)||[]).length!==1)throw Error(f+': expected one h1');for(const m of h.matchAll(/(?:href|src)="([^"]+)"/g)){if(/^(https?:|mailto:|tel:|#|data:)/.test(m[1]))continue;if(!fs.existsSync(path.join(root,m[1].split(/[?#]/)[0])))throw Error(f+': missing '+m[1]);}count++;}console.log(count+' pages: headings and local destinations pass');
const assert=require('node:assert/strict');
const content=JSON.parse(fs.readFileSync(path.join(root,'content.json'),'utf8'));
for(const file of fs.readdirSync(root).filter(f=>f.endsWith('.html'))){
 const html=fs.readFileSync(path.join(root,file),'utf8');
 assert.equal((html.match(/<\/h1>/g)||[]).length,1,file+': expected one closing h1');
 const navigation=html.match(/<nav id="main-nav"[^>]*>(.*?)<\/nav>/)[1];
 for(const destination of ['membership.html','contribute.html']){
  assert.equal(navigation.split('href="'+destination+'"').length-1,1,file+': support link should occur once');
  assert(navigation.replace(/<details.*?<\/details>/g,'').includes('href="'+destination+'"'),file+': support link outside dropdown');
 }
 if(file==='index.html')assert.equal(html.split(content.mission).length-1,1,file+': mission once');
 assert(!html.match(/<div class="topbar">(.*?)<\/div>/)[1].includes('a.m.'),file+': topbar repeats hours');
}
console.log('Heading structure, mission and direct support navigation regressions pass');

for(const file of fs.readdirSync(root).filter(f=>f.endsWith('.html'))){const html=fs.readFileSync(path.join(root,file),'utf8');for(const asset of ['styles.css','appearance.css','mobile.css','seasonal.css','seasonal.js',...(file==='index.html'?['desktop-slideshow.css','community-cabin.css']:[])]){const hash=require('node:crypto').createHash('sha256').update(fs.readFileSync(path.join(root,asset),'utf8').replace(/\r\n/g,'\n')).digest('hex').slice(0,12);assert(html.includes(asset+'?v='+hash),file+': stale seasonal asset version');}}

// Nov 6 museum review changes.
for(const file of fs.readdirSync(root).filter(f=>f.endsWith('.html'))){
 const html=fs.readFileSync(path.join(root,file),'utf8');
 assert(!html.includes('href="board.html"'),file+': hide the board page from navigation');
 assert(html.includes('A nonprofit museum preserving the stories of South Central Oklahoma.'),file+': nonprofit descriptor');
 assert(!html.includes('tree-only.css'), file+': obsolete styles');
}
for(const name of ['Wesley Hull','Cassandra Normile','Caitlin Vanet'])assert(fs.readFileSync(path.join(root,'contact.html'),'utf8').includes(name),'missing contact '+name);
console.log('Museum review checks passed');
const publishedPages = fs.readdirSync(root).filter(file=>file.endsWith('.html'));
const descriptions = new Set();
for (const file of publishedPages) {
 const html = fs.readFileSync(path.join(root,file),'utf8');
 const description = html.match(/<meta name="description" content="([^"]+)"/)[1];
 assert(!descriptions.has(description), file+': duplicate description');
 descriptions.add(description);
 assert(html.includes('property="og:image"') && html.includes('rel="icon"'), file+': missing metadata');
 assert(!/\{(address|hours|generalMail|phoneLink|mapLink|phone|admission)\}/.test(html), file+': unresolved content');
}
const homepage = fs.readFileSync(path.join(root,'index.html'),'utf8');
const museum = JSON.parse(homepage.match(/<script type="application\/ld\+json">([^<]+)<\/script>/)[1]);
assert.equal(museum['@type'],'Museum');
assert.equal(museum.address.streetAddress, content.location.street);
assert.equal(museum.openingHoursSpecification.opens, content.openingHours.opens);
for (const file of ['board.html','review.html','concept-archive.html','concept-limestone.html']) assert(!publishedPages.includes(file));
console.log('Visitor-only routes, social metadata and structured museum data pass');
