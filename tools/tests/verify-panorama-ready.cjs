const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('scripts/panorama-loops.js','utf8');
async function scenario({failure=false,detached=false}={}){
 let complete;const pending=new Promise((resolve,reject)=>complete=failure?()=>reject(Error('load')):resolve);
 const images=[{naturalWidth:100,decode:()=>Promise.resolve()},{naturalWidth:100,decode:()=>pending}];
 const properties={},track={dataset:{loopTiles:'2'},isConnected:!detached,style:{setProperty:(k,v)=>properties[k]=v},querySelectorAll:()=>images};
 const sandbox={travelerPanorama:()=>'',travelerTrackRepeat:()=>200,ResizeObserver:class{observe(){}},MutationObserver:class{observe(){}},document:{body:{},querySelectorAll:()=>[track]}};
 vm.runInNewContext(source,sandbox);await new Promise(setImmediate);
 assert.notEqual(track.dataset.panReady,'true','must wait for every tile');
 complete();await new Promise(setImmediate);
 if(failure||detached)assert.notEqual(track.dataset.panReady,'true');
 else{assert.equal(track.dataset.panReady,'true');assert.equal(properties['--pan-cycle'],'200px');assert.equal(track.style.transform,'translateX(-400px)');}
}
(async()=>{await scenario();await scenario({failure:true});await scenario({detached:true});console.log('PASS panorama readiness: wait for all tiles, position before reveal, failure fallback, detached scene ignored');})().catch(e=>{console.error(e);process.exitCode=1});
