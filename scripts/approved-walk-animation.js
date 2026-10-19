'use strict';
function travelerOutfit(bg){
 if(bg==='japan')return 'kimono';
 return TravelUnlocks.destinations[bg]?.outfit||(['japan','italy','france','britain','america'].includes(bg)?'city':['runFrontier','city'].includes(bg)?'winter':'regular');
}
(()=>{
 const previousArt=travelerArt,previousCard=travelerBundleCard;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const sheets={};
 const markup=(preview=false,bg=travelerState().background)=>`<canvas class="approved-walk" data-gender="${travelerFemale()?'female':'male'}" data-outfit="${travelerFemale()&&['desert','forest','deepForest'].includes(bg)?'selectedSix':travelerFemale()&&bg==='runFrontier'?'approvedWinter':travelerOutfit(bg)}" data-preview="${preview}" width="512" height="512" role="img" aria-label="여행지에 맞는 옷을 입고 걷는 캐릭터"></canvas>`;
 travelerArt=function(){
  const state=travelerState();
  const earlyWalk=(TravelUnlocks.destinations[state.background]||['desert','forest','deepForest','runFrontier','city'].includes(state.background))&&['walk','run','deepRun'].includes(state.motion);
  return earlyWalk&&!travelerVisualNight()?markup():previousArt();
 };
 travelerBundleCard=function(bg){
  const html=previousCard(bg);
  return (TravelUnlocks.destinations[bg]||['desert','forest','deepForest','runFrontier','city'].includes(bg))?html.replace(/<canvas\b[^>]*><\/canvas>/,markup(true,bg)):html;
 };

 // Each outfit is one approved eight-pose sheet. Never overlay independently
 // generated bags/faces: those layers caused doubled seams and shifting silhouettes.
 async function loadCoherent(gender,outfit){
  if(gender==='female'&&['selectedSix','approvedWinter','kimono','russia'].includes(outfit)){
   const image=new Image();image.src=outfit==='russia'?'assets/characters/female-approved-moscow-v1.png?v=1':outfit==='kimono'?'assets/characters/female-approved-tokyo-v1.png?v=1':outfit==='approvedWinter'?'assets/characters/female-approved-winter-v2.png?v=1':'assets/characters/female-standing-proportions-v2.png?v=1';await image.decode();
   // Measure the same 512px display box used by the Lv.1 standing image.
   const reference=new Image();reference.src='assets/characters/large-bag-v2/female-standing-natural-v4.png';await reference.decode();
   const referenceCanvas=document.createElement('canvas');referenceCanvas.width=referenceCanvas.height=512;
   const referenceContext=referenceCanvas.getContext('2d');referenceContext.drawImage(reference,0,0,512,512);
   const referencePixels=referenceContext.getImageData(0,0,512,512).data;
   let refTop=512,refBottom=-1,refLeft=512,refRight=-1;
   for(let y=0;y<512;y++)for(let x=0;x<512;x++)if(referencePixels[(y*512+x)*4+3]>230){
    refTop=Math.min(refTop,y);refBottom=Math.max(refBottom,y);
    if(y<140){refLeft=Math.min(refLeft,x);refRight=Math.max(refRight,x);}
   }
   const poses=Array.from({length:8},(_,n)=>{
    const c=document.createElement('canvas');c.width=c.height=512;
    const frameSource=image;
    const w=frameSource.width/4,h=frameSource.height/2;
    const ctx=c.getContext('2d');
    ctx.drawImage(frameSource,(n%4)*w,Math.floor(n/4)*h,w,h,64,0,384,512);
    // Align the head rather than the moving hands/bag or each cell's midpoint.
    const framePixels=ctx.getImageData(0,0,512,512);
    const pixels=framePixels.data;
    for(let i=3;i<pixels.length;i+=4){const alpha=pixels[i];pixels[i]=alpha<230?0:alpha>=250?255:Math.round((alpha-230)*255/20);}
    if(['approvedWinter','kimono','russia'].includes(outfit)){
     // Keep the actor component; neighboring-row bow tips can enter the cell edge.
     const seen=new Uint8Array(512*512);let largest=[];
     for(let seed=0;seed<seen.length;seed++)if(!seen[seed]&&pixels[seed*4+3]>100){
      const component=[seed];seen[seed]=1;
      for(let j=0;j<component.length;j++){const a=component[j],x=a%512;for(const b of [x?a-1:-1,x<511?a+1:-1,a-512,a+512])if(b>=0&&b<seen.length&&!seen[b]&&pixels[b*4+3]>100){seen[b]=1;component.push(b);}}
      if(component.length>largest.length)largest=component;
     }
     const keep=new Uint8Array(512*512);
     for(const a of largest){const x=a%512,y=Math.floor(a/512);for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(x+dx>=0&&x+dx<512&&y+dy>=0&&y+dy<512)keep[a+dy*512+dx]=1;}
     for(let a=0;a<keep.length;a++)if(!keep[a])pixels[a*4+3]=0;
    }
    ctx.putImageData(framePixels,0,0);
    let top=512,bottom=-1,left=512,right=-1;
    for(let y=0;y<512;y++)for(let x=0;x<512;x++)if(pixels[(y*512+x)*4+3]>230){top=Math.min(top,y);bottom=Math.max(bottom,y);}
    for(let y=top;y<Math.min(512,top+150);y++)for(let x=0;x<512;x++)if(pixels[(y*512+x)*4+3]>230){left=Math.min(left,x);right=Math.max(right,x);}
    return {image:c,top,bottom,headX:(left+right+1)/2};
   });
   // Use ONE scale for the entire cycle. Bent knees must not enlarge the body.
   const referenceHeight=refBottom+1-refTop;
   const referenceHeadHeight=345/1254*512-refTop;
   const targetHeight=referenceHeadHeight+(referenceHeight-referenceHeadHeight)*.85;
   const sourceHeight=Math.max(...poses.map(p=>p.bottom-p.top+1));
   const scale=targetHeight/sourceHeight;
   const targetCenter=(refLeft+refRight+1)/2,sole=refBottom+1;
   const frames=poses.map(p=>{
    const registered=document.createElement('canvas');registered.width=registered.height=512;
    const output=registered.getContext('2d');output.imageSmoothingEnabled=true;output.imageSmoothingQuality='high';
    output.drawImage(p.image,targetCenter-p.headX*scale,sole-(p.bottom+1)*scale,512*scale,512*scale);
    return {image:registered,eyes:[]};
   });
   const durations=[346,329,259,276,346,329,259,276];
   sheets[gender+'-'+outfit]={frames,durations,cycle:durations.reduce((a,b)=>a+b,0)};return;
  }
  // Original outfit sheets: winter matches the user's image 55 reference.
  const rebuiltRegular=false;
  const custom=['tropical','city','desert','polar','kimono','russia'].includes(outfit);
  let image=new Image();
  image.src=gender==='male'&&outfit==='winter'?'assets/characters/large-bag-v2/male-winter-teal-v1.png?v=1':outfit==='selectedSix'?'assets/characters/female-snow-body-v1.png?v=1':outfit==='kimono'?'assets/characters/travel-outfits-v1/'+gender+'-kimono-'+(gender==='female'?'winter-gait-v1':'v1')+'.png':
   (custom?'assets/characters/travel-outfits-v1/':'assets/characters/large-bag-v2/')+gender+'-'+outfit+'.png';
  await image.decode();
  // Keep each pose's original collar, shoulder and bag strap together.
  const gridW=image.width/4,rowSplit=image.height/2,poses=[];
  for(let n=0;n<8;n++){
   const sy=n<4?0:rowSplit,cellH=n<4?rowSplit:image.height-rowSplit;
   // Male pose 5 extends beyond the nominal grid into the empty gutter in both outfits.
   // Move the shared crop boundary, retaining the complete bag and excluding it from pose 6.
   const extra=gender==='male'&&outfit!=='kimono'?image.width/48:0;
   const sx=n%4*gridW+(n===5?extra:0);
   const cellW=gridW+(n===4?extra:n===5?-extra:0);
   const c=document.createElement('canvas');c.width=cellW;c.height=cellH;
   const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,sx,sy,cellW,cellH,0,0,cellW,cellH);
   const data=ctx.getImageData(0,0,cellW,cellH),p=data.data;

   // Drop detached export specks for BOTH genders, retaining antialiased edges.
   const threshold=gender==='female'?230:100;
   const count=cellW*cellH,seen=new Uint8Array(count),queue=new Int32Array(count);let largest=[];
   for(let seed=0;seed<count;seed++)if(!seen[seed]&&p[seed*4+3]>threshold){
    let head=0,tail=1;queue[0]=seed;seen[seed]=1;
    while(head<tail){const a=queue[head++],x=a%cellW;
     for(const b of [x?a-1:-1,x<cellW-1?a+1:-1,a-cellW,a+cellW])if(b>=0&&b<count&&!seen[b]&&p[b*4+3]>threshold){seen[b]=1;queue[tail++]=b;}
    }if(tail>largest.length)largest=queue.slice(0,tail);
   }
   const keep=new Uint8Array(count);
   for(const a of largest){const x=a%cellW,y=Math.floor(a/cellW);for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)if(x+dx>=0&&x+dx<cellW&&y+dy>=0&&y+dy<cellH)keep[a+dy*cellW+dx]=1;}
   let left=cellW,right=0,top=cellH,bottom=0;
   // Female exports contain a low-alpha colored halo outside the ink edge.
   // Remove that haze without blurring colors across the silhouette.
   if(gender==='female')for(let a=0;a<count;a++){
    const i=a*4+3,alpha=p[i];
    p[i]=alpha<230?0:alpha>=250?255:Math.round((alpha-230)*255/20);
   }
   for(let a=0;a<count;a++){if(!keep[a])p[a*4+3]=0;if(p[a*4+3]>100){const x=a%cellW,y=Math.floor(a/cellW);left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}}
   // Match the Lv.1 bag palette (median RGB 242,180,75) without replacing frames.
   // The walking source bag median is 250,153,33. Preserve shading and alpha.
   if(gender==='female'&&outfit==='regular'&&false)for(let i=0;i<p.length;i+=4){
    const x=(i/4)%cellW,y=Math.floor(i/4/cellW),r=p[i],g=p[i+1],b=p[i+2];
    if(x>cellW*.32&&y>cellH*.31&&y<cellH*.70&&p[i+3]&&r>g&&g>b&&r-b>60&&(g-b)>(r-g)*.85){
     p[i]=Math.max(0,r-8);p[i+1]=Math.min(255,g+27);p[i+2]=Math.min(255,b+42);
    }
   }
   // Tint only warm skin pixels on the approved original sheet. Never alter alpha,
   // coordinates, frame registration or the source artwork for a skin adjustment.
   // Exclude golden/yellow hues: bag and strap must retain their original RGB.
   if(gender==='female'&&outfit==='regular'&&false)for(let i=0;i<p.length;i+=4){
    const x=(i/4)%cellW,y=Math.floor(i/4/cellW);
    // Protect the complete bag/strap zone, including orange shadows and highlights.
    if(x>cellW*.32&&y>cellH*.31&&y<cellH*.70)continue;
    const r=p[i],g=p[i+1],b=p[i+2];
    if(p[i+3]&&r>175&&g>100&&b>75&&r>g&&g>b&&r-g<90&&g-b<65&&b/r>.48&&(r-g)>(g-b)*1.25){
     p[i]=Math.min(255,r+2);p[i+1]=Math.min(255,g+5);p[i+2]=Math.min(255,b+10);
    }
   }
   // Local face adjustment: 97% in the inner oval, smoothly unchanged at its edge.
   // Keep the original alpha silhouette and every pixel outside the face region.
   if(gender==='female'&&outfit==='regular'&&false){
    const original=new Uint8ClampedArray(p);
    const centers=[[174,126],[168,126],[171,127],[174,126],[174,126],[171,126],[171,126],[175,126]];
    const cx=centers[n][0]*cellW/384,cy=centers[n][1]*cellH/512;
    const rx=58*cellW/384,ry=51*cellH/512;
    for(let y=Math.floor(cy-ry);y<=cy+ry;y++)for(let x=Math.floor(cx-rx);x<=cx+rx;x++){
     const radius=Math.hypot((x-cx)/rx,(y-cy)/ry);if(radius>=1)continue;
     const t=Math.max(0,(radius-.65)/.35),weight=1-t*t*(3-2*t),factor=1-.03*weight;
     const u=cx+(x-cx)/factor,v=cy+(y-cy)/factor,x0=Math.floor(u),y0=Math.floor(v),fx=u-x0,fy=v-y0;
     const at=(y*cellW+x)*4;
     for(let k=0;k<3;k++)p[at+k]=original[(y0*cellW+x0)*4+k]*(1-fx)*(1-fy)+original[(y0*cellW+x0+1)*4+k]*fx*(1-fy)+original[((y0+1)*cellW+x0)*4+k]*(1-fx)*fy+original[((y0+1)*cellW+x0+1)*4+k]*fx*fy;
    }
   }
   if(rebuiltRegular){
    // Match Lv.1's measured skin palette, retaining local shading and alpha.
    const skin=[];
    for(let i=0;i<p.length;i+=4){const r=p[i],g=p[i+1],b=p[i+2];if(p[i+3]>230&&r>180&&g>130&&b>110&&r>g&&g>b&&(r-g)>(g-b)*1.2)skin.push(i);}
    if(skin.length){const target=[248,205,184],shift=target.map((v,k)=>v-skin.map(i=>p[i+k]).sort((a,b)=>a-b)[Math.floor(skin.length/2)]);for(const i of skin)for(let k=0;k<3;k++)p[i+k]=Math.max(0,Math.min(255,p[i+k]+shift[k]));}
   }
   const originalPoseHeight=bottom-top+1;
   if(gender==='female'&&outfit==='regular'&&false){
    // Extend legs below the hem by 3%; lengthen the visible arm along its own axis.
    // Inverse sampling avoids gaps and keeps the source sheet unchanged.
    const before=new Uint8ClampedArray(p),unitX=cellW/384,unitY=cellH/512;
    const arms=[[[196,220],[132,279]],[[202,220],[146,280]],[[227,223],[258,307]],[[242,225],[280,301]],[[221,225],[267,305]],[[220,226],[262,306]],[[218,227],[257,308]],[[194,222],[138,281]]];
    const [a,b]=arms[n],ax=a[0]*unitX,ay=a[1]*unitY,bx=b[0]*unitX,by=b[1]*unitY;
    const vx=bx-ax,vy=by-ay,len2=vx*vx+vy*vy,hip=345*unitY;
    for(let y=0;y<cellH;y++)for(let x=0;x<cellW;x++){
     let u=x,v=y;
     if(y>hip)v=hip+(y-hip)/1.03;
     else {
      const t=((x-ax)*vx+(y-ay)*vy)/len2;
      if(t>0&&t<1.24){
       const distance=Math.hypot(x-(ax+Math.min(1,t)*vx),y-(ay+Math.min(1,t)*vy));
       const edge=Math.max(0,Math.min(1,(24*unitX-distance)/(10*unitX)));
       const w=edge*edge*(3-2*edge)*Math.min(1,(1.24-t)/.15);
       u-=vx*Math.min(1,t)*(.03/1.03)*w;v-=vy*Math.min(1,t)*(.03/1.03)*w;
      }
     }
     if(u===x&&v===y)continue;
     const x0=Math.floor(u),y0=Math.floor(v),fx=u-x0,fy=v-y0,at=(y*cellW+x)*4;
     if(x0<0||x0+1>=cellW||y0<0||y0+1>=cellH)continue;
     for(let k=0;k<4;k++)p[at+k]=before[(y0*cellW+x0)*4+k]*(1-fx)*(1-fy)+before[(y0*cellW+x0+1)*4+k]*fx*(1-fy)+before[((y0+1)*cellW+x0)*4+k]*(1-fx)*fy+before[((y0+1)*cellW+x0+1)*4+k]*fx*fy;
    }
    left=cellW;right=0;top=cellH;bottom=0;
    for(let y=0;y<cellH;y++)for(let x=0;x<cellW;x++)if(p[(y*cellW+x)*4+3]>100){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
   }
   ctx.putImageData(data,0,0);
   let hl=cellW,hr=0;for(let y=top;y<top+(bottom-top)*.23;y++)for(let x=left;x<=right;x++)if(p[(y*cellW+x)*4+3]>150){hl=Math.min(hl,x);hr=Math.max(hr,x);}
   poses.push({image:c,left,right,top,bottom,originalPoseHeight,headWidth:hr-hl+1,anchor:(hl+hr)/2,sx,sy});
  }
  const scale=470/Math.max(...poses.map(p=>p.originalPoseHeight));
  // Source-sheet eye landmarks avoid mistaking eyebrows or hair for eyes.
  const maleEyes=outfit==='winter'?[[184,211,85],[540,570,85],[924,951,85],[1306,1334,85],[185,212,597],[544,572,597],[926,952,596],[1307,1335,598]]:[[184,209,86],[539,565,85],[923,949,85],[1274,1301,86],[186,212,596],[548,575,596],[932,959,595],[1274,1302,596]];
  const femaleWinterEyes=[[149,175,123],[544,572,123],[920,947,123],[1312,1339,123],[158,184,635],[540,567,635],[924,950,633],[1311,1338,633]];
  let registeredHeadWidth=0;
  const frames=poses.map((p,n)=>{
   const c=document.createElement('canvas');c.width=c.height=512;const ctx=c.getContext('2d');
   // The regular sheet has slightly different export scales per pose.
   // Register every pose against the same crown/sole height and head width,
   // instead of letting those differences become growth during playback.
   const stableRegular=rebuiltRegular; // Preserve approved 470px height on every pose.
   const stableKimono=gender==='female'&&outfit==='kimono';
   // Lv.1 original: 1254px canvas, opaque crown y=10, sole y=1224.
   // Both home display boxes are 32% of scene height. Match visible pixels,
   // not the variable transparent padding in each walking cell.
   const targetHeight=stableKimono?1215/1254*512:470;
   const sole=stableKimono?1225/1254*512:492;
   const registered=stableRegular||stableKimono;
   const scaleY=registered?targetHeight/(p.bottom-p.top+1):scale;
   let scaleX=rebuiltRegular?172/p.headWidth:registered?poses[0].headWidth*targetHeight/(poses[0].bottom-poses[0].top+1)/p.headWidth:scale;
   ctx.drawImage(p.image,244-p.anchor*scaleX,sole-p.bottom*scaleY,p.image.width*scaleX,p.image.height*scaleY);
   if(stableKimono){
    // Measure the rendered silhouette: alpha resampling can shift the hair
    // bounds differently even when source bounds have equal nominal width.
    const pixels=ctx.getImageData(0,0,512,512).data;
    let top=512,bottom=0,l=512,r=0;
    for(let y=0;y<512;y++)for(let x=0;x<512;x++)if(pixels[(y*512+x)*4+3]>150){top=Math.min(top,y);bottom=Math.max(bottom,y);}
    for(let y=top;y<top+(bottom-top)*.23;y++)for(let x=0;x<512;x++)if(pixels[(y*512+x)*4+3]>150){l=Math.min(l,x);r=Math.max(r,x);}
    const width=r-l+1;
    if(!registeredHeadWidth)registeredHeadWidth=180; // Preserve the approved v12 head width.
    if(width>0&&width!==registeredHeadWidth){
     scaleX*=registeredHeadWidth/width;
     ctx.clearRect(0,0,512,512);
     ctx.drawImage(p.image,244-p.anchor*scaleX,sole-p.bottom*scaleY,p.image.width*scaleX,p.image.height*scaleY);
    }
   }
   const landmarks=custom?null:gender==='male'?maleEyes[n]:outfit==='winter'?femaleWinterEyes[n]:null;
   // Dark kimono hair can be mistaken for pupils by the automatic detector.
   // Keep the painted eyes instead of adding glints or eyelids over the hair.
   const eyes=gender==='female'?[]:landmarks?landmarks.slice(0,2).map((x,i)=>[244+(x-p.sx-p.anchor)*scale,492+(landmarks[2]-p.sy-p.bottom)*scale,(i?8:5)*scale,8*scale]):locateEyes(c,gender);
   const direct=gender==='female'&&outfit==='regular'?{image:p.image,x:244-p.anchor*scaleX,y:sole-p.bottom*scaleY,w:p.image.width*scaleX,h:p.image.height*scaleY}:null;
   return {image:c,eyes,direct};
  });
  // Restore the earlier gait timing for every outfit.
  const durations=[346,329,259,276,346,329,259,276];
  // Restore the original eight-pose order.
  const orderedFrames=frames;
  sheets[gender+'-'+outfit]={frames:orderedFrames,durations,cycle:durations.reduce((a,b)=>a+b,0)};
 }
 function locateEyes(canvas,gender){
  const p=canvas.getContext('2d').getImageData(0,0,512,512).data;
  let l=512,r=0,t=200,b=0;
  for(let y=40;y<180;y++)for(let x=120;x<340;x++){const i=(y*512+x)*4;
   if(p[i+3]>240&&p[i]>160&&p[i]>p[i+1]*1.22&&p[i+1]>p[i+2]*1.13){l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y);}}
  if(l>=r)return [];
  const candidates=[],seen=new Set();
  for(let y=t;y<t+(b-t)*.64;y++)for(let x=l+2;x<r-2;x++){
   const seed=y*512+x,i=seed*4;if(seen.has(seed)||p[i+3]<240||Math.max(p[i],p[i+1],p[i+2])>105)continue;
   const q=[seed];seen.add(seed);let sx=0,sy=0,minX=x,maxX=x,minY=y,maxY=y;
   for(let j=0;j<q.length;j++){const a=q[j],xx=a%512,yy=Math.floor(a/512);sx+=xx;sy+=yy;minX=Math.min(minX,xx);maxX=Math.max(maxX,xx);minY=Math.min(minY,yy);maxY=Math.max(maxY,yy);
    for(const z of [a-1,a+1,a-512,a+512]){const zx=z%512,zy=Math.floor(z/512),k=z*4;if(zx<=l+1||zx>=r-1||zy<t||zy>=t+(b-t)*.64||seen.has(z)||p[k+3]<240||Math.max(p[k],p[k+1],p[k+2])>105)continue;seen.add(z);q.push(z);}}
   if(q.length>=7&&maxY-minY>=4&&maxX-minX<30)candidates.push({n:q.length,x:sx/q.length,y:sy/q.length,rx:(maxX-minX)/2+2,ry:(maxY-minY)/2+2});
  }
  candidates.sort((a,b)=>b.n-a.n);const selected=[];
  for(const c of candidates)if(!selected.some(a=>Math.abs(a.x-c.x)<10)&&(!selected.length||Math.abs(selected[0].y-c.y)<12)){selected.push(c);if(selected.length===2)break;}
  if(gender==='male'&&selected.length===1){const near=selected[0];return [[near.x-22,near.y+1,4,7],[near.x,near.y,near.rx,near.ry]];}
  return selected.map(c=>[c.x,c.y,c.rx,c.ry]);
 }
 const pending=new Set();
 function ensureSheet(gender,outfit){
  const key=gender+'-'+outfit;if(sheets[key]||pending.has(key))return;
  pending.add(key);loadCoherent(gender,outfit).catch(error=>{console.error('Travel outfit failed:',key,error);pending.delete(key);});
 }
 let last=0;
 const actorTimes=new WeakMap();
 const groundOffsets=new WeakMap();
 function tick(now){
  requestAnimationFrame(tick);
  const delta=last?Math.min(now-last,50):0;last=now;
  if(document.hidden)return;
  for(const canvas of document.querySelectorAll('canvas.approved-walk')){
   ensureSheet(canvas.dataset.gender,canvas.dataset.outfit||'regular');
   const sheet=sheets[canvas.dataset.gender+'-'+(canvas.dataset.outfit||'regular')];if(!sheet)continue;
   // The requested slow base walk remains active without enabling other motion effects.
   const slowBaseWalk=['regular','winter','kimono','selectedSix','approvedWinter','russia'].includes(canvas.dataset.outfit||'regular');
   const paused=canvas.dataset.preview==='true'||(reduced.matches&&!slowBaseWalk);
   const time=(actorTimes.get(canvas)||0)+(paused?0:delta);
   actorTimes.set(canvas,time);
   let index=0,phase=time%sheet.cycle;
   if(!paused){
    while(index<sheet.frames.length-1&&phase>=sheet.durations[index])phase-=sheet.durations[index++];
   }
   if(canvas.hasAttribute('data-pose'))index=Math.max(0,Math.min(sheet.frames.length-1,Number(canvas.dataset.pose)||0));
   const blink=canvas.dataset.preview==='true'?0:TravelerEyes.blink(canvas,now,reduced.matches),eyeKey=String(blink);
   const frame=sheet.frames[index];
   const displaySize=frame.direct?Math.max(1,Math.round(canvas.getBoundingClientRect().width*Math.min(3,window.devicePixelRatio||1))):512;
   const resized=canvas.width!==displaySize||canvas.height!==displaySize;
   if(resized){canvas.width=canvas.height=displaySize;}
   if(canvas.dataset.frame===String(index)&&canvas.dataset.blink===eyeKey&&!resized)continue;
   const f=sheet.frames[index],scale=f.scale,ctx=canvas.getContext('2d');
   ctx.setTransform(1,0,0,1,0,0);
   ctx.clearRect(0,0,canvas.width,canvas.height);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
   canvas.style.imageRendering='auto';
   ctx.setTransform(displaySize/512,0,0,displaySize/512,0,0);
   if(f.direct){const d=f.direct;ctx.drawImage(d.image,d.x,d.y,d.w,d.h);}
   else ctx.drawImage(f.image,0,0);
   TravelerEyes.draw(ctx,f.image,f.eyes,blink);
   ctx.setTransform(1,0,0,1,0,0);
   canvas.dataset.blink=eyeKey;
   canvas.dataset.frame=String(index);
   canvas.dataset.ready='true';canvas.dataset.eyeCount=String(f.eyes.length);
  }
  for(const actor of document.querySelectorAll('.traveler-home canvas.approved-walk')){
  const track=actor.closest('.traveler-home')?.querySelector('.desert-pan-track');
  if(track&&(!reduced.matches||['regular','winter','kimono','selectedSix','approvedWinter','russia'].includes(actor.dataset.outfit||'regular'))){
   const sheet=sheets[actor.dataset.gender+'-'+(actor.dataset.outfit||'regular')],repeat=travelerTrackRepeat(track);
   // Match a restrained stride to sprite height; both scenes share the gait clock.
   // Derive distance from the same clock as the legs, so cadence changes stay in sync.
   if(sheet&&repeat>0){
    // Integrate travel instead of multiplying total elapsed time by the current
    // size: resizing the scene must not jump the ground beneath planted feet.
    const distance=(groundOffsets.get(track)||0)+delta/sheet.cycle*actor.getBoundingClientRect().height*.34;
    groundOffsets.set(track,distance%repeat);
    track.style.transform=`translateX(${-2*repeat+distance%repeat}px)`;
   }
  }
  }
 }
 requestAnimationFrame(tick);
})();



