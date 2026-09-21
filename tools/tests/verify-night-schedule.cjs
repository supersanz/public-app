const fs=require('fs'),vm=require('vm'),a=require('assert/strict');
const c={data:{alarms:[['07:00','23:30',true,true],['09:00','00:30',true,true]]}};vm.createContext(c);
vm.runInContext(fs.readFileSync('scripts/sleep-schedule.js','utf8')+'\n'+fs.readFileSync('scripts/day-night-scenes.js','utf8').split('const travelerDayHome')[0],c);
for(const [time,night] of [['2026-09-21T22:00:00',false],['2026-09-21T23:29:00',false],['2026-09-21T23:30:00',true],['2026-09-22T06:59:00',true],['2026-09-22T07:00:00',false],['2026-09-26T00:30:00',true],['2026-09-26T09:00:00',false]])a.equal(c.travelerScheduledNight(new Date(time)),night,time);
vm.runInContext('travelerNightOverride={night:false,scheduled:false}',c);
a.equal(c.travelerNightAt(new Date('2026-09-21T23:30:00')),true);
console.log('PASS custom bedtime, weekday/weekend wake boundaries, automatic override expiration');
