/* Small, alternating fingertip presses; the keyboard and wrist boundaries stay fixed. */
(()=>{
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const frames=new WeakMap();let last=0;
 const region={x:394,y:982,w:66,h:34};
 const press=[0,-1,-2,-1,0,1,0,0];
 function prepare(image){
  const female=image.closest('.female-cafe')!==null;
  const source=document.createElement('canvas');source.width=region.w;source.height=region.h;
  const c=source.getContext('2d',{willReadFrequently:true});
  c.drawImage(image,region.x,region.y,region.w,region.h,0,0,region.w,region.h);
  const original=c.getImageData(0,0,region.w,region.h),poses=[];
  const weight=(x,y,cx,cy,rx,ry)=>Math.pow(Math.max(0,1-((x-cx)/rx)**2-((y-cy)/ry)**2),2);
  for(let frame=0;frame<8;frame++){
   const canvas=document.createElement('canvas');canvas.width=region.w;canvas.height=region.h;
   const ctx=canvas.getContext('2d'),out=ctx.createImageData(region.w,region.h);
   for(let y=0;y<region.h;y++)for(let x=0;x<region.w;x++){
    const dy=press[frame]*weight(x,y,female?19:13,female?16:14,10,9)+press[(frame+4)%8]*weight(x,y,female?39:42,female?20:16,18,10);
    const sy=Math.max(0,Math.min(region.h-1,Math.round(y-dy))),i=(y*region.w+x)*4,s=(sy*region.w+x)*4;
    for(let k=0;k<4;k++)out.data[i+k]=original.data[s+k];
   }
   ctx.putImageData(out,0,0);poses.push(canvas);
  }
  poses.push(source);frames.set(image,poses);return poses;
 }
 function tick(now){
  requestAnimationFrame(tick);if(document.hidden||now-last<75)return;last=now;
  const world=document.querySelector('.cafe-home .cafe-world:not(.cafe-at-night):not(.office-world)'),image=world?.querySelector('img');
  if(!image?.complete||!image.naturalWidth)return;
  let canvas=world.querySelector('.cafe-typing');
  if(!canvas){canvas=document.createElement('canvas');canvas.className='cafe-typing';canvas.width=region.w;canvas.height=region.h;canvas.setAttribute('aria-hidden','true');world.appendChild(canvas);}
  const poses=frames.get(image)||prepare(image),cycle=now%9200;
  const frame=reduced.matches||cycle>6600?8:Math.floor(cycle/145)%8;
  if(canvas.dataset.frame===String(frame))return;
  const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,region.w,region.h);ctx.drawImage(poses[frame],0,0);canvas.dataset.frame=String(frame);
 }
 requestAnimationFrame(tick);
})();

