// ═══ main.js ═══
function addAdminLog(action, desc, data){
  const logs=DB.get('adminLogs')||[];
  const now=new Date();
  logs.unshift({
    id:genId(),action,desc,data,
    date:todayStr(),time:fmtT(now),ts:now.toISOString(),
    by:CU?.role==='admin'?'المدير':(getEmp()?.name||'موظف')
  });
  if(logs.length>500)logs.length=500;
  DB.set('adminLogs',logs);
}
function renderAdminLogs(){
  const c=document.getElementById('adminLogsList');if(!c)return;
  let logs=DB.get('adminLogs')||[];
  const q=(document.getElementById('logsSearch')?.value||'').toLowerCase();
  if(q)logs=logs.filter(l=>(l.desc||'').toLowerCase().includes(q)||(l.action||'').toLowerCase().includes(q));
  if(!logs.length){c.innerHTML='<div class="empty"><div class="ei">📝</div><p>لا توجد عمليات مسجلة</p></div>';return;}
  const icons={check_in:'✅',check_out:'🚪',salary_edit:'💰',bonus_add:'🎁',bonus_del:'🗑️',ded_add:'📉',ded_del:'🗑️',shift_edit:'🕐',emp_add:'👤',emp_del:'🗑️',leave_approve:'✅',leave_reject:'❌',att_delete:'🗑️',tg_token:'🔑',default:'📝'};
  c.innerHTML=logs.map(l=>`
    <div style="display:flex;align-items:flex-start;gap:10px;padding:10px 16px;border-bottom:1px solid rgba(255,255,255,.04)">
      <div style="width:32px;height:32px;border-radius:8px;background:rgba(255,255,255,.06);display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0">${icons[l.action]||icons.default}</div>
      <div style="flex:1;min-width:0">
        <div style="font-size:12px;font-weight:600">${l.desc}</div>
        <div style="font-size:10px;color:var(--t3);margin-top:2px">${fmtD(l.date)} — ${l.time} | ${l.by}</div>
      </div>
    </div>`).join('');
}
function clearAdminLogs(){
  if(!confirm('مسح كل سجل العمليات؟'))return;
  DB.del('adminLogs');renderAdminLogs();showToast('تم المسح','i');
}

// ── حذف تسجيل حضور (للموظف) ──
function empDeleteLastAtt(){
function adminDeleteAtt(attId){
  if(!confirm('حذف هذا التسجيل نهائياً؟'))return;
  const att=DB.get('att')||[];
  const rec=att.find(a=>a.id===attId);
  if(!rec)return;
  DB.set('att',att.filter(a=>a.id!==attId));
  addAdminLog('att_delete',`حذف تسجيل ${rec.type==='ci'?'حضور':'انصراف'}: ${rec.ename}`,{date:rec.date,time:rec.time});
  renderAdminAtt();renderAdmin();
  showToast('🗑️ تم الحذف','i');
}

// ── رد الموظف على رسالة المدير ──
function empReplyToManager(){
function renderAdminLogs(){
  const c=document.getElementById('adminLogsList');if(!c)return;
  let logs=DB.get('adminLogs')||[];
  const q=(document.getElementById('logsSearch')?.value||'').toLowerCase();
  if(q)logs=logs.filter(l=>(l.desc||'').toLowerCase().includes(q)||(l.action||'').toLowerCase().includes(q));
  if(!logs.length){c.innerHTML='<div class="empty"><div class="ei">📝</div><p>لا توجد عمليات مسجلة</p></div>';return;}
  const icons={check_in:'✅',check_out:'🚪',salary_edit:'💰',bonus_add:'🎁',bonus_del:'🗑️',ded_add:'📉',ded_del:'🗑️',shift_edit:'🕐',emp_add:'👤',emp_del:'🗑️',leave_approve:'✅',leave_reject:'❌',att_delete:'🗑️',tg_token:'🔑',default:'📝'};
  c.innerHTML=logs.map(l=>`
    <div style="display:flex;align-items:flex-start;gap:10px;padding:10px 16px;border-bottom:1px solid rgba(255,255,255,.04)">
      <div style="width:32px;height:32px;border-radius:8px;background:rgba(255,255,255,.06);display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0">${icons[l.action]||icons.default}</div>
      <div style="flex:1;min-width:0">
        <div style="font-size:12px;font-weight:600">${l.desc}</div>
        <div style="font-size:10px;color:var(--t3);margin-top:2px">${fmtD(l.date)} — ${l.time} | ${l.by}</div>
      </div>
    </div>`).join('');
}
function clearAdminLogs(){
  if(!confirm('مسح كل سجل العمليات؟'))return;
  DB.del('adminLogs');renderAdminLogs();showToast('تم المسح','i');
}

// ── حذف تسجيل حضور (للموظف) ──
function empDeleteLastAtt(){
function doAutoCloudBackup(){
  if(!fbDB||!fbSyncEnabled){
    // Fallback: export JSON locally
    exportData();
    return;
  }
  const backupKey='backup_'+todayStr();
  const allData={};
  SYNC_KEYS.forEach(k=>{const v=DB.get(k);if(v!==null)allData[k]=v;});
  allData.backedUpAt=new Date().toISOString();
  fbDB.ref('ccs_backups/'+backupKey).set(allData)
    .then(()=>{
      DB.set('lastCloudBackup',new Date().toISOString());
      showToast('☁️ نسخة احتياطية للسحابة — 4 صباحاً','s');
    })
    .catch(e=>console.error('Backup err:',e));
}

function startTimers(){
  startClock();
  // فحص كل دقيقة للمهام المجدولة
  const t=setInterval(()=>{
    const now=new Date();
    const h=now.getHours(), mn=now.getMinutes(), sec=now.getSeconds();
    if(sec!==0)return;
    // تقرير يومي 4:00 صباحاً
    if(h===4&&mn===0){
      const key='rep_'+todayStr();
      if(!DB.get(key)){DB.set(key,1);const txt=buildReportText('auto');sendTg(txt);saveReportToArchive(txt,'auto');showToast('📤 تم إرسال التقرير اليومي','i');}
    }
    // استفسار 3:00 صباحاً
    if(h===3&&mn===0){
      const key='prompt_'+todayStr();
      if(!DB.get(key)){DB.set(key,1);open3amPromptAuto();}
    }
    // نسخ احتياطية للسحابة 2:00 صباحاً
    if(h===2&&mn===0){
      const key='bk_'+todayStr();
      if(!DB.get(key)){DB.set(key,1);doAutoCloudBackup();}
    }
    // التقرير الأسبوعي جمعة 6:00 ص
    if(h===6&&mn===0&&now.getDay()===5){
      const key='wkrp_'+todayStr();
      if(!DB.get(key)){DB.set(key,1);buildWeeklyReport();}
    }
  },1000);
  autoTimers.push(t);
}

// renderAdmin patching removed - new renders integrated directly

// Override renderAdminAtt to include delete button
const _origRenderAdminAtt=renderAdminAtt;
function renderAdminAtt(){
  const tb=document.getElementById('adminAttTable');if(!tb)return;
  const q=(document.getElementById('attSearch')?.value||'').toLowerCase();
  const df=document.getElementById('attDate')?.value||'';
  let att=DB.get('att')||[];
  if(q)att=att.filter(a=>(a.ename||'').toLowerCase().includes(q));
  if(df)att=att.filter(a=>a.date===df);
  att.sort((a,b)=>new Date(b.ts)-new Date(a.ts));
  // تلوين الانصرافات المبكرة (أقل من 4 ساعات)
  tb.innerHTML=att.length?att.map(a=>{
    const isCI=a.type==='ci';
    const isEarlyOut=!isCI&&a.durMins&&a.durMins<240;
    return `<tr ${isEarlyOut?'style="background:rgba(233,69,96,.04)"':''}>
      <td><div class="tname"><div class="eav">${(a.ename||'?')[0]}</div><span style="font-weight:600">${a.ename||'؟'}</span></div></td>
      <td>${isCI?'<span class="tag tp">✅ حضور</span>':isEarlyOut?'<span class="tag ta">🚪 انصراف مبكر</span>':'<span class="tag tc">🚪 انصراف</span>'}</td>
      <td>${fmtD(a.date)}</td>
      <td class="bold">${a.time}</td>
      <td><span class="tgrn bold">${a.dist!=null?a.dist+' م':'—'}</span></td>
      <td>${!isCI&&a.durMins?`<span style="color:${a.durMins<240?'var(--red)':'var(--green)'};font-size:11px;font-weight:700">${Math.floor(a.durMins/60)}س ${a.durMins%60}د</span>`:'—'}</td>
      <td><button class="btn btn-dn btn-sm btn-ic" onclick="adminDeleteAtt('${a.id}')" title="حذف البصمة">🗑️</button></td>
    </tr>`;
  }).join(''):`<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--t3)">لا توجد سجلات</td></tr>`;
}

// logging integrated directly in saveSal, addBonD, addDedD, deleteEmp above



// ══════════════════════════════════════════════════════
//  SUB-ADMIN SYSTEM — نظام المديرين الفرعيين
// ══════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════
//  HOOK: render loans tab in showATab + showETab
// ══════════════════════════════════════════════════════
// showATab loans/sh hooks integrated in original above

// showETab loan hook integrated directly above

// Add loanRequests to sync keys
// loanRequests and shiftArchives already in SYNC_KEYS above

// loan badge integrated directly in renderAdmin above
// renderEmpLoanHistory integrated in showETab and loadEmpScreen directly

// Initialize shift schedule on first load of sh tab
document.addEventListener('DOMContentLoaded',()=>{
  setTimeout(()=>{
    try{renderShiftSchedule();}catch(e){}
    try{renderShiftArchive();}catch(e){}
  },2000);
});

  window.addEventListener('load',()=>{
    console.log('PWA ready');
  });

// ══════════════════════════════════════════════════════
//  PENDING BADGES — أرقام الإشعارات على الخانات
// ══════════════════════════════════════════════════════
function updatePendingBadges(){
// ── Hook: add _checkAndPushSchedule to timer ──
const _origStartTimers=window.startTimers;
window.startTimers=function(){
  _origStartTimers&&_origStartTimers();
  setInterval(()=>{try{_checkAndPushSchedule();}catch(e){}},60000);
};

// ── Hook: restore custom shifts on load ──
document.addEventListener('DOMContentLoaded',()=>{
  setTimeout(()=>{
    try{_reloadShifts();_restoreCustomShiftsDropdowns();}catch(e){}
    try{renderShiftCards();}catch(e){}
  },500);
});


function openShiftCustomBon(){

// ═══════════════════════════════════════════════════
//  BOOT
// ═══════════════════════════════════════════════════
initData();
startClock();
// Firebase sync init
document.addEventListener('DOMContentLoaded',()=>{
  setTimeout(()=>{
    try{ initFirebase(_REAL_FB_CFG); }catch(e){ console.error('FB boot:',e); }
  },600);
});
// Try auto-login (remember me)
window.addEventListener('DOMContentLoaded',()=>{
  setTimeout(tryAutoLogin,100);
});



// ══════════════════════════════════════════════════════
//  NEW FEATURES v3 — الميزات الجديدة
