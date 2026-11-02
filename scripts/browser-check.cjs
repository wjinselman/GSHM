const {chromium}=require('playwright');
const AxeBuilder=require('@axe-core/playwright').default;
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const root=path.join(__dirname,'..'),out=path.resolve(process.env.QA_OUTPUT || path.join(root,'work/qa'));fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true});
 const results=[],failures=[];const pages=fs.readdirSync(root).filter(x=>x.endsWith('.html'));
 for(const width of [1440,390,320,810,1024]){
 const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
 for(const file of pages){
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url())});
 try{
 await page.goto('http://127.0.0.1:4175/'+file);
 await page.evaluate(async()=>{for(const img of document.images){img.loading='eager';}await Promise.all([...document.images].filter(i=>i.getAttribute('src')).map(i=>i.decode().catch(()=>{})));});
 assert.equal(await page.locator('h1').count(),1,'one H1');
 assert(await page.locator('.photo-close').isHidden(),'closed lightbox hidden');
 assert(!(await page.locator('body').ariaSnapshot()).includes('Close photo'),'closed lightbox absent from accessibility tree');
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'horizontal overflow');
 assert.deepEqual(await page.evaluate(()=>[...document.images].filter(i=>i.getAttribute('src')&&!i.naturalWidth).map(i=>i.src)),[],'broken images');
 const brokenAnchors=await page.evaluate(()=>[...document.querySelectorAll('a[href^="#"]')].filter(a=>!document.getElementById(a.hash.slice(1))).map(a=>a.hash));assert.deepEqual(brokenAnchors,[]);
 if(width<801){await page.locator('.mobile-menu-toggle').click();assert.equal(await page.locator('.mobile-menu-toggle').getAttribute('aria-expanded'),'true');}
 for(const href of ['membership.html','contribute.html'])assert(await page.locator('#main-nav > a[href="'+href+'"]').isVisible(),'direct support link');
 const groups=page.locator('#main-nav details');
 for(let i=0;i<await groups.count();i++){
 const summary=groups.nth(i).locator('summary');await summary.focus();await page.keyboard.press('Enter');assert(await groups.nth(i).evaluate(x=>x.open),'menu opens');assert(await groups.nth(i).locator('a').first().isVisible());
 await page.keyboard.press('Escape');
 if(width<801){assert.equal(await page.locator('.mobile-menu-toggle').getAttribute('aria-expanded'),'false');await page.locator('.mobile-menu-toggle').click();}else assert(!(await groups.nth(i).evaluate(x=>x.open)));
 }
 if(width<801){await page.keyboard.press('Escape');await page.locator('.mobile-quick-nav [data-menu]').click();assert(await page.locator('#mobile-quick-dialog').evaluate(x=>x.open));await page.keyboard.press('Escape');assert(await page.locator('#mobile-quick-dialog').isHidden());await page.waitForTimeout(60);}
 const photos=page.locator('.photo-link');
 for(let i=0;i<await photos.count();i++){
 const photo=photos.nth(i);await photo.focus();await page.keyboard.press('Enter');assert(await page.locator('#photo-dialog').evaluate(x=>x.open));assert(await page.locator('.photo-close').evaluate(x=>x===document.activeElement));
 await page.keyboard.press('Tab');assert(await page.locator('#photo-dialog').evaluate(x=>x.contains(document.activeElement)||document.activeElement===document.body),'background is not focusable while modal');
 await page.locator('.photo-close').click();await page.waitForTimeout(30);assert(await photo.evaluate(x=>x===document.activeElement),'focus return');
 await photo.click();await page.keyboard.press('Escape');assert(await page.locator('.photo-close').isHidden());await page.waitForTimeout(60);
 }
 if(await page.locator('.museum-slideshow').count()){await page.locator('.slide-next').click();assert.equal(await page.locator('.slide-count').innerText(),'2 / 4');await page.locator('.slide-previous').click();assert.equal(await page.locator('.slide-count').innerText(),'1 / 4');assert.equal(await page.locator('.slide-toggle').innerText(),'Play slideshow');}
 let violations=[];
 if(width===1440||width===390){const audit=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();violations=audit.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}));}
 if(violations.length)failures.push({file,width,violations});
 assert.deepEqual(errors,[],'browser errors');
 results.push({file,width,photos:await photos.count(),status:violations.length?'accessibility findings':'pass'});
 if(['index.html','membership.html','explore.html'].includes(file)&&[1440,390].includes(width)){await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.join(out,file.replace('.html','')+'-'+width+'.png'),fullPage:true});}
 }catch(e){failures.push({file,width,error:e.message});console.log('FAIL',file,width,e.message)}finally{await page.close();}
 }
 await context.close();console.log('Completed width',width);
 }
 await browser.close();fs.writeFileSync(path.join(out,'browser-checks.json'),JSON.stringify({results,failures},null,2));console.log(JSON.stringify({checks:results.length,failures},null,2));if(failures.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
