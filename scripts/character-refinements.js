'use strict';
// Generated edits are restricted to facial skin. Original alpha, hair, body,
// clothing and the other character remain byte-for-byte unchanged.
const CharacterRefinements=(()=>{
 const cache=new Map();
 const eyes=[[368,172,414,168],[369,174,415,170],[368,173,414,170],[370,171,416,168],[374,170,422,167],[370,171,416,168],[358,164,407,164],[375,171,422,169]];
 function regions(src){
  if(src.includes('/male/idle-standing-empty-hands'))return [[590,213,66,63]];
  if(src.includes('broom-flight-winter-v5'))return [[185,142,49,43],[705,142,49,43],[1217,142,49,43]];
  const match=src.match(/walk-(?:bag-unified-v7|winter-bag-v3)\/frame-0([1-8])/);
  if(!match)return [];
  const [x,y,x2,y2]=eyes[Number(match[1])-1];return [[(x+x2)/2+8,(y+y2)/2+18,57,56]];
 }
 function image(src){return new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=reject;img.src=src;});}
 function faceOnly(original,src,gender='male'){
  if(gender!=='male'||!regions(src).length)return Promise.resolve(original);
  if(cache.has(src))return cache.get(src);
  const promise=image(src.replace('assets/characters/','assets/characters/male-face-v1/')).then(edited=>{
   const canvas=document.createElement('canvas');canvas.width=original.naturalWidth||original.width;canvas.height=original.naturalHeight||original.height;
   const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(original,0,0);
   const base=ctx.getImageData(0,0,canvas.width,canvas.height);
   ctx.clearRect(0,0,canvas.width,canvas.height);ctx.drawImage(edited,0,0,canvas.width,canvas.height);
   const change=ctx.getImageData(0,0,canvas.width,canvas.height).data,p=base.data;
   for(const [cx,cy,rx,ry] of regions(src))for(let y=Math.floor(cy-ry);y<=cy+ry;y++)for(let x=Math.floor(cx-rx);x<=cx+rx;x++){
    if(((x-cx)/rx)**2+((y-cy)/ry)**2>1)continue;
    const i=(y*canvas.width+x)*4;
    if(p[i+3]<245||change[i+3]<245)continue;
    // Include the eyes, brows and jaw ink, not just warm skin. Preserve blue hair.
    if(p[i+2]>p[i]*1.03&&p[i+2]>p[i+1]*1.04)continue;
    p[i]=change[i];p[i+1]=change[i+1];p[i+2]=change[i+2];
   }
   ctx.clearRect(0,0,canvas.width,canvas.height);ctx.drawImage(original,0,0);
   for(const [cx,cy,rx,ry] of regions(src))ctx.putImageData(base,0,0,Math.floor(cx-rx),Math.floor(cy-ry),Math.ceil(rx*2+1),Math.ceil(ry*2+1));
   return canvas;
  }).catch(()=>original);
  cache.set(src,promise);return promise;
 }
 const bagCache=new Map();
 const bagsEnabled=true;
 function bagRegions(src){
  if(src.includes('/male/idle-standing-empty-hands'))return [[640,550,290,280]];
  if(src.includes('/female/idle-standing-empty-hands'))return [[635,565,300,265]];
  if(/walk-(bag-unified-v7|winter-bag-v3)/.test(src))return [[480,450,260,235],[1150,455,280,245]];
  if(src.includes('broom-flight-winter-v5'))return [0,512,1024].map(x=>[x+280,245,155,150]);
  if(src.includes('broom-flight-winter-v6'))return [0,512,1024].map(x=>[x+275,714,108,108]);
  return [];
 }
 async function paintBase(original,src,gender='male'){
  const base=await faceOnly(original,src,gender);
  const areas=bagRegions(src);if(!bagsEnabled||!areas.length)return base;
  const key=src+gender;if(bagCache.has(key))return bagCache.get(key);
  const repaired=gender==='female'&&src.includes('walk-bag-unified-v7/frame-05');
  const task=image(repaired?'assets/characters/walk-repairs-v1/frame-05.png':src.replace('assets/characters/','assets/characters/shoulder-bag-v1/')).then(edited=>{
   const canvas=document.createElement('canvas');canvas.width=original.naturalWidth||original.width;canvas.height=original.naturalHeight||original.height;
   const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(base,0,0);
   const pixels=ctx.getImageData(0,0,canvas.width,canvas.height),p=pixels.data;
   ctx.clearRect(0,0,canvas.width,canvas.height);ctx.drawImage(edited,0,0,canvas.width,canvas.height);
   const q=ctx.getImageData(0,0,canvas.width,canvas.height).data;
   const gold=(a,i)=>a[i+3]>180&&a[i]>75&&a[i]>a[i+1]*1.03&&a[i+1]>a[i+2]*1.2;
   const skin=(a,i)=>a[i+3]>180&&a[i]>110&&a[i]>a[i+1]*1.38&&a[i+1]>a[i+2]*1.1;
   for(const [left,top,w,h] of areas){
    // Replace the registered female bag as one patch, including its old inner lines.
    if(repaired&&left>1000){
     for(let y=top;y<top+h;y++)for(let x=left;x<left+w;x++){
      const i=(y*canvas.width+x)*4;if(p[i+3]>245&&q[i+3]>245)for(let c=0;c<3;c++)p[i+c]=q[i+c];
     }
     continue;
    }
    const mask=new Uint8Array(w*h),hands=new Uint8Array(w*h);
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){
     const i=((top+y)*canvas.width+left+x)*4;
     if(skin(p,i)||skin(q,i))for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)if(x+dx>=0&&x+dx<w&&y+dy>=0&&y+dy<h)hands[(y+dy)*w+x+dx]=1;
     if(!gold(p,i)&&!gold(q,i))continue;
     for(let dy=-3;dy<=3;dy++)for(let dx=-3;dx<=3;dx++)if(x+dx>=0&&x+dx<w&&y+dy>=0&&y+dy<h)mask[(y+dy)*w+x+dx]=1;
    }
    const protectHands=src.includes('idle-standing');
    for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(mask[y*w+x]&&!(protectHands&&hands[y*w+x])){const i=((top+y)*canvas.width+left+x)*4;if(p[i+3]>245&&q[i+3]>245)for(let c=0;c<3;c++)p[i+c]=q[i+c];}
   }
   ctx.clearRect(0,0,canvas.width,canvas.height);ctx.drawImage(base,0,0);
   for(const [x,y,w,h] of areas)ctx.putImageData(pixels,0,0,x,y,w,h);
   return canvas;
  }).catch(()=>base);bagCache.set(key,task);return task;
 }
 const repairCache=new Map();
 // The female flight bag and ribbon are one registered edit, not a gold-color overlay.
 // This preserves a single arm-over-bag occlusion order in every flight frame.
 let femaleFlightPatch;
 function paintFemaleFlight(original){
  if(femaleFlightPatch)return femaleFlightPatch;
  femaleFlightPatch=image('assets/characters/broom-flight-female-hip-bag-v8.png').then(edited=>{
   const canvas=document.createElement('canvas');canvas.width=original.naturalWidth||original.width;canvas.height=original.naturalHeight||original.height;
   const ctx=canvas.getContext('2d');ctx.drawImage(original,0,0);
   const align=document.createElement('canvas');align.width=canvas.width;align.height=canvas.height;
   const ac=align.getContext('2d',{willReadFrequently:true});ac.drawImage(edited,0,0);
   const ep=ac.getImageData(0,0,canvas.width,canvas.height).data,op=ctx.getImageData(0,0,canvas.width,canvas.height).data;
   function faceCenter(p,n){let sx=0,sy=0,count=0;
    for(let y=585;y<650;y++)for(let x=n*512+140;x<n*512+270;x++){const i=(y*canvas.width+x)*4;
     if(p[i+3]>200&&p[i]>150&&p[i]>p[i+1]*1.15&&p[i+1]>p[i+2]*1.18){sx+=x;sy+=y;count++;}
    }return [sx/count,sy/count];
   }
   const foreground=document.createElement('canvas');foreground.width=canvas.width;foreground.height=canvas.height;
   const fc=foreground.getContext('2d'),fp=ctx.getImageData(0,0,canvas.width,canvas.height);
   for(let i=0;i<fp.data.length;i+=4){const r=fp.data[i],g=fp.data[i+1],b=fp.data[i+2],y=Math.floor(i/4/canvas.width);
    if(!(b>r*1.03&&b>g*1.04)&&!(y>=795&&r<175&&r>g*1.2)&&!(y>=795&&Math.max(r,g,b)<55))fp.data[i+3]=0;
   }fc.putImageData(fp,0,0);
   ac.clearRect(0,0,canvas.width,canvas.height);
   for(let n=0;n<3;n++){const a=faceCenter(op,n),b=faceCenter(ep,n);const dx=Math.round(a[0]-b[0]),dy=Math.round(a[1]-b[1]);ac.drawImage(edited,n*512,500,512,524,n*512+dx,500+dy,512,524);}
   for(let frame=0;frame<3;frame++){
    const offset=frame*512;
    const patches=[[offset+270,710,125,104]];
    if(frame>0)patches.push([offset+270,535,242,146]);
    for(const [x,y,w,h] of patches){
     ctx.clearRect(x,y,w,h);
     if(y===710){
      // Clip the edited bag itself, excluding the generator's residual background matte.
      ctx.save();ctx.beginPath();ctx.moveTo(offset+286,710);ctx.lineTo(offset+318,723);
      ctx.bezierCurveTo(offset+338,732,offset+347,743,offset+347,763);
      ctx.bezierCurveTo(offset+347,787,offset+332,801,offset+309,801);
      ctx.lineTo(offset+280,787);ctx.closePath();ctx.clip();ctx.drawImage(align,x,y,w,h,x,y,w,h);ctx.restore();
     }else ctx.drawImage(align,x,y,w,h,x,y,w,h);
    }
    // Keep the approved forearm and supporting hand in front of the satchel.
    ctx.save();ctx.beginPath();
    for(const [i,point] of [[250,670],[279,670],[306,795],[338,807],[342,838],[292,840],[273,805],[259,745]].entries()){
     if(i===0)ctx.moveTo(offset+point[0],point[1]);else ctx.lineTo(offset+point[0],point[1]);
    }
    ctx.closePath();ctx.clip();ctx.drawImage(foreground,0,0);ctx.restore();
    // Restore broom fibers outside the relocated satchel, including its upper bristle tips.
    ctx.drawImage(original,offset+370,775,30,40,offset+370,775,30,40);
    ctx.drawImage(original,offset+335,813,65,4,offset+335,813,65,4);
   }
   return canvas;
  }).catch(()=>original);return femaleFlightPatch;
 }
 let maleFlightPatch;
 function paintMaleFlight(original,src){
  if(maleFlightPatch)return maleFlightPatch;
  maleFlightPatch=Promise.all([faceOnly(original,src,'male'),image('assets/characters/shoulder-bag-v1/broom-flight-winter-v5.png')]).then(([base,edited])=>{
   const c=document.createElement('canvas');c.width=base.width;c.height=base.height;const ctx=c.getContext('2d');ctx.drawImage(base,0,0);
   // One complete registered bag patch, not a mix of old and new contours.
   for(let n=0;n<3;n++){const dx=n*512+[0,8,9][n]+275;ctx.clearRect(dx,250,165,143);ctx.drawImage(edited,275,250,165,143,dx,250,165,143);}
   return c;
  }).catch(()=>faceOnly(original,src,'male'));return maleFlightPatch;
 }
 async function paint(original,src,gender='male'){
  if(src.includes('large-bag-v2/'))return original;
  if(gender==='male'&&src.includes('broom-flight-winter-v5'))return paintMaleFlight(original,src);
  if(gender==='female'&&src.includes('broom-flight-winter-v6'))return paintFemaleFlight(original);
  const base=await paintBase(original,src,gender);
  if(gender!=='female'||!src.includes('walk-bag-unified-v7/frame-08'))return base;
  if(repairCache.has(src))return repairCache.get(src);
  const task=image('assets/characters/walk-repairs-v1/frame-08.png').then(edited=>{
   const canvas=document.createElement('canvas');canvas.width=base.width;canvas.height=base.height;
   const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(base,0,0);
   const pixels=ctx.getImageData(0,0,canvas.width,canvas.height);
   ctx.clearRect(0,0,canvas.width,canvas.height);ctx.drawImage(edited,0,0);
   const q=ctx.getImageData(0,0,canvas.width,canvas.height).data,p=pixels.data;
   // Local shoe patch; retain the approved frame's alpha and all other artwork.
   for(let y=790;y<982;y++)for(let x=1050;x<1265;x++){
    const i=(y*canvas.width+x)*4;if(p[i+3]>245&&q[i+3]>245)for(let c=0;c<3;c++)p[i+c]=q[i+c];
   }
   ctx.clearRect(0,0,canvas.width,canvas.height);ctx.drawImage(base,0,0);ctx.putImageData(pixels,0,0,1050,790,215,192);return canvas;
  }).catch(()=>base);repairCache.set(src,task);return task;
 }
 const seen=new WeakSet();
 function scan(){document.querySelectorAll('img[src*="large-bag-v2/male-standing"],img[src*="assets/characters/male/idle-standing-empty-hands"],img[src*="assets/characters/female/idle-standing-empty-hands"]').forEach(img=>{
  if(seen.has(img)||!img.complete||!img.naturalWidth)return;seen.add(img);
  const src=img.getAttribute('src');paint(img,src,src.includes('/female/')||src.includes('female-standing')?'female':'male').then(canvas=>{if(canvas===img)return;img.dataset.refinedOriginal=src;img.src=canvas.toDataURL('image/png');});
 });}
 setInterval(scan,250);
 return {paint,faceOnly};
})();

