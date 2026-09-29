'use strict';
function travelerRewardTitle(lv){return ({5:'사막으로',10:'숲속으로',20:'고대숲으로',30:'하늘섬으로',40:'21세기로'})[lv]||travelerTitle(lv)}
function travelerTitle(lv){return lv>=40?'프리랜서':lv>=30?'마법사':lv>=20?'탐험가 +':lv>=10?'탐험가':'여행자'}
const travelerStanding='assets/characters/male/idle-standing.png';
const travelerForest='assets/backgrounds/forest-day-panorama.png';
const travelerDesert='assets/backgrounds/desert-day-panorama.png';
function travelerPreviewScene(){if(data.disableScenePreview)return null;const id=typeof location!=='undefined'?new URLSearchParams(location.search).get('preview'):null;return ['forest','deepForest','sky','academy'].includes(id)?id:null}
function travelerForestPreview(){return !!travelerPreviewScene()}
function travelerPanorama(id){return ({desert:travelerDesert,forest:travelerForest,deepForest:'assets/backgrounds/ancient-forest-day-panorama.png',sky:'assets/backgrounds/sky-island-day-panorama.png'})[id]}
// Preview supplies an initial bundle; choosing a reward replaces both slots.
const travelerPreviewEquipment={};
function travelerState(){const state=TravelerRewards.state(data.travelerJourney,player().lv);return travelerForestPreview()?{...state,background:travelerPreviewScene(),motion:({forest:'run',deepForest:'deepRun',sky:'fly',academy:'studyWork'})[travelerPreviewScene()],...travelerPreviewEquipment}:state}
function travelerAlarmTimesReady(){return [0,1].every(i=>[0,1].every(j=>data.alarmTimesConfigured?.[i+','+j]===true&&/^([01]\d|2[0-3]):[0-5]\d$/.test(data.alarms?.[i]?.[j]||''))&&data.alarms[i][0]!==data.alarms[i][1])} 
function travelerMotionEarnable(){
 const motion=travelerState().motion;
 return !travelerForestPreview()||player().lv>=(TravelerRewards.items[motion]?.level||Infinity)||TravelerRewards.state(data.travelerJourney,player().lv).claimed.includes(motion);
}
function travelerSleeping(now=new Date()){return typeof travelerScheduledNight==='function'?travelerScheduledNight(now):petSleepState(now,(data.alarms||[]).map(row=>[row[0],row[1],true,true])).sleeping}
// Presentation follows the displayed day/night mode; XP still uses the sleep schedule.
function travelerVisualNight(){return typeof travelerNightAt==='function'?travelerNightAt():travelerSleeping()}
function travelerWalking(){return ['walk','run','deepRun'].includes(travelerState().motion)&&!travelerVisualNight()}
function travelerArt(){
 const motion=travelerState().motion;
 if(motion==='studyWork')return '';
 if(travelerWalking())return '<canvas class="traveler-slow" width="256" height="256" role="img" aria-label="이동하는 캐릭터"></canvas>';
 const image=`<img src="${travelerStanding}" alt="서 있는 캐릭터" draggable="false">`;
 if(travelerVisualNight()||motion==='still')return image;
 if(motion==='fly')return '<div class="motion-fly"><canvas class="traveler-flight" width="256" height="256" role="img" aria-label="빗자루를 타고 나는 마법사"></canvas></div>';
 return `<div class="motion-${motion}">${image}${motion==='fly'?'<span class="flight-trail">✦</span>':motion.endsWith('Work')?'<span class="work-desk"><i class="work-monitor">'+(motion==='officeWork'?'AI':'⌨')+'</i></span>':''}</div>`;
}
function travelerMovingScene(id){
 if(['run','deepRun'].includes(travelerState().motion)&&['academy','office'].includes(id))return `<div class="desert-pan-track room-pan-track" aria-hidden="true">${Array(4).fill('<div class="room-pan-tile">'+travelerScene(id)+'</div>').join('')}</div>`;
 return travelerScene(id);
}
function travelerScene(id){
 if(id==='academy')return travelerCafeScene();
 if(id==='white')return '<div class="clearing-scene" aria-hidden="true"></div>';
 if(travelerPanorama(id))return '';
 return `<div class="journey-scene scene-${id}" aria-hidden="true">${id==='forest'||id==='deepForest'?Array.from({length:12},(_,i)=>`<i class="scene-tree" style="--i:${i}"></i>`).join(''):id==='sky'?'<i class="scene-cloud cloud-a"></i><i class="scene-cloud cloud-b"></i>':'<div class="scene-window"></div><div class="scene-shelf"></div>'}</div>`;
}
pages.home=()=>{
 const p=player(),s=travelerState();
 return `<section class="traveler-home desert-home ${s.background==='academy'?'cafe-home':''} ${s.background==='white'?'white-home':''} ${travelerWalking()?'is-traveling':''}">${travelerMovingScene(s.background)}${travelerPanorama(s.background)?`<div class="desert-pan-track ${s.background!=='desert'?'forest-pan-track':''}" aria-hidden="true">${Array(4).fill(`<img src="${travelerPanorama(s.background)}" alt="" draggable="false">`).join('')}</div>`:''}<header class="traveler-hud"><strong>Lv.${p.lv}</strong><small>${p.xp} / ${LevelCurve.required(p.lv).toLocaleString()} EXP</small><div class="traveler-hud-bar" role="progressbar" aria-label="레벨 경험치" aria-valuemin="0" aria-valuemax="${LevelCurve.required(p.lv)}" aria-valuenow="${p.xp}">${bar(p.xp/LevelCurve.required(p.lv)*100)}</div></header><div class="traveler-stage"><div class="traveler-art" data-traveler-art data-walking="${travelerWalking()}">${travelerArt()}</div></div></section>`;
};
function travelerCafeScene(night=false){
 return `<div class="cafe-world ${night?'cafe-at-night':''}" role="img" aria-label="현대적인 카페에서 노트북으로 작업하는 여행자"><img src="assets/characters/male/cafe-day.png" alt=""><div class="cafe-steam" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div><i class="cafe-eye cafe-eye-left" aria-hidden="true"></i><i class="cafe-eye cafe-eye-right" aria-hidden="true"></i></div>`;
}
function travelerBundleCard(bg){
 const s=travelerState(),motion=TravelerRewards.bundles[bg],level=TravelerRewards.items[bg].level;
 const owned=level===1||s.claimed.includes(bg),locked=!owned&&player().lv<level,equipped=s.background===bg&&s.motion===motion;
 const labels={white:['황무지','가만히 서 있기'],desert:['끝없는 사막','걷기'],forest:['햇살 머무는 숲','달리기'],deepForest:['잊혀진 고대숲','달리기 +'],sky:['하늘섬','마법 빗자루 타기'],academy:['햇살 드는 카페','컴퓨터 작업'],office:['회사 배경','AI와 함께 일하기']};
 const panorama=travelerPanorama(bg);
 const scene=panorama?`<div class="reward-panorama" style="background-image:url('${panorama}')"></div>`:travelerScene(bg);
 const character=bg==='academy'?'':motion==='fly'?'<canvas class="traveler-flight flight-preview" width="256" height="256" aria-label="마법 빗자루 타기 미리보기"></canvas>':['walk','run','deepRun'].includes(motion)?`<canvas class="reward-ground-motion" data-motion="${motion}" width="256" height="256" aria-label="${labels[bg][1]} 미리보기"></canvas>`:`<img class="bundle-standing" src="${travelerStanding}" alt="">`;
 const action=locked?`<button disabled>Lv.${level}에 해금</button>`:!owned?`<button data-journey-action="claim" data-journey-item="${bg}">보상 받기</button>`:equipped?'<button class="equipped" disabled>✓ 장착 중</button>':`<button data-journey-action="equip" data-journey-item="${bg}">장착하기</button>`;
 const exp=TravelerRewards.items[motion].exp;
 return `<article class="journey-card journey-bundle ${locked?'locked':''} ${equipped?'is-equipped':''}" data-bundle="${bg}"><div class="journey-art art-${bg}">${scene}<div class="bundle-character">${character}</div></div><div class="journey-card-copy"><small>Lv.${level} · ${locked?'잠긴 보상':equipped?'장착 중':owned?'보유 중':'받을 수 있어요'}</small><h3>${labels[bg][0]}</h3><span class="bundle-motion">${labels[bg][1]}</span><p class="reward-income">${exp?`낮에 5초마다 +${exp} EXP`:'기본 보상'}</p>${action}</div></article>`;
}
function travelerJourneyBanner(lv){
 const stages=[
  [1,'여정의 준비','모든 시작은 여기서','황무지에서의 만남','white'],
  [5,'첫 번째 여정','작은 여행의 시작','사막과 첫 발걸음','desert'],
  [10,'두 번째 여정','초록빛 길을 따라','햇살 머무는 숲에서 달리기','forest'],
  [20,'세 번째 여정','더 깊은 곳으로','고대숲 속 새로운 모험','deepForest'],
  [30,'네 번째 여정','하늘로 이어지는 길','빗자루를 타고 구름 너머로','sky'],
  [40,'다섯 번째 여정','새로운 시대의 하루','21세기에서 배우는 새로운 일상','academy'],

 ];
 const [level,label,title,description,bg]=stages.filter(s=>s[0]<=lv).pop()||stages[0];
 const panorama=travelerPanorama(bg);
 return `<header class="journey-banner banner-${bg}"${panorama?` style="background-image:linear-gradient(90deg,#25302ce6,#25302c50),url('${panorama}')"`:''}><small>${label}</small><h2>${title}</h2><p>Lv.${level} · ${description}</p><span>나의 레벨 <b>Lv.${lv}</b></span></header>`;
}
pages.rewards=()=>{
 const p=player(),bundles=['white','desert','forest','deepForest','sky','academy'];
 const next=bundles.find(bg=>TravelerRewards.items[bg].level>p.lv);
 let featured='';
 if(next){
  const target=TravelerRewards.items[next].level,previous=Math.max(1,...bundles.map(bg=>TravelerRewards.items[bg].level).filter(lv=>lv<target));
  const remaining=Math.max(0,LevelCurve.total(target)-LevelCurve.total(p.lv)-p.xp);
  const progress=Math.max(0,Math.min(100,(LevelCurve.total(p.lv)+p.xp-LevelCurve.total(previous))/(LevelCurve.total(target)-LevelCurve.total(previous))*100));
  featured=`<section class="reward-next"><div class="reward-section-title"><h2>다음 성장 보상</h2><span>현재 Lv.${p.lv}</span></div>${travelerBundleCard(next)}<div class="reward-next-progress"><div><strong>Lv.${target}까지</strong><span>${remaining.toLocaleString()} EXP 남음</span></div><div role="progressbar" aria-label="다음 보상 진행률" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(progress)}">${bar(progress)}</div></div></section>`;
 }else featured='<div class="reward-complete"><strong>모든 성장 보상을 해금했어요!</strong><p>마음에 드는 보상으로 오늘을 보내세요.</p></div>';
 return `<section class="page journey-pass reward-readable">${heading('성장 보상')}<p class="journey-intro">배경과 동작을 한 세트로 받아요.<br>받은 보상은 언제든 자유롭게 교체할 수 있어요.</p>${featured}<section class="reward-collection"><div class="reward-section-title"><h2>전체 보상</h2><span>6가지 여정</span></div><div class="reward-list">${bundles.map(bg=>travelerBundleCard(bg)).join('')}</div></section></section>`;
};

pages.style=()=>`<section class="page">${heading('꾸미기','',true)}</section>`;
function changeTravelerReward(action,id){
 const item=TravelerRewards.items[id],current=travelerState();
 // Validate the same effective pair shown in preview, while saving only owned equipment.
 const saved=travelerForestPreview()?{...data.travelerJourney,background:current.background,motion:current.motion}:data.travelerJourney;
 const next=TravelerRewards.change(saved,player().lv,action,id);
 if(!next){
  if(action==='equip'&&item&&!TravelerRewards.compatible(item.slot==='background'?id:current.background,item.slot==='motion'?id:current.motion))
   toast(id==='sky'?'마법 빗자루 타기 보상을 먼저 받아 주세요.':'하늘에서는 불가능한 동작입니다.');
  return false;
 }
 const previous=data.travelerJourney;data.travelerJourney=next;
 if(!persist()){if(previous===undefined)delete data.travelerJourney;else data.travelerJourney=previous;return false}
 if(action==='equip'&&travelerForestPreview())Object.assign(travelerPreviewEquipment,{background:next.background,motion:next.motion});
 render();toast(action==='claim'?'보상을 받았어요. 장착해서 사용해 보세요.':'장착했어요. 홈에서 확인해 보세요.');return true;
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-journey-action]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();changeTravelerReward(b.dataset.journeyAction,b.dataset.journeyItem)},true);
const travelerBaseRender=render;
render=function(){
 travelerBaseRender();const app=document.getElementById('app');
 app.classList.toggle('is-traveler-home',page==='home');app.classList.toggle('is-rewards',false);app.classList.toggle('is-journey-pass',page==='rewards');
 const nav=document.querySelector('.nav');if(nav){nav.classList.add('traveler-nav');nav.innerHTML=[['home','홈','home'],['history','기록','history'],['rewards','성장 보상','trophy'],['alarm','알람','bell']].map(([id,label,ic])=>`<button data-page="${id}" class="${page===id?'active':''}" ${page===id?'aria-current="page"':''}>${icon(ic)}${label}</button>`).join('')}
};
function refreshTraveler(){const target=document.querySelector('[data-traveler-art]');if(!target)return;const walking=travelerWalking();if(target.dataset.walking!==String(walking)){target.innerHTML=travelerArt();target.dataset.walking=String(walking)}document.querySelector('.desert-home')?.classList.toggle('is-traveling',walking)}
setInterval(()=>{if(!document.hidden)refreshTraveler()},1000);
window.addEventListener('focus',refreshTraveler);render();

// Award only time actually spent watching the walking character.
(()=>{
 const interval=5000;
 let elapsed=0,last=performance.now(),wasWalking=false;
 document.addEventListener('visibilitychange',()=>{last=performance.now();wasWalking=false});
 setInterval(()=>{
  const now=performance.now(),delta=now-last;last=now;
  const art=document.querySelector('[data-traveler-art]');
  const night=(typeof travelerNightAt==='function'&&travelerNightAt())||(typeof travelerScheduledNight==='function'&&travelerScheduledNight());
  const walking=travelerAlarmTimesReady()&&travelerMotionEarnable()&&!night&&!document.hidden&&page==='home'&&!travelerSleeping()&&travelerState().motion!=='still'&&!!art&&!document.querySelector('.is-night-home');
  if(walking&&wasWalking)elapsed+=Math.min(delta,1000);
  wasWalking=walking;
  if(!walking||elapsed<interval)return;
  const previous=data.walkExp;
  const gain=TravelerRewards.items[travelerState().motion]?.exp||0;
  if(!gain)return;
  data.walkExp=Math.max(0,Number(previous)||0)+gain;
  if(!persist()){if(previous===undefined)delete data.walkExp;else data.walkExp=previous;elapsed=0;return}
  elapsed-=interval;
  const p=player(),hud=document.querySelector('.traveler-hud');
  if(hud){
   hud.querySelector('strong').textContent=`Lv.${p.lv}`;
   hud.querySelector('small').textContent=`${p.xp} / ${LevelCurve.required(p.lv).toLocaleString()} EXP`;
   const progress=hud.querySelector('[role="progressbar"]');
   progress.setAttribute('aria-valuemax',String(LevelCurve.required(p.lv)));progress.setAttribute('aria-valuenow',String(p.xp));progress.innerHTML=bar(p.xp/LevelCurve.required(p.lv)*100);
  }
  const popup=document.createElement('span');popup.className='traveler-exp-pop';popup.textContent=`+ exp ${gain}`;
  // Keep the reward text above every scene, independent of character canvas updates.
  const home=art.closest('.traveler-home'),anchor=art.getBoundingClientRect(),bounds=home.getBoundingClientRect();
  popup.style.left=`${Math.max(12,Math.min(bounds.width-100,anchor.left-bounds.left+anchor.width*.68))}px`;
  popup.style.top=`${Math.max(24,anchor.top-bounds.top-12)}px`;
  home.appendChild(popup);setTimeout(()=>popup.remove(),1800);
 },250);
})();

// Ground animation owns the track when walking; flight has its own steady drift.
(()=>{let last=0,distance=0;function tick(now){
 const track=document.querySelector('.desert-pan-track'),flying=!!document.querySelector('.motion-fly');
 if(track&&flying&&!document.querySelector('canvas.female-motion')&&!document.hidden&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
  if(last)distance+=Math.min(now-last,50)*.032;
  const repeat=track.firstElementChild.getBoundingClientRect().width-(parseFloat(getComputedStyle(track).getPropertyValue('--pan-seam'))||0);
  if(repeat>0)track.style.transform=`translateX(${-2*repeat+(distance%repeat)}px)`;
 }
 last=now;requestAnimationFrame(tick);
}requestAnimationFrame(tick)})();
