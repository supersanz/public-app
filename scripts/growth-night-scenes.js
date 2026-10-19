'use strict';
// Each night uses the matching daytime landscape and its approved sleeping pose.
(()=>{
 const previousNight=travelerNightWorld,previousScene=travelerNightScene;
 const scenes={white:['황무지','wasteland-camp-unified'],desert:['새싹 초원','meadow-camp-unified'],forest:['푸른 숲','growth-forest-unified'],deepForest:['고대 유적','ruins-camp-unified'],runFrontier:['설산','alpine-camp-unified'],sky:['하늘 성','sky-platform-unified'],city:['한강 도시','city-rooftop-unified']};
 const canonical=id=>id==='flightFrontier'?'sky':id;
 const source=id=>travelerFemale()?(id==='white'?'assets/backgrounds/character-style-v1/female-white-night-bag-lantern-v33.png':'assets/backgrounds/character-style-v1/female-'+id+'-night-natural-v4.png'):'assets/backgrounds/character-style-v1/male-'+id+(id==='white'?'-night-daymatch-v75.png?v=1':id==='desert'?'-night-bag-v70.png?v=1':id==='forest'?'-night-new-v68.png?v=1':id==='sky'?'-night-layout-v37.png?v=1':id==='runFrontier'?'-night-mat-v59.png?v=1':id==='city'?'-night-crisp-v77.png?v=1':'-night-round-bag-v1.png?v=1');
 travelerNightScene=function(id){const key=canonical(id);return scenes[key]?[source(key),scenes[key][0]+'에서 쉬는 밤']:previousScene(id);};
 travelerNightWorld=function(id){
  const key=canonical(id),scene=scenes[key];
  if(!scene)return previousNight(id);
  const gender=travelerFemale()?'female':'male';
  return `<div class="growth-night ${scene[1]}" data-camp-gender="${gender}" data-growth-night="${key}" role="img" aria-label="${scene[0]}에서 잠든 마법사"><img class="forest-night-full" src="${source(key)}" alt="${scene[0]}의 밤, 여행 장비 곁에서 쉬는 캐릭터" draggable="false">${key==='white'&&gender==='female'?'<span class="lantern-local-dimmer" aria-hidden="true"></span>':''}<span class="growth-sleep-mark" aria-hidden="true"><i>z</i><i>z</i><i>Z</i></span></div>`;
 };
})();



