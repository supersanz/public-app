'use strict';
(()=>{
 const previousArt=travelerArt,previousCard=travelerBundleCard;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const sheets={};
 const markup=(preview=false,bg=travelerState().background)=>`<canvas class="approved-walk" data-gender="${travelerFemale()?'female':'male'}" data-outfit="${['runFrontier','city'].includes(bg)?'winter':'regular'}" data-preview="${preview}" width="512" height="512" role="img" aria-label="${['runFrontier','city'].includes(bg)?'겨울옷을 입고 ':''}걷는 캐릭터"></canvas>`;
 travelerArt=function(){
  const state=travelerState();
  const earlyWalk=['desert','forest','deepForest','runFrontier','city'].includes(state.background)&&['walk','run','deepRun'].includes(state.motion);
  return earlyWalk&&!travelerVisualNight()?markup():previousArt();
 };
 travelerBundleCard=function(bg){
  const html=previousCard(bg);
  return ['desert','forest','deepForest','runFrontier','city'].includes(bg)?html.replace(/<canvas\b[^>]*><\/canvas>/,markup(true,bg)):html;
 };

 // Each outfit is one approved eight-pose sheet. Never overlay independently
 // generated bags/faces: those layers caused doubled seams and shifting silhouettes.
 async function loadCoherent(gender,outfit){
  let image=new Image();image.src='assets/characters/large-bag-v2/'+gender+'-'+outfit+'.png?v=4';await image.decode();
  if(gender==='female'&&outfit==='winter'){
   const collars=new Image();collars.src='assets/characters/large-bag-v2/female-winter-collar-v3.png';await collars.decode();
   const base=document.createElement('canvas');base.width=image.width;base.height=image.height;
   const ctx=base.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0);
   const original=ctx.getImageData(0,0,base.width,base.height);
   ctx.clearRect(0,0,base.width,base.height);ctx.drawImage(collars,0,0,base.width,base.height);
   const edited=ctx.getImageData(0,0,base.width,base.height).data,p=original.data;
   // Use the approved sixth pose's lapel for all other poses; retain 6 and 7.
   // Only navy neckline fabric is replaced, preserving scarf and bag strap.
   const necks=[[176,174],[572,174],[947,174],[1338,174],[184,686],[566,686],[950,686],[1338,686]];
   for(const [n,[nx,ny]] of necks.entries())for(let y=ny-7;y<ny+42;y++)for(let x=nx-33;x<nx+42;x++){
    const i=(y*base.width+x)*4;
    const j=(n===5||n===6)?i:((686+y-ny)*base.width+566+x-nx)*4;
    if(p[i+3]>240&&p[i+2]>p[i]*1.08&&edited[j+2]>edited[j]*1.08&&edited[j+3]>240){
     p[i]=edited[j];p[i+1]=edited[j+1];p[i+2]=edited[j+2];
    }
   }
   ctx.putImageData(original,0,0);image=base;
  }
  // Keep each pose's original collar, shoulder and bag strap together.
  const gridW=image.width/4,cellH=image.height/2,poses=[];
  for(let n=0;n<8;n++){
   // Male pose 5 extends beyond the nominal grid into the empty gutter in both outfits.
   // Move the shared crop boundary, retaining the complete bag and excluding it from pose 6.
   const extra=gender==='male'?image.width/48:0;
   const sx=n%4*gridW+(n===5?extra:0);
   const cellW=gridW+(n===4?extra:n===5?-extra:0);
   const c=document.createElement('canvas');c.width=cellW;c.height=cellH;
   const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,sx,Math.floor(n/4)*cellH,cellW,cellH,0,0,cellW,cellH);
   const data=ctx.getImageData(0,0,cellW,cellH),p=data.data;

   // Drop detached export specks for BOTH genders, retaining antialiased edges.
   const count=cellW*cellH,seen=new Uint8Array(count),queue=new Int32Array(count);let largest=[];
   for(let seed=0;seed<count;seed++)if(!seen[seed]&&p[seed*4+3]>100){
    let head=0,tail=1;queue[0]=seed;seen[seed]=1;
    while(head<tail){const a=queue[head++],x=a%cellW;
     for(const b of [x?a-1:-1,x<cellW-1?a+1:-1,a-cellW,a+cellW])if(b>=0&&b<count&&!seen[b]&&p[b*4+3]>100){seen[b]=1;queue[tail++]=b;}
    }if(tail>largest.length)largest=queue.slice(0,tail);
   }
   const keep=new Uint8Array(count);
   for(const a of largest){const x=a%cellW,y=Math.floor(a/cellW);for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)if(x+dx>=0&&x+dx<cellW&&y+dy>=0&&y+dy<cellH)keep[a+dy*cellW+dx]=1;}
   let left=cellW,right=0,top=cellH,bottom=0;
   for(let a=0;a<count;a++){if(!keep[a])p[a*4+3]=0;if(p[a*4+3]>100){const x=a%cellW,y=Math.floor(a/cellW);left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}}
   ctx.putImageData(data,0,0);
   let hl=cellW,hr=0;for(let y=top;y<top+(bottom-top)*.23;y++)for(let x=left;x<=right;x++)if(p[(y*cellW+x)*4+3]>150){hl=Math.min(hl,x);hr=Math.max(hr,x);}
   poses.push({image:c,left,right,top,bottom,anchor:(hl+hr)/2,sx,sy:Math.floor(n/4)*cellH});
  }
  const scale=470/Math.max(...poses.map(p=>p.bottom-p.top+1));
  // Source-sheet eye landmarks avoid mistaking eyebrows or hair for eyes.
  const maleEyes=outfit==='winter'?[[184,211,85],[540,570,85],[924,951,85],[1306,1334,85],[185,212,597],[544,572,597],[926,952,596],[1307,1335,598]]:[[184,209,86],[539,565,85],[923,949,85],[1274,1301,86],[186,212,596],[548,575,596],[932,959,595],[1274,1302,596]];
  const femaleWinterEyes=[[149,175,123],[544,572,123],[920,947,123],[1312,1339,123],[158,184,635],[540,567,635],[924,950,633],[1311,1338,633]];
  const frames=poses.map((p,n)=>{
   const c=document.createElement('canvas');c.width=c.height=512;const ctx=c.getContext('2d');
   ctx.drawImage(p.image,244-p.anchor*scale,492-p.bottom*scale,p.image.width*scale,p.image.height*scale);
   const landmarks=gender==='male'?maleEyes[n]:outfit==='winter'?femaleWinterEyes[n]:null;
   const eyes=landmarks?landmarks.slice(0,2).map((x,i)=>[244+(x-p.sx-p.anchor)*scale,492+(landmarks[2]-p.sy-p.bottom)*scale,(i?8:5)*scale,8*scale]):locateEyes(c,gender);
   return {image:c,eyes};
  });
  const durations=[346,329,259,276,346,329,259,276];
  sheets[gender+'-'+outfit]={frames,durations,cycle:durations.reduce((a,b)=>a+b,0)};
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
 for(const gender of ['male','female'])for(const outfit of ['regular','winter'])loadCoherent(gender,outfit).catch(console.error);
 let last=0,time=0;
 const groundOffsets=new WeakMap();
 function tick(now){
  requestAnimationFrame(tick);
  const delta=last?Math.min(now-last,50):0;last=now;
  if(document.hidden)return;
  const main=document.querySelector('.traveler-home canvas.approved-walk');
  if(main&&!reduced.matches){time+=delta;}
  for(const canvas of document.querySelectorAll('canvas.approved-walk')){
   const sheet=sheets[canvas.dataset.gender+'-'+(canvas.dataset.outfit||'regular')];if(!sheet)continue;
   // Give planted feet time to carry weight; pass the raised foot through faster.
   let index=0,phase=time%sheet.cycle;
   if(canvas.dataset.preview!=='true'&&!reduced.matches){
    while(index<sheet.frames.length-1&&phase>=sheet.durations[index])phase-=sheet.durations[index++];
   }
   if(canvas.hasAttribute('data-pose'))index=Math.max(0,Math.min(7,Number(canvas.dataset.pose)||0));
   const blink=canvas.dataset.preview==='true'?0:TravelerEyes.blink(canvas,now,reduced.matches),eyeKey=String(blink);
   if(canvas.dataset.frame===String(index)&&canvas.dataset.blink===eyeKey)continue;
   const f=sheet.frames[index],scale=f.scale,ctx=canvas.getContext('2d');
   ctx.clearRect(0,0,512,512);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
   const widthMatch=1;
   ctx.drawImage(f.image,0,0);
   TravelerEyes.draw(ctx,f.image,f.eyes,blink);
   canvas.dataset.blink=eyeKey;
   canvas.dataset.frame=String(index);
   canvas.dataset.ready='true';canvas.dataset.eyeCount=String(f.eyes.length);
  }
  for(const actor of document.querySelectorAll('.traveler-home canvas.approved-walk')){
  const track=actor.closest('.traveler-home')?.querySelector('.desert-pan-track');
  if(track&&!reduced.matches){
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


