'use strict';
const fs=require('node:fs');const path=require('node:path');
const root=__dirname;const out=path.resolve(root,'public');
if(path.dirname(out)!==root||path.basename(out)!=='public')throw Error('Invalid output directory');
const files=require('./production-files.json');
for(const file of files){if(path.isAbsolute(file)||file.split('/').includes('..'))throw Error('Invalid asset path');if(!fs.statSync(path.join(root,file)).isFile())throw Error('Missing production file: '+file);}
fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out,{recursive:true});
for(const file of files){const target=path.join(out,file);fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(path.join(root,file),target);}
console.log('Published '+files.length+' runtime files; drafts, tests and source-only files excluded.');
