const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const text=fs.readFileSync('scripts/quest-interface.js','utf8');
const model=text.slice(text.indexOf(' const dailyBase='),text.indexOf(' const summary='));
const c=vm.createContext({player:()=>({lv:1})});vm.runInContext(model+'\nthis.reward=questXp;this.daily=dailyBase;this.weekly=weeklyBase;',c);
for(const lv of [1,5,10,20,30,40,999]){
 c.player=()=>({lv});
 for(const id of Object.keys(c.daily)){const xp=c.reward(id);assert(Number.isInteger(xp)&&xp>=10&&xp<=30);}
 for(const id of Object.keys(c.weekly)){const xp=c.reward(id);assert(Number.isInteger(xp)&&xp>=100&&xp<=150);}
}
assert(text.includes('new Set([1,19,20,'));
console.log('PASS fixed integer activity rewards 10–30 and weekly rewards 100–150 across levels; planning activity retired');
