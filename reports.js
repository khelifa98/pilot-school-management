/* CSV, JSON backup and printable report helpers. */
(function(){
'use strict';
function csv(rows,columns){
 const esc=v=>'"'+String(v??'').replace(/"/g,'""')+'"';
 const lines=[columns.map(c=>esc(c.label)).join(',')];
 rows.forEach(r=>lines.push(columns.map(c=>esc(typeof c.value==='function'?c.value(r):r[c.key])).join(',')));
 download(new Blob(['\ufeff'+lines.join('\r\n')],{type:'text/csv;charset=utf-8'}),'pilot-school-export.csv');
}
function download(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function json(data){download(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),'pilot-school-backup-'+new Date().toISOString().slice(0,10)+'.json')}
function print(){window.print()}
window.Reports={csv,download,json,print};
})();