/* Full-body poses share a scale and a face anchor; no per-frame stretching. */
(()=>{
 const sheets={},reduced=matchMedia('(prefers-reduced-motion: reduce)');
 // Whole-body ground cycles; walking and running keep their own timing.
 const walkOrder=[0,1,2,3,4,5,6,7];
 // Reach/contact holds longer; recovery/passing shorter. Each half stays 1000ms.
 const walkTimes=[250,275,250,225,250,275,250,225];
 const walkCycle=walkTimes.reduce((a,b)=>a+b,0);
 // ~202 source pixels between contact soles, normalized to 230/663 height, two steps.
 const walkPixelsPerCycle=89.6;
 const runOrder=[0,1,2,3,4,5,6,7],runTimes=[135,135,105,125,135,135,105,125];
 const runCycle=runTimes.reduce((a,b)=>a+b,0);
 const runParts={};
 for(const [name,cols,rows] of [['walk',4,2],['runFirst',4,1],['runSecond',4,1],['fly',3,2]]){
  const image=new Image();image.onload=()=>{
   const probe=document.createElement('canvas');probe.width=image.naturalWidth;probe.height=image.naturalHeight;
   const ctx=probe.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0);
   const pixels=ctx.getImageData(0,0,probe.width,probe.height),data=pixels.data,frames=[];
   // The supplied four-pose sheet has a solid #202020 backdrop.
   // Key only edge-connected background, retaining dark character details.
   if(name.startsWith('run')){
    const width=probe.width,height=probe.height,seen=new Uint8Array(width*height),queue=[];
    const add=(x,y)=>{const n=y*width+x,i=n*4;if(seen[n])return;seen[n]=1;if(Math.abs(data[i]-32)<=3&&Math.abs(data[i+1]-32)<=3&&Math.abs(data[i+2]-32)<=3){data[i+3]=0;queue.push(n)}};
    for(let x=0;x<width;x++){add(x,0);add(x,height-1)}
    for(let y=0;y<height;y++){add(0,y);add(width-1,y)}
    for(let q=0;q<queue.length;q++){const n=queue[q],x=n%width,y=Math.floor(n/width);if(x)add(x-1,y);if(x+1<width)add(x+1,y);if(y)add(x,y-1);if(y+1<height)add(x,y+1)}
    ctx.putImageData(pixels,0,0);
   }
   for(let n=0;n<cols*rows;n++){
    const col=n%cols;
    // User-supplied strips have uneven spacing: cut at verified empty columns.
    const cuts=name==='runFirst'?[0,335,681,1052,1470]:name==='runSecond'?[0,318,681,1048,1471]:null;
    const x=cuts?cuts[col]:Math.round(col*probe.width/cols),y=Math.round(Math.floor(n/cols)*probe.height/rows),w=(cuts?cuts[col+1]:Math.round((col+1)*probe.width/cols))-x,h=Math.round(probe.height/rows);
    let left=w,right=0,top=h,bottom=0,faceX=0,faceN=0;
    for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++){
     const i=((y+yy)*probe.width+x+xx)*4;if(data[i+3]<150)continue;
     left=Math.min(left,xx);right=Math.max(right,xx);top=Math.min(top,yy);bottom=Math.max(bottom,yy);
     if(yy<h*.52&&data[i]>180&&data[i+1]>100&&data[i+2]<data[i+1]*.88){faceX+=xx;faceN++}
    }
    frames.push({source:probe,x,y,w,h,left,right,top,bottom,face:faceN?faceX/faceN:(left+right)/2,flip:false});
   }
   let ready=frames,key=name;
   if(name.startsWith('run')){runParts[name]=frames;if(!runParts.runFirst||!runParts.runSecond)return;ready=[...runParts.runFirst,...runParts.runSecond];key='run'}
   const height=Math.max(...ready.map(f=>f.bottom-f.top+1));
   const left=Math.max(...ready.map(f=>f.flip?f.right-f.face:f.face-f.left)); const right=Math.max(...ready.map(f=>f.flip?f.face-f.left:f.right-f.face)); const width=left+right+1;
   const scale=Math.min(230/height,238/width); sheets[key]={frames:ready,scale,height,anchor:(256-width*scale)/2+left*scale};
  };image.src=({walk:'assets/characters/female/walk-12345678.png',runFirst:'assets/characters/female/run-1234.png',runSecond:'assets/characters/female/run-5678.png',fly:'assets/characters/female/fly-123456.png'})[name];
 }
 // Match the male renderer's subtle outer-contour treatment; keep interior details opaque.
 function softenWalkContour(ctx){
  const pixels=ctx.getImageData(0,0,256,256),src=new Uint8ClampedArray(pixels.data);
  for(let y=1;y<255;y++)for(let x=1;x<255;x++){
   const i=(y*256+x)*4,a=src[i+3];
   if(a<40||Math.max(src[i],src[i+1],src[i+2])>90)continue;
   const neighbor=Math.min(src[i-1],src[i+7],src[i-1021],src[i+1027]);
   if(neighbor<a*.5)pixels.data[i+3]=Math.round(a*.76);
  }
  ctx.putImageData(pixels,0,0);
 }
 let time=0,last=0,distance=0,activeMotion='';
 function tick(now){
  requestAnimationFrame(tick);const delta=last?Math.min(now-last,50):0;last=now;
  if(document.hidden)return;
  const main=document.querySelector('.traveler-home canvas.female-motion');
  if(main&&activeMotion!==main.dataset.motion){activeMotion=main.dataset.motion;time=0;distance=0}
  if(main&&!reduced.matches){time+=delta;distance+=delta*(activeMotion==='walk'?(walkPixelsPerCycle/walkCycle):activeMotion==='fly'?.032:(148/runCycle))}
  for(const canvas of document.querySelectorAll('canvas.female-motion')){
   const motion=canvas.dataset.motion,name=motion==='deepRun'?'run':motion,s=sheets[name];if(!s)continue;
   const preview=canvas.dataset.preview==='true',order=name==='walk'?walkOrder:name==='fly'?[0,1,2,3,4,5,4,3,2,1]:runOrder;
   let step=0; if(name==='walk'){let phase=time%walkCycle;while(step<walkOrder.length-1&&phase>=walkTimes[step]){phase-=walkTimes[step];step++}}else if(name==='run'){let phase=time%runCycle;while(step<runOrder.length-1&&phase>=runTimes[step]){phase-=runTimes[step];step++}}else{step=Math.floor(time/180)%order.length} const index=preview&&canvas.dataset.pose!==undefined?Math.max(0,Math.min(s.frames.length-1,Number(canvas.dataset.pose)||0)):order[preview||reduced.matches?0:step];
   if(canvas.dataset.frame===String(index))continue;

   const f=s.frames[index],c=canvas.getContext('2d');c.clearRect(0,0,256,256);c.imageSmoothingEnabled=false;c.save();
   // Preserve flight clearance; grounding every pose would erase the run's jump.
   const runBob=name==='run'?[0,2,0,-3,0,2,0,-3][index]:0;
   const face=f.flip?f.w-f.face:f.face,dx=s.anchor-face*s.scale,dy=246-(name!=='fly'?s.height+f.top:f.bottom)*s.scale+runBob;
   c.translate(dx,dy);if(f.flip){c.translate(f.w*s.scale,0);c.scale(-1,1)}
   c.drawImage(f.source,f.x,f.y,f.w,f.h,0,0,f.w*s.scale,f.h*s.scale);c.restore();
   if(name!=='fly')softenWalkContour(c);
   canvas.dataset.frame=String(index);
   // Expose the actual rendered sequence for diagnosing sprite row regressions.
   if(!preview)canvas.dataset.frameSequence=[...(canvas.dataset.frameSequence||'').split(',').filter(Boolean),String(index+1)].slice(-16).join(',');
  }
  const track=main?.closest('.traveler-home')?.querySelector('.desert-pan-track');
  if(track&&!reduced.matches){const overlap=parseFloat(getComputedStyle(track).getPropertyValue('--pan-seam'))||0,repeat=track.firstElementChild.getBoundingClientRect().width-overlap;if(repeat>0)track.style.transform=`translateX(${-2*repeat+(distance*(activeMotion==='fly'?1:main.getBoundingClientRect().height/256))%repeat}px)`}
 }
 requestAnimationFrame(tick);
})();
















