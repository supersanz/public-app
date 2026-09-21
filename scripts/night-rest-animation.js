/* Local hammock deformation: fixed attachment points and a slow, small sway. */
(()=>{
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let last=0;
 function tick(now){
  if(now-last>80&&!document.hidden){
   last=now;
   const deep=document.querySelector('.night-world[data-night-scene="deepForest"]'),deepImage=deep?.querySelector('img');
   if(deepImage?.complete&&deepImage.naturalWidth){
    let lamp=deep.querySelector('.deep-lantern-motion');
    if(!lamp){lamp=document.createElement('canvas');lamp.className='deep-lantern-motion';lamp.width=100;lamp.height=160;lamp.setAttribute('aria-hidden','true');deep.insertBefore(lamp,deep.querySelector('.deep-lantern'));}
    const ctx=lamp.getContext('2d'),w=deepImage.naturalWidth,h=deepImage.naturalHeight;
    const angle=reduced.matches?0:Math.sin(now/9000*Math.PI*2)*.028;
    // Rotate the complete lantern and chain rigidly around the hanging point.
    // Only the surrounding scenery at the patch edge is feathered.
    const sx=w*.395,sy=h*.615,sw=w*.1,sh=h*.08;
    ctx.clearRect(0,0,100,160);ctx.imageSmoothingEnabled=true;
    ctx.save();ctx.scale(100/sw,160/sh);ctx.translate(w*.4445-sx,h*.616-sy);ctx.rotate(angle);
    ctx.drawImage(deepImage,-w*.4445,-h*.616);ctx.restore();
    ctx.globalCompositeOperation='destination-in';
    const horizontal=ctx.createLinearGradient(0,0,100,0);
    horizontal.addColorStop(0,'transparent');horizontal.addColorStop(.15,'black');horizontal.addColorStop(.85,'black');horizontal.addColorStop(1,'transparent');
    ctx.fillStyle=horizontal;ctx.fillRect(0,0,100,160);
    const vertical=ctx.createLinearGradient(0,0,0,160);
    vertical.addColorStop(0,'transparent');vertical.addColorStop(.06,'black');vertical.addColorStop(.92,'black');vertical.addColorStop(1,'transparent');
    ctx.fillStyle=vertical;ctx.fillRect(0,0,100,160);ctx.globalCompositeOperation='source-over';
    const glow=deep.querySelector('.deep-lantern');
    glow.style.transformOrigin='50% -63%';glow.style.transform=`rotate(${angle}rad)`;
    lamp.dataset.sway=(angle*180/Math.PI).toFixed(3);
   }
   const world=document.querySelector('.night-world[data-night-scene="forest"]'),image=world?.querySelector('img');
   if(image?.complete&&image.naturalWidth){
    let canvas=world.querySelector('.hammock-motion');
    if(!canvas){canvas=document.createElement('canvas');canvas.className='hammock-motion';canvas.width=640;canvas.height=300;canvas.setAttribute('aria-hidden','true');world.appendChild(canvas)}
    const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;
    const sx=image.naturalWidth*.12,sy=image.naturalHeight*.56,sw=image.naturalWidth*.72,sh=image.naturalHeight*.16;
    const shift=reduced.matches?0:Math.sin(now/6500*Math.PI*2)*3;
    ctx.clearRect(0,0,640,300);
    // Mesh is fixed at all four borders so scenery outside this region stays still.
    const dx=(x,y)=>shift*Math.sin(Math.PI*x/640)*Math.pow(Math.sin(Math.PI*y/300),2);
    for(let y=0;y<300;y+=3)for(let x=0;x<640;x+=10){
     const x0=x+dx(x,y),x1=x+10+dx(x+10,y);
     ctx.drawImage(image,sx+x/640*sw,sy+y/300*sh,10/640*sw,3/300*sh,x0,y,x1-x0+.3,3);
    }
    canvas.dataset.sway=shift.toFixed(2);
   }
  }
  requestAnimationFrame(tick);
 }
 requestAnimationFrame(tick);
})();
