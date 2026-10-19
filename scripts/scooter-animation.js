'use strict';
(()=>{
 if(page!=='journey-preview'){
  const previousArt=travelerArt;
  travelerArt=function(){
   if(travelerState().background==='city'&&!travelerVisualNight())
    return '<canvas class="scooter-motion" data-gender="'+(travelerFemale()?'female':'male')+'" width="512" height="512" role="img" aria-label="스쿠터를 타는 캐릭터"></canvas>';
   return previousArt();
  };
  const previousCard=travelerBundleCard;
  travelerBundleCard=function(bg){
   const html=previousCard(bg);
   return bg==='city'?html.replace(/<img class="bundle-standing"[^>]*>|<canvas\b[^>]*><\/canvas>/,'<canvas class="scooter-motion" data-gender="'+(travelerFemale()?'female':'male')+'" width="512" height="512" aria-label="스쿠터 타기"></canvas>'):html;
  };
  const style=document.createElement('style');
  style.textContent='.traveler-art:has(>.scooter-motion){width:230px!important;height:230px!important}.traveler-art>.scooter-motion{width:100%;height:100%;object-fit:contain}';
  document.head.appendChild(style);
 }
 const sheets={};
 for(const gender of ['male','female']){
  const image=new Image();image.onload=()=>{
   if(gender==='male'){sheets[gender]=image;return;}
   const clean=document.createElement('canvas');clean.width=image.width;clean.height=image.height;
   const ctx=clean.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0);
   const pixels=ctx.getImageData(0,0,clean.width,clean.height);
   for(let i=3;i<pixels.data.length;i+=4){const a=pixels.data[i];pixels.data[i]=a<230?0:a>=250?255:Math.round((a-230)*255/20);}
   ctx.putImageData(pixels,0,0);
   // Exact 3% head reduction on the original artwork; neck transition fades to identity.
   const adjusted=document.createElement('canvas');adjusted.width=clean.width;adjusted.height=clean.height;
   const ac=adjusted.getContext('2d');ac.drawImage(clean,0,0);
   const k=clean.height/1254,neck=410*k,transition=25*k,cx=700*k;
   ac.clearRect(0,0,clean.width,neck+transition);
   const scale=.97;
   ac.drawImage(clean,0,0,clean.width,neck,cx*(1-scale),neck*(1-scale),clean.width*scale,neck*scale);
   for(let y=neck;y<neck+transition;y+=1){
    const t=Math.min(1,(y-neck)/transition),smooth=t*t*(3-2*t),sx=scale+(1-scale)*smooth;
    const h=Math.min(1,neck+transition-y);
    ac.drawImage(clean,0,y,clean.width,h,cx*(1-sx),y,clean.width*sx,h);
   }
   sheets[gender]=adjusted;
  };
  image.src='assets/characters/large-bag-v2/'+(gender==='female'?'female-scooter-canonical-v9.png':'male-scooter-original-bag-color-v1.png');
 }
 // Explicitly requested rider playback; reward cards stay still.
 // Painted rotation accents keep the original wheel and fork geometry intact.
 function wheels(ctx,gender,x,y,w,h,now){
  const points=gender==='female'?[[.149,.866,.071],[.813,.869,.068]]:[[.211,.855,.070],[.833,.862,.061]];

  for(const [index,[cx,cy,r]] of points.entries()){
   ctx.save();ctx.translate(x+cx*w,y+cy*h);
   const radius=r*w;
   const angle=-now/180;
   // Rear engine casing overlaps the hub: expose only the lower rim crescent.
   const cutoff=index===1?(gender==='female'?.60:.48):.14;
   ctx.beginPath();ctx.rect(-radius-2,radius*cutoff,radius*2+4,radius);ctx.clip();
   ctx.beginPath();ctx.arc(0,0,radius*.94,0,Math.PI*2);ctx.clip();
   ctx.lineCap='round';
   for(let k=0;k<3;k++){
    const a=angle+k*Math.PI*2/3;
    ctx.lineWidth=Math.max(2.2,radius*.15);
    ctx.strokeStyle='rgba(42,39,38,.80)';ctx.beginPath();
    ctx.arc(0,0,radius*.80,a+.10,a+.70);ctx.stroke();
    ctx.strokeStyle='rgba(255,245,224,.98)';ctx.beginPath();
    ctx.arc(0,0,radius*.80,a,a+.43);ctx.stroke();
    ctx.lineWidth=Math.max(1.8,radius*.12);ctx.beginPath();
    ctx.moveTo(Math.cos(a)*radius*.40,Math.sin(a)*radius*.40);
    ctx.lineTo(Math.cos(a)*radius*.78,Math.sin(a)*radius*.78);ctx.stroke();
   }
   ctx.restore();
  }
 }
 // Cache a restrained 32-frame breeze loop; face, hands and chassis stay fixed.
 const breezeFrames=new WeakMap();
 function makeBreeze(image,sw,sh){
  const female=image===sheets.female,n=470,stride=n+24;
  const source=document.createElement('canvas');source.width=stride;source.height=n;
  const sc=source.getContext('2d',{willReadFrequently:true});sc.drawImage(image,0,0,sw,sh,0,0,n,n);
  if(!female)sc.drawImage(image,sw,sh*.35,sw*.045,sh*.30,n,n*.35,n*.045,n*.30);
  const pixels=sc.getImageData(0,0,stride,n),frames=[];
  const soft=(v)=>{v=Math.max(0,Math.min(1,v));return v*v*(3-2*v)};
  for(let k=0;k<32;k++){
   const phase=k/32*Math.PI*2,frame=document.createElement('canvas');frame.width=stride;frame.height=n;
   const fc=frame.getContext('2d'),out=fc.createImageData(stride,n);
   for(let y=0;y<n;y++)for(let x=0;x<stride;x++){
    const u=x/n,v=y/n;
    // Free back hair only; feather the roots to keep the head anchored.
    const hair=female?soft((u-.60)/.14)*soft((.37-v)/.04)*soft((v-.18)/.05):soft((u-.61)/.10)*soft((.235-v)/.035)*soft((v-.035)/.04);
    const bag=soft((u-(female?.66:.71))/.10)*soft((v-.40)/.045)*soft((.655-v)/.025);
    const front=female?soft((u-.39)/.018)*soft((.465-u)/.022)*soft((v-.17)/.025)*soft((.335-v)/.035):soft((u-.465)/.018)*soft((.525-u)/.018)*soft((v-.09)/.018)*soft((.17-v)/.02);
    const coat=soft((u-(female?.61:.65))/.05)*soft(((female?.72:.755)-u)/.025)*soft((v-.47)/.05)*soft((.63-v)/.03);
    const gust=Math.sin(phase),weightedGust=Math.sin(phase-.22);
    const dx=hair*gust*5+front*gust*2.6+coat*weightedGust*1.8+bag*weightedGust*2.5;
    const dy=-hair*gust*3-front*gust*1.4-coat*weightedGust*1.2-bag*weightedGust*2.5;
    const fx=x-dx,fy=y-dy,sx=Math.floor(fx),sy=Math.floor(fy),dest=(y*stride+x)*4;
    if(sx<0||sy<0||sx>=stride-1||sy>=n-1)continue;
    const tx=fx-sx,ty=fy-sy,src=(sy*stride+sx)*4;
    for(let c=0;c<4;c++)out.data[dest+c]=pixels.data[src+c]*(1-tx)*(1-ty)+pixels.data[src+4+c]*tx*(1-ty)+pixels.data[src+stride*4+c]*(1-tx)*ty+pixels.data[src+stride*4+4+c]*tx*ty;
   }
   fc.putImageData(out,0,0);frames.push(frame);
  }
  breezeFrames.set(image,frames);return frames;
 }
 function drawRider(ctx,image,sw,sh,x,y,w,h,now,still,node){
  if(still){ctx.drawImage(image,0,0,sw,sh,x,y,w,h);if(image===sheets.male)ctx.drawImage(image,sw,sh*.35,sw*.045,sh*.30,x+w,y+h*.35,w*.045,h*.30);return;}
  const frames=breezeFrames.get(image)||makeBreeze(image,sw,sh);
  ctx.drawImage(frames[Math.floor(now/60)%32],x,y,w*494/470,h);
  if(image!==sheets.female&&typeof TravelerEyes!=='undefined'){
   const amount=TravelerEyes.blink(node,now,still);
   if(amount>0){
    const eyes=image===sheets.female?[[599,312,13,22],[657,312,23,23]]:[[330,104,7,11],[359,104,11,12]];
    ctx.save();ctx.translate(x,y);ctx.scale(w/sw,h/sh);
    TravelerEyes.draw(ctx,image,eyes,amount);ctx.restore();
   }
  }
 }
 function tick(now){
  requestAnimationFrame(tick);if(document.hidden)return;
  for(const canvas of document.querySelectorAll('canvas.scooter-motion')){
   if(canvas.hidden)continue;
   const image=sheets[canvas.dataset.gender];if(!image)continue;
   // One coherent female pose avoids overlapping sheet cells and geometry jumps.
   if(canvas.dataset.gender==='female'){
    const still=canvas.dataset.preview==='true'||!!canvas.closest('.journey-bundle');
    const key='female-'+(still?0:Math.floor(now/33));
    if(canvas.dataset.frame===key)continue;
    const ctx=canvas.getContext('2d'),scale=Math.min(470/image.width,470/image.height);
    const w=image.width*scale,h=image.height*scale;
    const bounce=0;
    ctx.clearRect(0,0,512,512);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
    drawRider(ctx,image,image.width,image.height,(512-w)/2,492-h+bounce,w,h,now,still,canvas);
    if(!still)wheels(ctx,'female',(512-w)/2,492-h+bounce,w,h,now);
    canvas.dataset.frame=key;canvas.dataset.ready='true';continue;
   }
   // Keep the first male pose: generated cells have different geometry and
   // registration, so cycling them makes the rider and wheels jump.
   const still=canvas.dataset.preview==='true'||!!canvas.closest('.journey-bundle');
   const key='male-'+(still?0:Math.floor(now/33));
   if(canvas.dataset.frame===key)continue;
   const ctx=canvas.getContext('2d'),w=image.width/2,h=image.height/2;
   const scale=Math.min(470/w,470/h),dw=w*scale,dh=h*scale;
   ctx.clearRect(0,0,512,512);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
   const bounce=0;
   drawRider(ctx,image,w,h,(512-dw)/2,492-dh+bounce,dw,dh,now,still,canvas);
   if(!still)wheels(ctx,'male',(512-dw)/2,492-dh+bounce,dw,dh,now);
   canvas.dataset.frame=key;canvas.dataset.ready='true';
  }
 }
 requestAnimationFrame(tick);
})();


