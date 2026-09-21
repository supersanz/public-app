const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),LevelCurve=require(process.cwd()+'/scripts/experience-levels.js');
for(let lv=1;lv<=999;lv++){
 assert.equal(LevelCurve.progress(LevelCurve.total(lv)).lv,lv);
 assert.equal(LevelCurve.progress(LevelCurve.total(lv+1)-1).xp,LevelCurve.required(lv)-1);
}
const app=fs.readFileSync('scripts/app-core.js','utf8');
const code=app.slice(app.indexOf('function migratePlayerCurve'),app.indexOf('\n',app.indexOf('function player(){')));
for(const lv of [1,5,10,20,40,50]){
 const ctx={LevelCurve,data:{walkExp:(lv-1)*1000+990,playerResetEarned:0},totals:()=>[0],persist:()=>true};
 vm.createContext(ctx);vm.runInContext(code,ctx);
 const p=ctx.player();assert.equal(p.lv,lv);assert.equal(p.xp,Math.floor(LevelCurve.required(lv)*.99));
 ctx.data.walkExp+=LevelCurve.required(lv)-p.xp+7;
 assert.equal(ctx.player().lv,lv+1);assert.equal(ctx.player().xp,7);
 const copy=JSON.stringify(ctx.data);ctx.player();assert.equal(JSON.stringify(ctx.data),copy);
}
assert.equal(LevelCurve.total(50),616276);
console.log('PASS: levels 1–999, migration preserves level/ratio, record/passive XP carryover and migration idempotence');
