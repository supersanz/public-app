'use strict';
(function(root){
 const namespace='record-myself-cloud-v1:';
 function valid(value){return !!value&&typeof value==='object'&&!Array.isArray(value)&&Array.isArray(value.logs);}
 // Firestore rejects arrays directly nested inside arrays. Wrap only those arrays.
 function encode(value,inArray=false){
  if(Array.isArray(value)){const items=value.map(item=>encode(item,true));return inArray?{__questNestedArrayV1:items}:items;}
  if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,encode(item,false)]));
  return value;
 }
 function decode(value){
  if(Array.isArray(value))return value.map(decode);
  if(value&&typeof value==='object'){
   if(Object.keys(value).length===1&&Array.isArray(value.__questNestedArrayV1))return value.__questNestedArrayV1.map(decode);
   return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,decode(item)]));
  }
  return value;
 }
 function createStore({uid,storage,remote,status=()=>{},delay=15000}){
  const key=namespace+uid; let record=null,timer=null,inflight=null,blocked=false;
  function cache(){storage.setItem(key,JSON.stringify(record));}
  function readCache(){try{return JSON.parse(storage.getItem(key)||'null')}catch{return null}}
  async function load(){
   const local=readCache(),server=await remote.read();
   if(local?.dirty&&valid(local.data)){
    record=local;
    if(local.revision!==(server?.revision||0)){blocked=true;status('conflict');throw Object.assign(new Error('conflict'),{code:'conflict'});}
   }else record={data:server?.data||null,revision:server?.revision||0,dirty:false};
   cache();return record.data;
  }
  function save(value){
   if(blocked)throw Object.assign(new Error('conflict'),{code:'conflict'});
   if(!valid(value))throw new Error('invalid-save');
   const copy=JSON.parse(JSON.stringify(value));
   if(new TextEncoder().encode(JSON.stringify(copy)).length>750000)throw new Error('save-too-large');
   const previous=record;
   record={data:copy,revision:record?.revision||0,dirty:true};
   try{cache()}catch(e){record=previous;throw e}
   status('pending');if(!timer)timer=setTimeout(()=>{timer=null;flush().catch(()=>{});},delay);
  }
  async function flush(){
   if(inflight){await inflight;if(record?.dirty)return flush();return;}
   if(blocked)throw Object.assign(new Error('conflict'),{code:'conflict'});
   if(!record?.dirty)return;
   clearTimeout(timer);timer=null;
   const snapshot=JSON.stringify(record.data),revision=record.revision;
   status('saving');
   inflight=(async()=>{
    try{
     const next=await remote.write(JSON.parse(snapshot),revision);
     record.revision=next;record.dirty=JSON.stringify(record.data)!==snapshot;cache();
     status(record.dirty?'pending':'saved');
    }catch(e){if(e.code==='conflict'){blocked=true;status('conflict')}else status('error');throw e}
   })();
   try{await inflight}finally{inflight=null}
  }
  function backup(){return JSON.stringify(record||readCache(),null,2);}
  function discardLocal(){storage.removeItem(key);}
  return {load,save,flush,backup,discardLocal,get dirty(){return !!record?.dirty}};
 }
 root.QuestCloudStore={createStore,valid,encode,decode};
 if(typeof module!=='undefined')module.exports=root.QuestCloudStore;
})(globalThis);
