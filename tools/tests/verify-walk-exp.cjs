const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
let clock=0,tick,active=true,ok=true,popups=0;
const data={walkExp:0},art={querySelector:()=>({}),appendChild(){popups++}};
art.closest=()=>art;art.getBoundingClientRect=()=>({left:0,top:200,width:400});
const ctx={travelerAlarmTimesReady:()=>true,LevelCurve:require(process.cwd()+'/scripts/experience-levels.js'),requestAnimationFrame(){},travelerMotionEarnable:()=>true,travelerForestPreview:()=>false,TravelerRewards:require(process.cwd()+'/scripts/reward-catalog.js'),travelerState:()=>({motion:active?'walk':'still'}),travelerSleeping:()=>false,data,performance:{now:()=>clock},page:'home',travelerWalking:()=>active,persist:()=>ok,player:()=>({lv:1,xp:data.walkExp}),bar:()=>'',setInterval:f=>tick=f,setTimeout(){},document:{hidden:false,hasFocus:()=>true,addEventListener(){},querySelector:s=>s==='[data-traveler-art]'?art:null,createElement:()=>({style:{},remove(){}})}};
const source=fs.readFileSync('scripts/journey-and-bonus-experience.js','utf8').split('// Award only time actually spent watching the walking character.')[1];
vm.runInNewContext(source,ctx);
function advance(n){for(let i=0;i<n;i++){clock+=250;tick()}}
advance(20);assert.equal(data.walkExp,0);
advance(1);assert.equal(data.walkExp,1);assert.equal(popups,1);
active=false;advance(80);assert.equal(data.walkExp,1);
// Block immediately at night, even before the day canvas is replaced.
active=true;ctx.travelerNightAt=()=>true;advance(80);assert.equal(data.walkExp,1);assert.equal(popups,1);
ctx.travelerNightAt=()=>false;
ctx.travelerScheduledNight=()=>true;advance(80);assert.equal(data.walkExp,1);
ctx.travelerScheduledNight=()=>false;
active=true;ctx.document.hidden=true;advance(80);assert.equal(data.walkExp,1);
ctx.document.hidden=false;ok=false;advance(21);assert.equal(data.walkExp,1);assert.equal(popups,1);
const p=fs.readFileSync('scripts/app-core.js','utf8').match(/function player\(\)\{[^\n]+/)[0];
const model={LevelCurve:require(process.cwd()+'/scripts/experience-levels.js'),migratePlayerCurve(){},data:{walkExp:1,playerResetEarned:0},totals:()=>[299]};vm.createContext(model);vm.runInContext(p,model);assert.equal(model.player().lv,2);assert.equal(model.player().xp,0);
console.log('PASS: timed walking EXP, idle/hidden pause, failed-save rollback, and level carryover');

ok=true;active=true;
for(const [motion,gain] of [['run',5],['deepRun',7],['fly',10],['studyWork',30]]){
 ctx.travelerState=()=>({motion});const before=data.walkExp;advance(20);assert.equal(data.walkExp-before,gain,motion);
}
console.log('PASS: all equipped motion reward rates');
const fields={h1:{},strong:{},small:{},'[role="progressbar"]':{setAttribute(k,v){this[k]=v}}};
let popupText='';art.appendChild=popup=>{popupText=popup.textContent};
ctx.document.querySelector=s=>s==='[data-traveler-art]'?art:s==='.traveler-hud'?{querySelector:key=>fields[key]}:null;
ctx.travelerTitle=()=> '탐험가';
for(const [motion,gain] of [['walk',1],['run',5],['deepRun',7],['fly',10],['studyWork',30]]){
 ctx.travelerState=()=>({motion});const before=data.walkExp;
 advance(19);assert.equal(data.walkExp,before);
 advance(1);assert.equal(data.walkExp,before+gain);
 assert.equal(popupText,`+ exp ${gain}`);
 assert.equal(fields.small.textContent,`${data.walkExp} / 300 EXP`);
 assert.equal(fields['[role="progressbar"]']['aria-valuenow'],String(data.walkExp));
}
ctx.travelerMotionEarnable=()=>false;const beforePreview=data.walkExp;
advance(40);assert.equal(data.walkExp,beforePreview);
console.log('PASS: run and run+ five-second popup/HUD update; unowned preview blocked');

ctx.travelerMotionEarnable=()=>true;ctx.travelerAlarmTimesReady=()=>false;const beforeSetup=data.walkExp;advance(80);assert.equal(data.walkExp,beforeSetup);console.log('PASS: unset alarm times block additional EXP');
