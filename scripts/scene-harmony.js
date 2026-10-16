'use strict';
// Render-only surface treatment: keep the approved sprite sheets and frame geometry.
// Noise is clipped to the sprite alpha, so transparent gutters remain transparent.
(()=>{
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
 svg.setAttribute('aria-hidden','true');
 svg.setAttribute('width','0');svg.setAttribute('height','0');
 svg.style.cssText='position:absolute;pointer-events:none;overflow:hidden';
 const grades={
  warm:{sat:.84,r:[.91,.055],g:[.89,.047],b:[.85,.038]},
  forest:{sat:.80,r:[.87,.045],g:[.90,.055],b:[.87,.048]},
  stone:{sat:.78,r:[.88,.048],g:[.89,.052],b:[.91,.060]},
  snow:{sat:.76,r:[.91,.063],g:[.93,.070],b:[.96,.080]},
  sky:{sat:.82,r:[.93,.060],g:[.91,.055],b:[.94,.070]},
  city:{sat:.78,r:[.89,.055],g:[.91,.060],b:[.94,.070]}
 };
 svg.innerHTML='<defs>'+Object.entries(grades).map(([name,g])=>
  `<filter id="scene-paint-${name}" x="-2%" y="-2%" width="104%" height="104%" color-interpolation-filters="sRGB">
   <feColorMatrix in="SourceGraphic" type="saturate" values="${g.sat}"/>
   <feComponentTransfer result="paint">
    ${['R','G','B'].map(c=>`<feFunc${c} type="linear" slope="${g[c.toLowerCase()][0]}" intercept="${g[c.toLowerCase()][1]}"/>`).join('')}
   </feComponentTransfer>
   <feTurbulence type="fractalNoise" baseFrequency=".38" numOctaves="2" seed="17" result="grain"/>
   <feColorMatrix in="grain" type="saturate" values="0"/>
   <feComponentTransfer><feFuncA type="linear" slope=".16"/></feComponentTransfer>
   <feComposite in2="SourceAlpha" operator="in" result="paper"/>
   <feBlend in="paint" in2="paper" mode="soft-light"/>
   <feComposite in2="SourceAlpha" operator="in"/>
   <feGaussianBlur stdDeviation=".16"/>
  </filter>`).join('')+'</defs>';
 document.body.prepend(svg);
})();
