'use strict';
// Shared asset resolver covers home scenery, reward cards and journey banners.
(()=>{
 const previous=travelerPanorama;
 const scenes=new Set(['white','desert','forest','deepForest','runFrontier','sky','city']);
 travelerPanorama=id=>{
  const key=id==='flightFrontier'?'sky':id;
  if(TravelUnlocks.destinations[key])return 'assets/backgrounds/character-style-v1/'+TravelUnlocks.destinations[key].file;
  if(['italy','france','britain','america'].includes(key))return 'assets/backgrounds/character-style-v1/'+key+'-travel-v1.png';
  if(key==='japan')return 'assets/backgrounds/character-style-v1/japan-tokyo-day-v1.png';
  if(key==='city')return 'assets/backgrounds/character-style-v1/city-scooter-road-v1.png';
  return scenes.has(key)?`assets/backgrounds/character-style-v1/${key}-day-loop-a-v5.png`:previous(id);
 };
 const previousTiles=travelerPanoramaTiles;
 travelerPanoramaTiles=id=>{
  const key=id==='flightFrontier'?'sky':id;
  if(key==='city')return [travelerPanorama(key),travelerPanorama(key)];
  if(key==='japan')return [travelerPanorama(key),travelerPanorama(key)];
  return scenes.has(key)?[travelerPanorama(key),`assets/backgrounds/character-style-v1/${key}-day-loop-b-v5.png`]:previousTiles(id);
 };
 const previousNight=travelerNightWorld;
 travelerNightWorld=id=>{
  const place=TravelUnlocks.destinations[id];if(!place)return previousNight(id);
  return `<div class="world-travel-night" data-world-night="${id}" role="img" aria-label="${place.name}에서 쉬는 밤"><img class="world-night-background" src="${travelerPanorama(id)}" alt=""><canvas class="approved-walk" data-gender="${travelerFemale()?'female':'male'}" data-outfit="${travelerOutfit(id)}" data-preview="true" width="512" height="512" aria-label="여행지에서 쉬는 캐릭터"></canvas></div>`;
 };
})();

