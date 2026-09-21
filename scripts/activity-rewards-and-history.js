'use strict';
// One-time migration preserves records while resetting the four ability levels.
if(data.growthVersion!==1){data.levelBaseline=totals().map((xp,i)=>i<4?xp:0);data.growthVersion=1;persist()}
const rewardSteps=[1,5,10,15,20,25,30];
const rewardTemplates=[4,9,2,3,11];
const variantSource={};
cats.forEach((name,category)=>rewardSteps.forEach(required=>{
  if(unlocks.some(([c,l])=>c===category&&l===required))return;
  const id=clothes.length,source=rewardTemplates[category];
  clothes.push(`${['별빛 안경','러닝 재킷','가든 에이프런','드림 헤드폰','모카 볼캡'][category]} ${required}`);
  slots.push(slots[source]);unlocks.push([category,required]);variantSource[id]=source;
  wardrobeGroups[category===0||category===3||category===4?1:0].push(id);
}));
// Equipment validation runs after the complete item catalog has loaded.
// All body and clothing shapes use the same coordinates, so they cannot float apart.
function outfitShape(id){
  const source=variantSource[id]??id;
  const colors=['#a294df','#414253','#d5b894','#a8dcd5','#6d607e','#e2c29b','#9dadd4','#657693','#f8eedb','#98c5af','#dbbacb','#d2b18b','#e8acc6','#ebc974','#839bd1','#55516d'];
  const color=variantSource[id]!==undefined?['#ad96de','#88bea5','#dfbd85','#e4abc6','#a2bfd7'][rewardSteps.indexOf(unlocks[id][1])%5]:colors[source];
  const outlines='stroke="#55495f" stroke-width="2" stroke-linejoin="round"';
  let art='';
  if([0,1,2,8,9,12,15].includes(source)){
    art=`<path d="M61 110 48 120 52 140 63 136 63 151 99 151 99 136 110 140 114 120 101 110 90 105H72Z" fill="${color}"/><path d="M72 106q9 14 18 0M63 122v15m36-15v15" fill="none"/>`;
    if(source!==8)art+=`<path d="M81 119v31" fill="none" stroke="#fff"/><path d="M66 137h8m14 0h8" fill="none"/>`;
    if([1,12,15].includes(source))art+=`<path d="M63 111q-5-22 18-23 23 1 18 23l-11 10H74Z" fill="${color}"/><path d="m74 119-1 12m15-12 1 12" stroke="#fff"/>`;
    if(source===2)art+=`<path d="M70 114h22l7 44H63Z" fill="#faf0d8"/><path d="M73 134h17v11H73Z" fill="${color}"/>`;
  }else if(source===7)art='<path d="M63 146h36l-2 24H85l-4-14-4 14H65Z" fill="#72829b"/><path d="M67 152h7m14 0h7"/>';
  else if(source===14)art='<path d="M64 144h34l8 21H56Z" fill="#9baddb"/><path d="m69 148-4 14m14-14v14m10-14 5 14" fill="none"/>';
  else if([5,10].includes(source))art=`<path d="M64 168h14v10H59q-2-7 5-10m21 0h14q7 3 5 10H85Z" fill="${color}"/><path d="M59 177h19m7 0h19" stroke="#fff" stroke-width="3"/>`;
  else if(source===3)art='<path d="M40 65q0-48 41-48t41 48" fill="none" stroke="#9686c3" stroke-width="8"/><rect x="33" y="59" width="13" height="27" rx="6" fill="#b8dfdc"/><rect x="116" y="59" width="13" height="27" rx="6" fill="#b8dfdc"/>';
  else if(source===4)art=`<rect x="47" y="67" width="28" height="22" rx="8" fill="#ffffff55" stroke="${color}"/><rect x="87" y="67" width="28" height="22" rx="8" fill="#ffffff55" stroke="${color}"/><path d="M75 75h12" fill="none"/>`;
  else if(source===11)art=`<path d="M43 44q0-33 39-33t39 33Z" fill="${color}"/><path d="M39 42q38-15 83 0l6 8H36Z" fill="${color}"/><path d="m78 23 3-5 3 5 6 1-4 4 1 6-6-3-5 3 1-6-4-4Z" fill="#fff5bf" stroke="none"/>`;
  else if(source===13)art='<path d="M70 112q11 18 22 0" fill="none" stroke="#d9b45c"/><path d="m81 121 4 5-4 5-4-5Z" fill="#ffe5a2"/>';
  else if(source===6)art='<rect x="48" y="116" width="65" height="39" rx="12" fill="#9dadd4"/><path d="M64 113v33m34-33v33" fill="none" stroke="#667896" stroke-width="5"/>';
  else {
    const props=[
      '<path d="M106 134h22v27h-22Z" fill="#cbb4e4"/><path d="M110 137v21m5-16h9" stroke="#fff"/>',
      '<rect x="110" y="132" width="15" height="29" rx="5" fill="#a8d8e5"/><path d="M113 128h9v7h-9Z" fill="#86b7cc"/>',
      '<ellipse cx="120" cy="133" rx="6" ry="9" fill="#dfc39a"/><path d="M120 140v23" stroke="#b59978" stroke-width="5"/>',
      '<rect x="101" y="139" width="33" height="20" rx="6" fill="#a798d5"/><path d="M114 142h9v11h-9Z" fill="#e0eef0"/><path d="M106 148h5m-2-3v6m18-3h2"/>',
      '<path d="m109 138 3 23h16l3-23Z" fill="#ead0ad"/><path d="M107 137h26v5h-26Z" fill="#fff5e6"/><path d="M113 149h14v6h-14Z" fill="#b2957c"/>',
      '<path d="M120 122v39q0 10-8 3" fill="none"/><path d="M100 139q20-35 40 0Z" fill="#acb6e2"/>'
    ];art=props[source-16]||props[0];
  }
  return `<g ${outlines}>${art}</g>`;
}
function itemImage(i){const source=variantSource[i]??i;const box=slots[i]==='head'?'25 4 115 91':slots[i]==='eyes'?'40 58 82 42':slots[i]==='feet'?'51 160 61 26':slots[i]==='legs'?'48 137 66 39':slots[i]==='neck'?'64 104 34 33':slots[i]==='prop'?'95 118 51 55':'40 96 84 69';return `<svg class="inventory-sprite" viewBox="${box}" preserveAspectRatio="xMidYMid meet" aria-hidden="true">${outfitShape(i)}</svg>`}
avatarLayers=function(){
  const equipped=data.equipped.filter(i=>clothes[i]&&unlocked(i));
  const layer=i=>`<g data-equipped-layer="${i}">${outfitShape(i)}</g>`;
  const order=['bag','legs','top','outer','feet','neck','head','eyes','prop'];
  return `<div class="dressed-avatar chibi-avatar" role="img" aria-label="하늘 · ${equipped.map(i=>esc(clothes[i])).join(', ')||'기본 옷차림'}"><svg viewBox="0 0 162 200" xmlns="http://www.w3.org/2000/svg"><ellipse cx="81" cy="184" rx="39" ry="7" fill="#80749b25"/><g stroke="#55495f" stroke-width="2" stroke-linejoin="round"><path d="M38 68q-17 52 12 63l18-37h26l19 37q29-11 11-63Z" fill="#d6d0e8"/>${equipped.filter(i=>slots[i]==='bag').map(layer).join('')}<path d="M65 144h32v27H85l-4-15-4 15H65Z" fill="#f5dccd"/><path d="M62 169h17v10H58q-1-7 4-10m23 0h15q7 4 5 10H85Z" fill="#f5f0f9"/><path d="M64 107 51 119l2 22 12-3v17h32v-17l12 3 3-22-14-12Z" fill="#f7eddf"/><path d="M55 134q-7 8 0 12 7 3 9-6m36 0q2 9 9 6 7-4 0-12" fill="#f5dccd"/>${equipped.filter(i=>slots[i]!=='bag'&&order.indexOf(slots[i])<6).sort((a,b)=>order.indexOf(slots[a])-order.indexOf(slots[b])).map(layer).join('')}<path d="M37 60q0-44 44-44t44 44v12q0 39-44 39T37 72Z" fill="#fae6da"/><path d="M36 71Q25 12 81 12t45 61l-17-26-4 18-18-25-8 23-19-21-5 25-10-12Z" fill="#e5e0f0"/><path d="M43 46q11-24 35-26m11 0q20 4 29 22" fill="none" stroke="#fff8" stroke-width="4"/><path d="M48 71q10-6 20 0m26 0q10-6 20 0" fill="none" stroke-width="3"/><ellipse cx="59" cy="81" rx="7" ry="11" fill="#76639f"/><ellipse cx="103" cy="81" rx="7" ry="11" fill="#76639f"/><ellipse cx="57" cy="77" rx="2.7" ry="4" fill="white" stroke="none"/><ellipse cx="101" cy="77" rx="2.7" ry="4" fill="white" stroke="none"/><path d="M77 97q4 4 8 0" fill="none"/><ellipse cx="47" cy="94" rx="8" ry="4" fill="#edb4bd" stroke="none" opacity=".6"/><ellipse cx="115" cy="94" rx="8" ry="4" fill="#edb4bd" stroke="none"/>${equipped.filter(i=>order.indexOf(slots[i])>=6).map(layer).join('')}</g></svg></div>`;
};
pages.home=()=>{const p=player(),log=data.logs.find(l=>l.date===today()),daily=(log?.ids||[]).reduce((s,id)=>s+activityExp(log,id),0);return `<section class="page home-page"><header class="home-header"><span></span><button class="icon" data-page="alarm" aria-label="알람 설정">${icon('bell')}</button></header><div class="character-stage">${avatarLayers()}<button class="stage-edit" data-page="style" aria-label="캐릭터 꾸미기">${icon('shirt')}</button></div><div class="identity"><h2>하늘 <span>Lv. ${p.lv}</span></h2><span>${p.xp} / ${LevelCurve.required(p.lv).toLocaleString()} EXP</span></div>${bar(p.xp/LevelCurve.required(p.lv)*100)}<p class="xp-summary">오늘 +${daily} EXP <span>기록 누적 ${p.earned} EXP</span></p><div class="section-heading"><h2>오늘의 성장</h2><span>100 EXP마다 레벨 업</span></div><div class="stats">${cats.slice(0,4).map((c,i)=>`<div class="stat">${icon(['book','heart','home','moon'][i])}<strong>${c}</strong><span>Lv. ${level(i)}</span>${bar(categoryExp(i)%100)}<small>${categoryExp(i)%100} / 100 EXP</small></div>`).join('')}</div>${log?.penalty?`<p class="health-note">오늘 건강 게이지 −${log.penalty} · 경험치는 유지돼요</p>`:''}<button class="caffeine frame-${data.skin}" data-page="caffeine">${icon('coffee')}<strong>카페인</strong><span>Lv. ${level(4)}</span><span>›</span></button><button class="text-link" data-page="rewards">성장 보상 둘러보기 ›</button></section>`};
let lockedPreview=null;
pages.style=()=>`<section class="page wardrobe-page">${heading('꾸미기','<button class="basic-button" data-reset-outfit>초기화</button>')}<div class="character-stage wardrobe-stage">${avatarLayers()}${lockedPreview!==null?`<div class="locked-preview">${itemImage(lockedPreview)}<small>🔒 ${esc(clothes[lockedPreview])}<br>${cats[unlocks[lockedPreview][0]]} Lv.${unlocks[lockedPreview][1]} 해금</small><button data-dismiss-preview aria-label="잠긴 아이템 미리보기 닫기">×</button></div>`:''}</div><div class="tabs">${['의상','액세서리','소품'].map((t,i)=>`<button data-wardrobe-tab="${i}" class="${wardrobeTab===i?'active':''}">${t}</button>`).join('')}</div><div class="wardrobe-helper"><small>착용한 아이템을 다시 누르면 해제돼요.</small></div><div class="items">${wardrobeGroups[wardrobeTab].map(i=>`<button class="item ${data.equipped.includes(i)?'selected':''} ${unlocked(i)?'':'locked'}" data-outfit="${i}" aria-pressed="${data.equipped.includes(i)}" aria-label="${esc(clothes[i])}${unlocked(i)?'':' 잠김'}"><div class="item-art">${itemImage(i)}${data.equipped.includes(i)?'<span class="check">✓</span>':''}${unlocked(i)?'':'<span class="lock">🔒</span>'}</div><span class="item-name">${esc(clothes[i])}</span><small class="unlock-label">${unlocked(i)?data.equipped.includes(i)?'착용 중':'사용 가능':`${cats[unlocks[i][0]]} Lv.${unlocks[i][1]}`}</small></button>`).join('')}</div></section>`;
pages.rewards=()=>`<section class="page rewards-page">${heading('성장 보상','',true)}<p class="intro">레벨이 오르면 자동으로 열려요.<br>옆으로 넘겨 Lv.30까지 확인해 보세요.</p>${cats.map((c,category)=>{const current=level(category),items=unlocks.map((u,i)=>({i,c:u[0],lv:u[1]})).filter(x=>x.c===category).sort((a,b)=>a.lv-b.lv),next=items.find(x=>x.lv>current);return `<article class="panel reward-panel"><div class="reward-title">${icon(['book','heart','home','moon','coffee'][category])}<h3>${c}</h3><span>Lv.${current}</span></div><div class="reward-track" tabindex="0" role="region" aria-label="${c} 성장 보상, 가로 스크롤">${items.map(({i,lv})=>`<button class="reward-card ${unlocked(i)?'available':'locked'}" data-reward="${i}"><div class="reward-image">${itemImage(i)}</div><b>Lv.${lv}</b><span>${esc(clothes[i])}</span><small>${unlocked(i)?data.equipped.includes(i)?'✓ 착용 중':'✓ 해금 · 착용하기':'🔒 잠김'}</small></button>`).join('')}</div><p class="next-reward">${next?`다음 보상 Lv.${next.lv} · ${(next.lv-current)*100-categoryExp(category)%100} EXP 남음`:'Lv.30까지 모든 보상을 해금했어요'}</p></article>`}).join('')}</section>`;
// Per recording; historical log.exp values and the legacy 20 EXP fallback stay intact.
const activityRewards={'학원':30,'공부':40,'독서':30,'코딩':40,'러닝':40,'근력운동':40,'필라테스':40,'요리':30,'청소':25,'산책':20,'게임':10,'영화':15,'음악 감상':15,'노래 부르기':20};
function recordingExp(id){return activityRewards[acts[id]?.[0]]??20}
function activityCount(log,id){return Number.isInteger(log.counts?.[id])&&log.counts[id]>0?log.counts[id]:1}
function activityRecordLabel(log,id){const count=activityCount(log,id);return `${acts[id][0]}${count>1?` x${count}`:''}`}
// A single guarded write path is shared by touch and voice recording.
saveActivities=function(ids,penalty=0,penaltyEvents=[]){
  const date=recordingDate();if(date!==today()){toast('기록은 오늘 날짜에만 저장할 수 있어요.');return false}
  ids=[...new Set(ids)].filter(i=>Number.isInteger(i)&&acts[i]);
  penaltyEvents=penaltyEvents.filter(p=>['alcohol','smoking'].includes(p));
  if(!ids.length&&!penaltyEvents.length&&!penalty){toast('기록할 활동을 선택하거나 입력해 주세요.');return false}
  const backup=JSON.stringify(data);let log=data.logs.find(l=>l.date===date);
  if(!log){log={date,ids:[],exp:{},penalty:0};data.logs.push(log)}
  log.exp??={};log.counts??={};const fresh=ids;
  fresh.forEach(id=>{const existed=log.ids.includes(id),previous=existed?activityExp(log,id):0;log.counts[id]=(existed?activityCount(log,id):0)+1;if(!existed)log.ids.push(id);log.exp[id]=previous+recordingExp(id)});
  log.penaltyEvents=[...new Set([...(log.penaltyEvents||[]),...penaltyEvents])];
  log.penalty=Math.max(log.penalty||0,penalty,log.penaltyEvents.reduce((s,p)=>s+(p==='alcohol'?15:10),0));
  if(!persist()){data=JSON.parse(backup);return false}
  selected.clear();historyMonth=new Date(date+'T12:00:00');historyDate=date;navigate('history');
  toast(fresh.length?`${fresh.length}개 활동 · +${fresh.reduce((sum,id)=>sum+recordingExp(id),0)} EXP를 반영했어요.`:'오늘 기록에 반영했어요.');return true;
};
const datedTouch=pages.touch,datedVoice=pages.voice;
const todayOnly=html=>html.replace(/<label class="record-date">[\s\S]*?<\/label>/,'<div class="record-date">기록 날짜 <strong>'+dateLabel(recordingDate())+'</strong></div>').replace(/<p class="record-date-label">[\s\S]*?<\/p>/,'<p class="record-date-label">당일 활동만 기록할 수 있어요.</p>');
const recordBack=html=>html.replace('data-page="home" aria-label="홈으로"','data-page="history" aria-label="나의 기록으로"');
pages.touch=()=>recordBack(todayOnly(datedTouch()));pages.voice=()=>recordBack(todayOnly(datedVoice()));
pages.history=()=>{const y=historyMonth.getFullYear(),m=historyMonth.getMonth(),prefix=`${y}-${String(m+1).padStart(2,'0')}`,days=new Date(y,m+1,0).getDate(),logs=data.logs.filter(l=>l.date<=today()&&l.date.startsWith(prefix)&&(!historyDate||l.date===historyDate)).sort((a,b)=>b.date.localeCompare(a.date)),canRecord=!historyDate||historyDate===today();return `<section class="page record-history">${heading('나의 기록',canRecord?`<button class="icon" data-modal="record" aria-label="오늘 기록 추가">${icon('plus')}</button>`:'')}<p class="intro">기록은 당일에만, 지난 기록은 조회만 가능해요.</p><div class="calendar-heading"><button data-month="-1" aria-label="이전 달">‹</button><strong>${y}년 ${m+1}월</strong><button data-month="1" aria-label="다음 달" ${prefix>=today().slice(0,7)?'disabled':''}>›</button></div><div class="calendar"><button data-date="" class="${!historyDate?'active':''}">전체</button>${Array.from({length:days},(_,i)=>{const d=`${prefix}-${String(i+1).padStart(2,'0')}`;return `<button data-date="${d}" ${d>today()?'disabled':''} class="${historyDate===d?'active':''}"><small>${['일','월','화','수','목','금','토'][new Date(y,m,i+1).getDay()]}</small>${i+1}<i>${data.logs.some(l=>l.date===d)?'•':'&nbsp;'}</i></button>`}).join('')}</div>${logs.length?logs.map(l=>`<article class="panel"><div class="date"><h3>${dateLabel(l.date)}</h3><small>${l.ids.length}개 활동</small></div>${cats.map((c,i)=>{const ids=l.ids.filter(id=>acts[id]?.[1]===i);return ids.length?`<div class="history-row record-category category-${i}"><span><strong>${c}</strong><span class="record-activity-icons">${ids.map(id=>`<button class="record-activity-icon" data-record-label="${esc(activityRecordLabel(l,id))}" aria-label="${esc(activityRecordLabel(l,id))}" title="${esc(activityRecordLabel(l,id))}">${icon(acts[id][2])}${activityCount(l,id)>1?`<span class="record-count">x${activityCount(l,id)}</span>`:''}</button>`).join('')}</span></span><b>+${ids.reduce((s,id)=>s+activityExp(l,id),0)} EXP</b></div>`:''}).join('')}${l.penalty?`<div class="history-row">건강 게이지 감소 <b>−${l.penalty}</b></div>`:''}<div class="summary">총 획득 경험치 <b>+${l.ids.filter(id=>acts[id]).reduce((s,id)=>s+activityExp(l,id),0)} EXP</b></div></article>`).join(''):`<div class="empty">${icon('history')}<h2>아직 기록이 없어요</h2><p>${canRecord?'오늘의 활동을 기록해 보세요.':'지난 날짜에는 기록을 추가할 수 없어요.'}</p>${canRecord?'<button class="primary" data-page="touch">오늘 활동 기록하기</button>':''}</div>`}</section>`};
let alarmEditor=null;
paths.clock='M12 8v5l3 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0';
const timeText=time=>{const [h,m]=time.split(':').map(Number);return `${h<12?'오전':'오후'} ${String(h%12||12).padStart(2,'0')} : ${String(m).padStart(2,'0')}`};
pages.alarm=()=>`<section class="page">${heading('알람 설정')}${['평일','주말'].map((n,i)=>`<article class="panel"><div class="alarm-banner"><h2>${n}</h2><p>${i?'여유로운 주말의 리듬':'규칙적인 하루의 시작과 끝'}</p></div>${['기상시간','취침시간'].map((label,j)=>`<div class="time-row"><span>${label}</span><strong>${timeText(data.alarms[i][j])}</strong><button class="icon" data-alarm-editor="${i},${j}" aria-label="${n} ${label} 시계 설정">${icon('clock')}</button></div>`).join('')}<p class="note">시계 아이콘을 눌러 시간과 알람을 설정하세요.</p></article>`).join('')}<p class="note">이 기기에 설정을 저장합니다. 브라우저를 닫은 동안 울리는 알람은 지원하지 않습니다.</p></section>`;
const growthDialog=dialog;
dialog=()=>modal==='alarmEditor'?`<div class="overlay"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="dialog-title"><div class="heading"><h2 id="dialog-title">${alarmEditor[0]?'주말':'평일'} ${alarmEditor[1]?'취침':'기상'} 알람</h2><button class="icon" data-close aria-label="닫기">×</button></div><label>시간<input id="alarm-clock-value" type="time" value="${data.alarms[alarmEditor[0]][alarmEditor[1]]}" required></label><label class="alarm-enabled"><input id="alarm-clock-enabled" type="checkbox" ${data.alarms[alarmEditor[0]][alarmEditor[1]+2]?'checked':''}>알람 켜기</label><button class="primary" data-commit-alarm>설정 저장</button></section></div>`:growthDialog();
// Capture guards reject stale dates before any existing listener can mutate state.
document.addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b)return;const d=b.dataset;
 const stop=()=>{e.preventDefault();e.stopImmediatePropagation()};
 if(b.disabled){stop();return}
 if('date'in d&&d.date>today()){stop();return}
 if('month'in d&&+d.month>0){const next=new Date(historyMonth.getFullYear(),historyMonth.getMonth()+1,1);if(next>new Date(today()+'T23:59:59')){stop();return}}
 if('save'in d||'voiceSave'in d){if(recordingDate()!==today()){stop();toast('날짜가 바뀌었어요. 오늘 기록 화면을 다시 열어 주세요.');return}}
 if(d.modal==='record'||['touch','voice'].includes(d.page)){
   if(page==='history'&&historyDate&&historyDate!==today()){stop();toast('지난 날짜는 조회만 가능해요.');return}
   recordDate=today();selected.clear();transcript='';stop();if(d.page)navigate(d.page);else{modal='record';render()}return;
 }
 if('outfit'in d||'reward'in d){const i=Number(d.outfit??d.reward);stop();if(!Number.isInteger(i)||!clothes[i])return;if(!unlocked(i)){lockedPreview=i;if('reward'in d){wardrobeTab=wardrobeGroups.findIndex(g=>g.includes(i));navigate('style')}else render();toast(`${cats[unlocks[i][0]]} Lv.${unlocks[i][1]}에 해금돼요.`);return}lockedPreview=null;data.equipped=data.equipped.includes(i)?data.equipped.filter(v=>v!==i):[...data.equipped.filter(v=>slots[v]!==slots[i]),i];persist();render();return}
 if('resetOutfit'in d){stop();lockedPreview=null;data.equipped=defaults.filter(unlocked);persist();render();return}
 if('dismissPreview'in d){stop();lockedPreview=null;render();return}
 if('alarmEditor'in d){stop();alarmEditor=d.alarmEditor.split(',').map(Number);modal='alarmEditor';render();return}
 if('commitAlarm'in d){stop();const value=document.getElementById('alarm-clock-value').value;if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(value)){toast('올바른 시간을 선택해 주세요.');return}const backup=JSON.stringify(data.alarms),[i,j]=alarmEditor;data.alarms[i][j]=value;data.alarms[i][j+2]=document.getElementById('alarm-clock-enabled').checked;if(!persist()){data.alarms=JSON.parse(backup);return}modal='';render();toast('알람 설정을 저장했어요.');return}
},true);
window.addEventListener('storage',e=>{if(e.key!==KEY||!e.newValue)return;try{const next=JSON.parse(e.newValue);if(Array.isArray(next.logs)&&next.growthVersion===1){data=next;render()}}catch{}});
persist();render();


document.addEventListener('click',e=>{const button=e.target.closest('[data-record-label]');if(button)toast(button.dataset.recordLabel)});
