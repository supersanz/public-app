/* Daytime idle: restrained head turn, with feet/body anchored to the source. */
(()=>{
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const source=new Image();source.src=travelerStanding;
 let canvas=null,last=0,start=0; const face=document.createElement('canvas');
 const ease=t=>(1-Math.cos(Math.PI*Math.max(0,Math.min(1,t))))/2;
 function gaze(t){
  // Long neutral pauses; each glance eases out, holds, and returns.
  const p=t%24000;
  for(const [at,side] of [[6500,-1],[14000,1]]){
   const d=p-at;if(d>=0&&d<4200)return side*(d<1400?ease(d/1400):d<2700?1:1-ease((d-2700)/1500));
  }return 0;
 }
 function tick(now){
  requestAnimationFrame(tick);
  if(document.hidden||now-last<50)return;last=now;
  const host=document.querySelector('.traveler-home .traveler-art');
  const image=host?.querySelector(':scope > img');
  if(!image||image.classList.contains('female-standing')||travelerState().motion!=='still'||!source.complete||!source.naturalWidth)return;
  if(!canvas||canvas.parentElement!==host){
   const murmur=document.createElement('span');murmur.className='traveler-murmur';murmur.textContent='여긴 어디지..';host.appendChild(murmur);
   canvas=document.createElement('canvas');canvas.className='traveler-idle';canvas.width=source.naturalWidth;canvas.height=source.naturalHeight;canvas.setAttribute('role','img');canvas.setAttribute('aria-label','가끔 주위를 살피고 눈을 깜빡이는 여행자');host.appendChild(canvas);image.style.visibility='hidden';start=now;
  }
  const ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height,t=now-start;
  ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,w,h);
  const look=reduced.matches?0:gaze(t);
  // Distort only the head's interior; all boundary pixels, staff, torso and feet stay fixed.
  if(face.width!==w||face.height!==h){face.width=w;face.height=h;}
  const f=face.getContext('2d');f.drawImage(source,0,0);
  const phase=t%5700,blink=!reduced.matches&&phase>4900&&phase<5080;
  if(blink){
   f.fillStyle='#f4b877';f.fillRect(w*.415,h*.386,w*.019,h*.039);f.fillRect(w*.474,h*.386,w*.023,h*.039);
   f.fillStyle='#21160f';f.fillRect(w*.415,h*.390,w*.019,h*.007);f.fillRect(w*.474,h*.390,w*.023,h*.007);
  }
  ctx.drawImage(face,0,0);
  const x0=Math.round(w*.365),y0=Math.round(h*.28),rw=Math.round(w*.32),rh=Math.round(h*.195);
  // A tiny perspective shift reads as a glance without changing the silhouette's size.
  for(let y=0;y<rh;y+=4)for(let x=0;x<rw;x+=4){
   const weight=Math.sin(Math.PI*x/rw)*Math.sin(Math.PI*y/rh);
   ctx.drawImage(face,x0+x,y0+y,4,4,x0+x+Math.round(look*10*weight),y0+y,4,4);
  }
  canvas.dataset.gaze=look.toFixed(2);canvas.dataset.blink=String(blink);
 }
 requestAnimationFrame(tick);
})();
