const fs=require('node:fs'),path=require('node:path');const root=path.join(__dirname,'..');let count=0;for(const f of fs.readdirSync(root).filter(f=>f.endsWith('.html'))){const h=fs.readFileSync(path.join(root,f),'utf8');if((h.match(/<h1[ >]/g)||[]).length!==1)throw Error(f+': expected one h1');for(const m of h.matchAll(/(?:href|src)="([^"]+)"/g)){if(/^(https?:|mailto:|tel:|#|data:)/.test(m[1]))continue;if(!fs.existsSync(path.join(root,m[1].split('#')[0])))throw Error(f+': missing '+m[1]);}count++;}console.log(count+' pages: headings and local destinations pass');
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
 if(['index.html','concept-archive.html','concept-limestone.html'].includes(file))assert.equal(html.split(content.mission).length-1,1,file+': mission once');
 assert(!html.match(/<div class="topbar">(.*?)<\/div>/)[1].includes(content.hours),file+': topbar repeats hours');
}
console.log('Heading structure, mission and direct support navigation regressions pass');
