'use strict';
function setDeveloperLevel(value){
 const lv=Number(value);
 if(!Number.isInteger(lv)||lv<1||lv>999)return false;
 const previous=data.playerResetEarned;
 data.playerResetEarned=player().earned-LevelCurve.total(lv);
 if(!persist()){
  if(previous===undefined)delete data.playerResetEarned;else data.playerResetEarned=previous;
  return false;
 }
 render();return true;
}
function grantDeveloperExperience(){
 const previous=data.walkExp;
 data.walkExp=Math.max(0,Number(previous)||0)+5000;
 if(!persist()){
  if(previous===undefined)delete data.walkExp;else data.walkExp=previous;
  return false;
 }
 render();return true;
}
function resetDeveloperBroom(){
 const previous=data.magicBroom;
 delete data.magicBroom;
 if(!persist()){
  if(previous!==undefined)data.magicBroom=previous;
  return false;
 }
 window.dispatchEvent(new Event('magic-broom-reset'));
 render();return true;
}
function grantDeveloperRewards(){
 const previous=data.travelerJourney;
 let next=TravelerRewards.state(previous);
 for(const bg of Object.keys(TravelerRewards.bundles)){
  next=TravelerRewards.change(next,999,'claim',bg)||next;
 }
 data.travelerJourney=next;
 if(!persist()){
  if(previous===undefined)delete data.travelerJourney;else data.travelerJourney=previous;
  return false;
 }
 render();return true;
}
function resetDeveloperRewards(){
 const previous=data;
 data={logs:[],worn:0,skin:2,friends:[],alarms:[['07:00','23:30',true,true],['09:00','00:30',true,true]],disableScenePreview:true,walkExp:0,playerResetEarned:0,levelBaseline:[0,0,0,0,0],levelCurveVersion:3,petProgressVersion:2};
 if(!persist()){data=previous;return false;}
 // Reload also clears onboarding drafts, timers and temporary preview state.
 location.replace(location.pathname);
 return true;
}

(()=>{
 const baseRender=render;
 function mountButton(){
  const home=document.querySelector('.traveler-home, .night-home');
  if(home&&!home.querySelector('[data-developer-level]')){
   const button=document.createElement('button');button.className='developer-level-button';
   button.dataset.developerLevel='';button.textContent='개발자';home.appendChild(button);
  }
 }
 render=function(){baseRender();mountButton()};
 new MutationObserver(mountButton).observe(document.getElementById('app'),{childList:true,subtree:true});
 document.addEventListener('click',e=>{
  if(!e.target.closest('[data-developer-level]'))return;
  const dialog=document.createElement('dialog');dialog.className='developer-level-dialog';dialog.setAttribute('aria-label','개발자 메뉴');
  dialog.innerHTML=`<form><div class="developer-level-presets" role="group" aria-label="레벨 선택">${[1,80].map(lv=>`<button type="button" data-level="${lv}" aria-pressed="${player().lv===lv}">${lv}레벨</button>`).join('')}</div><div><button type="button" data-grant-exp>경험치 +5,000</button><button type="button" data-sample-records>이번 달 1~6일 샘플 기록</button></div><div role="group" aria-label="낮 밤 선택"><button type="button" data-dev-night="false">☀ 낮</button><button type="button" data-dev-night="true">☾ 밤</button></div><div><button type="button" data-preview-intro>처음 실행 화면 보기</button></div><div><button type="button" data-grant-rewards>모든 보상 획득</button><button type="button" data-reset-broom>빗자루 획득 초기화</button><button type="button" data-switch-character>남녀 전환</button></div><div><button type="button" data-reset-rewards>모두 초기화</button></div><div><button type="button" data-cancel>닫기</button></div></form>`;
  document.body.appendChild(dialog);
  dialog.addEventListener('close',()=>dialog.remove());
  dialog.querySelector('[data-cancel]').onclick=()=>dialog.close();
  dialog.querySelector('form').onsubmit=event=>event.preventDefault();
  dialog.querySelectorAll('[data-level]').forEach(button=>button.onclick=()=>{
   if(setDeveloperLevel(button.dataset.level)){dialog.close();toast(`${button.dataset.level}레벨로 변경했어요.`);}
   else toast('레벨을 저장하지 못했어요. 다시 눌러 주세요.');
  });
  dialog.querySelector('[data-sample-records]').onclick=()=>{
   const previous=JSON.stringify(data.logs),prefix=today().slice(0,7),pool=[0,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,21,23],xp={0:30,2:20,3:30,4:30,5:30,6:25,7:20,8:15,9:10,10:15,11:10,12:10,13:10,14:10,15:15,16:30,17:10,18:20,21:10,23:15};let added=0;
   for(let day=1;day<=6;day++){const date=prefix+'-'+String(day).padStart(2,'0');if(date>=today()||data.logs.some(l=>l.date===date))continue;const shuffled=[...pool];for(let i=shuffled.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];}const ids=shuffled.slice(0,3+Math.floor(Math.random()*4));data.logs.push({date,source:'sample-record',ids,exp:Object.fromEntries(ids.map(id=>[id,xp[id]])),counts:Object.fromEntries(ids.map(id=>[id,1])),penalty:0});added++;}
   if(!persist()){data.logs=JSON.parse(previous);return;}dialog.close();render();toast(added+'일의 샘플 기록을 추가했어요.');
  };
  dialog.querySelectorAll('[data-dev-night]').forEach(button=>button.onclick=()=>{travelerNightOverride={night:button.dataset.devNight==='true',scheduled:travelerScheduledNight()};dialog.close();transitionTravelerNight();});
  dialog.querySelector('[data-grant-exp]').onclick=()=>{
   if(grantDeveloperExperience()){
    dialog.querySelectorAll('[data-level]').forEach(button=>button.setAttribute('aria-pressed',String(player().lv===Number(button.dataset.level))));
    toast('+5,000 EXP');
   }else toast('경험치를 저장하지 못했어요. 다시 눌러 주세요.');
  };
  dialog.querySelector('[data-grant-rewards]').onclick=()=>{
   if(grantDeveloperRewards()){dialog.close();toast('모든 성장 보상을 획득했어요.');}
   else toast('보상을 저장하지 못했어요. 다시 눌러 주세요.');
  };
  dialog.querySelector('[data-switch-character]').onclick=()=>{
   const next=travelerFemale()?'male':'female';
   if(setTravelerCharacter(next)){dialog.close();toast(`${next==='female'?'여자':'남자'} 캐릭터로 전환했어요.`);}
   else toast('캐릭터를 저장하지 못했어요. 다시 눌러 주세요.');
  };
  dialog.querySelector('[data-reset-broom]').onclick=()=>{
   if(resetDeveloperBroom()){dialog.close();toast('빗자루 획득을 초기화했어요. 설산에서 다시 찾을 수 있어요.');}
   else toast('빗자루 초기화를 저장하지 못했어요.');
  };
  dialog.querySelector('[data-reset-rewards]').onclick=()=>{
   if(resetDeveloperRewards()){dialog.close();toast('모든 정보를 초기화했어요.');}
   else toast('초기화 내용을 저장하지 못했어요. 다시 눌러 주세요.');
  };
  dialog.querySelector('[data-preview-intro]').onclick=()=>{dialog.close();location.href=location.pathname+'?intro=1';};
  dialog.showModal();
 });
 render();
})();
