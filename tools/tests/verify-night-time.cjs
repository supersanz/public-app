const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const source=fs.readFileSync('scripts/day-night-scenes.js','utf8').split('const travelerDayHome=')[0];
const c=vm.createContext({data:{alarms:[['07:00','22:00',true,true],['09:00','22:00',true,true]]},Date});vm.runInContext(fs.readFileSync('scripts/sleep-schedule.js','utf8')+'\n'+source,c);
for(const [time,expected] of [['2026-09-21T21:59:59',false],['2026-09-21T22:00:00',true],['2026-09-22T06:59:59',true],['2026-09-22T07:00:00',false],['2026-09-20T08:59:00',true],['2026-09-20T09:00:00',false]])assert.equal(c.travelerScheduledNight(new Date(time)),expected,time);
vm.runInContext('travelerNightOverride={night:false,scheduled:false}',c);
assert.equal(c.travelerNightAt(new Date('2026-09-21T22:00:00')),true);
console.log('PASS: 22:00 night boundary, weekday/weekend wake and override reset');
