(()=>{
 const image=new Image(),frames=[];
 image.onload=()=>{
  const sheet=document.createElement('canvas');sheet.width=image.width;sheet.height=image.height;
  const context=sheet.getContext('2d',{willReadFrequently:true});context.drawImage(image,0,0);
  const pixels=context.getImageData(0,0,sheet.width,sheet.height);
  // Chroma-key the generated magenta stage once, never on each animation frame.
  for(let p=0;p<pixels.data.length;p+=4){const [r,g,b]=pixels.data.slice(p,p+3);if(r>g*1.4+25&&b>g*1.4+25&&b>r*.65)pixels.data[p+3]=0;}
  context.putImageData(pixels,0,0);
  for(let i=0;i<6;i++){
   const x=Math.round(i%3*sheet.width/3),y=Math.round(Math.floor(i/3)*sheet.height/2),w=Math.round(sheet.width/3),h=Math.round(sheet.height/2);
   let top=h,bottom=0;
   for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++)if(pixels.data[((y+yy)*sheet.width+x+xx)*4+3]>100){top=Math.min(top,yy);bottom=Math.max(bottom,yy)}
   // Anchor the stable head/hat, not the moving robe or broom tail.
   let headLeft=w,headRight=0;
   for(let yy=top;yy<Math.min(h,top+(bottom-top+1)*.45);yy++)for(let xx=0;xx<w;xx++)if(pixels.data[((y+yy)*sheet.width+x+xx)*4+3]>100){headLeft=Math.min(headLeft,xx);headRight=Math.max(headRight,xx)}
   frames.push({sheet,x,y:y+top,w,h:bottom-top+1,anchorX:(headLeft+headRight)/2});
  }
 };
 image.src='assets/characters/male/fly-123456.png';
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');let time=0,last=0;
 function tick(now){
  const canvases=document.querySelectorAll('canvas.traveler-flight');
  if(frames.length===6&&canvases.length&&!document.hidden){
   if(last&&!reduced.matches)time+=Math.min(50,now-last);
   // Forward and return through the breeze poses avoids a hard last-to-first jump.
   const order=[0,1,2,3,4,5,4,3,2,1],index=reduced.matches?0:order[Math.floor(time/180)%order.length],f=frames[index];
   for(const canvas of canvases){const f=frames[canvas.classList.contains('flight-preview')?0:index];const ctx=canvas.getContext('2d');ctx.clearRect(0,0,256,256);ctx.imageSmoothingEnabled=false;
    const scale=240/f.w,offsetX=(frames[0].anchorX-f.anchorX)*scale;ctx.drawImage(f.sheet,f.x,f.y,f.w,f.h,8+offsetX,20,f.w*scale,f.h*scale);canvas.dataset.frame=String(canvas.classList.contains('flight-preview')?1:index+1);
   }
  }
  last=now;requestAnimationFrame(tick);
 }
 requestAnimationFrame(tick);
})();
