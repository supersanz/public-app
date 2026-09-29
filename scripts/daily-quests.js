'use strict';
// Quest awards use the existing dated activity ledger, so every growth view agrees.
const DailyQuests=(()=>{
 function status(data,date,id){
  const logs=data.logs.filter(log=>log.date===date&&(log.ids||[]).includes(id));
  return {done:logs.length>0,legacy:logs.some(log=>log.source!=='daily-quest'),xp:logs.reduce((sum,log)=>sum+(Number.isFinite(log.exp?.[id])?log.exp[id]:20),0)};
 }
 function change(data,date,id,complete,xp){
  const current=status(data,date,id);
  if(!Number.isInteger(id)||id<0||!Number.isFinite(xp)||xp<0||current.legacy||current.done===complete)return false;
  if(complete){
   let log=data.logs.find(log=>log.date===date&&log.source==='daily-quest');
   if(!log){log={date,source:'daily-quest',ids:[],exp:{},counts:{},penalty:0};data.logs.push(log);}
   log.ids.push(id);log.exp[id]=xp;log.counts[id]=1;
  }else{
   data.logs=data.logs.filter(log=>{
    if(log.date!==date||log.source!=='daily-quest')return true;
    log.ids=log.ids.filter(value=>value!==id);delete log.exp[id];delete log.counts[id];return log.ids.length>0;
   });
  }
  return true;
 }
 function save(data,date,id,complete,xp,persist){
  const previous=JSON.stringify(data.logs);
  if(!change(data,date,id,complete,xp))return false;
  if(persist())return true;
  data.logs=JSON.parse(previous);return false;
 }
 function weekStart(date){
  const d=new Date(date+'T12:00:00');d.setDate(d.getDate()-(d.getDay()+6)%7);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
 }
 function weeklyStatus(data,date,id){
  const start=weekStart(date),logs=data.logs.filter(log=>log.date>=start&&log.date<=date&&(log.ids||[]).includes(id));
  return {done:logs.length>0,legacy:logs.some(log=>log.source!=='weekly-quest'),xp:logs.reduce((sum,log)=>sum+(log.exp?.[id]||0),0)};
 }
 function saveWeekly(data,date,id,complete,xp,persist){
  const current=weeklyStatus(data,date,id);
  if(!Number.isInteger(id)||id<0||!Number.isFinite(xp)||xp<0||current.legacy||current.done===complete)return false;
  const previous=JSON.stringify(data.logs),start=weekStart(date);
  if(complete)data.logs.push({date,source:'weekly-quest',ids:[id],exp:{[id]:xp},counts:{[id]:1},penalty:0});
  else data.logs=data.logs.filter(log=>{
   if(log.source!=='weekly-quest'||log.date<start||log.date>date)return true;
   log.ids=log.ids.filter(value=>value!==id);delete log.exp[id];delete log.counts[id];return log.ids.length>0;
  });
  if(persist())return true;data.logs=JSON.parse(previous);return false;
 }
 function weeklyProgress(data,date,rule){
  const start=weekStart(date),seen=new Map();
  for(const log of data.logs){
   if(log.source!=='daily-quest'||log.date<start||log.date>date)continue;
   for(const id of log.ids||[])if(rule.activities.includes(id)){
    const key=log.date+':'+id,units=rule.countUnits?Math.max(1,Math.floor(Number(log.counts?.[id])||1)):1;
    seen.set(key,Math.max(seen.get(key)||0,units));
   }
  }
  return {count:[...seen.values()].reduce((a,b)=>a+b,0),target:rule.target};
 }
 function reconcileWeekly(data,date,rules){
  for(const [key,rule] of Object.entries(rules)){
   const id=Number(key),earned=weeklyStatus(data,date,id),eligible=weeklyProgress(data,date,rule).count>=rule.target;
   if(eligible!==earned.done)saveWeekly(data,date,id,eligible,rule.xp,()=>true);
  }
 }
 function syncWeekly(data,date,rules,persist){
  const before=JSON.stringify(data.logs);reconcileWeekly(data,date,rules);
  if(before===JSON.stringify(data.logs))return true;
  if(persist())return true;data.logs=JSON.parse(before);return false;
 }
 function saveWithWeekly(data,date,id,complete,xp,persist,rules){
  const before=JSON.stringify(data.logs);
  if(!change(data,date,id,complete,xp))return false;
  reconcileWeekly(data,date,rules);
  if(persist())return true;data.logs=JSON.parse(before);return false;
 }
 function coffeeCups(data,date,id=11){return data.logs.filter(l=>l.date===date&&(l.ids||[]).includes(id)).reduce((sum,l)=>sum+Math.max(1,Math.floor(Number(l.counts?.[id])||1)),0);}
 function saveCoffeeCups(data,date,cups,xp,persist,rules,id=11){
  if(![11,12,13].includes(id)||!Number.isSafeInteger(cups)||cups<0||status(data,date,id).legacy)return false;
  const before=JSON.stringify(data.logs),current=coffeeCups(data,date,id);
  if(cups===current)return false;
  if(cups===0)change(data,date,id,false,xp);
  else{
   if(!current)change(data,date,id,true,xp);
   const log=data.logs.find(l=>l.date===date&&l.source==='daily-quest'&&l.ids.includes(id));
   log.counts[id]=cups;
  }
  reconcileWeekly(data,date,rules);
  if(persist())return true;data.logs=JSON.parse(before);return false;
 }
 function weeklyOffering(data,date){
  const pool=[32,33,36,37,38,39,45],week=weekStart(date);
  const offset=((Math.floor((Date.parse(week+'T00:00:00Z')-Date.parse('2026-09-28T00:00:00Z'))/604800000)*3)%pool.length+pool.length)%pool.length;
  // Keep this week's pre-existing commitments during rollout; refresh next Monday.
  const kept=(data.weeklyChallenges?.[week]||[]).filter(id=>pool.includes(id));
  for(const id of pool)if(weeklyStatus(data,date,id).done)kept.push(id);
  return [...new Set([...kept,...pool.map((_,i)=>pool[(offset+i)%pool.length])])].slice(0,4);
 }
 return {status,change,save,weekStart,weeklyStatus,saveWeekly,weeklyProgress,syncWeekly,saveWithWeekly,coffeeCups,saveCoffeeCups,weeklyOffering};
})();
if(typeof module!=='undefined')module.exports=DailyQuests;
