'use strict';
// Equipment belongs to the player; character selection changes presentation only.
function travelerFemale(){return data.travelerCharacter==='female'}
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
  if(bg==='academy'||bg==='office'){
   const gender=travelerFemale()?'female':'male';
   return `<div class="night-world" data-rest-scene="${bg}"><img src="assets/characters/${gender}/${bg}-night.png" alt="${gender==='female'?'여자':'남자'} 캐릭터가 쉬는 밤"><div class="sleep-letters"><span>z</span><span>z</span><span>z</span></div></div>`;
  }
  if(!travelerFemale())return nightWorld(bg);
  let markup=nightWorld(bg);
  const originals={white:'characters/male/clearing-night.png',desert:'characters/male/desert-night.png',forest:'characters/male/forest-night.png',deepForest:'characters/male/ancient-forest-night.png',sky:'characters/male/sky-night.png'};
  markup=markup.replace(originals[bg],bg==='sky'?'characters/female/sky-night.png':`characters/female/${({white:'clearing',deepForest:'ancient-forest'})[bg]||bg}-night.png`).replace('class="night-world','class="night-world female-night');
  // Deep-forest eyelids use the female face coordinates in CSS.
  return markup.replace(/<i class="camp-eyelid[^"]*"><\/i>/g,'');
 };
 travelerBundleCard=function(bg){
  let markup=card(bg);
  if(bg==='office')markup=markup.replace(/<div class="bundle-character">.*?<\/div>/,'<div class="bundle-character"></div>');
  if(!travelerFemale())return markup;
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
