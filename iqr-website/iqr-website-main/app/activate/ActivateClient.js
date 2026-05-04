"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { activateSubscription } from "../../subscription/SubscriptionGate";

const G = `
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;900&family=Space+Mono:wght@400;700&display=swap');
  *{margin:0;padding:0;box-sizing:border-box}
  body{background:#000814;font-family:'Cairo',sans-serif}
  @keyframes fadeUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
  @keyframes checkPop{0%{transform:scale(0)}70%{transform:scale(1.2)}100%{transform:scale(1)}}
  @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
  @keyframes spin{to{transform:rotate(360deg)}}
`;

export default function ActivateClient() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) { setStatus("invalid"); return; }
    if (token.startsWith("bronze_30d_") && token.length > 15) {
      activateSubscription(1);
      setStatus("success");
    } else {
      setStatus("invalid");
    }
  }, [searchParams]);

  return (
    <>
      <style>{G}</style>
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#000814", padding:"48px", direction:"rtl" }}>

        {status === "checking" && (
          <div style={{ textAlign:"center" }}>
            <div style={{ width:40, height:40, border:"3px solid rgba(205,127,50,.2)", borderTopColor:"#cd7f32", borderRadius:"50%", animation:"spin .8s linear infinite", margin:"0 auto 20px" }} />
            <p style={{ fontFamily:"Cairo", fontSize:16, color:"rgba(240,244,255,.4)" }}>جاري التحقق من الاشتراك...</p>
          </div>
        )}

        {status === "success" && (
          <div style={{ maxWidth:480, textAlign:"center", animation:"fadeUp .8s ease" }}>
            <div style={{ width:80, height:80, borderRadius:"50%", background:"linear-gradient(135deg,#cd7f32,#f5c874)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:36, margin:"0 auto 24px", animation:"checkPop .5s ease", boxShadow:"0 0 50px rgba(205,127,50,.5)" }}>🎉</div>
            <h1 style={{ fontFamily:"Cairo", fontSize:32, fontWeight:900, color:"#f0f4ff", marginBottom:12 }}>تم تفعيل اشتراكك!</h1>
            <p style={{ fontFamily:"Cairo", fontSize:15, color:"rgba(240,244,255,.5)", lineHeight:1.8, marginBottom:32 }}>
              مرحباً بك في الخطة البرونزية من IQR 🥉<br />
              الآن يمكنك الوصول لجميع المقالات والداشبورد.
            </p>
            <div style={{ background:"#0a1628", border:"1px solid rgba(205,127,50,.2)", borderRadius:12, padding:"20px", marginBottom:28 }}>
              <div style={{ height:2, background:"linear-gradient(to right,#cd7f32,#f5c874)", borderRadius:99, marginBottom:16 }} />
              {[
                { icon:"📚", text:"وصول كامل للمدونة", link:"/blog/", btn:"اذهب للمدونة" },
                { icon:"📊", text:"الداشبورد التفاعلي", link:"/dashboard/", btn:"افتح الداشبورد" },
              ].map((item,i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 0", borderBottom:i===0?"1px solid rgba(255,255,255,.05)":"none" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <span style={{ fontSize:18 }}>{item.icon}</span>
                    <span style={{ fontFamily:"Cairo", fontSize:13, color:"rgba(240,244,255,.7)" }}>{item.text}</span>
                  </div>
                  <a href={item.link} style={{ fontFamily:"Cairo", fontSize:12, fontWeight:700, color:"#cd7f32", textDecoration:"none" }}>{item.btn} ←</a>
                </div>
              ))}
            </div>
            <a href="/blog/" style={{ display:"block", fontFamily:"Cairo", fontSize:15, fontWeight:900, padding:"16px", background:"linear-gradient(135deg,#cd7f32,#f5c874)", color:"#000", borderRadius:10, textDecoration:"none", boxShadow:"0 0 40px rgba(205,127,50,.4)" }}>
              ابدأ الاستكشاف 🚀
            </a>
          </div>
        )}

        {status === "invalid" && (
          <div style={{ maxWidth:480, textAlign:"center", animation:"fadeUp .8s ease" }}>
            <div style={{ fontSize:48, marginBottom:20 }}>❌</div>
            <h1 style={{ fontFamily:"Cairo", fontSize:28, fontWeight:900, color:"#f0f4ff", marginBottom:12 }}>رابط غير صالح</h1>
            <p style={{ fontFamily:"Cairo", fontSize:14, color:"rgba(240,244,255,.5)", lineHeight:1.8, marginBottom:28 }}>
              هذا الرابط غير صالح أو انتهت صلاحيته.<br />
              تواصل مع فريق IQR عبر واتساب للحصول على رابط جديد.
            </p>
            <div style={{ display:"flex", gap:12, justifyContent:"center" }}>
              <a href="https://wa.me/9647734383431" target="_blank" style={{ fontFamily:"Cairo", fontSize:14, fontWeight:700, padding:"13px 28px", background:"linear-gradient(135deg,#cd7f32,#f5c874)", color:"#000", borderRadius:8, textDecoration:"none" }}>📲 تواصل معنا</a>
              <a href="/pricing/" style={{ fontFamily:"Cairo", fontSize:14, fontWeight:700, padding:"12px 24px", background:"transparent", color:"rgba(240,244,255,.5)", border:"1px solid rgba(255,255,255,.1)", borderRadius:8, textDecoration:"none" }}>صفحة الاشتراك</a>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
