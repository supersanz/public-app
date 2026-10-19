'use strict';
// Destination gallery and travel details.
const atlasLock='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="6" y="10" width="12" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/><path d="M12 14v3"/></svg>';
const atlasDetail=detail;detail=function(i){atlasDetail(i);if(travelPending(i)){$('detail-copy').textContent='새로운 여행지를 준비하고 있어요.';$('detail-action').textContent='준비중';$('detail-action').disabled=true;return;}if(!travelGate(i)&&travelLocked(i))$('detail-copy').textContent=places[i][3]+'\n\nLv. '+places[i][1]+' 달성 시 여행할 수 있어요.\n현재 Lv. '+mapLevel;};
function galleryCard(i){
 const p=places[i],locked=travelLocked(i);
 if(travelPending(i))return '<div class="destination-card destination-preparing" aria-label="'+p[0]+' 준비중" ><span class="destination-image"><span class="destination-placeholder">준비중</span></span><span class="destination-copy"><small>Lv. '+mapLevelLabel(i)+'</small><strong>'+p[0]+'</strong></span></div>';
 return '<button class="destination-card '+(locked?'is-locked':'')+'" data-place="'+i+'" aria-label="'+p[0]+' '+(i===equipped?'현재 여행 중':travelPending(i)?'준비중':locked?'해금 조건 확인':'여행하기')+'"><span class="destination-image"><img src="'+root+p[2]+'" alt="" loading="lazy">'+(locked?'<span class="destination-lock">'+atlasLock+'</span>':'')+'</span><span class="destination-copy"><small>'+ (i===equipped?'현재 여행 중':travelPending(i)?'준비중':'Lv. '+mapLevelLabel(i))+'</small><strong>'+p[0]+'</strong></span></button>';
}
renderMap=function(){
 const p=places[equipped];
 $('map').innerHTML='<div class="gallery-toolbar"><h2>나의 여행</h2></div><button class="destination-current" data-place="'+equipped+'" aria-label="현재 여행지 '+p[0]+'"><img src="'+root+p[2]+'" alt=""><span class="destination-current-badge">지금 이곳</span><span class="destination-current-copy"><small>Lv. '+mapLevelLabel(equipped)+'</small><strong>'+p[0]+'</strong></span></button><h2 class="destinations-title">전체 여행지</h2>'+'<div class="destination-grid">'+places.map((_,i)=>galleryCard(i)).join('')+'</div>';
};
renderMap();

// Display the same reward values used by the app's XP timer for every map.
const detailWithConditions=detail;
detail=function(i){
 detailWithConditions(i);
 if(travelPending(i))return;
 const id=mapIds[i],motion=TravelerRewards.bundles[id];
 const amount=TravelerRewards.items[id]?.exp??TravelerRewards.items[motion]?.exp??0;
 $('detail-copy').textContent+='\n\n'+(amount?'추가 경험치 · 5초마다 +'+amount+' EXP\n장착한 맵의 경험치가 앱을 꺼둔 동안에도 쌓여요. 다시 접속하면 한꺼번에 반영됩니다.':'추가 경험치 없음 · 기본 시작 맵입니다.');
};

// Compact requirements for locked destinations.
const atlasFullDetail=detail;
detail=function(i){
 atlasFullDetail(i);
 const copy=$('detail-copy');copy.classList.remove('locked-requirements');
 if(travelPending(i)||!travelLocked(i))return;
 copy.replaceChildren();copy.classList.add('locked-requirements');
 const gate=travelGate(i),level=gate?.level||places[i][1];
 function row(label,value,complete){
  const line=document.createElement('div'),name=document.createElement('span'),count=document.createElement('strong');
  line.className='requirement-line'+(complete?' is-complete':'');name.textContent=label;count.textContent=value;line.append(name,count);copy.append(line);
 }
 row('Lv. '+mapLevelLabel(i)+' 달성',mapLevel>=level?'✓ 달성':Math.min(mapLevel,level)+' / '+level,mapLevel>=level);
 if(gate)row(gate.label,Math.min(gate.count,gate.target)+' / '+gate.target+(gate.unit||'회'),gate.activityMet);
 const id=mapIds[i],motion=TravelerRewards.bundles[id],amount=TravelerRewards.items[id]?.exp??TravelerRewards.items[motion]?.exp??0;
 if(amount){const reward=document.createElement('div');reward.className='requirement-reward';reward.textContent='장착 보상 · 5초마다 +'+amount+' EXP';copy.append(reward);const note=document.createElement('small');note.className='requirement-offline';note.textContent='앱을 꺼도 적립';copy.append(note);}
 $('detail-action').textContent='잠긴 여행지';
};

const atlasCompactDetail=detail;
detail=function(i){
 atlasCompactDetail(i);
 const copy=$('detail-copy');copy.classList.remove('unlocked-details');
 if(travelPending(i)||travelLocked(i))return;
 copy.replaceChildren();copy.classList.add('unlocked-details');
 const intro=document.createElement('p');intro.className='destination-summary';intro.textContent=places[i][3];copy.append(intro);
 const id=mapIds[i],motion=TravelerRewards.bundles[id],amount=TravelerRewards.items[id]?.exp??TravelerRewards.items[motion]?.exp??0;
 const reward=document.createElement('div');reward.className='destination-reward';
 const label=document.createElement('span'),value=document.createElement('strong');label.textContent='장착 보상';value.textContent=amount?'5초마다 +'+amount+' EXP':'추가 경험치 없음';reward.append(label,value);copy.append(reward);
 if(amount){const note=document.createElement('small');note.className='destination-offline';note.textContent='앱을 꺼도 적립 · 다시 접속하면 반영';copy.append(note);}
 $('detail-level').textContent=i===equipped?'현재 여행 중':'여행 가능';
};
