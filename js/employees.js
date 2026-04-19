// ═══ employees.js ═══
function renderEmpTable(){
  const tb=document.getElementById('empListTable'); if(!tb)return;
  const q=(document.getElementById('empSearch')?.value||'').toLowerCase();
  let emps=DB.get('emps')||[];
  if(q)emps=emps.filter(e=>e.name.toLowerCase().includes(q)||e.u.toLowerCase().includes(q));
  document.getElementById('empListCount').textContent=emps.length+' موظف';
  const att=DB.get('att')||[], today=todayStr();
  tb.innerHTML=emps.map((e,i)=>{
    const ci=att.find(a=>a.eid===e.id&&a.date===today&&a.type==='ci');
    const co=att.find(a=>a.eid===e.id&&a.date===today&&a.type==='co');
    const tag=co?'<span class="tag tc">انصرف</span>':ci?'<span class="tag tp">حاضر</span>':'<span class="tag ta">غائب</span>';
    return `<tr><td>${i+1}</td>
      <td><div class="tname"><div class="eav">${e.name[0]}</div><div><div>${e.name}</div><div class="muted">${e.u}</div></div></div></td>
      <td><code style="background:var(--bg2);padding:2px 6px;border-radius:4px;font-size:11px">${e.u}</code></td>
      <td><span class="shbadge">${shiftLabel(e)}</span></td>
      <td><span class="gnum">${fmtN(e.sal)}</span></td>
      <td>${tag}</td>
      <td><div class="flex g8">
        <button class="btn btn-sc btn-sm" onclick="openDetail('${e.id}')">📋 تفاصيل</button>
        <button class="btn btn-ok btn-sm" onclick="openDetailBon('${e.id}')">🎁</button>
        <button class="btn btn-dn btn-sm btn-ic" onclick="qDel('${e.id}')">🗑️</button>
      </div></td></tr>`;
  }).join('');
}



function renderSalTable(){
  const tb=document.getElementById('salTable'); if(!tb)return;
  const emps=DB.get('emps')||[];
  tb.innerHTML=emps.map(e=>{
    const c=calcSalary(e);
    return `<tr>
      <td><div class="tname"><div class="eav">${e.name[0]}</div>${e.name}</div></td>
      <td><span class="gnum">${fmtN(e.sal)}</span></td>
      <td><span class="tgrn bold">${fmtN(c.earnedSalary)}</span></td>
      <td><span style="color:var(--purple)">+${fmtN(c.shiftBonTotal)}</span></td>
      <td><span class="tgrn">+${fmtN(c.salesBonTotal+c.otherBonTotal)}</span></td>
      <td><span class="tred">-${fmtN(c.totalDed)}</span></td>
      <td><span class="gnum" style="font-size:14px">${fmtN(c.net)}</span></td>
      <td><button class="btn btn-sc btn-sm" onclick="openDetail('${e.id}');setTimeout(()=>showDTab('sal'),100)">📊</button></td>
    </tr>`;
  }).join('');
}

function renderShTable(){
  const tb=document.getElementById('shTable'); if(!tb)return;
  const emps=DB.get('emps')||[];
  tb.innerHTML=emps.map(e=>{
    const sh=SHIFTS[e.sh]||{};
    return `<tr>
      <td><div class="tname"><div class="eav">${e.name[0]}</div>${e.name}</div></td>
      <td><span class="shbadge">${shiftLabel(e)}</span></td>
      <td>${sh.full?'<span class="tgld bold">كامل</span>':'<span class="tcyn">نصفي</span>'}</td>
      <td>${sh.full?'<span class="tgrn bold">10,000 د.ع</span>':'<span class="muted">—</span>'}</td>
      <td><button class="btn btn-sc btn-sm" onclick="openQS('${e.id}','${e.name}','${e.sh}')">✏️</button></td>
    </tr>`;
  }).join('');
}

function renderIncTab(emps){
  const sel=document.getElementById('incEmpSel');
  if(sel)sel.innerHTML=emps.map(e=>`<option value="${e.id}">${e.name}</option>`).join('');
  const rb=document.getElementById('recentBon'); if(!rb)return;
  const all=[];
  emps.forEach(e=>(e.bon||[]).forEach((b,i)=>all.push({...b,ename:e.name,eid:e.id,idx:i})));
  all.sort((a,b)=>b.date.localeCompare(a.date));
  rb.innerHTML=all.slice(0,15).length?all.slice(0,15).map(b=>`
    <div class="bi"><div><div class="br2">${b.ename} — ${b.note||b.type}</div><div class="bd">${fmtD(b.date)}</div></div>
    <div class="flex g8" style="align-items:center"><div class="ba">+${fmtN(b.amount)} د.ع</div>
    <button class="btn btn-dn btn-sm btn-ic" onclick="removeBonFromList('${b.eid}',${b.idx})">🗑️</button>
    </div></div>`).join(''):`<div class="empty" style="padding:20px"><div class="ei" style="font-size:26px">🎁</div><p>لا توجد حوافز</p></div>`;
}

function removeBonFromList(empId,idx){
  const emps=DB.get('emps')||[], i=emps.findIndex(e=>e.id===empId); if(i===-1)return;
  emps[i].bon.splice(idx,1); DB.set('emps',emps); renderAdmin();
  showToast('تم إلغاء الحافز','i');
}

function renderRatingTab(emps){
  const c=document.getElementById('ratingContainer'); if(!c)return;
  c.innerHTML=`<div class="rate-grid">${emps.map(e=>`
    <div class="rate-card">
      <div class="rname">${e.name}</div>
      <div class="rate-stars">${[1,2,3,4,5].map(i=>`<span class="star ${e.rating>=i?'active':''}" onclick="setRating('${e.id}',${i})">⭐</span>`).join('')}</div>
      <div style="font-size:11px;color:var(--t2)">${e.rating} من 5</div>
    </div>`).join('')}</div>`;
}

function setRating(empId,rating){
  const emps=DB.get('emps')||[], i=emps.findIndex(e=>e.id===empId);
  if(i!==-1){emps[i].rating=rating;DB.set('emps',emps);renderRatingTab(emps);showToast('✅ تم حفظ التقييم','s');}
}

function renderMsgSelect(emps){
  const sel=document.getElementById('msgEmpSel');
  if(sel)sel.innerHTML=emps.map(e=>`<option value="${e.id}">${e.name}</option>`).join('');
}

function renderSentMessages(){
  var c=document.getElementById('sentMessages'); if(!c)return;
  var msgs=(DB.get('msg')||[]).sort(function(a,b){return new Date(b.ts)-new Date(a.ts);});
  if(!msgs.length){c.innerHTML='<div class="empty" style="padding:20px"><div class="ei" style="font-size:26px">📭</div><p>لا توجد رسائل</p></div>';return;}
  var html='';
  msgs.forEach(function(m){
    var isReply=m.type==='reply';
    html+='<div class="'+(isReply?'msg-reply':'msg-item')+'" style="position:relative">';
    html+='<div class="msg-head">';
    html+='<div class="msg-avatar">'+(isReply?'↩️':'👤')+'</div>';
    html+='<div style="flex:1">';
    html+='<div class="msg-name">'+(isReply?'↩️ رد من '+m.ename:'📤 لـ '+m.ename)+'</div>';
    html+='<div class="msg-time">'+fmtD(m.date)+' — '+m.time+'</div>';
    html+='</div>';
    html+='<button class="btn btn-dn btn-sm btn-ic" onclick="deleteMessage(\'' + m.id + '\')" style="padding:4px 8px;font-size:11px" title="حذف الرسالة">🗑️</button>';
    html+='</div>';
    html+='<div class="msg-text">'+m.text+'</div>';
    html+='</div>';
  });
  c.innerHTML=html;
}
function deleteMessage(id){
  if(!confirm('حذف هذه الرسالة؟'))return;
  let msgs=DB.get('msg')||[];
  msgs=msgs.filter(m=>m.id!==id);
  DB.set('msg',msgs);
  renderSentMessages();
  showToast('🗑️ تم حذف الرسالة','i');
}
function openAddEmp(){
  ['neName','neUser','nePass','neSalary','neNotes'].forEach(id=>{const e=document.getElementById(id);if(e)e.value=''});
  document.getElementById('neCustomWrap').style.display='none';
  openModal('addEmpModal');
}

function addEmp(){
  const name=document.getElementById('neName').value.trim();
  const u=document.getElementById('neUser').value.trim()||name.split(' ')[0].toLowerCase();
  const pw=document.getElementById('nePass').value.trim();
  const sh=document.getElementById('neShift').value;
  const sal=parseInt(document.getElementById('neSalary').value)||0;
  const notes=document.getElementById('neNotes').value.trim();
  if(!name||!pw||!sal){showToast('يرجى ملء الحقول المطلوبة','e');return}
  const emps=DB.get('emps')||[];
  if(emps.find(e=>e.u===u)){showToast('اليوزر مستخدم مسبقاً','e');return}
  const newEmp={id:genId(),name,u,pw,sh,sal,notes,rating:0,bon:[],ded:[],lvM:0,jd:todayStr()};
  if(sh==='custom'){newEmp.customFrom=document.getElementById('neCustomFrom').value;newEmp.customTo=document.getElementById('neCustomTo').value;}
  emps.push(newEmp);
  DB.set('emps',emps); closeModal('addEmpModal'); renderAdmin();
  sendTg(`👤 موظف جديد\nالاسم: ${name}\nاليوزر: ${u}\nالراتب: ${fmtN(sal)} د.ع`);
  showToast(`✅ تم إضافة ${name}`,'s');
}

// ═══════════════════════════════════════════════════
//  DETAIL MODAL
// ═══════════════════════════════════════════════════
function openDetail(empId){
  DID=empId;
  const emp=(DB.get('emps')||[]).find(e=>e.id===empId); if(!emp)return;
  document.getElementById('detailTitle').textContent=`تفاصيل: ${emp.name}`;
  document.getElementById('eSalInp').value=emp.sal;
  document.getElementById('eShiftInp').value=emp.sh;
  if(emp.sh==='custom'){
    document.getElementById('eCustomWrap').style.display='block';
    document.getElementById('eCustomFrom').value=emp.customFrom||'';
    document.getElementById('eCustomTo').value=emp.customTo||'';
  }else{document.getElementById('eCustomWrap').style.display='none';}
  document.getElementById('ePassInp').value='';
  const eUserInp=document.getElementById('eUserInp');
  if(eUserInp)eUserInp.value=emp.u||'';
  document.getElementById('eNotesInp').value=emp.notes||'';
  const per=getPeriod();
  document.getElementById('eLvInp').value=emp['lvM']||0;
  const sh=SHIFTS[emp.sh]||{};
  document.getElementById('detailIG').innerHTML=`
    <div class="ii"><div class="lb">الاسم</div><div class="vl">${emp.name}</div></div>
    <div class="ii"><div class="lb">اليوزر</div><div class="vl cyan">${emp.u}</div></div>
    <div class="ii"><div class="lb">الشفت</div><div class="vl">${shiftLabel(emp)}</div></div>
    <div class="ii"><div class="lb">الراتب/شهر</div><div class="vl gold">${fmtN(emp.sal)} د.ع</div></div>
    <div class="ii"><div class="lb">معدل اليوم</div><div class="vl gold">${fmtN(Math.round(emp.sal/30))} د.ع</div></div>
    <div class="ii"><div class="lb">نوع الدوام</div><div class="vl">${sh.full?'كامل ⭐':'نصفي'}</div></div>
    <div class="ii"><div class="lb">التقييم</div><div class="vl gold">${emp.rating||0} ⭐</div></div>`;
  const c=calcSalary(emp);
  document.getElementById('dSlipName').textContent=emp.name+' — '+c.per.label;
  document.getElementById('ds-monthly').textContent=fmtN(emp.sal)+' د.ع';
  document.getElementById('ds-daily').textContent=fmtN(c.dailyRate)+' د.ع';
  document.getElementById('ds-pres').textContent=c.daysPresent+' يوم';
  document.getElementById('ds-lv').textContent=c.paidLeaves+' يوم';
  document.getElementById('ds-absd').textContent=c.deductDays+' يوم';
  document.getElementById('ds-earned').textContent=fmtN(c.earnedSalary)+' د.ع';
  document.getElementById('ds-shbon').textContent='+'+fmtN(c.shiftBonTotal)+' د.ع';
  document.getElementById('ds-sbon').textContent='+'+fmtN(c.salesBonTotal)+' د.ع';
  document.getElementById('ds-obon').textContent='+'+fmtN(c.otherBonTotal)+' د.ع';
  document.getElementById('ds-ded').textContent='-'+fmtN(c.totalDed)+' د.ع';
  document.getElementById('ds-tot').textContent=fmtN(c.net)+' د.ع';
  renderDBon(emp); renderDDed(emp);
  const att=(DB.get('att')||[]).filter(a=>a.eid===empId).sort((a,b)=>new Date(b.ts)-new Date(a.ts));
  document.getElementById('dAttList').innerHTML=att.length?att.map(a=>`
    <div class="hi">
      <div class="hic ${a.type==='ci'?'in':'out'}">${a.type==='ci'?'✅':'🚪'}</div>
      <div class="hinfo"><div class="htype">${a.type==='ci'?'حضور':'انصراف'}${a.type==='co'&&a.durMins?` — ${Math.floor(a.durMins/60)}س ${a.durMins%60}د`:''}</div><div class="hdate">${fmtD(a.date)}</div></div>
      <div class="htime">${a.time}</div>
    </div>`).join(''):`<div class="empty"><div class="ei">📭</div><p>لا توجد سجلات</p></div>`;
  showDTab('info'); openModal('empDetailModal');
}

function openDetailBon(empId){openDetail(empId);setTimeout(()=>showDTab('bon'),150);}

function renderDBon(emp){
  const c=document.getElementById('dBonList'); if(!c)return;
  const bon=emp.bon||[];
  c.innerHTML=bon.length?[...bon].reverse().map((b,ri)=>{
    const i=bon.length-1-ri;
    return `<div class="bi"><div><div class="br2">${b.note||b.type}</div><div class="bd">${fmtD(b.date)}</div></div>
      <div class="flex g8" style="align-items:center"><div class="ba">+${fmtN(b.amount)} د.ع</div>
      <button class="btn btn-dn btn-sm btn-ic" onclick="rmBon(${i})" title="إلغاء الحافز">🗑️</button></div></div>`;
  }).join(''):`<div class="empty" style="padding:20px"><div class="ei">🎁</div><p>لا توجد حوافز</p></div>`;
}

function renderDDed(emp){
  const c=document.getElementById('dDedList'); if(!c)return;
  const ded=emp.ded||[];
  c.innerHTML=ded.length?[...ded].reverse().map((d,ri)=>{
    const i=ded.length-1-ri;
    return `<div class="di"><div><div class="br2">${d.reason}</div><div class="dd">${fmtD(d.date)}</div></div>
      <div class="flex g8" style="align-items:center"><div class="da">-${fmtN(d.amount)} د.ع</div>
      <button class="btn btn-dn btn-sm btn-ic" onclick="rmDed(${i})">🗑️</button></div></div>`;
  }).join(''):`<div class="empty" style="padding:20px"><div class="ei">✅</div><p>لا توجد خصومات</p></div>`;
}

function addBonD(){
  const type=document.getElementById('dbType').value;
  const custom=parseInt(document.getElementById('dbCustomAmt').value)||0;
  const note=document.getElementById('dbNote').value.trim();
  let amount,nm;
  if(type==='sales100'){amount=INC100;nm='حافز 100 قطعة جبن';}
  else if(type==='sales200'){amount=INC200;nm='حافز 200 قطعة جبن';}
  else if(type==='shift'){amount=SHIFT_BON;nm='دوام كامل';}
  else if(type==='shiftcustom'){amount=custom;nm='حافز شفتات مخصص';}
  else{amount=custom;nm='حافز مخصص';}
  if(!amount){showToast('أدخل مبلغاً صحيحاً','e');return}
  const emps=DB.get('emps')||[], i=emps.findIndex(e=>e.id===DID); if(i===-1)return;
  if(!emps[i].bon)emps[i].bon=[];
  emps[i].bon.push({type,amount,note:note||nm,date:todayStr()});
  DB.set('emps',emps);
  addAdminLog('bonus_add',`إضافة حافز: ${emps[i].name} +${fmtN(amount)} د.ع`,{empId:DID,amount});
  document.getElementById('dbNote').value=''; document.getElementById('dbCustomAmt').value='';
  openDetail(DID); renderAdmin();
  sendTg(`🎁 حافز جديد\n👤 ${emps[i].name}\n💰 +${fmtN(amount)} د.ع\n📝 ${note||nm}`);
  showToast(`✅ +${fmtN(amount)} د.ع`,'s');
}

function rmBon(idx){
  const emps=DB.get('emps')||[], i=emps.findIndex(e=>e.id===DID); if(i===-1)return;
  const removed=emps[i].bon.splice(idx,1)[0];
  DB.set('emps',emps); openDetail(DID); renderAdmin();
  showToast(`تم إلغاء الحافز: ${fmtN(removed?.amount)} د.ع`,'i');
}

function addDedD(){
  const amt=parseInt(document.getElementById('ddAmt').value)||0;
  const reason=document.getElementById('ddReason').value.trim();
  if(!amt||!reason){showToast('أدخل المبلغ والسبب','e');return}
  const emps=DB.get('emps')||[], i=emps.findIndex(e=>e.id===DID); if(i===-1)return;
  if(!emps[i].ded)emps[i].ded=[];
  emps[i].ded.push({amount:amt,reason,date:todayStr()});
  DB.set('emps',emps);
  addAdminLog('ded_add',`خصم: ${emps[i].name} — ${fmtN(amt)} د.ع (${reason})`,{empId:DID,amt,reason});
  document.getElementById('ddAmt').value=''; document.getElementById('ddReason').value='';
  openDetail(DID); renderAdmin();
  showToast(`خصم -${fmtN(amt)} د.ع`,'i');
}

function rmDed(idx){
  const emps=DB.get('emps')||[], i=emps.findIndex(e=>e.id===DID); if(i===-1)return;
  emps[i].ded.splice(idx,1); DB.set('emps',emps); openDetail(DID); renderAdmin();
  showToast('تم حذف الخصم','i');
}

function saveSal(){
  const v=parseInt(document.getElementById('eSalInp').value)||0; if(!v){showToast('راتب غير صحيح','e');return}
  const emps=DB.get('emps')||[], i=emps.findIndex(e=>e.id===DID); if(i===-1)return;
  addAdminLog('salary_edit',`تعديل راتب: ${emps[i].name} → ${fmtN(v)} د.ع`,{empId:DID,newSal:v});
  emps[i].sal=v; DB.set('emps',emps); openDetail(DID); renderAdmin(); showToast('✅ تم تعديل الراتب','s');
}

function saveShift(){
  const v=document.getElementById('eShiftInp').value;
  const emps=DB.get('emps')||[], i=emps.findIndex(e=>e.id===DID); if(i===-1)return;
  emps[i].sh=v;
  if(v==='custom'){emps[i].customFrom=document.getElementById('eCustomFrom').value;emps[i].customTo=document.getElementById('eCustomTo').value;}
  DB.set('emps',emps); openDetail(DID); renderAdmin(); showToast('✅ تم تعديل الشفت','s');
}

function saveEmpPw(){
  const v=document.getElementById('ePassInp').value.trim(); if(!v){showToast('أدخل كلمة المرور','e');return}
  const emps=DB.get('emps')||[], i=emps.findIndex(e=>e.id===DID); if(i===-1)return;
  emps[i].pw=v; DB.set('emps',emps); showToast('✅ تم تغيير كلمة المرور','s');
}

function saveLv(){
  const v=parseInt(document.getElementById('eLvInp').value)||0;
  const emps=DB.get('emps')||[], i=emps.findIndex(e=>e.id===DID); if(i===-1)return;
  const per=getPeriod(); emps[i]['lvM']=v;
  DB.set('emps',emps); openDetail(DID); renderAdmin(); showToast(`✅ تم تسجيل ${v} إجازة`,'s');
}

function saveNotes(){
  const v=document.getElementById('eNotesInp').value.trim();
  const emps=DB.get('emps')||[], i=emps.findIndex(e=>e.id===DID); if(i===-1)return;
  emps[i].notes=v; DB.set('emps',emps); showToast('✅ تم حفظ الملاحظات','s');
}

function deleteEmp(){
  if(!confirm('حذف هذا الموظف نهائياً؟'))return;
  let emps=DB.get('emps')||[];
  const emp=emps.find(e=>e.id===DID);
  addAdminLog('emp_del',`حذف موظف: ${emp?.name||DID}`,{empId:DID});
  emps=emps.filter(e=>e.id!==DID);
  DB.set('emps',emps); closeModal('empDetailModal'); renderAdmin(); showToast('تم الحذف','i');
}

function qDel(id){
  const emps=DB.get('emps')||[], emp=emps.find(e=>e.id===id);
  if(!confirm(`حذف ${emp?.name}?`))return;
  DB.set('emps',emps.filter(e=>e.id!==id)); renderAdmin(); showToast('تم الحذف','i');
}

function showDTab(id,el){
  document.querySelectorAll('.dtc').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.dtab').forEach(t=>t.classList.remove('active'));
  const ct=document.getElementById('dt-'+id); if(ct)ct.classList.add('active');
  if(el)el.classList.add('active');
  else{const ids=['info','sal','bon','ded','att'];const j=ids.indexOf(id);const tabs=document.querySelectorAll('.dtab');if(j>=0&&tabs[j])tabs[j].classList.add('active');}
}
function saveEmpUser(){
  const v=document.getElementById('eUserInp')?.value.trim();
  if(!v){showToast('أدخل اليوزر الجديد','e');return;}
  const emps=DB.get('emps')||[];
  const conflict=emps.find(e=>e.u===v&&e.id!==DID);
  if(conflict){showToast('اليوزر مستخدم من موظف آخر','e');return;}
  const i=emps.findIndex(e=>e.id===DID); if(i===-1)return;
  const oldUser=emps[i].u;
  emps[i].u=v;
  DB.set('emps',emps);
  addAdminLog('user_edit',`تعديل يوزر: ${emps[i].name} — ${oldUser} → ${v}`,{empId:DID});
  openDetail(DID);
  showToast(`✅ تم تغيير اليوزر إلى: ${v}`,'s');
}

// username field now populated directly in openDetail above

// ══════════════════════════════════════════════
//  جدول الأسبوع التفاعلي — تعديل شفت يومي
// ══════════════════════════════════════════════

// حفظ شفتات يومية مخصصة: {empId_dateStr: shiftKey}
function openPhotoUpload(){
  const inp=document.createElement('input');
  inp.type='file';inp.accept='image/*';
  inp.onchange=function(e){
    const file=e.target.files[0];if(!file)return;
    if(file.size>2*1024*1024){showToast('الصورة أكبر من 2MB','e');return;}
    const reader=new FileReader();
    reader.onload=function(ev){
      if(!currentUser?.id)return;
      const emps=DB.get('emps')||[];
      const i=emps.findIndex(e=>e.id===currentUser.id);
      if(i===-1)return;
      emps[i].photo=ev.target.result;
      DB.set('emps',emps);
      updateEmpAvatar(emps[i]);
      showToast('✅ تم رفع الصورة','s');
    };
    reader.readAsDataURL(file);
  };
  inp.click();
}

function updateEmpAvatar(emp){
  const av=document.getElementById('empAvBig');
  if(!av)return;
  if(emp.photo){
    av.style.background='none';
    av.innerHTML=`<img src="${emp.photo}" style="width:100%;height:100%;object-fit:cover;border-radius:14px">`;
  }else{
    av.style.background='linear-gradient(135deg,var(--gold),var(--gold2))';
    av.innerHTML=emp.name?emp.name[0]:'م';
  }
}

// ══════════════════════════════════════════════════════
//  9AM ABSENT ALERT — تنبيه من لم يبصم
// ══════════════════════════════════════════════════════
let _absentAlertShown=false;
function getEmpAvatar(uid,uname,size){
  const emps=DB.get('emps')||[];
  const emp=emps.find(e=>e.id===uid);
  const photo=emp?.photo;
  const nm=uname||'؟';
  if(photo){
    return `<img src="${photo}" style="width:${size}px;height:${size}px;border-radius:50%;object-fit:cover;flex-shrink:0" alt="${nm}">`;
  }
  return `<div style="width:${size}px;height:${size}px;border-radius:50%;background:linear-gradient(135deg,var(--gold),var(--gold2));display:flex;align-items:center;justify-content:center;font-size:${Math.round(size*0.45)}px;font-weight:800;color:#1a1200;flex-shrink:0">${nm[0]||'؟'}</div>`;
}

// ── _reloadShifts ──
function _reloadShifts(){
  const custom=DB.get('customShifts')||{};
  SHIFTS=Object.assign({},SHIFTS_DEFAULT,custom);
}

// ── deleteChatMsg — حذف رسالة من الدردشة ──
function deleteChatMsg(id, role){
  const chat=DB.get('groupChat')||[];
  const msg=chat.find(m=>m.id===id);
  if(!msg){showToast('الرسالة غير موجودة','e');return;}
  // الموظف: يحذف رسالته فقط | المدير: يحذف أي رسالة
  const emp=getEmp();
  if(role==='emp' && msg.uid!==emp?.id){showToast('لا يمكنك حذف رسالة شخص آخر','e');return;}
  if(!confirm('حذف هذه الرسالة؟'))return;
  const filtered=chat.filter(m=>m.id!==id);
  DB.set('groupChat',filtered);
  renderEmpChat();renderAdminChat();
  showToast('🗑️ تم حذف الرسالة','i');
}
function shiftLabel(emp){
  _reloadShifts();
  if(emp.sh==='custom'&&emp.customFrom&&emp.customTo)return'مخصص '+emp.customFrom+'—'+emp.customTo;
  return(SHIFTS[emp.sh]||{name:emp.sh||'غير محدد'}).name;
}

// ── Hook: add _checkAndPushSchedule to timer ──
const _origStartTimers=window.startTimers;
window.startTimers=function(){
  _origStartTimers&&_origStartTimers();
  setInterval(()=>{try{_checkAndPushSchedule();}catch(e){}},60000);
