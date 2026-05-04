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
  @keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}
  @keyframes orb{0%,100%{transform:translate(0,0)}50%{transform:translate(30px,-20px)}}
  @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
  @keyframes pulse{0%,100%{box-shadow:0 0 30px rgba(205,127,50,.3)}50%{box-shadow:0 0 60px rgba(205,127,50,.6)}}
  @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
  .bronze-card{animation:pulse 3s ease-in-out infinite;transition:transform .3s ease}
  .bronze-card:hover{transform:translateY(-6px)}
  .check-item{display:flex;align-items:flex-start;gap:12px;padding:10px 0;border-bottom:1px solid rgba(255,255,255,.04)}
  .check-item:last-child{border-bottom:none}
  .lock-item{display:flex;align-items:flex-start;gap:12px;padding:10px 0;border-bottom:1px solid rgba(255,255,255,.04);opacity:.4}
  .lock-item:last-child{border-bottom:none}
  .cta-btn{transition:all .25s ease;cursor:pointer}
  .cta-btn:hover{transform:translateY(-3px);box-shadow:0 12px 50px rgba(205,127,50,.5)!important}
  .faq-item{cursor:pointer;transition:all .2s}
  .faq-item:hover{background:rgba(255,255,255,.03)!important}
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
  return (
    <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: "20px 48px", display: "flex", alignItems: "center", justifyContent: "space-between", background: scrolled ? "rgba(0,8,20,.95)" : "transparent", backdropFilter: scrolled ? "blur(24px)" : "none", borderBottom: scrolled ? "1px solid rgba(26,79,196,.1)" : "none", transition: "all .4s ease", direction: "rtl" }}>
      <a href="/" style={{ fontFamily: "Space Mono", fontSize: 20, fontWeight: 700, color: "#f0f4ff", textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ width: 8, height: 8, background: "#1a4fc4", borderRadius: "50%", animation: "blink 2s infinite" }} />
        IQR<span style={{ color: "#1a4fc4", fontSize: 13, fontFamily: "Cairo", marginRight: 6 }}>لإدارة المطاعم</span>
      </a>
      <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
        {[{ h: "/", l: "الرئيسية" }, { h: "/about/", l: "من نحن" }, { h: "/blog/", l: "المدونة" }, { h: "/contact/", l: "تواصل" }].map(n => (
          <a key={n.h} href={n.h} style={{ fontFamily: "Cairo", fontSize: 13, fontWeight: 700, color: "rgba(240,244,255,.5)", textDecoration: "none", transition: "color .3s" }}
            onMouseEnter={e => e.target.style.color = "#f0f4ff"} onMouseLeave={e => e.target.style.color = "rgba(240,244,255,.5)"}>{n.l}</a>
        ))}
        <a href="/pricing/" style={{ fontFamily: "Cairo", fontSize: 13, fontWeight: 700, padding: "8px 20px", background: "rgba(205,127,50,.15)", color: "#cd7f32", border: "1px solid rgba(205,127,50,.3)", borderRadius: 4, textDecoration: "none" }}>🔑 الاشتراكات</a>
      </div>
    </nav>
  );
}

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="faq-item" onClick={() => setOpen(v => !v)} style={{ background: "#0a1628", border: "1px solid rgba(255,255,255,.05)", borderRadius: 10, padding: "20px 24px", marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "Cairo", fontSize: 15, fontWeight: 700, color: "#f0f4ff" }}>{q}</span>
        <span style={{ color: "#cd7f32", fontSize: 20, transition: "transform .2s", transform: open ? "rotate(45deg)" : "none" }}>+</span>
      </div>
      {open && <p style={{ fontFamily: "Cairo", fontSize: 14, color: "rgba(240,244,255,.5)", lineHeight: 1.8, marginTop: 16 }}>{a}</p>}
    </div>
  );
}

export default function PricingClient() {
  const r1 = useRef(null); const v1 = useVisible(r1);
  const r2 = useRef(null); const v2 = useVisible(r2);

  const bronzeFeatures = [
    { icon: "📚", text: "وصول كامل لجميع مقالات المدونة", detail: "9+ مقالات متخصصة وتضاف مقالات جديدة أسبوعياً" },
    { icon: "📊", text: "لوحة التحكم التفاعلية (الداشبورد)", detail: "تتبع الطلبات، المخزون، الموظفين، والتحليلات — مباشر" },
    { icon: "📈", text: "تقارير الأداء الأسبوعية والشهرية", detail: "إيرادات، هدر، ذروة، وأداء كل صنف" },
    { icon: "💡", text: "توصيات الذكاء الاصطناعي", detail: "اقتراحات مبنية على بيانات مطاعم حقيقية" },
    { icon: "📬", text: "النشرة الأسبوعية الحصرية", detail: "مقال + نصيحة تشغيلية مباشرة على واتساب" },
    { icon: "⚡", text: "أولوية في الردود عبر واتساب", detail: "رد خلال ساعة خلال أوقات العمل" },
  ];

  const notIncluded = [
    "زيارة مطعمك ميدانياً",
    "استشارات شخصية مباشرة",
    "تدريب الفريق",
    "بناء أنظمة مخصصة",
  ];

  const faqs = [
    { q: "كيف أصل للمحتوى بعد الاشتراك؟", a: "بعد إتمام الدفع وتأكيد التحويل، نرسل لك رابط تفعيل على واتساب خلال ساعة. الرابط يفتح لك المدونة الكاملة والداشبورد مباشرة." },
    { q: "هل يمكنني إلغاء الاشتراك؟", a: "نعم، يمكنك إلغاء الاشتراك في أي وقت قبل تجديد الشهر القادم. ما في عقود أو التزامات طويلة." },
    { q: "هل الداشبورد يعمل مع بيانات مطعمي الفعلية؟", a: "في المرحلة الحالية الداشبورد يعمل ببيانات تجريبية لمطعم عراقي نموذجي. ربط بياناتك الخاصة متاح في الخطط الأعلى." },
    { q: "ما طرق الدفع المتاحة؟", a: "نقبل الدفع عبر بطاقة ماستركارد، أو تحويل بنكي، أو كاش (للعراق). بعد الدفع نؤكد اشتراكك مباشرة عبر واتساب." },
    { q: "هل هناك فترة تجريبية مجانية؟", a: "يمكنك تصفح معاينة محدودة من المدونة مجاناً. للوصول الكامل يحتاج اشتراك مدفوع." },
  ];

  return (
    <>
      <style>{G}</style>
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(ellipse,rgba(205,127,50,.06),transparent 70%)", top: "-15%", right: "-10%", animation: "orb 15s ease-in-out infinite", filter: "blur(80px)" }} />
        <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(ellipse,rgba(26,79,196,.05),transparent 70%)", bottom: "20%", left: "-5%", animation: "orb 20s ease-in-out infinite reverse", filter: "blur(80px)" }} />
      </div>
      <Nav />

      {/* HERO */}
      <section style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "140px 48px 80px", textAlign: "center", position: "relative", zIndex: 2, direction: "rtl" }}>
        <div style={{ maxWidth: 800, animation: "fadeUp 1s ease both" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "rgba(205,127,50,.1)", border: "1px solid rgba(205,127,50,.25)", borderRadius: 99, padding: "8px 20px", marginBottom: 32 }}>
            <span style={{ fontSize: 16 }}>🔑</span>
            <span style={{ fontFamily: "Cairo", fontSize: 13, fontWeight: 700, color: "#cd7f32" }}>خطط الاشتراك</span>
          </div>
          <h1 style={{ fontFamily: "Cairo", fontSize: "clamp(40px,6vw,80px)", fontWeight: 900, lineHeight: .95, marginBottom: 24, color: "#f0f4ff" }}>
            ابدأ بـ<em style={{ fontStyle: "normal", color: "#cd7f32" }}>المعرفة</em><br />
            <span style={{ color: "rgba(240,244,255,.2)" }}>قبل الحل</span>
          </h1>
          <p style={{ fontFamily: "Cairo", fontSize: 18, color: "rgba(240,244,255,.5)", lineHeight: 1.9, maxWidth: 580, margin: "0 auto" }}>
            الخطة البرونزية تعطيك كل المعرفة التي يحتاجها مطعمك — مقالات + داشبورد + تحليلات.
          </p>
        </div>
      </section>

      {/* CARD */}
      <section style={{ padding: "0 48px 100px", maxWidth: 900, margin: "0 auto", position: "relative", zIndex: 2, direction: "rtl" }}>
        <div className="bronze-card" style={{ background: "linear-gradient(135deg, #0d1a2e, #12203a)", border: "1px solid rgba(205,127,50,.35)", borderRadius: 20, overflow: "hidden", position: "relative", marginBottom: 24 }}>
          <div style={{ height: 3, background: "linear-gradient(to left, #cd7f32, #f5c874, #cd7f32)", backgroundSize: "200% 100%", animation: "shimmer 3s linear infinite" }} />
          <div style={{ position: "absolute", top: 24, left: 24 }}>
            <span style={{ fontFamily: "Cairo", fontSize: 11, fontWeight: 700, padding: "5px 14px", background: "rgba(205,127,50,.2)", color: "#cd7f32", border: "1px solid rgba(205,127,50,.4)", borderRadius: 99, letterSpacing: ".08em" }}>⭐ الخطة البرونزية</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
            {/* LEFT: PRICING */}
            <div style={{ padding: "64px 48px", borderLeft: "1px solid rgba(255,255,255,.05)" }}>
              <div style={{ marginBottom: 32 }}>
                <div style={{ fontFamily: "Cairo", fontSize: 13, color: "rgba(240,244,255,.4)", marginBottom: 8 }}>الاشتراك الشهري</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <span style={{ fontFamily: "Space Mono", fontSize: 56, fontWeight: 700, color: "#cd7f32", lineHeight: 1 }}>$100</span>
                  <span style={{ fontFamily: "Cairo", fontSize: 16, color: "rgba(240,244,255,.35)" }}>/شهر</span>
                </div>
                <div style={{ fontFamily: "Cairo", fontSize: 12, color: "rgba(240,244,255,.3)", marginTop: 8 }}>≈ 130,000 دينار عراقي</div>
              </div>
              <a href="/checkout/" className="cta-btn" style={{ display: "block", textAlign: "center", fontFamily: "Cairo", fontSize: 16, fontWeight: 900, padding: "18px 32px", background: "linear-gradient(135deg, #cd7f32, #f5c874)", color: "#000", borderRadius: 10, textDecoration: "none", marginBottom: 16, boxShadow: "0 0 40px rgba(205,127,50,.4)" }}>
                اشترك الآن 🚀
              </a>
              <p style={{ fontFamily: "Cairo", fontSize: 12, color: "rgba(240,244,255,.3)", textAlign: "center", lineHeight: 1.7 }}>ألغِ في أي وقت · بدون عقود<br />تفعيل فوري بعد التأكيد</p>
              <div style={{ height: 1, background: "rgba(255,255,255,.05)", margin: "28px 0" }} />
              <div>
                <div style={{ fontFamily: "Cairo", fontSize: 12, fontWeight: 700, color: "rgba(240,244,255,.25)", marginBottom: 12, letterSpacing: ".08em" }}>غير مشمول بهذه الخطة</div>
                {notIncluded.map((item, i) => (
                  <div key={i} className="lock-item">
                    <span style={{ fontSize: 14, color: "rgba(240,244,255,.25)", flexShrink: 0, marginTop: 2 }}>🔒</span>
                    <span style={{ fontFamily: "Cairo", fontSize: 13, color: "rgba(240,244,255,.3)" }}>{item}</span>
                  </div>
                ))}
                <a href="/contact/" style={{ display: "block", textAlign: "center", fontFamily: "Cairo", fontSize: 13, fontWeight: 700, color: "#1a4fc4", marginTop: 16, textDecoration: "none" }}>تحتاج خدمات أشمل؟ تواصل معنا ←</a>
              </div>
            </div>
            {/* RIGHT: FEATURES */}
            <div style={{ padding: "64px 48px" }}>
              <div style={{ fontFamily: "Cairo", fontSize: 13, fontWeight: 700, color: "rgba(240,244,255,.4)", marginBottom: 24, letterSpacing: ".08em" }}>✅ ما يشمله الاشتراك</div>
              {bronzeFeatures.map((f, i) => (
                <div key={i} className="check-item">
                  <span style={{ fontSize: 20, flexShrink: 0, animation: `float ${2 + i * .3}s ease-in-out infinite` }}>{f.icon}</span>
                  <div>
                    <div style={{ fontFamily: "Cairo", fontSize: 14, fontWeight: 700, color: "#f0f4ff", marginBottom: 3 }}>{f.text}</div>
                    <div style={{ fontFamily: "Cairo", fontSize: 12, color: "rgba(240,244,255,.35)", lineHeight: 1.6 }}>{f.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* COMING SOON */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { name: "الخطة الفضية", price: "بالتفاوض", icon: "🥈", color: "#a8a9ad", features: ["كل ميزات البرونزية", "استشارة شهرية مباشرة", "تقارير مخصصة"] },
            { name: "الخطة الذهبية", price: "بالتفاوض", icon: "🥇", color: "#ffd60a", features: ["كل الميزات", "حضور ميداني", "بناء أنظمة مخصصة", "تدريب الفريق"] },
          ].map((plan, i) => (
            <div key={i} style={{ background: "#0a1628", border: "1px solid rgba(255,255,255,.05)", borderRadius: 14, padding: "28px", position: "relative", overflow: "hidden", opacity: .6 }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,.3)", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(2px)", zIndex: 1, borderRadius: 14 }}>
                <span style={{ fontFamily: "Cairo", fontSize: 16, fontWeight: 900, color: "rgba(240,244,255,.5)", background: "rgba(0,8,20,.8)", padding: "10px 24px", borderRadius: 99, border: "1px solid rgba(255,255,255,.1)" }}>🔜 قريباً</span>
              </div>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{plan.icon}</div>
              <h3 style={{ fontFamily: "Cairo", fontSize: 16, fontWeight: 900, color: plan.color, marginBottom: 4 }}>{plan.name}</h3>
              <div style={{ fontFamily: "Space Mono", fontSize: 13, color: "rgba(240,244,255,.3)", marginBottom: 16 }}>{plan.price}</div>
              {plan.features.map((f, j) => (<div key={j} style={{ fontFamily: "Cairo", fontSize: 12, color: "rgba(240,244,255,.4)", padding: "4px 0", borderBottom: "1px solid rgba(255,255,255,.03)" }}>✓ {f}</div>))}
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section ref={r1} style={{ padding: "80px 48px", background: "#000510", position: "relative", zIndex: 2 }}>
        <div style={{ maxWidth: 900, margin: "0 auto", direction: "rtl" }}>
          <div style={{ textAlign: "center", marginBottom: 56, opacity: v1 ? 1 : 0, transform: v1 ? "none" : "translateY(30px)", transition: "all .8s ease" }}>
            <h2 style={{ fontFamily: "Cairo", fontSize: "clamp(28px,4vw,48px)", fontWeight: 900, color: "#f0f4ff" }}>كيف تبدأ<em style={{ fontStyle: "normal", color: "#cd7f32" }}> خلال دقائق</em></h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 3 }}>
            {[
              { n: "01", icon: "🖊️", title: "ادفع وسجّل", desc: "أكمل نموذج الدفع — بطاقة ماستركارد أو تحويل. العملية تأخذ أقل من دقيقتين." },
              { n: "02", icon: "📲", title: "تأكيد على واتساب", desc: "نتواصل معك فوراً على واتساب ونرسل رابط التفعيل." },
              { n: "03", icon: "🚀", title: "وصول فوري", desc: "تدخل للمدونة الكاملة والداشبورد مباشرة. كل المحتوى متاح لك فوراً." },
            ].map((s, i) => (
              <div key={i} style={{ background: "#0a1628", border: "1px solid rgba(255,255,255,.05)", borderRadius: 12, padding: "36px 28px", textAlign: "center", opacity: v1 ? 1 : 0, transform: v1 ? "none" : "translateY(30px)", transition: `all .8s ease ${i * .12}s` }}>
                <div style={{ fontFamily: "Space Mono", fontSize: 11, color: "#cd7f32", letterSpacing: ".3em", marginBottom: 16 }}>{s.n}</div>
                <div style={{ fontSize: 32, marginBottom: 16 }}>{s.icon}</div>
                <h3 style={{ fontFamily: "Cairo", fontSize: 17, fontWeight: 900, color: "#f0f4ff", marginBottom: 10 }}>{s.title}</h3>
                <p style={{ fontFamily: "Cairo", fontSize: 13, color: "rgba(240,244,255,.45)", lineHeight: 1.8 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section ref={r2} style={{ padding: "80px 48px 120px", maxWidth: 760, margin: "0 auto", position: "relative", zIndex: 2, direction: "rtl" }}>
        <div style={{ textAlign: "center", marginBottom: 48, opacity: v2 ? 1 : 0, transform: v2 ? "none" : "translateY(30px)", transition: "all .8s ease" }}>
          <h2 style={{ fontFamily: "Cairo", fontSize: "clamp(28px,4vw,48px)", fontWeight: 900, color: "#f0f4ff" }}>أسئلة <em style={{ fontStyle: "normal", color: "#cd7f32" }}>شائعة</em></h2>
        </div>
        <div style={{ opacity: v2 ? 1 : 0, transition: "all .8s ease .2s" }}>
          {faqs.map((f, i) => <FAQItem key={i} q={f.q} a={f.a} />)}
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ padding: "100px 48px", textAlign: "center", background: "#000510", position: "relative", zIndex: 2 }}>
        <div style={{ maxWidth: 600, margin: "0 auto", direction: "rtl" }}>
          <h2 style={{ fontFamily: "Cairo", fontSize: "clamp(32px,5vw,60px)", fontWeight: 900, lineHeight: .95, marginBottom: 20, color: "#f0f4ff" }}>جاهز تبدأ؟<br /><em style={{ fontStyle: "normal", color: "#cd7f32" }}>$100</em></h2>
          <p style={{ fontFamily: "Cairo", fontSize: 16, color: "rgba(240,244,255,.45)", marginBottom: 36, lineHeight: 1.8 }}>اشتراك شهري — ألغِ متى تريد — وصول فوري</p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="/checkout/" className="cta-btn" style={{ fontFamily: "Cairo", fontSize: 15, fontWeight: 900, padding: "18px 48px", background: "linear-gradient(135deg, #cd7f32, #f5c874)", color: "#000", borderRadius: 8, textDecoration: "none", boxShadow: "0 0 40px rgba(205,127,50,.4)" }}>اشترك الآن — $100/شهر</a>
            <a href="https://wa.me/9647734383431" target="_blank" style={{ fontFamily: "Cairo", fontSize: 15, fontWeight: 700, padding: "17px 32px", background: "transparent", color: "rgba(240,244,255,.6)", border: "1px solid rgba(255,255,255,.12)", borderRadius: 8, textDecoration: "none" }}>📲 لديك سؤال؟</a>
          </div>
        </div>
      </section>

      <footer style={{ background: "#000510", borderTop: "1px solid rgba(255,255,255,.05)", padding: "40px 48px", textAlign: "center", position: "relative", zIndex: 2 }}>
        <p style={{ fontFamily: "Cairo", fontSize: 12, color: "rgba(240,244,255,.2)" }}>© 2026 IQR لإدارة وتطوير المطاعم — العراق — جميع الحقوق محفوظة</p>
      </footer>
    </>
  );
}
