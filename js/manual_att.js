// ═══ manual_att.js ═══
function updatePendingBadges(){
  // إجازات معلقة
  const leaves=(DB.get('leaveRequests')||[]).filter(r=>r.status==='pending').length;
  _setBadge('sideLeaveCount', leaves);
  _setBadge('mnavLeaveCount', leaves);

  // سلف معلقة
  const loans=(DB.get('loanRequests')||[]).filter(l=>l.status==='pending').length;
  _setBadge('sideLoanCount', loans);
  _setBadge('mnavLoanCount', loans);

  // رسائل غير مقروءة (من الموظفين للمدير)
  const msgs=(DB.get('empToAdminMsg')||[]).filter(m=>!m.readByAdmin).length;
  // أيضاً رسائل الدردشة الجماعية غير المقروءة
  const lastSeen=parseInt(localStorage.getItem('groupchatLastSeen')||'0');
  const chatMsgs=(DB.get('groupchat')||[]).filter(m=>m.uid!=='admin'&&new Date(m.ts).getTime()>lastSeen).length;
  const totalMsgs=msgs+chatMsgs;
  _setBadge('sideMsgCount', totalMsgs);
  _setBadge('mnavMsgCount', totalMsgs);
}

function _setBadge(id, count){
  const el=document.getElementById(id);
  if(!el)return;
  if(count>0){
    el.textContent=count>99?'99+':count;
    el.style.display='';
  } else {
    el.textContent='';
    el.style.display='none';
  }
}

// تحديث الـ badges كل 30 ثانية تلقائياً
setInterval(()=>{try{updatePendingBadges();}catch(e){}}, 30000);

// ══════════════════════════════════════════════════════
//  MANUAL ATTENDANCE — تسجيل حضور يدوي من المدير
// ══════════════════════════════════════════════════════

function _populateManAttEmps(){
  const sel=document.getElementById('manAttEmp'); if(!sel)return;
  const emps=DB.get('emps')||[];
  sel.innerHTML=emps.map(e=>`<option value="${e.id}">${e.name}</option>`).join('');
}

// تسجيل يوم واحد
function adminManualAtt(){
function _populateManAttEmps(){
  const sel=document.getElementById('manAttEmp'); if(!sel)return;
  const emps=DB.get('emps')||[];
  sel.innerHTML=emps.map(e=>`<option value="${e.id}">${e.name}</option>`).join('');
}

// تسجيل يوم واحد
function adminManualAtt(){
  const empId=document.getElementById('manAttEmp')?.value;
  const date=document.getElementById('manAttDate')?.value;
  const ciTime=document.getElementById('manAttCiTime')?.value||'09:00';
  const coTime=document.getElementById('manAttCoTime')?.value||'18:00';
  if(!empId||!date){showToast('اختر الموظف والتاريخ','e');return;}

  const emps=DB.get('emps')||[];
  const emp=emps.find(e=>e.id===empId);
  if(!emp){showToast('الموظف غير موجود','e');return;}

  const att=DB.get('att')||[];

  // تحقق إذا مسجل مسبقاً
  const exists=att.some(a=>a.eid===empId&&a.date===date&&a.type==='ci');
  if(exists){
    showToast(`⚠️ ${emp.name} مسجل حضور بتاريخ ${date} مسبقاً`,'e');
    return;
  }

  const ciTs=new Date(date+'T'+ciTime+':00').toISOString();
  const coTs=new Date(date+'T'+coTime+':00').toISOString();
  const durMins=Math.round((new Date(coTs)-new Date(ciTs))/60000);

  att.push({id:genId(),eid:empId,ename:emp.name,type:'ci',date,time:ciTime,ts:ciTs,lat:0,lng:0,dist:0,manual:true,byAdmin:true});
  att.push({id:genId(),eid:empId,ename:emp.name,type:'co',date,time:coTime,ts:coTs,lat:0,lng:0,dist:0,durMins,manual:true,byAdmin:true});
  DB.set('att',att);

  addAdminLog('manual_att',`تسجيل حضور يدوي: ${emp.name} — ${date}`,{eid:empId,date});

  const fb=document.getElementById('manAttFeedback');
  if(fb){fb.textContent=`✅ تم تسجيل حضور ${emp.name} بتاريخ ${date} (${ciTime} – ${coTime})`;fb.style.display='block';setTimeout(()=>{fb.style.display='none';},4000);}

  showToast(`✅ تم تسجيل حضور ${emp.name}`,'s');
  renderAdminAtt();
  renderAdmin();
}

// فتح modal الأيام المتعددة
function adminManualAttMulti(){
  const empId=document.getElementById('manAttEmp')?.value;
  if(!empId){showToast('اختر موظفاً أولاً','e');return;}
  const emps=DB.get('emps')||[];
  const emp=emps.find(e=>e.id===empId);
  if(!emp)return;

  document.getElementById('manAttMultiEmpName').textContent=emp.name;

  // بناء قائمة أيام الفترة الحالية
  const per=getPeriod();
  const att=DB.get('att')||[];
  const ps=per.start.toISOString().split('T')[0];
  const pe=per.end.toISOString().split('T')[0];
  const registeredDays=new Set(att.filter(a=>a.eid===empId&&a.type==='ci').map(a=>a.date));

  const today=todayStr();
  const days=[];
  let cur=new Date(ps+'T00:00:00');
  const end=new Date(pe+'T00:00:00');
  while(cur<=end&&cur.toISOString().split('T')[0]<=today){
    days.push(cur.toISOString().split('T')[0]);
    cur.setDate(cur.getDate()+1);
  }

  const container=document.getElementById('manAttMultiDaysList');
  container.innerHTML=days.map(d=>{
    const isReg=registeredDays.has(d);
    const dayName=new Date(d+'T00:00:00').toLocaleDateString('ar-IQ',{weekday:'short',day:'numeric',month:'numeric'});
    return `<label style="display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:8px;cursor:${isReg?'default':'pointer'};background:${isReg?'rgba(0,230,118,.08)':'var(--bg3)'};border:1px solid ${isReg?'rgba(0,230,118,.3)':'var(--br)'};opacity:${isReg?'0.6':'1'}">
      <input type="checkbox" value="${d}" ${isReg?'checked disabled':''} style="accent-color:var(--green);width:15px;height:15px">
      <span style="font-size:12px;${isReg?'color:var(--green)':''}">${dayName}${isReg?' ✅':''}</span>
    </label>`;
  }).join('');

  // store empId on modal
  document.getElementById('manAttMultiModal').dataset.eid=empId;
  openModal('manAttMultiModal');
}

function selectAllMultiDays(){
  document.querySelectorAll('#manAttMultiDaysList input[type=checkbox]:not(:disabled)').forEach(cb=>cb.checked=true);
}
function clearAllMultiDays(){
  document.querySelectorAll('#manAttMultiDaysList input[type=checkbox]:not(:disabled)').forEach(cb=>cb.checked=false);
}

function confirmManualAttMulti(){
  const empId=document.getElementById('manAttMultiModal').dataset.eid;
  const ciTime=document.getElementById('manAttMultiCi')?.value||'09:00';
  const coTime=document.getElementById('manAttMultiCo')?.value||'18:00';
  const selected=[...document.querySelectorAll('#manAttMultiDaysList input[type=checkbox]:not(:disabled):checked')].map(cb=>cb.value);

  if(!selected.length){showToast('ما اخترت أي يوم','e');return;}

  const emps=DB.get('emps')||[];
  const emp=emps.find(e=>e.id===empId);
  if(!emp)return;

  let att=DB.get('att')||[];
  let added=0;
  selected.forEach(date=>{
    const exists=att.some(a=>a.eid===empId&&a.date===date&&a.type==='ci');
    if(exists)return;
    const ciTs=new Date(date+'T'+ciTime+':00').toISOString();
    const coTs=new Date(date+'T'+coTime+':00').toISOString();
    const durMins=Math.round((new Date(coTs)-new Date(ciTs))/60000);
    att.push({id:genId(),eid:empId,ename:emp.name,type:'ci',date,time:ciTime,ts:ciTs,lat:0,lng:0,dist:0,manual:true,byAdmin:true});
    att.push({id:genId(),eid:empId,ename:emp.name,type:'co',date,time:coTime,ts:coTs,lat:0,lng:0,dist:0,durMins,manual:true,byAdmin:true});
    added++;
  });
  DB.set('att',att);
  addAdminLog('manual_att_multi',`تسجيل حضور يدوي متعدد: ${emp.name} — ${added} أيام`,{eid:empId,count:added});
  closeModal('manAttMultiModal');
  showToast(`✅ تم تسجيل ${added} يوم حضور لـ ${emp.name}`,'s');
  renderAdminAtt();
  renderAdmin();
}

// تعبئة قائمة الموظفين عند فتح تاب الحضور
const _origShowATab=window.showATab;
window.showATab=function(id,el){
  _origShowATab&&_origShowATab(id,el);
  if(id==='att'){
    _populateManAttEmps();
    // تعيين اليوم الحالي كافتراضي
    const di=document.getElementById('manAttDate');
    if(di&&!di.value)di.value=todayStr();
  }
};


// ══════════════════════════════════════════════════════
//  MONTH ATTENDANCE GRID — حضور الشهر الكامل
// ══════════════════════════════════════════════════════
function renderMonthAttGrid(emps,att,ps,pe,today){
function renderMonthAttGrid(emps,att,ps,pe,today){
  const grid=document.getElementById('monthAttGrid');
  const badge=document.getElementById('monthAttBadge');
  if(!grid)return;
  const leaveDays=DB.get('leaveDays')||[];
  const now2=new Date();
  const monthStart=new Date(now2.getFullYear(),now2.getMonth(),1).toISOString().split('T')[0];
  // بناء أيام الشهر كله من اليوم 1
  const days=[];
  let cur=new Date(monthStart+'T00:00:00');
  const end=new Date(pe+'T00:00:00');
  while(cur<=end){
    days.push(cur.toISOString().split('T')[0]);
    cur.setDate(cur.getDate()+1);
  }
  let totalPresent=0, totalLeave=0;
  const dayStats=days.map(d=>{
    const pres=emps.filter(e=>att.some(a=>a.eid===e.id&&a.date===d&&a.type==='ci')).length;
    const onLeave=emps.filter(e=>leaveDays.some(l=>l.eid===e.id&&l.date===d)).length;
    if(d<=today){totalPresent+=pres;totalLeave+=onLeave;}
    return{d,pres,onLeave};
  });
  const passedDays=days.filter(d=>d<=today).length;
  if(badge)badge.textContent=`${totalPresent} تسجيل حضور في ${passedDays} يوم`;
  grid.innerHTML=dayStats.map(({d,pres,onLeave})=>{
    const isFuture=d>today;
    const dayNum=parseInt(d.split('-')[2]);
    let bg,color,title;
    if(isFuture){bg='var(--bg3)';color='var(--t3)';title=d;}
    else if(pres===emps.length&&emps.length>0){bg='rgba(0,230,118,.25)';color='var(--green)';title=`${d} — كل الموظفين حضروا`;}
    else if(pres>0&&onLeave>0){bg='rgba(240,192,64,.2)';color='var(--gold)';title=`${d} — ${pres} حضور + ${onLeave} إجازة`;}
    else if(pres>0){bg='rgba(240,192,64,.2)';color='var(--gold)';title=`${d} — ${pres}/${emps.length} حضروا`;}
    else if(onLeave>0){bg='rgba(206,147,216,.25)';color='var(--purple)';title=`${d} — ${onLeave} مجاز 🌴`;}
    else{bg='var(--bg3)';color='var(--t3)';title=`${d} — لا يوجد`;}
    return `<div title="${title}" style="width:30px;height:30px;border-radius:6px;background:${bg};color:${color};display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;cursor:default">${dayNum}</div>`;
  }).join('');
}

// ══════════════════════════════════════════════════════
//  LEAVE MANAGEMENT — إدارة الإجازات من المدير
// ══════════════════════════════════════════════════════
function _populateLeaveMgmt(){
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
  let totalPresent=0,totalLeave=0;
  const dayStats=days.map(d=>{
    const pres=emps.filter(e=>att.some(a=>a.eid===e.id&&a.date===d&&a.type==='ci')).length;
    const onLeave=emps.filter(e=>leaveDays.some(l=>l.eid===e.id&&l.date===d)).length;
    if(d<=today){totalPresent+=pres;totalLeave+=onLeave;}
    return{d,pres,onLeave};
  });
  const passedDays=days.filter(d=>d<=today).length;
  if(badge)badge.textContent=totalPresent+' تسجيل حضور في '+passedDays+' يوم';
  grid.innerHTML=dayStats.map(({d,pres,onLeave})=>{
    const isFuture=d>today;
    const dayNum=parseInt(d.split('-')[2]);
    let bg,color,title;
    if(isFuture){bg='var(--bg3)';color='var(--t3)';title=d;}
    else if(pres===emps.length&&emps.length>0){bg='rgba(0,230,118,.25)';color='var(--green)';title=d+' — الكل حضروا';}
    else if(pres>0){bg='rgba(240,192,64,.2)';color='var(--gold)';title=d+' — '+pres+'/'+emps.length;}
    else if(onLeave>0){bg='rgba(206,147,216,.25)';color='var(--purple)';title=d+' — '+onLeave+' مجاز';}
    else{bg='var(--bg3)';color='var(--t3)';title=d;}
    return'<div title="'+title+'" style="width:30px;height:30px;border-radius:6px;background:'+bg+';color:'+color+';display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;cursor:default">'+dayNum+'</div>';
  }).join('');
}

// ── renderDayGrid fix (current month only) ──
function renderDayGrid(eid){
  const c=document.getElementById('empDG');if(!c)return;
  const att=DB.get('att')||[];
  const leaveDays=DB.get('leaveDays')||[];
  const now=new Date();
  const monthStart=new Date(now.getFullYear(),now.getMonth(),1);
  const monthEnd=new Date(now.getFullYear(),now.getMonth()+1,0);
  const today=todayStr();
  const days=[];
  let cur=new Date(monthStart);
  while(cur<=monthEnd){
    const ds=cur.toISOString().split('T')[0];
    const future=ds>today;
    const hasCI=att.some(a=>a.eid===eid&&a.date===ds&&a.type==='ci');
    const isLeave=leaveDays.some(l=>l.eid===eid&&l.date===ds)||att.some(a=>a.eid===eid&&a.date===ds&&a.type==='leave');
    let cls=future?'f':hasCI?'p':isLeave?'lv':'f';
    days.push('<div class="dc '+cls+'" title="'+fmtD(ds)+'">'+cur.getDate()+'</div>');
    cur.setDate(cur.getDate()+1);
  }
  c.innerHTML=days.join('');
}

// ── renderEmpAttPattern fix (current month only) ──
function renderEmpAttPattern(eid){
  const c=document.getElementById('empAttPattern');if(!c)return;
  const att=DB.get('att')||[];
  const leaveDays=DB.get('leaveDays')||[];
  const now=new Date(),y=now.getFullYear(),m=now.getMonth();
  const monthStart=new Date(y,m,1);
  const monthEnd=new Date(y,m+1,0);
  const today=new Date();today.setHours(23,59,59);
  let cur=new Date(monthStart);
  const dots=[];
  while(cur<=monthEnd){
    const ds=cur.toISOString().split('T')[0];
    const future=cur>today;
    const has=att.some(a=>a.eid===eid&&a.date===ds&&a.type==='ci');
    const isLeave=leaveDays.some(l=>l.eid===eid&&l.date===ds)||att.some(a=>a.eid===eid&&a.date===ds&&a.type==='leave');
    const cls=future?'future':has?'present':isLeave?'on-leave':'future';
    dots.push('<div class="att-dot '+cls+'" title="'+cur.toLocaleDateString('ar-IQ')+'">'+cur.getDate()+'</div>');
    cur.setDate(cur.getDate()+1);
  }
  c.innerHTML=dots.join('');
}

// ── shiftLabel updated ──
function shiftLabel(emp){
