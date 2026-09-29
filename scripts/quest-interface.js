'use strict';
let questOnboardingActive=false;
(()=>{
 const titles=['학원','교과목 공부','독서','코딩','가벼운 러닝','근력 운동','요리','방 청소','가벼운 산책','게임','영화 감상','커피 마시기','에너지 드링크 한 병','박카스 한 병','음악 감상','노래 부르기','필라테스','스트레칭','외국어 공부','오늘 할 일 3가지','감사 일기','물 한 잔','화면 없이 15분','가계부 정리','독서 50쪽','주 3회 운동','한 공간 정리','주간 회고','주 3회 요리','취미 1시간','주 3회 산책','안부 전하기'];
 const categoryNames=['자기계발','운동','생활','휴식'];
 const questCategory=id=>acts[id][1]===4?2:acts[id][1];
 const categoryIcons=['book','dumbbell','home','headphones','coffee'];
 const introPreview=new URLSearchParams(location.search).get('intro')==='1';
 let filter='0',view='daily',lastDate=today(),step=0,editing=introPreview;
 let draft={name:data.questProfile?.name||'',gender:data.travelerCharacter||'male',goals:data.questProfile?.goals?.slice()||[0,1,2,3]};
 // Only completing all four introduction steps dismisses first-launch setup.
 const needsSetup=()=>data.questProfile?.version!==1||data.questProfile?.onboardingCompleted!==true;
 const profileName=()=>data.questProfile?.name||'나';
 const removedQuestIds=new Set([1,19,20,22,24,25,26,27,28,29,30,31,34,35,36,37,38,39,40,42,43,44]); // Keep historical activity IDs intact.
 const ids=(period='daily')=>period==='weekly'?DailyQuests.weeklyOffering(data,today()):acts.map((_,id)=>id).filter(id=>!removedQuestIds.has(id)&&(QuestCatalog[id]?.period||'daily')===period);
 const state=(id)=>QuestCatalog[id]?.period==='weekly'?({...DailyQuests.weeklyStatus(data,today(),id),...DailyQuests.weeklyProgress(data,today(),WeeklyQuestRules[id])}):DailyQuests.status(data,today(),id);
 const dailyBase={0:30,1:30,2:20,3:30,4:30,5:30,6:25,7:20,8:15,9:10,10:15,11:10,12:10,13:10,14:10,15:15,16:30,17:10,18:20,19:10,21:10,23:15,40:25,41:30,42:30,43:20,44:20,46:30,47:30,48:30};
 const weeklyBase={32:120,33:150,34:100,36:130,37:100,38:110,39:100,45:100};
 const questXp=id=>dailyBase[id]??weeklyBase[id]??20;
 const balancedWeeklyRules=()=>Object.fromEntries(Object.entries(WeeklyQuestRules).filter(([id])=>ids('weekly').includes(Number(id))).map(([id,rule])=>[id,{...rule,xp:questXp(Number(id))}]));
 const summary=(period='daily')=>{const list=ids(period),completed=list.filter(id=>state(id).done);return {done:completed.length,total:list.length,xp:completed.reduce((sum,id)=>sum+state(id).xp,0)};};
 const portrait=gender=>`assets/characters/${gender}/idle-standing.png`;
 const arrow='<span aria-hidden="true">↗</span>';
 function openCharacterChange(){
  if(document.querySelector('.character-change-dialog'))return;
  const current=data.travelerCharacter||'male';let choice=current;
  const dialog=document.createElement('dialog');dialog.className='character-change-dialog';
  dialog.setAttribute('aria-labelledby','character-change-title');
  dialog.innerHTML=`<h2 id="character-change-title">캐릭터 변경</h2><p>함께할 캐릭터를 골라주세요.</p><div class="character-options">${['male','female'].map((gender,i)=>`<button class="character-option ${gender===current?'chosen':''}" data-choice="${gender}" aria-pressed="${gender===current}"><img src="${portrait(gender)}" alt="${i?'여자':'남자'} 캐릭터"><span>${i?'여자':'남자'}</span></button>`).join('')}</div><label class="name-field">이름<input data-character-name maxlength="16" value="${esc(data.questProfile?.name||'')}" placeholder="이름을 입력해 주세요" autocomplete="nickname"><small>이름만 변경하면 기존 기록이 유지돼요.</small></label><p class="character-reset-notice"><strong>성별을 변경하면 모든 정보가 초기화돼요.</strong><br>목표, 레벨·경험치, 퀘스트·활동 기록, 보상과 알람 설정이 초기화되며 되돌릴 수 없어요. 입력한 이름은 새 캐릭터에 적용돼요.</p><p role="alert"></p><button class="q-primary" data-confirm-character disabled>이름 저장</button><button class="q-text" data-close-character>취소</button>`;
  document.body.appendChild(dialog);
  dialog.addEventListener('close',()=>dialog.remove());
  dialog.querySelector('[data-close-character]').onclick=()=>dialog.close();
  const nameInput=dialog.querySelector('[data-character-name]');
  const updateSave=()=>{
   const button=dialog.querySelector('[data-confirm-character]');
   button.textContent=choice===current?'이름 저장':'초기화하고 변경';
   button.disabled=choice===current&&nameInput.value.trim()===(data.questProfile?.name||'');
  };
  nameInput.addEventListener('input',updateSave);
  dialog.querySelectorAll('[data-choice]').forEach(button=>button.onclick=()=>{
   choice=button.dataset.choice;
   dialog.querySelectorAll('[data-choice]').forEach(item=>{item.classList.toggle('chosen',item.dataset.choice===choice);item.setAttribute('aria-pressed',String(item.dataset.choice===choice));});
   updateSave();
  });
  dialog.querySelector('[data-confirm-character]').onclick=()=>{
   const name=nameInput.value.trim().slice(0,16);
   let saved=false;
   if(choice===current){
    const previous=data.questProfile;data.questProfile={...previous,name};
    saved=persist();if(!saved)data.questProfile=previous;
    else render();
   }else saved=resetForTravelerCharacter(choice,name);
   if(saved){dialog.close();toast(choice===current?'이름을 변경했어요.':'정보를 초기화하고 캐릭터를 변경했어요.');}
   else dialog.querySelector('[role="alert"]').textContent='변경 내용을 저장하지 못했어요. 다시 시도해 주세요.';
  };
  dialog.showModal();
 }
 function onboarding(){
  const progress=`<div class="setup-top"><span class="brand">DAY +1</span><span>${step+1} / 4</span></div><div class="setup-progress" aria-label="설정 ${step+1}단계, 총 4단계">${[0,1,2,3].map(i=>`<i class="${i<=step?'filled':''}"></i>`).join('')}</div>`;
  const back=step?'<button class="q-text" data-setup-back>← 이전</button>':editing?'<button class="q-text" data-setup-close>닫기</button>':'';
  let body='';
  if(step===0)body=`<div class="setup-copy"><span class="q-kicker">YOUR EVERYDAY ADVENTURE</span><h1>나의 하루를<br>경험치로 <em>+1</em></h1><p>평범한 하루도 성장의 기록이 돼요.</p></div><div class="welcome-art"><span class="welcome-orbit orbit-one">✦</span><span class="welcome-orbit orbit-two">＋</span><img src="${portrait(draft.gender)}" alt="모험을 시작하는 캐릭터"><span class="welcome-label">작은 성취, 차곡차곡.</span></div><div class="welcome-features"><span>✓ 간단하게 남기는 오늘의 활동</span><span>✓ 기록할 때마다 쌓이는 경험치</span><span>✓ 함께 달라지는 캐릭터와 배경</span></div>`;
  if(step===1)body=`<div class="setup-copy"><span class="q-kicker">MEET YOUR CHARACTER</span><h1>함께할 캐릭터를<br>골라주세요.</h1><p>캐릭터는 나중에도 바꿀 수 있어요.</p></div><div class="character-options">${['male','female'].map((gender,i)=>`<button class="character-option ${draft.gender===gender?'chosen':''}" data-setup-gender="${gender}" aria-pressed="${draft.gender===gender}"><img src="${portrait(gender)}" alt="${i?'여자':'남자'} 캐릭터"><span>${i?'여자':'남자'}<b>${draft.gender===gender?'✓':'○'}</b></span></button>`).join('')}</div><label class="name-field">어떤 이름으로 불러드릴까요?<input id="quest-name" maxlength="16" placeholder="닉네임 (선택)" value="${esc(draft.name)}" autocomplete="nickname"><small>비워 두면 ‘나’로 시작해요.</small></label>`;
  if(step===2)body=`<div class="setup-copy"><span class="q-kicker">MAKE IT YOURS</span><h1>어떤 하루를<br>만들고 싶나요?</h1><p>관심 있는 목표를 골라주세요. 여러 개도 좋아요.</p></div><div class="goal-options">${categoryNames.slice(0,4).map((name,i)=>`<button data-setup-goal="${i}" class="${draft.goals.includes(i)?'chosen':''}" aria-pressed="${draft.goals.includes(i)}">${icon(categoryIcons[i])}<span>${['배우고 성장하기','꾸준히 몸 움직이기','일상 돌보기','잘 쉬어가기'][i]}</span><b>${draft.goals.includes(i)?'✓':'＋'}</b></button>`).join('')}</div><p class="setup-note">관심 있는 일상의 방향을 골라주세요.<br>항목별 활동은 언제든 둘러볼 수 있어요.</p>`;
  if(step===3)body=`<div class="setup-copy"><span class="q-kicker">READY WHEN YOU ARE</span><h1>${esc(draft.name.trim()||'나')}의 하루,<br>이제 시작해볼까요?</h1><p>오늘 보낸 하루를 간단하게 남겨보세요.</p></div><div class="welcome-art ready-art"><img src="${portrait(draft.gender)}" alt="선택한 캐릭터"><span class="welcome-label">나의 하루가 경험치가 돼요.</span></div><div class="setup-tags">${draft.goals.map(i=>`<span>${categoryNames[i]}</span>`).join('')}</div>`;
  return `<section class="quest-setup">${progress}${body}<footer>${editing&&step===1?'<button class="q-text" data-setup-intro>처음 안내 다시 보기</button>':''}${back}<button class="q-primary" data-setup-next ${step===2&&!draft.goals.length?'disabled':''}>${step===0?'시작하기':step===3?'나의 하루 시작하기':'다음으로'} ${arrow}</button></footer></section>`;
 }
 const oldHistory=pages.history;
 pages.archive=()=>`<div class="quest-archive"><button class="q-text archive-back" data-page="history">← 활동으로 돌아가기</button>${oldHistory().replace(/<button[^>]*data-page="touch"[^>]*>[\s\S]*?<\/button>/g,'')}</div>`;
 pages.history=()=>{
  const weekly=view==='weekly',s=summary(view),list=ids(view).filter(id=>weekly||questCategory(id)===Number(filter)).sort((a,b)=>questCategory(a)-questCategory(b)||a-b);
  return `<section class="quest-page"><header class="q-heading"><div><span class="q-kicker">ONE DAY, ONE STEP</span><h1>${weekly?'주간 도전':'오늘의 활동'}</h1><p>${weekly?DailyQuests.weekStart(today())+'부터 · 월요일 시작':new Date().toLocaleDateString('ko-KR',{month:'long',day:'numeric',weekday:'long'})} · 나만의 속도로, 하나씩.</p></div></header><div class="quest-view-tabs" role="group" aria-label="활동과 도전"><button data-quest-view="daily" aria-pressed="${!weekly}">오늘의 활동</button><button data-quest-view="weekly" aria-pressed="${weekly}">주간 도전</button></div><div class="quest-progress-card"><div><span>${weekly?'이번 주 도전 달성':'오늘 남긴 활동'}</span><strong>${s.done}<small>${weekly?' / '+s.total+' 달성':'개 기록'}</small></strong></div><span class="earned-pill">${weekly?'':'획득 예정 · '}+${s.xp} EXP</span><p>${weekly?'매주 월요일 새로운 도전 4개가 열려요.<br>활동을 기록하면 자동으로 반영돼요.':'오늘의 활동을 기록해 보세요.<br>쌓인 경험치는 자정에 자동으로 지급돼요.'}</p></div>${weekly?'':`<div class="quest-filters" role="group" aria-label="활동 분류">${categoryNames.map((n,i)=>[String(i),n]).map(([id,name])=>`<button data-quest-filter="${id}" aria-pressed="${filter===id}">${name}</button>`).join('')}</div>`}<div class="quest-list">${list.length?list.map(id=>{const a=acts[id],done=state(id);if(!weekly)return `<button type="button" class="quest-card academy-card ${done.done?'is-complete':''}" data-quest-id="${id}" data-quest-date="${today()}" data-quest-complete="${!done.done}" aria-pressed="${done.done}" aria-label="${esc(titles[id]||a[0])} ${done.done?'완료 취소':'활동 기록'}" ${done.legacy?'disabled':''}>${done.done?'<span class="academy-done-mark" aria-hidden="true"><svg viewBox="0 0 32 32" fill="none"><path d="M8 16.5 13.5 22 24 10" pathLength="1" /></svg></span><span class="academy-done-label">'+esc(titles[id]||a[0])+' 완료</span>':`<span class="quest-symbol category-${questCategory(id)}">${icon(a[2])}</span><span class="quest-card-copy"><span class="academy-title">${esc(titles[id]||a[0])}</span><span class="quest-xp">+${questXp(id)} EXP</span></span>`}</button>`;return `<article class="quest-card ${done.done?'is-complete':''}"><span class="quest-symbol category-${questCategory(id)}">${icon(a[2])}</span><div class="quest-card-copy"><h2>${titles[id]||esc(a[0])}${weekly&&done.done?' 완료!':''}</h2>${weekly?`<p class="weekly-description">${esc(WeeklyQuestRules[id].description||'')}</p><div class="weekly-progress weekly-battery" role="progressbar" aria-label="${esc(a[0])}" aria-valuenow="${Math.min(done.count,done.target)}" aria-valuemin="0" aria-valuemax="${done.target}">${Array.from({length:done.target},(_,index)=>`<i class="${index<done.count?'is-filled':''}" aria-hidden="true"></i>`).join('')}</div>`:''}<span class="quest-xp">${done.done?(weekly?'✓ 달성 · ':'✓ 기록 · '):''}+${done.done?done.xp:questXp(id)} EXP${done.legacy?' · 기존 기록':''}</span></div>${weekly?`<span class="challenge-status ${done.done?'is-done':''}">${done.done?'✓ 달성':'진행 중'}</span>`:`<button class="quest-check" data-quest-id="${id}" data-quest-date="${today()}" data-quest-complete="${!done.done}" role="checkbox" aria-checked="${done.done}" aria-label="${esc(titles[id]||a[0])} ${done.done?'기록 취소':'활동 기록'}" ${done.legacy?'disabled':''}>${done.done?'✓':'＋'}</button>`}</article>`;}).join(''):'<div class="quest-empty"><h2>이 항목에는 아직 등록된 항목이 없어요.</h2></div>'}</div><button class="archive-link" data-page="archive">${icon('history')} 지난 활동 내역 보기 <span>→</span></button></section>`;
 };
 const home=pages.home;
 pages.home=()=>{
  const s=summary();
  return `<header class="quest-home-heading"><div><span class="q-kicker">MY DAILY ADVENTURE</span><h1>${esc(profileName())}의 하루</h1></div><button class="q-round" data-edit-profile aria-label="캐릭터 변경">${icon('user')}</button></header><div class="quest-scene-card">${home().replace(/<div class="character-picker"[\s\S]*?<\/div>/, '')}</div><section class="home-quest-summary"><div><span class="q-kicker">TODAY'S ACTIVITY</span><h2>오늘의 하루를 남겨요.</h2><p>오늘 활동 <b>${s.done}개</b> <span>획득 예정 · +${s.xp} EXP</span></p></div><button class="q-primary" data-page="history">활동 기록하기 ${arrow}</button></section>`;
 };
 const baseRender=render;
 render=function(){
  DailyQuests.syncWeekly(data,today(),balancedWeeklyRules(),persist);
  questOnboardingActive=needsSetup()||editing;
  if(questOnboardingActive){
   document.getElementById('app').className='app quest-app is-onboarding';
   document.getElementById('app').innerHTML=onboarding();return;
  }
  baseRender();const app=document.getElementById('app');app.classList.add('quest-app');app.classList.remove('is-onboarding');
  app.classList.toggle('quest-home',page==='home');
  const nav=document.querySelector('.nav');if(nav){nav.innerHTML=[['home','홈','home'],['history','활동','history'],['rewards','성장 보상','trophy'],['alarm','알람','bell']].map(([id,label,art])=>`<button data-page="${id}" class="${page===id||(id==='history'&&page==='archive')?'active':''}" ${page===id?'aria-current="page"':''}>${icon(art)}<span>${label}</span></button>`).join('');}
 };
 function finishSetup(){
  if(introPreview){
   const previous=data.questProfile;
   data.questProfile={...previous,name:draft.name.trim().slice(0,16)};
   if(!persist()){data.questProfile=previous;return;}
   location.href=location.pathname;return;
  }
  const backup=JSON.stringify(data);
  data.questProfile={version:1,onboardingCompleted:true,name:draft.name.trim().slice(0,16),goals:draft.goals.slice()};data.travelerCharacter=draft.gender;
  if(!persist()){data=JSON.parse(backup);return;}
  editing=false;page='home';render();window.scrollTo(0,0);
 }
 document.addEventListener('input',event=>{if(event.target.id==='quest-name')draft.name=event.target.value;});
 document.addEventListener('click',event=>{
  const button=event.target.closest('button');if(!button)return;const d=button.dataset;
  if(!Object.keys(d).some(key=>key.startsWith('quest')||key.startsWith('setup')||key==='editProfile'))return;
  event.preventDefault();event.stopImmediatePropagation();
  if('questId'in d){
   if(d.questDate!==today()){render();toast('새로운 하루가 시작됐어요. 오늘의 퀘스트를 확인해 주세요.');return;}
   const id=Number(d.questId);if(!acts[id]||removedQuestIds.has(id)||WeeklyQuestRules[id])return;
   const complete=d.questComplete==='true',award=questXp(id);
   const saveQuest=(...args)=>DailyQuests.saveWithWeekly(...args,balancedWeeklyRules());
   if(saveQuest(data,today(),id,complete,award,persist)){
    const scroll=window.scrollY;render();window.scrollTo(0,scroll);
    if(complete)document.querySelector(`[data-quest-id="${id}"]`)?.classList.add('academy-celebrate');
    document.querySelector(`[data-quest-id="${id}"]`)?.focus({preventScroll:true});
   }return;
  }
  if('questFilter'in d)filter=d.questFilter;
  if('questView'in d){view=d.questView;filter='0';}
  if('editProfile'in d){if(page==='home')openCharacterChange();return;}
  if('setupClose'in d)editing=false;
  if('setupIntro'in d)step=0;
  if('setupBack'in d){if(editing&&step===1)editing=false;else step=Math.max(0,step-1);}
  if('setupGender'in d)draft.gender=d.setupGender;
  if('setupGoal'in d){const goal=Number(d.setupGoal);draft.goals=draft.goals.includes(goal)?draft.goals.filter(i=>i!==goal):[...draft.goals,goal].sort();}
  if('setupNext'in d){if(step===2&&!draft.goals.length)return;if(step===3){finishSetup();return;}step++;}
  render();if('setupNext'in d||'setupBack'in d||'editProfile'in d||'setupIntro'in d)window.scrollTo(0,0);
 },true);
 function rollover(){if(lastDate!==today()){lastDate=today();if(!needsSetup()&&!editing)render();}}
 setInterval(rollover,1000);window.addEventListener('focus',rollover);
 render();if(needsSetup())window.scrollTo(0,0);
})();
