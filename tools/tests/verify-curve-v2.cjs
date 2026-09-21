const fs=require('fs'),vm=require('vm'),a=require('assert/strict'),curve=require(process.cwd()+'/scripts/experience-levels.js');
const source=fs.readFileSync('scripts/app-core.js','utf8').split('function migratePlayerCurve(){')[1].split('\nfunction player')[0];
let oldTotal=0;
for(let lv=1;lv<=100;lv++){
 const oldReq=curve.previousProgress(oldTotal).required;
 for(const ratio of [0,.5,.99]){
  const earned=oldTotal+Math.floor(oldReq*ratio),c={data:{levelCurveVersion:1,walkExp:earned,playerResetEarned:0},totals:()=>[0],LevelCurve:curve,persist:()=>true};vm.createContext(c);vm.runInContext('function migratePlayerCurve(){'+source,c);c.migratePlayerCurve();const p=curve.progress(earned-c.data.playerResetEarned);a.equal(p.lv,lv);a.ok(Math.abs(p.xp/p.required-Math.floor(oldReq*ratio)/oldReq)<1/p.required);const saved=c.data.playerResetEarned;c.migratePlayerCurve();a.equal(c.data.playerResetEarned,saved);
 }oldTotal+=oldReq;
}
console.log('PASS 300 migration cases; level and progress preserved, migration runs once');console.log([1,5,10,20,30,40,50].map(lv=>[lv,curve.required(lv)]));
