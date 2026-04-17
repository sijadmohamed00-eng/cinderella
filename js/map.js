// ═══ map.js ═══
function refreshMapData(){
  const c=document.getElementById('empLocationList');if(!c)return;
  const emps=DB.get('emps')||[];
  const att=DB.get('att')||[];
  const wl=getWorkLoc();
  let html='';
  const colors=['#f0c040','#00e676','#00e5ff','#ce93d8','#ff9800','#e94560','#42a5f5'];
  emps.forEach((e,i)=>{
    // آخر سجل له
    const empAtt=att.filter(a=>a.eid===e.id&&a.lat!=null).sort((a,b)=>new Date(b.ts)-new Date(a.ts));
    const last=empAtt[0];
    const color=colors[i%colors.length];
    const today=shiftDateStr();
    const ci=att.find(a=>a.eid===e.id&&a.date===today&&a.type==='ci');
    const co=att.find(a=>a.eid===e.id&&a.date===today&&a.type==='co');
    const status=co?'انصرف':ci?'حاضر':'غائب';
    const statusCol=co?'var(--cyan)':ci?'var(--green)':'var(--red)';
    html+=`<div class="map-emp-card" onclick="showEmpOnMap('${e.id}','${e.name}',${last?.lat||0},${last?.lng||0},'${color}')">
      <div class="map-emp-dot" style="background:${color};box-shadow:0 0 8px ${color}"></div>
      <div style="flex:1">
        <div style="font-size:13px;font-weight:700">${e.name}</div>
        <div style="font-size:11px;color:var(--t3);margin-top:2px">
          ${last?`آخر موقع: ${fmtD(last.date)} — ${last.time} | ${last.dist||'?'} م من العمل`:'لا يوجد موقع مسجل'}
        </div>
      </div>
      <span style="font-size:11px;font-weight:700;color:${statusCol}">${status}</span>
    </div>`;
  });
  c.innerHTML=html||'<div class="empty"><div class="ei">📍</div><p>لا توجد بيانات موقع</p></div>';
}
function showEmpOnMap(eid,name,lat,lng,color){
  const con=document.getElementById('adminMapContainer');if(!con)return;
  if(!lat||!lng){showToast('لا يوجد موقع مسجل لهذا الموظف','e');return;}
  const wl=getWorkLoc();
  // Use OpenStreetMap via iframe
  const url=`https://www.openstreetmap.org/export/embed.html?bbox=${lng-0.005},${lat-0.005},${lng+0.005},${lat+0.005}&layer=mapnik&marker=${lat},${lng}`;
  con.innerHTML=`
    <div style="position:relative">
      <iframe src="${url}" style="width:100%;height:380px;border:none;border-radius:12px" loading="lazy"></iframe>
      <div style="position:absolute;top:10px;right:10px;background:rgba(0,0,0,.8);border-radius:8px;padding:8px 12px;font-size:12px">
        <div style="font-weight:700;color:${color}">${name}</div>
        <div style="color:#9095b8;margin-top:2px">${lat.toFixed(5)}, ${lng.toFixed(5)}</div>
        <a href="https://maps.google.com/?q=${lat},${lng}" target="_blank" style="color:var(--cyan);font-size:11px;display:block;margin-top:4px">📍 فتح في خرائط جوجل</a>
      </div>
    </div>
    <div style="padding:10px;font-size:12px;color:var(--t2);text-align:center">
      موقع العمل: <a href="https://maps.google.com/?q=${wl.lat},${wl.lng}" target="_blank" style="color:var(--gold)">📍 ${wl.lat.toFixed(4)}, ${wl.lng.toFixed(4)}</a>
    </div>`;
}

// ══════════════════════════════════════════════════════
//  ADVANCED REPORTS — تقارير متقدمة
// ══════════════════════════════════════════════════════
let _advCharts={};
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
