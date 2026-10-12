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
  const title=test?'알람 소리 · 알림 테스트':kind===0?'일어날 시간이에요':'잠자리에 들 시간이에요';
  const box=document.createElement('div');box.id='live-alarm';box.className='overlay';box.style.zIndex='10000';box.innerHTML='<section class="modal" role="alertdialog" aria-modal="true" aria-labelledby="live-alarm-title"><h2 id="live-alarm-title"></h2><p>알람은 1분 후 자동으로 멈춰요.</p><button class="primary" data-stop-live-alarm>알람 끄기</button></section>';box.querySelector('h2').textContent=title;document.body.append(box);box.querySelector('button').focus();
  if(!audio||audio.state!=='running')box.querySelector('p').textContent='소리가 차단되어 있어요. 알람 설정에서 소리 테스트를 눌러 활성화해 주세요.';
  if(test&&audio?.state==='running')box.querySelector('p').textContent='테스트는 6초 후 자동으로 멈춰요.';
  tone();timer=setInterval(tone,2000);timeout=setTimeout(stop,test?6000:60000);
  if('Notification'in window&&Notification.permission==='granted'){try{notice=new Notification(title,{body:'생활 성장 앱 · 알람을 확인해 주세요.',tag:'life-growth-alarm'});notice.onclick=()=>{window.focus();stop()}}catch{}}
 }
 function tick(){
  for(const alarm of dueAppAlarms(new Date(),data.alarms,data.alarmTimesConfigured)){
   const key='life-growth-alarm:'+alarm.key;if(seen.has(key))continue;
   try{if(localStorage.getItem(key))continue;localStorage.setItem(key,'1')}catch{}
   seen.add(key);ring(alarm.kind);
  }
 }
 const before=pages.alarm;
 pages.alarm=()=>before().replace('</section>','<button class="secondary alarm-test-button" data-test-live-alarm>알람 소리 · 알림 테스트</button></section>');
 document.addEventListener('pointerdown',()=>{unlock()},{once:true,capture:true});
 document.addEventListener('keydown',e=>{if(active&&e.key==='Escape')stop();if(active&&e.key==='Tab'){e.preventDefault();document.querySelector('[data-stop-live-alarm]')?.focus()}},{capture:true});
 document.addEventListener('click',async e=>{
  const b=e.target.closest('button');if(!b)return;
  if('stopLiveAlarm'in b.dataset)stop();
  if('testLiveAlarm'in b.dataset){
   b.disabled=true;
   try{
    const sound=unlock();
    const permission='Notification'in window&&Notification.permission==='default'
     ?Notification.requestPermission().catch(()=>null):Promise.resolve(null);
    await sound;await permission;ring(0,true);
   }finally{b.disabled=false}
  }
 });
 setInterval(tick,1000);window.addEventListener('focus',tick);document.addEventListener('visibilitychange',()=>{if(!document.hidden)tick()});
 render();
})();
