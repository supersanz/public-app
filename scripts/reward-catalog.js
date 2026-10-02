(function(root){
 'use strict';
 const items={white:{slot:'background',level:1},still:{slot:'motion',level:1},desert:{slot:'background',level:5},walk:{slot:'motion',level:5,exp:1},forest:{slot:'background',level:10,exp:2},run:{slot:'motion',level:20,exp:3},deepForest:{slot:'background',level:20},deepRun:{slot:'motion',level:30,exp:4},runFrontier:{slot:'background',level:30},sky:{slot:'background',level:40},fly:{slot:'motion',level:40,exp:5},flightFrontier:{slot:'background',level:50,exp:6},city:{slot:'background',level:60,exp:7},subway:{slot:'background',level:70,exp:8},ride:{slot:'motion',level:70,exp:8},academy:{slot:'background',level:80},studyWork:{slot:'motion',level:80,exp:10}};
 const bundles={white:'still',desert:'walk',forest:'walk',deepForest:'run',runFrontier:'deepRun',sky:'fly',flightFrontier:'fly',city:'walk',subway:'ride',academy:'studyWork'};
 const bundleFor=id=>Object.keys(bundles).find(bg=>bg===id||bundles[bg]===id);
 function state(saved={},level=1){
  saved=saved&&typeof saved==='object'?saved:{};
  if(saved.background==='office')saved={...saved,background:'academy',motion:'studyWork',claimed:[...(Array.isArray(saved.claimed)?saved.claimed:[]),'academy','studyWork']};
  const prior=Array.isArray(saved.claimed)?saved.claimed:[];
  // Honor old individually claimed rewards, including ownership after a level reset.
  const claimed=[];
  for(const [bg,motion] of Object.entries(bundles))
   if(bg!=='white'&&!items[bg].pending&&(prior.includes(bg)||(!prior.some(id=>Object.hasOwn(bundles,id))&&Object.entries({walk:'desert',run:'forest',deepRun:'deepForest',fly:'sky',studyWork:'academy'}).some(([oldMotion,oldBg])=>oldBg===bg&&prior.includes(oldMotion)))))claimed.push(bg,motion);
  const background=Object.hasOwn(bundles,saved.background)&&(saved.background==='white'||claimed.includes(saved.background))?saved.background:'white';
  return{version:3,claimed,background,motion:bundles[background]};
 }
 function change(saved,level,action,id){
  if(!Object.hasOwn(items,id))return null;
  const background=bundleFor(id);if(!background||items[background].pending)return null;const motion=bundles[background],required=items[background].level,next=state(saved,level);
  if(action==='claim'){
   if(level<required||required===1||next.claimed.includes(background))return null;
   next.claimed.push(background,motion);
  }else if(action==='equip'){
   if(required>1&&!next.claimed.includes(background))return null;
   next.background=background;next.motion=motion;
  }else return null;
  return next;
 }
 function compatible(background,motion){return Object.hasOwn(bundles,background)&&bundles[background]===motion}
 const api={items,bundles,bundleFor,state,change,compatible};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.TravelerRewards=api;
})(typeof window==='undefined'?globalThis:window);

