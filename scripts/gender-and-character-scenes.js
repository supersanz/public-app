'use strict';
// Equipment belongs to the player; character selection changes presentation only.
function travelerFemale(){return data.travelerCharacter==='female'}
function resetForTravelerCharacter(value,name=''){
 if(!['male','female'].includes(value)||value===(data.travelerCharacter||'male'))return false;
 const previous=data;
 data={disableScenePreview:true,logs:[],worn:0,skin:2,friends:[],alarms:[['07:00','23:30',true,true],['09:00','00:30',true,true]],travelerCharacter:value,travelerJourney:TravelerRewards.state({}),walkExp:0,playerResetEarned:0,levelBaseline:[0,0,0,0,0],levelCurveVersion:3,petProgressVersion:2,questProfile:{version:1,onboardingCompleted:true,name:String(name).trim().slice(0,16),goals:[0,1,2,3]}};
 if(!persist()){data=previous;return false;}
 Object.assign(travelerPreviewEquipment,{background:'white',motion:'still'});
 selected.clear();recordDate='';modal='';travelerNightOverride=null;
 page='home';render();return true;
}
function setTravelerCharacter(value){
 if(!['male','female'].includes(value))return false;
 const previous=data.travelerCharacter;data.travelerCharacter=value;
 if(!persist()){if(previous===undefined)delete data.travelerCharacter;else data.travelerCharacter=previous;return false}
 render();return true;
}
(()=>{
 const art=travelerArt,home=pages.home,nightWorld=travelerNightWorld,cafe=travelerCafeScene,card=travelerBundleCard,scene=travelerScene;
 const standing='<img class="female-standing" src="assets/characters/female/idle-standing.png" alt="왼쪽을 바라보며 서 있는 여자 마법사" draggable="false">';
 const sprite=(motion,preview=false)=>`<canvas class="female-motion" data-motion="${motion}" data-preview="${preview}" width="256" height="256" role="img" aria-label="여자 캐릭터 ${motion==='fly'?'빗자루 타기':motion==='walk'?'걷기':'달리기'}"></canvas>`;
 travelerArt=function(){
  if(travelerState().motion==='officeWork')return '';
  if(!travelerFemale())return art();
  const motion=travelerState().motion;
  if(motion==='studyWork'||motion==='officeWork')return '';
  if(motion==='still')return standing;
  if(motion==='ride')return '<div class="coffee-flight female-coffee-flight" role="img" aria-label="커피를 들고 종이비행기를 타는 여자 마법사"><span class="plane-rider-body"></span><span class="plane-rider-hair"></span></div>';
  return motion==='fly'?`<div class="motion-fly">${sprite(motion)}</div>`:sprite(motion);
 };
 travelerCafeScene=function(night=false){
  if(!travelerFemale())return cafe(night);
  return cafe(night).replace('characters/male/cafe-day.png','characters/female/cafe-day.png').replace('class="cafe-world','class="cafe-world female-cafe');
 };
 travelerScene=function(bg){
  if(bg!=='office')return scene(bg);
  return `<div class="cafe-world office-world" role="img" aria-label="회사에서 컴퓨터로 일하는 ${travelerFemale()?'여자':'남자'} 캐릭터"><img src="assets/characters/${travelerFemale()?'female':'male'}/office-day.png" alt=""></div>`;
 };
 travelerNightWorld=function(bg){
  if(bg==='city')return `<div class="night-world city-rooftop-night"><img src="assets/characters/${travelerFemale()?'female':'male'}/city-rooftop-sleep-v3.png" alt="서울 야경이 보이는 옥상에서 침낭에 들어가 잠든 마법사"><div class="city-sleep" aria-hidden="true"><span>z</span><span>z</span><span>z</span></div></div>`;
  if(bg==='subway')return '<div class="night-world ridge-night"><img src="assets/characters/'+(travelerFemale()?'female/subway-ridge-night-plain-v3.png':'male/subway-ridge-night-no-straps-v2.png')+'" alt="한강이 내려다보이는 산등성이에서 종이비행기 옆에 누워 자는 마법사"><div class="ridge-sleep" aria-hidden="true"><span>z</span><span>z</span><span>z</span></div></div>';

  if(bg==='flightFrontier')return '<div class="night-world rooftop-night"><img src="assets/characters/'+(travelerFemale()?'female/flightFrontier-rooftop-night-matched-v11.png':'male/flightFrontier-rooftop-night-v4.png')+'" alt="천공섬 건물 옥상에 누워 별을 바라보는 마법사"><div class="rooftop-window-glow" aria-hidden="true"></div><div class="rooftop-meteors" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div></div>';

  if(['flightFrontier','city','subway'].includes(bg)){
   const label={flightFrontier:'천공섬 테라스에서 담요를 덮고 별 구경',city:'수업 뒤 도심 벤치에서 이어폰을 끼고 쉬기',subway:'한강공원에서 종이비행기에 기대 야경 보기'}[bg];
   return `<div class="night-world milestone-night" data-milestone-night="${bg}"><img src="assets/characters/${travelerFemale()?'female':'male'}/${bg}-night-rest.png" alt="${label}"></div>`;
  }
  if(bg==='city'||bg==='subway')return `<div class="night-world modern-night"><img src="${travelerPanorama(bg)}" alt="도시에서 쉬는 밤"><img class="modern-rest-avatar" src="assets/characters/${travelerFemale()?'female':'male'}/idle-standing.png" alt="쉬는 캐릭터"></div>`;
  if(bg==='runFrontier')bg='deepForest';
  if(bg==='flightFrontier')bg='sky';
  if(bg==='academy'||bg==='office'){
   const gender=travelerFemale()?'female':'male';
   return `<div class="night-world" data-rest-scene="${bg}"><img src="assets/characters/${gender}/${bg}-night.png" alt="${gender==='female'?'여자':'남자'} 캐릭터가 쉬는 밤"><div class="sleep-letters"><span>z</span><span>z</span><span>z</span></div></div>`;
  }
  if(!travelerFemale())return bg==='white'?nightWorld(bg).replace('characters/male/clearing-night.png','characters/male/clearing-night-pixel-v2.png'):nightWorld(bg);
  let markup=nightWorld(bg);
  const originals={white:'characters/male/clearing-night.png',desert:'characters/male/desert-night.png',forest:'characters/male/forest-night.png',deepForest:'characters/male/ancient-forest-night.png',sky:'characters/male/sky-night.png'};
  markup=markup.replace(originals[bg],bg==='sky'?'characters/female/sky-night.png':`characters/female/${({white:'clearing',deepForest:'ancient-forest'})[bg]||bg}-night.png`).replace('class="night-world','class="night-world female-night');
  // Deep-forest eyelids use the female face coordinates in CSS.
  if(bg==='white')markup=markup.replace('characters/female/clearing-night.png','characters/female/clearing-night-approved-v2.png');
  return markup.replace(/<i class="camp-eyelid[^"]*"><\/i>/g,'');
 };
 travelerBundleCard=function(bg){
  let markup=card(bg);
  if(bg==='office')markup=markup.replace(/<div class="bundle-character">.*?<\/div>/,'<div class="bundle-character"></div>');
  if(!travelerFemale())return markup;
  markup=markup.replace('class="coffee-flight"','class="coffee-flight female-coffee-flight"');
  markup=markup.replace(/<canvas class="(?:traveler-flight flight-preview|reward-ground-motion)"[^>]*><\/canvas>/g,sprite(TravelerRewards.bundles[bg],true));
  return markup.replace(travelerStanding,'assets/characters/female/idle-standing.png');
 };
 pages.home=function(){
  const female=travelerFemale();
  const markup=home().replace('desert-home ',`desert-home ${travelerState().background==='office'?'cafe-home ':''}`);
  return markup.replace('</section>',`<div class="character-picker" role="group" aria-label="캐릭터 선택"><button data-character="male" aria-pressed="${!female}">남자</button><button data-character="female" aria-pressed="${female}">여자</button></div></section>`);
 };
 document.addEventListener('click',event=>{
  const button=event.target.closest('[data-character]');if(!button)return;event.preventDefault();event.stopImmediatePropagation();
  if(!setTravelerCharacter(button.dataset.character))toast('캐릭터 선택을 저장하지 못했어요.');
 },true);
 render();
})();
