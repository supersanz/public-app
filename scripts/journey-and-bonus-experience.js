'use strict';
function travelerRewardTitle(lv){return ({5:'초원으로',10:'숲속으로',20:'유적으로',30:'새로운 길로',40:'하늘 성으로',50:'서울로',60:'일본으로'})[lv]||travelerTitle(lv)}
function travelerTitle(lv){return lv>=40?'마법사':lv>=20?'탐험가 +':lv>=10?'탐험가':'여행자'}
const travelerStanding='assets/characters/large-bag-v2/male-standing.png';
const travelerForest='assets/backgrounds/forest-day-panorama.png';
const travelerDesert='assets/backgrounds/desert-day-panorama.png';
function travelerPreviewScene(){if(data.disableScenePreview&&(typeof location==='undefined'||new URLSearchParams(location.search).get('scenePreview')!=='1'))return null;const id=typeof location!=='undefined'?new URLSearchParams(location.search).get('preview'):null;return id==='flightFrontier'?'sky':['forest','deepForest','runFrontier','sky','city','italy','france','britain','america'].includes(id)?id:null}
function travelerForestPreview(){return !!travelerPreviewScene()}
const growthBackgrounds={white:'01-wasteland',desert:'02-meadow',forest:'03-forest',deepForest:'04-ruins',runFrontier:'05-alpine',sky:'06-clouds',flightFrontier:'07-sky-castle',city:'08-future-city'};
function travelerPanorama(id){if(id==='city')return 'assets/backgrounds/growth-v2/08-korean-city-painted-v1.png';if(id==='deepForest')return 'assets/backgrounds/growth-v2/04-ruins-painted-v1.png';if(id==='runFrontier')return 'assets/backgrounds/growth-v2/05-alpine-painted-v1.png';if(id==='forest')return 'assets/backgrounds/growth-v2/03-forest-painted-v1.png';if(id==='desert')return 'assets/backgrounds/growth-v2/02-meadow-painted-v1.png';if(id==='white')return 'assets/backgrounds/growth-v2/01-wasteland-painted-v1.png';return growthBackgrounds[id]?'assets/backgrounds/growth-v2/'+growthBackgrounds[id]+'.png':undefined}
// Asset resolver supplies an original and a distinct painted continuation.
function travelerPanoramaTiles(id){const image=travelerPanorama(id);return image?[image,image]:[];}

function travelerTrackRepeat(track){
 const count=Number(track.dataset?.loopTiles)||1;
 const overlap=parseFloat(getComputedStyle(track).getPropertyValue('--pan-seam'))||0;
 return Array.from(track.children).slice(0,count).reduce((width,tile)=>width+tile.getBoundingClientRect().width-overlap,0);
}

// Preview supplies an initial bundle; choosing a reward replaces both slots.
const travelerPreviewEquipment={};
function travelerState(){const state=TravelerRewards.state(data.travelerJourney,player().lv);return travelerForestPreview()?{...state,background:travelerPreviewScene(),motion:TravelerRewards.bundles[travelerPreviewScene()],...travelerPreviewEquipment}:state}
function travelerAlarmTimesReady(){return true;}
function travelerMotionEarnable(){
 const motion=travelerState().motion;
 return !travelerForestPreview()||player().lv>=(TravelerRewards.items[motion]?.level||Infinity)||TravelerRewards.state(data.travelerJourney,player().lv).claimed.includes(motion);
}
function travelerSleeping(){return false;}
// Presentation follows the displayed day/night mode; XP still uses the sleep schedule.
function travelerVisualNight(){return typeof travelerNightAt==='function'?travelerNightAt():travelerSleeping()}
function travelerWalking(){return ['walk','run','deepRun'].includes(travelerState().motion)&&!travelerVisualNight()}
function travelerArt(){
 const motion=travelerState().motion;
 if(motion==='studyWork')return '';
 if(motion==='ride')return '<div class="coffee-flight" role="img" aria-label="커피를 들고 종이비행기를 타는 남자 마법사"><span class="plane-rider-body"></span><span class="plane-rider-hair"></span></div>';
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
 if(travelerPanorama(id))return '';
 return `<div class="journey-scene scene-${id}" aria-hidden="true">${id==='forest'||id==='deepForest'?Array.from({length:12},(_,i)=>`<i class="scene-tree" style="--i:${i}"></i>`).join(''):id==='sky'?'<i class="scene-cloud cloud-a"></i><i class="scene-cloud cloud-b"></i>':'<div class="scene-window"></div><div class="scene-shelf"></div>'}</div>`;
}
pages.home=()=>{
 const p=player(),s=travelerState();
 return `<section data-background="${s.background}" class="traveler-home desert-home ${s.background==='academy'?'cafe-home':''} ${s.background==='white'?'white-home':''} ${travelerWalking()?'is-traveling':''}">${travelerMovingScene(s.background)}${travelerPanorama(s.background)?`<div data-loop-tiles="2" class="desert-pan-track ${s.background!=='desert'?'forest-pan-track':''}" aria-hidden="true">${Array.from({length:3},()=>travelerPanoramaTiles(s.background).map(src=>s.background==='city'?`<div class="city-pan-tile"><img src="${src}" alt="" draggable="false"></div>`:`<img src="${src}" alt="" draggable="false">`).join('')).join('')}</div>`:''}<header class="traveler-hud"><strong>Lv.${p.lv}</strong><small>${p.xp.toLocaleString("ko-KR")} / ${LevelCurve.required(p.lv).toLocaleString()} EXP</small><div class="traveler-hud-bar" role="progressbar" aria-label="레벨 경험치" aria-valuemin="0" aria-valuemax="${LevelCurve.required(p.lv)}" aria-valuenow="${p.xp}">${bar(p.xp/LevelCurve.required(p.lv)*100)}</div></header><div class="traveler-stage"><div class="traveler-art" data-traveler-art data-walking="${travelerWalking()}">${travelerArt()}</div></div></section>`;
};
function travelerCafeScene(night=false){
 return `<div class="cafe-world ${night?'cafe-at-night':''}" role="img" aria-label="현대적인 카페에서 노트북으로 작업하는 여행자"><img src="assets/characters/male/cafe-day.png" alt=""><div class="cafe-steam" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div><i class="cafe-eye cafe-eye-left" aria-hidden="true"></i><i class="cafe-eye cafe-eye-right" aria-hidden="true"></i></div>`;
}
function travelerBundleCard(bg){
 if(TravelerRewards.items[bg]?.pending)return '<article class="journey-card journey-bundle reward-coming-soon" data-bundle="'+bg+'"><div class="journey-art" style="background:#edf1f5"><span style="color:#64748b;font-size:15px;font-weight:600">준비중</span></div><div class="journey-card-copy"><div class="reward-title-row"><h3>'+esc(TravelUnlocks.destinations[bg]?.name||bg)+'</h3><span>Lv.50+</span></div><p class="reward-income">새로운 여행지를 준비하고 있어요.</p><button type="button" disabled>준비중</button></div></article>';
 const s=travelerState(),motion=TravelerRewards.bundles[bg],level=TravelerRewards.items[bg].level;
 const owned=level===1||s.claimed.includes(bg),locked=!owned&&(player().lv<level||!!(TravelUnlocks.status(bg,player().lv,data.logs,data.travelerJourney,today())&&!TravelUnlocks.status(bg,player().lv,data.logs,data.travelerJourney,today()).unlocked)),equipped=s.background===bg&&s.motion===motion;
 const labels={white:['황무지','가만히 서 있기'],desert:['새싹 초원','걷기'],forest:['푸른 숲','걷기'],deepForest:['고대 유적','달리기'],runFrontier:['설산','달리기 +'],flightFrontier:['하늘 성','마법 빗자루 타기'],sky:['하늘 성','마법 빗자루 타기'],city:['한국 · 서울','스쿠터 타기'],japan:['일본 · 도쿄','걷기'],italy:['이탈리아 · 로마','걷기'],france:['프랑스 · 파리','걷기'],britain:['영국 · 런던','걷기'],america:['미국 · 뉴욕','걷기']};
 for(const [id,d] of Object.entries(TravelUnlocks.destinations))labels[id]=[d.name,'걷기'];
 const panorama=travelerPanorama(bg);
 const scene=TravelerRewards.items[bg].pending?'<div class="reward-pending-scene">새로운 여정을 준비하고 있어요</div>':panorama?`<div class="reward-panorama" style="background-image:url('${panorama}')"></div>`:travelerScene(bg);
 const character=bg==='academy'?'':motion==='fly'?'<canvas class="traveler-flight flight-preview" width="256" height="256" aria-label="마법 빗자루 타기 미리보기"></canvas>':['walk','run','deepRun'].includes(motion)?`<canvas class="reward-ground-motion" data-motion="${motion}" width="256" height="256" aria-label="${labels[bg][1]} 미리보기"></canvas>`:`<img class="bundle-standing" src="${travelerStanding}" alt="">`;
 const action=TravelerRewards.items[bg].pending?'<button disabled>배경 준비 중</button>':locked?`<button data-travel-conditions="${bg}">해금 조건 확인</button>`:!owned?`<button data-journey-action="claim" data-journey-item="${bg}">보상 받기</button>`:equipped?'<button class="equipped" disabled>✓ 장착 중</button>':`<button data-journey-action="equip" data-journey-item="${bg}">장착하기</button>`;
 const exp=TravelerRewards.items[bg].exp??TravelerRewards.items[motion].exp;
 return `<article class="journey-card journey-bundle ${locked?'locked':''} ${equipped?'is-equipped':''}" data-bundle="${bg}"><div class="journey-art art-${bg}">${scene}${locked?'<span class="travel-locked-badge" aria-label="잠긴 여행지">🔒</span>':''}<div class="bundle-character">${character}</div></div><div class="journey-card-copy"><div class="reward-title-row"><h3>${labels[bg][0]}</h3><span>Lv.${TravelerRewards.items[bg].levelLabel||level}</span></div><p class="reward-income">${exp?`5초마다 +${exp} EXP`:'기본 보상'}</p>${action}</div></article>`;
}
function travelerJourneyBanner(lv){
 const stages=[
  [1,'여정의 준비','모든 시작은 여기서','황무지에서의 만남','white'],
  [5,'첫 번째 여정','작은 여행의 시작','초원과 첫 발걸음','desert'],
  [10,'두 번째 여정','초록빛 길을 따라','푸른 숲에서 걷기','forest'],
  [20,'세 번째 여정','더 깊은 곳으로','고대 유적 속 새로운 모험','deepForest'],
  [30,'네 번째 여정','설산','눈 덮인 능선을 따라 달리기','runFrontier'],[40,'다섯 번째 여정','하늘 성','빗자루를 타고 하늘 성으로','sky'],
  [50,'여섯 번째 여정','한국 · 서울','서울로 향해요','city'],[60,'일곱 번째 여정','일본 · 도쿄','도쿄타워가 보이는 거리로','japan'],

 ];
 const [level,label,title,description,bg]=stages.filter(s=>s[0]<=lv).pop()||stages[0];
 const panorama=travelerPanorama(bg);
 return `<header class="journey-banner banner-${bg}"${panorama?` style="background-image:linear-gradient(90deg,#25302ce6,#25302c50),url('${panorama}')"`:''}><small>${label}</small><h2>${title}</h2><p>Lv.${level} · ${description}</p><span>나의 레벨 <b>Lv.${lv}</b></span></header>`;
}
let rewardCarouselIndex=0;
pages.rewards=()=>{
 const p=player(),s=travelerState(),bundles=Object.keys(TravelerRewards.bundles).filter(bg=>!TravelUnlocks.destinations[bg]?.hidden);
 // On entry, start at the equipped reward; keep browsing position on in-page rerenders.
 if(!document.querySelector('.reward-carousel'))rewardCarouselIndex=Math.max(0,bundles.indexOf(travelerState().background));
 const initialRewardIndex=rewardCarouselIndex;
 requestAnimationFrame(()=>{const list=document.querySelector(".reward-carousel");if(list){list.scrollLeft=rewardCardOffset(list,initialRewardIndex);updateRewardCarousel(list);}});
 const next=bundles.find(bg=>!s.claimed.includes(bg)&&(TravelerRewards.items[bg].level>p.lv||TravelUnlocks.status(bg,p.lv,data.logs,data.travelerJourney,today())?.unlocked===false));
 let featured='';
 if(next){
  const target=TravelerRewards.items[next].level,previous=Math.max(1,...bundles.map(bg=>TravelerRewards.items[bg].level).filter(lv=>lv<target));
  const remaining=Math.max(0,LevelCurve.total(target)-LevelCurve.total(p.lv)-p.xp);
  const progress=Math.max(0,Math.min(100,(LevelCurve.total(p.lv)+p.xp-LevelCurve.total(previous))/(LevelCurve.total(target)-LevelCurve.total(previous))*100));
  featured=`<section class="reward-next"><div class="reward-section-title"><h2>다음 여행 지도</h2><span>현재 Lv.${p.lv}</span></div>${travelerBundleCard(next)}<div class="reward-next-progress"><div><strong>Lv.${target}까지</strong><span>${remaining.toLocaleString()} EXP 남음</span></div><div role="progressbar" aria-label="다음 보상 진행률" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(progress)}">${bar(progress)}</div></div></section>`;
 if(p.lv>=target)featured=`<section class="reward-next"><div class="reward-section-title"><h2>다음 여행 지도</h2><span>활동 조건을 채워 보세요</span></div>${travelerBundleCard(next)}</section>`;
 }else featured='<div class="reward-complete"><strong>모든 여행지의 레벨 조건을 해금했어요!</strong><p>마음에 드는 보상으로 오늘을 보내세요.</p></div>';
 return `<section class="page journey-pass reward-readable">${heading('여행 지도')}<p class="journey-intro">배경과 동작을 한 세트로 받아요.<br>받은 보상은 언제든 자유롭게 교체할 수 있어요.</p>${featured}<section class="reward-collection"><div class="reward-section-title"><h2>전체 보상</h2><span>${bundles.length}가지 여정</span></div><div class="reward-list reward-carousel" role="region" aria-label="전체 보상 슬라이드" tabindex="0">${bundles.map(bg=>travelerBundleCard(bg)).join('')}</div><div class="reward-carousel-controls"><span data-reward-position aria-live="polite">1 / ${bundles.length}</span></div></section></section>`;
};

pages.style=()=>`<section class="page">${heading('꾸미기','',true)}</section>`;
function changeTravelerReward(action,id){
 travelerAccrueIncome();
 const item=TravelerRewards.items[id],current=travelerState();
 // Validate the same effective pair shown in preview, while saving only owned equipment.
 const saved=travelerForestPreview()?{...data.travelerJourney,background:current.background,motion:current.motion}:data.travelerJourney;
 const gate=TravelUnlocks.status(id,player().lv,data.logs,saved,today());
 if(gate&&!gate.unlocked){toast(`Lv. ${gate.levelLabel||gate.level} · ${gate.label} (${Math.min(gate.count,gate.target)} / ${gate.target}회)`);return false;}
 const next=TravelerRewards.change(saved,player().lv,action,id,data.logs,today());
 if(!next){
  if(action==='equip'&&item&&!TravelerRewards.compatible(item.slot==='background'?id:current.background,item.slot==='motion'?id:current.motion))
   toast(id==='sky'?'마법 빗자루 타기 보상을 먼저 받아 주세요.':'하늘에서는 불가능한 동작입니다.');
  return false;
 }
 const previous=data.travelerJourney,previousIncome=data.passiveIncome;data.travelerJourney=next;
 if(action==='equip')data.passiveIncome={at:Date.now(),background:next.background,rate:travelerIncomeRate(next)};
 if(!persist()){if(previous===undefined)delete data.travelerJourney;else data.travelerJourney=previous;if(previousIncome===undefined)delete data.passiveIncome;else data.passiveIncome=previousIncome;return false}
 if(action==='equip'&&travelerForestPreview())Object.assign(travelerPreviewEquipment,{background:next.background,motion:next.motion});
 render();toast(action==='claim'?'보상을 받았어요. 장착해서 사용해 보세요.':'장착했어요. 홈에서 확인해 보세요.');return true;
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-journey-action]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();changeTravelerReward(b.dataset.journeyAction,b.dataset.journeyItem)},true);
const travelerBaseRender=render;
render=function(){
 travelerBaseRender();const app=document.getElementById('app');
 app.classList.toggle('is-traveler-home',page==='home');app.classList.toggle('is-rewards',false);app.classList.toggle('is-journey-pass',page==='rewards');
 const nav=document.querySelector('.nav');if(nav){nav.classList.add('traveler-nav');nav.innerHTML=[['home','홈','home'],['history','기록','history'],['rewards','여행 지도','trophy']].map(([id,label,ic])=>`<button data-page="${id}" class="${page===id?'active':''}" ${page===id?'aria-current="page"':''}>${icon(ic)}${label}</button>`).join('')}
};
function refreshTraveler(){const target=document.querySelector('[data-traveler-art]');if(!target)return;const walking=travelerWalking();if(target.dataset.walking!==String(walking)){target.innerHTML=travelerArt();target.dataset.walking=String(walking)}document.querySelector('.desert-home')?.classList.toggle('is-traveling',walking)}
setInterval(()=>{if(!document.hidden)refreshTraveler()},1000);
window.addEventListener('focus',refreshTraveler);render();

// Reconcile elapsed time for the equipped reward, including time away from the app.
function travelerIncomeRate(state){return TravelerRewards.items[state.background]?.exp??TravelerRewards.items[state.motion]?.exp??0;}
function travelerAccrueIncome(){
 if(window.QuestSessionPaused)return 0;
 const state=TravelerRewards.state(data.travelerJourney,player().lv);
 const previous=data.walkExp,checkpoint=data.passiveIncome;
 const gain=PassiveIncome.settle(data,state.background,travelerIncomeRate(state),Date.now());
 if(JSON.stringify(checkpoint)===JSON.stringify(data.passiveIncome)&&previous===data.walkExp)return 0;
 if(!persist()){data.walkExp=previous;if(checkpoint===undefined)delete data.passiveIncome;else data.passiveIncome=checkpoint;return 0;}
 return gain;
}
(()=>{
 const update=()=>{
  const gain=travelerAccrueIncome();
  if(!gain)return;
  const p=player(),hud=document.querySelector('.traveler-hud');
  if(hud){hud.querySelector('strong').textContent='Lv.'+p.lv;hud.querySelector('small').textContent=p.xp.toLocaleString('ko-KR')+' / '+LevelCurve.required(p.lv).toLocaleString()+' EXP';const progress=hud.querySelector('[role="progressbar"]');progress.setAttribute('aria-valuemax',String(LevelCurve.required(p.lv)));progress.setAttribute('aria-valuenow',String(p.xp));progress.innerHTML=bar(p.xp/LevelCurve.required(p.lv)*100);}
 };
 update();setInterval(update,1000);
 window.addEventListener('focus',update);
 document.addEventListener('visibilitychange',update);
})();

// Ground animation owns the track when walking; flight has its own steady drift.
(()=>{let last=0,distance=0;function tick(now){
 const track=document.querySelector('.desert-pan-track'),flying=!!document.querySelector('.motion-fly');
 if(track&&flying&&!document.querySelector('canvas.female-motion')&&!document.hidden&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
  if(last)distance+=Math.min(now-last,50)*.032;
  const repeat=travelerTrackRepeat(track);
  if(repeat>0)track.style.transform=`translateX(${-2*repeat+(distance%repeat)}px)`;
 }
 last=now;requestAnimationFrame(tick);
}requestAnimationFrame(tick)})();

function rewardCardOffset(list,index){
 const card=list.children[Math.max(0,Math.min(list.children.length-1,index))];
 return card?card.getBoundingClientRect().left-list.getBoundingClientRect().left+list.scrollLeft:0;
}
function nearestRewardCard(list){
 let nearest=0,distance=Infinity;
 for(let i=0;i<list.children.length;i++){const d=Math.abs(rewardCardOffset(list,i)-list.scrollLeft);if(d<distance){nearest=i;distance=d;}}
 return nearest;
}
function updateRewardCarousel(list){
 const total=list.children.length;
 rewardCarouselIndex=Math.max(0,Math.min(total-1,nearestRewardCard(list)));
 list.nextElementSibling.querySelector('[data-reward-position]').textContent=(rewardCarouselIndex+1)+' / '+total;
}
document.addEventListener('scroll',event=>{if(event.target.matches?.('.reward-carousel'))updateRewardCarousel(event.target)},true);
document.addEventListener('keydown',event=>{
 if(!event.target.matches?.('.reward-carousel')||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
 event.preventDefault();const list=event.target;
 const index=event.key==='Home'?0:event.key==='End'?list.children.length-1:Math.max(0,Math.min(list.children.length-1,rewardCarouselIndex+(event.key==='ArrowRight'?1:-1)));
 list.scrollTo({left:rewardCardOffset(list,index),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
});
// Touch uses native scrolling; mouse dragging also works over the equip button.
(()=>{
 let drag=null,suppressClick=null;
 document.addEventListener('pointerdown',event=>{
  const list=event.target.closest('.reward-carousel');
  if(!list||event.pointerType!=='mouse'||event.button!==0)return;
  suppressClick=null;drag={list,id:event.pointerId,x:event.clientX,left:list.scrollLeft,moved:false};
 });
 document.addEventListener('pointermove',event=>{
  if(!drag||event.pointerId!==drag.id)return;
  const dx=event.clientX-drag.x;
  if(!drag.moved&&Math.abs(dx)<6)return;
  if(!drag.moved){drag.moved=true;drag.list.classList.add('is-dragging');drag.list.setPointerCapture(event.pointerId);}
  event.preventDefault();drag.list.scrollLeft=drag.left-dx;
 });
 function finish(event){
  if(!drag||event.pointerId!==drag.id)return;
  const {list,moved,id}=drag;drag=null;
  if(!moved)return;
  suppressClick=list;list.classList.remove('is-dragging');
  if(list.hasPointerCapture(id))list.releasePointerCapture(id);
  const index=nearestRewardCard(list);
  list.scrollTo({left:rewardCardOffset(list,index),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
 }
 document.addEventListener('pointerup',finish);
 document.addEventListener('pointercancel',finish);
 document.addEventListener('click',event=>{
  if(suppressClick&&suppressClick.contains(event.target)){event.preventDefault();event.stopImmediatePropagation();suppressClick=null;}
 },true);
 document.addEventListener('dragstart',event=>{if(event.target.closest('.reward-carousel'))event.preventDefault();});
})();


// Conditions stay out of the card until explicitly requested.
document.addEventListener('click',event=>{
 const button=event.target.closest('[data-travel-conditions]');if(!button)return;
 const id=button.dataset.travelConditions,item=TravelerRewards.items[id];if(!item)return;
 const gate=TravelUnlocks.status(id,player().lv,data.logs,data.travelerJourney,today());
 const name=button.closest('.journey-card')?.querySelector('h3')?.textContent||'여행지';
 const dialog=document.createElement('dialog');dialog.className='travel-conditions-dialog';dialog.setAttribute('aria-labelledby','travel-conditions-title');
 dialog.innerHTML='<h2 id="travel-conditions-title">해금 조건</h2><p class="conditions-place">'+esc(name)+'</p><div class="conditions-row"><span>Lv. '+item.level+' 달성</span><strong>'+Math.min(player().lv,item.level)+' / '+item.level+'</strong><small>'+(player().lv>=item.level?'✓ 달성':'아직 달성하지 않았어요')+'</small></div>'+(gate?'<div class="conditions-row"><span>'+esc(gate.label)+'</span><strong>'+Math.min(gate.count,gate.target)+' / '+gate.target+(gate.unit||'회')+'</strong>'+(gate.activityMet?'<small>✓ 달성</small>':'')+'</div>':'')+'<button type="button">확인</button>';
 document.body.appendChild(dialog);dialog.querySelector('button').onclick=()=>dialog.close();
 dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
 dialog.addEventListener('close',()=>{dialog.remove();button.focus();},{once:true});dialog.showModal();
});
