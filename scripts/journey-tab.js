'use strict';
window.getJourneyMapState=()=>({level:player().lv,background:travelerState().background,claimed:TravelerRewards.state(data.travelerJourney).claimed,unlocks:Object.fromEntries(Object.keys(TravelUnlocks.requirements).map(id=>[id,TravelUnlocks.status(id,player().lv,data.logs,data.travelerJourney,today())]))});
window.equipJourneyMap=id=>{
 if(!Object.hasOwn(TravelerRewards.bundles,id))return false;
 const owned=TravelerRewards.state(data.travelerJourney,player().lv);
 if(id!=='white'&&!owned.claimed.includes(id)&&!changeTravelerReward('claim',id))return false;
 return changeTravelerReward('equip',id);
};
window.getJourneyActivityCounts=()=>motionActivityCounts(data.logs,acts,QuestCatalog);
// Keep the proposed journey experience isolated from saved rewards and activities.
pages.journey=()=>'<section class="page journey-pass reward-readable journey-tab-page"><iframe class="journey-tab-frame" src="journey-preview.html?v=detail-spacing-v80&embed=1&gender='+(travelerFemale()?'female':'male')+'" title="여행 지도" style="display:block;width:100%;height:1450px;border:0"></iframe></section>';
(()=>{
 const css=document.createElement('style');
 css.textContent='.app.quest-app .nav{grid-template-columns:repeat(4,minmax(0,1fr))!important}.app.quest-app .nav>button{min-width:0;flex:1;padding-left:2px;padding-right:2px}.app.quest-app .nav>button span{white-space:nowrap;font-size:11px}.journey-tab-page{background:#fff;padding-top:0!important;padding-bottom:0!important;min-height:0!important}.app.quest-app:has(.journey-tab-frame){padding-bottom:82px!important}html:has(.journey-tab-frame),body:has(.journey-tab-frame){overscroll-behavior-y:none}.journey-tab-page>.journey-tab-frame{width:calc(100% + 48px)!important;max-width:none;margin-left:-24px}';
 document.head.appendChild(css);
 document.addEventListener('load',event=>{
  const frame=event.target;
  if(!(frame instanceof HTMLIFrameElement)||!frame.classList.contains('journey-tab-frame'))return;
  const doc=frame.contentDocument;
  const style=doc.createElement('style');
  style.textContent='body{background:#fff}.top{display:none}.shell{margin:0 auto;border-radius:0;box-shadow:none}.overlay{align-items:flex-start;padding-top:0;padding-bottom:0}.sheet{overflow-y:auto}';
  doc.head.appendChild(style);
  const resize=()=>{const height=Math.ceil(doc.querySelector('.shell').getBoundingClientRect().height)+1;if(frame.style.height!==height+'px')frame.style.height=height+'px'};
  const sizeObserver=new frame.contentWindow.ResizeObserver(resize);sizeObserver.observe(doc.querySelector('.shell'));
  frame.contentWindow.addEventListener('pagehide',()=>sizeObserver.disconnect(),{once:true});
  resize();
  const overlay=doc.getElementById('overlay'),sheet=overlay.querySelector('.sheet');
  const centerDialog=()=>{
   if(overlay.hidden||!frame.isConnected)return;
   const viewport=window.visualViewport;
   const height=viewport?viewport.height:window.innerHeight;
   const top=viewport?viewport.offsetTop:0;
   sheet.style.maxHeight=Math.max(120,height-40)+'px';
   const offset=top+(height-sheet.getBoundingClientRect().height)/2-frame.getBoundingClientRect().top;
   sheet.style.marginTop=Math.max(12,offset)+'px';
  };
  let lockedStyles=[];
  const unlockScroll=()=>{for(const [el,value,priority] of lockedStyles)el.style.setProperty('overflow',value,priority);lockedStyles=[];};
  const syncDialog=()=>{
   if(overlay.hidden){unlockScroll();return;}
   if(!lockedStyles.length){
    for(let el=frame.parentElement;el;el=el.parentElement){lockedStyles.push([el,el.style.getPropertyValue('overflow'),el.style.getPropertyPriority('overflow')]);el.style.setProperty('overflow','hidden','important');}
   }
   centerDialog();
  };
  const dialogObserver=new frame.contentWindow.MutationObserver(syncDialog);
  dialogObserver.observe(overlay,{attributes:true,attributeFilter:['hidden']});
  let touchY=0;
  const blockBackground=e=>{
   if(overlay.hidden)return;
   const inside=sheet.contains(e.target);
   const delta=e.type==='wheel'?e.deltaY:touchY-(e.touches?.[0]?.clientY??touchY);
   if(e.touches?.length)touchY=e.touches[0].clientY;
   if(!inside||sheet.scrollHeight<=sheet.clientHeight+1||(delta<0&&sheet.scrollTop<=0)||(delta>0&&sheet.scrollTop+sheet.clientHeight>=sheet.scrollHeight-1))e.preventDefault();
  };
  const touchStart=e=>{touchY=e.touches[0].clientY;};
  doc.addEventListener('touchstart',touchStart,{passive:true});
  doc.addEventListener('wheel',blockBackground,{passive:false});
  doc.addEventListener('touchmove',blockBackground,{passive:false});
  document.addEventListener('wheel',blockBackground,{passive:false});
  document.addEventListener('touchmove',blockBackground,{passive:false});
  const removalObserver=new MutationObserver(()=>{if(!frame.isConnected){unlockScroll();dialogObserver.disconnect();removalObserver.disconnect();document.removeEventListener('wheel',blockBackground);document.removeEventListener('touchmove',blockBackground);controller.abort();}});
  removalObserver.observe(document.getElementById('app'),{childList:true,subtree:true});
  new frame.contentWindow.ResizeObserver(centerDialog).observe(sheet);
  const controller=new AbortController();
  window.addEventListener('scroll',centerDialog,{passive:true,signal:controller.signal});
  window.addEventListener('resize',centerDialog,{signal:controller.signal});
  window.visualViewport?.addEventListener('resize',centerDialog,{signal:controller.signal});
  frame.contentWindow.addEventListener('pagehide',()=>controller.abort(),{once:true});
 },true);
})();

// Both travel entry points share the destination gallery.
const growthRewardCards=pages.rewards;
pages.growth=()=>growthRewardCards().replace('reward-readable','reward-readable growth-cards').replace('<h1>여행 지도</h1>','<h1>성장 보상</h1>').replaceAll('다음 여행 지도','다음 성장 보상');
pages.rewards=()=>pages.journey();
