'use strict';
let questOnboardingActive=false;
(()=>{
 const titles=['학원','교과목 공부','독서','코딩','가벼운 러닝','근력 운동','요리 하기','방 청소','가벼운 산책','게임','영화 감상','카페인 음료 마시기','에너지 드링크 마시기','박카스 마시기','음악 감상','노래 부르기','필라테스','스트레칭','외국어 공부','오늘 할 일 3가지','감사 일기','물 한 잔 마시기','화면 없이 15분','가계부 정리','독서 50쪽','주 3회 운동','한 공간 정리','주간 회고','주 3회 요리','취미 1시간','주 3회 산책','안부 전하기'];
 const categoryNames=['계발','운동','생활','휴식','식사'];
 const questCategory=id=>acts[id][1];
 const categoryIcons=['book','dumbbell','home','headphones','coffee'];
 const introPreview=new URLSearchParams(location.search).get('intro')==='1';
 let filter='0',view='daily',lastDate=today(),step=0,editing=introPreview;
 let draft={name:data.questProfile?.name||'',gender:data.travelerCharacter||'male',goals:[]};
 // Only completing all four introduction steps dismisses first-launch setup.
 const needsSetup=()=>data.questProfile?.version!==1||data.questProfile?.onboardingCompleted!==true;
 window.addEventListener('quest-show-intro',()=>{step=0;editing=true;draft={name:'',gender:'male',goals:[]};render();window.scrollTo(0,0);});
 window.addEventListener('quest-presentation-change',()=>{if(!window.QuestPresentationActive){editing=false;step=0;}});
 const profileName=()=>data.questProfile?.name||'나';
 const removedQuestIds=new Set([12,13,1,19,20,22,24,25,26,27,28,29,30,31,34,35,36,37,38,39,40,42,43,44,49,52,54,56,57,58,64,65,67,69,70,71,72]); // Keep historical activity IDs intact.
 const ids=(period='daily')=>period==='weekly'?DailyQuests.weeklyOffering(data,today()):acts.map((_,id)=>id).filter(id=>!removedQuestIds.has(id)&&(QuestCatalog[id]?.period||'daily')===period);
 const state=(id)=>QuestCatalog[id]?.period==='weekly'?({...DailyQuests.weeklyStatus(data,today(),id),...DailyQuests.weeklyProgress(data,today(),WeeklyQuestRules[id])}):DailyQuests.status(data,today(),id);
 const dailyBase={0:30,1:30,2:20,3:30,4:30,5:30,6:25,7:20,8:15,9:10,10:15,11:10,12:10,13:10,14:10,15:15,16:30,17:10,18:20,19:10,21:10,23:15,40:25,41:30,42:30,43:20,44:20,46:30,47:30,48:30};
 const weeklyBase={32:120,33:150,34:100,36:130,37:100,38:110,39:100,45:100};
 const activeFocus=()=>{const p=data.questProfile;return Number.isInteger(p?.pendingFocusCategory)&&p.pendingFocusFrom<=today()?p.pendingFocusCategory:p?.focusCategory;};
 const goalChangeLocked=()=>data.questProfile?.goalChangedWeek===DailyQuests.weekStart(today());
 const tomorrow=()=>{const d=new Date(today()+'T12:00:00');d.setDate(d.getDate()+1);return d.toLocaleDateString('sv-SE');};
 const goalNotice=()=>{const p=data.questProfile;return Number.isInteger(p?.pendingFocusCategory)&&p.pendingFocusFrom>today()?categoryNames[p.pendingFocusCategory]+' 보너스 · '+p.pendingFocusFrom+'부터 적용': '주 1회 변경 · 다음 날부터 적용';};
 const hasFocusBonus=id=>!WeeklyQuestRules[id]&&Number.isInteger(activeFocus())&&questCategory(id)===activeFocus();
 const questXp=id=>{const base=dailyBase[id]??weeklyBase[id]??QuestCatalog[id]?.xp??20;return hasFocusBonus(id)?Math.round(base*1.1):base;};
 const balancedWeeklyRules=()=>Object.fromEntries(Object.entries(WeeklyQuestRules).filter(([id])=>ids('weekly').includes(Number(id))).map(([id,rule])=>[id,{...rule,xp:questXp(Number(id))}]));
 const summary=(period='daily')=>{const list=ids(period),completed=list.filter(id=>state(id).done);return {done:completed.length,total:list.length,xp:completed.reduce((sum,id)=>sum+state(id).xp,0)};};
 const portrait=gender=>`assets/characters/large-bag-v2/${gender}-standing${gender==='female'?'-natural-v4':''}.png`;
 const arrow='<span aria-hidden="true">↗</span>';
 function openGoalChange(){
  if(document.querySelector('.goal-change-dialog'))return;
  const current=activeFocus();let choice=current;
  const dialog=document.createElement('dialog');dialog.className='goal-change-dialog';
  dialog.setAttribute('aria-labelledby','goal-change-title');
  dialog.innerHTML='<h2 id="goal-change-title">목표 변경</h2><p>지금 집중하고 싶은 분야를 하나 골라주세요.</p><div class="goal-change-options">'+categoryNames.map((name,i)=>'<button type="button" data-goal-choice="'+i+'" class="'+(i===current?'chosen':'')+'" aria-pressed="'+(i===current)+'">'+icon(categoryIcons[i])+'<span>'+name+'</span><small>EXP +10%</small></button>').join('')+'</div><p class="goal-change-note">주 1회마다 한번씩 목표를 변경할 수 있어요.<br>변경한 목표는 다음날부터 적용됩니다.</p><p role="alert"></p><button type="button" class="goal-save" disabled>목표 저장</button><button type="button" class="goal-cancel">취소</button>';
  document.body.appendChild(dialog);
  if(goalChangeLocked()){dialog.querySelectorAll('[data-goal-choice]').forEach(b=>b.disabled=true);}
  dialog.addEventListener('close',()=>{dialog.remove();document.querySelector('[data-edit-goal]')?.focus({preventScroll:true});});
  dialog.querySelector('.goal-cancel').onclick=()=>dialog.close();
  dialog.querySelectorAll('[data-goal-choice]').forEach(button=>button.onclick=()=>{
   if(goalChangeLocked())return;
   choice=Number(button.dataset.goalChoice);
   dialog.querySelectorAll('[data-goal-choice]').forEach(item=>{const selected=Number(item.dataset.goalChoice)===choice;item.classList.toggle('chosen',selected);item.setAttribute('aria-pressed',String(selected));});
   dialog.querySelector('.goal-save').disabled=choice===current;
  });
  dialog.querySelector('.goal-save').onclick=()=>{
   if(goalChangeLocked()||!Number.isInteger(choice)||choice<0||choice>=categoryNames.length||choice===activeFocus())return;
   const previous=data.questProfile;data.questProfile={...previous,goals:[activeFocus()],focusCategory:activeFocus(),pendingFocusCategory:choice,pendingFocusFrom:tomorrow(),goalChangedWeek:DailyQuests.weekStart(today())};
   if(!persist()){data.questProfile=previous;dialog.querySelector('[role="alert"]').textContent='저장하지 못했어요. 다시 시도해 주세요.';return;}
   render();dialog.close();toast(categoryNames[choice]+' 목표가 내일부터 적용돼요.');
  };
  dialog.showModal();
 }
 function openCharacterChange(){
  if(document.querySelector('.character-change-dialog'))return;
  const current=data.travelerCharacter||'male';let choice=current;
  const dialog=document.createElement('dialog');dialog.className='character-change-dialog';
  dialog.setAttribute('aria-labelledby','character-change-title');
  dialog.innerHTML=`<h2 id="character-change-title">성별 변경</h2><p>함께할 캐릭터를 골라주세요.</p><div class="character-options">${['male','female'].map((gender,i)=>`<button class="character-option ${gender===current?'chosen':''}" data-choice="${gender}" aria-pressed="${gender===current}"><img src="${portrait(gender)}" alt="${i?'여자':'남자'} 캐릭터"><span>${i?'여자':'남자'}</span></button>`).join('')}</div><p class="character-reset-notice"><strong>캐릭터를 변경하면 처음부터 시작해요.</strong><br>목표와 성장·활동 기록이 초기화되며 복구할 수 없어요.</p><p role="alert"></p><button class="q-primary" data-confirm-character disabled>초기화하고 변경</button><button class="q-text" data-close-character>취소</button>`;
  document.body.appendChild(dialog);
  dialog.addEventListener('close',()=>dialog.remove());
  dialog.querySelector('[data-close-character]').onclick=()=>dialog.close();

  const updateSave=()=>{
   const button=dialog.querySelector('[data-confirm-character]');
   button.textContent='초기화하고 변경';
   button.disabled=choice===current;
  };

  dialog.querySelectorAll('[data-choice]').forEach(button=>button.onclick=()=>{
   choice=button.dataset.choice;
   dialog.querySelectorAll('[data-choice]').forEach(item=>{item.classList.toggle('chosen',item.dataset.choice===choice);item.setAttribute('aria-pressed',String(item.dataset.choice===choice));});
   updateSave();
  });
  dialog.querySelector('[data-confirm-character]').onclick=()=>{
   if(choice===current)return;
   const saved=resetForTravelerCharacter(choice,data.questProfile?.name||'');
   if(saved){dialog.close();toast('정보를 초기화하고 캐릭터를 변경했어요.');}
   else dialog.querySelector('[role="alert"]').textContent='변경 내용을 저장하지 못했어요. 다시 시도해 주세요.';
  };
  dialog.showModal();
 }
 function onboarding(){
  const progress=`<div class="setup-top"><span class="brand">DAY +1</span><span>${step+1} / 4</span></div><div class="setup-progress" aria-label="설정 ${step+1}단계, 총 4단계">${[0,1,2,3].map(i=>`<i class="${i<=step?'filled':''}"></i>`).join('')}</div>`;
  const back=step?'<button class="q-text" data-setup-back>← 이전</button>':editing?'<button class="q-text" data-setup-close>닫기</button>':'';
  let body='';
  if(step===0)body=`<div class="setup-copy"><span class="q-kicker">YOUR EVERYDAY ADVENTURE</span><h1>나의 하루를<br>경험치로 <em>+1</em></h1><p>평범한 하루도 성장의 기록이 돼요.</p></div><div class="welcome-art"><img src="${portrait(draft.gender)}" alt="모험을 시작하는 캐릭터"><span class="welcome-label welcome-speech"><svg viewBox="0 0 110 80" aria-hidden="true"><path d="M55 2C25 2 3 13 3 28S22 51 43 53L57 74 49 54C80 56 107 44 107 28S85 2 55 2Z"/></svg><span>작은 성취,<br>차곡차곡.</span></span></div><div class="welcome-features"><span>✓ 간단하게 남기는 오늘의 활동</span><span>✓ 기록할 때마다 쌓이는 경험치</span><span>✓ 함께 달라지는 캐릭터와 배경</span></div>`;
  if(step===1)body=`<div class="setup-copy"><span class="q-kicker">MEET YOUR CHARACTER</span><h1>함께할 캐릭터를<br>골라주세요.</h1><p>캐릭터는 나중에도 바꿀 수 있어요.</p></div><div class="character-options">${['male','female'].map((gender,i)=>`<button class="character-option ${draft.gender===gender?'chosen':''}" data-setup-gender="${gender}" aria-pressed="${draft.gender===gender}"><img src="${portrait(gender)}" alt="${i?'여자':'남자'} 캐릭터"><span>${i?'여자':'남자'}<b>${draft.gender===gender?'✓':'○'}</b></span></button>`).join('')}</div>`;
  if(step===2)body=`<div class="setup-copy"><span class="q-kicker">MAKE IT YOURS</span><h1>어떤 하루를<br>만들고 싶나요?</h1><p>집중하고 싶은 분야를 하나 골라주세요.</p></div><div class="goal-options">${categoryNames.map((name,i)=>`<button data-setup-goal="${i}" class="${draft.goals.includes(i)?'chosen':''}" aria-pressed="${draft.goals.includes(i)}">${icon(categoryIcons[i])}<span>${['배우고 성장하기','꾸준히 몸 움직이기','일상 돌보기','잘 쉬어가기','식사 챙기기'][i]}</span><b>${draft.goals.includes(i)?'✓':'＋'}</b></button>`).join('')}</div><p class="setup-note">선택한 분야는 활동 경험치를 10% 더 받아요.<br>보너스는 반올림되어 자정에 함께 지급돼요.</p>`;
  if(step===3)body=`<div class="setup-copy"><span class="q-kicker">READY WHEN YOU ARE</span><h1>작은 모험을,<br>이제 시작해볼까요?</h1><p>오늘 보낸 하루를 간단하게 남겨보세요.</p></div><div class="welcome-art ready-art"><img src="${portrait(draft.gender)}" alt="선택한 캐릭터"><span class="welcome-label welcome-speech"><svg viewBox="0 0 110 80" aria-hidden="true"><path d="M55 2C25 2 3 13 3 28S22 51 43 53L57 74 49 54C80 56 107 44 107 28S85 2 55 2Z"/></svg><span>나의 하루가<br>경험치가 돼요.</span></span></div><div class="setup-tags">${draft.goals.map(i=>`<span>${categoryNames[i]}</span>`).join('')}</div>`;
  return `<section class="quest-setup">${progress}${body}<footer>${editing&&step===1?'<button class="q-text" data-setup-intro>처음 안내 다시 보기</button>':''}${back}<button class="q-primary" data-setup-next ${step===2&&!draft.goals.length?'disabled':''}>${step===0?'시작하기':step===3?'나의 하루 시작하기':'다음으로'}</button></footer></section>`;
 }
 const oldHistory=pages.history;
 pages.archive=()=>`<div class="quest-archive"><button class="q-text archive-back" data-page="history">← 활동으로 돌아가기</button>${oldHistory().replace(/<button[^>]*data-page="touch"[^>]*>[\s\S]*?<\/button>/g,'')}</div>`;
 pages.history=()=>{
  const weekly=view==='weekly',s=summary(view),list=ids(view).filter(id=>weekly||questCategory(id)===Number(filter)).sort((a,b)=>questCategory(a)-questCategory(b)||a-b);
  return `<section class="quest-page"><header class="q-heading"><div><span class="q-kicker">ONE DAY, ONE STEP</span><h1>${weekly?'주간 도전':'오늘의 활동'}</h1><p>${weekly?DailyQuests.weekStart(today())+'부터 · 월요일 시작':new Date().toLocaleDateString('ko-KR',{month:'long',day:'numeric',weekday:'long'})} · 나만의 속도로, 하나씩.</p></div></header><div class="quest-view-tabs" role="group" aria-label="활동과 도전"><button data-quest-view="daily" aria-pressed="${!weekly}">오늘의 활동</button><button data-quest-view="weekly" aria-pressed="${weekly}">주간 도전</button></div><div class="quest-progress-card"><div><span>${weekly?'이번 주 도전 달성':'오늘 남긴 활동'}</span><strong>${s.done}<small>${weekly?' / '+s.total+' 달성':'개 기록'}</small></strong></div><span class="earned-pill">+${s.xp} EXP</span><p>${weekly?'하늘 성·모스크바 해금 도전이 매주 열려요.<br>독서·운동 도전은 고정, 나머지는 월요일에 바뀌어요.':'오늘의 활동을 기록해 보세요.<br>쌓인 경험치는 자정에 자동으로 지급돼요.'}</p></div>${weekly?'':`<div class="quest-filters" role="group" aria-label="활동 분류">${categoryNames.map((n,i)=>[String(i),n]).map(([id,name])=>`<button data-quest-filter="${id}" aria-pressed="${filter===id}">${icon(['book','dumbbell','home','moon'][Number(id)])}<span>${name}</span></button>`).join('')}</div>`}<div class="quest-list">${list.length?list.map(id=>{const a=acts[id],done=state(id);if(!weekly)return `<article class="quest-card academy-card activity-toggle-card ${done.done?'is-complete':''}" data-quest-category="${questCategory(id)}"><span class="quest-symbol category-${questCategory(id)}">${activityIcon(a[2],id)}</span><span class="quest-card-copy"><span class="academy-title">${esc(titles[id]||a[0])}</span><span class="quest-xp">+${done.done?done.xp:questXp(id)} EXP${hasFocusBonus(id)?' · 보너스 10% 포함':''}</span></span><button type="button" class="activity-toggle" data-quest-id="${id}" data-quest-date="${today()}" data-quest-complete="${!done.done}" aria-pressed="${done.done}" aria-label="${esc(titles[id]||a[0])} ${done.done?'완료 취소':'완료하기'}" ${done.legacy?'disabled':''}><span class="activity-toggle-circle" aria-hidden="true"><svg viewBox="0 0 32 32" fill="none"><path d="M8 16.5 13.5 22 24 10"/></svg></span><span>${done.done?'완료':'완료하기'}</span></button></article>`;return `<article class="quest-card ${done.done?'is-complete':''}"><span class="quest-symbol category-${questCategory(id)}">${activityIcon(a[2],id)}</span><div class="quest-card-copy"><h2>${titles[id]||esc(a[0])}${weekly&&done.done?' 완료!':''}</h2>${weekly?`<p class="weekly-description">${esc(WeeklyQuestRules[id].description||'')}</p><span class="weekly-progress-count">${Math.min(done.count,done.target)} / ${done.target}회</span><div class="weekly-progress weekly-battery" role="progressbar" aria-label="${esc(a[0])}" aria-valuenow="${Math.min(done.count,done.target)}" aria-valuemin="0" aria-valuemax="${done.target}">${Array.from({length:done.target},(_,index)=>`<i class="${index<done.count?'is-filled':''}" aria-hidden="true"></i>`).join('')}</div>`:''}<span class="quest-xp">${done.done?(weekly?'✓ 달성 · ':'✓ 기록 · '):''}+${done.done?done.xp:questXp(id)} EXP${done.legacy?' · 기존 기록':''}</span></div>${weekly?`<span class="challenge-status ${done.done?'is-done':''}">${done.done?'✓ 달성':'진행 중'}</span>`:`<button class="quest-check" data-quest-category="${questCategory(id)}" data-quest-id="${id}" data-quest-date="${today()}" data-quest-complete="${!done.done}" role="checkbox" aria-checked="${done.done}" aria-label="${esc(titles[id]||a[0])} ${done.done?'기록 취소':'활동 기록'}" ${done.legacy?'disabled':''}>${done.done?'✓':'＋'}</button>`}</article>`;}).join(''):'<div class="quest-empty"><h2>이 항목에는 아직 등록된 항목이 없어요.</h2></div>'}</div><button class="archive-link" data-page="archive">${icon('history')} 지난 활동 내역 보기 <span>→</span></button></section>`;
 };
 const home=pages.home;
 pages.home=()=>{
  const s=summary();
  return `<div class="quest-scene-card home-immersive-scene">${home().replace(/<div class="character-picker"[\s\S]*?<\/div>/, '')}</div><section class="home-focus-goal" aria-label="현재 목표"><div><span>현재 목표</span><strong>${categoryNames[activeFocus()]||'목표 선택'} <small>EXP +10%</small></strong><span>${goalNotice()}</span></div><button type="button" data-edit-goal>목표 변경</button></section><section class="home-quest-summary"><div><h2>오늘은 무엇을 했나요?</h2><p><span class="home-activity-count">기록 <b>${s.done}개</b></span> <span>획득 예정 · +${s.xp} EXP</span></p></div><button class="q-primary" data-page="history">활동 기록하기 ${arrow}</button></section>`;
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
  const nav=document.querySelector('.nav');if(nav){nav.innerHTML=[['home','홈','home'],['history','활동','history'],['growth','성장 보상','trophy'],['rewards','여행 지도','map']].map(([id,label,art])=>`<button data-page="${id}" class="${page===id||(id==='history'&&page==='archive')?'active':''}" ${page===id?'aria-current="page"':''}>${icon(art)}<span>${label}</span></button>`).join('');}
 };
 function finishSetup(){
  if(draft.goals.length!==1||!Number.isInteger(draft.goals[0])||draft.goals[0]<0||draft.goals[0]>=categoryNames.length)return;
  const backup=JSON.stringify(data);
  data.questProfile={version:1,onboardingCompleted:true,name:draft.name.trim().slice(0,16),goals:draft.goals.slice(),focusCategory:draft.goals[0]};data.travelerCharacter=draft.gender;
  if(!persist()){data=JSON.parse(backup);return;}
  if(introPreview){const url=new URL(location.href);url.searchParams.delete('intro');location.replace(url.pathname+url.search+url.hash);return;}
  editing=false;page='home';render();window.scrollTo(0,0);
 }

 document.addEventListener('click',event=>{
  const button=event.target.closest('button');if(!button)return;const d=button.dataset;
  if(!Object.keys(d).some(key=>key.startsWith('quest')||key.startsWith('setup')||key==='editProfile'||key==='editGoal'))return;
  event.preventDefault();event.stopImmediatePropagation();
  if('questId'in d){
   if(d.questDate!==today()){render();toast('새로운 하루가 시작됐어요. 오늘의 퀘스트를 확인해 주세요.');return;}
   const id=Number(d.questId);if(!acts[id]||removedQuestIds.has(id)||WeeklyQuestRules[id])return;
   const complete=d.questComplete==='true',award=questXp(id);
   const saveQuest=(...args)=>DailyQuests.saveWithWeekly(...args,balancedWeeklyRules());
   if(saveQuest(data,today(),id,complete,award,persist)){
    const scroll=window.scrollY;render();window.scrollTo(0,scroll);
    const toggle=document.querySelector(`[data-quest-id="${id}"]`);
    if(complete){
     const card=toggle?.closest('.activity-toggle-card');
     if(card){card.classList.add('activity-recorded');const feedback=document.createElement('span');feedback.className='activity-recorded-feedback';feedback.setAttribute('role','status');feedback.textContent='기록완료!';card.appendChild(feedback);window.setTimeout(()=>{card.classList.remove('activity-recorded');feedback.remove();},2200);}
    }
    toggle?.focus({preventScroll:true});
   }return;
  }
  if('questFilter'in d)filter=d.questFilter;
  if('questView'in d){view=d.questView;filter='0';}
  if('editGoal'in d){openGoalChange();return;}
  if('editProfile'in d){if(page==='home')openCharacterChange();return;}
  if('setupClose'in d)editing=false;
  if('setupIntro'in d)step=0;
  if('setupBack'in d){if(editing&&step===1)editing=false;else step=Math.max(0,step-1);}
  if('setupGender'in d)draft.gender=d.setupGender;
  if('setupGoal'in d){const goal=Number(d.setupGoal);if(Number.isInteger(goal)&&goal>=0&&goal<categoryNames.length)draft.goals=[goal];}
  if('setupNext'in d){if(step===2&&!draft.goals.length)return;if(step===3){finishSetup();return;}step++;}
  render();if('setupNext'in d||'setupBack'in d||'editProfile'in d||'setupIntro'in d)window.scrollTo(0,0);
 },true);
 function rollover(){if(lastDate!==today()){lastDate=today();if(!needsSetup()&&!editing)render();}}
 setInterval(rollover,1000);window.addEventListener('focus',rollover);
 render();if(needsSetup())window.scrollTo(0,0);
})();







