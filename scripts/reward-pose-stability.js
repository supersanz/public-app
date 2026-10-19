'use strict';
// Reuse already-painted reward poses across UI renders (equip/claim/clock refresh).
// The new card still supplies current ownership, buttons and lock styling.
(()=>{
 const baseRender=render;
 render=function(...args){
  const gender=travelerFemale()?'female':'male';
  const poses=new Map();
  document.querySelectorAll('.journey-bundle[data-bundle] .bundle-character').forEach(holder=>{
   const key=holder.closest('[data-bundle]').dataset.bundle+(holder.closest('.reward-carousel')?':collection':':featured');
   const image=holder.querySelector('img');
   const canvas=holder.querySelector('canvas');
   const paintedGender=(image||canvas)?.dataset.gender;
   if(paintedGender===gender&&(image?.complete&&image.naturalWidth||canvas?.dataset.ready==='true')){
    if(!poses.has(key))poses.set(key,Array.from(holder.childNodes));
   }
  });
  const result=baseRender.apply(this,args);
  if(gender!==(travelerFemale()?'female':'male'))return result;
  document.querySelectorAll('.journey-bundle[data-bundle] .bundle-character').forEach(holder=>{
   const key=holder.closest('[data-bundle]').dataset.bundle+(holder.closest('.reward-carousel')?':collection':':featured'),nodes=poses.get(key);
   if(!nodes)return;
   // A background may appear both in the next reward and in the collection.
   holder.replaceChildren(...nodes);poses.delete(key);
  });
  return result;
 };
})();
