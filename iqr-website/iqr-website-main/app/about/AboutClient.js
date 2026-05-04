"use client";
import { useState, useEffect, useRef } from "react";

const G = `
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;900&family=Space+Mono:wght@400;700&display=swap');
  *,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
  html{scroll-behavior:smooth}
  body{background:#000814;overflow-x:hidden;font-family:'Cairo',sans-serif}
  ::-webkit-scrollbar{width:4px}
  ::-webkit-scrollbar-thumb{background:#1a4fc4;border-radius:99px}
  @keyframes fadeUp{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:translateY(0)}}
  @keyframes orb{0%,100%{transform:translate(0,0)}50%{transform:translate(30px,-20px)}}
  @keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}
  .card-hover{transition:transform .2s ease,box-shadow .2s ease}
  .card-hover:hover{transform:translateY(-4px);box-shadow:0 16px 48px rgba(26,79,196,.15)!important}
`;

function useVisible(ref) {
  const [v, setV] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); obs.disconnect(); } }, { threshold: .1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return v;
}

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);
  const links = [{ h: "/", l: "الرئيسية" }, { h: "/about/", l: "من نحن" }, { h: "/blog/", l: "المدونة" }, { h: "/contact/", l: "تواصل" }];
  return (
    <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: "20px 48px", display: "flex", alignItems: "center", justifyContent: "space-between", background: scrolled ? "rgba(0,8,20,.95)" : "transparent", backdropFilter: scrolled ? "blur(24px)" : "none", borderBottom: scrolled ? "1px solid rgba(26,79,196,.1)" : "none", transition: "all .4s ease", direction: "rtl" }}>
      <a href="/" style={{ fontFamily: "Space Mono", fontSize: 20, fontWeight: 700, color: "#f0f4ff", textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ width: 8, height: 8, background: "#1a4fc4", borderRadius: "50%", animation: "blink 2s infinite" }} />
        IQR<span style={{ color: "#1a4fc4", fontSize: 13, fontFamily: "Cairo", marginRight: 6 }}>لإدارة المطاعم</span>
      </a>
      <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
        {links.map(n => (
          <a key={n.h} href={n.h} style={{ fontFamily: "Cairo", fontSize: 13, fontWeight: 700, color: n.h === "/about/" ? "#1a4fc4" : "rgba(240,244,255,.5)", textDecoration: "none", transition: "color .3s" }}
            onMouseEnter={e => e.target.style.color = "#f0f4ff"} onMouseLeave={e => e.target.style.color = n.h === "/about/" ? "#1a4fc4" : "rgba(240,244,255,.5)"}>{n.l}</a>
        ))}
        <a href="/pricing/" style={{ fontFamily: "Cairo", fontSize: 13, fontWeight: 700, padding: "8px 20px", background: "rgba(205,127,50,.15)", color: "#cd7f32", border: "1px solid rgba(205,127,50,.3)", borderRadius: 4, textDecoration: "none" }}>🔑 الاشتراكات</a>
      </div>
    </nav>
  );
}

export default function AboutClient() {
  const r1 = useRef(null); const v1 = useVisible(r1);
  const r2 = useRef(null); const v2 = useVisible(r2);
  const r3 = useRef(null); const v3 = useVisible(r3);

  const values = [
    { icon: "🎯", title: "الدقة أولاً", desc: "كل قرار نتخذه مبني على بيانات حقيقية، لا على حدس أو تخمين. نقيس كل شيء لنحسّن كل شيء." },
    { icon: "⚡", title: "السرعة في التنفيذ", desc: "لا نؤمن بالخطط الطويلة بلا نتائج. نطبق، نقيس، ونطور — بسرعة ودقة." },
    { icon: "🤝", title: "شراكة حقيقية", desc: "لسنا موردين خدمة، نحن شريك استراتيجي. نجاحك هو نجاحنا، وفشلك يؤرقنا." },
    { icon: "🔄", title: "التحسين المستمر", desc: "المطعم الناجح لا يتوقف عن التطور. نتابع معك شهرياً ونحدّث النظام باستمرار." },
  ];

  const stats = [
    { n: "+35%", l: "متوسط زيادة الأرباح", c: "#1a4fc4" },
    { n: "-28%", l: "تراجع الهدر الغذائي", c: "#ffd60a" },
    { n: "3x", l: "سرعة معالجة الطلبات", c: "#00c3ff" },
    { n: "99%", l: "رضا عملاء IQR", c: "#00ff88" },
  ];

  const team = [
    { name: "فريق العمليات", role: "خبراء إدارة المطاعم", desc: "خبرة تتجاوز 10 سنوات في إدارة وتطوير المطاعم في العراق والمنطقة.", avatar: "⚙️" },
    { name: "فريق التحليل", role: "محللو بيانات وأداء", desc: "متخصصون في تحليل بيانات المطاعم وتحويلها إلى قرارات ربحية.", avatar: "📊" },
    { name: "فريق التدريب", role: "مدربون معتمدون", desc: "يدربون فريقك حتى يصبح النظام طبيعياً يومياً بدون تدخل منك.", avatar: "🎓" },
  ];

  return (
    <>
      <style>{G}</style>
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(ellipse,rgba(26,79,196,.08),transparent 70%)", top: "-10%", right: "-5%", animation: "orb 15s ease-in-out infinite", filter: "blur(60px)" }} />
        <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(ellipse,rgba(0,195,255,.05),transparent 70%)", bottom: "20%", left: "-5%", animation: "orb 20s ease-in-out infinite reverse", filter: "blur(80px)" }} />
      </div>
      <Nav />
      <section style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "120px 48px 80px", textAlign: "center", position: "relative", zIndex: 2, direction: "rtl" }}>
        <div style={{ maxWidth: 800, animation: "fadeUp 1s ease both" }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".4em", color: "#1a4fc4", textTransform: "uppercase", marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "center", gap: 16, fontFamily: "Cairo" }}>
            <span style={{ flex: 1, maxWidth: 60, height: 1, background: "linear-gradient(to right,transparent,#1a4fc4)" }} />من نحن
            <span style={{ flex: 1, maxWidth: 60, height: 1, background: "linear-gradient(to left,transparent,#1a4fc4)" }} />
          </div>
          <h1 style={{ fontFamily: "Cairo", fontSize: "clamp(40px,6vw,80px)", fontWeight: 900, lineHeight: .95, letterSpacing: "-.025em", marginBottom: 28, color: "#f0f4ff" }}>
            نحن لا نبيع<br /><em style={{ fontStyle: "normal", color: "#1a4fc4" }}>خدمة</em><br />نبني <em style={{ fontStyle: "normal", color: "rgba(240,244,255,.2)" }}>مستقبل</em>
          </h1>
          <p style={{ fontFamily: "Cairo", fontSize: 18, color: "rgba(240,244,255,.5)", lineHeight: 1.9, maxWidth: 600, margin: "0 auto" }}>
            IQR وُلدت من تجربة مباشرة مع مشاكل المطاعم في العراق — رأينا كيف تخسر المطاعم الجيدة بسبب غياب الأنظمة، فقررنا أن نكون الحل.
          </p>
        </div>
      </section>
      <section ref={r1} style={{ padding: "80px 48px", maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 2, direction: "rtl" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
          <div style={{ opacity: v1 ? 1 : 0, transform: v1 ? "none" : "translateY(40px)", transition: "all 1s ease" }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".4em", color: "#1a4fc4", marginBottom: 20, fontFamily: "Cairo", display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ width: 30, height: 1, background: "#1a4fc4" }} />قصتنا
            </div>
            <h2 style={{ fontFamily: "Cairo", fontSize: "clamp(28px,4vw,52px)", fontWeight: 900, lineHeight: 1, marginBottom: 24, color: "#f0f4ff" }}>
              من مشكلة حقيقية<br /><em style={{ fontStyle: "normal", color: "#1a4fc4" }}>إلى حل حقيقي</em>
            </h2>
            <p style={{ fontFamily: "Cairo", fontSize: 16, color: "rgba(240,244,255,.45)", lineHeight: 1.9, marginBottom: 20 }}>بدأت IQR عندما رأى مؤسسوها مطاعم جيدة تغلق أبوابها — لا بسبب سوء الطعام أو قلة الزبائن، بل بسبب الفوضى التشغيلية وغياب الأنظمة.</p>
            <p style={{ fontFamily: "Cairo", fontSize: 16, color: "rgba(240,244,255,.45)", lineHeight: 1.9, marginBottom: 20 }}>قضينا أكثر من سنة ندرس أسباب فشل ونجاح المطاعم في العراق — نزور المطابخ، نحلل الأرقام، نتحدث مع الملاك والموظفين والزبائن.</p>
            <p style={{ fontFamily: "Cairo", fontSize: 16, color: "rgba(240,244,255,.45)", lineHeight: 1.9 }}>النتيجة؟ نظام عمليات متكامل مبني على الواقع العراقي — ليس نسخة مستوردة من الخارج.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3, opacity: v1 ? 1 : 0, transform: v1 ? "none" : "translateX(40px)", transition: "all 1s ease .2s" }}>
            {stats.map((s, i) => (
              <div key={i} className="card-hover" style={{ background: "#0a1628", border: "1px solid rgba(255,255,255,.05)", borderRadius: 12, padding: "32px 24px", textAlign: "center" }}>
                <div style={{ fontFamily: "Space Mono", fontSize: 36, fontWeight: 700, color: s.c, marginBottom: 8, textShadow: `0 0 30px ${s.c}50` }}>{s.n}</div>
                <div style={{ fontFamily: "Cairo", fontSize: 12, color: "rgba(240,244,255,.4)", fontWeight: 600 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section ref={r2} style={{ padding: "80px 48px", background: "#000510", position: "relative", zIndex: 2 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", direction: "rtl" }}>
          <div style={{ textAlign: "center", marginBottom: 64, opacity: v2 ? 1 : 0, transform: v2 ? "none" : "translateY(30px)", transition: "all .8s ease" }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".4em", color: "#1a4fc4", marginBottom: 20, fontFamily: "Cairo" }}>قيمنا</div>
            <h2 style={{ fontFamily: "Cairo", fontSize: "clamp(28px,4vw,52px)", fontWeight: 900, color: "#f0f4ff", lineHeight: 1 }}>ما الذي يحركنا<br /><em style={{ fontStyle: "normal", color: "#1a4fc4" }}>كل يوم</em></h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 3 }}>
            {values.map((v, i) => (
              <div key={i} className="card-hover" style={{ background: "#0a1628", border: "1px solid rgba(255,255,255,.05)", borderRadius: 12, padding: "40px 32px", opacity: v2 ? 1 : 0, transform: v2 ? "none" : "translateY(30px)", transition: `all .8s ease ${i * .1}s` }}>
                <span style={{ fontSize: 36, marginBottom: 20, display: "block" }}>{v.icon}</span>
                <h3 style={{ fontFamily: "Cairo", fontSize: 20, fontWeight: 900, marginBottom: 12, color: "#f0f4ff" }}>{v.title}</h3>
                <p style={{ fontFamily: "Cairo", fontSize: 14, color: "rgba(240,244,255,.4)", lineHeight: 1.8 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section ref={r3} style={{ padding: "80px 48px", maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 2, direction: "rtl" }}>
        <div style={{ textAlign: "center", marginBottom: 64, opacity: v3 ? 1 : 0, transform: v3 ? "none" : "translateY(30px)", transition: "all .8s ease" }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".4em", color: "#1a4fc4", marginBottom: 20, fontFamily: "Cairo" }}>الفريق</div>
          <h2 style={{ fontFamily: "Cairo", fontSize: "clamp(28px,4vw,52px)", fontWeight: 900, color: "#f0f4ff", lineHeight: 1 }}>من يقف خلف<br /><em style={{ fontStyle: "normal", color: "#1a4fc4" }}>IQR</em></h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 16 }}>
          {team.map((t, i) => (
            <div key={i} className="card-hover" style={{ background: "#0a1628", border: "1px solid rgba(255,255,255,.05)", borderRadius: 12, padding: "40px 32px", textAlign: "center", opacity: v3 ? 1 : 0, transform: v3 ? "none" : "translateY(30px)", transition: `all .8s ease ${i * .12}s` }}>
              <div style={{ width: 72, height: 72, borderRadius: 16, background: "rgba(26,79,196,.1)", border: "1px solid rgba(26,79,196,.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, margin: "0 auto 20px" }}>{t.avatar}</div>
              <h3 style={{ fontFamily: "Cairo", fontSize: 18, fontWeight: 900, color: "#f0f4ff", marginBottom: 6 }}>{t.name}</h3>
              <div style={{ fontFamily: "Cairo", fontSize: 13, color: "#1a4fc4", fontWeight: 700, marginBottom: 16 }}>{t.role}</div>
              <p style={{ fontFamily: "Cairo", fontSize: 13, color: "rgba(240,244,255,.4)", lineHeight: 1.8 }}>{t.desc}</p>
            </div>
          ))}
        </div>
      </section>
      <section style={{ padding: "100px 48px", textAlign: "center", position: "relative", zIndex: 2, background: "#000510" }}>
        <div style={{ maxWidth: 600, margin: "0 auto", direction: "rtl" }}>
          <h2 style={{ fontFamily: "Cairo", fontSize: "clamp(32px,5vw,60px)", fontWeight: 900, lineHeight: .95, marginBottom: 24, color: "#f0f4ff" }}>جاهز تبدأ<br /><em style={{ fontStyle: "normal", color: "#1a4fc4" }}>معنا؟</em></h2>
          <p style={{ fontFamily: "Cairo", fontSize: 16, color: "rgba(240,244,255,.45)", marginBottom: 40, lineHeight: 1.8 }}>محادثة مجانية نفهم فيها وضعك — بدون التزام</p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="https://wa.me/9647734383431" target="_blank" style={{ fontFamily: "Cairo", fontSize: 14, fontWeight: 700, padding: "16px 44px", background: "#1a4fc4", color: "#fff", borderRadius: 4, textDecoration: "none", boxShadow: "0 0 40px rgba(26,79,196,.4)" }}>📲 تواصل على واتساب</a>
            <a href="/contact/" style={{ fontFamily: "Cairo", fontSize: 14, fontWeight: 700, padding: "15px 44px", background: "transparent", color: "rgba(240,244,255,.6)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 4, textDecoration: "none" }}>راسلنا</a>
          </div>
        </div>
      </section>
      <footer style={{ background: "#000510", borderTop: "1px solid rgba(255,255,255,.05)", padding: "40px 48px", textAlign: "center", position: "relative", zIndex: 2 }}>
        <p style={{ fontFamily: "Cairo", fontSize: 12, color: "rgba(240,244,255,.2)" }}>© 2026 IQR لإدارة وتطوير المطاعم — العراق — جميع الحقوق محفوظة</p>
      </footer>
    </>
  );
}
