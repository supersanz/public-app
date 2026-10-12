'use strict';
(()=>{
 const original=travelerPanorama;
 const assets={desert:'02-meadow-loop-v2',forest:'03-forest-loop-v2',deepForest:'04-ruins-loop-v2',runFrontier:'05-alpine-loop-v2',sky:'07-castle-loop-v3',flightFrontier:'07-castle-loop-v3',city:'08-han-river-flight-v1'};
 travelerPanorama=id=>assets[id]?'assets/backgrounds/growth-v2/'+assets[id]+'.png':original(id);
 const seen=new WeakSet();
 function measure(track){
  const cycle=travelerTrackRepeat(track);
  if(cycle>0)track.style.setProperty('--pan-cycle',cycle+'px');
 }
 const sizes=new ResizeObserver(entries=>entries.forEach(({target})=>measure(target)));
 function scan(){for(const track of document.querySelectorAll('.desert-pan-track[data-loop-tiles]')){
  if(seen.has(track))continue;seen.add(track);sizes.observe(track);
  track.querySelectorAll('img').forEach(img=>img.addEventListener('load',()=>measure(track),{once:true}));measure(track);
 }}
 new MutationObserver(scan).observe(document.body,{childList:true,subtree:true});scan();
})();
