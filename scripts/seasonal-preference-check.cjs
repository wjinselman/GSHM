const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const base=process.env.QA_BASE||'http://127.0.0.1:4175';
(async()=>{
 const browser=await chromium.launch();
 try{
  for(const width of [390,1440]){
   const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
   const page=await context.newPage();await page.clock.install({time:new Date('2026-11-15T12:00:00Z')});
   await page.goto(base+'/?season=december');
   const toggle=page.locator('.seasonal-toggle');
   assert.equal(await page.locator('html').getAttribute('data-season'),'december');
   await toggle.evaluate(el=>el.click());assert.equal(await toggle.textContent(),'Show seasonal decorations');
   assert.equal(await page.locator('html').getAttribute('data-season'),null);
   assert.equal(await page.locator('.museum-name').evaluate(e=>getComputedStyle(e,'::after').backgroundImage),'none');
   await page.reload();assert.equal(await page.locator('html').getAttribute('data-season'),null);
   await page.goto(base+'/membership.html');assert.equal(await page.locator('html').getAttribute('data-season'),null);
   const other=await context.newPage();await other.goto(base+'/?season=october');assert.equal(await other.locator('html').getAttribute('data-season'),null);
   await toggle.evaluate(el=>el.click());assert.equal(await toggle.textContent(),'Hide seasonal decorations');
   assert.equal(await page.locator('html').getAttribute('data-season'),'november');
   await other.waitForFunction(()=>document.documentElement.dataset.season==='october');
   await page.reload();assert.equal(await page.locator('html').getAttribute('data-season'),'november');
   await page.goto(base+'/?season=none');assert.equal(await toggle.textContent(),'Show seasonal decorations');
   await toggle.evaluate(el=>el.click());assert.equal(await page.locator('html').getAttribute('data-season'),'november');assert(!new URL(page.url()).searchParams.has('season'));
   assert.equal(await page.locator('a[href*="season=none"]').count(),0);
   await context.close();
  }
  const blocked=await browser.newContext();await blocked.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new Error('Storage unavailable')}})});
  const page=await blocked.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(base+'/?season=december');await page.locator('.seasonal-toggle').evaluate(el=>el.click());assert.equal(await page.locator('html').getAttribute('data-season'),null);await page.locator('.seasonal-toggle').evaluate(el=>el.click());assert.equal(await page.locator('html').getAttribute('data-season'),'december');assert.deepEqual(errors,[]);await blocked.close();
  console.log('Seasonal preference: keyboard, hide/show, navigation/reload persistence, cross-tab sync, previews, and unavailable storage pass');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
