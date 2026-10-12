'use strict';
(()=>{
 const head={white:{male:[.43,.67],female:[.43,.665]},desert:{male:[.43,.68],female:[.425,.68]},forest:{male:[.415,.66],female:[.44,.625]},deepForest:{male:[.39,.625],female:[.395,.62]},runFrontier:{male:[.42,.705],female:[.40,.685]},sky:{male:[.405,.605],female:[.415,.59]},city:{male:[.405,.605],female:[.415,.59]}};
 const night=travelerNightWorld;
 travelerNightWorld=function(id){let html=night(id),point=head[id==='flightFrontier'?'sky':id]?.[travelerFemale()?'female':'male'];return point?html.replace('class="growth-sleep-mark"',`class="growth-sleep-mark sleep-head-anchor" data-head-x="${point[0]}" data-head-y="${point[1]}"`):html;};
 function place(mark){const host=mark.parentElement,img=host?.querySelector('.forest-night-full');if(!img?.naturalWidth)return;const w=host.clientWidth,h=host.clientHeight,scale=Math.max(w/img.naturalWidth,h/img.naturalHeight);mark.style.left=((w-img.naturalWidth*scale)/2+Number(mark.dataset.headX)*img.naturalWidth*scale)+'px';mark.style.top=(h-img.naturalHeight*scale+Number(mark.dataset.headY)*img.naturalHeight*scale-8)+'px';}
 const resize=new ResizeObserver(entries=>entries.forEach(e=>e.target.querySelectorAll('.sleep-head-anchor').forEach(place)));
 function scan(){document.querySelectorAll('.sleep-head-anchor').forEach(mark=>{if(!mark.dataset.observed){mark.dataset.observed='1';resize.observe(mark.parentElement);mark.parentElement.querySelector('img')?.addEventListener('load',()=>place(mark),{once:true});}place(mark);});}
 new MutationObserver(scan).observe(document.documentElement,{childList:true,subtree:true});document.addEventListener('DOMContentLoaded',scan,{once:true});
})();
