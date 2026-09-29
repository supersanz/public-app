const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),curve=require('../../scripts/experience-levels.js');
const app=fs.readFileSync('scripts/app-core.js','utf8');const code=app.slice(app.indexOf('function migratePlayerCurve'),app.indexOf('\nfunction player'));
let oldTotal=0;
for(let lv=1;lv<=100;lv++){
 for(const ratio of [0,.25,.5,.99]){
  const oldXp=Math.floor(curve.v2Required(lv)*ratio),earned=oldTotal+oldXp;
  const c=vm.createContext({data:{levelCurveVersion:2,walkExp:earned,playerResetEarned:0},totals:()=>[0],LevelCurve:curve,persist:()=>true});vm.runInContext(code,c);c.migratePlayerCurve();
  const p=curve.progress(earned-c.data.playerResetEarned);assert.equal(p.lv,lv);assert(Math.abs(p.xp/p.required-oldXp/curve.v2Required(lv))<=1/p.required);
  const saved=JSON.stringify(c.data);c.migratePlayerCurve();assert.equal(JSON.stringify(c.data),saved);
 }oldTotal+=curve.v2Required(lv);
}
console.log('PASS 400 v2-to-v3 migrations preserve level and progress, with no repeated conversion');
