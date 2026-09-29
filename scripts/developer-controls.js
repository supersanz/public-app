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
function resetDeveloperRewards(){
 const updates={disableScenePreview:true,travelerJourney:TravelerRewards.state({}),logs:[],walkExp:0,playerResetEarned:0,levelBaseline:[0,0,0,0,0],levelCurveVersion:3};
 const previous=Object.fromEntries(Object.keys(updates).map(key=>[key,{exists:Object.hasOwn(data,key),value:data[key]}]));
 Object.assign(data,updates);
 if(!persist()){
  for(const [key,old] of Object.entries(previous)){if(old.exists)data[key]=old.value;else delete data[key];}
  return false;
 }
 Object.assign(travelerPreviewEquipment,{background:'white',motion:'still'});
 selected.clear();
 render();return true;
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
  const dialog=document.createElement('dialog');dialog.className='developer-level-dialog';
  dialog.innerHTML=`<form><h2>레벨 설정</h2><p>버튼을 누르면 해당 레벨의 경험치 0부터 시작해요.</p><div class="developer-level-presets" role="group" aria-label="레벨 선택">${[1,5,10,20,30,40].map(lv=>`<button type="button" data-level="${lv}" aria-pressed="${player().lv===lv}">${lv}레벨</button>`).join('')}</div><h2 style="margin-top:24px">화면 전환</h2><div role="group" aria-label="낮 밤 선택"><button type="button" data-dev-night="false">☀ 낮</button><button type="button" data-dev-night="true">☾ 밤</button></div><div><button type="button" data-preview-intro>처음 실행 화면 보기</button></div><h2 style="margin-top:24px">보상 초기화</h2><p>받은 성장 보상과 모든 기록을 삭제하고 1레벨 · 경험치 0으로 돌아가요.</p><div><button type="button" data-reset-rewards>받은 보상 모두 초기화</button></div><div><button type="button" data-cancel>닫기</button></div><small role="alert"></small></form>`;
  document.body.appendChild(dialog);
  dialog.addEventListener('close',()=>dialog.remove());
  dialog.querySelector('[data-cancel]').onclick=()=>dialog.close();
  dialog.querySelector('form').onsubmit=event=>event.preventDefault();
  dialog.querySelectorAll('[data-level]').forEach(button=>button.onclick=()=>{
   if(setDeveloperLevel(button.dataset.level)){dialog.close();toast(`${button.dataset.level}레벨로 변경했어요.`);}
   else dialog.querySelector('[role="alert"]').textContent='레벨을 저장하지 못했어요. 다시 눌러 주세요.';
  });
  dialog.querySelectorAll('[data-dev-night]').forEach(button=>button.onclick=()=>{travelerNightOverride={night:button.dataset.devNight==='true',scheduled:travelerScheduledNight()};dialog.close();transitionTravelerNight();});
  dialog.querySelector('[data-reset-rewards]').onclick=()=>{
   if(resetDeveloperRewards()){dialog.close();toast('보상과 모든 기록을 삭제했어요. 1레벨부터 다시 시작해요.');}
   else dialog.querySelector('[role="alert"]').textContent='보상을 초기화하지 못했어요. 다시 눌러 주세요.';
  };
  dialog.querySelector('[data-preview-intro]').onclick=()=>{dialog.close();location.href=location.pathname+'?intro=1';};
  dialog.showModal();
 });
 render();
})();
