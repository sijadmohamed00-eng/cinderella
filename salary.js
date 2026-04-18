// ═══ shifts.js ═══
function renderTomorrowSchedule(){
  // تم استبدال جدول الغد بجدول الأسبوع الكامل
  try{renderShiftSchedule();renderShiftArchive();}catch(e){}
}

// ── تصدير Excel للحضور ──
function exportAttExcel(){
  const att=DB.get('att')||[];
function getDailyShifts(){return DB.get('dailyShifts')||{};}
function saveDailyShift(empId,dateStr,sh,customFrom,customTo){
  const ds=getDailyShifts();
  ds[empId+'_'+dateStr]={sh,customFrom:customFrom||'',customTo:customTo||''};
  DB.set('dailyShifts',ds);
}
function getEmpShiftForDay(emp,dateStr){
  const ds=getDailyShifts();
  const k=emp.id+'_'+dateStr;
  if(ds[k])return ds[k];
  return{sh:emp.sh,customFrom:emp.customFrom||'',customTo:emp.customTo||''};
}

function renderShiftSchedule(){
  const c=document.getElementById('shiftScheduleGrid'); if(!c)return;
  const offset=parseInt(document.getElementById('shWeekOffset')?.value||'0');
  const emps=DB.get('emps')||[];
  const days=[];
  for(let i=0;i<7;i++){
    const d=new Date(); d.setDate(d.getDate()+offset+i);
    days.push(d);
  }
  const dayNames=['أحد','إثنين','ثلاثاء','أربعاء','خميس','جمعة','سبت'];
  const todayStr2=todayStr();
  let html=`<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:12px">
    <thead><tr>
      <th style="text-align:right;padding:8px 10px;color:var(--t3);border-bottom:1px solid var(--br);white-space:nowrap;min-width:90px">الموظف</th>
      ${days.map(d=>{
        const ds=d.toISOString().split('T')[0];
        const isToday=ds===todayStr2;
        return `<th style="text-align:center;padding:8px 6px;border-bottom:1px solid var(--br);white-space:nowrap;min-width:110px;${isToday?'background:rgba(0,229,255,.06)':''}">
          <div style="font-size:10px;color:${isToday?'var(--cyan)':'var(--t3)'};">${dayNames[d.getDay()]}</div>
          <div style="font-weight:800;color:${isToday?'var(--cyan)':'var(--t1)'}">${d.getDate()}/${d.getMonth()+1}</div>
          ${isToday?'<div style="font-size:9px;color:var(--cyan)">اليوم</div>':''}
        </th>`;
      }).join('')}
    </tr></thead>
    <tbody>
    ${emps.map(e=>`<tr>
      <td style="padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.04)">
        <div style="display:flex;align-items:center;gap:6px">
          <div style="width:26px;height:26px;border-radius:50%;background:linear-gradient(135deg,var(--gold),var(--gold2));display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;color:#1a1200;flex-shrink:0">${e.name[0]}</div>
          <span style="font-weight:600;font-size:11px;white-space:nowrap">${e.name}</span>
        </div>
      </td>
      ${days.map(d=>{
        const ds=d.toISOString().split('T')[0];
        const isToday=ds===todayStr2;
        const dayShift=getEmpShiftForDay(e,ds);
        const sh=SHIFTS[dayShift.sh]||{};
        const from=dayShift.sh==='custom'?(dayShift.customFrom||'--'):(sh.s||'--');
        const to=dayShift.sh==='custom'?(dayShift.customTo||'--'):(sh.e||'--');
        const shName=dayShift.sh==='custom'?'مخصص':sh.name||dayShift.sh;
        return `<td style="text-align:center;padding:5px 4px;border-bottom:1px solid rgba(255,255,255,.04);${isToday?'background:rgba(0,229,255,.04)':''}">
          <div style="background:rgba(240,192,64,.08);border:1px solid rgba(240,192,64,.18);border-radius:8px;padding:5px 3px;cursor:pointer;transition:.15s"
               onclick="openDayShiftEdit('${e.id}','${e.name}','${ds}')"
               title="اضغط لتعديل الشفت">
            <div style="font-size:9px;font-weight:700;color:var(--gold)">${shName}</div>
            <div style="font-size:9px;color:var(--green)">${from}</div>
            <div style="font-size:9px;color:var(--cyan)">${to}</div>
            <div style="font-size:8px;color:var(--t3);margin-top:2px">✏️ تعديل</div>
          </div>
        </td>`;
      }).join('')}
    </tr>`).join('')}
    </tbody></table></div>`;
  c.innerHTML=html;
}

// فتح موديل تعديل شفت يوم محدد
let _editDayEmpId='',_editDayDate='';
function openDayShiftEdit(empId,empName,dateStr){
  _editDayEmpId=empId; _editDayDate=dateStr;
  const emp=(DB.get('emps')||[]).find(e=>e.id===empId);
  const cur=getEmpShiftForDay({id:empId,sh:emp?.sh||'',customFrom:emp?.customFrom||'',customTo:emp?.customTo||''},dateStr);
  document.getElementById('dseTitle').textContent=`✏️ ${empName} — ${fmtD(dateStr)}`;
  document.getElementById('dseShift').value=cur.sh;
  document.getElementById('dseCustomWrap').style.display=cur.sh==='custom'?'flex':'none';
  document.getElementById('dseFrom').value=cur.customFrom||'';
  document.getElementById('dseTo').value=cur.customTo||'';
  openModal('dayShiftEditModal');
}
function saveDayShiftEdit(){
  const sh=document.getElementById('dseShift').value;
  const from=document.getElementById('dseFrom').value;
  const to=document.getElementById('dseTo').value;
  saveDailyShift(_editDayEmpId,_editDayDate,sh,from,to);
  closeModal('dayShiftEditModal');
  renderShiftSchedule();
  // أشعر الموظف
  const emp=(DB.get('emps')||[]).find(e=>e.id===_editDayEmpId);
  if(emp){
    const shName=sh==='custom'?`مخصص ${from}—${to}`:(SHIFTS[sh]?.name||sh);
    const msg={id:genId(),eid:emp.id,ename:emp.name,
      text:`📅 تم تعديل شفتك ليوم ${fmtD(_editDayDate)} إلى: ${shName}`,
      date:todayStr(),time:fmtT(new Date()),ts:new Date().toISOString()};
    const msgs=DB.get('msg')||[];msgs.push(msg);DB.set('msg',msgs);
    sendTg(`📅 تعديل شفت\n👤 ${emp.name}\nاليوم: ${fmtD(_editDayDate)}\nالشفت: ${shName}`);
  }
  showToast('✅ تم تعديل الشفت اليومي','s');
}

// جدول الدوام للموظف (عرض للقراءة فقط)
function renderEmpSchedule(){
  const c=document.getElementById('empScheduleView'); if(!c)return;
  const emp=getEmp(); if(!emp){c.innerHTML='';return;}
  const days=[];
  for(let i=0;i<7;i++){
    const d=new Date(); d.setDate(d.getDate()+i);
    days.push(d);
  }
  const dayNames=['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
  const todayStr2=todayStr();
  c.innerHTML=`
    <div style="margin-bottom:12px;background:rgba(0,229,255,.06);border:1px solid rgba(0,229,255,.15);border-radius:12px;padding:12px 14px;font-size:12px;color:var(--t2)">
      📌 جدول دوامك لـ 7 أيام القادمة — يمكن للمدير تعديله يومياً
    </div>
    ${days.map(d=>{
      const ds=d.toISOString().split('T')[0];
      const isToday=ds===todayStr2;
      const dayShift=getEmpShiftForDay(emp,ds);
      const sh=SHIFTS[dayShift.sh]||{};
      const from=dayShift.sh==='custom'?(dayShift.customFrom||'--'):(sh.s||'--');
      const to=dayShift.sh==='custom'?(dayShift.customTo||'--'):(sh.e||'--');
      const shName=dayShift.sh==='custom'?'وقت مخصص':sh.name||dayShift.sh;
      const isFull=sh.full||false;
      return `<div style="background:${isToday?'rgba(0,229,255,.08)':'var(--bg2)'};border:${isToday?'2px solid rgba(0,229,255,.4)':'1px solid var(--br)'};border-radius:14px;padding:14px 16px;margin-bottom:10px">
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">
          <div>
            <div style="font-size:14px;font-weight:800;color:${isToday?'var(--cyan)':'var(--t1)'}">${dayNames[d.getDay()]} ${d.getDate()}/${d.getMonth()+1} ${isToday?'<span style="color:var(--cyan);font-size:11px">(اليوم)</span>':''}</div>
            <div style="font-size:16px;font-weight:900;color:var(--gold);margin-top:4px">${shName}</div>
          </div>
          <div style="text-align:left">
            <div style="font-size:13px;font-weight:700;color:var(--green)">⏰ ${from} — ${to}</div>
            <div style="font-size:11px;color:${isFull?'var(--gold)':'var(--cyan)'};margin-top:4px">${isFull?'⭐ دوام كامل (+10,000)':'دوام نصفي'}</div>
          </div>
        </div>
      </div>`;
    }).join('')}`;
}

function archiveShiftSchedule(){
  const offset=parseInt(document.getElementById('shWeekOffset')?.value||'0');
  const emps=DB.get('emps')||[];
  const startDay=new Date(); startDay.setDate(startDay.getDate()+offset);
  const endDay=new Date(); endDay.setDate(endDay.getDate()+offset+6);
  const label=`${startDay.getDate()}/${startDay.getMonth()+1} — ${endDay.getDate()}/${endDay.getMonth()+1}/${endDay.getFullYear()}`;
  const shiftArchives=DB.get('shiftArchives')||[];
  shiftArchives.unshift({
    id:genId(), label, archivedAt:new Date().toISOString(),
    emps:emps.map(e=>({id:e.id,name:e.name,sh:e.sh,customFrom:e.customFrom,customTo:e.customTo}))
  });
  if(shiftArchives.length>20)shiftArchives.length=20;
  DB.set('shiftArchives',shiftArchives);
  renderShiftArchive();
  showToast(`✅ تم أرشفة جدول: ${label}`,'s');
}

function renderShiftArchive(){
  const c=document.getElementById('shiftArchiveList'); if(!c)return;
  const archives=DB.get('shiftArchives')||[];
  if(!archives.length){c.innerHTML='<div class="empty"><div class="ei">📅</div><p>لا توجد جداول مؤرشفة</p></div>';return;}
  c.innerHTML=archives.map(a=>`
    <div style="background:var(--bg3);border:1px solid var(--br);border-radius:10px;padding:12px 14px;margin-bottom:8px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
        <div style="font-size:13px;font-weight:700;color:var(--purple)">📅 ${a.label}</div>
        <div style="font-size:10px;color:var(--t3)">${new Date(a.archivedAt).toLocaleDateString('ar-IQ')}</div>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:6px">
        ${(a.emps||[]).map(e=>`<span style="font-size:10px;background:rgba(240,192,64,.08);border:1px solid rgba(240,192,64,.15);border-radius:6px;padding:3px 8px;color:var(--gold)">${e.name}: ${SHIFTS[e.sh]?.name||e.sh||'مخصص'}</span>`).join('')}
      </div>
    </div>`).join('');
}

// ══════════════════════════════════════════════════════
function openAddShiftModal(){openModal('addShiftModal');}
function saveNewShift(){
  const name=document.getElementById('newShiftName').value.trim();
  const from=document.getElementById('newShiftFrom').value;
  const to=document.getElementById('newShiftTo').value;
  const bonType=document.getElementById('newShiftBonType').value;
  const bonAmt=parseInt(document.getElementById('newShiftBonAmt').value)||0;
  if(!name||!from||!to){showToast('أدخل اسم الشفت والأوقات','e');return;}
  const key=from+'-'+to+(name.replace(/\s/g,'')?'_'+Date.now():'');
  const customShifts=DB.get('customShifts')||{};
  const shObj={name,s:from,e:to,h:0,full:bonType==='full',display:name};
  if(bonType==='daily'){shObj.bonusType='daily';shObj.dailyBonus=bonAmt;shObj.full=false;}
  customShifts[key]=shObj;
  DB.set('customShifts',customShifts);
  _reloadShifts();
  closeModal('addShiftModal');
  renderShiftCards();
  _addShiftToAllDropdowns(key,name);
  showToast('✅ تم إضافة الشفت: '+name,'s');
}

function renderShiftCards(){
  _reloadShifts();
  const grid=document.getElementById('shiftCardsGrid');if(!grid)return;
  let html='';
  Object.entries(SHIFTS).forEach(([k,s])=>{
    if(k==='custom')return;
    const bonTxt=s.full?'كامل • +10,000':s.bonusType==='daily'?`يومي • +${(s.dailyBonus||0).toLocaleString('ar-IQ')}`:s.name==='وقت مخصص'?'موافقة المدير':'نصفي';
    const bc=s.full?'':'';
    html+=`<div class="shcard"><div class="shn">${s.name}</div><div class="shh">${s.h?s.h+' ساعات':''}</div><div class="shs">${bonTxt}</div></div>`;
  });
  html+=`<div class="shcard" style="border-color:rgba(0,229,255,.2)"><div class="shn" style="color:var(--cyan)">وقت مخصص</div><div class="shh">يحدده المدير</div><div class="shs">موافقة المدير</div></div>`;
  grid.innerHTML=html;
}

function _addShiftToAllDropdowns(key,name){
  ['qsShift','dseShift','eShiftInp','neShift'].forEach(id=>{
    const sel=document.getElementById(id);if(!sel)return;
    if(!sel.querySelector(`option[value="${key}"]`)){
      const opt=document.createElement('option');opt.value=key;opt.textContent=name;
      // Insert before 'custom' option
      const customOpt=sel.querySelector('option[value="custom"]');
      if(customOpt)sel.insertBefore(opt,customOpt);
      else sel.appendChild(opt);
    }
  });
}

// Restore custom shifts into dropdowns on load
function _restoreCustomShiftsDropdowns(){
  _reloadShifts();
  const custom=DB.get('customShifts')||{};
  Object.entries(custom).forEach(([k,s])=>_addShiftToAllDropdowns(k,s.name));
}

// ══════════════════════════════════════════════════════
//  DAILY SCHEDULE PUSH (4 AM notification to employees)
// ══════════════════════════════════════════════════════
function _checkAndPushSchedule(){
  const now=new Date();
  if(now.getHours()===4&&now.getMinutes()===0){
    const key='schpush_'+todayStr();
    if(!DB.get(key)){DB.set(key,1);pushTomorrowScheduleToChat();}
  }
}

// ── Fix renderShiftSchedule for on_leave ──
const _origRenderShiftSchedule=typeof renderShiftSchedule==='function'?renderShiftSchedule:null;
function renderShiftSchedule(){
  _reloadShifts();
  const c=document.getElementById('shiftScheduleGrid'); if(!c)return;
  const offset=parseInt(document.getElementById('shWeekOffset')?.value||'0');
  const emps=DB.get('emps')||[];
  const days=[];
  for(let i=0;i<7;i++){
    const d=new Date(); d.setDate(d.getDate()+offset+i);
    days.push(d);
  }
  const dayNames=['أحد','إثنين','ثلاثاء','أربعاء','خميس','جمعة','سبت'];
  const todayStr2=todayStr();
  let html=`<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:12px">
    <thead><tr>
      <th style="text-align:right;padding:8px 10px;color:var(--t3);border-bottom:1px solid var(--br);white-space:nowrap;min-width:90px">الموظف</th>
      ${days.map(d=>{
        const ds=d.toISOString().split('T')[0];
        const isToday=ds===todayStr2;
        return `<th style="text-align:center;padding:8px 6px;border-bottom:1px solid var(--br);white-space:nowrap;min-width:110px;${isToday?'background:rgba(0,229,255,.06)':''}">
          <div style="font-size:10px;color:${isToday?'var(--cyan)':'var(--t3)'};">${dayNames[d.getDay()]}</div>
          <div style="font-weight:800;color:${isToday?'var(--cyan)':'var(--t1)'}">${d.getDate()}/${d.getMonth()+1}</div>
          ${isToday?'<div style="font-size:9px;color:var(--cyan)">اليوم</div>':''}
        </th>`;
      }).join('')}
    </tr></thead>
    <tbody>
    ${emps.map(e=>`<tr>
      <td style="padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.04)">
        <div style="display:flex;align-items:center;gap:6px">
          ${getEmpAvatar(e.id,e.name,26)}
          <span style="font-weight:600;font-size:11px;white-space:nowrap">${e.name}</span>
        </div>
      </td>
      ${days.map(d=>{
        const ds=d.toISOString().split('T')[0];
        const isToday=ds===todayStr2;
        const dayShift=getEmpShiftForDay(e,ds);
        const isOnLeave=dayShift.sh==='on_leave';
        const sh=SHIFTS[dayShift.sh]||{};
        const from=dayShift.sh==='custom'?(dayShift.customFrom||'--'):(sh.s||'--');
        const to=dayShift.sh==='custom'?(dayShift.customTo||'--'):(sh.e||'--');
        const shName=dayShift.sh==='custom'?'مخصص':sh.name||dayShift.sh;
        return `<td style="text-align:center;padding:5px 4px;border-bottom:1px solid rgba(255,255,255,.04);${isToday?'background:rgba(0,229,255,.04)':''}">
          ${isOnLeave?
            `<div style="background:rgba(206,147,216,.15);border:1px solid rgba(206,147,216,.35);border-radius:8px;padding:5px 3px;cursor:pointer"
                 onclick="openDayShiftEdit('${e.id}','${e.name}','${ds}')" title="مجاز">
              <div style="font-size:13px">🌴</div>
              <div style="font-size:9px;color:var(--purple);font-weight:700">مجاز</div>
              <div style="font-size:8px;color:var(--t3)">✏️</div>
            </div>`:
            `<div style="background:rgba(240,192,64,.08);border:1px solid rgba(240,192,64,.18);border-radius:8px;padding:5px 3px;cursor:pointer"
                 onclick="openDayShiftEdit('${e.id}','${e.name}','${ds}')" title="تعديل">
              <div style="font-size:9px;font-weight:700;color:var(--gold)">${shName}</div>
              <div style="font-size:9px;color:var(--green)">${from}</div>
              <div style="font-size:9px;color:var(--cyan)">${to}</div>
              <div style="font-size:8px;color:var(--t3)">✏️</div>
            </div>`}
        </td>`;
      }).join('')}
    </tr>`).join('')}
    </tbody></table></div>`;
  c.innerHTML=html;
}

// ── saveDayShiftEdit with leave registration ──
function saveDayShiftEdit(){
  const sh=document.getElementById('dseShift').value;
  const from=document.getElementById('dseFrom').value;
  const to=document.getElementById('dseTo').value;
  saveDailyShift(_editDayEmpId,_editDayDate,sh,from,to);
  if(sh==='on_leave'){
    const leaveDays=DB.get('leaveDays')||[];
    if(!leaveDays.some(l=>l.eid===_editDayEmpId&&l.date===_editDayDate)){
      const emp2=(DB.get('emps')||[]).find(e=>e.id===_editDayEmpId);
      leaveDays.push({id:genId(),eid:_editDayEmpId,ename:emp2?.name||'',date:_editDayDate,paid:true,byAdmin:true,note:'مجاز جدول الشفتات'});
      DB.set('leaveDays',leaveDays);
    }
  } else {
    const leaveDays=DB.get('leaveDays')||[];
    DB.set('leaveDays',leaveDays.filter(l=>!(l.eid===_editDayEmpId&&l.date===_editDayDate&&l.note==='مجاز جدول الشفتات')));
  }
  closeModal('dayShiftEditModal');
  renderShiftSchedule();
  const emp=(DB.get('emps')||[]).find(e=>e.id===_editDayEmpId);
  if(emp){
    const shName=sh==='on_leave'?'🌴 إجازة':sh==='custom'?'مخصص '+from+'—'+to:(SHIFTS[sh]?.name||sh);
    const msg={id:genId(),eid:emp.id,ename:emp.name,text:'📅 تم تعديل شفتك ليوم '+fmtD(_editDayDate)+' إلى: '+shName,date:todayStr(),time:fmtT(new Date()),ts:new Date().toISOString()};
    const msgs=DB.get('msg')||[];msgs.push(msg);DB.set('msg',msgs);
    sendTg('📅 تعديل شفت\n👤 '+emp.name+'\nاليوم: '+fmtD(_editDayDate)+'\nالشفت: '+shName);
  }
  renderAdmin();
  showToast('✅ تم حفظ الشفت','s');
}

// ── renderMonthAttGrid fix (current month only) ──
function renderMonthAttGrid(emps,att,ps,pe,today){
  const grid=document.getElementById('monthAttGrid');
  const badge=document.getElementById('monthAttBadge');
  if(!grid)return;
  const leaveDays=DB.get('leaveDays')||[];
  const now2=new Date();
  const currentMonthStart=new Date(now2.getFullYear(),now2.getMonth(),1).toISOString().split('T')[0];
  const currentMonthEnd=new Date(now2.getFullYear(),now2.getMonth()+1,0).toISOString().split('T')[0];
  const days=[];
  let cur=new Date(currentMonthStart+'T00:00:00');
  while(cur<=new Date(currentMonthEnd+'T00:00:00')){
    days.push(cur.toISOString().split('T')[0]);
    cur.setDate(cur.getDate()+1);
  }
// ── Hook: restore custom shifts on load ──
document.addEventListener('DOMContentLoaded',()=>{
  setTimeout(()=>{
    try{_reloadShifts();_restoreCustomShiftsDropdowns();}catch(e){}
    try{renderShiftCards();}catch(e){}
  },500);
});


function openShiftCustomBon(){
  // Use cbModal but label it as shift bonus
  document.querySelector('#cbModal .mh h3').textContent='🎯 حافز شفتات مخصص';
  document.getElementById('cbReason').placeholder='مثال: شفت ليلي إضافي، تمديد دوام...';
  openModal('cbModal');
}
</script>

<!-- Absent Alert 9AM Modal -->

<div class="mov" id="absentAlertModal">
  <div class="modal" style="max-width:480px">
    <div class="mh"><h3>🔔 تنبيه — الساعة 9 صباحاً</h3><button class="mx" onclick="closeModal('absentAlertModal')">✕</button></div>
    <div class="mb">
      <div style="font-size:13px;color:var(--t2);margin-bottom:14px">الموظفون التاليون لم يسجلوا حضورهم — حدد وضع كل منهم:</div>
      <div id="absentAlertList"></div>
    </div>
    <div class="mf"><button class="btn btn-sc" onclick="closeModal('absentAlertModal')">إغلاق</button></div>
  </div>
</div>

<!-- Sub-Admin Modal -->

<div class="mov" id="subAdminModal">
  <div class="modal" style="max-width:460px">
    <div class="mh"><h3 id="subAdminModalTitle">➕ إضافة مدير فرعي</h3><button class="mx" onclick="closeModal('subAdminModal')">✕</button></div>
    <div class="mb">
      <input type="hidden" id="subAdminEditId">
      <div class="fg"><label>الاسم الكامل *</label><input type="text" class="fi" id="saName" placeholder="مثال: أحمد علي"></div>
      <div class="fg"><label>اسم المستخدم *</label><input type="text" class="fi" id="saUser" placeholder="مثال: ahmed_admin" style="direction:ltr;text-align:left" autocapitalize="none"></div>
      <div class="fg"><label>كلمة المرور *</label><input type="text" class="fi" id="saPass" placeholder="••••••••" style="direction:ltr"></div>
      <div class="fg"><label>الدور / اللقب</label>
        <select class="fi" id="saRole">
          <option value="manager">مدير فرعي</option>
          <option value="assistant">مساعد مدير</option>
          <option value="supervisor">مشرف</option>
        </select>
      </div>
      <div style="background:var(--bg3);border:1px solid var(--br);border-radius:12px;padding:14px;margin-top:4px">
