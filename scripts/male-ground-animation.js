/* Original full-body poses. */
(()=>{
 const sheet=new Image(),rearSheet=new Image(),runSheet=new Image(),frames=[];
 // Eight poses, two balanced 1000ms steps; ease contact without a long pause.
 const sequence=[0,1,2,3,4,5,6,7];
 const frameTimes=[250,275,250,225,250,275,250,225];
 const duration=frameTimes.reduce((sum,ms)=>sum+ms,0);
 // Contact sole centers span ~194 source pixels at 238/643 render scale.
 // Two steps per cycle: 194 * (238/643) * 2 ~= 144 canvas pixels.
 const walkPixelsPerCycle=92.16;
 function groundDistance(ms){return ms/duration*walkPixelsPerCycle}
 function loadFrames(sheet,cols,rows,offset){
  const probe=document.createElement('canvas');probe.width=sheet.width;probe.height=sheet.height;
  const ctx=probe.getContext('2d',{willReadFrequently:true});ctx.drawImage(sheet,0,0);
  const pixels=ctx.getImageData(0,0,sheet.width,sheet.height).data;
  const group=[];
  for(let i=0;i<cols*rows;i++){
   const x0=Math.round(i%cols*sheet.width/cols),x1=Math.round((i%cols+1)*sheet.width/cols);
   const y0=Math.round(Math.floor(i/cols)*sheet.height/rows),y1=Math.round((Math.floor(i/cols)+1)*sheet.height/rows);
   let left=x1,right=x0,top=y1,bottom=y0;
   for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++)if(pixels[(y*sheet.width+x)*4+3]>100){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
   // Align the tunic, not the silhouette: swinging boots and the backpack
   // must not move the whole character sideways when their bounds change.
   let torsoX=0,torsoCount=0;
   for(let y=Math.round(top+(bottom-top)*.52);y<top+(bottom-top)*.76;y++){
    for(let x=left;x<=right;x++){
     const p=(y*sheet.width+x)*4,r=pixels[p],g=pixels[p+1],b=pixels[p+2];
     if(pixels[p+3]>180&&g>r*1.45&&b>r*1.4&&g>40){torsoX+=x;torsoCount++;}
    }
   }
   group.push({source:sheet,x:left,y:top,w:right-left+1,h:bottom-top+1,anchor:torsoCount?torsoX/torsoCount-left:(right-left+1)/2});
  }
  const referenceHeight=Math.max(...group.map(f=>f.h));
  const halfWidth=Math.max(...group.map(f=>Math.max(f.anchor,f.w-f.anchor)));
  const renderScale=offset===10?Math.min(238/referenceHeight,120/halfWidth):238/referenceHeight;
  group.forEach((f,i)=>{f.referenceHeight=referenceHeight;f.renderScale=renderScale;frames[offset+i]=f});
 }
 runSheet.onload=()=>loadFrames(runSheet,4,2,10);
 runSheet.src='assets/characters/male/run-12345678.png';
 sheet.onload=()=>loadFrames(sheet,4,2,0);
 rearSheet.onload=()=>loadFrames(rearSheet,2,1,8);
 rearSheet.src='assets/characters/male/walk-contact-helper.png';
 sheet.src='assets/characters/male/walk-12345678.png';
 // Hold contact slightly longer, pass the legs briskly; two balanced 500ms strides.
 const runFrameTimes=[135,135,105,125,135,135,105,125];
 const runCycleMs=runFrameTimes.reduce((sum,ms)=>sum+ms,0),runPixelsPerCycle=152;
 let time=0,distance=0,last=0,previousCanvas=null,previewTime=0;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const poseCanvas=document.createElement('canvas');poseCanvas.width=poseCanvas.height=256;
 const poseContext=poseCanvas.getContext('2d');poseContext.imageSmoothingEnabled=false;
 // Soften only the outermost dark contour by a fraction of a pixel.
 // Keep opaque interiors (eyes, seams), proportions and all pose timing intact.
 const contourCache=new Map();
 function softenContour(ctx,key,running=false){
  const cached=contourCache.get(key);
  if(cached){ctx.clearRect(0,0,256,256);ctx.drawImage(cached,0,0);return;}
  const pixels=ctx.getImageData(0,0,256,256),src=new Uint8ClampedArray(pixels.data),out=pixels.data;
  for(let y=1;y<255;y++)for(let x=1;x<255;x++){
   const i=(y*256+x)*4,a=src[i+3];
   if(a<40||Math.max(src[i],src[i+1],src[i+2])>90)continue;
   const neighbor=Math.min(src[i-4+3],src[i+4+3],src[i-1024+3],src[i+1024+3]);
   if(neighbor<a*.5)out[i+3]=Math.round(a*(running?.42:.76));
  }
  ctx.putImageData(pixels,0,0);
  const result=document.createElement('canvas');result.width=result.height=256;
  result.getContext('2d').drawImage(ctx.canvas,0,0);contourCache.set(key,result);
 }
 function tick(now){
  const previews=document.querySelectorAll('canvas.reward-ground-motion');
  if(previews.length&&!document.hidden){
   // Reward cards deliberately keep one representative pose.
   previewTime=0;
   for(const preview of previews){
    const running=preview.dataset.motion!=='walk',order=running?[10,11,12,13,14,15,16,17]:sequence;
    if(!order.every(i=>frames[i]))continue;
    const timings=running?runFrameTimes:frameTimes;
    let index=0,phase=reduced.matches?0:previewTime%(running?runCycleMs:duration);
    while(index<order.length-1&&phase>=timings[index]){phase-=timings[index];index++;}
    if(preview.dataset.pose!==undefined)index=Math.max(0,Math.min(order.length-1,Number(preview.dataset.pose)||0));
    const f=frames[order[index]],ctx=preview.getContext('2d'),scale=f.renderScale;
    ctx.clearRect(0,0,256,256);ctx.imageSmoothingEnabled=false;
    ctx.drawImage(f.source,f.x,f.y,f.w,f.h,Math.round(128-f.anchor*scale),Math.round(running?248-f.referenceHeight*scale:248-f.h*scale),Math.round(f.w*scale),Math.round(f.h*scale));
    softenContour(ctx,'preview-'+order[index],running);
    preview.dataset.frame=String(index+1);
   }
  }
  const canvas=document.querySelector('canvas.traveler-slow');
  const running=['run','deepRun'].includes(typeof travelerState==='function'?travelerState().motion:'');
  const order=running?[10,11,12,13,14,15,16,17]:sequence;
  const timings=running?runFrameTimes:frameTimes;
  const loop=running?runCycleMs:duration;
  if(canvas&&order.every(i=>frames[i])&&!document.hidden){
   if(last&&canvas===previousCanvas&&!reduced.matches){
    const delta=Math.min(now-last,50);time+=delta;
    distance+=running?delta/runCycleMs*runPixelsPerCycle:groundDistance(delta);
   }
   let index=0,phase=reduced.matches?0:time%loop;
   while(index<order.length-1&&phase>=timings[index]){phase-=timings[index];index++;}
   const f=frames[order[index]];
   const ctx=canvas.getContext('2d'),scale=f.renderScale;
   ctx.clearRect(0,0,256,256);ctx.imageSmoothingEnabled=false;
   poseContext.clearRect(0,0,256,256);
   poseContext.drawImage(f.source,f.x,f.y,f.w,f.h,Math.round(128-f.anchor*scale),Math.round(running?248-f.referenceHeight*scale:248-f.h*scale),Math.round(f.w*scale),Math.round(f.h*scale));
   ctx.drawImage(poseCanvas,0,0);
   softenContour(ctx,'main-'+order[index],running);
   canvas.dataset.frame=String(order[index]);
   const track=document.querySelector('.desert-pan-track');
   if(track){const tile=track.firstElementChild,overlap=parseFloat(getComputedStyle(track).getPropertyValue('--pan-seam'))||0;const repeat=tile.getBoundingClientRect().width-overlap;if(repeat>0){const offset=distance*canvas.getBoundingClientRect().height/256+repeat*.45;track.style.transform=`translateX(${-2*repeat+(offset%repeat)}px)`;}}
  }
  previousCanvas=canvas;last=now;requestAnimationFrame(tick);
 }
 requestAnimationFrame(tick);
})();


