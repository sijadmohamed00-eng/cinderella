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
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes orb{0%,100%{transform:translate(0,0)}50%{transform:translate(30px,-20px)}}
  @keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}
  .btn-hover{transition:all .2s ease}
  .btn-hover:hover{transform:translateY(-2px);filter:brightness(1.1)}
  .card-hover{transition:transform .2s ease,box-shadow .2s ease}
  .card-hover:hover{transform:translateY(-4px);box-shadow:0 16px 48px rgba(26,79,196,.15)!important}
  input:focus,textarea:focus,select:focus{outline:none;border-color:#1a4fc4!important;box-shadow:0 0 0 3px rgba(26,79,196,.1)!important}
`;

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:100,padding:"20px 48px",display:"flex",alignItems:"center",justifyContent:"space-between",
      background:scrolled?"rgba(0,8,20,.95)":"transparent",backdropFilter:scrolled?"blur(24px)":"none",
      borderBottom:scrolled?"1px solid rgba(26,79,196,.1)":"none",transition:"all .4s ease",direction:"rtl"}}>
      <a href="/" style={{fontFamily:"Space Mono",fontSize:20,fontWeight:700,color:"#f0f4ff",textDecoration:"none",display:"flex",alignItems:"center",gap:10}}>
        <span style={{width:8,height:8,background:"#1a4fc4",borderRadius:"50%",animation:"blink 2s infinite"}}/>
        IQR<span style={{color:"#1a4fc4",fontSize:13,fontWeight:400,fontFamily:"Cairo",marginRight:6}}>لإدارة المطاعم</span>
      </a>
      <div style={{display:"flex",gap:24,alignItems:"center"}}>
        {[{h:"/",l:"الرئيسية"},{h:"/about/",l:"من نحن"},{h:"/blog/",l:"المدونة"},{h:"/contact/",l:"تواصل"}].map(n=>(
          <a key={n.h} href={n.h} style={{fontFamily:"Cairo",fontSize:13,fontWeight:700,color:n.h==="/contact/"?"#1a4fc4":"rgba(240,244,255,.5)",textDecoration:"none",transition:"color .3s"}}
            onMouseEnter={e=>e.target.style.color="#f0f4ff"} onMouseLeave={e=>e.target.style.color=n.h==="/contact/"?"#1a4fc4":"rgba(240,244,255,.5)"}>{n.l}</a>
        ))}
        <a href="/pricing/" style={{fontFamily:"Cairo",fontSize:13,fontWeight:700,padding:"8px 20px",background:"rgba(205,127,50,.15)",color:"#cd7f32",border:"1px solid rgba(205,127,50,.3)",borderRadius:4,textDecoration:"none"}}>🔑 الاشتراكات</a>
      </div>
    </nav>
  );
}

export default function ContactClient() {
  const [form, setForm] = useState({name:"",phone:"",city:"",type:"",message:""});
  const [status, setStatus] = useState("idle");

  const submit = (e) => {
    e.preventDefault();
    setStatus("loading");
    const msg = `مرحبا IQR،%0aاسمي: ${form.name}%0aرقمي: ${form.phone}%0aالمدينة: ${form.city||"غير محدد"}%0aنوع المطعم: ${form.type||"غير محدد"}%0aرسالتي: ${form.message||"لا توجد رسالة إضافية"}`;
    window.open(`https://wa.me/9647734383431?text=${msg}`,"_blank");
    setTimeout(()=>setStatus("success"),800);
  };

  const channels = [
    {icon:<svg width={24} height={24} viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>,
     label:"واتساب",val:"07734383431",link:"https://wa.me/9647734383431",color:"rgba(37,211,102,.3)",bg:"rgba(37,211,102,.07)",tc:"#25D366"},
    {icon:<svg width={24} height={24} viewBox="0 0 24 24" fill="#00c3ff"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>,
     label:"البريد الإلكتروني",val:"info@iqrhq.me",link:"mailto:info@iqrhq.me",color:"rgba(0,195,255,.25)",bg:"rgba(0,195,255,.07)",tc:"#00c3ff"},
    {icon:<svg width={24} height={24} viewBox="0 0 24 24" fill="#E1306C"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>,
     label:"إنستاغرام",val:"@iqrhq_ops",link:"https://instagram.com/iqrhq_ops",color:"rgba(225,48,108,.25)",bg:"rgba(225,48,108,.07)",tc:"#E1306C"},
  ];

  return (
    <>
      <style>{G}</style>
      <div style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none"}}>
        <div style={{position:"absolute",width:600,height:600,borderRadius:"50%",background:"radial-gradient(ellipse,rgba(26,79,196,.08),transparent 70%)",top:"-10%",right:"-5%",animation:"orb 15s ease-in-out infinite",filter:"blur(60px)"}}/>
        <div style={{position:"absolute",width:500,height:500,borderRadius:"50%",background:"radial-gradient(ellipse,rgba(0,195,255,.05),transparent 70%)",bottom:"10%",left:"-5%",animation:"orb 20s ease-in-out infinite reverse",filter:"blur(80px)"}}/>
      </div>
      <Nav/>
      <section style={{minHeight:"50vh",display:"flex",alignItems:"center",justifyContent:"center",padding:"120px 48px 60px",textAlign:"center",position:"relative",zIndex:2,direction:"rtl"}}>
        <div style={{animation:"fadeUp 1s ease both"}}>
          <div style={{fontSize:11,fontWeight:700,letterSpacing:".4em",color:"#1a4fc4",textTransform:"uppercase",marginBottom:24,display:"flex",alignItems:"center",justifyContent:"center",gap:16,fontFamily:"Cairo"}}>
            <span style={{flex:1,maxWidth:60,height:1,background:"linear-gradient(to right,transparent,#1a4fc4)"}}/>تواصل معنا
            <span style={{flex:1,maxWidth:60,height:1,background:"linear-gradient(to left,transparent,#1a4fc4)"}}/>
          </div>
          <h1 style={{fontFamily:"Cairo",fontSize:"clamp(40px,6vw,80px)",fontWeight:900,lineHeight:.95,marginBottom:24,color:"#f0f4ff"}}>
            نبدأ بـ<br/><em style={{fontStyle:"normal",color:"#1a4fc4"}}>محادثة مجانية</em>
          </h1>
          <p style={{fontFamily:"Cairo",fontSize:17,color:"rgba(240,244,255,.45)",maxWidth:500,margin:"0 auto",lineHeight:1.8}}>بدون التزام — فقط نفهم وضع مطعمك ونحدد كيف نساعدك</p>
        </div>
      </section>
      <section style={{padding:"0 48px 100px",maxWidth:1100,margin:"0 auto",position:"relative",zIndex:2,direction:"rtl"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:48,alignItems:"start"}}>
          <div style={{background:"#0a1628",border:"1px solid rgba(255,255,255,.06)",borderRadius:16,padding:"40px",animation:"fadeUp .8s ease .2s both"}}>
            <h2 style={{fontFamily:"Cairo",fontSize:22,fontWeight:900,color:"#f0f4ff",marginBottom:8}}>أرسل لنا رسالة</h2>
            <p style={{fontFamily:"Cairo",fontSize:13,color:"rgba(240,244,255,.35)",marginBottom:32}}>سنرد عليك خلال ساعات</p>
            {status==="success"?(
              <div style={{textAlign:"center",padding:"48px 0",animation:"fadeIn .5s ease"}}>
                <div style={{fontSize:48,marginBottom:16}}>✅</div>
                <h3 style={{fontFamily:"Cairo",fontSize:22,fontWeight:900,color:"#00ff88",marginBottom:12}}>تم الإرسال!</h3>
                <p style={{fontFamily:"Cairo",fontSize:14,color:"rgba(240,244,255,.45)"}}>سنتواصل معك قريباً على رقمك</p>
              </div>
            ):(
              <form onSubmit={submit} style={{display:"flex",flexDirection:"column",gap:16}}>
                {[{label:"الاسم الكامل *",key:"name",type:"text",placeholder:"اسمك"},{label:"رقم الهاتف *",key:"phone",type:"tel",placeholder:"07XXXXXXXXX"},{label:"المدينة",key:"city",type:"text",placeholder:"بغداد، البصرة..."}].map(f=>(
                  <div key={f.key}>
                    <label style={{fontFamily:"Cairo",fontSize:12,fontWeight:700,color:"rgba(240,244,255,.4)",display:"block",marginBottom:8}}>{f.label}</label>
                    <input required={f.label.includes("*")} type={f.type} placeholder={f.placeholder} value={form[f.key]}
                      onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))}
                      style={{width:"100%",fontFamily:"Cairo",fontSize:14,padding:"12px 16px",background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)",borderRadius:8,color:"#f0f4ff",transition:"all .2s"}}/>
                  </div>
                ))}
                <div>
                  <label style={{fontFamily:"Cairo",fontSize:12,fontWeight:700,color:"rgba(240,244,255,.4)",display:"block",marginBottom:8}}>نوع المطعم</label>
                  <select value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))}
                    style={{width:"100%",fontFamily:"Cairo",fontSize:14,padding:"12px 16px",background:"#0a1628",border:"1px solid rgba(255,255,255,.08)",borderRadius:8,color:"#f0f4ff"}}>
                    <option value="">اختر...</option>
                    <option>مطعم عائلي</option><option>فاست فود</option><option>مطعم فاخر</option>
                    <option>سلسلة مطاعم</option><option>كافيه</option><option>غيره</option>
                  </select>
                </div>
                <div>
                  <label style={{fontFamily:"Cairo",fontSize:12,fontWeight:700,color:"rgba(240,244,255,.4)",display:"block",marginBottom:8}}>رسالتك</label>
                  <textarea placeholder="أخبرنا عن مطعمك وما تحتاجه..." value={form.message}
                    onChange={e=>setForm(p=>({...p,message:e.target.value}))} rows={4}
                    style={{width:"100%",fontFamily:"Cairo",fontSize:14,padding:"12px 16px",background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)",borderRadius:8,color:"#f0f4ff",resize:"vertical"}}/>
                </div>
                <button type="submit" className="btn-hover" disabled={status==="loading"} style={{fontFamily:"Cairo",fontSize:15,fontWeight:700,padding:"14px",borderRadius:8,border:"none",background:status==="loading"?"rgba(26,79,196,.5)":"#1a4fc4",color:"#fff",cursor:"pointer",boxShadow:"0 0 30px rgba(26,79,196,.3)"}}>
                  {status==="loading"?"جاري الإرسال...":"📩 إرسال الرسالة"}
                </button>
              </form>
            )}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:16,animation:"fadeUp .8s ease .4s both"}}>
            <div style={{marginBottom:8}}>
              <h2 style={{fontFamily:"Cairo",fontSize:22,fontWeight:900,color:"#f0f4ff",marginBottom:8}}>أو تواصل مباشرة</h2>
              <p style={{fontFamily:"Cairo",fontSize:13,color:"rgba(240,244,255,.35)"}}>نرد على واتساب خلال دقائق</p>
            </div>
            {channels.map((c,i)=>(
              <a key={i} href={c.link} target="_blank" className="card-hover" style={{display:"flex",alignItems:"center",gap:16,background:c.bg,border:`1px solid ${c.color}`,borderRadius:12,padding:"20px 24px",textDecoration:"none"}}>
                <div style={{width:48,height:48,borderRadius:12,background:c.color,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{c.icon}</div>
                <div>
                  <div style={{fontFamily:"Cairo",fontSize:12,color:c.tc,fontWeight:700,letterSpacing:".1em",marginBottom:4}}>{c.label}</div>
                  <div style={{fontFamily:"Space Mono",fontSize:15,fontWeight:700,color:"#f0f4ff",direction:"ltr"}}>{c.val}</div>
                </div>
              </a>
            ))}
            <div style={{background:"#0a1628",border:"1px solid rgba(255,255,255,.05)",borderRadius:12,padding:"24px",marginTop:8}}>
              <h3 style={{fontFamily:"Cairo",fontSize:15,fontWeight:900,color:"#f0f4ff",marginBottom:16}}>⏰ أوقات العمل</h3>
              {[{day:"السبت — الخميس",time:"9:00 ص — 10:00 م"},{day:"الجمعة",time:"2:00 م — 10:00 م"}].map(h=>(
                <div key={h.day} style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
                  <span style={{fontFamily:"Cairo",fontSize:13,color:"rgba(240,244,255,.5)"}}>{h.day}</span>
                  <span style={{fontFamily:"Space Mono",fontSize:12,color:"#00ff88"}}>{h.time}</span>
                </div>
              ))}
              <div style={{marginTop:16,padding:"10px 14px",background:"rgba(0,255,136,.06)",border:"1px solid rgba(0,255,136,.15)",borderRadius:8}}>
                <span style={{fontFamily:"Cairo",fontSize:12,color:"#00ff88",fontWeight:700}}>✅ واتساب متاح على مدار الساعة</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      <footer style={{background:"#000510",borderTop:"1px solid rgba(255,255,255,.05)",padding:"40px 48px",textAlign:"center",position:"relative",zIndex:2}}>
        <p style={{fontFamily:"Cairo",fontSize:12,color:"rgba(240,244,255,.2)"}}>© 2026 IQR لإدارة وتطوير المطاعم — العراق — جميع الحقوق محفوظة</p>
      </footer>
    </>
  );
}
