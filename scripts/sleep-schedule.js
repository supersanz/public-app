'use strict';
// Pure local-calendar scheduling, shared by the live scene and regression tests.
function petAlarmRow(date,alarms){return alarms[date.getDay()===0||date.getDay()===6?1:0]}
function petClockOn(date,time){
 if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(time||''))return null;
 const result=new Date(date),[h,m]=time.split(':').map(Number);result.setHours(h,m,0,0);return result;
}
function petSleepState(now,alarms){
 if(!Array.isArray(alarms)||alarms.length<2)return {sleeping:false,wake:null};
 // Yesterday's bedtime can lead into today's weekend/weekday wake time.
 for(let offset=0;offset>=-1;offset--){
  const bedDay=new Date(now);bedDay.setDate(bedDay.getDate()+offset);
  const row=petAlarmRow(bedDay,alarms);if(!row||!row[3])continue;
  const bed=petClockOn(bedDay,row[1]);if(!bed||now<bed)continue;
  if(row[0]===row[1])continue;
  for(let next=0;next<=1;next++){
   const wakeDay=new Date(bedDay);wakeDay.setDate(wakeDay.getDate()+next);
   const wakeRow=petAlarmRow(wakeDay,alarms),wake=petClockOn(wakeDay,wakeRow?.[0]);
   if(!wake||wake<=bed)continue;
   if(wakeRow[2]&&now<wake)return {sleeping:true,wake,bed};
   break;
  }
 }
 return {sleeping:false,wake:null};
}
const PET_BREEDS=[
 {id:'forest',name:'노르웨이 숲',level:1,row:3,description:'작은 숲을 닮은 첫 친구'},
 {id:'bengal',name:'벵갈',level:10,row:4,description:'호기심 가득한 작은 표범'},
 {id:'russian',name:'러시안 블루',level:20,row:2,description:'은빛 털 속 초록 눈'},
 {id:'persian',name:'페르시안',level:30,row:1,description:'눈처럼 하얀 느긋함'},
 {id:'ragdoll',name:'래그돌',level:40,row:0,description:'파란 눈, 포근한 품'},
 {id:'maine',name:'메인쿤',level:50,row:5,description:'다정하고 듬직한 친구'}
];
function petBreedUnlocked(id,lv){return PET_BREEDS.some(b=>b.id===id&&lv>=b.level)}
function petDailyExp(logs,date){return logs.filter(l=>l.date===date).reduce((sum,l)=>sum+(l.ids||[]).filter(id=>acts[id]).reduce((s,id)=>s+activityExp(l,id),0),0)}
