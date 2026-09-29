const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
function fixture(initial){
 const listeners={},store=initial?{'daily-quest-430-release-v1':JSON.stringify(initial)}:{};
 const element={innerHTML:'',textContent:'',value:'',checked:true,classList:{toggle(){}},setAttribute(){},remove(){},focus(){},addEventListener(){}};
 const document={getElementById:()=>element,querySelector:s=>s==='.status span:last-child'?element:null,querySelectorAll:()=>[],addEventListener:(name,fn,capture)=>{(listeners[name]??=[]).push({fn,capture})},createElement:()=>({...element}),body:{append(){},classList:{toggle(){}}}};
 const context=vm.createContext({LevelCurve:require(process.cwd()+'/scripts/experience-levels.js'),document,window:{scrollTo(){},addEventListener(){}},localStorage:{getItem:k=>store[k]||null,setItem:(k,v)=>store[k]=v},setTimeout(){},console,Date,Set,DOMParser:class{},navigator:{}});
 const run=s=>vm.runInContext(s,context);
 for(const file of ['scripts/app-core.js','scripts/records-and-inventory.js','scripts/base-components.js','scripts/record-date-and-layout.js','scripts/activity-rewards-and-history.js','scripts/alarm-time-picker.js','scripts/legacy-avatar.js'])run(fs.readFileSync(file,'utf8'));
 run('render=()=>{};toast=()=>{}');return {run,element,listeners,store,context};
}

const f=fixture();
f.run("function travelerAlarmTimesReady(){return [0,1].every(i=>[0,1].every(j=>data.alarmTimesConfigured?.[i+','+j]===true&&/^([01]\\d|2[0-3]):[0-5]\\d$/.test(data.alarms?.[i]?.[j]||''))&&data.alarms[i][0]!==data.alarms[i][1])} \r");
for(let mask=0;mask<16;mask++){
 f.run('data.alarmTimesConfigured={}');
 for(let n=0;n<4;n++)if(mask&(1<<n))f.run('data.alarmTimesConfigured["'+Math.floor(n/2)+','+n%2+'"] = true');
 assert.equal(f.run('travelerAlarmTimesReady()'),mask===15,'configuration mask '+mask);
}
f.run('data.alarms[0][1]=data.alarms[0][0]');assert.equal(f.run('travelerAlarmTimesReady()'),false);
f.run('data.alarms[0][1]="23:30"');assert.equal(f.run('travelerAlarmTimesReady()'),true);
const wheelClick=f.listeners.click.filter(x=>x.capture).at(-1).fn;
const click=dataset=>wheelClick({target:{closest:()=>({dataset})},preventDefault(){},stopImmediatePropagation(){}});
for(const [i,j] of [[0,0],[0,1],[1,0],[1,1]]){
 f.run('alarmEditor=['+i+','+j+'];wheelDraft={period:'+j+',hour:10,minute:15}');click({saveWheel:''});
 assert.equal(f.run('data.alarms['+i+']['+j+']'),j?'22:15':'10:15');
}
f.run('alarmEditor=[0,0];wheelDraft={period:1,hour:10,minute:15}');
let before=f.run('JSON.stringify(data)');click({saveWheel:''});assert.equal(f.run('JSON.stringify(data)'),before,'equal wake/bed rejected');
f.context.localStorage.setItem=()=>{throw Error('full')};
f.run('wheelDraft={period:0,hour:6,minute:0}');click({saveWheel:''});assert.equal(f.run('JSON.stringify(data)'),before);
click({alarmSwitch:'0,2'});assert.equal(f.run('JSON.stringify(data)'),before,'switch rollback');
const restored=fixture(JSON.parse(f.store['daily-quest-430-release-v1']));assert.equal(restored.run('data.alarms[1][1]'),'22:15');
for(const id of [4,16]){restored.run('recordDate=today();saveActivities(['+id+'])');assert.equal(restored.run('data.logs[0].exp['+id+']'),40);}
assert.equal(restored.run('totals()[1]'),80);assert(restored.run('pages.history().includes("필라테스")'));
console.log('PASS audit: 16 alarm setup combinations, equal-time guard, four time saves, storage reload, alarm save/switch rollback, running/Pilates records.');
