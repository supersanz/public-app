'use strict';
// One completion per calendar week; historical weeks remain in the ledger.
function motionActivityCounts(logs){
 const weeks=new Set();
 for(const log of logs||[]){
  if(log.source!=='weekly-quest'||!(log.ids||[]).includes(33)||!/^\d{4}-\d{2}-\d{2}$/.test(log.date||''))continue;
  const date=new Date(log.date+'T12:00:00Z');if(!Number.isFinite(date.getTime()))continue;
  date.setUTCDate(date.getUTCDate()-(date.getUTCDay()+6)%7);weeks.add(date.toISOString().slice(0,10));
 }
 return {total:weeks.size};
}
function motionQuestTarget(motion){return ({walk:1,run:3,deepRun:3,fly:5})[motion]||0}
function motionBroomUnlocked(logs){return motionActivityCounts(logs).total>=5}
if(typeof module!=='undefined'){module.exports=motionActivityCounts;module.exports.broomUnlocked=motionBroomUnlocked;module.exports.target=motionQuestTarget;}
