const {chromium} = require('playwright');
const assert = require('node:assert/strict');
const base = process.env.QA_BASE || 'http://127.0.0.1:4175';
(async () => {
 const browser = await chromium.launch();
 try {
  const page = await browser.newPage();
  await page.clock.install({time:new Date('2026-12-15T12:00:00Z')});
  for (const [query,season] of [['','december'],['?season=none',null],['?season=october','october']]) {
   await page.goto(base+'/'+query);
   assert.equal(await page.locator('.seasonal-toggle').count(),0);
   assert.equal(await page.locator('html').getAttribute('data-season'),season);
  }
  await page.evaluate(()=>localStorage.setItem('gshm-hide-seasonal-decorations','true'));
  await page.goto(base+'/');
  assert.equal(await page.locator('html').getAttribute('data-season'),null);
  await page.goto(base+'/?season=december');
  assert.equal(await page.locator('html').getAttribute('data-season'),'december');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
