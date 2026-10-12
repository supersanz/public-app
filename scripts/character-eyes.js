/* Eye animation uses source-image landmarks, transformed with each pose. */
'use strict';
const TravelerEyes=(()=>{
 const male=[[368,172,414,168],[369,174,415,170],[368,173,414,170],[370,171,416,168],[374,170,422,167],[370,171,416,168],[358,164,407,164],[375,171,422,169]];
 const female=[[1064,247,1114,246],[1089,248,1136,247],[1097,249,1147,249],[1100,246,1149,245],[1103,247,1152,246],[1070,247,1118,246],[1070,236,1118,236],[1083,247,1130,246]];
 const states=new WeakMap();
 function blink(node,now,reduced){
  if(reduced)return 0;
  let s=states.get(node);if(!s){s={next:now+8000+Math.random()*6000,start:0};states.set(node,s);}
  if(now>=s.next){s.start=now;s.close=65+Math.random()*25;s.hold=15+Math.random()*15;s.open=115+Math.random()*45;s.next=now+8000+Math.random()*6000;}
  const t=now-s.start;if(!s.start||t>s.close+s.hold+s.open)return 0;
  const ease=v=>v*v*(3-2*v);
  return t<s.close?ease(t/s.close):t<s.close+s.hold?1:1-ease((t-s.close-s.hold)/s.open);
 }
 function draw(ctx,source,eyes,amount){
  for(const [x,y,rx,ry] of eyes){
   if(amount>.01){
    ctx.save();ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.clip();
    // Skin sampled below each eye keeps the lid in the existing palette.
    ctx.drawImage(source,x-rx,y+ry+2,rx*2,3,x-rx,y-ry,rx*2,ry*2);
    // Reveal the original iris beneath a descending lid, never squash the eye.
    const h=Math.max(.1,ry*2*(1-amount));
    ctx.drawImage(source,x-rx,y+ry-h,rx*2,h,x-rx,y+ry-h,rx*2,h);
    ctx.strokeStyle='#50302e';ctx.lineWidth=Math.max(.65,ry*.09);
    ctx.beginPath();ctx.moveTo(x-rx,y+ry-h);
    ctx.quadraticCurveTo(x,y+ry-h+ry*.18,x+rx,y+ry-h);ctx.stroke();
    ctx.restore();
   }else{
    ctx.save();ctx.fillStyle='#fff6dc';ctx.beginPath();ctx.ellipse(x-rx*.22,y-ry*.3,Math.max(.8,rx*.15),Math.max(.9,ry*.16),0,0,Math.PI*2);ctx.fill();ctx.restore();
   }
  }
 }
 return {male,female,blink,draw};
})();
(()=>{
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const entries=new WeakMap();
 function tick(now){
  requestAnimationFrame(tick);if(document.hidden)return;
  document.querySelectorAll('.traveler-art>img[src*="large-bag-v2/"],.traveler-art>img[data-refined-original*="large-bag-v2/"],.traveler-art>img[src*="idle-standing-empty-hands"],.traveler-art>img[data-refined-original*="idle-standing-empty-hands"]').forEach(img=>{
   if(!img.complete||!img.naturalWidth)return;
   let e=entries.get(img);
   if(!e){
    const canvas=document.createElement('canvas');canvas.width=img.naturalWidth;canvas.height=img.naturalHeight;
    canvas.className='standing-eye-overlay';canvas.setAttribute('aria-hidden','true');
    canvas.style.cssText='position:absolute;inset:0;width:100%;height:100%;object-fit:contain;pointer-events:none;z-index:2';
    img.parentElement.appendChild(canvas);
    const source=img.dataset.refinedOriginal||img.src;
    const female=source.includes('/female/')||source.includes('female-standing');
    const current=source.includes('large-bag-v2/');
    e={canvas,eyes:current?(female?[[525,237,11,17],[579,236,18,18]]:[[534,191,11,16],[586,191,19,17]]):(female?[[579,256,12,17],[636,255,20,18]]:[[550,198,10,18],[598,196,20,19]]),last:-1};entries.set(img,e);
   }
   // Match the actual image box, not a differently sized parent container.
   Object.assign(e.canvas.style,{inset:'auto',left:img.offsetLeft+'px',top:img.offsetTop+'px',width:img.offsetWidth+'px',height:img.offsetHeight+'px'});
   const amount=TravelerEyes.blink(img,now,reduced.matches),key=amount;
   if(e.last===key)return;e.last=key;
   const ctx=e.canvas.getContext('2d');ctx.clearRect(0,0,e.canvas.width,e.canvas.height);
   if(amount>0)TravelerEyes.draw(ctx,img,e.eyes,amount);
  });
 }
 requestAnimationFrame(tick);
})();

// Reward cards are photographs of a pose, including the later flight rewards.
(()=>{
 function freeze(){
  document.querySelectorAll('.journey-bundle .bundle-character canvas').forEach(canvas=>{
   if(!canvas.width||!canvas.height)return;
   const ctx=canvas.getContext('2d');if(!ctx)return;
   const pixels=ctx.getImageData(0,0,canvas.width,canvas.height).data;
   let painted=false;for(let i=3;i<pixels.length;i+=4){if(pixels[i]>100){painted=true;break;}}
   if(!painted)return;
   const img=new Image();img.alt=canvas.getAttribute('aria-label')||'캐릭터 미리보기';
   img.className='reward-static-character';img.style.cssText='width:100%;height:100%;object-fit:contain';
   img.src=canvas.toDataURL('image/png');canvas.replaceWith(img);
  });
 }
 setInterval(freeze,180);
})();
