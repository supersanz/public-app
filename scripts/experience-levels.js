(function(root){
 const bands=[[1,200,75],[5,650,100],[10,2200,180],[20,4200,250],[30,7000,400],[40,18000,1200],[50,36000,1500]];
 function previousRequired(level){const lv=Math.max(1,Math.floor(level));const band=bands.filter(b=>b[0]<=lv).pop();return band[1]+(lv-band[0])*band[2]}
 function required(level){return Math.round(previousRequired(level)*1.5)}
 function previousProgress(growth){let lv=1,xp=Math.max(0,Number(growth)||0);while(xp>=previousRequired(lv)){xp-=previousRequired(lv);lv++}return {lv,xp,required:previousRequired(lv)}}
 function total(level){let sum=0;for(let lv=1;lv<level;lv++)sum+=required(lv);return sum}
 function progress(growth){let lv=1,xp=Math.max(0,Number(growth)||0);while(xp>=required(lv)){xp-=required(lv);lv++}return {lv,xp,required:required(lv)}}
 const api={required,total,progress,previousProgress};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.LevelCurve=api;
})(typeof window==='undefined'?globalThis:window);
