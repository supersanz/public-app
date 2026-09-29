const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const core=fs.readFileSync('scripts/app-core.js','utf8'),ui=fs.readFileSync('scripts/quest-interface.js','utf8');
const q=require('../../scripts/daily-quests.js'),curve=require('../../scripts/experience-levels.js');
let date='2026-09-28',stored='';
const c=vm.createContext({DailyQuests:q,LevelCurve:curve,today:()=>date,persist:()=>true});
vm.runInContext(core.slice(0,core.indexOf('const paths='))+"\nlet data={logs:[],walkExp:350,playerResetEarned:0,levelCurveVersion:3,weeklyChallenges:{'2026-09-28':[32]}};",c);
for(const name of ['activityExp','totals','migratePlayerCurve','player']){
 const start=core.indexOf('function '+name+'('),end=core.indexOf('\nfunction ',start+1);
 vm.runInContext(core.slice(start,end<0?undefined:end),c);
}
vm.runInContext(ui.slice(ui.indexOf(' const removedQuestIds='),ui.indexOf(' const summary=')),c);
const run=code=>vm.runInContext(code,c);
c.persist=()=>{stored=run('JSON.stringify(data)');return true;};
function record(){return run('DailyQuests.saveWithWeekly(data,today(),2,true,questXp(2),persist,balancedWeeklyRules())');}
assert(record());date='2026-09-29';assert(record());date='2026-09-30';
assert.equal(run('player().xp'),390);
const before=run('JSON.stringify(data)');c.persist=()=>false;assert.equal(record(),false);assert.equal(run('JSON.stringify(data)'),before);
c.persist=()=>{stored=run('JSON.stringify(data)');return true;};assert(record());
assert.equal(run('DailyQuests.weeklyStatus(data,today(),32).xp'),120);
assert.equal(run('player().earned'),530);assert.equal(run('player().lv'),2);assert.equal(run('player().xp'),80);
assert.equal(record(),false);run('DailyQuests.syncWeekly(data,today(),balancedWeeklyRules(),persist)');assert.equal(run('player().earned'),530);
run('data='+stored);assert.equal(run('player().xp'),80);
assert(run('DailyQuests.saveWithWeekly(data,today(),2,false,questXp(2),persist,balancedWeeklyRules())'));assert.equal(run('player().earned'),390);
assert(record());assert.equal(run('player().earned'),530);
date='2026-10-05';run('DailyQuests.syncWeekly(data,today(),balancedWeeklyRules(),persist)');assert.equal(run('player().earned'),530);
console.log('PASS real catalog + UI reward calculation + player integration: last reading gives 20+120 EXP, Lv1 390/450 -> Lv2 80/620; duplicate/reload/rollback/cancel/week rollover');
