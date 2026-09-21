/* Animate the actual painted fire pixels, not a particle overlay. */
(()=>{
 const source=new Image();source.src='assets/characters/male/desert-night.png';
 const frames=[];const x0=310,y0=1100,w=90,h=155;
 source.onload=()=>{
  const original=document.createElement('canvas');original.width=w;original.height=h;
  const oc=original.getContext('2d',{willReadFrequently:true});oc.drawImage(source,x0,y0,w,h,0,0,w,h);
  const pixels=oc.getImageData(0,0,w,h),mask=new Uint8Array(w*h);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
   const i=(y*w+x)*4,r=pixels.data[i],g=pixels.data[i+1],b=pixels.data[i+2];
   if(r>205&&g>65&&r>g*1.12&&g>b*1.35)mask[y*w+x]=1;
  }
  const clean=oc.createImageData(w,h);clean.data.set(pixels.data);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(mask[y*w+x]){
   let l=x,r=x;while(l>0&&mask[y*w+l])l--;while(r<w-1&&mask[y*w+r])r++;
   const a=(y*w+l)*4,b=(y*w+r)*4,t=(x-l)/Math.max(1,r-l),i=(y*w+x)*4;
   for(let c=0;c<3;c++)clean.data[i+c]=pixels.data[a+c]*(1-t)+pixels.data[b+c]*t;
  }
  for(let frame=0;frame<12;frame++){
   const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
   const ctx=canvas.getContext('2d');ctx.putImageData(clean,0,0);
   for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(mask[y*w+x]){
    const i=(y*w+x)*4,phase=frame/12*Math.PI*2;
    const spark=y<76;
    const dx=spark?Math.round(3*Math.sin(phase+y*.15)):Math.round(3*Math.sin(phase+y*.075)*Math.max(0,(150-y)/80));
    const dy=spark?-((frame*2+Math.floor(y/12)*3)%24):Math.round(Math.sin(phase+x*.1)*Math.max(0,(150-y)/45));
    ctx.fillStyle=`rgb(${pixels.data[i]},${pixels.data[i+1]},${pixels.data[i+2]})`;
    ctx.fillRect(x+dx,y+dy,1,1);
   }
   frames.push(canvas);
  }
 };
 setInterval(()=>{
  const world=document.querySelector('.night-world[data-night-scene="desert"]');if(!world||document.hidden)return; const desired=world.querySelector('img')?.getAttribute('src'); if(desired&&source.getAttribute('src')!==desired){frames.length=0;source.src=desired;return} if(!frames.length)return;
  let canvas=world.querySelector('.camp-fire-frames');
  if(!canvas){canvas=document.createElement('canvas');canvas.className='camp-fire-frames';canvas.width=w;canvas.height=h;canvas.setAttribute('aria-hidden','true');world.append(canvas)}
  const frame=window.matchMedia('(prefers-reduced-motion: reduce)').matches?0:Math.floor(performance.now()/125)%frames.length;
  const ctx=canvas.getContext('2d');ctx.clearRect(0,0,w,h);ctx.drawImage(frames[frame],0,0);
 },125);
})();

