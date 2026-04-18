// ═══ sales.js ═══
function addSaleRecord(){
  const eid=document.getElementById('saleEmpSel').value;
  const platform=document.getElementById('salePlatform').value;
  const subscribed=document.getElementById('saleSubscribed').value==='yes';
  const amount=parseInt(document.getElementById('saleAmount').value)||0;
  const note=document.getElementById('saleNote').value.trim();
  const emps=DB.get('emps')||[];
  const emp=emps.find(e=>e.id===eid);if(!emp)return;
  const now=new Date();
  const rec={id:genId(),eid,ename:emp.name,platform,subscribed,amount,note,date:todayStr(),time:fmtT(now),ts:now.toISOString()};
  const sales=DB.get('salesLog')||[];sales.push(rec);DB.set('salesLog',sales);
  closeModal('addSaleModal');
  document.getElementById('saleNote').value='';
  document.getElementById('saleAmount').value='';
  renderSalesLog();renderSalesToday();
  showToast(`✅ تم تسجيل طلب ${platform} — ${emp.name}`,'s');
}
function renderSalesToday(){
  const c=document.getElementById('salesTodaySummary');if(!c)return;
  const lbl=document.getElementById('salesTodayLabel');
  const today=todayStr();
  if(lbl)lbl.textContent=fmtD(today);
  const sales=(DB.get('salesLog')||[]).filter(s=>s.date===today);
  const emps=DB.get('emps')||[];
  if(!sales.length){c.innerHTML='<div class="empty" style="padding:16px"><div class="ei">📦</div><p>لا توجد طلبات اليوم</p></div>';return;}
  const byEmp={};
  sales.forEach(s=>{
    if(!byEmp[s.eid])byEmp[s.eid]={name:s.ename,eid:s.eid,total:0,subs:0,subAmt:0,platforms:{},records:[]};
    byEmp[s.eid].total++;
    if(s.subscribed){byEmp[s.eid].subs++;byEmp[s.eid].subAmt+=(s.amount||0);}
    byEmp[s.eid].platforms[s.platform]=(byEmp[s.eid].platforms[s.platform]||0)+1;
    byEmp[s.eid].records.push(s);
  });
  const platColors={'سفري':'rgba(240,192,64,.15)','دلفري':'rgba(255,152,0,.15)','واتساب':'rgba(0,230,118,.15)','انستقرام':'rgba(206,147,216,.15)','فيسبوك':'rgba(66,165,245,.15)','حضوري':'rgba(0,229,255,.15)'};
  const platText={'سفري':'var(--gold)','دلفري':'var(--orange)','واتساب':'var(--green)','انستقرام':'var(--purple)','فيسبوك':'var(--blue)','حضوري':'var(--cyan)'};
  c.innerHTML=`<div style="padding:12px 16px">${Object.values(byEmp).map(e=>`
    <div style="background:var(--bg3);border:1px solid var(--br);border-radius:12px;padding:14px;margin-bottom:10px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;flex-wrap:wrap;gap:6px">
        <div style="font-size:14px;font-weight:800">${e.name}</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          <span style="background:rgba(0,229,255,.1);color:var(--cyan);padding:3px 10px;border-radius:6px;font-size:11px;font-weight:700">إجمالي: ${e.total}</span>
          <span style="background:rgba(0,230,118,.1);color:var(--green);padding:3px 10px;border-radius:6px;font-size:11px;font-weight:700">مشتركين: ${e.subs}</span>
          ${e.subAmt?`<span style="background:rgba(240,192,64,.1);color:var(--gold);padding:3px 10px;border-radius:6px;font-size:11px;font-weight:700">💰 ${fmtN(e.subAmt)} د.ع</span>`:''}
        </div>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px">
        ${Object.entries(e.platforms).map(([p,n])=>`<span style="background:${platColors[p]||'rgba(255,255,255,.05)'};color:${platText[p]||'var(--t1)'};padding:4px 12px;border-radius:8px;font-size:12px;font-weight:700">${p}: ${n}</span>`).join('')}
      </div>
      <div style="border-top:1px solid rgba(255,255,255,.05);padding-top:8px">
        ${e.records.map(r=>`<div style="display:flex;align-items:center;justify-content:space-between;padding:5px 0;border-bottom:1px solid rgba(255,255,255,.03);flex-wrap:wrap;gap:4px">
          <div style="display:flex;align-items:center;gap:8px">
            <span style="background:${platColors[r.platform]||'rgba(255,255,255,.05)'};color:${platText[r.platform]||'var(--t1)'};padding:2px 8px;border-radius:5px;font-size:11px">${r.platform}</span>
            ${r.subscribed?'<span style="color:var(--green);font-size:11px">✅ مشترك</span>':'<span style="color:var(--red);font-size:11px">❌</span>'}
            ${r.amount?`<span style="color:var(--gold);font-size:11px;font-weight:700">${fmtN(r.amount)} د.ع</span>`:''}
            ${r.note?`<span style="color:var(--t3);font-size:10px">${r.note}</span>`:''}
          </div>
          <div style="display:flex;align-items:center;gap:6px">
            <span style="color:var(--t3);font-size:10px">${r.time}</span>
            <button class="btn btn-sc btn-sm btn-ic" onclick="editSaleRecord('${r.id}')" style="padding:3px 6px;font-size:10px">✏️</button>
            <button class="btn btn-dn btn-sm btn-ic" onclick="deleteSaleRecord('${r.id}')" style="padding:3px 6px;font-size:10px">🗑️</button>
          </div>
        </div>`).join('')}
      </div>
    </div>`).join('')}</div>`;
}
function renderSalesLog(){
  const c=document.getElementById('salesLogList');if(!c)return;
  let sales=DB.get('salesLog')||[];
  const ef=document.getElementById('salesEmpFilter')?.value||'';
  const df=document.getElementById('salesDateFilter')?.value||'';
  if(ef)sales=sales.filter(s=>s.eid===ef);
  if(df)sales=sales.filter(s=>s.date===df);
  sales.sort((a,b)=>new Date(b.ts)-new Date(a.ts));
  if(!sales.length){c.innerHTML='<div class="empty" style="padding:20px"><div class="ei">📦</div><p>لا توجد سجلات</p></div>';return;}
  c.innerHTML=`<div class="tw"><table><thead><tr><th>الموظف</th><th>المنصة</th><th>مشترك؟</th><th>المبلغ</th><th>التاريخ</th><th>ملاحظة</th><th>إجراء</th></tr></thead><tbody>
  ${sales.map(s=>`<tr>
    <td><div class="tname"><div class="eav">${(s.ename||'?')[0]}</div>${s.ename}</div></td>
    <td><span style="font-weight:700">${s.platform}</span></td>
    <td>${s.subscribed?'<span class="tag tp">✅ نعم</span>':'<span class="tag ta">❌ لا</span>'}</td>
    <td>${s.amount?`<span class="tgld bold">${fmtN(s.amount)} د.ع</span>`:'—'}</td>
    <td>${fmtD(s.date)} <span style="color:var(--t3);font-size:10px">${s.time||''}</span></td>
    <td style="color:var(--t3);font-size:11px;max-width:100px;overflow:hidden;text-overflow:ellipsis">${s.note||'—'}</td>
    <td><div class="flex g8">
      <button class="btn btn-wa btn-sm btn-ic" onclick="editSaleRecord('${s.id}')">✏️</button>
      <button class="btn btn-dn btn-sm btn-ic" onclick="deleteSaleRecord('${s.id}')">🗑️</button>
    </div></td>
  </tr>`).join('')}
  </tbody></table></div>`;
}
function deleteSaleRecord(id){
  if(!confirm('حذف هذا السجل؟'))return;
  let sales=DB.get('salesLog')||[];
  sales=sales.filter(s=>s.id!==id);
  DB.set('salesLog',sales);
  renderSalesLog();renderSalesToday();
  showToast('🗑️ تم الحذف','i');
}
function editSaleRecord(id){
  const sales=DB.get('salesLog')||[];
  const rec=sales.find(s=>s.id===id);if(!rec)return;
  // فتح موديل التعديل
  document.getElementById('editSaleId').value=id;
  document.getElementById('editSalePlatform').value=rec.platform;
  document.getElementById('editSaleSubscribed').value=rec.subscribed?'yes':'no';
  document.getElementById('editSaleAmount').value=rec.amount||0;
  document.getElementById('editSaleNote').value=rec.note||'';
  document.getElementById('editSaleAmountWrap').style.display=rec.subscribed?'block':'none';
  openModal('editSaleModal');
}
function saveEditSale(){
  const id=document.getElementById('editSaleId').value;
  const sales=DB.get('salesLog')||[];
  const i=sales.findIndex(s=>s.id===id);if(i===-1)return;
  sales[i].platform=document.getElementById('editSalePlatform').value;
  sales[i].subscribed=document.getElementById('editSaleSubscribed').value==='yes';
  sales[i].amount=parseInt(document.getElementById('editSaleAmount').value)||0;
  sales[i].note=document.getElementById('editSaleNote').value.trim();
  DB.set('salesLog',sales);
  closeModal('editSaleModal');
  renderSalesLog();renderSalesToday();
  showToast('✅ تم التعديل','s');
}
function initSaleFilter(){
  const sel=document.getElementById('saleEmpSel');
  const fsel=document.getElementById('salesEmpFilter');
  const emps=DB.get('emps')||[];
  if(sel)sel.innerHTML=emps.map(e=>`<option value="${e.id}">${e.name}</option>`).join('');
  if(fsel&&fsel.options.length<=1)emps.forEach(e=>{const o=document.createElement('option');o.value=e.id;o.textContent=e.name;fsel.appendChild(o);});
}

// ── الإشعارات الذكية (تذكير قبل الدوام / وقت الانصراف) ──
let _smartAlertLast={};
function openAddSaleNew(){
  // تعبئة الموظفين
  const sel=document.getElementById('saleEmpSel');
  const emps=DB.get('emps')||[];
  if(sel)sel.innerHTML=emps.map(e=>`<option value="${e.id}">${e.name}</option>`).join('');
  // التاريخ اليوم
  const di=document.getElementById('saleDate');
  if(di)di.value=todayStr();
  // ربط الـ inputs بالمجموع
  ['saleFb','saleInsta','saleWa'].forEach(id=>{
    const el=document.getElementById(id);
    if(el)el.oninput=updateSaleTotalPreview;
  });
  openModal('addSaleModal');
}

function updateSaleTotalPreview(){
  const fb=parseInt(document.getElementById('saleFb')?.value)||0;
  const insta=parseInt(document.getElementById('saleInsta')?.value)||0;
  const wa=parseInt(document.getElementById('saleWa')?.value)||0;
  const el=document.getElementById('saleTotalPreview');
  if(el)el.textContent=(fb+insta+wa)+' طلب';
}

function addSaleRecordNew(){
  const eid=document.getElementById('saleEmpSel')?.value;
  const date=document.getElementById('saleDate')?.value||todayStr();
  const fb=parseInt(document.getElementById('saleFb')?.value)||0;
  const insta=parseInt(document.getElementById('saleInsta')?.value)||0;
  const wa=parseInt(document.getElementById('saleWa')?.value)||0;
  const note=document.getElementById('saleNote')?.value.trim()||'';
  if(!eid){showToast('اختر الموظف','e');return;}
  if(fb+insta+wa===0){showToast('أدخل عدد الطلبات في منصة واحدة على الأقل','e');return;}
  const emps=DB.get('emps')||[];
  const emp=emps.find(e=>e.id===eid);if(!emp)return;
  const sales=DB.get('salesLog')||[];
  const now=new Date();
  if(fb>0)sales.push({id:genId(),eid,ename:emp.name,platform:'فيسبوك',count:fb,note,date,time:fmtT(now),ts:now.toISOString()});
  if(insta>0)sales.push({id:genId(),eid,ename:emp.name,platform:'انستقرام',count:insta,note,date,time:fmtT(now),ts:now.toISOString()});
  if(wa>0)sales.push({id:genId(),eid,ename:emp.name,platform:'واتساب',count:wa,note,date,time:fmtT(now),ts:now.toISOString()});
  DB.set('salesLog',sales);
  ['saleFb','saleInsta','saleWa'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  const snEl=document.getElementById('saleNote');if(snEl)snEl.value='';
  const sp=document.getElementById('saleTotalPreview');if(sp)sp.textContent='0 طلب';
  closeModal('addSaleModal');
  renderSalesToday();renderSalesLog();renderSalesStatsNew();
  showToast(`✅ تم تسجيل ${fb+insta+wa} طلب — ${emp.name}`,'s');
}

function renderSalesToday(){
  const c=document.getElementById('salesTodaySummary');if(!c)return;
  const lbl=document.getElementById('salesTodayLabel');
  const today=todayStr();
  if(lbl)lbl.textContent=fmtD(today);
  const sales=(DB.get('salesLog')||[]).filter(s=>s.date===today);
  const emps=DB.get('emps')||[];
  if(!sales.length){c.innerHTML='<div class="empty" style="padding:16px"><div class="ei">📦</div><p>لا توجد طلبات اليوم</p></div>';return;}
  // تجميع حسب موظف
  const byEmp={};
  sales.forEach(s=>{
    if(!byEmp[s.eid])byEmp[s.eid]={name:s.ename,fb:0,insta:0,wa:0,total:0};
    const cnt=s.count||1;
    if(s.platform==='فيسبوك')byEmp[s.eid].fb+=cnt;
    else if(s.platform==='انستقرام')byEmp[s.eid].insta+=cnt;
    else if(s.platform==='واتساب')byEmp[s.eid].wa+=cnt;
    byEmp[s.eid].total+=cnt;
  });
  c.innerHTML=`<div style="padding:12px 16px">
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px">
    ${Object.values(byEmp).map(e=>`
      <div style="background:var(--bg3);border:1px solid var(--br);border-radius:12px;padding:14px">
        <div style="font-size:14px;font-weight:800;margin-bottom:10px">${e.name}</div>
        <div style="display:flex;gap:8px;margin-bottom:8px;flex-wrap:wrap">
          ${e.fb?`<div style="display:flex;align-items:center;gap:5px;background:rgba(66,165,245,.1);border:1px solid rgba(66,165,245,.2);border-radius:8px;padding:5px 10px"><svg width="14" height="14" viewBox="0 0 24 24" fill="#42a5f5"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg><span style="font-size:13px;font-weight:800;color:var(--blue)">${e.fb}</span></div>`:''}
          ${e.insta?`<div style="display:flex;align-items:center;gap:5px;background:rgba(206,147,216,.1);border:1px solid rgba(206,147,216,.2);border-radius:8px;padding:5px 10px"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ce93d8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><circle cx="17.5" cy="6.5" r=".5" fill="#ce93d8"/></svg><span style="font-size:13px;font-weight:800;color:var(--purple)">${e.insta}</span></div>`:''}
          ${e.wa?`<div style="display:flex;align-items:center;gap:5px;background:rgba(0,230,118,.1);border:1px solid rgba(0,230,118,.2);border-radius:8px;padding:5px 10px"><svg width="14" height="14" viewBox="0 0 24 24" fill="#00e676"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg><span style="font-size:13px;font-weight:800;color:var(--green)">${e.wa}</span></div>`:''}
        </div>
        <div style="font-size:12px;color:var(--t2)">الإجمالي: <span style="color:var(--cyan);font-weight:800">${e.total}</span> طلب</div>
      </div>`).join('')}
    </div></div>`;
}

function renderSalesStatsNew(){
  const c=document.getElementById('salesRangeStats');if(!c)return;
  const eid=document.getElementById('salesFilterEmpNew')?.value||'';
  const from=document.getElementById('salesFromDate')?.value||'';
  const to=document.getElementById('salesToDate')?.value||'';
  let sales=DB.get('salesLog')||[];
  if(eid)sales=sales.filter(s=>s.eid===eid);
  if(from)sales=sales.filter(s=>s.date>=from);
  if(to)sales=sales.filter(s=>s.date<=to);
  if(!sales.length){c.innerHTML='<div class="empty" style="padding:16px"><div class="ei">📊</div><p>لا توجد بيانات للفترة المحددة</p></div>';return;}
  const byEmp={};
  sales.forEach(s=>{
    if(!byEmp[s.eid])byEmp[s.eid]={name:s.ename,fb:0,insta:0,wa:0,total:0};
    const cnt=s.count||1;
    if(s.platform==='فيسبوك')byEmp[s.eid].fb+=cnt;
    else if(s.platform==='انستقرام')byEmp[s.eid].insta+=cnt;
    else if(s.platform==='واتساب')byEmp[s.eid].wa+=cnt;
    byEmp[s.eid].total+=cnt;
  });
  // إجمالي التطبيقات
  let totFb=0,totInsta=0,totWa=0;
  Object.values(byEmp).forEach(e=>{totFb+=e.fb;totInsta+=e.insta;totWa+=e.wa;});
  const grandTotal=totFb+totInsta+totWa;
  const rangeLabel=from&&to?`${fmtD(from)} — ${fmtD(to)}`:from?`من ${fmtD(from)}`:to?`حتى ${fmtD(to)}`:'كل الفترات';
  c.innerHTML=`
    <div style="font-size:11px;color:var(--t2);margin-bottom:12px">${rangeLabel}</div>
    <!-- إجمالي المنصات -->
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px">
      <div style="background:rgba(66,165,245,.08);border:1px solid rgba(66,165,245,.2);border-radius:10px;padding:12px;text-align:center">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="#42a5f5" style="margin-bottom:6px"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
        <div style="font-size:20px;font-weight:900;color:var(--blue)">${totFb}</div>
        <div style="font-size:10px;color:var(--t2)">فيسبوك</div>
      </div>
      <div style="background:rgba(206,147,216,.08);border:1px solid rgba(206,147,216,.2);border-radius:10px;padding:12px;text-align:center">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ce93d8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:6px"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><circle cx="17.5" cy="6.5" r=".5" fill="#ce93d8"/></svg>
        <div style="font-size:20px;font-weight:900;color:var(--purple)">${totInsta}</div>
        <div style="font-size:10px;color:var(--t2)">انستقرام</div>
      </div>
      <div style="background:rgba(0,230,118,.08);border:1px solid rgba(0,230,118,.2);border-radius:10px;padding:12px;text-align:center">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="#00e676" style="margin-bottom:6px"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
        <div style="font-size:20px;font-weight:900;color:var(--green)">${totWa}</div>
        <div style="font-size:10px;color:var(--t2)">واتساب</div>
      </div>
    </div>
    <div style="background:rgba(240,192,64,.06);border:1px solid rgba(240,192,64,.15);border-radius:10px;padding:10px;text-align:center;margin-bottom:16px">
      <span style="font-size:12px;color:var(--t2)">إجمالي الطلبات: </span><span style="font-size:20px;font-weight:900;color:var(--gold)">${grandTotal}</span>
    </div>
    <!-- تفاصيل كل موظف -->
    <div style="font-size:12px;font-weight:700;color:var(--t2);margin-bottom:8px">تفاصيل كل موظف</div>
    <div class="tw"><table><thead><tr><th>الموظف</th>
      <th><svg width="14" height="14" viewBox="0 0 24 24" fill="#42a5f5" style="vertical-align:middle"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></th>
      <th><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ce93d8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><circle cx="17.5" cy="6.5" r=".5" fill="#ce93d8"/></svg></th>
      <th><svg width="14" height="14" viewBox="0 0 24 24" fill="#00e676" style="vertical-align:middle"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg></th>
      <th>الإجمالي</th></tr></thead><tbody>
    ${Object.values(byEmp).sort((a,b)=>b.total-a.total).map(e=>`<tr>
      <td><div class="tname"><div class="eav">${e.name[0]}</div>${e.name}</div></td>
      <td><span class="bold" style="color:var(--blue)">${e.fb||'—'}</span></td>
      <td><span class="bold" style="color:var(--purple)">${e.insta||'—'}</span></td>
      <td><span class="bold" style="color:var(--green)">${e.wa||'—'}</span></td>
      <td><span class="bold tcyn">${e.total}</span></td>
    </tr>`).join('')}
    </tbody></table></div>`;
}

// تفعيل تنبيه 9 صباحاً في الـ timer
setInterval(()=>{try{check9amAbsent();}catch(e){}},60000);

// hook showATab لـ leave_mgmt وsales
const __origShowATab2=window.showATab;
window.showATab=function(id,el){
  __origShowATab2&&__origShowATab2(id,el);
  if(id==='leave_mgmt'){_populateLeaveMgmt();renderLeaveMgmtList();}
  if(id==='sales'){
    const emps=DB.get('emps')||[];
    const fsel=document.getElementById('salesFilterEmpNew');
    if(fsel&&fsel.options.length<=1)emps.forEach(e=>{const o=document.createElement('option');o.value=e.id;o.textContent=e.name;fsel.appendChild(o);});
    renderSalesToday();renderSalesLog();
  }
};

// تحديث avatar عند تحميل شاشة الموظف
const __origLoadEmpScreen=window.loadEmpScreen;
if(__origLoadEmpScreen){
  window.loadEmpScreen=function(emp){
    __origLoadEmpScreen(emp);
    updateEmpAvatar(emp);
  };
}


// ══════════════════════════════════════════════════════
//  CUSTOM SHIFTS — إضافة شفتات جديدة
// ══════════════════════════════════════════════════════
function openAddShiftModal(){openModal('addShiftModal');}
