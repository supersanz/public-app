'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
process.chdir(path.resolve(__dirname,'..'));
const html=fs.readFileSync('index.html','utf8');
for(const m of html.matchAll(/(?:src|href)="([^"?]+)(?:\?[^\"]*)?"/g)){
 if(m[1].startsWith('data:'))continue;
 assert(fs.existsSync(m[1]),m[1]);if(m[1].endsWith('.js'))new vm.Script(fs.readFileSync(m[1],'utf8'),{filename:m[1]});
}
for(const p of Object.values(JSON.parse(fs.readFileSync('FILE-MAP.json')).images))assert(fs.existsSync(p),p);
for(const name of ['growth','level-curve','curve-v2','night-schedule','night-time','sleep-exp-matrix','walk-exp','traveler-bundles','title-rewards','character','character-persistence','final-audit'])require('./tests/verify-'+name+'.cjs');
require('./tests/verify-male-day-preview.cjs');
console.log('PASS: current application regression suite and renamed runtime resources.');

