/* Derived values: flight hours are always base hours + independent historical entries. */
(function(){
'use strict';
const sum=(a,k)=>a.reduce((n,x)=>n+(Number(x[k])||0),0);
function enrich(pilots,entries){
 const by={};entries.forEach(e=>{(by[e.indicatif]??=[]).push(e)});
 return pilots.map(p=>({...p,entries:by[p.indicatif]||[],loggedHours:sum(by[p.indicatif]||[],'hours'),currentHours:Number(p.previousHours||0)+sum(by[p.indicatif]||[],'hours'),exerciseCount:(by[p.indicatif]||[]).length}));
}
function aggregate(items,key,value){const out={};items.forEach(x=>{const k=x[key]||'Unspecified';out[k]=(out[k]||0)+(value?Number(x[value])||0:1)});return out}
function monthKey(date){return String(date||'').slice(0,7)}
function build(pilots,entries){
 const ps=enrich(pilots,entries),totalHours=ps.reduce((n,p)=>n+p.currentHours,0);
 const months=aggregate(entries.map(e=>({month:monthKey(e.date),hours:e.hours})),'month','hours');
 const byGroup=aggregate(ps,'group','currentHours'),byType=aggregate(entries,'exerciseType','hours'),byCategory=aggregate(entries,'exerciseCategory','hours');
 return {pilots:ps,totalHours,totalPilots:ps.length,activePilots:ps.filter(p=>p.status==='Active').length,totalExercises:entries.length,groups:[...new Set(ps.map(p=>p.group).filter(Boolean))].length,average:ps.length?totalHours/ps.length:0,months,byGroup,byType,byCategory,top:ps.slice().sort((a,b)=>b.currentHours-a.currentHours).slice(0,10)};
}
window.Analytics={enrich,build,aggregate,sum,monthKey};
})();