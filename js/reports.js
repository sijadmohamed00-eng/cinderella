// ═══ reports.js ═══
function renderReportsList(){
  const c=document.getElementById('repList'); if(!c)return;
  const reports=DB.get('reports')||[];
  const rc=document.getElementById('repCount'), rl=document.getElementById('repLast');
  if(rc)rc.textContent=reports.length;
  if(rl)rl.textContent=reports.length?`${fmtD(reports[0].date)} ${reports[0].time}`:'--';
  c.innerHTML=reports.length?reports.map(r=>`
    <div class="report-item" onclick="viewReport('${r.id}')">
      <div class="rep-head"><div class="rep-title">📋 تقرير ${r.type==='auto'?'تلقائي':'يدوي'} — ${fmtD(r.date)}</div><div class="rep-date">${r.time}</div></div>
      <span class="rep-type ${r.type==='auto'?'rep-daily':'rep-manual'}">${r.type==='auto'?'تلقائي':'يدوي'}</span>
      <div style="font-size:11px;color:var(--t3);margin-top:6px;overflow:hidden;max-height:40px">${r.text.substring(0,100)}...</div>
    </div>`).join(''):`<div class="empty"><div class="ei">📋</div><p>لا توجد تقارير<br><small>تُرسل تلقائياً كل 4 صباحاً</small></p></div>`;
}

function viewReport(id){
  const rep=(DB.get('reports')||[]).find(r=>r.id===id); if(!rep)return;
  viewingReportId=id;
  document.getElementById('repViewContent').textContent=rep.text;
  openModal('repViewModal');
}

function sendSavedReportToTg(){
  const rep=(DB.get('reports')||[]).find(r=>r.id===viewingReportId);
  if(rep){sendTg(rep.text);showToast('📤 تم الإرسال','s');}
}

// ═══════════════════════════════════════════════════
//  ADD EMPLOYEE
// ═══════════════════════════════════════════════════
function handleShiftChange(prefix){
  const sel=document.getElementById(prefix==='ne'?'neShift':prefix==='e'?'eShiftInp':'qsShift');
  const wrap=document.getElementById(prefix==='ne'?'neCustomWrap':prefix==='e'?'eCustomWrap':'qsCustomWrap');
  if(wrap)wrap.style.display=sel.value==='custom'?'block':'none';
}

function openAddEmp(){
function exportAttExcel(){
  const att=DB.get('att')||[];
  const df=document.getElementById('attDate')?.value||'';
  let data=df?att.filter(a=>a.date===df):att;
  data=data.sort((a,b)=>new Date(b.ts)-new Date(a.ts));
  let csv='الموظف,النوع,التاريخ,الوقت,المسافة (م)\n';
  data.forEach(a=>{
    csv+=`${a.ename||''},${a.type==='ci'?'حضور':'انصراف'},${a.date},${a.time},${a.dist||''}\n`;
  });
  const bom='\uFEFF';
  const blob=new Blob([bom+csv],{type:'text/csv;charset=utf-8'});
  const url=URL.createObjectURL(blob);
  const link=document.createElement('a');link.href=url;
  link.download=`حضور-${df||todayStr()}.csv`;link.click();
  showToast('✅ تم تصدير Excel','s');
}

// ── تصدير رواتب Excel ──
function exportSalaryExcel(){
  const emps=DB.get('emps')||[];
  let csv='الموظف,الراتب الشهري,الحضور,الإجمالي المكتسب,الحوافز,الخصومات,الصافي\n';
  emps.forEach(e=>{
    const c=calcSalary(e);
    csv+=`${e.name},${e.sal},${c.daysPresent},${c.earnedSalary},${c.totalBon},${c.totalDed},${c.net}\n`;
  });
  const bom='\uFEFF';
  const blob=new Blob([bom+csv],{type:'text/csv;charset=utf-8'});
  const url=URL.createObjectURL(blob);
  const link=document.createElement('a');link.href=url;
  link.download=`رواتب-${todayStr()}.csv`;link.click();
  showToast('✅ تم تصدير Excel','s');
}

// ── إحصائيات المبيعات/الطلبات ──
function addSaleRecord(){
function checkWeeklyReport(){
  const now=new Date();
  if(now.getDay()!==5)return; // الجمعة
  const today=todayStr();
  const lastWeekly=DB.get('lastWeeklyReport')||'';
  if(lastWeekly===today)return;
  DB.set('lastWeeklyReport',today);
  buildWeeklyReport();
}
function buildWeeklyReport(){
  const emps=DB.get('emps')||[];
  const att=DB.get('att')||[];
  const now=new Date();
  // آخر 7 أيام
  const days=[];
  for(let i=6;i>=0;i--){const d=new Date(now);d.setDate(d.getDate()-i);days.push(d.toISOString().split('T')[0]);}
  let text=`📊 التقرير الأسبوعي — سندريلا\n`;
  text+=`الأسبوع: ${fmtD(days[0])} — ${fmtD(days[6])}\n`;
  text+=`━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  emps.forEach(e=>{
    const pres=days.filter(d=>att.some(a=>a.eid===e.id&&a.date===d&&a.type==='ci'));
    const c=calcSalary(e);
    text+=`👤 ${e.name}\n`;
    text+=`  حضور الأسبوع: ${pres.length}/7 أيام\n`;
    text+=`  الحوافز: +${fmtN(c.totalBon)} د.ع\n`;
    text+=`  الإجمالي حتى الآن: ${fmtN(c.net)} د.ع\n\n`;
  });
  sendTg(text);
  saveReportToArchive(text,'weekly');
}

// ══════════════════════════════════════════════════════
//  GROUP CHAT — الدردشة الجماعية
// ══════════════════════════════════════════════════════
function renderAdvReports(){
  const days=parseInt(document.getElementById('advRepPeriod')?.value||'7');
  const emps=DB.get('emps')||[];
  const att=DB.get('att')||[];
  const now=new Date();
  // Build date range
  const dates=[];
  for(let i=days-1;i>=0;i--){const d=new Date(now);d.setDate(d.getDate()-i);dates.push(d.toISOString().split('T')[0]);}
  const labels=dates.map(d=>new Date(d+'T12:00:00').toLocaleDateString('ar-IQ',{day:'numeric',month:'short'}));
  const chartDefaults={responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:'#9095b8',font:{family:'Cairo',size:11}}}},scales:{y:{ticks:{color:'#5a6080'},grid:{color:'rgba(255,255,255,.05)'}},x:{ticks:{color:'#9095b8'},grid:{display:false}}}};

  // 1. Attendance trend
  const attData=dates.map(d=>new Set(att.filter(a=>a.date===d&&a.type==='ci').map(a=>a.eid)).size);
  _buildChart('attTrendChart','line',labels,[{label:'عدد الحاضرين',data:attData,borderColor:'rgba(0,229,255,.9)',backgroundColor:'rgba(0,229,255,.15)',borderWidth:2,fill:true,tension:0.4}],chartDefaults);

  // 2. Salary + bonus per employee
  const salLabels=emps.map(e=>e.name.split(' ')[0]);
  const salData=emps.map(e=>calcSalary(e).earnedSalary);
  const bonData=emps.map(e=>calcSalary(e).totalBon);
  _buildChart('salDistChart','bar',salLabels,[
    {label:'الراتب المكتسب',data:salData,backgroundColor:'rgba(240,192,64,.5)',borderColor:'rgba(240,192,64,.9)',borderWidth:2,borderRadius:6},
    {label:'الحوافز',data:bonData,backgroundColor:'rgba(0,230,118,.4)',borderColor:'rgba(0,230,118,.8)',borderWidth:2,borderRadius:6}
  ],chartDefaults);

  // 3. Per employee attendance % in period
  const attPctData=emps.map(e=>{
    const pDays=dates.filter(d=>att.some(a=>a.eid===e.id&&a.date===d&&a.type==='ci')).length;
    return Math.round(pDays/days*100);
  });
  _buildChart('empAttChart','bar',salLabels,[{label:'نسبة الحضور %',data:attPctData,backgroundColor:attPctData.map(v=>v>=80?'rgba(0,230,118,.5)':v>=50?'rgba(255,152,0,.5)':'rgba(233,69,96,.5)'),borderWidth:2,borderRadius:6}],{...chartDefaults,scales:{...chartDefaults.scales,y:{...chartDefaults.scales.y,max:100}}});

  // 4. Bonus types pie
  const allBon={shift:0,sales100:0,sales200:0,custom:0};
  const per=getPeriod();
  const ps=per.start.toISOString().split('T')[0], pe=per.end.toISOString().split('T')[0];
  emps.forEach(e=>(e.bon||[]).filter(b=>b.date>=ps&&b.date<=pe).forEach(b=>{if(allBon[b.type]!==undefined)allBon[b.type]+=b.amount;else allBon.custom+=b.amount;}));
  _buildChart('bonDistChart','doughnut',['شفت كامل','100 قطعة','200 قطعة','مخصص'],[{data:Object.values(allBon),backgroundColor:['rgba(240,192,64,.6)','rgba(0,229,255,.6)','rgba(0,230,118,.6)','rgba(206,147,216,.6)'],borderColor:['rgba(240,192,64,.9)','rgba(0,229,255,.9)','rgba(0,230,118,.9)','rgba(206,147,216,.9)'],borderWidth:2}],{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:'#9095b8',font:{family:'Cairo',size:11}}}}});
}
function _buildChart(id,type,labels,datasets,opts){
  const canvas=document.getElementById(id);if(!canvas)return;
  if(_advCharts[id]){_advCharts[id].destroy();}
  _advCharts[id]=new Chart(canvas.getContext('2d'),{type,data:{labels,datasets},options:opts});
}
function exportAdvReportExcel(){
  const days=parseInt(document.getElementById('advRepPeriod')?.value||'7');
  const emps=DB.get('emps')||[];
  const att=DB.get('att')||[];
  const now=new Date();
  const dates=[];
  for(let i=days-1;i>=0;i--){const d=new Date(now);d.setDate(d.getDate()-i);dates.push(d.toISOString().split('T')[0]);}
  let csv='الموظف,';
  csv+=dates.join(',')+',الإجمالي\n';
  emps.forEach(e=>{
    const row=dates.map(d=>att.some(a=>a.eid===e.id&&a.date===d&&a.type==='ci')?'✓':'✗');
    const total=row.filter(r=>r==='✓').length;
    csv+=`${e.name},${row.join(',')},${total}\n`;
  });
  const bom='\uFEFF';
  const blob=new Blob([bom+csv],{type:'text/csv;charset=utf-8'});
  const url=URL.createObjectURL(blob);
  const link=document.createElement('a');link.href=url;link.download=`تقرير-متقدم-${todayStr()}.csv`;link.click();
  showToast('✅ تم تصدير Excel','s');
}

// ══════════════════════════════════════════════════════
//  AUTO CLOUD BACKUP — نسخة احتياطية تلقائية
// ══════════════════════════════════════════════════════
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

