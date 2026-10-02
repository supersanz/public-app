'use strict';
// Deliver only the current minute: returning after sleep never rings stale alarms.
function dueAppAlarms(now, settings, configured){
 const rowIndex=[0,6].includes(now.getDay())?1:0,row=settings?.[rowIndex];
 if(!row)return [];
 const time=String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0');
 const date=[now.getFullYear(),now.getMonth()+1,now.getDate()].join('-');
 return [0,1].filter(kind=>row[kind+2]&&configured?.[rowIndex+','+kind]&&row[kind]===time).map(kind=>({kind,key:date+':'+kind+':'+time}));
}
(function(){
 let audio=null,timer=null,timeout=null,notice=null,active=false,previousFocus=null;
 const seen=new Set();
 async function unlock(){
  try{const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return false;audio=audio||new Audio();await audio.resume();return audio.state==='running'}catch{return false}
 }
 function tone(){
  if(!audio||audio.state!=='running')return;
  [0,.35,.7].forEach((delay,i)=>{const o=audio.createOscillator(),g=audio.createGain(),t=audio.currentTime+delay;o.type='sine';o.frequency.value=[660,830,990][i];g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.12,t+.025);g.gain.exponentialRampToValueAtTime(.001,t+.28);o.connect(g);g.connect(audio.destination);o.start(t);o.stop(t+.3)});
 }
 function stop(){clearInterval(timer);clearTimeout(timeout);notice?.close();notice=null;active=false;document.getElementById('live-alarm')?.remove();previousFocus?.isConnected&&previousFocus.focus();}
 function ring(kind,test=false){
  stop();active=true;previousFocus=document.activeElement;
  const title=test?'알람 소리 테스트':kind===0?'일어날 시간이에요':'잠자리에 들 시간이에요';
  const box=document.createElement('div');box.id='live-alarm';box.className='overlay';box.style.zIndex='10000';box.innerHTML='<section class="modal" role="alertdialog" aria-modal="true" aria-labelledby="live-alarm-title"><h2 id="live-alarm-title"></h2><p>알람은 1분 후 자동으로 멈춰요.</p><button class="primary" data-stop-live-alarm>알람 끄기</button></section>';box.querySelector('h2').textContent=title;document.body.append(box);box.querySelector('button').focus();
  if(!audio||audio.state!=='running')box.querySelector('p').textContent='소리가 차단되어 있어요. 알람 설정에서 소리 테스트를 눌러 활성화해 주세요.';
  tone();timer=setInterval(tone,2000);timeout=setTimeout(stop,test?6000:60000);
  if(!test&&'Notification'in window&&Notification.permission==='granted'){try{notice=new Notification(title,{body:'생활 성장 앱 · 알람을 확인해 주세요.',tag:'life-growth-alarm'});notice.onclick=()=>{window.focus();stop()}}catch{}}
 }
 function tick(){
  for(const alarm of dueAppAlarms(new Date(),data.alarms,data.alarmTimesConfigured)){
   const key='life-growth-alarm:'+alarm.key;if(seen.has(key))continue;
   try{if(localStorage.getItem(key))continue;localStorage.setItem(key,'1')}catch{}
   seen.add(key);ring(alarm.kind);
  }
 }
 const before=pages.alarm;
 pages.alarm=()=>before().replace('</section>','<article class="alarm-card"><h2>알람 소리 · 알림</h2><button class="secondary" data-test-live-alarm>소리 테스트 · 활성화</button><button class="secondary" data-enable-live-notification>브라우저 알림 허용</button><p class="note">앱을 연 뒤 소리 테스트를 눌러 주세요. 직접 저장한 시간에 켜진 알람만 울립니다. 앱을 닫거나 기기가 절전 상태이면 울리지 않으며, 백그라운드에서는 지연될 수 있어요.</p></article></section>');
 document.addEventListener('pointerdown',()=>{unlock()},{once:true,capture:true});
 document.addEventListener('keydown',e=>{if(active&&e.key==='Escape')stop();if(active&&e.key==='Tab'){e.preventDefault();document.querySelector('[data-stop-live-alarm]')?.focus()}},{capture:true});
 document.addEventListener('click',async e=>{
  const b=e.target.closest('button');if(!b)return;
  if('stopLiveAlarm'in b.dataset)stop();
  if('testLiveAlarm'in b.dataset){await unlock();ring(0,true)}
  if('enableLiveNotification'in b.dataset){
   if(!('Notification'in window)){toast('이 브라우저는 시스템 알림을 지원하지 않아요.');return}
   try{const permission=await Notification.requestPermission();toast(permission==='granted'?'브라우저 알림을 허용했어요.':'알림 권한이 없습니다. 브라우저 사이트 설정에서 허용해 주세요.')}catch{toast('알림 권한을 요청할 수 없어요.')}
  }
 });
 setInterval(tick,1000);window.addEventListener('focus',tick);document.addEventListener('visibilitychange',()=>{if(!document.hidden)tick()});
 render();
})();
