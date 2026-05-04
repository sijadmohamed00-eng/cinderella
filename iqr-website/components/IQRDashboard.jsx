"use client";
import { useState, useEffect, useRef, useCallback } from "react";

// ═══════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════
const MOCK = {
  stats: [
    { id:"revenue", label:"الإيرادات اليوم", value:847500, prev:712000, unit:"د.ع", icon:"💰", color:"#ff2d7a" },
    { id:"orders",  label:"الطلبات",         value:143,    prev:118,    unit:"طلب", icon:"🧾", color:"#00c3ff" },
    { id:"waste",   label:"الهدر",           value:4.2,    prev:6.8,    unit:"%",   icon:"♻️", color:"#ffd60a" },
    { id:"rating",  label:"رضا العملاء",     value:94,     prev:91,     unit:"%",   icon:"⭐", color:"#00ff88" },
  ],
  orders: [
    { id:"ORD-441", table:7,  items:["برغر دبل","كولا","بطاطا"],      status:"done",     time:"14:32", amount:18500, station:"A" },
    { id:"ORD-442", table:3,  items:["شاورما دجاج","عصير برتقال"],    status:"preparing", time:"14:38", amount:12000, station:"B" },
    { id:"ORD-443", table:12, items:["بيتزا مارغريتا","ماء"],         status:"pending",  time:"14:41", amount:22000, station:"A" },
    { id:"ORD-444", table:1,  items:["كباب مشوي","خبز","مشروب"],      status:"preparing", time:"14:43", amount:16500, station:"C" },
    { id:"ORD-445", table:9,  items:["سلطة سيزر","شوربة عدس"],        status:"pending",  time:"14:45", amount:9500,  station:"B" },
    { id:"ORD-446", table:5,  items:["ستيك ريب آي","بطاطا مهروسة"],   status:"done",     time:"14:28", amount:35000, station:"A" },
    { id:"ORD-447", table:8,  items:["دجاج مشوي","أرز","سلطة"],       status:"preparing", time:"14:40", amount:14000, station:"C" },
  ],
  inventory: [
    { id:1, name:"دجاج",         unit:"كغ",  current:12,  min:20, max:100, cost:8500,  supplier:"شركة الطيور الذهبية" },
    { id:2, name:"لحم بقر",      unit:"كغ",  current:8,   min:15, max:80,  cost:15000, supplier:"مزرعة الأمل" },
    { id:3, name:"أرز بسمتي",    unit:"كغ",  current:45,  min:20, max:120, cost:3200,  supplier:"مستودع الحبوب" },
    { id:4, name:"طماطم",        unit:"كغ",  current:18,  min:10, max:60,  cost:1800,  supplier:"سوق الخضروات" },
    { id:5, name:"زيت نباتي",    unit:"لتر", current:6,   min:10, max:50,  cost:4500,  supplier:"شركة الزيوت" },
    { id:6, name:"خبز عربي",     unit:"رغيف",current:89,  min:50, max:200, cost:500,   supplier:"مخبز الأصيل" },
    { id:7, name:"جبن موزاريلا", unit:"كغ",  current:4,   min:8,  max:40,  cost:12000, supplier:"ألبان الشرق" },
    { id:8, name:"بطاطا",        unit:"كغ",  current:32,  min:15, max:80,  cost:1200,  supplier:"سوق الخضروات" },
  ],
  employees: [
    { id:1, name:"أحمد محمد",    role:"طباخ رئيسي",  shift:"صباحي",  orders:42, rating:96, status:"active",   avatar:"أح" },
    { id:2, name:"سارة علي",     role:"كاشير",        shift:"صباحي",  orders:38, rating:98, status:"active",   avatar:"سع" },
    { id:3, name:"محمد حسين",    role:"طباخ مساعد",  shift:"مسائي",  orders:31, rating:89, status:"break",    avatar:"مح" },
    { id:4, name:"فاطمة كريم",   role:"خدمة طاولات", shift:"صباحي",  orders:29, rating:94, status:"active",   avatar:"فك" },
    { id:5, name:"علي عبدالله",  role:"طباخ مساعد",  shift:"مسائي",  orders:0,  rating:91, status:"off",      avatar:"عع" },
    { id:6, name:"زينب جاسم",    role:"كاشير",        shift:"مسائي",  orders:0,  rating:95, status:"off",      avatar:"زج" },
  ],
  weeklyRevenue: [420000,510000,380000,680000,720000,590000,847500],
  weekDays: ["السبت","الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة"],
  topItems: [
    { name:"برغر دبل",     orders:48, revenue:888000, margin:62 },
    { name:"شاورما دجاج",  orders:41, revenue:492000, margin:71 },
    { name:"ستيك ريب آي",  orders:22, revenue:770000, margin:48 },
    { name:"بيتزا مارغريتا",orders:35, revenue:770000, margin:58 },
    { name:"كباب مشوي",    orders:29, revenue:478500, margin:66 },
  ],
  peakHours: [2,1,0,0,1,3,8,14,18,22,19,24,28,31,26,22,18,29,34,38,32,24,15,8],
  notifications: [
    { id:1, type:"warning", msg:"مخزون الدجاج وصل للحد الأدنى — 12 كغ متبقي",    time:"منذ 5 دقائق" },
    { id:2, type:"warning", msg:"مخزون الجبن الموزاريلا منخفض — 4 كغ متبقي",     time:"منذ 12 دقيقة" },
    { id:3, type:"success", msg:"تم إرسال طلبية تلقائية لشركة الطيور الذهبية",    time:"منذ 5 دقائق" },
    { id:4, type:"info",    msg:"ذروة متوقعة بين 7-9 مساءً — استعد بـ ٣ طباخين", time:"منذ 18 دقيقة" },
    { id:5, type:"success", msg:"الإيرادات اليوم تجاوزت هدف الأمس بـ 19%",       time:"منذ 30 دقيقة" },
  ],
};

// ═══════════════════════════════════════════════════════════════
// GLOBAL STYLES
// ═══════════════════════════════════════════════════════════════
const G = `
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;900&family=Space+Mono:wght@400;700&display=swap');
  *,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
  html{scroll-behavior:smooth}
  body{background:#000814;overflow-x:hidden;cursor:default;font-family:'Cairo',sans-serif}
  ::-webkit-scrollbar{width:4px}
  ::-webkit-scrollbar-track{background:#000814}
  ::-webkit-scrollbar-thumb{background:#ff2d7a;border-radius:99px}
  @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes slideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
  @keyframes glowPulse{0%,100%{box-shadow:0 0 20px rgba(255,45,122,.3)}50%{box-shadow:0 0 40px rgba(255,45,122,.6)}}
  @keyframes barGrow{from{height:0}to{height:var(--h)}}
  @keyframes countUp{from{opacity:0;transform:scale(.8)}to{opacity:1;transform:scale(1)}}
  @keyframes notifSlide{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:translateX(0)}}
  @keyframes orb{0%,100%{transform:translate(0,0)}50%{transform:translate(30px,-20px)}}
  .card-hover{transition:transform .2s ease,box-shadow .2s ease}
  .card-hover:hover{transform:translateY(-3px);box-shadow:0 12px 40px rgba(255,45,122,.15)!important}
  .btn-hover{transition:all .2s ease}
  .btn-hover:hover{transform:translateY(-2px);filter:brightness(1.1)}
  .row-hover{transition:background .15s ease}
  .row-hover:hover{background:rgba(255,45,122,.04)!important}
  .nav-item{transition:all .2s ease;cursor:pointer}
  .nav-item:hover{background:rgba(255,255,255,.05)!important}
  .nav-item.active{background:rgba(255,45,122,.1)!important;border-right:2px solid #ff2d7a}
`;

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════
const fmt = (n) => n >= 1000000 ? (n/1000000).toFixed(1)+"م" : n >= 1000 ? (n/1000).toFixed(0)+"ك" : n;
const pct = (cur, prev) => (((cur-prev)/prev)*100).toFixed(1);
const clamp = (v,min,max) => Math.min(Math.max(v,min),max);

function useCounter(target, active, duration=1200) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = 0; const step = target/60;
    const id = setInterval(() => {
      start = Math.min(start+step, target);
      setVal(parseFloat(start.toFixed(1)));
      if (start >= target) clearInterval(id);
    }, duration/60);
    return () => clearInterval(id);
  }, [active, target]);
  return val;
}

function useVisible(ref) {
  const [v, setV] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if(e.isIntersecting){setV(true);obs.disconnect();} }, {threshold:.1});
    if(ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return v;
}

// ═══════════════════════════════════════════════════════════════
// STATUS BADGE
// ═══════════════════════════════════════════════════════════════
const STATUS_MAP = {
  done:      { label:"منجز",     color:"#00ff88", bg:"rgba(0,255,136,.1)"  },
  preparing: { label:"يُحضَّر",  color:"#ffd60a", bg:"rgba(255,214,10,.1)" },
  pending:   { label:"انتظار",   color:"#00c3ff", bg:"rgba(0,195,255,.1)"  },
  active:    { label:"نشط",      color:"#00ff88", bg:"rgba(0,255,136,.1)"  },
  break:     { label:"استراحة",  color:"#ffd60a", bg:"rgba(255,214,10,.1)" },
  off:       { label:"غائب",     color:"rgba(240,244,255,.3)", bg:"rgba(255,255,255,.05)" },
  warning:   { label:"تحذير",    color:"#ffd60a", bg:"rgba(255,214,10,.08)" },
  success:   { label:"نجاح",     color:"#00ff88", bg:"rgba(0,255,136,.08)" },
  info:      { label:"معلومة",   color:"#00c3ff", bg:"rgba(0,195,255,.08)" },
};
function Badge({type}) {
  const s = STATUS_MAP[type] || STATUS_MAP.info;
  return <span style={{fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:99,color:s.color,background:s.bg,letterSpacing:".05em",whiteSpace:"nowrap"}}>{s.label}</span>;
}

// ═══════════════════════════════════════════════════════════════
// MINI SPARKLINE
// ═══════════════════════════════════════════════════════════════
function Sparkline({data, color="#ff2d7a", h=36}) {
  const max = Math.max(...data), min = Math.min(...data);
  const pts = data.map((v,i) => {
    const x = (i/(data.length-1))*100;
    const y = h - ((v-min)/(max-min||1))*(h-4) - 2;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width="100%" height={h} viewBox={`0 0 100 ${h}`} preserveAspectRatio="none" style={{overflow:"visible"}}>
      <defs>
        <linearGradient id={`sg-${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity=".3"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polyline fill="none" stroke={color} strokeWidth="1.5" points={pts} strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════
// BAR CHART
// ═══════════════════════════════════════════════════════════════
function BarChart({data, labels, color="#ff2d7a", active}) {
  const max = Math.max(...data);
  return (
    <div style={{display:"flex",alignItems:"flex-end",gap:6,height:120,padding:"0 4px"}}>
      {data.map((v,i) => {
        const h = active ? `${(v/max)*100}%` : "0%";
        const isToday = i === data.length-1;
        return (
          <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:6,height:"100%",justifyContent:"flex-end"}}>
            <div style={{width:"100%",borderRadius:"3px 3px 0 0",background:isToday?color:`${color}55`,
              height:active?`${(v/max)*100}%`:"0%",transition:`height 1s cubic-bezier(.4,0,.2,1) ${i*.06}s`,
              boxShadow:isToday?`0 0 12px ${color}60`:"none",position:"relative",minHeight:2}}/>
            <span style={{fontFamily:"Space Mono",fontSize:9,color:"rgba(240,244,255,.3)",whiteSpace:"nowrap"}}>{labels[i]}</span>
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PEAK HOURS HEATMAP
// ═══════════════════════════════════════════════════════════════
function PeakHours({data, active}) {
  const max = Math.max(...data);
  return (
    <div style={{display:"flex",gap:3,alignItems:"flex-end",height:60}}>
      {data.map((v,i) => {
        const pct = v/max;
        const color = pct > .8 ? "#ff2d7a" : pct > .5 ? "#ffd60a" : pct > .2 ? "#00c3ff" : "rgba(255,255,255,.1)";
        return (
          <div key={i} title={`${i}:00 — ${v} طلب`} style={{flex:1,borderRadius:2,background:color,
            height:active?`${Math.max(pct*100,4)}%`:"4%",transition:`height .8s ease ${i*.02}s`,
            opacity:active?1:0,cursor:"default"}}/>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// STAT CARD
// ═══════════════════════════════════════════════════════════════
function StatCard({stat, idx}) {
  const ref = useRef(null);
  const visible = useVisible(ref);
  const val = useCounter(stat.value, visible);
  const diff = pct(stat.value, stat.prev);
  const up = parseFloat(diff) >= 0;
  return (
    <div ref={ref} className="card-hover" style={{
      background:"#0a1628",border:"1px solid rgba(255,255,255,.05)",borderRadius:12,padding:"28px 24px",
      position:"relative",overflow:"hidden",
      opacity:visible?1:0,transform:visible?"none":"translateY(20px)",
      transition:`opacity .6s ease ${idx*.1}s, transform .6s ease ${idx*.1}s`
    }}>
      <div style={{position:"absolute",top:-30,right:-30,width:100,height:100,borderRadius:"50%",
        background:`radial-gradient(ellipse, ${stat.color}20, transparent 70%)`,pointerEvents:"none"}}/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
        <div style={{width:44,height:44,borderRadius:10,background:`${stat.color}15`,border:`1px solid ${stat.color}30`,
          display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{stat.icon}</div>
        <span style={{fontSize:12,fontWeight:700,color:up?"#00ff88":"#ff2d7a",
          background:up?"rgba(0,255,136,.08)":"rgba(255,45,122,.08)",padding:"4px 10px",borderRadius:99}}>
          {up?"+":""}{diff}%
        </span>
      </div>
      <div style={{fontFamily:"Space Mono",fontSize:28,fontWeight:700,color:stat.color,lineHeight:1,marginBottom:6,
        animation:visible?"countUp .5s ease both":"none"}}>
        {stat.id==="revenue" ? fmt(Math.round(val)) : val.toFixed(stat.id==="waste"||stat.id==="rating"?1:0)}{stat.unit==="د.ع"?" د.ع":stat.unit==="طلب"?" طلب":stat.unit==="%" ? "%" : ""}
      </div>
      <div style={{fontSize:13,color:"rgba(240,244,255,.4)",fontWeight:600}}>{stat.label}</div>
      <Sparkline data={MOCK.weeklyRevenue.map(v=>v*(0.5+Math.random()))} color={stat.color}/>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ORDERS TABLE
// ═══════════════════════════════════════════════════════════════
function OrdersPanel({orders, setOrders}) {
  const [filter, setFilter] = useState("all");
  const filtered = filter==="all" ? orders : orders.filter(o=>o.status===filter);

  const nextStatus = (id) => {
    setOrders(prev => prev.map(o => {
      if(o.id!==id) return o;
      const next = o.status==="pending"?"preparing":o.status==="preparing"?"done":"done";
      return {...o, status:next};
    }));
  };

  return (
    <div style={{background:"#0a1628",border:"1px solid rgba(255,255,255,.05)",borderRadius:12,overflow:"hidden"}}>
      <div style={{padding:"20px 24px",borderBottom:"1px solid rgba(255,255,255,.05)",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
        <div>
          <h3 style={{fontSize:16,fontWeight:900,color:"#f0f4ff",marginBottom:2}}>إدارة الطلبات</h3>
          <span style={{fontSize:12,color:"rgba(240,244,255,.35)"}}>مباشر — آخر تحديث الآن</span>
        </div>
        <div style={{display:"flex",gap:6}}>
          {["all","pending","preparing","done"].map(f => (
            <button key={f} onClick={()=>setFilter(f)} style={{
              fontFamily:"Cairo",fontSize:12,fontWeight:700,padding:"6px 14px",borderRadius:6,border:"none",cursor:"pointer",
              background:filter===f?"#ff2d7a":"rgba(255,255,255,.05)",
              color:filter===f?"#fff":"rgba(240,244,255,.5)",transition:"all .2s"
            }}>
              {f==="all"?"الكل":f==="pending"?"انتظار":f==="preparing"?"يُحضَّر":"منجز"}
            </button>
          ))}
        </div>
      </div>
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",direction:"rtl"}}>
          <thead>
            <tr style={{borderBottom:"1px solid rgba(255,255,255,.04)"}}>
              {["الرقم","الطاولة","الأصناف","المحطة","المبلغ","الوقت","الحالة","إجراء"].map(h => (
                <th key={h} style={{padding:"12px 16px",fontSize:11,fontWeight:700,color:"rgba(240,244,255,.3)",letterSpacing:".08em",textAlign:"right",whiteSpace:"nowrap"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((o,i) => (
              <tr key={o.id} className="row-hover" style={{borderBottom:"1px solid rgba(255,255,255,.03)",animation:`fadeIn .4s ease ${i*.05}s both`}}>
                <td style={{padding:"14px 16px",fontFamily:"Space Mono",fontSize:12,color:"rgba(240,244,255,.5)"}}>{o.id}</td>
                <td style={{padding:"14px 16px"}}>
                  <span style={{fontFamily:"Space Mono",fontSize:14,fontWeight:700,color:"#f0f4ff"}}>#{o.table}</span>
                </td>
                <td style={{padding:"14px 16px",maxWidth:200}}>
                  <span style={{fontSize:12,color:"rgba(240,244,255,.55)",lineHeight:1.6}}>{o.items.join(" · ")}</span>
                </td>
                <td style={{padding:"14px 16px"}}>
                  <span style={{fontFamily:"Space Mono",fontSize:13,fontWeight:700,color:"#00c3ff",
                    background:"rgba(0,195,255,.08)",padding:"4px 10px",borderRadius:6}}>{o.station}</span>
                </td>
                <td style={{padding:"14px 16px",fontFamily:"Space Mono",fontSize:13,fontWeight:700,color:"#00ff88",whiteSpace:"nowrap"}}>
                  {o.amount.toLocaleString()} د.ع
                </td>
                <td style={{padding:"14px 16px",fontFamily:"Space Mono",fontSize:12,color:"rgba(240,244,255,.35)"}}>{o.time}</td>
                <td style={{padding:"14px 16px"}}><Badge type={o.status}/></td>
                <td style={{padding:"14px 16px"}}>
                  {o.status!=="done" && (
                    <button onClick={()=>nextStatus(o.id)} className="btn-hover" style={{
                      fontFamily:"Cairo",fontSize:11,fontWeight:700,padding:"6px 14px",borderRadius:6,
                      border:"1px solid rgba(255,45,122,.3)",background:"rgba(255,45,122,.08)",
                      color:"#ff2d7a",cursor:"pointer",whiteSpace:"nowrap"
                    }}>
                      {o.status==="pending"?"→ تحضير":"→ أنجز"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length===0 && (
          <div style={{padding:"40px",textAlign:"center",color:"rgba(240,244,255,.2)",fontSize:14}}>لا توجد طلبات</div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// INVENTORY PANEL
// ═══════════════════════════════════════════════════════════════
function InventoryPanel() {
  const [items, setItems] = useState(MOCK.inventory);
  const [search, setSearch] = useState("");
  const filtered = items.filter(i=>i.name.includes(search));

  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
        <div>
          <h3 style={{fontSize:16,fontWeight:900,color:"#f0f4ff",marginBottom:2}}>المخزون</h3>
          <span style={{fontSize:12,color:"rgba(240,244,255,.35)"}}>
            {items.filter(i=>i.current<=i.min).length} أصناف تحتاج إعادة طلب
          </span>
        </div>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 بحث..." style={{
          fontFamily:"Cairo",fontSize:13,padding:"8px 16px",background:"rgba(255,255,255,.05)",
          border:"1px solid rgba(255,255,255,.08)",borderRadius:8,color:"#f0f4ff",outline:"none",width:180
        }}/>
      </div>

      {/* Alert bar */}
      {items.filter(i=>i.current<=i.min).length > 0 && (
        <div style={{background:"rgba(255,214,10,.06)",border:"1px solid rgba(255,214,10,.2)",borderRadius:10,padding:"14px 20px",display:"flex",alignItems:"center",gap:12}}>
          <span style={{fontSize:18}}>⚠️</span>
          <span style={{fontSize:13,color:"#ffd60a",fontWeight:700}}>
            {items.filter(i=>i.current<=i.min).length} أصناف وصلت للحد الأدنى — سيتم إرسال طلبيات تلقائية للموردين
          </span>
        </div>
      )}

      {/* Table */}
      <div style={{background:"#0a1628",border:"1px solid rgba(255,255,255,.05)",borderRadius:12,overflow:"hidden"}}>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",direction:"rtl"}}>
            <thead>
              <tr style={{borderBottom:"1px solid rgba(255,255,255,.04)"}}>
                {["الصنف","المتوفر","الحد الأدنى","المورد","السعر/الوحدة","الحالة","إجراء"].map(h=>(
                  <th key={h} style={{padding:"12px 16px",fontSize:11,fontWeight:700,color:"rgba(240,244,255,.3)",letterSpacing:".08em",textAlign:"right",whiteSpace:"nowrap"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((item,i)=>{
                const pct = item.current/item.max;
                const low = item.current <= item.min;
                const critical = item.current <= item.min*0.6;
                const color = critical?"#ff2d7a":low?"#ffd60a":"#00ff88";
                return (
                  <tr key={item.id} className="row-hover" style={{borderBottom:"1px solid rgba(255,255,255,.03)"}}>
                    <td style={{padding:"14px 16px"}}>
                      <span style={{fontSize:14,fontWeight:700,color:low?"#ffd60a":"#f0f4ff"}}>{item.name}</span>
                    </td>
                    <td style={{padding:"14px 16px",minWidth:140}}>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <div style={{flex:1,height:4,background:"rgba(255,255,255,.05)",borderRadius:99,overflow:"hidden"}}>
                          <div style={{height:"100%",background:color,borderRadius:99,width:`${clamp(pct*100,2,100)}%`,transition:"width 1s ease",boxShadow:`0 0 8px ${color}80`}}/>
                        </div>
                        <span style={{fontFamily:"Space Mono",fontSize:12,color,whiteSpace:"nowrap"}}>{item.current} {item.unit}</span>
                      </div>
                    </td>
                    <td style={{padding:"14px 16px",fontFamily:"Space Mono",fontSize:12,color:"rgba(240,244,255,.35)"}}>{item.min} {item.unit}</td>
                    <td style={{padding:"14px 16px",fontSize:12,color:"rgba(240,244,255,.5)"}}>{item.supplier}</td>
                    <td style={{padding:"14px 16px",fontFamily:"Space Mono",fontSize:12,color:"#00c3ff",whiteSpace:"nowrap"}}>{item.cost.toLocaleString()} د.ع</td>
                    <td style={{padding:"14px 16px"}}><Badge type={critical?"warning":low?"warning":"active"}/></td>
                    <td style={{padding:"14px 16px"}}>
                      {low && (
                        <button className="btn-hover" onClick={()=>setItems(prev=>prev.map(p=>p.id===item.id?{...p,current:p.max*.7|0}:p))} style={{
                          fontFamily:"Cairo",fontSize:11,fontWeight:700,padding:"6px 14px",borderRadius:6,
                          border:"1px solid rgba(255,214,10,.3)",background:"rgba(255,214,10,.08)",
                          color:"#ffd60a",cursor:"pointer",whiteSpace:"nowrap"
                        }}>طلب مورد</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// EMPLOYEES PANEL
// ═══════════════════════════════════════════════════════════════
function EmployeesPanel() {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <h3 style={{fontSize:16,fontWeight:900,color:"#f0f4ff",marginBottom:2}}>الموظفون</h3>
          <span style={{fontSize:12,color:"rgba(240,244,255,.35)"}}>
            {MOCK.employees.filter(e=>e.status==="active").length} نشط · {MOCK.employees.filter(e=>e.status==="break").length} استراحة · {MOCK.employees.filter(e=>e.status==="off").length} غائب
          </span>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:12}}>
        {MOCK.employees.map((emp,i)=>{
          const s = STATUS_MAP[emp.status];
          return (
            <div key={emp.id} className="card-hover" style={{
              background:"#0a1628",border:"1px solid rgba(255,255,255,.05)",borderRadius:12,padding:"20px",
              animation:`fadeUp .5s ease ${i*.08}s both`,opacity:emp.status==="off"?.5:1
            }}>
              <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:16}}>
                <div style={{width:44,height:44,borderRadius:12,background:`${s.color}20`,border:`1px solid ${s.color}40`,
                  display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Space Mono",fontSize:14,fontWeight:700,color:s.color}}>
                  {emp.avatar}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:700,color:"#f0f4ff"}}>{emp.name}</div>
                  <div style={{fontSize:12,color:"rgba(240,244,255,.4)"}}>{emp.role}</div>
                </div>
                <Badge type={emp.status}/>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                {[
                  {label:"الوردية",val:emp.shift,mono:false},
                  {label:"الطلبات",val:emp.orders,mono:true},
                  {label:"التقييم",val:`${emp.rating}%`,mono:true},
                ].map(m=>(
                  <div key={m.label} style={{background:"rgba(255,255,255,.03)",borderRadius:8,padding:"8px",textAlign:"center"}}>
                    <div style={{fontFamily:m.mono?"Space Mono":"Cairo",fontSize:13,fontWeight:700,color:"#f0f4ff",marginBottom:2}}>{m.val}</div>
                    <div style={{fontSize:10,color:"rgba(240,244,255,.3)"}}>{m.label}</div>
                  </div>
                ))}
              </div>
              {emp.status!=="off" && (
                <div style={{marginTop:12}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"rgba(240,244,255,.3)",marginBottom:6}}>
                    <span>الأداء</span><span style={{color:"#00ff88"}}>{emp.rating}%</span>
                  </div>
                  <div style={{height:3,background:"rgba(255,255,255,.05)",borderRadius:99}}>
                    <div style={{height:"100%",background:`linear-gradient(to left, #00ff88, #00c3ff)`,borderRadius:99,width:`${emp.rating}%`,transition:"width 1s ease"}}/>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ANALYTICS PANEL
// ═══════════════════════════════════════════════════════════════
function AnalyticsPanel() {
  const ref = useRef(null);
  const visible = useVisible(ref);

  return (
    <div ref={ref} style={{display:"flex",flexDirection:"column",gap:20}}>
      <h3 style={{fontSize:16,fontWeight:900,color:"#f0f4ff"}}>التحليلات</h3>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        {/* Weekly Revenue */}
        <div style={{background:"#0a1628",border:"1px solid rgba(255,255,255,.05)",borderRadius:12,padding:"24px"}}>
          <div style={{fontSize:13,fontWeight:700,color:"rgba(240,244,255,.5)",marginBottom:4}}>الإيرادات الأسبوعية</div>
          <div style={{fontFamily:"Space Mono",fontSize:24,fontWeight:700,color:"#ff2d7a",marginBottom:16}}>
            {visible ? fmt(MOCK.weeklyRevenue.reduce((a,b)=>a+b,0)) : "—"} د.ع
          </div>
          <BarChart data={MOCK.weeklyRevenue} labels={MOCK.weekDays} color="#ff2d7a" active={visible}/>
        </div>

        {/* Peak Hours */}
        <div style={{background:"#0a1628",border:"1px solid rgba(255,255,255,.05)",borderRadius:12,padding:"24px"}}>
          <div style={{fontSize:13,fontWeight:700,color:"rgba(240,244,255,.5)",marginBottom:4}}>ساعات الذروة</div>
          <div style={{fontSize:12,color:"rgba(240,244,255,.35)",marginBottom:16}}>التوزيع على 24 ساعة</div>
          <PeakHours data={MOCK.peakHours} active={visible}/>
          <div style={{display:"flex",gap:12,marginTop:12}}>
            {[{c:"#ff2d7a",l:"ذروة"},{c:"#ffd60a",l:"مرتفع"},{c:"#00c3ff",l:"متوسط"},{c:"rgba(255,255,255,.1)",l:"منخفض"}].map(l=>(
              <div key={l.l} style={{display:"flex",alignItems:"center",gap:6}}>
                <div style={{width:8,height:8,borderRadius:2,background:l.c}}/>
                <span style={{fontSize:10,color:"rgba(240,244,255,.3)"}}>{l.l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Items */}
      <div style={{background:"#0a1628",border:"1px solid rgba(255,255,255,.05)",borderRadius:12,padding:"24px"}}>
        <div style={{fontSize:13,fontWeight:700,color:"rgba(240,244,255,.5)",marginBottom:20}}>أفضل الأصناف أداءً</div>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {MOCK.topItems.map((item,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:16}}>
              <span style={{fontFamily:"Space Mono",fontSize:11,color:"rgba(240,244,255,.25)",width:20,textAlign:"center"}}>{i+1}</span>
              <div style={{flex:1}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                  <span style={{fontSize:13,fontWeight:700,color:"#f0f4ff"}}>{item.name}</span>
                  <div style={{display:"flex",gap:16}}>
                    <span style={{fontFamily:"Space Mono",fontSize:12,color:"rgba(240,244,255,.4)"}}>{item.orders} طلب</span>
                    <span style={{fontFamily:"Space Mono",fontSize:12,color:"#00ff88"}}>{item.margin}% ربح</span>
                    <span style={{fontFamily:"Space Mono",fontSize:12,color:"#ff2d7a"}}>{fmt(item.revenue)} د.ع</span>
                  </div>
                </div>
                <div style={{height:3,background:"rgba(255,255,255,.04)",borderRadius:99}}>
                  <div style={{height:"100%",borderRadius:99,background:`linear-gradient(to left, #ff2d7a, #00c3ff)`,
                    width:visible?`${(item.orders/MOCK.topItems[0].orders)*100}%`:"0%",
                    transition:`width 1s ease ${i*.15}s`,boxShadow:"0 0 8px rgba(255,45,122,.4)"}}/>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Insight Cards */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:12}}>
        {[
          {icon:"🤖",title:"توصية الذكاء",text:"زيادة طلبيات الدجاج والجبن الموزاريلا — يُتوقع ارتفاع 35% في الطلب خلال ساعتين",color:"#ff2d7a"},
          {icon:"📈",title:"توقع الذروة",text:"ذروة قادمة 7-9 م — يُنصح بتجهيز 3 طباخين وفتح محطة D",color:"#00c3ff"},
          {icon:"💡",title:"فرصة ربح",text:"ستيك ريب آي: هامش ربح 48% — رفع السعر 5% لن يؤثر على الطلب",color:"#ffd60a"},
        ].map((c,i)=>(
          <div key={i} className="card-hover" style={{background:"#0a1628",border:`1px solid ${c.color}25`,borderRadius:12,padding:"20px",
            animation:`fadeUp .5s ease ${i*.1}s both`}}>
            <div style={{fontSize:24,marginBottom:12}}>{c.icon}</div>
            <div style={{fontSize:13,fontWeight:900,color:c.color,marginBottom:8}}>{c.title}</div>
            <div style={{fontSize:12,color:"rgba(240,244,255,.45)",lineHeight:1.7}}>{c.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// NOTIFICATIONS PANEL
// ═══════════════════════════════════════════════════════════════
function NotificationsPanel({onClose}) {
  return (
    <div style={{position:"fixed",top:72,left:24,width:360,background:"#0a1628",border:"1px solid rgba(255,255,255,.08)",
      borderRadius:12,boxShadow:"0 20px 60px rgba(0,0,0,.6)",zIndex:200,overflow:"hidden",animation:"slideIn .25s ease"}}>
      <div style={{padding:"16px 20px",borderBottom:"1px solid rgba(255,255,255,.05)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontSize:14,fontWeight:900,color:"#f0f4ff"}}>الإشعارات</span>
        <button onClick={onClose} style={{background:"none",border:"none",color:"rgba(240,244,255,.4)",cursor:"pointer",fontSize:18,lineHeight:1}}>×</button>
      </div>
      {MOCK.notifications.map((n,i)=>{
        const s = STATUS_MAP[n.type];
        return (
          <div key={n.id} style={{padding:"14px 20px",borderBottom:"1px solid rgba(255,255,255,.04)",
            background:i%2===0?"rgba(255,255,255,.01)":"transparent",animation:`notifSlide .3s ease ${i*.06}s both`}}>
            <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:s.color,marginTop:5,flexShrink:0,boxShadow:`0 0 6px ${s.color}`}}/>
              <div>
                <div style={{fontSize:12,color:"rgba(240,244,255,.7)",lineHeight:1.6,marginBottom:4}}>{n.msg}</div>
                <div style={{fontSize:10,color:"rgba(240,244,255,.25)"}}>{n.time}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SETTINGS PANEL
// ═══════════════════════════════════════════════════════════════
function SettingsPanel() {
  const [info, setInfo] = useState({name:"مطعم الأصيل",city:"بغداد",phone:"07700000000",email:"info@restaurant.iq",tables:15,capacity:60});
  const [saved, setSaved] = useState(false);
  const save = () => { setSaved(true); setTimeout(()=>setSaved(false),2500); };

  const Field = ({label, fkey, type="text"}) => (
    <div>
      <label style={{fontSize:12,fontWeight:700,color:"rgba(240,244,255,.4)",display:"block",marginBottom:6}}>{label}</label>
      <input type={type} value={info[fkey]} onChange={e=>setInfo(p=>({...p,[fkey]:e.target.value}))} style={{
        width:"100%",fontFamily:"Cairo",fontSize:14,padding:"10px 14px",background:"rgba(255,255,255,.04)",
        border:"1px solid rgba(255,255,255,.08)",borderRadius:8,color:"#f0f4ff",outline:"none",
        transition:"border .2s"
      }} onFocus={e=>e.target.style.borderColor="#ff2d7a"} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,.08)"}/>
    </div>
  );

  return (
    <div style={{display:"flex",flexDirection:"column",gap:20,maxWidth:640}}>
      <h3 style={{fontSize:16,fontWeight:900,color:"#f0f4ff"}}>الإعدادات</h3>
      <div style={{background:"#0a1628",border:"1px solid rgba(255,255,255,.05)",borderRadius:12,padding:"24px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <div style={{gridColumn:"1/-1",fontSize:13,fontWeight:700,color:"rgba(240,244,255,.4)",marginBottom:4}}>معلومات المطعم</div>
        <Field label="اسم المطعم" fkey="name"/>
        <Field label="المدينة" fkey="city"/>
        <Field label="رقم الهاتف" fkey="phone"/>
        <Field label="البريد الإلكتروني" fkey="email" type="email"/>
        <Field label="عدد الطاولات" fkey="tables" type="number"/>
        <Field label="الطاقة الاستيعابية" fkey="capacity" type="number"/>
      </div>
      <button onClick={save} className="btn-hover" style={{
        fontFamily:"Cairo",fontSize:14,fontWeight:700,padding:"12px 32px",borderRadius:8,border:"none",cursor:"pointer",
        background:saved?"#00ff88":"#ff2d7a",color:saved?"#000":"#fff",
        boxShadow:saved?"0 0 20px rgba(0,255,136,.4)":"0 0 20px rgba(255,45,122,.3)",
        transition:"all .3s",alignSelf:"flex-start"
      }}>
        {saved?"✓ تم الحفظ":"حفظ الإعدادات"}
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SIDEBAR
// ═══════════════════════════════════════════════════════════════
const NAV = [
  {id:"overview",   icon:"⬡", label:"نظرة عامة"},
  {id:"orders",     icon:"🧾", label:"الطلبات"},
  {id:"inventory",  icon:"📦", label:"المخزون"},
  {id:"employees",  icon:"👥", label:"الموظفون"},
  {id:"analytics",  icon:"📊", label:"التحليلات"},
  {id:"settings",   icon:"⚙️", label:"الإعدادات"},
];

function Sidebar({active, setActive, collapsed, setCollapsed}) {
  return (
    <aside style={{
      width:collapsed?68:220,background:"#030d1a",borderLeft:"1px solid rgba(255,255,255,.05)",
      display:"flex",flexDirection:"column",transition:"width .3s cubic-bezier(.4,0,.2,1)",
      flexShrink:0,position:"sticky",top:0,height:"100vh",overflow:"hidden",zIndex:50
    }}>
      {/* Logo */}
      <div style={{padding:"20px 16px",borderBottom:"1px solid rgba(255,255,255,.04)",display:"flex",alignItems:"center",gap:12,cursor:"pointer"}} onClick={()=>setCollapsed(c=>!c)}>
        <div style={{width:36,height:36,borderRadius:8,background:"linear-gradient(135deg,#ff2d7a,#ff6b9d)",
          display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Space Mono",fontSize:13,fontWeight:700,color:"#fff",flexShrink:0}}>IQ</div>
        {!collapsed && <span style={{fontFamily:"Space Mono",fontSize:14,fontWeight:700,color:"#f0f4ff",whiteSpace:"nowrap"}}>IQR<span style={{color:"#ff2d7a",fontSize:10,marginRight:4}}>داشبورد</span></span>}
      </div>

      {/* Nav */}
      <nav style={{flex:1,padding:"12px 8px",display:"flex",flexDirection:"column",gap:2}}>
        {NAV.map(item=>(
          <button key={item.id} onClick={()=>setActive(item.id)}
            className={`nav-item${active===item.id?" active":""}`}
            style={{width:"100%",display:"flex",alignItems:"center",gap:12,padding:"10px 12px",borderRadius:8,border:"none",
              background:"transparent",cursor:"pointer",color:active===item.id?"#f0f4ff":"rgba(240,244,255,.4)",
              transition:"all .2s",textAlign:"right",direction:"rtl",position:"relative"}}>
            <span style={{fontSize:18,flexShrink:0,lineHeight:1}}>{item.icon}</span>
            {!collapsed && <span style={{fontFamily:"Cairo",fontSize:13,fontWeight:700,whiteSpace:"nowrap"}}>{item.label}</span>}
            {active===item.id && <div style={{position:"absolute",right:0,top:"20%",bottom:"20%",width:2,background:"#ff2d7a",borderRadius:99}}/>}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div style={{padding:"16px",borderTop:"1px solid rgba(255,255,255,.04)"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:32,height:32,borderRadius:8,background:"rgba(255,45,122,.2)",
            display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Space Mono",fontSize:11,color:"#ff2d7a",flexShrink:0}}>AD</div>
          {!collapsed && (
            <div>
              <div style={{fontSize:12,fontWeight:700,color:"#f0f4ff"}}>المدير</div>
              <div style={{fontSize:10,color:"rgba(240,244,255,.3)"}}>Admin</div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

// ═══════════════════════════════════════════════════════════════
// TOPBAR
// ═══════════════════════════════════════════════════════════════
function TopBar({activePage, showNotif, setShowNotif}) {
  const [time, setTime] = useState(new Date());
  useEffect(()=>{const id=setInterval(()=>setTime(new Date()),1000);return()=>clearInterval(id);},[]);
  const pageLabels = {overview:"نظرة عامة",orders:"الطلبات",inventory:"المخزون",employees:"الموظفون",analytics:"التحليلات",settings:"الإعدادات"};

  return (
    <header style={{height:64,background:"rgba(3,13,26,.95)",backdropFilter:"blur(20px)",borderBottom:"1px solid rgba(255,255,255,.05)",
      display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 24px",position:"sticky",top:0,zIndex:100,direction:"rtl"}}>
      <div style={{display:"flex",alignItems:"center",gap:16}}>
        <div>
          <h1 style={{fontSize:16,fontWeight:900,color:"#f0f4ff",lineHeight:1}}>{pageLabels[activePage]}</h1>
          <span style={{fontSize:11,color:"rgba(240,244,255,.3)"}}>IQR — لوحة التحكم</span>
        </div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:16}}>
        <div style={{fontFamily:"Space Mono",fontSize:12,color:"rgba(240,244,255,.3)"}}>
          {time.toLocaleTimeString("ar-IQ",{hour:"2-digit",minute:"2-digit",second:"2-digit"})}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:6,background:"rgba(0,255,136,.08)",border:"1px solid rgba(0,255,136,.2)",borderRadius:99,padding:"4px 12px"}}>
          <span style={{width:6,height:6,borderRadius:"50%",background:"#00ff88",animation:"pulse 1.5s infinite"}}/>
          <span style={{fontFamily:"Cairo",fontSize:11,fontWeight:700,color:"#00ff88"}}>مباشر</span>
        </div>
        <button onClick={()=>setShowNotif(v=>!v)} style={{position:"relative",background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.08)",borderRadius:8,width:38,height:38,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,transition:"all .2s"}}
          onMouseEnter={e=>e.currentTarget.style.borderColor="#ff2d7a"}
          onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(255,255,255,.08)"}>
          🔔
          <span style={{position:"absolute",top:6,right:6,width:8,height:8,borderRadius:"50%",background:"#ff2d7a",border:"2px solid #030d1a",animation:"pulse 2s infinite"}}/>
        </button>
      </div>
    </header>
  );
}

// ═══════════════════════════════════════════════════════════════
// OVERVIEW PAGE
// ═══════════════════════════════════════════════════════════════
function OverviewPage({orders, setOrders}) {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:24}}>
      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:16}}>
        {MOCK.stats.map((s,i)=><StatCard key={s.id} stat={s} idx={i}/>)}
      </div>

      {/* Quick charts row */}
      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:16}}>
        <div style={{background:"#0a1628",border:"1px solid rgba(255,255,255,.05)",borderRadius:12,padding:"24px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <div>
              <div style={{fontSize:13,fontWeight:700,color:"rgba(240,244,255,.5)"}}>الإيرادات الأسبوعية</div>
              <div style={{fontFamily:"Space Mono",fontSize:22,fontWeight:700,color:"#ff2d7a",marginTop:4}}>
                {fmt(MOCK.weeklyRevenue.reduce((a,b)=>a+b,0))} د.ع
              </div>
            </div>
            <span style={{fontSize:12,color:"#00ff88",background:"rgba(0,255,136,.08)",padding:"4px 12px",borderRadius:99,fontWeight:700}}>+19% ↑</span>
          </div>
          <BarChart data={MOCK.weeklyRevenue} labels={MOCK.weekDays} color="#ff2d7a" active={true}/>
        </div>
        <div style={{background:"#0a1628",border:"1px solid rgba(255,255,255,.05)",borderRadius:12,padding:"24px"}}>
          <div style={{fontSize:13,fontWeight:700,color:"rgba(240,244,255,.5)",marginBottom:4}}>ساعات الذروة</div>
          <div style={{fontSize:12,color:"rgba(240,244,255,.25)",marginBottom:16}}>اليوم — 24 ساعة</div>
          <PeakHours data={MOCK.peakHours} active={true}/>
          <div style={{marginTop:16,padding:"12px",background:"rgba(255,45,122,.06)",borderRadius:8,border:"1px solid rgba(255,45,122,.15)"}}>
            <div style={{fontSize:12,color:"#ff2d7a",fontWeight:700,marginBottom:2}}>⚡ ذروة قادمة</div>
            <div style={{fontSize:11,color:"rgba(240,244,255,.4)"}}>7:00 — 9:00 م · جهّز 3 طباخين</div>
          </div>
        </div>
      </div>

      {/* Recent orders */}
      <OrdersPanel orders={orders.slice(0,5)} setOrders={setOrders}/>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// BACKGROUND PARTICLES (LIGHTWEIGHT)
// ═══════════════════════════════════════════════════════════════
function DashBg() {
  return (
    <div style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none",overflow:"hidden"}}>
      <div style={{position:"absolute",width:600,height:600,borderRadius:"50%",background:"radial-gradient(ellipse,rgba(255,45,122,.06),transparent 70%)",top:"-10%",right:"-10%",animation:"orb 15s ease-in-out infinite",filter:"blur(60px)"}}/>
      <div style={{position:"absolute",width:500,height:500,borderRadius:"50%",background:"radial-gradient(ellipse,rgba(0,195,255,.05),transparent 70%)",bottom:"10%",left:"-10%",animation:"orb 20s ease-in-out infinite reverse",filter:"blur(80px)"}}/>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN DASHBOARD APP
// ═══════════════════════════════════════════════════════════════
export default function IQRDashboard() {
  const [activePage, setActivePage] = useState("overview");
  const [collapsed, setCollapsed] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [orders, setOrders] = useState(MOCK.orders);

  // Simulate real-time order additions
  useEffect(()=>{
    const id = setInterval(()=>{
      const tables=[2,4,6,10,11,13];
      const items=[["برغر دبل","كولا"],["شاورما دجاج"],["بيتزا","ماء"],["كباب","خبز"]];
      const newOrder = {
        id:`ORD-${440+Math.floor(Math.random()*100)}`,
        table:tables[Math.floor(Math.random()*tables.length)],
        items:items[Math.floor(Math.random()*items.length)],
        status:"pending",
        time:new Date().toLocaleTimeString("ar-IQ",{hour:"2-digit",minute:"2-digit"}),
        amount:Math.floor(8000+Math.random()*25000),
        station:["A","B","C"][Math.floor(Math.random()*3)]
      };
      setOrders(prev=>[newOrder,...prev.slice(0,19)]);
    },12000);
    return()=>clearInterval(id);
  },[]);

  const renderPage = () => {
    switch(activePage) {
      case "overview":   return <OverviewPage orders={orders} setOrders={setOrders}/>;
      case "orders":     return <OrdersPanel orders={orders} setOrders={setOrders}/>;
      case "inventory":  return <InventoryPanel/>;
      case "employees":  return <EmployeesPanel/>;
      case "analytics":  return <AnalyticsPanel/>;
      case "settings":   return <SettingsPanel/>;
      default:           return <OverviewPage orders={orders} setOrders={setOrders}/>;
    }
  };

  return (
    <>
      <style>{G}</style>
      <DashBg/>
      <div style={{display:"flex",height:"100vh",direction:"rtl",position:"relative",zIndex:1}}>
        <Sidebar active={activePage} setActive={setActivePage} collapsed={collapsed} setCollapsed={setCollapsed}/>
        <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
          <TopBar activePage={activePage} showNotif={showNotif} setShowNotif={setShowNotif}/>
          <main style={{flex:1,overflowY:"auto",padding:"24px",animation:"fadeIn .4s ease"}}>
            {renderPage()}
          </main>
        </div>
      </div>
      {showNotif && <NotificationsPanel onClose={()=>setShowNotif(false)}/>}
    </>
  );
}
