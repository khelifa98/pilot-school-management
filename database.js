/* IndexedDB persistence layer. Schema upgrades preserve all existing records. */
(function(){
'use strict';
const DB_NAME='pilot-school-management', DB_VERSION=1;
const STORES={pilots:'pilots',entries:'entries',exercises:'exercises',settings:'settings'};
let dbPromise;
function openDB(){
 if(dbPromise)return dbPromise;
 dbPromise=new Promise((resolve,reject)=>{
  const req=indexedDB.open(DB_NAME,DB_VERSION);
  req.onupgradeneeded=()=>{const db=req.result;
   if(!db.objectStoreNames.contains('pilots')){const s=db.createObjectStore('pilots',{keyPath:'indicatif'});s.createIndex('name','lastName');s.createIndex('group','group');}
   if(!db.objectStoreNames.contains('entries')){const s=db.createObjectStore('entries',{keyPath:'id',autoIncrement:true});s.createIndex('date','date');s.createIndex('indicatif','indicatif');}
   if(!db.objectStoreNames.contains('exercises'))db.createObjectStore('exercises',{keyPath:'id',autoIncrement:true});
   if(!db.objectStoreNames.contains('settings'))db.createObjectStore('settings',{keyPath:'key'});
  };
  req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);
 });
 return dbPromise;
}
async function tx(store,mode,work){
 const db=await openDB();
 return new Promise((resolve,reject)=>{
  const t=db.transaction(store,mode),s=t.objectStore(store);let result;
  try{result=work(s,t)}catch(e){reject(e);return}
  t.oncomplete=()=>resolve(result);t.onerror=()=>reject(t.error);t.onabort=()=>reject(t.error||new Error('Transaction aborted'));
 });
}
async function all(store){const db=await openDB();return new Promise((res,rej)=>{const r=db.transaction(store).objectStore(store).getAll();r.onsuccess=()=>res(r.result||[]);r.onerror=()=>rej(r.error)})}
async function get(store,key){const db=await openDB();return new Promise((res,rej)=>{const r=db.transaction(store).objectStore(store).get(key);r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})}
async function put(store,value){return tx(store,'readwrite',s=>s.put(value))}
async function del(store,key){return tx(store,'readwrite',s=>s.delete(key))}
async function clear(store){return tx(store,'readwrite',s=>s.clear())}
async function savePilot(p){
 const indicatif=String(p.indicatif||'').trim();
 if(!/^\d{3}$/.test(indicatif))throw Error('Indicatif must contain exactly 3 digits.');
 const old=await get('pilots',indicatif);
 if(!old && p._isEdit)throw Error('Pilot no longer exists.');
 const base={indicatif,firstName:String(p.firstName||'').trim(),lastName:String(p.lastName||'').trim(),category:p.category||'',group:String(p.group||'').trim(),previousHours:Number(p.previousHours||0),registrationDate:p.registrationDate||new Date().toISOString().slice(0,10),status:p.status||'Active'};
 if(!base.firstName||!base.lastName||!base.category||!base.group)throw Error('Complete all required pilot fields.');
 if(!Number.isFinite(base.previousHours)||base.previousHours<0)throw Error('Previous hours must be zero or greater.');
 if(old && !p._isEdit)throw Error('This indicatif is already registered.');
 if(old){base.createdAt=old.createdAt||Date.now()}else{base.createdAt=Date.now()}
 await put('pilots',base);return base;
}
async function saveEntry(e){
 const p=await get('pilots',String(e.indicatif));
 if(!p)throw Error('Pilot indicatif was not found.');
 const hours=Number(e.hours);
 if(!Number.isFinite(hours)||hours<=0||hours>24)throw Error('Flight hours must be greater than 0 and no more than 24.');
 if(!e.date||!e.exerciseType||!e.exerciseCategory)throw Error('Complete the date, exercise type and exercise category.');
 const entry={date:e.date,indicatif:p.indicatif,hours,exerciseType:e.exerciseType,exerciseCategory:e.exerciseCategory,remarks:String(e.remarks||'').trim(),createdAt:Date.now()};
 if(e.id)entry.id=Number(e.id);
 return tx('entries','readwrite',s=>s.put(entry));
}
async function saveExercise(e){
 const name=String(e.name||'').trim();if(!name)throw Error('Exercise name is required.');
 const item={name,type:String(e.type||'General').trim(),category:String(e.category||'Training').trim(),description:String(e.description||'').trim(),standardDuration:e.standardDuration===''||e.standardDuration==null?null:Number(e.standardDuration)};
 if(item.standardDuration!==null&&(!Number.isFinite(item.standardDuration)||item.standardDuration<0))throw Error('Standard duration must be zero or greater.');
 if(e.id)item.id=Number(e.id);
 return put('exercises',item);
}
async function snapshot(){
 const [pilots,entries,exercises,settings]=await Promise.all([all('pilots'),all('entries'),all('exercises'),all('settings')]);
 return {format:'pilot-school-backup',version:1,exportedAt:new Date().toISOString(),pilots,entries,exercises,settings};
}
async function restore(data){
 if(!data||data.format!=='pilot-school-backup'||!Array.isArray(data.pilots)||!Array.isArray(data.entries)||!Array.isArray(data.exercises))throw Error('Invalid backup file.');
 const seen=new Set();for(const p of data.pilots){if(!/^\d{3}$/.test(String(p.indicatif))||seen.has(String(p.indicatif)))throw Error('Backup contains invalid or duplicate pilot indicatifs.');seen.add(String(p.indicatif));}
 for(const e of data.entries){if(!seen.has(String(e.indicatif))||!Number.isFinite(Number(e.hours))||Number(e.hours)<=0)throw Error('Backup contains a flight entry with an invalid pilot or duration.');}
 const db=await openDB();
 return new Promise((resolve,reject)=>{
  const t=db.transaction(Object.values(STORES),'readwrite');
  for(const name of Object.values(STORES))t.objectStore(name).clear();
  for(const p of data.pilots)t.objectStore('pilots').put(p);
  for(const e of data.entries)t.objectStore('entries').put(e);
  for(const e of data.exercises)t.objectStore('exercises').put(e);
  for(const s of (data.settings||[]))t.objectStore('settings').put(s);
  t.oncomplete=resolve;t.onerror=()=>reject(t.error);t.onabort=()=>reject(t.error);
 });
}
window.DB={openDB,all,get,put,del,clear,savePilot,saveEntry,saveExercise,snapshot,restore};
})();