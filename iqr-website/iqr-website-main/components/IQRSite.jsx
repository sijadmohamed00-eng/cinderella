"use client";
import { useState, useEffect, useRef, useCallback } from "react";

// ═══════════════════════════════════════════════════════════════
// GLOBAL STYLES
// ═══════════════════════════════════════════════════════════════
const G = `
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;900&family=Space+Mono:wght@400;700&display=swap');
  *,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
  html{scroll-behavior:smooth}
  body{background:#000814;overflow-x:hidden;font-family:'Cairo',sans-serif}
  ::-webkit-scrollbar{width:4px}
  ::-webkit-scrollbar-thumb{background:#1a4fc4;border-radius:99px}
  @keyframes fadeUp{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:translateY(0)}}
  @keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}
  @keyframes orb{0%,100%{transform:translate(0,0)}50%{transform:translate(30px,-20px)}}
  @keyframes ticker{from{transform:translateX(0)}to{transform:translateX(-50%)}}
  @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
  @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
  @keyframes countUp{from{opacity:0;transform:scale(.8)}to{opacity:1;transform:scale(1)}}
  .card3d{transition:transform .3s ease,box-shadow .3s ease}
  .card3d:hover{transform:translateY(-4px);box-shadow:0 20px 60px rgba(26,79,196,.15)!important}
  .cta-main{transition:all .25s ease}
  .cta-main:hover{transform:translateY(-3px);box-shadow:0 12px 50px rgba(26,79,196,.5)!important}
  .nav-link{transition:color .3s ease}
  .nav-link:hover{color:#f0f4ff!important}
`;

// ═══════════════════════════════════════════════════════════════
// useVisible hook
// ═══════════════════════════════════════════════════════════════
function useVisible(threshold=0.1) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

// ═══════════════════════════════════════════════════════════════
// CARD 3D
// ═══════════════════════════════════════════════════════════════
function Card3D({ children, style }) {
  return (
    <div className="card3d" style={{ border: "1px solid rgba(255,255,255,.06)", borderRadius: 0, ...style }}>
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// NAV
// ═══════════════════════════════════════════════════════════════
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);
  const links = [
    { h: "#services", l: "الخدمات" },
    { h: "#problem", l: "لماذا IQR" },
    { h: "#results", l: "النتائج" },
    { h: "/blog/", l: "المدونة" },
    { h: "/about/", l: "من نحن" },
  ];
  return (
    <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: "20px 48px", display: "flex", alignItems: "center", justifyContent: "space-between", background: scrolled ? "rgba(0,8,20,.97)" : "transparent", backdropFilter: scrolled ? "blur(24px)" : "none", borderBottom: scrolled ? "1px solid rgba(26,79,196,.1)" : "none", transition: "all .4s ease", direction: "rtl" }}>
      <a href="/" style={{ fontFamily: "Space Mono", fontSize: 20, fontWeight: 700, color: "#f0f4ff", textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ width: 8, height: 8, background: "#1a4fc4", borderRadius: "50%", animation: "blink 2s infinite" }} />
        IQR<span style={{ color: "#1a4fc4", fontSize: 13, fontFamily: "Cairo", marginRight: 6, fontWeight: 400 }}>لإدارة المطاعم</span>
      </a>
      <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
        {links.map(n => (
          <a key={n.h} href={n.h} className="nav-link" style={{ fontFamily: "Cairo", fontSize: 13, fontWeight: 700, color: "rgba(240,244,255,.5)", textDecoration: "none" }}>{n.l}</a>
        ))}
        <a href="/pricing/" style={{ fontFamily: "Cairo", fontSize: 13, fontWeight: 700, padding: "8px 20px", background: "rgba(205,127,50,.15)", color: "#cd7f32", border: "1px solid rgba(205,127,50,.3)", borderRadius: 4, textDecoration: "none" }}>🔑 الاشتراكات</a>
        <a href="/contact/" style={{ fontFamily: "Cairo", fontSize: 13, fontWeight: 700, padding: "8px 20px", background: "#1a4fc4", color: "#fff", borderRadius: 4, textDecoration: "none" }}>تواصل معنا</a>
      </div>
    </nav>
  );
}

// ═══════════════════════════════════════════════════════════════
// HERO
// ═══════════════════════════════════════════════════════════════
function Hero() {
  return (
    <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "140px 48px 100px", position: "relative", zIndex: 2, direction: "rtl" }}>
      <div style={{ maxWidth: 900, textAlign: "center", animation: "fadeUp 1s ease both" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "rgba(26,79,196,.08)", border: "1px solid rgba(26,79,196,.2)", borderRadius: 99, padding: "8px 20px", marginBottom: 40, fontFamily: "Cairo", fontSize: 13, color: "#1a4fc4", fontWeight: 700 }}>
          <span style={{ width: 6, height: 6, background: "#1a4fc4", borderRadius: "50%", animation: "blink 2s infinite" }} />
          الشركة الأولى لإدارة وتطوير المطاعم في العراق
        </div>
        <h1 style={{ fontFamily: "Cairo", fontSize: "clamp(48px,7vw,96px)", fontWeight: 900, lineHeight: .9, letterSpacing: "-.03em", marginBottom: 32, color: "#f0f4ff" }}>
          حوّل فوضى<br />
          <em style={{ fontStyle: "normal", color: "#1a4fc4" }}>مطعمك</em><br />
          <span style={{ color: "rgba(240,244,255,.2)" }}>إلى نظام</span>
        </h1>
        <p style={{ fontFamily: "Cairo", fontSize: 20, color: "rgba(240,244,255,.5)", lineHeight: 1.8, maxWidth: 620, margin: "0 auto 48px" }}>
          نبني لمطعمك منظومة عمليات متكاملة — من المخزون والموظفين حتى التحليلات والتسويق. مصمم خصيصاً للسوق العراقي.
        </p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="https://wa.me/9647734383431" target="_blank" className="cta-main" style={{ fontFamily: "Cairo", fontSize: 16, fontWeight: 900, padding: "18px 48px", background: "#1a4fc4", color: "#fff", borderRadius: 4, textDecoration: "none", boxShadow: "0 0 50px rgba(26,79,196,.4)", display: "flex", alignItems: "center", gap: 10 }}>
            📲 استشارة مجانية الآن
          </a>
          <a href="#services" style={{ fontFamily: "Cairo", fontSize: 16, fontWeight: 700, padding: "17px 40px", background: "transparent", color: "rgba(240,244,255,.6)", border: "1px solid rgba(255,255,255,.12)", borderRadius: 4, textDecoration: "none" }}>
            اكتشف الخدمات ←
          </a>
        </div>
        <div style={{ display: "flex", gap: 40, justifyContent: "center", marginTop: 60, flexWrap: "wrap" }}>
          {[{ n: "+35%", l: "زيادة الأرباح" }, { n: "-28%", l: "تراجع الهدر" }, { n: "3x", l: "سرعة الطلبات" }, { n: "99%", l: "رضا العملاء" }].map((s, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "Space Mono", fontSize: 28, fontWeight: 700, color: "#1a4fc4", marginBottom: 4 }}>{s.n}</div>
              <div style={{ fontFamily: "Cairo", fontSize: 12, color: "rgba(240,244,255,.35)", fontWeight: 700 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════
// PROBLEM
// ═══════════════════════════════════════════════════════════════
function Problem() {
  const cards = [
    { icon: "📦", title: "فوضى المخزن", desc: "طلبيات يدوية، مواد تنفد بدون تحذير، هدر يومي في المواد الغذائية — كل هذا يُكلّفك آلاف الدنانير شهرياً.", stat: "// يصل الهدر إلى 30% من التكاليف" },
    { icon: "⏱", title: "تأخر الطلبات", desc: "بدون نظام توجيه واضح، الطلبات تتأخر وتضيع وتكلفك عملاء حقيقيين كل يوم.", stat: "// 6-12 دقيقة ضائعة لكل طلب" },
    { icon: "📞", title: "اتصالات ضائعة", desc: "لا تعرف كم اتصال وصل ولم يُرد عليه. غياب آلية الاستقبال يعني خسارة صامتة متراكمة.", stat: "// حتى 40% من الاتصالات تضيع" },
    { icon: "🤝", title: "بدون CRM", desc: "لا تعرف زبائنك المميزين، لا تتابع شكاواهم، ولا تملك بيانات تساعدك على استعادتهم.", stat: "// 5x تكلفة جذب زبون جديد" },
    { icon: "👥", title: "إدارة بدون بيانات", desc: "قرارات تُتخذ بالحدس لا بالأرقام — من يعمل في أي وردية، متى الذروة، أي صنف يخسرك.", stat: "// 40% من القرارات خاطئة" },
    { icon: "📉", title: "أرباح أقل مما تستحق", desc: "مطعمك يعمل لكنه لا يُحقق إمكاناته الكاملة. بدون خطة عمليات واضحة، الأرباح تسرب.", stat: "// 20-35% ربح ضائع قابل للاسترداد" },
  ];
  const [ref, visible] = useVisible(0.1);
  return (
    <section id="problem" ref={ref} style={{ padding: "160px 48px", maxWidth: 1400, margin: "0 auto", position: "relative", zIndex: 2, direction: "rtl" }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".4em", color: "var(--blue-accent,#00c3ff)", textTransform: "uppercase", marginBottom: 24, display: "flex", alignItems: "center", gap: 12, fontFamily: "Cairo", opacity: visible ? 1 : 0, transform: visible ? "none" : "translateX(20px)", transition: "all .7s ease" }}>
        <span style={{ width: 30, height: 1, background: "#00c3ff" }} />التحديات
      </div>
      <h2 style={{ fontFamily: "Cairo", fontSize: "clamp(36px,5vw,72px)", fontWeight: 900, lineHeight: .95, letterSpacing: "-.025em", marginBottom: 80, color: "#f0f4ff", opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(40px)", transition: "all 1s ease .2s" }}>
        المطاعم تخسر<br /><em style={{ fontStyle: "normal", color: "#1a4fc4" }}>يومياً</em> بدون<br /><span style={{ color: "rgba(240,244,255,.2)" }}>نظام حقيقي</span>
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 3 }}>
        {cards.map((c, i) => (
          <Card3D key={i} style={{ background: "#060e22", padding: "52px 44px", position: "relative", overflow: "hidden", opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(40px)", transition: `all .8s ease ${0.3 + (i % 3) * 0.12}s` }}>
            <span style={{ fontSize: 36, marginBottom: 24, display: "block" }}>{c.icon}</span>
            <h3 style={{ fontFamily: "Cairo", fontSize: 20, fontWeight: 900, marginBottom: 12, color: "rgba(240,244,255,.85)" }}>{c.title}</h3>
            <p style={{ fontFamily: "Cairo", fontSize: 14, color: "rgba(240,244,255,.5)", lineHeight: 1.8, marginBottom: 36 }}>{c.desc}</p>
            <span style={{ position: "absolute", bottom: 28, right: 44, fontFamily: "Space Mono", fontSize: 11, color: "#1a4fc4", letterSpacing: ".1em" }}>{c.stat}</span>
          </Card3D>
        ))}
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════
// SERVICES
// ═══════════════════════════════════════════════════════════════
function Services() {
  const [ref, visible] = useVisible(0.1);
  const pillars = [
    { pillar: "🧠 العمليات والإدارة", color: "#1a4fc4", services: [
      { n:"01", icon:"🔍", t:"الاستشارات التشغيلية", d:"نزور مطعمك، نحلل كل عملية، ونضع خارطة طريق واضحة." },
      { n:"02", icon:"📦", t:"نظام المخزون الذكي", d:"مراقبة تلقائية، تنبيهات قبل النفاد، طلبيات تلقائية للموردين." },
      { n:"03", icon:"⚙️", t:"هندسة العمليات", d:"نصمم SOP مخصصاً لكل دور في مطعمك مع آلية كاملة لسير الدلفري." },
      { n:"04", icon:"👥", t:"نظام HR المتكامل", d:"جداول ورديات، بصمات، تقييم أداء، إدارة رواتب." },
      { n:"05", icon:"💰", t:"نظام المالية", d:"تقارير أرباح حسب الأصناف وإدارة البيانات المالية." },
      { n:"06", icon:"🎓", t:"منصة تدريب الموظفين", d:"محتوى تدريبي مخصص لكل دور مع متابعة التقدم." },
      { n:"07", icon:"🏢", t:"نظام الفرانشايز", d:"بناء منظومة قابلة للتكرار من الوثائق حتى دليل التشغيل." },
    ]},
    { pillar: "📞 الكول سنتر وتجربة العملاء", color: "#00c3ff", services: [
      { n:"08", icon:"📞", t:"بناء آلية الكول سنتر", d:"توزيع المكالمات وجرد الاتصالات الضائعة وتحقيق أعلى تحويل." },
      { n:"09", icon:"🤝", t:"نظام CRM", d:"قاعدة بيانات زبائن حية مع تتبع التفضيلات وآليات الاستعادة." },
      { n:"10", icon:"🔔", t:"آلية حل الشكاوى", d:"استقبال ومتابعة وإغلاق الشكاوى بشكل منظم." },
      { n:"11", icon:"🚀", t:"استقبال طلبات المنصات", d:"توحيد وتوزيع الطلبات من جميع تطبيقات التوصيل." },
    ]},
    { pillar: "🍽️ القائمة والهوية الرقمية", color: "#ffd60a", services: [
      { n:"12", icon:"📱", t:"المنيو الإلكتروني", d:"قائمة تفاعلية بصور احترافية مربوطة بجميع قنوات مطعمك." },
      { n:"13", icon:"📄", t:"المنيو الورقي", d:"تصميم قائمة بهوية بصرية تعكس شخصية مطعمك." },
      { n:"14", icon:"🌐", t:"صفحة شاملة للمنصات", d:"رابط واحد يضم كل قنوات التواصل والتوصيل." },
      { n:"15", icon:"💻", t:"الصفحات الإلكترونية", d:"موقع أو صفحة خاصة بمطعمك مع هوية بصرية متكاملة." },
    ]},
    { pillar: "📣 التسويق والنمو", color: "#00ff88", services: [
      { n:"16", icon:"📊", t:"لوحة التحكم والتقارير", d:"داشبورد مباشر من هاتفك مع تقارير أرباح مفصّلة." },
      { n:"17", icon:"📣", t:"الحملات الترويجية", d:"تخطيط وتنفيذ حملات موسمية تحقق عائداً حقيقياً." },
      { n:"18", icon:"🤳", t:"ربط بالمؤثرين", d:"نختار المؤثرين المناسبين وندير التعاون من البداية." },
      { n:"19", icon:"📝", t:"مدونة إدارة المطاعم", d:"محتوى أسبوعي يغطي كل التفاصيل الإدارية والتشغيلية." },
    ]},
  ];
  return (
    <section id="services" ref={ref} style={{ padding: "160px 48px", maxWidth: 1400, margin: "0 auto", position: "relative", zIndex: 2, direction: "rtl" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "end", marginBottom: 80 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".4em", color: "#00c3ff", textTransform: "uppercase", marginBottom: 24, display: "flex", alignItems: "center", gap: 12, fontFamily: "Cairo", opacity: visible ? 1 : 0, transition: "all .7s ease" }}>
            <span style={{ width: 30, height: 1, background: "#00c3ff" }} />الخدمات
          </div>
          <h2 style={{ fontFamily: "Cairo", fontSize: "clamp(36px,5vw,72px)", fontWeight: 900, lineHeight: .95, color: "#f0f4ff", opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(40px)", transition: "all 1s ease .2s" }}>
            كل ما يحتاجه<br /><em style={{ fontStyle: "normal", color: "#1a4fc4" }}>مطعمك</em>
          </h2>
        </div>
        <p style={{ fontFamily: "Cairo", fontSize: 16, color: "rgba(240,244,255,.5)", lineHeight: 1.9, opacity: visible ? 1 : 0, transition: "all 1s ease .3s" }}>
          من التشخيص الأولي حتى المتابعة الشهرية — 19 خدمة متكاملة تغطي كل جانب من جوانب مطعمك، مصممة خصيصاً للسوق العراقي.
        </p>
      </div>
      {pillars.map((pillar, pi) => (
        <div key={pi} style={{ marginBottom: 72 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20, opacity: visible ? 1 : 0, transition: `all .7s ease ${0.2 + pi * 0.1}s` }}>
            <span style={{ fontFamily: "Cairo", fontSize: 16, fontWeight: 900, color: pillar.color }}>{pillar.pillar}</span>
            <span style={{ flex: 1, height: 1, background: `linear-gradient(to left,transparent,${pillar.color}40)` }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 3 }}>
            {pillar.services.map((s, i) => (
              <Card3D key={i} style={{ background: "#060e22", padding: "40px 32px", position: "relative", overflow: "hidden", opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(50px)", transition: `all .9s ease ${0.3 + (i % 4) * 0.1}s`, borderTop: `2px solid ${pillar.color}20` }}>
                <div style={{ fontFamily: "Space Mono", fontSize: 10, color: `${pillar.color}50`, letterSpacing: ".2em", marginBottom: 20 }}>{s.n}</div>
                <div style={{ width: 48, height: 48, background: `${pillar.color}15`, border: `1px solid ${pillar.color}30`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, marginBottom: 20 }}>{s.icon}</div>
                <h3 style={{ fontFamily: "Cairo", fontSize: 18, fontWeight: 900, marginBottom: 10, lineHeight: 1.2, color: "#f0f4ff" }}>{s.t}</h3>
                <p style={{ fontFamily: "Cairo", fontSize: 13, color: "rgba(240,244,255,.5)", lineHeight: 1.8 }}>{s.d}</p>
              </Card3D>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════
// RESULTS
// ═══════════════════════════════════════════════════════════════
function Results() {
  const [ref, visible] = useVisible(0.1);
  const results = [
    { n: "+35%", label: "متوسط زيادة الأرباح", color: "#1a4fc4", desc: "خلال أول 3 أشهر من تطبيق النظام" },
    { n: "-28%", label: "تراجع الهدر الغذائي", color: "#ffd60a", desc: "من خلال نظام المخزون الذكي والـ FIFO" },
    { n: "3x",   label: "سرعة معالجة الطلبات", color: "#00c3ff", desc: "بعد تطبيق نظام توجيه الطلبات" },
    { n: "99%",  label: "رضا عملاء IQR", color: "#00ff88", desc: "من أصحاب المطاعم الذين طبقوا النظام" },
    { n: "-45%", label: "تراجع الأخطاء التشغيلية", color: "#1a4fc4", desc: "بعد تطبيق SOPs وتدريب الفريق" },
    { n: "+60%", label: "كفاءة ساعات الذروة", color: "#ffd60a", desc: "من خلال التخطيط المسبق والاستعداد" },
  ];
  return (
    <section id="results" ref={ref} style={{ padding: "160px 48px", maxWidth: 1400, margin: "0 auto", position: "relative", zIndex: 2, direction: "rtl" }}>
      <div style={{ textAlign: "center", marginBottom: 80 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".4em", color: "#00c3ff", marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "center", gap: 16, fontFamily: "Cairo", opacity: visible ? 1 : 0, transition: "all .7s ease" }}>
          <span style={{ flex: 1, maxWidth: 60, height: 1, background: "linear-gradient(to right,transparent,#00c3ff)" }} />النتائج
          <span style={{ flex: 1, maxWidth: 60, height: 1, background: "linear-gradient(to left,transparent,#00c3ff)" }} />
        </div>
        <h2 style={{ fontFamily: "Cairo", fontSize: "clamp(36px,5vw,72px)", fontWeight: 900, color: "#f0f4ff", lineHeight: .95, opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(30px)", transition: "all 1s ease .2s" }}>
          أرقام حقيقية<br /><em style={{ fontStyle: "normal", color: "#1a4fc4" }}>من مطاعم</em> حقيقية
        </h2>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 3 }}>
        {results.map((r, i) => (
          <Card3D key={i} style={{ background: "#060e22", padding: "52px 44px", textAlign: "center", opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(40px)", transition: `all .8s ease ${i * 0.1}s` }}>
            <div style={{ fontFamily: "Space Mono", fontSize: 52, fontWeight: 700, color: r.color, lineHeight: 1, marginBottom: 16, textShadow: `0 0 40px ${r.color}50` }}>{r.n}</div>
            <h3 style={{ fontFamily: "Cairo", fontSize: 18, fontWeight: 900, color: "#f0f4ff", marginBottom: 10 }}>{r.label}</h3>
            <p style={{ fontFamily: "Cairo", fontSize: 13, color: "rgba(240,244,255,.4)", lineHeight: 1.7 }}>{r.desc}</p>
          </Card3D>
        ))}
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════
// CTA SECTION
// ═══════════════════════════════════════════════════════════════
function CTASection() {
  const [ref, visible] = useVisible(0.1);
  return (
    <section ref={ref} style={{ padding: "120px 48px", textAlign: "center", background: "#000510", position: "relative", zIndex: 2 }}>
      <div style={{ maxWidth: 700, margin: "0 auto", direction: "rtl" }}>
        <div style={{ fontFamily: "Space Mono", fontSize: 11, color: "#1a4fc4", letterSpacing: ".3em", marginBottom: 24, opacity: visible ? 1 : 0, transition: "all .7s ease" }}>IQR.IRAQ.2026</div>
        <h2 style={{ fontFamily: "Cairo", fontSize: "clamp(40px,6vw,80px)", fontWeight: 900, lineHeight: .9, marginBottom: 28, color: "#f0f4ff", opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(40px)", transition: "all 1s ease .2s" }}>
          مطعمك يستحق<br /><em style={{ fontStyle: "normal", color: "#1a4fc4" }}>نظاماً حقيقياً</em>
        </h2>
        <p style={{ fontFamily: "Cairo", fontSize: 18, color: "rgba(240,244,255,.5)", lineHeight: 1.8, marginBottom: 48, opacity: visible ? 1 : 0, transition: "all 1s ease .3s" }}>
          محادثة مجانية نفهم فيها وضعك — بدون التزام، بدون عقود
        </p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", opacity: visible ? 1 : 0, transition: "all 1s ease .4s" }}>
          <a href="https://wa.me/9647734383431" target="_blank" className="cta-main" style={{ fontFamily: "Cairo", fontSize: 16, fontWeight: 900, padding: "20px 56px", background: "#1a4fc4", color: "#fff", borderRadius: 4, textDecoration: "none", boxShadow: "0 0 50px rgba(26,79,196,.4)", display: "flex", alignItems: "center", gap: 12 }}>
            📲 ابدأ محادثة مجانية
          </a>
          <a href="/pricing/" style={{ fontFamily: "Cairo", fontSize: 16, fontWeight: 700, padding: "19px 44px", background: "rgba(205,127,50,.1)", color: "#cd7f32", border: "1px solid rgba(205,127,50,.25)", borderRadius: 4, textDecoration: "none" }}>
            🔑 الخطة البرونزية
          </a>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════
// FOOTER
// ═══════════════════════════════════════════════════════════════
function Footer() {
  return (
    <footer style={{ background: "#000510", borderTop: "1px solid rgba(255,255,255,.05)", padding: "60px 48px 40px", direction: "rtl" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 48, marginBottom: 48 }}>
          <div>
            <div style={{ fontFamily: "Space Mono", fontSize: 20, fontWeight: 700, color: "#f0f4ff", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 8, height: 8, background: "#1a4fc4", borderRadius: "50%" }} />IQR
            </div>
            <p style={{ fontFamily: "Cairo", fontSize: 13, color: "rgba(240,244,255,.4)", lineHeight: 1.8, maxWidth: 280 }}>الشركة الأولى لإدارة وتطوير المطاعم في العراق — نحول الفوضى إلى دقة.</p>
          </div>
          {[
            { title: "الخدمات", links: [{ l: "الاستشارات التشغيلية", h: "#services" }, { l: "نظام المخزون", h: "#services" }, { l: "HR والموظفين", h: "#services" }, { l: "التسويق", h: "#services" }] },
            { title: "الموقع", links: [{ l: "من نحن", h: "/about/" }, { l: "المدونة", h: "/blog/" }, { l: "الاشتراكات", h: "/pricing/" }, { l: "تواصل معنا", h: "/contact/" }] },
            { title: "تواصل", links: [{ l: "واتساب", h: "https://wa.me/9647734383431" }, { l: "info@iqrhq.me", h: "mailto:info@iqrhq.me" }, { l: "إنستاغرام", h: "https://instagram.com/iqrhq_ops" }] },
          ].map((col, i) => (
            <div key={i}>
              <div style={{ fontFamily: "Cairo", fontSize: 12, fontWeight: 700, color: "rgba(240,244,255,.3)", letterSpacing: ".15em", marginBottom: 20, textTransform: "uppercase" }}>{col.title}</div>
              {col.links.map((link, j) => (
                <a key={j} href={link.h} style={{ display: "block", fontFamily: "Cairo", fontSize: 13, color: "rgba(240,244,255,.5)", textDecoration: "none", marginBottom: 10, transition: "color .2s" }}
                  onMouseEnter={e => e.target.style.color = "#f0f4ff"} onMouseLeave={e => e.target.style.color = "rgba(240,244,255,.5)"}>{link.l}</a>
              ))}
            </div>
          ))}
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,.05)", paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <p style={{ fontFamily: "Cairo", fontSize: 12, color: "rgba(240,244,255,.2)" }}>© 2026 IQR لإدارة وتطوير المطاعم — العراق — جميع الحقوق محفوظة</p>
          <div style={{ display: "flex", gap: 16 }}>
            <a href="/pricing/" style={{ fontFamily: "Cairo", fontSize: 12, color: "#cd7f32", textDecoration: "none" }}>🔑 الاشتراكات</a>
            <a href="/dashboard/" style={{ fontFamily: "Cairo", fontSize: 12, color: "rgba(240,244,255,.3)", textDecoration: "none" }}>الداشبورد</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ═══════════════════════════════════════════════════════════════
// BACKGROUND ORBS
// ═══════════════════════════════════════════════════════════════
function Background() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
      <div style={{ position: "absolute", width: 800, height: 800, borderRadius: "50%", background: "radial-gradient(ellipse,rgba(26,79,196,.07),transparent 70%)", top: "-20%", right: "-10%", animation: "orb 15s ease-in-out infinite", filter: "blur(80px)" }} />
      <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(ellipse,rgba(0,195,255,.05),transparent 70%)", bottom: "10%", left: "-10%", animation: "orb 20s ease-in-out infinite reverse", filter: "blur(100px)" }} />
      <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(ellipse,rgba(205,127,50,.04),transparent 70%)", top: "50%", left: "40%", animation: "orb 25s ease-in-out infinite", filter: "blur(80px)" }} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN EXPORT
// ═══════════════════════════════════════════════════════════════
export default function IQRSite() {
  return (
    <>
      <style>{G}</style>
      <Background />
      <Nav />
      <Hero />
      <Problem />
      <Services />
      <Results />
      <CTASection />
      <Footer />
    </>
  );
}
