"use client";
import { useState } from "react";

const G = `
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;900&family=Space+Mono:wght@400;700&display=swap');
  *,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
  body{background:#000814;overflow-x:hidden;font-family:'Cairo',sans-serif}
  ::-webkit-scrollbar{width:4px}
  ::-webkit-scrollbar-thumb{background:#cd7f32;border-radius:99px}
  @keyframes fadeUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
  @keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}
  @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes checkPop{0%{transform:scale(0)}70%{transform:scale(1.2)}100%{transform:scale(1)}}
  .field-wrap input,.field-wrap select{
    width:100%;font-family:'Cairo',sans-serif;font-size:14px;
    padding:13px 16px;background:rgba(255,255,255,.04);
    border:1px solid rgba(255,255,255,.08);border-radius:8px;
    color:#f0f4ff;outline:none;transition:border .2s,box-shadow .2s;
  }
  .field-wrap input:focus,.field-wrap select:focus{
    border-color:#cd7f32;box-shadow:0 0 0 3px rgba(205,127,50,.1);
  }
  .field-wrap input::placeholder{color:rgba(240,244,255,.2)}
  .mono-field{font-family:'Space Mono',monospace!important;letter-spacing:.12em}
  .pay-btn{transition:all .25s ease;cursor:pointer}
  .pay-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 12px 50px rgba(205,127,50,.5)!important}
  .pay-btn:disabled{opacity:.5;cursor:not-allowed}
`;

const fmtCard = (v) => v.replace(/\D/g,"").replace(/(.{4})/g,"$1 ").trim().slice(0,19);
const fmtExpiry = (v) => { const d=v.replace(/\D/g,"").slice(0,4); return d.length>2?d.slice(0,2)+"/"+d.slice(2):d; };

function CardPreview({ card, name, expiry }) {
  const [flip, setFlip] = useState(false);
  return (
    <div style={{ perspective:1000, width:"100%", height:180, marginBottom:28, cursor:"pointer" }} onClick={()=>setFlip(f=>!f)}>
      <div style={{ width:"100%", height:"100%", position:"relative", transition:"transform .6s ease", transformStyle:"preserve-3d", transform:flip?"rotateY(180deg)":"none" }}>
        {/* FRONT */}
        <div style={{ position:"absolute", inset:0, borderRadius:16, background:"linear-gradient(135deg,#1a2a4a,#0d1628)", border:"1px solid rgba(205,127,50,.3)", backfaceVisibility:"hidden", padding:"28px", boxShadow:"0 20px 60px rgba(0,0,0,.4)", overflow:"hidden" }}>
          <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:"linear-gradient(to right,#cd7f32,#f5c874,#cd7f32)", backgroundSize:"200% 100%", animation:"shimmer 3s linear infinite" }} />
          <div style={{ width:40, height:30, background:"linear-gradient(135deg,#cd7f32,#f5c874)", borderRadius:6, marginBottom:28, boxShadow:"0 2px 8px rgba(205,127,50,.4)" }} />
          <div style={{ fontFamily:"Space Mono", fontSize:18, fontWeight:700, color:"#f0f4ff", letterSpacing:".15em", marginBottom:20, opacity:card?1:.3 }}>
            {card||"•••• •••• •••• ••••"}
          </div>
          <div style={{ display:"flex", justifyContent:"space-between" }}>
            <div>
              <div style={{ fontFamily:"Cairo", fontSize:9, color:"rgba(240,244,255,.35)", letterSpacing:".1em", marginBottom:4 }}>اسم حامل البطاقة</div>
              <div style={{ fontFamily:"Space Mono", fontSize:13, color:"#f0f4ff", opacity:name?1:.3 }}>{name||"YOUR NAME"}</div>
            </div>
            <div style={{ textAlign:"left" }}>
              <div style={{ fontFamily:"Cairo", fontSize:9, color:"rgba(240,244,255,.35)", letterSpacing:".1em", marginBottom:4 }}>EXPIRES</div>
              <div style={{ fontFamily:"Space Mono", fontSize:13, color:"#f0f4ff", opacity:expiry?1:.3 }}>{expiry||"MM/YY"}</div>
            </div>
          </div>
          <div style={{ position:"absolute", bottom:20, left:24, fontFamily:"Space Mono", fontSize:18, fontWeight:700, color:"rgba(205,127,50,.15)", letterSpacing:".2em" }}>IQR</div>
        </div>
        {/* BACK */}
        <div style={{ position:"absolute", inset:0, borderRadius:16, background:"linear-gradient(135deg,#0d1628,#1a2a4a)", border:"1px solid rgba(205,127,50,.3)", backfaceVisibility:"hidden", transform:"rotateY(180deg)", overflow:"hidden" }}>
          <div style={{ height:44, background:"rgba(0,0,0,.4)", margin:"28px 0 20px" }} />
          <div style={{ padding:"0 28px", display:"flex", alignItems:"center", justifyContent:"flex-end", gap:16 }}>
            <div style={{ fontFamily:"Cairo", fontSize:11, color:"rgba(240,244,255,.4)" }}>CVC</div>
            <div style={{ background:"#f0f4ff", borderRadius:4, padding:"6px 16px", fontFamily:"Space Mono", fontSize:14, color:"#000814", letterSpacing:".2em" }}>•••</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutClient() {
  const [f, setF] = useState({ name:"", phone:"", whatsapp:"", cardName:"", cardNum:"", expiry:"", cvc:"", restaurant:"", city:"" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [agree, setAgree] = useState(false);
  const upd = (k,v) => setF(p=>({...p,[k]:v}));

  const submit = (e) => {
    e.preventDefault();
    if (!agree) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setDone(true);
      const msg = encodeURIComponent(
        `🔔 طلب اشتراك جديد — IQR البرونزية\n\n` +
        `الاسم: ${f.name}\nالهاتف: ${f.phone}\nواتساب: ${f.whatsapp||f.phone}\n` +
        `المطعم: ${f.restaurant}\nالمدينة: ${f.city}\n` +
        `آخر 4 أرقام: •••• ${f.cardNum.replace(/\s/g,"").slice(-4)}\n` +
        `الخطة: البرونزية — $100/شهر\n\nأرجو تفعيل الاشتراك 🙏`
      );
      setTimeout(() => window.open(`https://wa.me/9647734383431?text=${msg}`,"_blank"), 1000);
    }, 2500);
  };

  if (done) return (
    <>
      <style>{G}</style>
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#000814", padding:"48px", direction:"rtl" }}>
        <div style={{ maxWidth:500, textAlign:"center", animation:"fadeUp .8s ease" }}>
          <div style={{ width:80, height:80, borderRadius:"50%", background:"linear-gradient(135deg,#cd7f32,#f5c874)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:36, margin:"0 auto 24px", animation:"checkPop .5s ease", boxShadow:"0 0 50px rgba(205,127,50,.5)" }}>🎉</div>
          <h1 style={{ fontFamily:"Cairo", fontSize:32, fontWeight:900, color:"#f0f4ff", marginBottom:12 }}>تم الطلب بنجاح!</h1>
          <div style={{ background:"rgba(205,127,50,.08)", border:"1px solid rgba(205,127,50,.25)", borderRadius:12, padding:"24px", marginBottom:28 }}>
            <p style={{ fontFamily:"Cairo", fontSize:15, color:"rgba(240,244,255,.7)", lineHeight:1.9 }}>
              تم إرسال طلبك لفريق IQR عبر واتساب تلقائياً.<br />
              سنتواصل معك خلال <strong style={{ color:"#cd7f32" }}>ساعة واحدة</strong> لتأكيد الدفع وتفعيل حسابك.
            </p>
          </div>
          <div style={{ display:"flex", gap:12, justifyContent:"center" }}>
            <a href="https://wa.me/9647734383431" target="_blank" style={{ fontFamily:"Cairo", fontSize:14, fontWeight:700, padding:"13px 28px", background:"linear-gradient(135deg,#cd7f32,#f5c874)", color:"#000", borderRadius:8, textDecoration:"none" }}>افتح واتساب 📲</a>
            <a href="/" style={{ fontFamily:"Cairo", fontSize:14, fontWeight:700, padding:"12px 24px", background:"transparent", color:"rgba(240,244,255,.5)", border:"1px solid rgba(255,255,255,.1)", borderRadius:8, textDecoration:"none" }}>الرئيسية</a>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <style>{G}</style>
      <div style={{ minHeight:"100vh", background:"#000814", direction:"rtl" }}>
        {/* NAV */}
        <nav style={{ padding:"20px 48px", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:"1px solid rgba(255,255,255,.05)" }}>
          <a href="/" style={{ fontFamily:"Space Mono", fontSize:18, fontWeight:700, color:"#f0f4ff", textDecoration:"none", display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ width:7, height:7, background:"#1a4fc4", borderRadius:"50%", animation:"blink 2s infinite" }}/>IQR
          </a>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ display:"flex", alignItems:"center", gap:6, background:"rgba(0,255,136,.08)", border:"1px solid rgba(0,255,136,.2)", borderRadius:99, padding:"5px 14px" }}>
              <span style={{ fontSize:12 }}>🔒</span>
              <span style={{ fontFamily:"Cairo", fontSize:11, fontWeight:700, color:"#00ff88" }}>دفع آمن</span>
            </div>
            <a href="/pricing/" style={{ fontFamily:"Cairo", fontSize:13, color:"rgba(240,244,255,.4)", textDecoration:"none" }}>← رجوع</a>
          </div>
        </nav>

        <div style={{ maxWidth:960, margin:"0 auto", padding:"60px 48px" }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 400px", gap:40, alignItems:"start" }}>

            {/* FORM */}
            <div>
              <h1 style={{ fontFamily:"Cairo", fontSize:28, fontWeight:900, color:"#f0f4ff", marginBottom:8 }}>إكمال الاشتراك</h1>
              <p style={{ fontFamily:"Cairo", fontSize:14, color:"rgba(240,244,255,.4)", marginBottom:36, lineHeight:1.7 }}>أدخل بياناتك ومعلومات البطاقة — يتم إرسال التأكيد عبر واتساب مباشرة</p>

              <form onSubmit={submit} style={{ display:"flex", flexDirection:"column", gap:20 }}>
                {/* PERSONAL */}
                <div style={{ background:"#0a1628", border:"1px solid rgba(255,255,255,.05)", borderRadius:12, padding:"24px" }}>
                  <div style={{ fontFamily:"Cairo", fontSize:13, fontWeight:700, color:"rgba(240,244,255,.4)", marginBottom:20, display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ width:20, height:20, background:"#cd7f32", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:900, color:"#000", flexShrink:0 }}>1</span>
                    معلوماتك الشخصية
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                    {[
                      { label:"الاسم الكامل *", k:"name", ph:"اسمك الكامل", req:true },
                      { label:"رقم الهاتف *", k:"phone", ph:"07XXXXXXXXX", req:true },
                      { label:"واتساب (إذا مختلف)", k:"whatsapp", ph:"07XXXXXXXXX", req:false },
                      { label:"المدينة *", k:"city", ph:"بغداد، البصرة...", req:true },
                    ].map(fd => (
                      <div key={fd.k} className="field-wrap">
                        <label style={{ fontFamily:"Cairo", fontSize:11, fontWeight:700, color:"rgba(240,244,255,.35)", display:"block", marginBottom:6 }}>{fd.label}</label>
                        <input required={fd.req} placeholder={fd.ph} value={f[fd.k]} onChange={e=>upd(fd.k,e.target.value)} />
                      </div>
                    ))}
                    <div className="field-wrap" style={{ gridColumn:"1/-1" }}>
                      <label style={{ fontFamily:"Cairo", fontSize:11, fontWeight:700, color:"rgba(240,244,255,.35)", display:"block", marginBottom:6 }}>اسم المطعم *</label>
                      <input required placeholder="اسم مطعمك" value={f.restaurant} onChange={e=>upd("restaurant",e.target.value)} />
                    </div>
                  </div>
                </div>

                {/* CARD */}
                <div style={{ background:"#0a1628", border:"1px solid rgba(255,255,255,.05)", borderRadius:12, padding:"24px" }}>
                  <div style={{ fontFamily:"Cairo", fontSize:13, fontWeight:700, color:"rgba(240,244,255,.4)", marginBottom:20, display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ width:20, height:20, background:"#cd7f32", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:900, color:"#000", flexShrink:0 }}>2</span>
                    بيانات البطاقة
                  </div>
                  <CardPreview card={f.cardNum} name={f.cardName.toUpperCase()} expiry={f.expiry} />
                  <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                    <div className="field-wrap">
                      <label style={{ fontFamily:"Cairo", fontSize:11, fontWeight:700, color:"rgba(240,244,255,.35)", display:"block", marginBottom:6 }}>اسم حامل البطاقة *</label>
                      <input required placeholder="كما يظهر على البطاقة" value={f.cardName} onChange={e=>upd("cardName",e.target.value)} />
                    </div>
                    <div className="field-wrap">
                      <label style={{ fontFamily:"Cairo", fontSize:11, fontWeight:700, color:"rgba(240,244,255,.35)", display:"block", marginBottom:6 }}>رقم البطاقة *</label>
                      <input required className="mono-field" placeholder="0000 0000 0000 0000" value={f.cardNum} onChange={e=>upd("cardNum",fmtCard(e.target.value))} maxLength={19} />
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                      <div className="field-wrap">
                        <label style={{ fontFamily:"Cairo", fontSize:11, fontWeight:700, color:"rgba(240,244,255,.35)", display:"block", marginBottom:6 }}>تاريخ الانتهاء *</label>
                        <input required className="mono-field" placeholder="MM/YY" value={f.expiry} onChange={e=>upd("expiry",fmtExpiry(e.target.value))} maxLength={5} />
                      </div>
                      <div className="field-wrap">
                        <label style={{ fontFamily:"Cairo", fontSize:11, fontWeight:700, color:"rgba(240,244,255,.35)", display:"block", marginBottom:6 }}>CVC *</label>
                        <input required className="mono-field" placeholder="•••" value={f.cvc} onChange={e=>upd("cvc",e.target.value.replace(/\D/g,"").slice(0,4))} maxLength={4} type="password" />
                      </div>
                    </div>
                  </div>
                  <div style={{ marginTop:16, padding:"10px 14px", background:"rgba(0,255,136,.05)", border:"1px solid rgba(0,255,136,.1)", borderRadius:8, display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:14 }}>🔒</span>
                    <span style={{ fontFamily:"Cairo", fontSize:11, color:"rgba(240,244,255,.4)" }}>بياناتك محمية — التحقق يتم يدوياً عبر واتساب من فريق IQR</span>
                  </div>
                </div>

                {/* AGREE */}
                <div style={{ display:"flex", alignItems:"flex-start", gap:12, cursor:"pointer" }} onClick={()=>setAgree(v=>!v)}>
                  <div style={{ width:20, height:20, borderRadius:4, border:`2px solid ${agree?"#cd7f32":"rgba(255,255,255,.2)"}`, background:agree?"#cd7f32":"transparent", flexShrink:0, marginTop:2, display:"flex", alignItems:"center", justifyContent:"center", transition:"all .2s" }}>
                    {agree && <span style={{ color:"#000", fontSize:12, fontWeight:900 }}>✓</span>}
                  </div>
                  <span style={{ fontFamily:"Cairo", fontSize:13, color:"rgba(240,244,255,.5)", lineHeight:1.7 }}>
                    أوافق على شروط الاستخدام وأعلم أن اشتراكي سيُفعَّل بعد تأكيد الدفع عبر واتساب.
                  </span>
                </div>

                <button type="submit" disabled={!agree||loading} className="pay-btn" style={{
                  fontFamily:"Cairo", fontSize:16, fontWeight:900, padding:"18px", background: agree?"linear-gradient(135deg,#cd7f32,#f5c874)":"rgba(205,127,50,.3)",
                  color:agree?"#000":"rgba(0,0,0,.4)", border:"none", borderRadius:10, cursor:"pointer",
                  boxShadow:agree?"0 0 40px rgba(205,127,50,.35)":"none",
                  display:"flex", alignItems:"center", justifyContent:"center", gap:12
                }}>
                  {loading ? (
                    <><div style={{ width:18, height:18, border:"2px solid rgba(0,0,0,.3)", borderTopColor:"#000", borderRadius:"50%", animation:"spin .8s linear infinite" }} />جاري المعالجة...</>
                  ) : <>💳 إتمام الاشتراك — $100/شهر</>}
                </button>
              </form>
            </div>

            {/* ORDER SUMMARY */}
            <div style={{ position:"sticky", top:24 }}>
              <div style={{ background:"#0a1628", border:"1px solid rgba(205,127,50,.2)", borderRadius:16, overflow:"hidden" }}>
                <div style={{ height:3, background:"linear-gradient(to right,#cd7f32,#f5c874,#cd7f32)", backgroundSize:"200% 100%", animation:"shimmer 3s linear infinite" }} />
                <div style={{ padding:"28px" }}>
                  <div style={{ fontFamily:"Cairo", fontSize:12, fontWeight:700, color:"rgba(240,244,255,.3)", letterSpacing:".08em", marginBottom:20 }}>ملخص الطلب</div>
                  <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:24, padding:"16px", background:"rgba(205,127,50,.06)", border:"1px solid rgba(205,127,50,.15)", borderRadius:10 }}>
                    <span style={{ fontSize:28 }}>🥉</span>
                    <div>
                      <div style={{ fontFamily:"Cairo", fontSize:15, fontWeight:900, color:"#cd7f32" }}>الخطة البرونزية</div>
                      <div style={{ fontFamily:"Cairo", fontSize:12, color:"rgba(240,244,255,.4)" }}>اشتراك شهري — ألغِ متى تريد</div>
                    </div>
                  </div>
                  {["📚 وصول كامل للمدونة","📊 الداشبورد التفاعلي","📈 تقارير الأداء","💡 توصيات الذكاء الاصطناعي","📬 النشرة الأسبوعية","⚡ أولوية في واتساب"].map((item,i) => (
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 0", borderBottom:"1px solid rgba(255,255,255,.03)" }}>
                      <span style={{ fontFamily:"Cairo", fontSize:13, color:"rgba(240,244,255,.6)", flex:1 }}>{item}</span>
                      <span style={{ color:"#00ff88", fontSize:12, fontWeight:700 }}>✓</span>
                    </div>
                  ))}
                  <div style={{ height:1, background:"rgba(255,255,255,.06)", margin:"20px 0" }} />
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                    <span style={{ fontFamily:"Cairo", fontSize:13, color:"rgba(240,244,255,.45)" }}>الاشتراك الشهري</span>
                    <span style={{ fontFamily:"Space Mono", fontSize:16, fontWeight:700, color:"#f0f4ff" }}>$100</span>
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16 }}>
                    <span style={{ fontFamily:"Cairo", fontSize:12, color:"rgba(240,244,255,.3)" }}>بالدينار العراقي</span>
                    <span style={{ fontFamily:"Cairo", fontSize:12, color:"rgba(240,244,255,.3)" }}>≈ 130,000 د.ع</span>
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <span style={{ fontFamily:"Cairo", fontSize:15, fontWeight:900, color:"#f0f4ff" }}>الإجمالي اليوم</span>
                    <span style={{ fontFamily:"Space Mono", fontSize:22, fontWeight:700, color:"#cd7f32" }}>$100</span>
                  </div>
                  <div style={{ marginTop:20, padding:"12px 14px", background:"rgba(26,79,196,.06)", border:"1px solid rgba(26,79,196,.15)", borderRadius:8 }}>
                    <div style={{ fontFamily:"Cairo", fontSize:12, fontWeight:700, color:"#1a4fc4", marginBottom:4 }}>📲 التفعيل عبر واتساب</div>
                    <div style={{ fontFamily:"Cairo", fontSize:11, color:"rgba(240,244,255,.4)", lineHeight:1.7 }}>بعد الدفع، يصلك تأكيد على واتساب خلال ساعة ويُفعَّل حسابك فوراً.</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
