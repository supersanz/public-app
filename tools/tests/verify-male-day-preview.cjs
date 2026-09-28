const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const source=fs.readFileSync('scripts/journey-and-bonus-experience.js','utf8');
let night=false,motion='fly';
const context=vm.createContext({
 travelerScheduledNight:()=>true,travelerNightAt:()=>night,
 travelerState:()=>({motion}),travelerStanding:'male.png',
 travelerTitle:()=> 'Wizard',player:()=>({lv:40})
});
vm.runInContext(source.slice(source.indexOf('function travelerSleeping('),source.indexOf('function travelerMovingScene(')),context);
for(motion of ['walk','run','deepRun','fly']){
 night=false;
 assert.match(context.travelerArt(),motion==='fly'?/canvas class="traveler-flight"/:/canvas class="traveler-slow"/,motion+' animates in daytime preview');
 assert.equal(context.travelerSleeping(),true,'daytime preview must not bypass scheduled sleep for XP');
 night=true;
 assert.match(context.travelerArt(),/^<img /,motion+' rests at night');
 assert.equal(context.travelerWalking(),false);
}
night=false;motion='still';assert.match(context.travelerArt(),/^<img /);
console.log('PASS: male day preview animates all moving poses during scheduled sleep without changing XP eligibility');
