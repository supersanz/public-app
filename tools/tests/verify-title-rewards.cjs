const fs=require('fs'),vm=require('vm'),a=require('assert'),r=require(process.cwd()+'/scripts/reward-catalog.js');
const s=fs.readFileSync('scripts/journey-and-bonus-experience.js','utf8');
const title=vm.runInNewContext('('+s.match(/function travelerTitle\(lv\)\{[^}]+\}/)[0]+')');
for(const [l,t] of [[1,'여행자'],[9,'여행자'],[10,'탐험가'],[19,'탐험가'],[20,'탐험가 +'],[29,'탐험가 +'],[30,'마법사'],[39,'마법사'],[40,'프리랜서'],[49,'프리랜서'],[50,'프리랜서'],[100,'프리랜서']])a.equal(title(l),t);
a.equal(r.items.office,undefined);
a.equal(r.change({},50,'claim','office'),null);
a.equal(r.state({background:'office',claimed:['office','officeWork']},50).background,'academy');
a(!s.includes("[50,'"));
console.log('PASS: title boundaries, removed level-50 reward, legacy equipment migration');
