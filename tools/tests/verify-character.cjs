const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const rewards=require(process.cwd()+'/scripts/reward-catalog.js');
const data={travelerJourney:rewards.state({claimed:Object.keys(rewards.items),background:'desert'},50),walkExp:123};
let ok=true,night=false;
const ctx={data,TravelerRewards:rewards,travelerStanding:'male.png',travelerState:()=>rewards.state(data.travelerJourney,50),travelerArt:()=>'<img src="male.png">',travelerNightAt:()=>night,travelerNightWorld:bg=>`<div class="night-world"><img src="${({white:'characters/male/clearing-night.png',desert:'characters/male/desert-night.png',forest:'characters/male/forest-night.png',deepForest:'characters/male/ancient-forest-night.png',sky:'traveler-night-sky-unified-v1.png'})[bg]}"></div>`,travelerCafeScene:()=>'<div class="cafe-world"><img src="characters/male/cafe-day.png"></div>',travelerScene:()=>'',travelerBundleCard:()=>'<img src="male.png">',pages:{home:()=>'<section>home</section>'},persist:()=>ok,render(){},toast(){},document:{addEventListener(){}}};
vm.createContext(ctx);vm.runInContext(fs.readFileSync('scripts/gender-and-character-scenes.js','utf8'),ctx);
for(const bg of Object.keys(rewards.bundles)){
 data.travelerJourney=rewards.change(data.travelerJourney,50,'equip',bg);
 const before=JSON.stringify(data.travelerJourney);
 for(const gender of ['female','male','female']){
  assert(ctx.setTravelerCharacter(gender));assert.equal(JSON.stringify(data.travelerJourney),before);assert.equal(ctx.travelerState().background,bg);assert.equal(ctx.travelerState().motion,rewards.bundles[bg]);
  night=true;assert.equal(ctx.travelerNightAt(),true);night=false;assert.equal(ctx.travelerNightAt(),false);
  const scene=ctx.travelerNightWorld(bg);assert(scene.includes(gender==='female'?'female':bg==='academy'||bg==='office'?'male':'night')||bg==='white');
 }
}
ok=false;assert.equal(ctx.setTravelerCharacter('male'),false);assert.equal(data.travelerCharacter,'female');assert.equal(data.walkExp,123);
assert.equal(ctx.setTravelerCharacter('invalid'),false);
console.log('PASS: all 7 bundles keep equipment and XP across gender switches, scheduled night unchanged, save rollback');
