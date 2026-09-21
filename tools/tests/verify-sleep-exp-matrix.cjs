// Real scheduler + real EXP timer across weekday/weekend time boundaries.
const fs=require('fs'),vm=require('vm'),a=require('assert/strict');
const alarms=[['07:00','22:00',false,false],['09:00','00:30',false,false]];
const cases=[['2026-09-21T21:59:59',false],['2026-09-21T22:00:00',true],['2026-09-22T06:59:59',true],['2026-09-22T07:00:00',false],['2026-09-25T22:00:00',true],['2026-09-26T08:59:59',true],['2026-09-26T09:00:00',false],['2026-09-27T00:29:59',false],['2026-09-27T00:30:00',true],['2026-09-27T08:59:59',true],['2026-09-27T09:00:00',false],['2026-09-28T00:30:00',false],['2026-09-28T07:00:00',false]];
let count=0;
for(const gender of ['male','female'])for(const [motion,gain] of [['still',0],['walk',1],['run',5],['deepRun',7],['fly',10],['studyWork',30]])for(const [time,sleep] of cases){
 let clock=0,tick,popups=0;const instant=new Date(time);class FakeDate extends Date{constructor(...args){super(...(args.length?args:[instant.getTime()]));}}
 const art={querySelector:()=>({}),appendChild(){popups++},getBoundingClientRect:()=>({left:0,top:200,width:400})};art.closest=()=>art;
 const c={Date:FakeDate,data:{alarms,travelerCharacter:gender,walkExp:0},TravelerRewards:require(process.cwd()+'/scripts/reward-catalog.js'),LevelCurve:require(process.cwd()+'/scripts/experience-levels.js'),travelerAlarmTimesReady:()=>true,travelerMotionEarnable:()=>true,travelerState:()=>({motion}),page:'home',performance:{now:()=>clock},persist:()=>true,player:()=>({lv:1,xp:0}),bar:()=>'',setInterval:f=>tick=f,setTimeout(){},requestAnimationFrame(){},document:{hidden:false,addEventListener(){},querySelector:s=>s==='[data-traveler-art]'?art:null,createElement:()=>({style:{},remove(){}})}};
 vm.createContext(c);vm.runInContext(fs.readFileSync('scripts/sleep-schedule.js','utf8')+'\n'+fs.readFileSync('scripts/day-night-scenes.js','utf8').split('const travelerDayHome')[0],c);
 c.travelerSleeping=()=>c.travelerScheduledNight();a.equal(c.travelerNightAt(),sleep,time);
 vm.runInContext(fs.readFileSync('scripts/journey-and-bonus-experience.js','utf8').split('// Award only time actually spent watching the walking character.')[1],c);
 for(let i=0;i<21;i++){clock+=250;tick();}
 a.equal(c.data.walkExp,sleep?0:gain,`${gender} ${motion} ${time}`);a.equal(popups,!sleep&&gain?1:0);count++;
}
console.log(`PASS ${count} gender/motion/time cases: bedtime, wake, weekday/weekend crossing, disabled notification switches, XP and popups`);
const syncSource=fs.readFileSync('scripts/day-night-scenes.js','utf8').split('\n').find(line=>line.startsWith('function syncTravelerNight()'));
let transitions=0,shown=false,scheduled=true;
const ui={page:'home',nightTransitionBusy:false,document:{hidden:false,getElementById:()=>({classList:{contains:()=>shown,toggle(){}}})},travelerNightAt:()=>scheduled,transitionTravelerNight:()=>{transitions++;shown=scheduled;}};
vm.createContext(ui);vm.runInContext(syncSource,ui);
for(const bg of ['white','desert','forest','deepForest','sky','academy'])for(const gender of ['male','female']){shown=false;scheduled=true;ui.syncTravelerNight();a.equal(shown,true);scheduled=false;ui.syncTravelerNight();a.equal(shown,false);}
a.equal(transitions,24);console.log('PASS automatic screen sync: 12 gender/background combinations, bedtime and wake transitions');
