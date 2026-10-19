'use strict';
// Earlier modules render legacy screens while the current UI is being installed.
// Reveal only the final screen once every synchronous module has loaded.
function revealQuestApp(){
 const app=document.getElementById('app');
 try{render();}finally{
  app.style.removeProperty('visibility');
  app.removeAttribute('aria-busy');
 }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',revealQuestApp,{once:true});else revealQuestApp();
