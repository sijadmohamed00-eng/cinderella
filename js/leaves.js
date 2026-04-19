// ═══ leaves.js ═══
function empReplyToManager(){
  const emp=getEmp();if(!emp)return;
  const text=document.getElementById('empReplyText').value.trim();
  if(!text){showToast('اكتب ردك أولاً','e');return;}
  const now=new Date();
  const reply={id:genId(),eid:emp.id,ename:emp.name,type:'reply',text,date:todayStr(),time:fmtT(now),ts:now.toISOString()};
  const msgs=DB.get('msg')||[];msgs.push(reply);DB.set('msg',msgs);
  sendTg(`↩️ رد من موظف\n👤 ${emp.name}\n💬 ${text}\n🕐 ${fmtT(now)}`);
  playNotifSound('msg');
  document.getElementById('empReplyText').value='';
  showToast('✅ تم إرسال ردك للمدير','s');
}

// ── طلبات الإجازة ──
function submitLeaveRequest(){
  const emp=getEmp();if(!emp)return;
  const type=document.getElementById('leaveTypeEmp').value;
  const date=document.getElementById('leaveDateEmp').value;
  const reason=document.getElementById('leaveReasonEmp').value.trim();
  if(!date){showToast('اختر التاريخ','e');return;}
  const req={id:genId(),eid:emp.id,ename:emp.name,type,date,reason,status:'pending',ts:new Date().toISOString(),requestedAt:fmtT(new Date())};
  const leaves=DB.get('leaveRequests')||[];leaves.push(req);DB.set('leaveRequests',leaves);
  sendTg(`🌴 طلب إجازة جديد\n👤 ${emp.name}\nالنوع: ${type}\nالتاريخ: ${fmtD(date)}\nالسبب: ${reason||'—'}`);
  playNotifSound('msg');
  document.getElementById('leaveDateEmp').value='';document.getElementById('leaveReasonEmp').value='';
  renderEmpLeaveHistory();
  showToast('✅ تم إرسال طلب الإجازة للمدير','s');
}
function renderEmpLeaveHistory(){
  const c=document.getElementById('empLeaveHistory');if(!c)return;
  const emp=getEmp();if(!emp){c.innerHTML='';return;}
  const leaves=(DB.get('leaveRequests')||[]).filter(r=>r.eid===emp.id).sort((a,b)=>new Date(b.ts)-new Date(a.ts));
  if(!leaves.length){c.innerHTML='<div class="empty"><div class="ei">🌴</div><p>لا توجد طلبات</p></div>';return;}
  const statusMap={pending:'⏳ انتظار',approved:'✅ موافق',rejected:'❌ مرفوض'};
  const colMap={pending:'var(--gold)',approved:'var(--green)',rejected:'var(--red)'};
  c.innerHTML=leaves.map(r=>`
    <div style="background:var(--bg3);border:1px solid var(--br);border-radius:12px;padding:12px;margin-bottom:8px">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px">
        <div><div style="font-size:13px;font-weight:700">${r.type} — ${fmtD(r.date)}</div>
        <div style="font-size:11px;color:var(--t3);margin-top:2px">${r.reason||''}</div></div>
        <span style="font-size:11px;font-weight:700;color:${colMap[r.status]}">${statusMap[r.status]}</span>
      </div>
      ${r.adminNote?`<div style="font-size:11px;color:var(--t2);margin-top:6px;padding-top:6px;border-top:1px solid rgba(255,255,255,.06)">📝 المدير: ${r.adminNote}</div>`:''}
    </div>`).join('');
}
function renderLeaveRequests(){
  // Pending
  const pending=document.getElementById('leavePendingList');
  const archived=document.getElementById('leaveArchivedList');
  const cntEl=document.getElementById('leavePendingCount');
  const all=DB.get('leaveRequests')||[];
  const pend=all.filter(r=>r.status==='pending').sort((a,b)=>new Date(b.ts)-new Date(a.ts));
  const done=all.filter(r=>r.status!=='pending').sort((a,b)=>new Date(b.ts)-new Date(a.ts));
  if(cntEl)cntEl.textContent=pend.length;
  if(pending){
    pending.innerHTML=pend.length?pend.map(r=>`
      <div style="background:var(--bg3);border:1px solid rgba(240,192,64,.2);border-radius:12px;padding:14px;margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px">
          <div><div style="font-size:14px;font-weight:700">👤 ${r.ename}</div>
          <div style="font-size:12px;color:var(--t2);margin-top:4px">${r.type} — ${fmtD(r.date)}</div>
          <div style="font-size:11px;color:var(--t3);margin-top:2px">${r.reason||'—'}</div></div>
          <div class="flex g8">
            <button class="btn btn-ok btn-sm" onclick="respondLeave('${r.id}','approved')">✅ موافقة</button>
            <button class="btn btn-dn btn-sm" onclick="respondLeave('${r.id}','rejected')">❌ رفض</button>
          </div>
        </div>
      </div>`).join(''):'<div class="empty"><div class="ei">🌴</div><p>لا توجد طلبات معلقة</p></div>';
  }
  if(archived){
    const statusMap={approved:'✅ موافق',rejected:'❌ مرفوض'};
    const colMap={approved:'var(--green)',rejected:'var(--red)'};
    archived.innerHTML=done.length?done.map(r=>`
      <div style="background:var(--bg3);border:1px solid var(--br);border-radius:10px;padding:12px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px">
        <div><div style="font-size:13px;font-weight:600">${r.ename} — ${r.type} — ${fmtD(r.date)}</div>
        <div style="font-size:11px;color:var(--t3)">${r.reason||''}</div></div>
        <span style="font-size:12px;font-weight:700;color:${colMap[r.status]}">${statusMap[r.status]}</span>
      </div>`).join(''):'<div class="empty"><div class="ei">📋</div><p>لا توجد طلبات منتهية</p></div>';
  }
}
function respondLeave(id,status){
  const leaves=DB.get('leaveRequests')||[];
  const i=leaves.findIndex(r=>r.id===id);if(i===-1)return;
  leaves[i].status=status;leaves[i].respondedAt=fmtT(new Date());
  DB.set('leaveRequests',leaves);
  const r=leaves[i];
  // إضافة إجازة تلقائياً إذا وافق
  if(status==='approved'){
    const emps=DB.get('emps')||[];
    const ei=emps.findIndex(e=>e.id===r.eid);
    if(ei!==-1){
      const per=getPeriod();const lvKey='lvM';
      emps[ei][lvKey]=(emps[ei][lvKey]||0)+1;
      DB.set('emps',emps);
    }
    sendTg(`✅ تمت الموافقة على إجازة ${r.ename}\nالتاريخ: ${fmtD(r.date)}`);
  } else {
    sendTg(`❌ تم رفض طلب إجازة ${r.ename}\nالتاريخ: ${fmtD(r.date)}`);
  }
  addAdminLog('leave_'+status,`${status==='approved'?'موافقة':'رفض'} إجازة ${r.ename}`,{date:r.date});
  renderLeaveRequests();renderAdmin();updatePendingBadges();
  showToast(status==='approved'?'✅ تمت الموافقة':'❌ تم الرفض','s');
}

// ── جدول الغد ──
function renderTomorrowSchedule(){
function _populateLeaveMgmt(){
  const sel=document.getElementById('leaveMgmtEmp');
  const fsel=document.getElementById('leaveMgmtFilter');
  const emps=DB.get('emps')||[];
  if(sel)sel.innerHTML=emps.map(e=>`<option value="${e.id}">${e.name}</option>`).join('');
  if(fsel&&fsel.options.length<=1)emps.forEach(e=>{const o=document.createElement('option');o.value=e.id;o.textContent=e.name;fsel.appendChild(o);});
}

function addLeaveDayAdmin(){
  const eid=document.getElementById('leaveMgmtEmp')?.value;
  const date=document.getElementById('leaveMgmtDate')?.value;
  const paid=document.getElementById('leaveMgmtPaid')?.checked!==false;
  if(!eid||!date){showToast('اختر الموظف والتاريخ','e');return;}
  const emps=DB.get('emps')||[];
  const emp=emps.find(e=>e.id===eid);
  if(!emp)return;
  let leaves=DB.get('leaveDays')||[];
  if(leaves.some(l=>l.eid===eid&&l.date===date)){showToast('هذا اليوم مسجل مسبقاً','e');return;}
  // الإجازة المدفوعة تُحتسب كيوم واحد فقط (من leaveDays) — لا تُضاف لـ lvM لتجنب الحساب المزدوج
  leaves.push({id:genId(),eid,ename:emp.name,date,paid,addedAt:new Date().toISOString()});
  DB.set('leaveDays',leaves);
  // lvM للإجازات المطلوبة من الموظف نفسه فقط — هنا المدير يضيفها مباشرة بدون lvM
  addAdminLog('leave_add',`إجازة ${paid?'مدفوعة':'غير مدفوعة'}: ${emp.name} — ${date}`,{eid,date});
  showToast(`✅ تم تسجيل إجازة ${emp.name} — ${fmtD(date)}`,'s');
  renderLeaveMgmtList();
  renderAdmin();
}

function renderLeaveMgmtList(){
  const c=document.getElementById('leaveMgmtList');if(!c)return;
  let leaves=DB.get('leaveDays')||[];
  const ef=document.getElementById('leaveMgmtFilter')?.value||'';
  if(ef)leaves=leaves.filter(l=>l.eid===ef);
  leaves.sort((a,b)=>b.date.localeCompare(a.date));
  if(!leaves.length){c.innerHTML='<div class="empty"><div class="ei">🌴</div><p>لا توجد إجازات</p></div>';return;}
  c.innerHTML=leaves.map(l=>`
    <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid rgba(255,255,255,.04);flex-wrap:wrap;gap:6px">
      <div style="display:flex;align-items:center;gap:8px">
        <div class="eav">${(l.ename||'?')[0]}</div>
        <div>
          <div style="font-size:13px;font-weight:700">${l.ename}</div>
          <div style="font-size:11px;color:var(--t3)">${fmtD(l.date)}</div>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:8px">
        <span style="font-size:11px;padding:3px 8px;border-radius:6px;${l.paid?'background:rgba(0,230,118,.1);color:var(--green)':'background:rgba(233,69,96,.1);color:var(--red)'}">${l.paid?'✅ مدفوعة':'❌ غير مدفوعة'}</span>
        <button class="btn btn-dn btn-sm btn-ic" onclick="deleteLeaveDay('${l.id}')">🗑️</button>
      </div>
    </div>`).join('');
}

function deleteLeaveDay(id){
  let leaves=DB.get('leaveDays')||[];
  const lv=leaves.find(l=>l.id===id);
  if(!lv)return;
  // إزالة من lvM إذا كانت مدفوعة
  if(lv.paid){
    const emps=DB.get('emps')||[];
    const ei=emps.findIndex(e=>e.id===lv.eid);
    if(ei!==-1&&emps[ei].lvM>0){emps[ei].lvM--;DB.set('emps',emps);}
  }
  leaves=leaves.filter(l=>l.id!==id);
  DB.set('leaveDays',leaves);
  renderLeaveMgmtList();
  renderAdmin();
  showToast('تم حذف الإجازة','i');
}

// ══════════════════════════════════════════════════════
//  EMPLOYEE PHOTO — صورة الموظف
// ══════════════════════════════════════════════════════
function openPhotoUpload(){
function check9amAbsent(){
  const now=new Date();
  const h=now.getHours(),mn=now.getMinutes();
  if(h!==9||mn>5)return;
  const today=todayStr();
  const key='absent9_'+today;
  if(DB.get(key))return;
  DB.set(key,1);
  _absentAlertShown=false;
  const emps=DB.get('emps')||[];
  const att=DB.get('att')||[];
  const leaveDays=DB.get('leaveDays')||[];
  const notCheckedIn=emps.filter(e=>{
    const hasCi=att.some(a=>a.eid===e.id&&a.date===today&&a.type==='ci');
    const onLeave=leaveDays.some(l=>l.eid===e.id&&l.date===today);
    return !hasCi&&!onLeave;
  });
  if(!notCheckedIn.length)return;
  // فتح موديل السؤال
  const modal=document.getElementById('absentAlertModal');
  if(!modal)return;
  document.getElementById('absentAlertList').innerHTML=notCheckedIn.map(e=>`
    <div style="background:var(--bg3);border:1px solid var(--br);border-radius:10px;padding:12px;margin-bottom:8px">
      <div style="font-size:14px;font-weight:700;margin-bottom:8px">👤 ${e.name}</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-dn btn-sm" onclick="markAbsent9('${e.id}')">❌ غائب (يُخصم)</button>
        <button class="btn btn-ok btn-sm" onclick="markLeave9('${e.id}','paid')">🌴 مجاز مدفوع</button>
        <button class="btn btn-sc btn-sm" onclick="markLeave9('${e.id}','unpaid')">🌴 مجاز بدون يومية</button>
        <button class="btn btn-wa btn-sm" onclick="skipAlert9('${e.id}')">⏭️ تخطي</button>
      </div>
    </div>`).join('');
  openModal('absentAlertModal');
}

function markAbsent9(eid){
  // غائب — لا حاجة لإجراء، الغياب محسوب تلقائياً
  const emps=DB.get('emps')||[];
  const emp=emps.find(e=>e.id===eid);
  addAdminLog('absent_marked',`تأكيد غياب: ${emp?.name||eid}`,{eid,date:todayStr()});
  _removeAbsent9Row(eid);
  showToast(`❌ تم تسجيل غياب ${emp?.name}`,'i');
  renderAdmin();
}

function markLeave9(eid,type){
  const emps=DB.get('emps')||[];
  const emp=emps.find(e=>e.id===eid);if(!emp)return;
  const today=todayStr();
  let leaves=DB.get('leaveDays')||[];
  if(!leaves.some(l=>l.eid===eid&&l.date===today)){
    const paid=type==='paid';
    leaves.push({id:genId(),eid,ename:emp.name,date:today,paid,addedAt:new Date().toISOString()});
    DB.set('leaveDays',leaves);
    if(paid){
      const ei=emps.findIndex(e=>e.id===eid);
      if(ei!==-1){emps[ei].lvM=(emps[ei].lvM||0)+1;DB.set('emps',emps);}
    }
  }
  addAdminLog('leave_9am',`إجازة من تنبيه 9ص: ${emp.name} — ${type==='paid'?'مدفوعة':'بدون يومية'}`,{eid});
  _removeAbsent9Row(eid);
  showToast(`🌴 تم تسجيل إجازة ${emp.name}`,'s');
  renderAdmin();
}

function skipAlert9(eid){_removeAbsent9Row(eid);}

function _removeAbsent9Row(eid){
  const row=document.querySelector(`#absentAlertList [onclick*="${eid}"]`);
  if(row){const parent=row.closest('div[style*="border-radius:10px"]');if(parent)parent.remove();}
  const list=document.getElementById('absentAlertList');
  if(list&&!list.children.length)closeModal('absentAlertModal');
}

// ══════════════════════════════════════════════════════
//  NEW SALES — إحصائيات المبيعات الجديدة (فيس/انستا/واتساب)
// ══════════════════════════════════════════════════════
function openAddSaleNew(){
