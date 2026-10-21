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
 // Developer-only grant: write ownership without changing real activity records.
 const next=TravelerRewards.state({...previous,claimed:[...new Set(Object.entries(TravelerRewards.bundles).flat())]});
 data.travelerJourney=next;
 if(!persist()){
  if(previous===undefined)delete data.travelerJourney;else data.travelerJourney=previous;
  return false;
 }
 render();return true;
}
function cancelDeveloperRewards(){
 const previous=data.travelerJourney;
 data.travelerJourney=TravelerRewards.state({claimed:[],background:'white'});
 if(!persist()){
  if(previous===undefined)delete data.travelerJourney;else data.travelerJourney=previous;
  return false;
 }
 render();return true;
}
async function resetDeveloperRewards(){
 if(!confirm('실제 계정의 앱 정보와 모든 기록을 초기화할까요?\n프로필·목표·활동·경험치·보상·여행·알람 설정이 삭제되며 복구할 수 없습니다. Google 로그인 계정은 유지됩니다.'))return false;
 window.QuestSessionPaused=true;
 const fresh={logs:[],worn:0,skin:2,friends:[],alarms:[['07:00','23:30',true,true],['09:00','00:30',true,true]],disableScenePreview:true,walkExp:0,playerResetEarned:0,levelBaseline:[0,0,0,0,0],levelCurveVersion:3,petProgressVersion:2};
 try{
  if(window.QuestAccountStorage)await window.QuestAccountStorage.reset(fresh);
  else localStorage.setItem(KEY,JSON.stringify(fresh));
  const manifest=JSON.parse(document.getElementById('quest-app-manifest').textContent);
  for(const key of new Set([KEY,manifest.legacyKey,...(manifest.legacyKeys||[])]))if(key)localStorage.removeItem(key);
  localStorage.setItem(KEY,JSON.stringify(fresh));
  location.replace(location.pathname);return true;
 }catch(error){console.error('Account reset failed',error);toast('초기화를 완료하지 못했어요. 연결을 확인하고 다시 시도해 주세요.');return false;}
}

function setDeveloperStrongWeek(complete){
 const previous=JSON.stringify({logs:data.logs,overrides:data.developerStrongWeeks});
 data.developerStrongWeeks={...data.developerStrongWeeks,[DailyQuests.weekStart(today())]:complete};
 if(!DailyQuests.syncWeekly(data,today(),{33:WeeklyQuestRules[33]},()=>true)||!persist()){
  const saved=JSON.parse(previous);data.logs=saved.logs;
  if(saved.overrides===undefined)delete data.developerStrongWeeks;else data.developerStrongWeeks=saved.overrides;
  return false;
 }
 render();return true;
}

// Presentation changes live only in an isolated in-memory copy.
const PresentationMode=(()=>{
 let original=null,preview=null;
 function begin(){
  if(original)return;
  original=data;preview={...travelerPreviewEquipment};
  data=JSON.parse(JSON.stringify(data));window.QuestPresentationActive=true;
  window.dispatchEvent(new Event('quest-presentation-change'));
 }
 function end(){
  if(!original)return;
  data=original;original=null;window.QuestPresentationActive=false;
  for(const key of Object.keys(travelerPreviewEquipment))delete travelerPreviewEquipment[key];
  Object.assign(travelerPreviewEquipment,preview);selected.clear();modal='';page='home';
  window.dispatchEvent(new Event('quest-presentation-change'));render();
 }
 function map(id){
  if(!TravelerRewards.bundles[id]||TravelerRewards.items[id].pending)return;
  begin();const level=TravelerRewards.items[id].level;
  data.playerResetEarned=player().earned-LevelCurve.total(level);
  data.travelerJourney=TravelerRewards.state({claimed:[id],background:id});
  Object.assign(travelerPreviewEquipment,{background:id,motion:TravelerRewards.bundles[id]});
  page='home';render();
 }
 function completeConditions(id){
  const item=TravelerRewards.items[id];
  if(!TravelerRewards.bundles[id]||item.pending)return false;
  begin();
  const rule=TravelUnlocks.requirements[id];
  if(rule){
   data.logs=data.logs||[];
   for(let offset=1;TravelUnlocks.count(data.logs,rule,today())<rule.target;offset++){
    const date=new Date(today()+'T12:00:00Z');
    date.setUTCDate(date.getUTCDate()-offset*(rule.kind==='weekly'?7:1));
    const day=date.toISOString().slice(0,10),quest=rule.ids[0];
    data.logs.push({date:day,source:rule.kind==='weekly'?'weekly-quest':'daily-quest',ids:[quest],exp:{},counts:{[quest]:1},penalty:0});
   }
  }
  const level=Math.max(player().lv,item.level);
  data.playerResetEarned=player().earned-LevelCurve.total(level);
  render();return true;
 }
 return {begin,end,map,completeConditions};
})();
(()=>{
 const baseRender=render;
 function mountButton(){
  const home=document.querySelector('.traveler-home');
  if(home&&!home.querySelector('[data-presentation-menu]')){
   const b=document.createElement('button');b.className='developer-level-button';b.dataset.presentationMenu='';
   b.textContent=window.QuestPresentationActive?'시연 중 · 메뉴':'시연';home.appendChild(b);
  }
  let badge=document.getElementById('presentation-banner');
  if(window.QuestPresentationActive&&!badge){
   badge=document.createElement('button');badge.id='presentation-banner';badge.type='button';badge.textContent='시연 중 · 저장되지 않음 · 종료';badge.onclick=()=>PresentationMode.end();document.body.appendChild(badge);
  }else if(!window.QuestPresentationActive&&badge)badge.remove();
 }
 render=function(){baseRender();mountButton();};
 new MutationObserver(mountButton).observe(document.getElementById('app'),{childList:true,subtree:true});
 document.addEventListener('click',e=>{
  if(!e.target.closest('[data-presentation-menu]')||document.querySelector('.presentation-dialog'))return;
  const dialog=document.createElement('dialog');dialog.className='developer-level-dialog presentation-dialog';
  dialog.setAttribute('aria-label','발표 시연');
  const maps=[['white','황무지 · 1'],['desert','초원 · 5'],['forest','숲 · 10'],['deepForest','유적 · 20'],['runFrontier','설산 · 30'],['sky','하늘 성 · 40'],['city','서울 · 50'],['japan','도쿄 · 50+'],['russia','모스크바 · 50+']];
  dialog.innerHTML='<h2>발표 시연</h2><p>시연 버튼을 누르면 임시 기록으로 전환됩니다.<br>실제 기록과 서버 저장에는 반영되지 않습니다.</p><h3>여행지 바로 보기</h3><div class="presentation-grid">'+maps.map(([id,label])=>'<button type="button" data-demo-map="'+id+'">'+label+'</button>').join('')+'</div><h3>해금 조건 완료</h3><div class="presentation-grid">'+maps.filter(([id])=>id!=='white').map(([id,label])=>'<button type="button" data-demo-condition="'+id+'">'+label.split(' · ')[0]+' 조건 완료</button>').join('')+'</div><h3>캐릭터 · 성장</h3><div class="presentation-grid"><button type="button" data-demo-gender="male">남자 캐릭터</button><button type="button" data-demo-gender="female">여자 캐릭터</button><button type="button" data-demo-activity>과일 먹기 완료</button><button type="button" data-demo-level>레벨 1 올리기</button></div><h3>처음 시작 · 실제 계정</h3><div class="presentation-grid"><button type="button" data-demo-intro>처음 화면 다시 보기</button><button type="button" data-demo-reset>내 정보 전체 초기화</button></div><p>전체 초기화는 실제 계정의 앱 정보와 기록을 삭제합니다. 실행 전에 다시 확인해요.</p><p data-reset-status role="status"></p><footer><button type="button" data-demo-end>시연 종료 · 원래 기록</button><button type="button" data-demo-close>닫기</button></footer>';
  document.body.appendChild(dialog);dialog.addEventListener('close',()=>dialog.remove());
  dialog.querySelector('[data-demo-intro]').onclick=()=>{dialog.close();PresentationMode.begin();window.dispatchEvent(new Event('quest-show-intro'));};
  dialog.querySelector('[data-demo-reset]').onclick=async()=>{
   const button=dialog.querySelector('[data-demo-reset]');button.disabled=true;
   try{if(!await resetDeveloperRewards())dialog.querySelector('[data-reset-status]').textContent='초기화가 취소되었거나 완료되지 않았어요.';}
   finally{button.disabled=false;}
  };
  dialog.querySelector('[data-demo-close]').onclick=()=>dialog.close();
  dialog.querySelector('[data-demo-end]').onclick=()=>{dialog.close();PresentationMode.end();};
  dialog.querySelectorAll('[data-demo-map]').forEach(b=>b.onclick=()=>{dialog.close();PresentationMode.map(b.dataset.demoMap);});
  dialog.querySelectorAll('[data-demo-condition]').forEach(b=>b.onclick=()=>{dialog.close();if(PresentationMode.completeConditions(b.dataset.demoCondition)){navigate('rewards');toast('시연: 해금 조건을 완료했어요. 여행지에서 직접 장착해 보세요.');}});
  dialog.querySelectorAll('[data-demo-gender]').forEach(b=>b.onclick=()=>{PresentationMode.begin();data.travelerCharacter=b.dataset.demoGender;dialog.close();page='home';render();});
  dialog.querySelector('[data-demo-activity]').onclick=()=>{PresentationMode.begin();DailyQuests.saveWithWeekly(data,today(),61,true,QuestCatalog[61]?.xp||10,persist,WeeklyQuestRules);dialog.close();navigate('history');toast('시연: 과일 먹기 완료');};
  dialog.querySelector('[data-demo-level]').onclick=()=>{PresentationMode.begin();const lv=player().lv;dialog.close();setDeveloperLevel(Math.min(999,lv+1));toast('시연: 레벨을 올렸어요.');};
  dialog.showModal();
 });render();
})();
