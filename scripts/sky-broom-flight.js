'use strict';
(()=>{
 const panorama=travelerPanorama;
 travelerPanorama=id=>['sky','flightFrontier'].includes(id)?'assets/backgrounds/growth-v2/07-alpine-castle-v2.png':panorama(id);
 const change=changeTravelerReward;
 changeTravelerReward=function(action,id){
  if(action==='equip'&&['sky','flightFrontier','city','fly'].includes(id)&&!data.magicBroom?.acquired){
   if(document.querySelector('.broom-required'))return false;
   const dialog=document.createElement('dialog');dialog.className='broom-required';
   dialog.innerHTML='<h2>마법 빗자루가 필요해요</h2><p>설산에 묻힌 마법 빗자루를 획득하세요.</p><button type="button">확인</button>';
   document.body.append(dialog);dialog.querySelector('button').onclick=()=>dialog.close();dialog.onclose=()=>dialog.remove();dialog.showModal();return false;
  }
  return change(action,id);
 };
 const art=travelerArt;
 const sprite=(preview=false)=>`<canvas class="winter-broom-flight" width="512" height="512" data-female="${travelerFemale()}" data-preview="${preview}" role="img" aria-label="겨울옷을 입고 편안하게 빗자루를 타는 ${travelerFemale()?'여자':'남자'}"></canvas>`;
 travelerArt=()=>travelerState().motion==='fly'&&!travelerVisualNight()?sprite():art();
 const card=travelerBundleCard;
 travelerBundleCard=function(bg){let html=card(bg);if(['sky','flightFrontier','city'].includes(bg))html=html.replace(/<canvas\b[^>]*><\/canvas>/g,sprite(true));return html;};
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const prepared={};
 const windFrameCount=32,windFrameMs=90;
 // Isolate every pose before drawing: adjacent rows can otherwise leak bow/shoe fragments.
 function isolate(source,n,female){
  const c=document.createElement('canvas');c.width=512;c.height=female?524:528;
  const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(source,n*512,female?500:0,512,c.height,0,0,512,c.height);
  const data=ctx.getImageData(0,0,c.width,c.height),p=data.data,count=c.width*c.height;
  const seen=new Uint8Array(count),queue=new Int32Array(count);let largest=[];
  for(let seed=0;seed<count;seed++)if(!seen[seed]&&p[seed*4+3]>100){
   let head=0,tail=1;queue[0]=seed;seen[seed]=1;
   while(head<tail){const a=queue[head++],x=a%512;
    for(const b of [x?a-1:-1,x<511?a+1:-1,a-512,a+512])if(b>=0&&b<count&&!seen[b]&&p[b*4+3]>100){seen[b]=1;queue[tail++]=b;}
   }if(tail>largest.length)largest=queue.slice(0,tail);
  }
  const keep=new Uint8Array(count);
  for(const a of largest){const x=a%512,y=Math.floor(a/512);for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)if(x+dx>=0&&x+dx<512&&y+dy>=0&&y+dy<c.height)keep[a+dy*512+dx]=1;}
  for(let i=0;i<count;i++)if(!keep[i])p[i*4+3]=0;ctx.putImageData(data,0,0);
  // Only the free wooden handle is elongated; anatomy, hands and bristles keep their proportions.
  const extended=document.createElement('canvas');extended.width=662;extended.height=c.height;
  const ex=extended.getContext('2d');ex.imageSmoothingEnabled=true;ex.imageSmoothingQuality='high';
  ex.drawImage(c,0,0,16,c.height,0,0,16,c.height);
  ex.drawImage(c,16,0,79,c.height,16,0,229,c.height);
  ex.drawImage(c,95,0,417,c.height,245,0,417,c.height);
  // Preserve the source face and original pupils without repainting them.
  // Enlarge the exposed straw fan around its binding, keeping the rider intact.
  const wide=document.createElement('canvas');wide.width=710;wide.height=extended.height;
  const wc=wide.getContext('2d');wc.drawImage(extended,0,0);
  const tailX=530,tailY=female?330:417,top=female?285:365;
  const fan=document.createElement('canvas');fan.width=extended.width;fan.height=extended.height;
  const fc=fan.getContext('2d');
  const boundary=ctx=>{ctx.beginPath();ctx.moveTo(tailX,tailY-9);ctx.lineTo(610,top);ctx.lineTo(662,top);ctx.lineTo(662,extended.height);ctx.lineTo(tailX,tailY+23);ctx.closePath();};
  fc.save();boundary(fc);fc.clip();fc.drawImage(extended,0,0);fc.restore();
  wc.save();boundary(wc);wc.clip();wc.clearRect(tailX,top,132,extended.height-top);wc.restore();
  wc.save();wc.translate(tailX,tailY);wc.scale(1.36,1.22);
  wc.drawImage(fan,-tailX,-tailY);
  wc.restore();return wide;
 }
 // Build a continuous wind loop from a single registered pose. No cross-fade ghosts.
 async function windFrames(source,female){
  const w=source.width,h=source.height,ctx=source.getContext('2d',{willReadFrequently:true});
  const p=ctx.getImageData(0,0,w,h).data,fields=new Float32Array(w*h*3);
  const weight=(x,y,cx,cy,rx,ry)=>{const d=((x-cx)/rx)**2+((y-cy)/ry)**2;return d>=1?0:(1-d)**1.35;};
  // The bow is an attached accessory, not a strand of hair. Protect its red
  // pixels plus outline, with a gradual falloff so nearby hair never pulls it.
  const ribbonDistance=female?new Float32Array(w*h).fill(1000):null;
  if(female){
   for(let y=0;y<Math.min(h,190);y++)for(let x=0;x<w;x++){const a=y*w+x,i=a*4;
    if(p[i+3]>100&&p[i]>80&&p[i]>p[i+1]*1.5&&p[i]>p[i+2]*1.25)ribbonDistance[a]=0;
   }
   for(let y=0;y<h;y++)for(let x=0;x<w;x++){const a=y*w+x;ribbonDistance[a]=Math.min(ribbonDistance[a],x?ribbonDistance[a-1]+1:1000,y?ribbonDistance[a-w]+1:1000);}
   for(let y=h-1;y>=0;y--)for(let x=w-1;x>=0;x--){const a=y*w+x;ribbonDistance[a]=Math.min(ribbonDistance[a],x<w-1?ribbonDistance[a+1]+1:1000,y<h-1?ribbonDistance[a+w]+1:1000);}
  }
  // Keep leather and its outline rigid; blend the wind field outside the bag.
  const bagWind=(x,y)=>{
   const d=Math.hypot((x-(female?483:505))/(female?79:96),(y-(female?270:320))/(female?85:100));
   const t=Math.max(0,Math.min(1,(d-1)/.32));return t*t*(3-2*t);
  };
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const j=(y*w+x)*3;
   // Spread a small wind wave across crown, fringe and back hair.
   // The face stays anchored; avoid pulling just the trailing silhouette.
   const face=weight(x,y,female?342:331,female?116:132,49,48);
   // Wind touches only free hair tips; crown and face remain anchored.
   fields[j]=(female?
    weight(x,y,466,125,29,32)+weight(x,y,300,144,23,22)*.55:
    weight(x,y,445,102,34,38)+weight(x,y,280,78,23,30)*.45
   )*(1-Math.min(1,face*2.5));
   if(female){const t=Math.max(0,Math.min(1,(ribbonDistance[y*w+x]-4)/10));fields[j]*=t*t*(3-2*t);}
   const pixel=(y*w+x)*4,r=p[pixel],g=p[pixel+1],b=p[pixel+2];
   // The skirt hem is blue fabric; gray tights underneath are rigid anatomy.
   const blueFabric=Math.max(0,Math.min(1,(b-Math.max(r,g)*1.12)/12));
   fields[j+1]=female?weight(x,y,298,319,10,17)*blueFabric:weight(x,y,596,351,29,25);
   fields[j+2]=weight(x,y,610,female?330:425,65,65);
   const gate=bagWind(x,y);fields[j]*=gate;fields[j+1]*=gate;fields[j+2]*=gate;
  }
  const frames=[];
  for(let n=0;n<windFrameCount;n++){
   const phase=n/windFrameCount*Math.PI*2,dx=[Math.sin(phase)*6+Math.sin(phase*2)*1.5,Math.sin(phase-.7)*4.8,Math.sin(phase-1.1)*6];
   const dy=[Math.sin(phase+.4)*3,Math.sin(phase-.4)*3.5,Math.sin(phase-.85)*8];
   const c=document.createElement('canvas');c.width=w;c.height=h;const cc=c.getContext('2d'),out=cc.createImageData(w,h),q=out.data;
   for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const j=(y*w+x)*3,i=(y*w+x)*4;
    // Face, scarf/lapels, hands and source pixels outside the small wind masks
    // are copied verbatim, so neighboring cloth cannot stretch their anatomy.
    const faceLocked=((x-(female?336:324))/(female?46:49))**2+((y-(female?124:140))/48)**2<1;
    if(faceLocked||fields[j]+fields[j+1]+fields[j+2]===0){q[i]=p[i];q[i+1]=p[i+1];q[i+2]=p[i+2];q[i+3]=p[i+3];continue;}
    const hairPhase=phase+(x-320)/95+(y-70)/115;
    const hairX=Math.sin(hairPhase)*4+Math.sin(hairPhase*2)*.65;
    const hairY=Math.cos(hairPhase+.35)*2.2;
    const fx=x-fields[j]*hairX-fields[j+1]*dx[1]-fields[j+2]*dx[2],fy=y-fields[j]*hairY-fields[j+1]*dy[1]-fields[j+2]*dy[2];
    // Copy tights and boots exactly from the registered pose, bypassing every wind field.
    if(female&&y>=270&&!(x>=286&&x<=309&&y>=300&&y<=338)){q[i]=p[i];q[i+1]=p[i+1];q[i+2]=p[i+2];q[i+3]=p[i+3];continue;}
    if(fx<0||fy<0||fx>=w-1||fy>=h-1)continue;
    const xx=Math.floor(fx),yy=Math.floor(fy),tx=fx-xx,ty=fy-yy;
    const ids=[(yy*w+xx)*4,(yy*w+xx+1)*4,((yy+1)*w+xx)*4,((yy+1)*w+xx+1)*4],weights=[(1-tx)*(1-ty),tx*(1-ty),(1-tx)*ty,tx*ty];
    let alpha=0,r=0,g=0,b=0;
    for(let k=0;k<4;k++){const a=p[ids[k]+3]*weights[k];alpha+=a;r+=p[ids[k]]*a;g+=p[ids[k]+1]*a;b+=p[ids[k]+2]*a;}
    if(alpha){q[i]=r/alpha;q[i+1]=g/alpha;q[i+2]=b/alpha;q[i+3]=alpha;}
   }
   cc.putImageData(out,0,0);
   // Final rigid pixels use the same write path on every frame (including alpha edges).
   const stable=cc.getImageData(0,0,w,h);
   for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const face=x>=(female?292:275)&&x<(female?385:382)&&y>=82&&y<192;
    const leg=female&&y>=270&&!(x>=286&&x<=309&&y>=300&&y<=338);
    if(face||leg){const i=(y*w+x)*4;stable.data.set(p.subarray(i,i+4),i);}
   }
   cc.putImageData(stable,0,0);
   frames.push(c);
   await new Promise(requestAnimationFrame);
  }
  return frames;
 }
 async function mainCharacterHead(pose,female){
  const main=new Image();main.src='assets/characters/large-bag-v2/'+(female?'female':'male')+'-standing.png';await main.decode();
  const ctx=pose.getContext('2d');
  // Render the actual main-character artwork, preserving its face proportions.
  // The scarf is the foreground boundary of the head layer.
  ctx.save();ctx.beginPath();ctx.moveTo(245,0);ctx.lineTo(520,0);ctx.lineTo(520,female?160:183);
  const seam=female?[[390,160],[390,146],[377,141],[361,148],[344,152],[332,160],[245,160]]:[[403,183],[393,170],[381,167],[366,178],[345,182],[324,190],[245,190]];
  for(const [x,y] of seam)ctx.lineTo(x,y);ctx.closePath();ctx.clip();
  // Clear the old head only. The former 200px-high rectangle erased shoulder
  // and collar pixels beyond the head, leaving a horizontal notch in both sexes.
  ctx.clearRect(245,0,275,female?142:164);
  ctx.clearRect(female?308:285,female?142:164,female?82:96,30);
  // The trailing old hair lies outside the shoulder silhouette.
  if(female){ctx.clearRect(435,142,85,24);ctx.clearRect(418,142,17,16);}
  ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
  if(female)ctx.drawImage(main,420,0,410,335,278.1,2,196.8,160.8);
  else ctx.drawImage(main,445,0,340,280,241.6,1,231.2,190.4);
  ctx.restore();return pose;
 }
 async function load(female){
  // One coherent body asset contains lapels, shoulder seam, strap, satchel,
  // hands and broom. Do not resize or recolor individual body fragments.
  const img=new Image();img.src='assets/characters/large-bag-v2/'+(female?'female':'male')+'-flight-connected-v1.png';await img.decode();
  const source=document.createElement('canvas');source.width=1536;source.height=1024;
  source.getContext('2d').drawImage(img,0,0,1536,1024);
  const pose=await mainCharacterHead(isolate(source,0,female),female);
  prepared[female?'female':'male']=await windFrames(pose,female);
 }
 load(false).catch(console.error);load(true).catch(console.error);
 let clock=0,last=0;
 const flightBlinks=new WeakMap();
 function flightBlink(canvas,now){
  let state=flightBlinks.get(canvas);
  if(!state){state={next:now+1200+Math.random()*1300,start:-10000};flightBlinks.set(canvas,state);}
  if(now>=state.next){state.start=now;state.next=now+3500+Math.random()*2200;}
  const t=now-state.start,ease=x=>x*x*(3-2*x);
  return t<85?ease(t/85):t<135?1:t<295?1-ease((t-135)/160):0;
 }

 function drawFlightBlink(ctx,source,female,amount){
  // Eye outlines are registered to the same standing artwork as the head.
  const scale=female?.48:.68,ox=female?76.5:-61,oy=female?2:1;
  const eyes=female?[[526,237,13,22],[583,236,25,22]]:[[535,192,17,22],[588,191,27,22]];
  const pixels=source.getContext('2d',{willReadFrequently:true});
  for(const [sx,sy,srx,sry] of eyes){
   const x=sx*scale+ox,y=sy*scale+oy,rx=srx*scale,ry=sry*scale;
   const color=(px,py)=>{const p=pixels.getImageData(Math.round(px),Math.round(py),1,1).data;return 'rgb('+p[0]+','+p[1]+','+p[2]+')';};
   const skin=pixels.getImageData(Math.round(x),Math.round(y+ry+3),1,1).data;
   const tone='rgb('+skin[0]+','+skin[1]+','+skin[2]+')';
   ctx.save();ctx.beginPath();ctx.ellipse(x,y,rx+1,ry+1,0,0,Math.PI*2);ctx.clip();
   const fill=ctx.createLinearGradient(x-rx,y,x+rx,y);fill.addColorStop(0,color(x-rx-2,y+ry*.55));fill.addColorStop(.5,tone);fill.addColorStop(1,color(x+rx+2,y+ry*.55));
   ctx.fillStyle=fill;ctx.fillRect(x-rx-2,y-ry-2,rx*2+4,ry*2+4);
   // The upper lid descends over the eye; the eye itself never scales.
   const lid=y-ry+amount*(ry*1.45);
   if(amount<.98){ctx.save();ctx.beginPath();ctx.rect(x-rx-2,lid,rx*2+4,y+ry+2-lid);ctx.clip();ctx.drawImage(source,0,0);ctx.restore();}
   ctx.strokeStyle='#67402f';ctx.lineWidth=1.05;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x-rx*.78,lid);ctx.quadraticCurveTo(x,lid+2.2,x+rx*.78,lid-.3);ctx.stroke();ctx.restore();
  }
 }
 function tick(now){requestAnimationFrame(tick);const dt=last?Math.min(now-last,50):0;last=now;if(document.hidden)return;if(!reduced.matches)clock+=dt;
  const frame=Math.floor(clock/windFrameMs)%windFrameCount;
  for(const canvas of document.querySelectorAll('.winter-broom-flight')){
   const female=canvas.dataset.female==='true',frames=prepared[female?'female':'male'];if(!frames)continue;
   const still=canvas.dataset.preview==='true'||reduced.matches;
   const scene=canvas.closest('.traveler-home');
   if(scene&&!still&&!scene.querySelector('.flight-cloud-pass')){
    const clouds=document.createElement('div');clouds.className='flight-cloud-pass';clouds.setAttribute('aria-hidden','true');clouds.innerHTML='<i></i><i></i><i></i>';scene.append(clouds);
   }
   const forced=Number(canvas.dataset.pose),n=canvas.hasAttribute('data-pose')?Math.max(0,Math.min(windFrameCount-1,forced)):still?0:frame;
   const image=frames[n],ctx=canvas.getContext('2d'),scale=female?.72:(.68*.92);
   // A shared flight path carries rider and broom together; wind remains local.
   const glide=clock/1150;
   const shift=still?0:Math.sin(glide*.72)*8;
   const dx=(512-image.width*scale)/2-shift*scale,dy=(512-image.height*scale)/2+(still?0:Math.sin(glide)*10+Math.sin(glide*2+.4)*1.5);
   ctx.clearRect(0,0,512,512);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
   // Air moves toward the trailing broom end. Sparse, fading strokes stay behind the actor.
   if(!still){ctx.save();ctx.lineWidth=1.8;ctx.lineCap='round';
    for(let k=0;k<4;k++){const t=(clock/4200+k*.27)%1,x=24+t*445,y=[105,190,365,435][k];
     ctx.strokeStyle='rgba(236,246,255,'+(Math.sin(t*Math.PI)**2*.5)+')';
     ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+10,y-1.5,x+42,y-2);ctx.stroke();}
    ctx.restore();}
   ctx.save();ctx.translate(256,256);ctx.rotate(still?0:Math.sin(glide*.85)*.045+Math.sin(glide*1.7)*.006);ctx.translate(-256,-256);
   ctx.drawImage(image,dx,dy,image.width*scale,image.height*scale);
   if(!still){
    const blink=flightBlink(canvas,now);canvas.dataset.blink=blink.toFixed(3);
    if(blink>0){ctx.save();ctx.translate(dx,dy);ctx.scale(scale,scale);drawFlightBlink(ctx,image,female,blink);ctx.restore();}
   }
   ctx.restore();
   canvas.dataset.frame=String(n);canvas.dataset.frameCount=String(frames.length);canvas.dataset.ready='true';
  }
 }
 requestAnimationFrame(tick);
 if(page==='home'||page==='rewards')render();
})();
