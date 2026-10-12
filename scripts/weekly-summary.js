// Read-only summary of daily activity records; weekly rewards are not activities.
function weeklyActivitySummary(logs,date,activities,catalog){
 const shift=(value,days)=>{const d=new Date(value+'T12:00:00');d.setDate(d.getDate()+days);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
 const start=DailyQuests.weekStart(date),previousStart=shift(start,-7),previousEnd=shift(date,-7);
 function collect(from,to){
  const seen=new Set(),days=new Set(),categories=[0,0,0,0];
  for(const log of logs||[]){
   if(log.date<from||log.date>to||log.source==='weekly-quest')continue;
   for(const id of log.ids||[]){
    if(!activities[id]||catalog[id]?.period==='weekly')continue;
    const key=log.date+':'+id;if(seen.has(key))continue;seen.add(key);days.add(log.date);
    const category=activities[id][1]===4?2:activities[id][1];if(category>=0&&category<4)categories[category]++;
   }
  }
  return {count:seen.size,days:days.size,categories};
 }
 const current=collect(start,date),previous=collect(previousStart,previousEnd);
 return {start,date,current,previous,change:current.count-previous.count};
}
function weeklySummaryCard(){
 const s=weeklyActivitySummary(data.logs,today(),acts,QuestCatalog),names=['자기계발','운동','생활','휴식'];
 const max=Math.max(...s.current.categories),leaders=names.filter((_,i)=>s.current.categories[i]===max);
 const compare=s.previous.count===0?'지난주 같은 기간의 기록이 아직 없어요.':s.change===0?'지난주 같은 기간과 같은 수의 활동을 남겼어요.':`지난주 같은 기간보다 ${Math.abs(s.change)}개 ${s.change>0?'더 기록했어요.':'적게 기록했어요. 나만의 속도로 이어가요.'}`;
 return `<section class="weekly-summary-card" aria-labelledby="weekly-summary-title"><div class="weekly-summary-heading"><h2 id="weekly-summary-title">이번 주 요약</h2><span>${s.start.slice(5).replace('-','.')} – ${s.date.slice(5).replace('-','.')}</span></div><div class="weekly-summary-stats"><div><span>활동한 날</span><strong>${s.current.days}<small>일</small></strong></div><div><span>기록한 활동</span><strong>${s.current.count}<small>개</small></strong></div></div><p class="weekly-summary-comparison">${s.current.count?compare:'이번 주 첫 활동을 남겨보세요.'}</p>${s.current.count?`<div class="weekly-summary-categories">${names.map((name,i)=>`<span>${name}<b>${s.current.categories[i]}</b></span>`).join('')}</div><p class="weekly-summary-note">${leaders.length===4?'네 분야를 고르게 챙겼어요.':`가장 많이 챙긴 분야는 ${leaders.join(' · ')}이에요.`}</p>`:''}<small class="weekly-summary-footnote">월요일부터 오늘까지 · 같은 활동은 하루 1개로 집계</small></section>`;
}
