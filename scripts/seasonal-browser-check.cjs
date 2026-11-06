const {chromium} = require('playwright');
const AxeBuilder = require('@axe-core/playwright').default;
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const out = path.resolve(process.env.QA_OUTPUT || path.join(__dirname,'../work/seasonal-qa'));
fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser = await chromium.launch();
 let checks = 0;
 try {
  for(const width of [320,390,810,1440]) {
   const context = await browser.newContext({viewport:{width,height:900},timezoneId:'Asia/Tokyo',reducedMotion:'reduce'});
   for(const file of ['index.html','membership.html','explore.html']) {
    const page = await context.newPage();
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.clock.install({time:new Date('2027-01-15T12:00:00Z')});
    await page.goto('http://127.0.0.1:4175/'+file);
    await page.evaluate(async()=>{for(const i of document.images)i.loading='eager';await Promise.all([...document.images].filter(i=>i.getAttribute('src')).map(i=>i.decode().catch(()=>{})));});
    const baseHeight = await page.evaluate(()=>document.body.scrollHeight);
    for(const [month,season] of [[10,'october'],[11,'november'],[12,'december']]) {
     await page.clock.setSystemTime(new Date(`2026-${month}-15T12:00:00Z`));
     await page.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));
     assert.equal(await page.locator('html').getAttribute('data-season'),season);
     if(file==='index.html') assert((await page.locator('.museum-name').evaluate(e=>getComputedStyle(e,'::after').backgroundImage)).includes('season-oak-'),'tree decoration visible');
     assert.equal(await page.evaluate(()=>document.body.scrollHeight),baseHeight,'decorations must not change page layout');
     assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
     assert(!(await page.locator('.seasonal-accent').first().isVisible()),'no corner decoration');
     assert(!(await page.locator('.seasonal-trim').first().isVisible()),'no border trim');
     if(file==='index.html')assert(!(await page.locator('.seasonal-greeting').isVisible()),'no holiday greeting');
     assert(await page.locator('.seasonal-accent,.seasonal-trim,.seasonal-leaves').evaluateAll(els=>els.every(e=>e.getAttribute('aria-hidden')==='true'&&getComputedStyle(e).pointerEvents==='none')));
     if(width<801) {await page.locator('.mobile-menu-toggle').click();assert(await page.locator('#main-nav > a[href="membership.html"]').isVisible());await page.keyboard.press('Escape');}
     if(await page.locator('.photo-link').count()) {await page.locator('.photo-link').first().click();assert(await page.locator('.photo-close').isVisible());await page.keyboard.press('Escape');await page.waitForTimeout(50);}
     if([390,1440].includes(width)) {
      const scan=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
      assert.deepEqual(scan.violations.map(v=>v.id),[],`${file} ${season} accessibility`);
      if(file==='index.html') {await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.join(out,`${season}-${width}.png`)});}
     }
     checks++;
    }
    assert.deepEqual(errors,[]);await page.close();
   }
   await context.close();
  }
  const page=await browser.newPage();
  const boundaries=[['2026-10-01T04:59:59Z','', 'october'],['2026-11-01T04:59:59Z','october','november'],['2026-12-01T05:59:59Z','november','december'],['2027-01-01T05:59:59Z','december','']];
  await page.clock.install({time:new Date(boundaries[0][0])});
  await page.clock.pauseAt(new Date(boundaries[0][0]));
  await page.goto('http://127.0.0.1:4175/');
  for(const [time,before,after] of boundaries) {
   await page.clock.setSystemTime(new Date(time));
   await page.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));
   assert.equal(await page.locator('html').getAttribute('data-season')||'',before);
   await page.clock.runFor(1000);
   assert.equal(await page.locator('html').getAttribute('data-season')||'',after,'open page switches at local midnight');
  }
  await page.close();
  const demo=await browser.newPage({viewport:{width:390,height:900}});
  await demo.clock.install({time:new Date('2027-01-15T12:00:00Z')});
  for(const season of ['october','november','december','none']) {
   await demo.goto('http://127.0.0.1:4175/?season='+season);
   assert.equal(await demo.locator('html').getAttribute('data-season')||'',season==='none'?'':season);
   await demo.locator('.mobile-menu-toggle').click();
   await demo.locator('#main-nav > a[href*="membership.html"]').click();
   assert.equal(new URL(demo.url()).searchParams.get('season'),season,'preview follows internal navigation');
   assert.equal(await demo.locator('html').getAttribute('data-season')||'',season==='none'?'':season);
  }
  for(const suffix of ['', '?season=invalid']) {
   await demo.goto('http://127.0.0.1:4175/'+suffix);
   assert.equal(await demo.locator('html').getAttribute('data-season'),null,'normal links keep the automatic schedule');
  }
  await demo.close();
  const nojs=await browser.newContext({javaScriptEnabled:false});const p=await nojs.newPage();await p.goto('http://127.0.0.1:4175/');assert.equal(await p.locator('.seasonal-accent').count(),0);assert(await p.locator('h1').isVisible());await nojs.close();
  console.log(`${checks} seasonal viewport/page cases, local-midnight transitions, overseas visitor time zone, and no-JavaScript fallback pass`);
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
