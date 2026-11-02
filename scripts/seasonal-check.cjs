const assert = require('node:assert/strict');
const {seasonForDate} = require('../seasonal.js');
const cases = [
 ['2026-09-30T23:59:59-05:00',''],
 ['2026-10-01T00:00:00-05:00','october'],
 ['2026-10-31T23:59:59-05:00','october'],
 ['2026-11-01T00:00:00-05:00','november'],
 ['2026-11-01T01:59:59-05:00','november'],
 ['2026-11-01T01:00:00-06:00','november'],
 ['2026-11-30T23:59:59-06:00','november'],
 ['2026-12-01T00:00:00-06:00','december'],
 ['2026-12-31T23:59:59-06:00','december'],
 ['2027-01-01T00:00:00-06:00',''],
 ['2027-10-01T00:00:00-05:00','october'],
 ['2027-11-01T00:00:00-05:00','november'],
 ['2027-12-01T00:00:00-06:00','december'],
];
for(const [time,expected] of cases) assert.equal(seasonForDate(new Date(time)),expected,time);
for(let month=1;month<=9;month++) assert.equal(seasonForDate(new Date(`2027-${String(month).padStart(2,'0')}-15T12:00:00Z`)),'');
assert.equal(seasonForDate(new Date('2026-10-01T02:00:00Z')),'','UTC October is still September in Ardmore');
assert.equal(seasonForDate(new Date('2026-12-01T03:00:00Z')),'november');
assert.equal(seasonForDate(new Date('2027-01-01T03:00:00Z')),'december');
assert.equal(seasonForDate(new Date('2026-11-15T12:00:00Z'),'none'),'');
assert.equal(seasonForDate(new Date('2026-07-15T12:00:00Z'),'december'),'december');
assert.equal(seasonForDate(new Date(),'invalid'),'');
assert.equal(seasonForDate(new Date(),'auto','invalid'),'');
console.log('Season schedule: first/last days, year rollover, DST, local time, annual recurrence and overrides pass');
