const fs=require('fs'),vm=require('vm'),assert=require('assert');
const read=f=>fs.readFileSync(f,'utf8');
const app=read('scripts/app-core.js'),journey=read('scripts/journey-and-bonus-experience.js'),night=read('scripts/day-night-scenes.js');
function block(src,name){const a=src.indexOf('function '+name+'(');let start=src.indexOf('{',a),depth=1,i=start+1;for(;depth;i++){if(src[i]==='{')depth++;if(src[i]==='}')depth--;}return src.slice(a,i);}
const store=new Map();const ctx={data:{logs:[],travelerJourney:{}},KEY:'test',localStorage:{setItem:(k,v)=>store.set(k,v),getItem:k=>store.get(k)},TravelerRewards:require(process.cwd()+'/scripts/reward-catalog.js'),player:()=>({lv:40}),toast:()=>{},render:()=>{},document:{addEventListener:()=>{}},pages:{home:()=>'<section></section>'},travelerStanding:'male-standing.png',travelerArt:()=>'<img src="male.png">',travelerCafeScene:()=>'<div class="cafe-world"><img src="characters/male/cafe-day.png"></div>',travelerScene:()=>'',travelerForestPreview:()=>false,travelerPreviewEquipment:{}};
ctx.travelerState=()=>ctx.TravelerRewards.state(ctx.data.travelerJourney,40);
ctx.travelerNightWorld=bg=>'<div class="night-world"><img src="'+({white:'characters/male/clearing-night.png',desert:'characters/male/desert-night.png',forest:'characters/male/forest-night.png',deepForest:'characters/male/ancient-forest-night.png',sky:'characters/male/sky-night.png'})[bg]+'"></div>';
ctx.travelerBundleCard=bg=>bg==='academy'?ctx.travelerCafeScene():bg==='white'?ctx.travelerStanding:'<canvas class="reward-ground-motion"></canvas>';
vm.createContext(ctx);vm.runInContext(block(app,'persist'),ctx);vm.runInContext(block(journey,'changeTravelerReward'),ctx);vm.runInContext(read('scripts/gender-and-character-scenes.js'),ctx);
const bundles=Object.keys(ctx.TravelerRewards.bundles);let count=0;
for(const gender of ['male','female']){
 assert(ctx.setTravelerCharacter(gender));
 for(const bg of bundles.slice(1))if(!ctx.data.travelerJourney.claimed?.includes(bg))assert(ctx.changeTravelerReward('claim',bg));
 for(const from of bundles)for(const to of bundles){
  assert(ctx.changeTravelerReward('equip',from));assert(ctx.changeTravelerReward('equip',to));
  ctx.data=JSON.parse(store.get('test'));assert.equal(ctx.data.travelerCharacter,gender);assert.equal(ctx.travelerState().background,to);
  const female=gender==='female';assert.equal(ctx.travelerFemale(),female);
  assert.equal(ctx.travelerNightWorld(to).includes('female'),female);
  assert.equal(ctx.travelerBundleCard(to).includes('female'),female);
  const art=to==='academy'?ctx.travelerCafeScene():ctx.travelerArt();assert.equal(art.includes('female'),female);count++;
 }
}
const before=ctx.data.travelerCharacter;ctx.persist=()=>false;assert.equal(ctx.setTravelerCharacter('female'),false);assert.equal(ctx.data.travelerCharacter,before);assert.equal(ctx.setTravelerCharacter('invalid'),false);
console.log(`PASS ${count} equipment/reload cases, both genders, all 6 day/night/reward previews, selection save failure rollback`);
