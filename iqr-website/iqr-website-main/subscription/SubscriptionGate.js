"use client";
import { useState, useEffect } from "react";

// ═══════════════════════════════════════════════
// نظام الاشتراك — localStorage
// في الإنتاج يُستبدل بـ JWT أو session حقيقية
// ═══════════════════════════════════════════════

export function useSubscription() {
  const [subscribed, setSubscribed] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("iqr_subscription");
    if (token) {
      try {
        const data = JSON.parse(atob(token));
        if (data.expiry && data.expiry > Date.now()) {
          setSubscribed(true);
        } else {
          localStorage.removeItem("iqr_subscription");
        }
      } catch {
        localStorage.removeItem("iqr_subscription");
      }
    }
    setChecked(true);
  }, []);

  return { subscribed, checked };
}

export function activateSubscription(months = 1) {
  const expiry = Date.now() + months * 30 * 24 * 60 * 60 * 1000;
  const token = btoa(JSON.stringify({ subscribed: true, expiry, plan: "bronze" }));
  localStorage.setItem("iqr_subscription", token);
}

// ═══════════════════════════════════════════════
// BLOG GATE
// ═══════════════════════════════════════════════
const G = `
  @keyframes fadeUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
  @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
  @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
  @keyframes pulse-glow{0%,100%{box-shadow:0 0 30px rgba(205,127,50,.3)}50%{box-shadow:0 0 60px rgba(205,127,50,.6)}}
  .gate-btn{transition:all .25s ease;cursor:pointer}
  .gate-btn:hover{transform:translateY(-3px);box-shadow:0 12px 40px rgba(205,127,50,.5)!important}
`;

export function BlogGate({ children }) {
  const { subscribed, checked } = useSubscription();

  if (!checked) {
    return (
      <div style={{ minHeight: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: "Cairo", fontSize: 14, color: "rgba(240,244,255,.3)" }}>جاري التحميل...</div>
      </div>
    );
  }

  if (subscribed) return <>{children}</>;

  return (
    <>
      <style>{G}</style>
      <div style={{ position: "relative" }}>
        {/* PREVIEW — أول جزء من المحتوى مموّه */}
        <div style={{
          maxHeight: 280, overflow: "hidden", position: "relative",
          pointerEvents: "none", userSelect: "none",
        }}>
          {children}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: 200,
            background: "linear-gradient(to bottom, transparent, #000814)",
          }} />
        </div>

        {/* GATE CTA */}
        <div style={{
          marginTop: -40,
          background: "linear-gradient(135deg, #0a1628, #0d1f3d)",
          border: "1px solid rgba(205,127,50,.25)", borderRadius: 16, padding: "40px",
          textAlign: "center", position: "relative", overflow: "hidden",
          animation: "pulse-glow 3s ease-in-out infinite",
        }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(to right, #cd7f32, #f5c874, #cd7f32)", backgroundSize: "200% 100%", animation: "shimmer 3s linear infinite" }} />
          <div style={{ fontSize: 40, marginBottom: 16, animation: "float 3s ease-in-out infinite" }}>🔑</div>
          <h3 style={{ fontFamily: "Cairo", fontSize: 22, fontWeight: 900, color: "#f0f4ff", marginBottom: 10 }}>
            المحتوى الكامل للمشتركين فقط
          </h3>
          <p style={{ fontFamily: "Cairo", fontSize: 14, color: "rgba(240,244,255,.5)", lineHeight: 1.8, maxWidth: 460, margin: "0 auto 28px" }}>
            اشترك في الخطة البرونزية للوصول لهذا المقال وجميع مقالات IQR + الداشبورد التفاعلي.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 20 }}>
            <a href="/pricing/" className="gate-btn" style={{
              fontFamily: "Cairo", fontSize: 14, fontWeight: 900, padding: "14px 36px",
              background: "linear-gradient(135deg, #cd7f32, #f5c874)", color: "#000",
              borderRadius: 8, textDecoration: "none", boxShadow: "0 0 30px rgba(205,127,50,.35)",
            }}>اشترك الآن — $100/شهر 🚀</a>
            <a href="https://wa.me/9647734383431" target="_blank" style={{
              fontFamily: "Cairo", fontSize: 14, fontWeight: 700, padding: "13px 24px",
              background: "transparent", color: "rgba(240,244,255,.6)", border: "1px solid rgba(255,255,255,.12)",
              borderRadius: 8, textDecoration: "none",
            }}>📲 سؤال؟</a>
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            {["📚 9+ مقالات", "📊 داشبورد كامل", "📬 نشرة أسبوعية", "⚡ أولوية واتساب"].map((f, i) => (
              <span key={i} style={{ fontFamily: "Cairo", fontSize: 11, fontWeight: 700, padding: "4px 12px", background: "rgba(205,127,50,.1)", color: "#cd7f32", border: "1px solid rgba(205,127,50,.2)", borderRadius: 99 }}>{f}</span>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════
// DASHBOARD GATE
// ═══════════════════════════════════════════════
export function DashboardGate({ children }) {
  const { subscribed, checked } = useSubscription();

  if (!checked) {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#000814" }}>
        <div style={{ fontFamily: "Cairo", fontSize: 16, color: "rgba(240,244,255,.3)" }}>جاري التحقق...</div>
      </div>
    );
  }

  if (subscribed) return <>{children}</>;

  return (
    <>
      <style>{G}</style>
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#000814", padding: "48px", direction: "rtl" }}>
        {/* خلفية داشبورد ضبابية */}
        <div style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", filter: "blur(12px) brightness(0.25)", pointerEvents: "none" }}>
          <div style={{ background: "#0a1628", height: "100vh", padding: "24px", display: "grid", gridTemplateColumns: "220px 1fr", gap: 0 }}>
            <div style={{ background: "#030d1a", borderLeft: "1px solid rgba(255,255,255,.05)" }} />
            <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
                {[...Array(4)].map((_, i) => (<div key={i} style={{ background: "#0a1628", height: 100, borderRadius: 12, border: "1px solid rgba(255,255,255,.05)" }} />))}
              </div>
              <div style={{ background: "#0a1628", flex: 1, borderRadius: 12, border: "1px solid rgba(255,255,255,.05)" }} />
            </div>
          </div>
        </div>
        {/* Modal */}
        <div style={{
          position: "relative", zIndex: 1, maxWidth: 500, width: "100%", textAlign: "center",
          background: "linear-gradient(135deg, #0a1628, #0d1f3d)",
          border: "1px solid rgba(205,127,50,.3)", borderRadius: 20, padding: "48px",
          boxShadow: "0 40px 100px rgba(0,0,0,.6)", animation: "fadeUp .8s ease",
        }}>
          <div style={{ height: 3, background: "linear-gradient(to right, #cd7f32, #f5c874, #cd7f32)", borderRadius: "20px 20px 0 0", position: "absolute", top: 0, left: 0, right: 0, backgroundSize: "200% 100%", animation: "shimmer 3s linear infinite" }} />
          <div style={{ fontSize: 48, marginBottom: 20, animation: "float 3s ease-in-out infinite" }}>🔐</div>
          <h2 style={{ fontFamily: "Cairo", fontSize: 26, fontWeight: 900, color: "#f0f4ff", marginBottom: 12 }}>الداشبورد للمشتركين فقط</h2>
          <p style={{ fontFamily: "Cairo", fontSize: 14, color: "rgba(240,244,255,.5)", lineHeight: 1.8, marginBottom: 32 }}>
            لوحة التحكم الكاملة — إيرادات، طلبات، مخزون، موظفين، وتحليلات مباشرة. متاحة مع الخطة البرونزية.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <a href="/pricing/" className="gate-btn" style={{
              fontFamily: "Cairo", fontSize: 15, fontWeight: 900, padding: "16px",
              background: "linear-gradient(135deg, #cd7f32, #f5c874)", color: "#000",
              borderRadius: 10, textDecoration: "none", boxShadow: "0 0 40px rgba(205,127,50,.4)",
            }}>اشترك الآن — $100/شهر 🚀</a>
            <a href="/" style={{ fontFamily: "Cairo", fontSize: 14, color: "rgba(240,244,255,.4)", textDecoration: "none", padding: "10px" }}>← العودة للرئيسية</a>
          </div>
        </div>
      </div>
    </>
  );
}
