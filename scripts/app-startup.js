'use strict';
// Earlier modules render legacy screens while the current UI is being installed.
// Reveal only the final screen once every synchronous module has loaded.
document.addEventListener('DOMContentLoaded',()=>{
 const app=document.getElementById('app');
 try{render();}finally{
  app.style.removeProperty('visibility');
  app.removeAttribute('aria-busy');
 }
},{once:true});
