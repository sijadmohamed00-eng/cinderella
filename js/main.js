// ═══════════════════════════════════════════════════
//  main.js — نقطة الإقلاع | سندريلا v4
//  آخر ملف يُحمَّل
// ═══════════════════════════════════════════════════

// ── سجل عمليات المدير ──
function addAdminLog(action, desc, data){
const logs=DB.get(‘adminLogs’)||[];
const now=new Date();
logs.unshift({id:genId(),action,desc,data,date:todayStr(),time:fmtT(now),ts:now.toISOString(),by:CU?.role===‘admin’?‘المدير’:(getEmp()?.name||‘موظف’)});
if(logs.length>500)logs.length=500;
DB.set(‘adminLogs’,logs);
}

function renderAdminLogs(){
const c=document.getElementById(‘adminLogsList’);if(!c)return;
let logs=DB.get(‘adminLogs’)||[];
const q=(document.getElementById(‘logsSearch’)?.value||’’).toLowerCase();
if(q)logs=logs.filter(l=>(l.desc||’’).toLowerCase().includes(q)||(l.action||’’).toLowerCase().includes(q));
if(!logs.length){c.innerHTML=’<div class="empty"><div class="ei">📝</div><p>لا توجد عمليات مسجلة</p></div>’;return;}
const icons={check_in:‘✅’,check_out:‘🚪’,salary_edit:‘💰’,bonus_add:‘🎁’,bonus_del:‘🗑️’,ded_add:‘📉’,ded_del:‘🗑️’,shift_edit:‘🕐’,emp_add:‘👤’,emp_del:‘🗑️’,leave_approve:‘✅’,leave_reject:‘❌’,att_delete:‘🗑️’,tg_token:‘🔑’,default:‘📝’};
c.innerHTML=logs.map(l=>` <div style="display:flex;align-items:flex-start;gap:10px;padding:10px 16px;border-bottom:1px solid rgba(255,255,255,.04)"> <div style="width:32px;height:32px;border-radius:8px;background:rgba(255,255,255,.06);display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0">${icons[l.action]||icons.default}</div> <div style="flex:1;min-width:0"> <div style="font-size:12px;font-weight:600">${l.desc}</div> <div style="font-size:10px;color:var(--t3);margin-top:2px">${fmtD(l.date)} — ${l.time} | ${l.by}</div> </div> </div>`).join(’’);
}

function clearAdminLogs(){
if(!confirm(‘مسح كل سجل العمليات؟’))return;
DB.del(‘adminLogs’);renderAdminLogs();showToast(‘تم المسح’,‘i’);
}

// ── حذف تسجيل حضور (للموظف) ──
function empDeleteLastAtt(){
const emp=getEmp();if(!emp)return;
const att=DB.get(‘att’)||[];
const myAtt=att.filter(a=>a.eid===emp.id).sort((a,b)=>new Date(b.ts)-new Date(a.ts));
if(!myAtt.length){showToast(‘لا يوجد تسجيل للحذف’,‘e’);return;}
const last=myAtt[0];
if(!confirm(`حذف آخر تسجيل؟\n${last.type==='ci'?'حضور':'انصراف'} — ${last.date} ${last.time}`))return;
DB.set(‘att’,att.filter(a=>a.id!==last.id));
updTodayStatus(emp.id);renderEmpHist(emp.id);renderDayGrid(emp.id);updAttBtns();
showToast(‘🗑️ تم الحذف’,‘i’);
}

function renderEmpLastAtt(){
const emp=getEmp();if(!emp)return;
const c=document.getElementById(‘empLastAttRecord’);if(!c)return;
const att=(DB.get(‘att’)||[]).filter(a=>a.eid===emp.id).sort((a,b)=>new Date(b.ts)-new Date(a.ts));
if(!att.length){c.innerHTML=’<p style="color:var(--t3);font-size:12px">لا يوجد تسجيل سابق</p>’;return;}
const last=att[0];
c.innerHTML=`<div style="background:rgba(233,69,96,.06);border:1px solid rgba(233,69,96,.2);border-radius:10px;padding:10px 12px;font-size:12px">
<div style="font-weight:700;margin-bottom:4px">${last.type===‘ci’?‘✅ آخر حضور’:‘🚪 آخر انصراف’}</div>
<div style="color:var(--t2)">${fmtD(last.date)} — ${last.time}</div>

  </div>`;
}

// ── حذف تسجيل حضور (المدير) ──
function adminDeleteAtt(attId){
if(!confirm(‘حذف هذا التسجيل نهائياً؟’))return;
const att=DB.get(‘att’)||[];
const rec=att.find(a=>a.id===attId);
if(!rec)return;
DB.set(‘att’,att.filter(a=>a.id!==attId));
addAdminLog(‘att_delete’,`حذف تسجيل ${rec.type==='ci'?'حضور':'انصراف'}: ${rec.ename}`,{date:rec.date,time:rec.time});
renderAdminAtt();renderAdmin();
showToast(‘🗑️ تم الحذف’,‘i’);
}

// ── رد الموظف على رسالة المدير ──
function empReplyToManager(){
const emp=getEmp();if(!emp)return;
const txt=document.getElementById(‘empReplyInput’)?.value.trim();
if(!txt){showToast(‘اكتب الرد أولاً’,‘e’);return;}
const msgs=DB.get(‘msg’)||[];
msgs.push({id:genId(),from:emp.name,eid:emp.id,type:‘reply’,text:txt,ts:new Date().toISOString(),date:todayStr()});
DB.set(‘msg’,msgs);
const inp=document.getElementById(‘empReplyInput’);if(inp)inp.value=’’;
renderEmpMessages(emp.id);
sendTg(`💬 رد من ${emp.name}:\n${txt}`);
showToast(‘✅ تم إرسال الرد’,‘s’);
}

// ── النسخ الاحتياطي التلقائي ──
function doAutoCloudBackup(){
if(!fbDB||!fbSyncEnabled){return;}
const backupKey=‘backup_’+todayStr();
const allData={};
SYNC_KEYS.forEach(k=>{const v=DB.get(k);if(v!==null)allData[k]=v;});
allData.backedUpAt=new Date().toISOString();
fbDB.ref(‘ccs_backups/’+backupKey).set(allData)
.then(()=>{DB.set(‘lastCloudBackup’,new Date().toISOString());showToast(‘☁️ نسخة احتياطية للسحابة’,‘s’);})
.catch(e=>console.error(‘Backup err:’,e));
}

// ── startTimers — المؤقتات المجدولة ──
function startTimers(){
startClock();
const t=setInterval(()=>{
const now=new Date();
const h=now.getHours(),mn=now.getMinutes(),sec=now.getSeconds();
if(sec!==0)return;
if(h===4&&mn===0){const key=‘rep_’+todayStr();if(!DB.get(key)){DB.set(key,1);const txt=buildReportText(‘auto’);sendTg(txt);saveReportToArchive(txt,‘auto’);showToast(‘📤 تم إرسال التقرير اليومي’,‘i’);}}
if(h===3&&mn===0){const key=‘prompt_’+todayStr();if(!DB.get(key)){DB.set(key,1);try{open3amPromptAuto();}catch(e){}}}
if(h===2&&mn===0){const key=‘bk_’+todayStr();if(!DB.get(key)){DB.set(key,1);doAutoCloudBackup();}}
if(h===6&&mn===0&&now.getDay()===5){const key=‘wkrp_’+todayStr();if(!DB.get(key)){DB.set(key,1);buildWeeklyReport();}}
try{_checkAndPushSchedule();}catch(e){}
},1000);
autoTimers.push(t);
}

// ── renderAdminAtt مع زر الحذف ──
function renderAdminAtt(){
const tb=document.getElementById(‘adminAttTable’);if(!tb)return;
const q=(document.getElementById(‘attSearch’)?.value||’’).toLowerCase();
const df=document.getElementById(‘attDate’)?.value||’’;
let att=DB.get(‘att’)||[];
if(q)att=att.filter(a=>(a.ename||’’).toLowerCase().includes(q));
if(df)att=att.filter(a=>a.date===df);
att.sort((a,b)=>new Date(b.ts)-new Date(a.ts));
tb.innerHTML=att.length?att.map(a=>{
const isCI=a.type===‘ci’;
const isEarlyOut=!isCI&&a.durMins&&a.durMins<240;
return `<tr ${isEarlyOut?'style="background:rgba(233,69,96,.04)"':''}> <td><div class="tname"><div class="eav">${(a.ename||'?')[0]}</div><span style="font-weight:600">${a.ename||'؟'}</span></div></td> <td>${isCI?'<span class="tag tp">✅ حضور</span>':isEarlyOut?'<span class="tag ta">🚪 انصراف مبكر</span>':'<span class="tag tc">🚪 انصراف</span>'}</td> <td>${fmtD(a.date)}</td> <td class="bold">${a.time}</td> <td><span class="tgrn bold">${a.dist!=null?a.dist+' م':'—'}</span></td> <td>${!isCI&&a.durMins?`<span style="color:${a.durMins<240?'var(--red)':'var(--green)'};font-size:11px;font-weight:700">${Math.floor(a.durMins/60)}س ${a.durMins%60}د</span>`:'—'}</td> <td><button class="btn btn-dn btn-sm btn-ic" onclick="adminDeleteAtt('${a.id}')" title="حذف البصمة">🗑️</button></td> </tr>`;
}).join(’’):`<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--t3)">لا توجد سجلات</td></tr>`;
}

// ── Badges الإشعارات ──
function updatePendingBadges(){
const leaves=(DB.get(‘leaveRequests’)||[]).filter(r=>r.status===‘pending’).length;
const loans=(DB.get(‘loanRequests’)||[]).filter(r=>r.status===‘pending’).length;
const total=leaves+loans;
[‘leaveBadge’,‘leaveNavBadge’].forEach(id=>{const el=document.getElementById(id);if(el){el.textContent=leaves||’’;el.style.display=leaves?‘flex’:‘none’;}});
[‘loanBadge’,‘loanNavBadge’].forEach(id=>{const el=document.getElementById(id);if(el){el.textContent=loans||’’;el.style.display=loans?‘flex’:‘none’;}});
const nb=document.getElementById(‘notifBadgeTotal’);if(nb){nb.textContent=total||’’;nb.style.display=total?‘flex’:‘none’;}
}

function _setBadge(id,count){
const el=document.getElementById(id);
if(!el)return;
el.textContent=count||’’;
el.setAttribute(‘data-v’,count||0);
el.style.display=count?‘flex’:‘none’;
}

// ── DOMContentLoaded Hooks ──
document.addEventListener(‘DOMContentLoaded’,()=>{
setTimeout(()=>{
try{renderShiftSchedule();}catch(e){}
try{renderShiftArchive();}catch(e){}
},2000);
setTimeout(()=>{
try{_reloadShifts();_restoreCustomShiftsDropdowns();}catch(e){}
try{renderShiftCards();}catch(e){}
},500);
});

window.addEventListener(‘load’,()=>{
console.log(‘✅ سندريلا PWA ready’);
});

// ── openShiftCustomBon ──
function openShiftCustomBon(){
try{document.querySelector(’#cbModal .mh h3’).textContent=‘🎯 حافز شفتات مخصص’;}catch(e){}
try{document.getElementById(‘cbReason’).placeholder=‘مثال: شفت ليلي إضافي…’;}catch(e){}
openModal(‘cbModal’);
}

// ═══════════════════════════════════════════════════
//  BOOT — يبدأ هنا
// ═══════════════════════════════════════════════════
initData();
startClock();

document.addEventListener(‘DOMContentLoaded’,()=>{
setTimeout(()=>{
try{
initFirebase(_REAL_FB_CFG);
}catch(e){
console.error(‘FB boot error:’,e);
}
// auto-login بعد ما Firebase يتصل ويجيب البيانات
setTimeout(tryAutoLogin, 1500);
},600);
});