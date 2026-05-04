"use client";
import { useState, useEffect } from "react";
import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";

// ── Firebase Config ──────────────────────────────────────────
const firebaseConfig = {
  apiKey:            "AIzaSyAHIkuNc8dBb9R5SNv5k5YPjqa2Nj17_h4",
  authDomain:        "cinderlla-9d209.firebaseapp.com",
  databaseURL:       "https://cinderlla-9d209-default-rtdb.firebaseio.com",
  projectId:         "cinderlla-9d209",
  storageBucket:     "cinderlla-9d209.firebasestorage.app",
  messagingSenderId: "650932623594",
  appId:             "1:650932623594:web:6af6331ec7c840ab651f93",
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db  = getDatabase(app);

// ── Styles ───────────────────────────────────────────────────
const G = `
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;900&family=Space+Mono:wght@400;700&display=swap');
  *,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
  html{scroll-behavior:smooth}
  body{background:#000814;overflow-x:hidden;font-family:'Cairo',sans-serif;color:#f0f4ff}
  ::-webkit-scrollbar{width:4px}
  ::-webkit-scrollbar-thumb{background:#1a4fc4;border-radius:99px}
  @keyframes fadeIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes orb{0%,100%{transform:translate(0,0)}50%{transform:translate(20px,-15px)}}
  .card{background:#0a1628;border:1px solid rgba(255,255,255,.06);border-radius:12px;transition:transform .2s,box-shadow .2s}
  .card:hover{transform:translateY(-3px);box-shadow:0 12px 40px rgba(26,79,196,.15)}
`;

const fmt = (n) => {
  if (!n || isNaN(n)) return "—";
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "م";
  if (n >= 1000)    return (n / 1000).toFixed(0) + "ك";
  return String(n);
};

const timeAgo = (iso) => {
  if (!iso) return "—";
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60)   return `منذ ${diff} ث`;
  if (diff < 3600) return `منذ ${Math.floor(diff/60)} د`;
  return `منذ ${Math.floor(diff/3600)} س`;
};

// ── Components ───────────────────────────────────────────────
function StatCard({ icon, label, value, unit, color = "#1a4fc4", idx = 0 }) {
  return (
    <div className="card" style={{ padding: "24px 20px", animation: `fadeIn .6s ease ${idx * .1}s both`, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: `radial-gradient(ellipse, ${color}20, transparent 70%)`, pointerEvents: "none" }} />
      <div style={{ fontSize: 28, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontFamily: "Space Mono", fontSize: 28, fontWeight: 700, color, marginBottom: 4, textShadow: `0 0 20px ${color}40` }}>
        {value !== undefined && value !== null ? fmt(value) : <span style={{ color: "rgba(240,244,255,.2)" }}>—</span>}
        {unit && <span style={{ fontSize: 13, marginRight: 4, fontFamily: "Cairo", color: "rgba(240,244,255,.4)" }}>{unit}</span>}
      </div>
      <div style={{ fontFamily: "Cairo", fontSize: 13, color: "rgba(240,244,255,.45)", fontWeight: 600 }}>{label}</div>
    </div>
  );
}

function BranchCard({ name, data, idx }) {
  const color = ["#1a4fc4","#00c3ff","#ffd60a","#00ff88"][idx % 4];
  const hasData = data && !data.error && Object.keys(data.stats || {}).length > 0;

  return (
    <div className="card" style={{ padding: "24px", animation: `fadeIn .7s ease ${idx * .12}s both`, borderTop: `2px solid ${color}30` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontFamily: "Cairo", fontSize: 16, fontWeight: 900, color: "#f0f4ff" }}>{name}</div>
        <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 99, background: hasData ? "rgba(0,255,136,.1)" : "rgba(255,68,68,.1)", color: hasData ? "#00ff88" : "#ff6666", fontWeight: 700 }}>
          {hasData ? "✓ بيانات" : data?.error ? "خطأ" : "لا بيانات"}
        </span>
      </div>

      {hasData ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {Object.entries(data.stats || {}).slice(0, 6).map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,.04)" }}>
              <span style={{ fontFamily: "Cairo", fontSize: 12, color: "rgba(240,244,255,.45)" }}>{k}</span>
              <span style={{ fontFamily: "Space Mono", fontSize: 12, color, fontWeight: 700 }}>{v}</span>
            </div>
          ))}
          {data.salesByService && Object.keys(data.salesByService).length > 0 && (
            <div style={{ marginTop: 8 }}>
              <div style={{ fontFamily: "Cairo", fontSize: 11, color: "rgba(240,244,255,.3)", marginBottom: 8, letterSpacing: ".1em" }}>المبيعات حسب الخدمة</div>
              {Object.entries(data.salesByService).map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
                  <span style={{ fontFamily: "Cairo", fontSize: 12, color: "rgba(240,244,255,.4)" }}>{k}</span>
                  <span style={{ fontFamily: "Space Mono", fontSize: 11, color }}>{fmt(v)} د.ع</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "20px 0", color: "rgba(240,244,255,.2)", fontSize: 13 }}>
          {data?.error || "في انتظار البيانات..."}
        </div>
      )}

      <div style={{ marginTop: 12, fontSize: 10, color: "rgba(240,244,255,.2)", fontFamily: "Space Mono" }}>
        {data?.scrapedAt ? timeAgo(data.scrapedAt) : "—"}
      </div>
    </div>
  );
}

// ── Main Dashboard ───────────────────────────────────────────
export default function CinderellaDashboard() {
  const [dash,   setDash]   = useState(null);
  const [meta,   setMeta]   = useState(null);
  const [sales,  setSales]  = useState(null);
  const [time,   setTime]   = useState(new Date());
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    // متابعة الداشبورد
    const dashRef = ref(db, "restaurants/cinderlla/dashboard");
    const metaRef = ref(db, "restaurants/cinderlla/meta");
    const salesRef = ref(db, `restaurants/cinderlla/sales/${today}`);

    const u1 = onValue(dashRef, snap => { setDash(snap.val()); setLoading(false); });
    const u2 = onValue(metaRef, snap => setMeta(snap.val()));
    const u3 = onValue(salesRef, snap => setSales(snap.val()));

    const timer = setInterval(() => setTime(new Date()), 1000);

    return () => { u1(); u2(); u3(); clearInterval(timer); };
  }, []);

  const syncOk = meta?.syncStatus === "success";
  const branches = ["Shaab", "Dora", "Basmaya", "Ghazaliyya"];

  return (
    <>
      <style>{G}</style>

      {/* Background */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(ellipse,rgba(26,79,196,.07),transparent 70%)", top: "-10%", right: "-5%", animation: "orb 15s ease-in-out infinite", filter: "blur(60px)" }} />
        <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(ellipse,rgba(0,195,255,.05),transparent 70%)", bottom: "10%", left: "-5%", animation: "orb 20s ease-in-out infinite reverse", filter: "blur(80px)" }} />
      </div>

      <div style={{ position: "relative", zIndex: 1, minHeight: "100vh", direction: "rtl" }}>

        {/* Top Bar */}
        <header style={{ background: "rgba(3,13,26,.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,.05)", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <a href="/" style={{ fontFamily: "Space Mono", fontSize: 18, fontWeight: 700, color: "#f0f4ff", textDecoration: "none" }}>
              IQR<span style={{ color: "#1a4fc4" }}>.</span>
            </a>
            <span style={{ color: "rgba(255,255,255,.1)" }}>|</span>
            <span style={{ fontFamily: "Cairo", fontSize: 14, fontWeight: 700, color: "rgba(240,244,255,.6)" }}>سندريلا</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ fontFamily: "Space Mono", fontSize: 12, color: "rgba(240,244,255,.3)" }}>
              {time.toLocaleTimeString("ar-IQ", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 99, background: syncOk ? "rgba(0,255,136,.08)" : "rgba(255,214,10,.08)", border: `1px solid ${syncOk ? "rgba(0,255,136,.2)" : "rgba(255,214,10,.2)"}` }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: syncOk ? "#00ff88" : "#ffd60a", animation: "pulse 1.5s infinite" }} />
              <span style={{ fontFamily: "Cairo", fontSize: 11, fontWeight: 700, color: syncOk ? "#00ff88" : "#ffd60a" }}>
                {syncOk ? "متزامن" : "في الانتظار"}
              </span>
            </div>
          </div>
        </header>

        <main style={{ padding: "24px", maxWidth: 1400, margin: "0 auto" }}>

          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", gap: 16 }}>
              <div style={{ width: 40, height: 40, border: "2px solid rgba(26,79,196,.3)", borderTop: "2px solid #1a4fc4", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
              <div style={{ fontFamily: "Cairo", color: "rgba(240,244,255,.4)" }}>جاري تحميل البيانات...</div>
            </div>
          ) : (
            <>
              {/* Meta Info */}
              {meta && (
                <div style={{ marginBottom: 24, padding: "12px 20px", background: "rgba(26,79,196,.06)", border: "1px solid rgba(26,79,196,.15)", borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                  <div style={{ fontFamily: "Cairo", fontSize: 13, color: "rgba(240,244,255,.5)" }}>
                    آخر مزامنة: <strong style={{ color: "#f0f4ff" }}>{timeAgo(meta.lastSync)}</strong>
                    {meta.durationSec && <span style={{ marginRight: 16 }}>المدة: {meta.durationSec}ث</span>}
                  </div>
                  {meta.nextSync && (
                    <div style={{ fontFamily: "Space Mono", fontSize: 11, color: "rgba(240,244,255,.3)" }}>
                      المزامنة القادمة: {new Date(meta.nextSync).toLocaleTimeString("ar-IQ", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  )}
                </div>
              )}

              {/* Stats Grid */}
              <section style={{ marginBottom: 32 }}>
                <div style={{ fontFamily: "Cairo", fontSize: 11, fontWeight: 700, letterSpacing: ".2em", color: "rgba(240,244,255,.3)", marginBottom: 16 }}>📊 إحصائيات اليوم</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 12 }}>
                  <StatCard icon="🧾" label="إجمالي الطلبات"  value={dash?.totalOrders}   color="#1a4fc4"  idx={0} />
                  <StatCard icon="💰" label="إجمالي الدخل"    value={dash?.totalIncome}   unit="د.ع" color="#00c3ff" idx={1} />
                  <StatCard icon="👥" label="الزوار"           value={dash?.totalVisitors} color="#ffd60a"  idx={2} />
                  <StatCard icon="📋" label="طلبات مفتوحة"    value={dash?.openOrders}    color="#00ff88"  idx={3} />
                  <StatCard icon="✅" label="إجمالي المدفوعات" value={dash?.totalPaid}    unit="د.ع" color="#1a4fc4"  idx={4} />
                  <StatCard icon="💳" label="رصيد الحساب"      value={dash?.balance}      unit="د.ع" color="#00c3ff" idx={5} />
                </div>
              </section>

              {/* Raw Cards (إذا ما اشتغل السحب التلقائي) */}
              {dash?.rawCards && dash.rawCards.length > 0 && (
                <section style={{ marginBottom: 32 }}>
                  <div style={{ fontFamily: "Cairo", fontSize: 11, fontWeight: 700, letterSpacing: ".2em", color: "rgba(240,244,255,.3)", marginBottom: 16 }}>📋 بيانات إضافية</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 8 }}>
                    {dash.rawCards.map((card, i) => (
                      <div key={i} className="card" style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontFamily: "Cairo", fontSize: 13, color: "rgba(240,244,255,.5)" }}>{card.label}</span>
                        <span style={{ fontFamily: "Space Mono", fontSize: 14, fontWeight: 700, color: "#1a4fc4" }}>{card.value}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Branches */}
              <section style={{ marginBottom: 32 }}>
                <div style={{ fontFamily: "Cairo", fontSize: 11, fontWeight: 700, letterSpacing: ".2em", color: "rgba(240,244,255,.3)", marginBottom: 16 }}>🏪 الفروع — مبيعات {today}</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 12 }}>
                  {branches.map((branch, i) => (
                    <BranchCard
                      key={branch}
                      name={branch}
                      data={sales?.branches?.[branch]}
                      idx={i}
                    />
                  ))}
                </div>
              </section>
            </>
          )}
        </main>

        {/* Footer */}
        <footer style={{ borderTop: "1px solid rgba(255,255,255,.05)", padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", direction: "rtl" }}>
          <span style={{ fontFamily: "Cairo", fontSize: 11, color: "rgba(240,244,255,.2)" }}>© 2026 IQR — داشبورد سندريلا</span>
          <a href="/dashboard" style={{ fontFamily: "Cairo", fontSize: 11, color: "rgba(240,244,255,.2)", textDecoration: "none" }}>← كل المطاعم</a>
        </footer>
      </div>
    </>
  );
}
