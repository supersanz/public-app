'use strict';
// Compact progression tracks: viewing rewards never changes an outfit.
pages.rewards=()=>`<section class="page rewards-page compact-rewards">${heading('성장 보상','',true)}<p class="reward-intro">작은 성장이 모여, 새로운 취향으로.</p><div class="reward-lanes">${cats.map((name,category)=>{
  const current=level(category),items=unlocks.map((u,i)=>({i,category:u[0],lv:u[1]})).filter(x=>x.category===category).sort((a,b)=>a.lv-b.lv);
  return `<article class="reward-lane"><div class="lane-heading">${icon(['book','heart','home','moon','coffee'][category])}<h3>${name}</h3><span>Lv.${current}</span></div><div class="lane-track" tabindex="0" role="region" aria-label="${name} 보상 가로 스크롤">${items.map(({i,lv})=>`<div class="lane-node ${unlocked(i)?'unlocked':'locked'}" title="${esc(clothes[i])} · Lv.${lv} ${unlocked(i)?'해금':'잠김'}"><div class="lane-item">${itemImage(i)}<span class="reward-state" aria-label="${unlocked(i)?'해금':'잠김'}">${unlocked(i)?'✓':'🔒'}</span></div><span class="level-node">${lv}</span><span class="lane-item-name">${esc(clothes[i])}</span></div>`).join('')}</div></article>`;
}).join('')}</div></section>`;

let wheelDraft=null,lastAlarm=[0,0];
function wheelTime(draft=wheelDraft){return `${String((draft.hour%12)+(draft.period?12:0)).padStart(2,'0')}:${String(draft.minute).padStart(2,'0')}`}
function openTimeWheel(i,j){
  const [hour,minute]=data.alarms[i][j].split(':').map(Number);
  alarmEditor=[i,j];lastAlarm=[i,j];wheelDraft={period:hour>=12?1:0,hour:hour%12||12,minute};
  modal='timeWheel';render();
}
pages.alarm=()=>`<section class="page alarm-page">${heading('알람 설정')}<p class="note">기상 및 취침 시간 설정 전에는 추가 경험치가 적용되지 않습니다.</p>${['평일','주말'].map((name,i)=>`<article class="alarm-card"><div class="alarm-card-heading"><h2>${name}</h2><small>${i?'토 · 일':'월 · 화 · 수 · 목 · 금'}</small></div>${['기상','취침'].map((label,j)=>`<div class="alarm-entry"><div class="alarm-label">${icon(j?'moon':'bell')}<span>${label}</span></div><button class="alarm-time-button" data-open-wheel="${i},${j}" aria-label="${name} ${label} 시간 설정"><strong>${timeText(data.alarms[i][j])}</strong>${icon('clock')}</button><button class="alarm-switch ${data.alarms[i][j+2]?'on':''}" role="switch" aria-checked="${Boolean(data.alarms[i][j+2])}" aria-label="${name} ${label} 알람" data-alarm-switch="${i},${j+2}"><span></span></button></div>`).join('')}</article>`).join('')}</section>`;
function wheelColumn(key,label,values,selected){return `<div class="wheel-column"><span class="wheel-label">${label}</span><div class="time-wheel" role="listbox" aria-label="${label}" tabindex="0" data-wheel="${key}" data-selected="${selected}" aria-activedescendant="wheel-${key}-${selected}">${values.map((value,index)=>`<div class="wheel-option ${index===selected?'chosen':''}" id="wheel-${key}-${index}" role="option" aria-selected="${index===selected}" data-wheel-index="${index}">${value}</div>`).join('')}</div></div>`}
const dialogBeforeWheel=dialog;
dialog=()=>modal!=='timeWheel'?dialogBeforeWheel():`<div class="overlay wheel-overlay"><section class="modal wheel-modal" role="dialog" aria-modal="true" aria-labelledby="dialog-title"><div class="heading"><div><small>${alarmEditor[0]?'주말':'평일'} · ${alarmEditor[1]?'취침':'기상'}</small><h2 id="dialog-title">시간 설정</h2></div><button class="icon" data-close aria-label="닫기">×</button></div><p class="wheel-guide">위아래로 스크롤해 시간을 맞춰 주세요.</p><div class="wheel-picker"><div class="wheel-selection"></div>${wheelColumn('period','오전 / 오후',['오전','오후'],wheelDraft.period)}${wheelColumn('hour','시',Array.from({length:12},(_,i)=>String(i+1).padStart(2,'0')),wheelDraft.hour-1)}<span class="wheel-colon">:</span>${wheelColumn('minute','분',Array.from({length:60},(_,i)=>String(i).padStart(2,'0')),wheelDraft.minute)}</div><button class="primary" data-save-wheel>이 시간으로 저장</button></section></div>`;
function updateWheel(wheel){
  const options=[...wheel.querySelectorAll('[role="option"]')];
  const selected=Math.max(0,Math.min(options.length-1,Math.round(wheel.scrollTop/40)));
  wheel.dataset.selected=String(selected);wheel.setAttribute('aria-activedescendant',`wheel-${wheel.dataset.wheel}-${selected}`);
  options.forEach((option,index)=>{option.classList.toggle('chosen',selected===index);option.setAttribute('aria-selected',String(index===selected))});
  wheelDraft[wheel.dataset.wheel]=selected+(wheel.dataset.wheel==='hour'?1:0);
}
const renderBeforeWheel=render;
render=function(){
  renderBeforeWheel();
  document.getElementById('app').classList?.toggle('is-rewards',page==='rewards');
  document.querySelectorAll('[data-wheel]').forEach(wheel=>{
    wheel.scrollTop=Number(wheel.dataset.selected)*40;
    wheel.addEventListener('scroll',()=>updateWheel(wheel),{passive:true});
    // A mouse wheel/trackpad over the digits advances this column directly.
    // Disable snap during the event so small deltas cannot snap back unchanged.
    wheel.addEventListener('wheel',e=>{
      e.preventDefault();
      const count=wheel.querySelectorAll('[role="option"]').length;
      const next=Math.max(0,Math.min(count-1,Number(wheel.dataset.selected)+(e.deltaY>0?1:e.deltaY<0?-1:0)));
      wheel.scrollTop=next*40;updateWheel(wheel);
    },{passive:false});
    let drag=null;
    wheel.addEventListener('pointerdown',e=>{if(e.button>0)return;drag={id:e.pointerId,y:e.clientY,top:wheel.scrollTop,moved:false,index:e.target.closest('[data-wheel-index]')?.dataset.wheelIndex};wheel.setPointerCapture?.(e.pointerId)});
    wheel.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;const distance=drag.y-e.clientY;if(Math.abs(distance)>3)drag.moved=true;wheel.scrollTop=drag.top+distance;updateWheel(wheel)});
    const finishDrag=()=>{if(drag){wheel.dataset.dragged=drag.moved?'true':'false';const target=!drag.moved&&drag.index!==undefined?Number(drag.index):Number(wheel.dataset.selected);drag=null;wheel.scrollTop=target*40;updateWheel(wheel)}};
    wheel.addEventListener('pointerup',finishDrag);wheel.addEventListener('pointercancel',finishDrag);
    wheel.addEventListener('keydown',e=>{
      const offset={ArrowDown:1,ArrowUp:-1,PageDown:5,PageUp:-5}[e.key];
      if(offset!==undefined){e.preventDefault();wheel.scrollTop+=offset*40;updateWheel(wheel)}
      if(e.key==='Home'||e.key==='End'){e.preventDefault();wheel.scrollTop=e.key==='Home'?0:wheel.scrollHeight;updateWheel(wheel)}
    });
    wheel.addEventListener('click',e=>{if(wheel.dataset.dragged==='true'){wheel.dataset.dragged='false';return}const option=e.target.closest('[data-wheel-index]');if(option){wheel.scrollTop=Number(option.dataset.wheelIndex)*40;updateWheel(wheel)}});
  });
};
document.addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b)return;const d=b.dataset;
 const stop=()=>{e.preventDefault();e.stopImmediatePropagation()};
 if(d.page==='alarm'){stop();page='alarm';modal='';render();window.scrollTo(0,0);return}
 if('openWheel'in d){stop();openTimeWheel(...d.openWheel.split(',').map(Number));return}
 if('alarmSwitch'in d){stop();const [i,j]=d.alarmSwitch.split(',').map(Number),previous=data.alarms[i][j];data.alarms[i][j]=!previous;if(!persist())data.alarms[i][j]=previous;render();return}
 if('saveWheel'in d){stop();document.querySelectorAll('[data-wheel]').forEach(updateWheel);const [i,j]=alarmEditor,previous=data.alarms[i][j],previousConfigured=data.alarmTimesConfigured;if(wheelTime()===data.alarms[i][1-j]){toast('기상 시간과 취침 시간을 다르게 설정해 주세요.');return}data.alarms[i][j]=wheelTime();data.alarmTimesConfigured={...previousConfigured,[i+','+j]:true};if(!persist()){data.alarms[i][j]=previous;if(previousConfigured===undefined)delete data.alarmTimesConfigured;else data.alarmTimesConfigured=previousConfigured;return}modal='';render();toast('알람 시간을 저장했어요.');return}
},true);
render();
