'use strict';
// Retired features have no reachable UI or notification scheduler.
(()=>{delete pages.alarm;const previousNavigate=navigate;navigate=function(id){return previousNavigate(id==='alarm'?'home':id)};if(page==='alarm')page='home';})();
