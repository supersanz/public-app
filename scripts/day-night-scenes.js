'use strict';
let travelerNightOverride=null;
function travelerScheduledNight(now=new Date()){
 const alarms=Array.isArray(data.alarms)&&data.alarms.length>=2?data.alarms:[['07:00','22:00',true,true],['07:00','22:00',true,true]];
 // Notification switches must not disable the character sleep schedule.
 return petSleepState(now,alarms.map(row=>[row[0],row[1],true,true])).sleeping;
}
function travelerNightAt(now=new Date()){
 const scheduled=travelerScheduledNight(now);
 if(travelerNightOverride&&travelerNightOverride.scheduled!==scheduled)travelerNightOverride=null;
 return travelerNightOverride?travelerNightOverride.night:scheduled;
}
const travelerDayHome=pages.home;
function travelerNightScene(background){
 return ({desert:['assets/characters/male/desert-night.png','별빛 사막에서 마시멜로 굽기'],forest:['assets/characters/male/forest-night.png','달빛 숲의 해먹에서 쉬기'],deepForest:['assets/characters/male/ancient-forest-night.png','고대숲의 텐트에서 책 읽기'],sky:['assets/characters/male/sky-night.png','하늘 섬에서 베개를 베고 잠자기']})[background];
}
function travelerNightWorld(background){
 if(background==='academy')return travelerCafeScene(true);
 if(background==='white')return '<div class="night-world clearing-night" aria-hidden="true"><img src="assets/characters/male/clearing-night.png" alt=""><div class="sleep-letters"><span>z</span><span>z</span><span>z</span></div></div>';
 const scene=travelerNightScene(background);
 if(!scene)return `<div class="night-rest-room">${travelerScene(background)}<img class="night-rest-character" src="${travelerStanding}" alt="쉬고 있는 마법사"></div>`;
 const stars=background==='desert'||background==='sky'?[[16.5,5,0],[83,2.5,4],[75,16.2,8]].map(([x,y,d])=>`<i class="night-star" style="left:${x}%;top:${y}%;--delay:-${d}s;--duration:${12+d}s"></i>`).join(''):'';
 const effects=background==='desert'?'<i class="camp-glow"></i><i class="camp-eyelid eye-near"></i><i class="camp-eyelid eye-far"></i>':background==='forest'?[ [25,58],[66,60],[18,77] ].map(([x,y],i)=>`<i class="rest-firefly" style="left:${x}%;top:${y}%;animation-delay:-${i*3}s"></i>`).join(''):'';
 const rest=background==='forest'?'<i class="rest-lantern forest-lantern"></i>':background==='deepForest'?'<i class="deep-moon-glow"></i><i class="rest-lantern deep-lantern"></i><i class="deep-eyelid deep-eye-left"></i><i class="deep-eyelid deep-eye-right"></i><div class="rest-mist mist-back"></div><div class="rest-mist mist-front"></div>':background==='sky'?'<div class="sleep-letters"><span>z</span><span>z</span><span>z</span></div>':'';
 return `<div class="night-world" data-night-scene="${background}" aria-hidden="true"><img src="${scene[0]}" alt="">${stars}${effects}${rest}</div>`;
}
pages.home=()=>{
 const night=travelerNightAt(),p=player();

 if(!night)return travelerDayHome();
 return `<section class="night-home" aria-label="${travelerNightScene(travelerState().background)?.[1]||'밤의 휴식'}">${travelerNightWorld(travelerState().background)}<header class="traveler-hud"><strong>Lv.${p.lv}</strong><small>${p.xp} / ${LevelCurve.required(p.lv).toLocaleString()} EXP</small><div class="traveler-hud-bar" role="progressbar" aria-label="레벨 경험치" aria-valuemin="0" aria-valuemax="${LevelCurve.required(p.lv)}" aria-valuenow="${p.xp}">${bar(p.xp/LevelCurve.required(p.lv)*100)}</div></header></section>`;
};
const nightBaseRender=render;
render=function(){nightBaseRender();const app=document.getElementById('app'),night=travelerNightAt();app.classList.toggle('is-night-home',page==='home'&&night);app.classList.toggle('is-night-navigation',night)};
let nightTransitionBusy=false;
function transitionTravelerNight(){
 if(nightTransitionBusy)return;
 if(!document.startViewTransition||window.matchMedia('(prefers-reduced-motion: reduce)').matches){render();return}
 nightTransitionBusy=true;
 const transition=document.startViewTransition(()=>render());
 transition.finished.catch(()=>{}).finally(()=>{nightTransitionBusy=false});
}
function syncTravelerNight(){if(document.hidden||nightTransitionBusy||(typeof questOnboardingActive!=='undefined'&&questOnboardingActive))return;const app=document.getElementById('app'),night=travelerNightAt();app.classList.toggle('is-night-navigation',night);if(page==='home'&&app.classList.contains('is-night-home')!==night)transitionTravelerNight()}
document.addEventListener('click',e=>{
 if(!e.target.closest('[data-night-toggle]'))return;
 e.preventDefault();e.stopImmediatePropagation();if(nightTransitionBusy)return;
 travelerNightOverride={night:!travelerNightAt(),scheduled:travelerScheduledNight()};
 transitionTravelerNight();
},true);
setInterval(syncTravelerNight,1000);
window.addEventListener('focus',syncTravelerNight);
render();
