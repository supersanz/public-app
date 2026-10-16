'use strict';
// Shared asset resolver covers home scenery, reward cards and journey banners.
(()=>{
 const previous=travelerPanorama;
 const scenes=new Set(['white','desert','forest','deepForest','runFrontier','sky','city']);
 travelerPanorama=id=>{
  const key=id==='flightFrontier'?'sky':id;
  if(key==='city')return 'assets/backgrounds/character-style-v1/city-day-loop-a-v5.png';
  return scenes.has(key)?`assets/backgrounds/character-style-v1/${key}-day-loop-a-v5.png`:previous(id);
 };
 const previousTiles=travelerPanoramaTiles;
 travelerPanoramaTiles=id=>{
  const key=id==='flightFrontier'?'sky':id;
  return scenes.has(key)?[travelerPanorama(key),`assets/backgrounds/character-style-v1/${key}-day-loop-b-v5.png`]:previousTiles(id);
 };
})();

