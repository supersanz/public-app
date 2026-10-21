'use strict';
(async()=>{
 const app=document.getElementById('app');
 const gate=document.getElementById('auth-screen');
 const config=window.QUEST_FIREBASE_CONFIG;
 const manifest=JSON.parse(document.getElementById('quest-app-manifest').textContent);
 let store,auth,api,user,started=false,manualSaving=false;
 window.QuestSessionPaused=true;
 const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function screen(message,buttons=[]){
  gate.hidden=false;app.inert=true;
  gate.innerHTML='<section class="auth-card"><div class="auth-symbol" aria-hidden="true">✦</div><p class="auth-kicker">하루를 쌓는 작은 습관</p><h1>나를 기록하다</h1><p class="auth-tagline">기록한 하루가 나를 키운다.</p><p class="auth-message" role="status">'+escape(message)+'</p><div class="auth-actions"></div></section>';
  for(const [label,action] of buttons){const b=document.createElement('button');b.type='button';b.textContent=label;b.onclick=async()=>{b.disabled=true;try{await action()}catch(e){showError(e)}finally{b.disabled=false}};gate.querySelector('.auth-actions').append(b);}
 }
 function showError(e){
  window.QuestSessionPaused=true;
  const messages={'auth/popup-closed-by-user':'로그인 창을 닫았습니다. 다시 시도할 수 있어요.','auth/popup-blocked':'팝업이 차단되었습니다. 이 사이트의 팝업을 허용해 주세요.','auth/unauthorized-domain':'이 주소를 Firebase 인증의 승인된 도메인에 등록해야 합니다.','auth/network-request-failed':'네트워크 연결을 확인해 주세요.','permission-denied':'저장 권한 설정을 확인해야 합니다.','unavailable':'서버에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.'};
  const code=String(e?.code||e?.name||'unknown');
  console.error('Account connection failed',e);
  screen((messages[code]||'연결을 완료하지 못했습니다. 기존 기록은 보존되어 있습니다.')+' (오류: '+code+')',[['다시 시도',()=>location.reload()]]);
 }
 function download(){
  const blob=new Blob([store.backup()],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download='나를기록하다-미동기화기록.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 }
 function conflict(){
  window.QuestSessionPaused=true;
  screen('다른 기기에서 저장한 기록과 이 기기의 변경 내용이 다릅니다. 자동으로 덮어쓰지 않습니다.',[
   ['이 기기 기록 백업 다운로드',download],
   ['서버 기록으로 다시 열기',()=>{if(confirm('이 기기의 미동기화 기록을 먼저 백업했나요? 서버 기록으로 전환합니다.')){store.discardLocal();location.reload();}}]
  ]);
 }
 function status(value){
  if(window.QuestPresentationActive)value='시연 중 · 서버에 저장되지 않습니다.';
  if(manualSaving&&value!=='conflict')return;
  const labels={pending:'자동 저장 대기',saving:'저장 중입니다…',saved:'서버 저장 완료',error:'저장 재시도 필요 · 기기 기록 보관됨',conflict:'다른 기기 기록과 충돌'};
  const el=document.getElementById('cloud-save-status');if(el){el.textContent=labels[value]||value;el.dataset.state=value;}
  if(value==='conflict')conflict();
 }
 async function start(){
  if(started)return;started=true;
  screen('화면을 준비하고 있어요…');
  const sources=await Promise.all(manifest.scripts.map(async src=>{const response=await fetch(src);if(!response.ok)throw new Error('script-load');return {src,text:await response.text()};}));
  // Install all classic modules in one task before animation timers can run.
  for(const source of sources){const script=document.createElement('script');script.textContent=source.text+'\n//# sourceURL='+source.src;document.body.append(script);}
  gate.hidden=true;app.inert=false;window.QuestSessionPaused=false;
  const panel=document.createElement('details');panel.className='account-panel';
  panel.innerHTML='<summary aria-label="계정 및 저장" title="계정 및 저장"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path d="M5 21v-2a7 7 0 0 1 14 0v2"/></svg></summary><div class="account-menu">'+(user?"<span class=\"account-provider\"><svg viewBox=\"0 0 24 24\" width=\"16\" height=\"16\" aria-hidden=\"true\"><path fill=\"#4285F4\" d=\"M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.9-1.75 2.98-4.33 2.98-7.36Z\"/><path fill=\"#34A853\" d=\"M12 22c2.7 0 4.96-.9 6.62-2.41l-3.24-2.51c-.9.6-2.05.96-3.38.96-2.6 0-4.8-1.76-5.59-4.12H3.07v2.59A10 10 0 0 0 12 22Z\"/><path fill=\"#FBBC05\" d=\"M6.41 13.92a6 6 0 0 1 0-3.84V7.49H3.07a10 10 0 0 0 0 9.02l3.34-2.59Z\"/><path fill=\"#EA4335\" d=\"M12 5.96c1.47 0 2.79.51 3.83 1.51L18.7 4.6A9.62 9.62 0 0 0 12 2a10 10 0 0 0-8.93 5.49l3.34 2.59C7.2 7.72 9.4 5.96 12 5.96Z\"/></svg>Google 계정</span>":'')+'<strong class="account-name">'+escape(user?.displayName||'기기 저장 모드')+'</strong><small class="account-autosave">'+(user?'변경 내용은 자동으로 저장됩니다.':'이 기기에 저장됩니다.')+'</small><p id="cloud-save-status" role="status">'+(user?'서버 기록 불러옴':'Firebase 연결 전 · 이 기기에만 저장')+'</p><button type="button" data-cloud-save aria-describedby="manual-save-help">지금 저장</button><small id="manual-save-help" class="account-save-help">바로 저장하고 싶을 때 누르는<br>수동 저장 버튼입니다.</small><button type="button" data-cloud-logout>'+(user?'로그아웃':'로그인 화면')+'</button></div>';
  document.body.append(panel);
  // Keep the account control anchored to the home scene across full app renders.
  let placementPending=false;
  function positionAccount(){
   placementPending=false;
   const scene=app.querySelector('.quest-scene-card');
   const rect=scene?.getBoundingClientRect();
   const visible=!!rect&&rect.width>0&&rect.bottom>48&&rect.top<innerHeight;
   panel.hidden=!visible;
   if(!visible){panel.open=false;return;}
   panel.style.left=Math.max(8,rect.right-52)+'px';
   panel.style.top=(rect.top+12)+'px';
  }
  function scheduleAccount(){if(!placementPending){placementPending=true;requestAnimationFrame(positionAccount);}}
  new MutationObserver(scheduleAccount).observe(app,{childList:true,subtree:true});
  new ResizeObserver(scheduleAccount).observe(app);
  window.addEventListener('scroll',scheduleAccount,{passive:true});
  window.addEventListener('resize',scheduleAccount);
  panel.addEventListener('keydown',e=>{if(e.key==='Escape'){panel.open=false;panel.querySelector('summary').focus();}});
  document.addEventListener('click',e=>{if(!panel.contains(e.target))panel.open=false;});
  window.addEventListener('quest-presentation-change',()=>status(window.QuestPresentationActive?'시연 중 · 서버에 저장되지 않습니다.':'원래 기록으로 돌아왔습니다.'));
  positionAccount();
  const saveButton=panel.querySelector('[data-cloud-save]');
  saveButton.onclick=async()=>{
   if(saveButton.disabled)return;
   if(window.QuestPresentationActive){status('');return;}
   if(!store){status('이 기기에 저장됩니다.');return;}
   saveButton.disabled=true;saveButton.textContent='저장 중…';saveButton.setAttribute('aria-busy','true');status('saving');manualSaving=true;
   const minimumDisplay=new Promise(resolve=>setTimeout(resolve,600));
   try{await store.flush();await minimumDisplay;manualSaving=false;status(store.dirty?'pending':'saved');}
   catch(e){await minimumDisplay;manualSaving=false;if(e.code!=='conflict')status('error');}
   finally{manualSaving=false;saveButton.disabled=false;saveButton.textContent='지금 저장';saveButton.removeAttribute('aria-busy');}
  };
  panel.querySelector('[data-cloud-logout]').onclick=async()=>{
   window.QuestSessionPaused=true;app.inert=true;
   try{if(store)await store.flush();if(auth)await api.signOut(auth);location.reload();}
   catch(e){window.QuestSessionPaused=false;app.inert=false;if(e.code!=='conflict')status('서버 저장에 실패했습니다. 저장을 재시도한 뒤 로그아웃해 주세요.');}
  };
 }
 if(!config?.apiKey||!config?.projectId||!config?.appId||!config?.authDomain){
  screen('구글 로그인 연결을 준비 중입니다. Firebase 프로젝트 설정이 필요합니다.',[
   ['기존 기기 기록으로 계속',start],
   ['Firebase 설정 안내',()=>window.open('handoff/firebase/SETUP.html','_blank','noopener')]
  ]);return;
 }
 screen('구글 로그인 연결 중…');
 try{
  const [firebase,authentication,firestore]=await Promise.all([
   import('https://www.gstatic.com/firebasejs/13.0.0/firebase-app.js'),
   import('https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js'),
   import('https://www.gstatic.com/firebasejs/13.0.0/firebase-firestore.js')
  ]);
  api=authentication;const project=firebase.initializeApp(config);auth=api.getAuth(project);
  auth.languageCode='ko';await api.setPersistence(auth,api.browserLocalPersistence);
  const db=firestore.getFirestore(project);
  const provider=new api.GoogleAuthProvider();provider.setCustomParameters({prompt:'select_account'});
  let initial=true;
  api.onAuthStateChanged(auth,async current=>{
   if(!initial){if(started&&current?.uid!==user?.uid){window.QuestSessionPaused=true;screen('다른 탭에서 로그인 상태가 변경되었습니다. 계정을 확인한 뒤 계속해 주세요.',[['계정 확인하고 계속',()=>location.reload()]]);}return;}
   if(!current){
    screen('구글 계정으로 로그인하면 다른 기기에서도 기록을 이어갈 수 있어요.',[['Google 계정으로 계속',async()=>{await api.signInWithPopup(auth,provider);}]]);
    return;
   }
   initial=false;user=current;
   try{
    const ref=firestore.doc(db,'users',user.uid,'saves','main');
    store=QuestCloudStore.createStore({uid:user.uid,storage:localStorage,status,remote:{
     async read(){const snap=await firestore.getDocFromServer(ref);if(!snap.exists())return null;const value=snap.data();return {...value,data:QuestCloudStore.decode(value.data)};},
     async write(data,revision){return firestore.runTransaction(db,async transaction=>{
      const snap=await transaction.get(ref),current=snap.exists()?snap.data().revision:0;
      if(current!==revision)throw Object.assign(new Error('conflict'),{code:'conflict'});
      transaction.set(ref,{schemaVersion:1,revision:revision+1,data:QuestCloudStore.encode(data),updatedAt:firestore.serverTimestamp()});
      return revision+1;
     });}
    }});
    const saved=await store.load();
    window.QuestAccountStorage={read:()=>saved||null,write:value=>store.save(value),async reset(value){store.save(value);await store.flush();}};
    const begin=async()=>{await start();if(store.dirty)store.flush().catch(()=>{});};
    if(!saved){
     let legacy=null;
     // Retain records from the existing Vercel release as an explicit import option.
     for(const key of [manifest.legacyKey,...(manifest.legacyKeys||[])]){
      try{const candidate=JSON.parse(localStorage.getItem(key)||'null');
       if(QuestCloudStore.valid(candidate)&&(candidate.logs.length||candidate.questProfile?.onboardingCompleted||candidate.walkExp)){legacy=candidate;break;}
      }catch{}
     }
     if(QuestCloudStore.valid(legacy)&&(legacy.logs.length||legacy.questProfile?.onboardingCompleted||legacy.walkExp)){
      screen('이 기기에 이전 기록이 있습니다. 현재 구글 계정으로 가져올까요?',[
       ['기존 기록 가져오기',async()=>{store.save(legacy);await store.flush();location.reload();}],
       ['새로 시작',begin]
      ]);
     }else await begin();
    }else await begin();
    window.addEventListener('online',()=>store.flush().catch(()=>{}));
    document.addEventListener('visibilitychange',()=>{if(document.hidden)store.flush().catch(()=>{});});
    window.addEventListener('beforeunload',e=>{if(store.dirty){e.preventDefault();e.returnValue='';}});
   }catch(e){if(e.code==='conflict')conflict();else showError(e);}
  },showError);
 }catch(e){showError(e);}
})();
