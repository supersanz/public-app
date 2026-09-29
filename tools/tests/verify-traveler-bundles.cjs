const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const rewards=require(process.cwd()+'/scripts/reward-catalog.js'),bundles=Object.entries(rewards.bundles);
let lv=1,sleeping=false,writes=0,storageOK=true;
const context=vm.createContext({LevelCurve:require(process.cwd()+'/scripts/experience-levels.js'),requestAnimationFrame(){},performance,TravelerRewards:rewards,pages:{},player:()=>({lv,xp:280}),petSleepState:()=>({sleeping}),data:{alarms:[],logs:[{text:'existing'}]},Date,URLSearchParams,icon:()=>'',bar:()=>'<div>bar</div>',heading:t=>`<h1>${t}</h1>`,render(){},page:'home',toast(){},persist(){writes++;return storageOK},window:{addEventListener(){}},setInterval(){},document:{hidden:false,getElementById:()=>({classList:{toggle(){}}}),querySelector:()=>null,addEventListener(){}}});
const run=s=>vm.runInContext(s,context);run(fs.readFileSync('scripts/journey-and-bonus-experience.js','utf8'));
const change=(action,id)=>run(`changeTravelerReward('${action}','${id}')`),state=()=>run('travelerState()');
assert.equal(state().background,'white');assert.equal(state().motion,'still');assert.ok(run('pages.home()').includes('clearing-scene'));
const html=run('pages.rewards()');assert.equal((html.split('class="reward-list"')[1].match(/data-bundle=/g)||[]).length,6);assert.ok(html.includes('기본 보상'));assert.ok(html.includes('다음 성장 보상'));assert.ok(html.includes('Lv.5까지'));
assert.equal(writes,0);assert.equal(context.data.travelerJourney,undefined);
for(const [bg,motion] of bundles){
 const required=rewards.items[bg].level;if(required===1)continue;
 assert.equal(rewards.change({},required-1,'claim',bg),null);assert.equal(rewards.change({},99,'equip',bg),null);
 const owned=rewards.change({},required,'claim',bg);
 assert.ok(owned.claimed.includes(bg));assert.ok(owned.claimed.includes(motion));assert.equal(owned.background,'white');
 assert.equal(rewards.change(owned,required,'claim',motion),null);
 for(const alias of [bg,motion]){
  const selected=rewards.change(owned,1,'equip',alias);assert.equal(selected.background,bg);assert.equal(selected.motion,motion);
  assert.deepEqual(rewards.state(JSON.parse(JSON.stringify(selected)),1),selected);
 }
 for(const old of [bg,motion]){
  const migrated=rewards.state({claimed:[old],background:bg,motion:'still'},1);
  assert.ok(migrated.claimed.includes(bg));assert.ok(migrated.claimed.includes(motion));assert.equal(migrated.motion,motion);
 }
}
console.log('PASS: six bundle gates, atomic claim, aliases, legacy ownership and reload');
lv=50;context.data.travelerJourney={claimed:Object.keys(rewards.items).filter(id=>rewards.items[id].level>1)};
for(const [from] of bundles)for(const [to,motion] of bundles){
 assert.equal(change('equip',from),true);assert.equal(change('equip',to),true);
 assert.equal(state().background,to);assert.equal(state().motion,motion);assert.ok(rewards.compatible(to,motion));
 assert.equal(context.data.travelerJourney.background,to);assert.equal(context.data.travelerJourney.motion,motion);
}
assert.equal(context.data.logs[0].text,'existing');
assert.equal(change('equip','sky'),true);assert.equal(state().motion,'fly');assert.equal(change('equip','white'),true);assert.equal(state().motion,'still');
assert.equal(change('equip','run'),true);assert.equal(state().background,'forest');
const before=JSON.stringify(context.data);storageOK=false;assert.equal(change('equip','academy'),false);assert.equal(JSON.stringify(context.data),before);
storageOK=true;assert.equal(change('equip','missing'),false);assert.equal(change('equip','toString'),false);
console.log('PASS: all 36 switches, sky roundtrip, atomic save rollback and records preserved');
for(const preview of ['forest','deepForest','sky','academy']){
 context.location={search:'?preview='+preview};
 for(const [bg,motion] of bundles){assert.equal(change('equip',bg),true);assert.equal(state().background,bg);assert.equal(state().motion,motion);}
}
context.location.search='';assert.equal(change('equip','academy'),true);
const cafe=run('pages.home()');assert.ok(cafe.includes('characters/male/cafe-day.png'));assert.ok(cafe.includes('cafe-steam'));assert.ok(cafe.includes('cafe-eye-left'));
assert.equal(run('travelerArt()'),'');assert.equal(rewards.items.studyWork.exp,10);
const card=run("travelerBundleCard('academy')");assert.ok(card.includes('햇살 드는 카페'));assert.ok(card.includes('컴퓨터 작업'));assert.ok(card.includes('✓ 장착 중'));
for(const [level,title] of [[5,'사막으로'],[10,'숲속으로'],[20,'고대숲으로'],[30,'하늘섬으로'],[40,'21세기로'],[50,'프리랜서']])assert.equal(run(`travelerRewardTitle(${level})`),title);
for(const [level,threshold] of [[1,1],[4,1],[5,5],[9,5],[10,10],[19,10],[20,20],[29,20],[30,30],[39,30],[40,40],[49,40],[50,40]])assert.ok(run(`travelerJourneyBanner(${level})`).includes(`Lv.${threshold} ·`));
assert.ok(fs.statSync('assets/characters/male/cafe-day.png').size>1000);
console.log('PASS: preview swaps both slots, cafe effects/XP and milestone titles');
run(fs.readFileSync('scripts/day-night-scenes.js','utf8'));
const cafeNight=run("travelerNightWorld('academy')");
assert.ok(cafeNight.includes('cafe-at-night'));assert.ok(!cafeNight.includes('night-rest-character'));
for(const [bg] of bundles)assert.ok(run(`travelerNightWorld('${bg}')`).length>50);
const css=fs.readFileSync('styles/character-scenes.css','utf8');
assert.ok(css.includes('.journey-bundle .cafe-steam,.journey-bundle .cafe-eye{display:none}'));
assert.ok(css.includes('cafe-steam-rise 7.5s'));assert.ok(css.includes('cafe-blink 6.7s'));
console.log('PASS: night scenes preserved, cafe resting state, static reward effects');
