'use strict';
// Local canvas deformation: fixed shoulders, alternating forearm/hand swing.
// Source artwork and all lower-body pixels stay unchanged.
(function(root){
 const arms=[
  [[145,238,84,314],[232,238,267,338]],
  [[145,232,100,310],[237,232,265,334]],
  [[144,230,118,320],[232,230,243,337]],
  [[150,238,100,317],[232,242,254,344]],
  [[150,238,100,317],[232,242,254,344]],
  [[145,232,100,310],[237,232,265,334]],
  [[144,232,118,320],[232,230,245,335]],
  [[145,238,84,314],[232,238,267,338]]
 ];
 const swing=[-16,-11,0,11,16,11,0,-11];
 function render(canvas,frame){
  if(frame===3)return canvas; // Preserve exact user-selected frame 4.
  const ctx=canvas.getContext('2d'),src=ctx.getImageData(0,0,512,512),dst=ctx.getImageData(0,0,512,512);
  const points=arms[frame].map(a=>[64+a[0]*384/420,a[1]*512/560,64+a[2]*384/420,a[3]*512/560]);
  function displacement(x,y){
   let dx=0,dy=0;
   for(let j=0;j<2;j++){
    const [ax,ay,bx,by]=points[j],vx=bx-ax,vy=by-ay;
    const t=((x-ax)*vx+(y-ay)*vy)/(vx*vx+vy*vy);
    if(t<=0||t>1.24)continue;
    const u=Math.min(1,t),distance=Math.hypot(x-ax-u*vx,y-ay-u*vy);
    const edge=Math.max(0,Math.min(1,(24-distance)/12));
    const w=edge*edge*(3-2*edge)*u*u;
    const amount=swing[frame]*(j===1?1:-.75);
    dx+=amount*w;dy-=Math.abs(amount)*.10*w;
   }
   return [dx,dy];
  }
  for(let y=200;y<345;y++)for(let x=90;x<340;x++){
   let u=x,v=y;
   for(let k=0;k<5;k++){const d=displacement(u,v);u=x-d[0];v=y-d[1];}
   if(Math.abs(u-x)+Math.abs(v-y)<.001)continue;
   const x0=Math.floor(u),y0=Math.floor(v),fx=u-x0,fy=v-y0;
   const offsets=[(y0*512+x0)*4,(y0*512+x0+1)*4,((y0+1)*512+x0)*4,((y0+1)*512+x0+1)*4];
   const weights=[(1-fx)*(1-fy),fx*(1-fy),(1-fx)*fy,fx*fy],at=(y*512+x)*4;
   let alpha=0;for(let k=0;k<4;k++)alpha+=src.data[offsets[k]+3]*weights[k];
   dst.data[at+3]=alpha;
   for(let ch=0;ch<3;ch++){let value=0;for(let k=0;k<4;k++)value+=src.data[offsets[k]+ch]*src.data[offsets[k]+3]*weights[k];dst.data[at+ch]=alpha?value/alpha:0;}
  }
  ctx.putImageData(dst,0,0);return canvas;
 }
 root.SelectedWalkArms={render};
})(globalThis);
