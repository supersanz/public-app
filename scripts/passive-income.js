'use strict';
(function(root){
 function settle(data,background,rate,now){
  if(!Number.isFinite(now)||now<0)return 0;
  rate=Number.isFinite(rate)&&rate>0?rate:0;
  const old=data.passiveIncome;
  if(!old||!Number.isFinite(old.at)||old.at<0||!Number.isFinite(old.rate)||old.rate<0){data.passiveIncome={at:now,background,rate};return 0;}
  if(now<old.at)return 0;
  if(!old.rate&&!rate&&old.background===background)return 0;
  const ticks=Math.floor((now-old.at)/5000),gain=ticks*old.rate;
  if(!Number.isSafeInteger(gain)||gain<0)return 0;
  data.walkExp=Math.max(0,Number(data.walkExp)||0)+gain;
  data.passiveIncome={at:old.background!==background||old.rate!==rate||!rate?now:old.at+ticks*5000,background,rate};
  return gain;
 }
 const api={settle};if(typeof module!=='undefined')module.exports=api;else root.PassiveIncome=api;
})(typeof window==='undefined'?globalThis:window);
