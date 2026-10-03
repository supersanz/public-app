'use strict';
(()=>{

const spaceMarkup=()=>'<canvas class="space-journey-canvas" width="640" height="640" role="img" aria-label="지구와 달을 지나 우주선을 타고 여행하는 캐릭터"></canvas>';
const oldScene=travelerScene,oldNight=travelerNightWorld;
travelerScene=function(id){return id==='academy'?spaceMarkup():oldScene(id)};
travelerNightWorld=function(id){return id==='academy'?spaceMarkup():oldNight(id)};
const oldCard=travelerBundleCard,oldBanner=travelerJourneyBanner,oldTitle=travelerTitle,oldRewardTitle=travelerRewardTitle;
travelerBundleCard=function(id){return oldCard(id).replace('햇살 드는 카페','우주').replace('컴퓨터 작업','캡슐 우주선 타기')};
travelerJourneyBanner=function(lv){return oldBanner(lv).replace('새로운 시대의 하루','우주로 향하는 하루').replace('카페에서 컴퓨터 작업','지구와 달 사이로 떠나는 여행')};
travelerTitle=function(lv){return lv>=80?'우주 여행자':oldTitle(lv)};
travelerRewardTitle=function(lv){return lv===80?'우주로':oldRewardTitle(lv)};
const style=document.createElement('style');style.textContent='.space-journey-canvas{display:block;width:100%;height:100%;object-fit:cover;image-rendering:pixelated;background:#10182e}.traveler-home:has(>.space-journey-canvas),.night-home:has(>.space-journey-canvas){position:relative;overflow:hidden;background:#10182e!important}.traveler-home>.space-journey-canvas,.night-home>.space-journey-canvas{position:absolute;inset:0}.traveler-home:has(>.space-journey-canvas) .traveler-stage{display:none}.art-academy>.space-journey-canvas{position:absolute;inset:0}.banner-academy{background:#14213c!important}';document.head.appendChild(style);

const sheet=new Image(),femaleSheet=new Image(),bg=new Image(),extension=new Image();extension.src='assets/backgrounds/capsule-cosmos-extension-v8.png';let panorama;
femaleSheet.src='assets/characters/female/capsule-astronaut-lavender-v2.png';sheet.src='assets/characters/male/capsule-astronaut-blink-v3.png';bg.src='assets/backgrounds/capsule-cosmos-earth-horizon-v7.png';
let paused=matchMedia('(prefers-reduced-motion: reduce)').matches,time=0,last=0,frames={male:[],female:[]};
Promise.all([sheet.decode(),femaleSheet.decode(),bg.decode(),extension.decode()]).then(()=>{
 const w=Math.round(640*bg.width/bg.height),overlap=80,period=2*(w-overlap);
 panorama=document.createElement('canvas');panorama.width=period;panorama.height=640;
 const pc=panorama.getContext('2d');pc.imageSmoothingEnabled=false;
 pc.drawImage(bg,0,0,w,640);pc.drawImage(extension,w-overlap,0,w,640);
 function blend(left,right,start){for(let x=0;x<overlap;x++){pc.globalAlpha=1;pc.drawImage(left,left.width*(1-overlap/w+x/w),0,left.width/w,left.height,start+x,0,1,640);pc.globalAlpha=x/(overlap-1);pc.drawImage(right,right.width*x/w,0,right.width/w,right.height,start+x,0,1,640);}pc.globalAlpha=1;}
 blend(bg,extension,w-overlap);blend(extension,bg,0);

 for(const [gender,source] of [['male',sheet],['female',femaleSheet]]){
 const c=document.createElement('canvas');c.width=source.width;c.height=source.height;const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(source,0,0);const pixels=x.getImageData(0,0,c.width,c.height).data;
 for(let frame=0;frame<2;frame++){const start=frame*Math.floor(c.width/2),end=start+Math.floor(c.width/2); let left=end,right=start,top=c.height,bottom=0;
 for(let y=0;y<c.height;y++)for(let k=start;k<end;k++)if(pixels[(y*c.width+k)*4+3]>128){left=Math.min(left,k);right=Math.max(right,k);top=Math.min(top,y);bottom=Math.max(bottom,y);}
 const sprite=document.createElement('canvas');sprite.width=400;sprite.height=Math.round((bottom-top+1)*400/(right-left+1));const sc=sprite.getContext('2d');sc.imageSmoothingEnabled=false;sc.drawImage(source,left,top,right-left+1,bottom-top+1,0,0,sprite.width,sprite.height);frames[gender].push({image:sprite,x:0,y:0,w:sprite.width,h:sprite.height});
 }
 }
 requestAnimationFrame(draw);
}).catch(()=>{document.querySelectorAll('.space-journey-canvas').forEach(c=>c.setAttribute('aria-label','우주 배경을 불러오지 못했어요. 새로고침해 주세요.'));});
function draw(now){if(!paused&&!document.hidden)time+=Math.min(now-(last||now),50);last=now;for(const canvas of document.querySelectorAll('.space-journey-canvas')){const t=canvas.closest('.journey-art')?0:time/1000;const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,640,640);const period=panorama.width,drift=(period-240+t*9)%period;ctx.drawImage(panorama,drift,0);ctx.drawImage(panorama,drift-period,0);
 for(let i=0;i<14;i++){const x=((i*137.3+t*(i%3+1)*9)%680)-20,y=(i*89.7)%470;ctx.globalAlpha=.10+(i%3)*.04;ctx.fillStyle='#aab5c6';ctx.fillRect(Math.round(x),Math.round(y),2,2);}ctx.globalAlpha=1;
 const blink=t%5.3>4.9&&t%5.3<5.05,f=frames[travelerFemale()?'female':'male'][blink?1:0],width=260,height=f.h*width/f.w;
 // Camera follows the ship: hull stays centered while space drifts right.
 const shipX=320;
 ctx.save();ctx.translate(shipX,320);
 // Layered pixel exhaust, anchored to the rear nozzle with a steady bright core.
 const nozzle=width/2-7,exhaustY=5,flow=t*7;
 const length=51+Math.sin(flow)*3+Math.sin(flow*1.7)*2;
 const exhaust=(color,alpha,start,extent,radius)=>{
  ctx.fillStyle=color;ctx.globalAlpha=alpha;
  for(let i=0;i<extent;i+=3){
   const u=i/extent,taper=Math.pow(1-u,.72);
   const half=Math.max(1,Math.round(radius*taper));
   const ripple=Math.round(Math.sin(flow-i*.19)*u*1.5);
   ctx.fillRect(Math.round(start+i),exhaustY+ripple-half,3,half*2);
  }
 };
 exhaust('#267ad0',.2,nozzle-2,length+10,19);
 exhaust('#419fdf',.65,nozzle,length,13);
 exhaust('#89d9f6',.95,nozzle,length*.77,9);
 exhaust('#e6faff',1,nozzle,length*.48,5);
 ctx.globalAlpha=1;
 ctx.drawImage(f.image,0,0,f.w,f.h,-width/2,-height/2,width,height);
 ctx.restore();}requestAnimationFrame(draw);
}

})();
