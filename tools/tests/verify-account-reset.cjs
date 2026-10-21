const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const text=fs.readFileSync('scripts/developer-controls.js','utf8');
const reset=text.slice(text.indexOf('async function resetDeveloperRewards(){'),text.indexOf('\nfunction setDeveloperStrongWeek'));
async function check({confirm=true,fail=false,cloud=true}={}){
 const values=new Map([['legacy','old'],['other-app','keep']]);let written,reloaded=false;
 const context={confirm:()=>confirm,window:{},KEY:'main',localStorage:{setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)},document:{getElementById:()=>({textContent:JSON.stringify({legacyKey:'main',legacyKeys:['legacy']})})},location:{pathname:'/',replace:()=>reloaded=true},console:{error(){}},toast(){}};
 if(cloud)context.window.QuestAccountStorage={async reset(v){if(fail)throw Error('offline');written=v;}};
 vm.createContext(context);vm.runInContext(reset,context);const result=await context.resetDeveloperRewards();
 return {result,values,written,reloaded};
}
(async()=>{
 let r=await check();assert(r.result&&r.reloaded);assert.equal(r.written.logs.length,0);assert.equal(r.written.walkExp,0);assert.equal(r.written.questProfile,undefined);assert(!r.values.has('legacy'));assert.equal(r.values.get('other-app'),'keep');
 r=await check({confirm:false});assert(!r.result&&!r.reloaded&&!r.written);assert.equal(r.values.get('legacy'),'old');
 r=await check({fail:true});assert(!r.result&&!r.reloaded);assert.equal(r.values.get('legacy'),'old');
 r=await check({cloud:false});assert(r.result&&r.reloaded);assert.equal(JSON.parse(r.values.get('main')).logs.length,0);
 const {createStore}=require('../../scripts/cloud-store.js');
 console.log('PASS reset: cloud, local, cancellation, failure and unrelated storage preservation');
})().catch(e=>{console.error(e);process.exitCode=1});

