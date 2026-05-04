"use client";
import { useState, useEffect, useRef, useCallback } from "react";

const G = `
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;900&family=Space+Mono:wght@400;700&display=swap');
  *,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
  html{scroll-behavior:smooth}
  body{background:var(--bg-primary,#000814);overflow-x:hidden;font-family:'Cairo',sans-serif;transition:background .35s,color .35s}
  ::-webkit-scrollbar{width:4px}
  ::-webkit-scrollbar-thumb{background:var(--accent,#1a4fc4);border-radius:99px}
  ::selection{background:var(--accent-glow,rgba(26,79,196,.25))}
  @keyframes fadeUp{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes orb{0%,100%{transform:translate(0,0)}50%{transform:translate(30px,-20px)}}
  @keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}
  @keyframes trailFade{from{opacity:.7;transform:translate(-50%,-50%) scale(1)}to{opacity:0;transform:translate(-50%,-50%) scale(.2)}}

  @media(max-width:900px){
    .nav-links-wrap{display:none!important}
    .mobile-menu-btn{display:flex!important}
  }
`;

function CursorTrail() {
  const curRef = useRef(null);
  const ringRef = useRef(null);
  const posRef = useRef({mx:0,my:0,rx:0,ry:0});

  useEffect(() => {
    const onMove = (e) => {
      const {clientX: x, clientY: y} = e;
      posRef.current.mx = x;
      posRef.current.my = y;
      if (curRef.current) {
        curRef.current.style.left = x + "px";
        curRef.current.style.top = y + "px";
      }
      const dot = document.createElement("div");
      dot.style.cssText = `position:fixed;pointer-events:none;z-index:9998;width:6px;height:6px;border-radius:50%;background:rgba(74,158,255,0.8);left:${x}px;top:${y}px;transform:translate(-50%,-50%);animation:trailFade .6s forwards;`;
      document.body.appendChild(dot);
      setTimeout(() => dot.remove(), 600);
    };
    document.addEventListener("mousemove", onMove);
    const loop = () => {
      const p = posRef.current;
      p.rx += (p.mx - p.rx) * .1;
      p.ry += (p.my - p.ry) * .1;
      if (ringRef.current) {
        ringRef.current.style.left = p.rx + "px";
        ringRef.current.style.top = p.ry + "px";
      }
      requestAnimationFrame(loop);
    };
    loop();
    return () => document.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <>
      <div ref={curRef} style={{position:"fixed",zIndex:9999,pointerEvents:"none",borderRadius:"50%",width:10,height:10,background:"var(--blue-accent)",transform:"translate(-50%,-50%)",transition:"width .15s,height .15s"}} />
      <div ref={ringRef} style={{position:"fixed",zIndex:9999,pointerEvents:"none",borderRadius:"50%",width:38,height:38,border:"1px solid rgba(26,79,196,.5)",transform:"translate(-50%,-50%)",transition:"width .3s,height .3s"}} />
    </>
  );
}

function ParticleBackground() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight;
    let mx = 0, my = 0;
    let t = 0;

    const N = 120;
    const particles = Array.from({length:N}, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      z: Math.random() * 3 + 0.5,
      vx: (Math.random()-.5)*.3,
      vy: (Math.random()-.5)*.3,
      color: Math.random() > .7 ? "var(--blue-accent)" : Math.random() > .5 ? "var(--blue-accent)" : "rgba(240,244,255,.3)",
      r: Math.random() * 1.5 + .5,
    }));

    const onMove = (e) => { mx = e.clientX; my = e.clientY; };
    window.addEventListener("mousemove", onMove);
    const onResize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
    window.addEventListener("resize", onResize);

    let raf;
    const draw = () => {
      t += .005;
      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = "rgba(10,22,40,.6)";
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 80) {
        ctx.beginPath(); ctx.moveTo(x + Math.sin(t + x*.01)*5, 0); ctx.lineTo(x + Math.sin(t + x*.01)*5, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += 80) {
        ctx.beginPath(); ctx.moveTo(0, y + Math.cos(t + y*.01)*5); ctx.lineTo(W, y + Math.cos(t + y*.01)*5); ctx.stroke();
      }
      particles.forEach((p, i) => {
        const dx = (mx - W/2) * .003 * p.z;
        const dy = (my - H/2) * .003 * p.z;
        p.x += p.vx + dx * .01;
        p.y += p.vy + dy * .01;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        const alpha = (.3 + Math.sin(t * 2 + i) * .2) * p.z;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.shadowBlur = p.color === "var(--blue-accent)" ? 12 : 6;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * p.z, 0, Math.PI*2);
        ctx.fill();
        ctx.shadowBlur = 0;
        particles.forEach((p2, j) => {
          if (j <= i) return;
          const ddx = p.x - p2.x, ddy = p.y - p2.y;
          const dist = Math.sqrt(ddx*ddx + ddy*ddy);
          if (dist < 120) {
            ctx.globalAlpha = (1 - dist/120) * .15;
            ctx.strokeStyle = "var(--blue-accent)";
            ctx.lineWidth = .5;
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
          }
        });
      });
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("mousemove", onMove); window.removeEventListener("resize", onResize); };
  }, []);

  return <canvas ref={canvasRef} style={{position:"fixed",top:0,left:0,width:"100%",height:"100%",zIndex:0,pointerEvents:"none",transition:"opacity .4s"}} />;
}

function useVisible(threshold = .15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, {threshold});
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function Card3D({children, style, className}) {
  const ref = useRef(null);
  const onMove = (e) => {
    const card = ref.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - .5;
    const y = (e.clientY - rect.top) / rect.height - .5;
    card.style.transform = `perspective(800px) rotateY(${x*20}deg) rotateX(${-y*20}deg) scale(1.04)`;
    card.style.boxShadow = `${-x*20}px ${-y*20}px 40px rgba(26,79,196,.2), 0 0 60px rgba(26,79,196,.08)`;
  };
  const onLeave = () => {
    const card = ref.current;
    if (!card) return;
    card.style.transform = "perspective(800px) rotateY(0deg) rotateX(0deg) scale(1)";
    card.style.boxShadow = "none";
  };
  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} className={className}
      style={{transition:"transform .1s ease, box-shadow .2s ease", transformStyle:"preserve-3d", cursor:"none", ...style}}>
      {children}
    </div>
  );
}

function Counter({target, suffix=""}) {
  const [val, setVal] = useState(0);
  const [ref, visible] = useVisible(.3);
  useEffect(() => {
    if (!visible) return;
    let cur = 0;
    const step = target / 50;
    const id = setInterval(() => {
      cur = Math.min(cur + step, target);
      setVal(Math.round(cur));
      if (cur >= target) clearInterval(id);
    }, 30);
    return () => clearInterval(id);
  }, [visible, target]);
  return <span ref={ref}>{val}{suffix}</span>;
}

const WhatsAppIcon = ({size=20,color="var(--text-primary)"}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);
const InstagramIcon = ({size=20,color="var(--text-primary)"}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
  </svg>
);
const TikTokIcon = ({size=20,color="var(--text-primary)"}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.74a4.85 4.85 0 01-1.01-.05z"/>
  </svg>
);
const FacebookIcon = ({size=20,color="var(--text-primary)"}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);
  const pageLinks = [{h:"/about/",l:"من نحن"},{h:"/blog/",l:"المدونة"},{h:"/contact/",l:"تواصل"}];
  const scrollLinks = [{h:"#problem",l:"التحدي"},{h:"#solution",l:"الحل"},{h:"#services",l:"الخدمات"},{h:"#results",l:"النتائج"}];
  return (
    <>
    <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:100,padding:"16px 32px",display:"flex",alignItems:"center",justifyContent:"space-between",
      background:scrolled||mobileOpen?"rgba(0,8,20,.97)":"transparent",backdropFilter:scrolled||mobileOpen?"blur(24px)":"none",
      borderBottom:scrolled||mobileOpen?"1px solid rgba(26,79,196,.1)":"none",transition:"all .4s ease",direction:"rtl"}}>
      <a href="/" style={{textDecoration:"none",display:"flex",alignItems:"center",gap:10,cursor:"none"}}>
        <img src="/logo-white.png" id="nav-logo" alt="IQR" style={{height:38,width:"auto",transition:"opacity .3s"}}/>
      </a>
      <div className="nav-links-wrap" style={{display:"flex",alignItems:"center",gap:8}}>
        {pageLinks.map(({h,l}) => (
          <a key={h} href={h} style={{fontFamily:"Cairo",fontSize:13,fontWeight:700,color:"var(--blue-accent)",textDecoration:"none",letterSpacing:".06em",cursor:"none",transition:"all .25s",padding:"7px 16px",border:"1px solid rgba(10,31,92,.5)",borderRadius:6,background:"rgba(10,31,92,.15)"}}
            onMouseEnter={e=>{e.currentTarget.style.background="rgba(74,158,255,.12)";e.currentTarget.style.borderColor="var(--blue-accent)";e.currentTarget.style.transform="translateY(-1px)"}}
            onMouseLeave={e=>{e.currentTarget.style.background="rgba(10,31,92,.15)";e.currentTarget.style.borderColor="rgba(10,31,92,.5)";e.currentTarget.style.transform=""}}>{l}</a>
        ))}
        <span style={{width:1,height:18,background:"var(--border)",display:"inline-block",margin:"0 12px"}}/>
        {scrollLinks.map(({h,l}) => (
          <a key={h} href={h} style={{fontFamily:"Cairo",fontSize:13,fontWeight:600,color:"var(--text-secondary)",textDecoration:"none",letterSpacing:".06em",cursor:"none",transition:"color .25s",padding:"4px 8px"}}
            onMouseEnter={e=>e.target.style.color="var(--text-primary)"} onMouseLeave={e=>e.target.style.color="var(--text-secondary)"}>{l}</a>
        ))}
      </div>
      <div style={{display:"flex",gap:10,alignItems:"center"}}>
        <a href="/dashboard" className="nav-links-wrap" style={{fontFamily:"Cairo",fontSize:13,fontWeight:700,padding:"10px 20px",background:"transparent",color:"rgba(240,244,255,.6)",border:"1px solid rgba(255,255,255,.1)",borderRadius:4,cursor:"none",letterSpacing:".06em",textDecoration:"none",transition:"all .2s"}}
          onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--blue-accent)";e.currentTarget.style.color="var(--blue-accent)"}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.color="rgba(240,244,255,.6)"}}>
          ⬡ الداشبورد
        </a>
        <button onClick={()=>setMobileOpen(o=>!o)} className="mobile-menu-btn" style={{display:"none",flexDirection:"column",justifyContent:"center",gap:5,background:"transparent",border:"1px solid rgba(255,255,255,.15)",borderRadius:8,padding:"10px 12px",cursor:"pointer"}}>
          <span style={{width:20,height:2,background:mobileOpen?"var(--blue-accent)":"var(--text-primary)",transition:"all .3s",transform:mobileOpen?"rotate(45deg) translate(5px,5px)":"none",display:"block"}}/>
          <span style={{width:20,height:2,background:"var(--text-primary)",opacity:mobileOpen?0:1,transition:"all .2s",display:"block"}}/>
          <span style={{width:20,height:2,background:mobileOpen?"var(--blue-accent)":"var(--text-primary)",transition:"all .3s",transform:mobileOpen?"rotate(-45deg) translate(5px,-5px)":"none",display:"block"}}/>
        </button>
      </div>
    </nav>
    {mobileOpen && (
      <div style={{position:"fixed",top:"64px",left:0,right:0,zIndex:99,background:"rgba(0,8,20,.97)",backdropFilter:"blur(24px)",borderBottom:"1px solid rgba(26,79,196,.15)",padding:"20px 24px",display:"flex",flexDirection:"column",gap:10,direction:"rtl",animation:"fadeIn .2s ease"}}>
        {pageLinks.map(({h,l}) => (
          <a key={h} href={h} onClick={()=>setMobileOpen(false)} style={{fontFamily:"Cairo",fontSize:15,fontWeight:700,color:"var(--blue-accent)",textDecoration:"none",padding:"12px 16px",border:"1px solid rgba(110,168,254,.3)",borderRadius:8,background:"rgba(110,168,254,.07)",textAlign:"right"}}>{l}</a>
        ))}
        <div style={{height:1,background:"var(--border)",margin:"4px 0"}}/>
        {scrollLinks.map(({h,l}) => (
          <a key={h} href={h} onClick={()=>setMobileOpen(false)} style={{fontFamily:"Cairo",fontSize:14,fontWeight:600,color:"rgba(240,244,255,.55)",textDecoration:"none",padding:"10px 16px",borderRadius:8,background:"var(--bg-card)",textAlign:"right"}}>{l}</a>
        ))}
        <div style={{height:1,background:"var(--border)",margin:"4px 0"}}/>
        <a href="/dashboard" onClick={()=>setMobileOpen(false)} style={{fontFamily:"Cairo",fontSize:14,fontWeight:700,color:"var(--blue-accent)",textDecoration:"none",padding:"12px 16px",border:"1px solid rgba(0,195,255,.25)",borderRadius:8,background:"rgba(0,195,255,.07)",textAlign:"right"}}>⬡ الداشبورد</a>
      </div>
    )}
    </>
  );
}

function Hero() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setTimeout(() => setLoaded(true), 300); }, []);

  return (
    <section id="hero" style={{height:"100vh",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",position:"relative",zIndex:2}}>
      <div style={{position:"absolute",inset:0,overflow:"hidden",pointerEvents:"none"}}>
        <div style={{position:"absolute",width:600,height:600,borderRadius:"50%",background:"radial-gradient(ellipse, rgba(26,79,196,.15), transparent 70%)",top:"10%",right:"20%",filter:"blur(40px)"}}/>
        <div style={{position:"absolute",width:500,height:500,borderRadius:"50%",background:"radial-gradient(ellipse, rgba(0,195,255,.1), transparent 70%)",bottom:"20%",left:"15%",filter:"blur(50px)"}}/>
        <div style={{position:"absolute",width:400,height:400,borderRadius:"50%",background:"radial-gradient(ellipse, rgba(255,214,10,.06), transparent 70%)",top:"50%",left:"50%",filter:"blur(30px)"}}/>
      </div>

      <div style={{textAlign:"center",position:"relative",zIndex:5,padding:"0 20px",direction:"rtl"}}>
        <div style={{fontSize:11,fontWeight:700,letterSpacing:".4em",color:"var(--blue-accent)",textTransform:"uppercase",marginBottom:32,display:"flex",alignItems:"center",justifyContent:"center",gap:16,opacity:loaded?1:0,transform:loaded?"none":"translateY(30px)",transition:"all 1s ease .3s",fontFamily:"Cairo"}}>
          <span style={{flex:1,maxWidth:60,height:1,background:"linear-gradient(to right, transparent, #1a4fc4)"}}/>
          الشركة الأولى لإدارة وتطوير المطاعم في العراق
          <span style={{flex:1,maxWidth:60,height:1,background:"linear-gradient(to left, transparent, #1a4fc4)"}}/>
        </div>

        {[{text:"هندسة.", cls:"normal"},{text:"أتمتة.", cls:"stroke"},{text:"نمو.", cls:"accent"}].map((line, i) => (
          <div key={i} style={{overflow:"hidden"}}>
            <div style={{fontFamily:"Cairo",fontSize:"clamp(64px,12vw,150px)",fontWeight:900,lineHeight:.88,letterSpacing:"-.03em",display:"block",color:line.cls==="accent"?"var(--blue-accent)":line.cls==="stroke"?"transparent":"var(--text-primary)",WebkitTextStroke:line.cls==="stroke"?"2px rgba(255,255,255,.3)":"none",opacity:loaded?1:0,transform:loaded?"none":"translateY(110%)",transition:`all 1.2s cubic-bezier(.16,1,.3,1) ${.5+i*.15}s`,textShadow:line.cls==="accent"?"0 0 80px rgba(26,79,196,.5)":"none"}}>
              {line.text}
            </div>
          </div>
        ))}

        <p style={{fontFamily:"Cairo",fontSize:"clamp(14px,1.4vw,18px)",fontWeight:400,color:"rgba(240,244,255,.55)",maxWidth:520,margin:"32px auto 48px",lineHeight:1.9,opacity:loaded?1:0,transform:loaded?"none":"translateY(30px)",transition:"all 1s ease 1.1s"}}>
          نحول فوضى مطعمك إلى دقة هندسية ذاتية — سواء كنت تفتح أول فرع أو تدير سلسلة كاملة في العراق
        </p>

        <div style={{display:"flex",gap:20,justifyContent:"center",opacity:loaded?1:0,transform:loaded?"none":"translateY(30px)",transition:"all 1s ease 1.3s",flexWrap:"wrap"}}>
          <a href="/dashboard" style={{fontFamily:"Cairo",fontSize:16,fontWeight:700,padding:"18px 56px",background:"linear-gradient(135deg,#0a1f5c,#162a7a)",color:"#f0f4ff",border:"1px solid rgba(74,158,255,.4)",borderRadius:6,textDecoration:"none",cursor:"none",letterSpacing:".06em",transition:"all .3s",boxShadow:"0 0 30px rgba(10,31,92,.6),inset 0 1px 0 rgba(255,255,255,.1)"}}
            onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow="0 12px 50px rgba(10,31,92,.8),0 0 40px rgba(74,158,255,.3),inset 0 1px 0 rgba(255,255,255,.15)"}}
            onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="0 0 30px rgba(10,31,92,.6),inset 0 1px 0 rgba(255,255,255,.1)"}}>
            ⬡ جرب الداشبورد
          </a>
          <a href="#solution" style={{fontFamily:"Cairo",fontSize:16,fontWeight:600,padding:"17px 48px",background:"transparent",color:"rgba(240,244,255,.6)",border:"1px solid rgba(255,255,255,.1)",borderRadius:6,textDecoration:"none",cursor:"none",letterSpacing:".06em",transition:"all .3s"}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(74,158,255,.5)";e.currentTarget.style.color="#f0f4ff";e.currentTarget.style.background="rgba(74,158,255,.06)"}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,.1)";e.currentTarget.style.color="rgba(240,244,255,.6)";e.currentTarget.style.background="transparent"}}>
            اكتشف الحل
          </a>
        </div>
      </div>

      <div style={{position:"absolute",bottom:40,left:"50%",transform:"translateX(-50%)",display:"flex",flexDirection:"column",alignItems:"center",gap:10,animation:"fadeIn 1s 3s both"}}>
        <span style={{fontFamily:"Cairo",fontSize:10,letterSpacing:".25em",color:"rgba(240,244,255,.3)",textTransform:"uppercase",fontWeight:700}}>اسحب للأسفل</span>
        <div style={{width:1,height:50,background:"linear-gradient(to bottom, var(--blue-accent), transparent)"}}/>
      </div>
    </section>
  );
}

function Marquee() {
  const items = ["توجيه ذكي للطلبات","مخزن مؤتمت","تقليل الهدر","تحليلات استباقية","رفع الكفاءة ٣٥٪","إدارة الموظفين","تتبع الأداء","تكامل الكاشير"];
  const doubled = [...items,...items,...items,...items];
  return (
    <div style={{padding:"24px 0",overflow:"hidden",borderTop:"1px solid rgba(255,255,255,.05)",borderBottom:"1px solid rgba(255,255,255,.05)",background:"rgba(26,79,196,.02)",position:"relative",zIndex:2}}>
      <div style={{display:"flex",gap:0,width:"max-content",animation:"marquee 30s linear infinite"}}>
        {doubled.map((item, i) => (
          <div key={i} style={{fontFamily:"Space Mono",fontSize:11,fontWeight:700,color:"var(--text-muted)",letterSpacing:".2em",textTransform:"uppercase",padding:"0 40px",whiteSpace:"nowrap",display:"flex",alignItems:"center",gap:16}}>
            {item}<span style={{color:"var(--blue-accent)",fontSize:7}}>◆</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PROBLEM (UPDATED) ────────────────────────────────────────────────────────
function Problem() {
  const cards = [
    { icon:"📦", title:"فوضى المخزن", desc:"طلبيات يدوية، مواد تنفد بدون تحذير، هدر يومي في المواد الغذائية — كل هذا يُكلّفك آلاف الدنانير شهرياً دون أن تشعر.", stat:"// يصل الهدر إلى 30% من التكاليف" },
    { icon:"⏱", title:"تأخر الطلبات وغياب آلية الاستقبال", desc:"بدون نظام توجيه واضح لاستقبال الطلبات من المنصات والتطبيقات، الطلبات تتأخر وتضيع وتكلفك عملاء حقيقيين كل يوم.", stat:"// 6-12 دقيقة ضائعة لكل طلب" },
    { icon:"📞", title:"اتصالات ضائعة بلا إحصاء", desc:"لا تعرف كم اتصال وصل ولم يُرد عليه، ولا كم تحوّل لطلب فعلي. غياب آلية استقبال الاتصالات يعني خسارة صامتة متراكمة.", stat:"// حتى 40% من الاتصالات تضيع" },
    { icon:"🤝", title:"تجربة عملاء بدون هوية (CRM)", desc:"لا تعرف زبائنك المميزين، لا تتابع شكاواهم، ولا تملك بيانات تساعدك على استعادتهم أو الاحتفاظ بهم — المنافس الأذكى يفعل ذلك.", stat:"// 5x تكلفة جذب زبون جديد" },
    { icon:"👥", title:"إدارة بدون بيانات", desc:"قرارات تُتخذ بالحدس لا بالأرقام — من يعمل في أي وردية، متى الذروة، أي صنف يخسرك ولا تعرف.", stat:"// 40% من القرارات خاطئة" },
    { icon:"📉", title:"أرباح أقل مما تستحق", desc:"مطعمك يعمل لكنه لا يُحقق إمكاناته الكاملة. بدون خطة عمليات واضحة، الأرباح تسرب في كل اتجاه.", stat:"// 20-35% ربح ضائع قابل للاسترداد" },
  ];
  const [ref, visible] = useVisible(.1);

  return (
    <section id="problem" ref={ref} style={{padding:"160px 48px",maxWidth:1400,margin:"0 auto",position:"relative",zIndex:2,direction:"rtl"}}>
      <div style={{fontSize:10,fontWeight:700,letterSpacing:".4em",color:"var(--blue-accent)",textTransform:"uppercase",marginBottom:24,display:"flex",alignItems:"center",gap:12,fontFamily:"Cairo",opacity:visible?1:0,transform:visible?"none":"translateX(20px)",transition:"all .7s ease"}}>
        <span style={{width:30,height:1,background:"var(--blue-accent)"}}/>التحديات
      </div>
      <h2 style={{fontFamily:"Cairo",fontSize:"clamp(36px,5vw,72px)",fontWeight:900,lineHeight:.95,letterSpacing:"-.025em",marginBottom:80,color:"var(--text-primary)",opacity:visible?1:0,transform:visible?"none":"translateY(40px)",transition:"all 1s ease .2s"}}>
        المطاعم تخسر<br/>
        <em style={{fontStyle:"normal",color:"var(--blue-accent)"}}>يومياً</em> بدون<br/>
        <span style={{color:"rgba(240,244,255,.2)"}}>نظام حقيقي</span>
      </h2>

      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:3}}>
        {cards.map((c, i) => (
          <Card3D key={i} style={{background:"var(--bg-secondary)",padding:"52px 44px",position:"relative",overflow:"hidden",opacity:visible?1:0,transform:visible?"none":"translateY(40px)",transition:`all .8s ease ${.3+(i%3)*.12}s`}}>
            <span style={{fontSize:36,marginBottom:24,display:"block"}}>{c.icon}</span>
            <h3 style={{fontFamily:"Cairo",fontSize:20,fontWeight:900,marginBottom:12,color:"rgba(240,244,255,.85)"}}>{c.title}</h3>
            <p style={{fontFamily:"Cairo",fontSize:14,color:"var(--text-secondary)",lineHeight:1.8,marginBottom:36}}>{c.desc}</p>
            <span style={{position:"absolute",bottom:28,right:44,fontFamily:"Space Mono",fontSize:11,color:"var(--blue-accent)",letterSpacing:".1em"}}>{c.stat}</span>
          </Card3D>
        ))}
      </div>
    </section>
  );
}

// ─── SOLUTION ─────────────────────────────────────────────────────────────────
function Solution() {
  const [ref1, v1] = useVisible(.1);
  const [ref2, v2] = useVisible(.1);
  const [ref3, v3] = useVisible(.1);

  return (
    <section id="solution" style={{padding:"160px 0",background:"var(--bg-primary)",overflow:"hidden",position:"relative",zIndex:2}}>
      <div style={{position:"absolute",top:"30%",right:"-10%",width:500,height:500,borderRadius:"50%",background:"radial-gradient(ellipse, rgba(26,79,196,.08), transparent 70%)",filter:"blur(60px)",pointerEvents:"none"}}/>
      <div style={{maxWidth:1400,margin:"0 auto",padding:"0 48px",direction:"rtl"}}>
        <div style={{fontSize:10,fontWeight:700,letterSpacing:".4em",color:"var(--blue-accent)",textTransform:"uppercase",marginBottom:24,display:"flex",alignItems:"center",gap:12,fontFamily:"Cairo"}}>
          <span style={{width:30,height:1,background:"var(--blue-accent)"}}/>الحل
        </div>
        <h2 style={{fontFamily:"Cairo",fontSize:"clamp(36px,5vw,72px)",fontWeight:900,lineHeight:.95,letterSpacing:"-.025em",marginBottom:80,color:"var(--text-primary)"}}>
          نظام كامل.<br/><em style={{fontStyle:"normal",color:"var(--blue-accent)"}}>يعمل وأنت نايم.</em>
        </h2>

        <div ref={ref1} style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:80,alignItems:"center",marginBottom:120}}>
          <div style={{opacity:v1?1:0,transform:v1?"none":"translateY(40px)",transition:"all 1s ease"}}>
            <h3 style={{fontFamily:"Cairo",fontSize:"clamp(28px,3.5vw,48px)",fontWeight:900,lineHeight:1,marginBottom:20,color:"var(--text-primary)"}}>توجيه ذكي للطلبات</h3>
            <p style={{fontFamily:"Cairo",fontSize:16,color:"var(--text-secondary)",lineHeight:1.9,marginBottom:32}}>كل طلب يصل للشخص الصح، في الوقت الصح، بدون فوضى وبدون ضياع — نظام يتعلم مطعمك ويتكيف تلقائياً.</p>
            {["توزيع تلقائي للطلبات على المحطات","تنبيهات فورية عند التأخر","تتبع زمن تحضير كل صنف","أولويات ذكية حسب الطاولة"].map((f,i) => (
              <div key={i} style={{display:"flex",alignItems:"center",gap:14,fontFamily:"Cairo",fontSize:14,fontWeight:600,color:"rgba(240,244,255,.65)",marginBottom:14}}>
                <span style={{width:20,height:20,background:"rgba(26,79,196,.15)",border:"1px solid rgba(26,79,196,.3)",borderRadius:4,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"var(--blue-accent)"}}>✓</span>
                {f}
              </div>
            ))}
          </div>
          <VisualCard1 visible={v1} />
        </div>

        <div ref={ref2} style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:80,alignItems:"center",marginBottom:120,direction:"ltr"}}>
          <VisualCard2 visible={v2} />
          <div style={{direction:"rtl",opacity:v2?1:0,transform:v2?"none":"translateY(40px)",transition:"all 1s ease .2s"}}>
            <h3 style={{fontFamily:"Cairo",fontSize:"clamp(28px,3.5vw,48px)",fontWeight:900,lineHeight:1,marginBottom:20,color:"var(--text-primary)"}}>مخزن مؤتمت بالكامل</h3>
            <p style={{fontFamily:"Cairo",fontSize:16,color:"var(--text-secondary)",lineHeight:1.9,marginBottom:32}}>النظام يراقب كل مادة خام، يحسب الاستهلاك تلقائياً، ويرسل الطلبيات للموردين قبل ما تنفد — بدون أي تدخل منك.</p>
            {["خصم تلقائي عند كل طلب من المخزون","تنبيه عند اقتراب نفاد أي صنف","طلبية تلقائية للموردين","تقارير الهدر الأسبوعية"].map((f,i) => (
              <div key={i} style={{display:"flex",alignItems:"center",gap:14,fontFamily:"Cairo",fontSize:14,fontWeight:600,color:"rgba(240,244,255,.65)",marginBottom:14}}>
                <span style={{width:20,height:20,background:"rgba(26,79,196,.15)",border:"1px solid rgba(26,79,196,.3)",borderRadius:4,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"var(--blue-accent)"}}>✓</span>
                {f}
              </div>
            ))}
          </div>
        </div>

        <div ref={ref3} style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:80,alignItems:"center"}}>
          <div style={{direction:"rtl",opacity:v3?1:0,transform:v3?"none":"translateY(40px)",transition:"all 1s ease"}}>
            <h3 style={{fontFamily:"Cairo",fontSize:"clamp(28px,3.5vw,48px)",fontWeight:900,lineHeight:1,marginBottom:20,color:"var(--text-primary)"}}>تحليلات وتقارير ذكية</h3>
            <p style={{fontFamily:"Cairo",fontSize:16,color:"var(--text-secondary)",lineHeight:1.9,marginBottom:32}}>بيانات حية من مطعمك لحظة بلحظة — كل قرار مبني على أرقام حقيقية، لا على حدس وتخمين.</p>
            {["داشبورد مباشر من هاتفك","تقارير يومية وأسبوعية وشهرية","تحديد أفضل وأسوأ الأصناف أداءً","مقارنة الأداء بين الفروع"].map((f,i) => (
              <div key={i} style={{display:"flex",alignItems:"center",gap:14,fontFamily:"Cairo",fontSize:14,fontWeight:600,color:"rgba(240,244,255,.65)",marginBottom:14}}>
                <span style={{width:20,height:20,background:"rgba(26,79,196,.15)",border:"1px solid rgba(26,79,196,.3)",borderRadius:4,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"var(--blue-accent)"}}>✓</span>
                {f}
              </div>
            ))}
          </div>
          <VisualCard3 visible={v3} />
        </div>
      </div>
    </section>
  );
}

function VisualCard1({visible}) {
  return (
    <div style={{position:"relative",height:420,opacity:visible?1:0,transform:visible?"none":"translateX(60px)",transition:"all 1.2s ease .3s"}}>
      <Card3D style={{position:"absolute",inset:0,background:"linear-gradient(135deg, rgba(10,22,40,.97), rgba(0,8,20,.85))",border:"1px solid rgba(255,255,255,.06)",borderRadius:12,padding:"32px 36px",display:"flex",flexDirection:"column",justifyContent:"center"}}>
        <div style={{fontFamily:"Space Mono",fontSize:36,fontWeight:700,color:"var(--text-primary)"}}>6.2 <span style={{color:"var(--blue-accent)"}}>د</span></div>
        <div style={{fontFamily:"Cairo",fontSize:12,color:"var(--text-secondary)",marginTop:6,letterSpacing:".1em"}}>متوسط وقت التحضير</div>
        {[{label:"الكفاءة",pct:92,color:"var(--blue-accent)"},{label:"الدقة",pct:99,color:"var(--blue-accent)"}].map(b => (
          <div key={b.label} style={{marginTop:20}}>
            <div style={{display:"flex",justifyContent:"space-between",fontFamily:"Cairo",fontSize:11,color:"var(--text-secondary)",marginBottom:8}}><span>{b.label}</span><span>{b.pct}%</span></div>
            <div style={{height:4,background:"var(--border)",borderRadius:99,overflow:"hidden"}}>
              <div style={{height:"100%",borderRadius:99,background:b.color,width:visible?`${b.pct}%`:"0%",boxShadow:`0 0 10px ${b.color}`,transition:"width 1.5s ease .5s"}}/>
            </div>
          </div>
        ))}
      </Card3D>
      <div style={{position:"absolute",bottom:-20,left:-20,width:180,background:"rgba(26,79,196,.07)",border:"1px solid rgba(26,79,196,.3)",borderRadius:10,padding:"20px 24px"}}>
        <div style={{fontFamily:"Cairo",fontSize:12,color:"var(--text-secondary)",marginBottom:8}}>طلب جديد ←</div>
        <div style={{fontFamily:"Space Mono",fontSize:20,color:"var(--text-primary)",fontWeight:700}}>طاولة 7</div>
        <div style={{fontFamily:"Cairo",fontSize:11,color:"var(--blue-accent)",marginTop:6}}>✓ وُجِّه لمحطة B</div>
      </div>
    </div>
  );
}

function VisualCard2({visible}) {
  return (
    <div style={{position:"relative",height:420,opacity:visible?1:0,transform:visible?"none":"translateX(-60px)",transition:"all 1.2s ease .2s"}}>
      <Card3D style={{position:"absolute",inset:0,background:"linear-gradient(135deg, rgba(10,22,40,.97), rgba(0,8,20,.85))",border:"1px solid rgba(255,255,255,.06)",borderRadius:12,padding:"32px 36px",display:"flex",flexDirection:"column",justifyContent:"center"}}>
        <div style={{fontFamily:"Cairo",fontSize:12,color:"var(--text-secondary)",letterSpacing:".1em",marginBottom:20,direction:"rtl"}}>حالة المخزن — اليوم</div>
        {[{label:"دجاج",pct:22,status:"تحذير",sc:"#ffd60a"},{label:"أرز",pct:78,status:"جيد",sc:"#00ff88"},{label:"خضروات",pct:65,status:"جيد",sc:"#00ff88"}].map(b => (
          <div key={b.label} style={{marginBottom:18,direction:"rtl"}}>
            <div style={{display:"flex",justifyContent:"space-between",fontFamily:"Cairo",fontSize:11,color:"var(--text-secondary)",marginBottom:8}}><span>{b.label}</span><span style={{color:b.sc}}>{b.status}</span></div>
            <div style={{height:4,background:"var(--border)",borderRadius:99,overflow:"hidden"}}>
              <div style={{height:"100%",borderRadius:99,background:b.sc,width:visible?`${b.pct}%`:"0%",boxShadow:`0 0 10px ${b.sc}`,transition:"width 1.5s ease .5s"}}/>
            </div>
          </div>
        ))}
        <div style={{marginTop:16,padding:14,background:"rgba(255,214,10,.08)",border:"1px solid rgba(255,214,10,.2)",borderRadius:6,fontFamily:"Cairo",fontSize:12,color:"#ffd60a",direction:"rtl"}}>
          ⚡ طلبية دجاج أُرسلت تلقائياً للمورد
        </div>
      </Card3D>
      <div style={{position:"absolute",top:-20,right:-20,width:170,background:"rgba(0,195,255,.06)",border:"1px solid rgba(0,195,255,.25)",borderRadius:10,padding:"20px 24px"}}>
        <div style={{fontFamily:"Space Mono",fontSize:28,color:"var(--text-primary)",fontWeight:700}}>-28%</div>
        <div style={{fontFamily:"Cairo",fontSize:11,color:"var(--text-secondary)",marginTop:4}}>هدر هذا الشهر</div>
      </div>
    </div>
  );
}

function VisualCard3({visible}) {
  return (
    <div style={{position:"relative",height:420,opacity:visible?1:0,transform:visible?"none":"translateX(60px)",transition:"all 1.2s ease .3s"}}>
      <Card3D style={{position:"absolute",inset:0,background:"linear-gradient(135deg, rgba(10,22,40,.97), rgba(0,8,20,.85))",border:"1px solid rgba(255,255,255,.06)",borderRadius:12,padding:"32px 36px",display:"flex",flexDirection:"column",justifyContent:"center",direction:"rtl"}}>
        <div style={{fontFamily:"Cairo",fontSize:12,color:"var(--text-secondary)",marginBottom:16}}>الأداء هذا الأسبوع</div>
        <div style={{display:"flex",gap:16,marginBottom:24}}>
          {[{n:"+٤٢%",l:"الأرباح",c:"var(--blue-accent)"},{n:"-٢٨%",l:"الهدر",c:"#ffd60a"},{n:"٩٩%",l:"الدقة",c:"var(--blue-accent)"}].map(m => (
            <div key={m.l} style={{flex:1,padding:"14px 10px",background:"var(--bg-card)",borderRadius:8,border:"1px solid rgba(255,255,255,.05)",textAlign:"center"}}>
              <div style={{fontFamily:"Space Mono",fontSize:18,fontWeight:700,color:m.c}}>{m.n}</div>
              <div style={{fontFamily:"Cairo",fontSize:10,color:"var(--text-muted)",marginTop:4}}>{m.l}</div>
            </div>
          ))}
        </div>
        <div style={{height:80,position:"relative"}}>
          {[20,35,28,50,42,65,58].map((h,i) => (
            <div key={i} style={{position:"absolute",bottom:0,left:`${i*15}%`,width:"10%",background:`rgba(74,158,255,${.3+h*.005})`,height:visible?`${h}%`:"0%",borderRadius:"3px 3px 0 0",transition:`height 1s ease ${.8+i*.1}s`}}/>
          ))}
        </div>
        <div style={{fontFamily:"Cairo",fontSize:11,color:"var(--text-muted)",letterSpacing:".1em",marginTop:12}}>الأداء اليومي — الأسبوع الأخير</div>
      </Card3D>
    </div>
  );
}

// ─── SERVICES (UPDATED) ───────────────────────────────────────────────────────
function Services() {
  const [ref, visible] = useVisible(.1);

  const pillars = [
    {
      pillar: "🧠 العمليات والإدارة",
      color: "#1a4fc4",
      services: [
        { n:"01", icon:"🔍", t:"الاستشارات التشغيلية", d:"نزور مطعمك، نحلل كل عملية من الاستقبال للتسليم، ونكشف أين تضيع الأموال والوقت — ثم نضع خارطة طريق واضحة." },
        { n:"02", icon:"📦", t:"نظام المخزون الذكي", d:"مراقبة تلقائية لكل مادة خام، تنبيهات قبل النفاد، وطلبيات تلقائية للموردين بدون تدخل يدوي." },
        { n:"03", icon:"⚙️", t:"هندسة العمليات وسير الدلفري", d:"نصمم SOP مخصصاً لكل دور في مطعمك — بما فيه آلية كاملة لسير عمل الدلفري من الاستلام حتى التسليم." },
        { n:"04", icon:"👥", t:"نظام HR المتكامل", d:"جداول ورديات، نظام بصمات، تقييم أداء، إدارة الرواتب، وبناء فريق يعمل بانضباط بدون تدخل يومي منك." },
        { n:"05", icon:"💰", t:"نظام المالية", d:"متابعة تدفق الإيرادات والتكاليف، تقارير أرباح حسب الأصناف، وإدارة البيانات المالية الخاصة بمطعمك." },
        { n:"06", icon:"🎓", t:"منصة تدريب الموظفين", d:"محتوى تدريبي مخصص لكل دور، متابعة التقدم، واختبارات تضمن أن فريقك يشتغل على المستوى المطلوب." },
        { n:"07", icon:"🏢", t:"نظام الفرانشايز", d:"بناء منظومة عمليات قابلة للتكرار والتوسع — من الوثائق القانونية حتى دليل التشغيل الكامل لكل فرع." },
      ],
    },
    {
      pillar: "📞 الكول سنتر وتجربة العملاء",
      color: "#00c3ff",
      services: [
        { n:"08", icon:"📞", t:"بناء آلية الكول سنتر", d:"نصمم منظومة استقبال الاتصالات: توزيع المكالمات، جرد الإيصالات الموفقة والاتصالات الضائعة، وتحقيق أعلى تحويل ممكن لطلبات فعلية." },
        { n:"09", icon:"🤝", t:"نظام CRM وتجربة العملاء", d:"بناء قاعدة بيانات زبائن حية، تتبع التفضيلات والشكاوى، وآليات استعادة الزبائن وتحويلهم لعملاء دائمين." },
        { n:"10", icon:"🔔", t:"آلية حل الشكاوي", d:"نظام استقبال ومتابعة وإغلاق الشكاوى بشكل منظم — بما يضمن رضا الزبون وتحويل كل شكوى لفرصة ولاء." },
        { n:"11", icon:"🚀", t:"آلية استقبال الطلبات من المنصات", d:"توحيد وتوزيع الطلبات من كل تطبيقات التوصيل على مطبخك بشكل منظم، مع إمكانية إنشاء تطبيق خاص بمطعمك." },
      ],
    },
    {
      pillar: "🍽️ القائمة والهوية الرقمية",
      color: "#ffd60a",
      services: [
        { n:"12", icon:"📱", t:"إعداد المنيو الإلكتروني", d:"تصميم قائمة إلكترونية تفاعلية بصور احترافية وأسعار محدّثة، مربوطة بجميع قنوات مطعمك." },
        { n:"13", icon:"📄", t:"تخطيط وتصميم المنيو الورقي", d:"تصميم قائمة ورقية بهوية بصرية متكاملة تعكس شخصية مطعمك وتُحفّز على الشراء." },
        { n:"14", icon:"🌐", t:"صفحة شاملة لكل منصات المطعم", d:"رابط واحد يضم كل قنوات التواصل والتوصيل — يمكن مشاركته بسهولة مع الزبائن." },
        { n:"15", icon:"💻", t:"الصفحات الإلكترونية والهوية البصرية", d:"بناء موقع أو صفحة إلكترونية خاصة بمطعمك مع هوية بصرية متكاملة تميّزك على وسائل التواصل." },
      ],
    },
    {
      pillar: "📣 التسويق والنمو",
      color: "#00ff88",
      services: [
        { n:"16", icon:"📊", t:"لوحة التحكم والتقارير", d:"داشبورد مباشر من هاتفك: تقارير يومية وأسبوعية وشهرية، وتقارير أرباح مفصّلة حسب الأصناف والفترات." },
        { n:"17", icon:"📣", t:"الحملات الترويجية", d:"تخطيط وتنفيذ حملات موسمية وعروض ترويجية مخصصة تناسب جمهور مطعمك وتحقق عائداً حقيقياً." },
        { n:"18", icon:"🤳", t:"ربط المطاعم بالمؤثرين", d:"نختار المؤثرين المناسبين لجمهورك ونُدير التعاون معهم من البداية حتى قياس النتائج." },
        { n:"19", icon:"📝", t:"مدونة إدارة المطاعم", d:"محتوى أسبوعي يغطي كل التفاصيل الإدارية والتشغيلية والتسويقية — يبني سمعة مطعمك ويجذب زبائن جدد." },
      ],
    },
  ];

  return (
    <section id="services" ref={ref} style={{padding:"160px 48px",maxWidth:1400,margin:"0 auto",position:"relative",zIndex:2,direction:"rtl"}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:80,alignItems:"end",marginBottom:80}}>
        <div>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:".4em",color:"var(--blue-accent)",textTransform:"uppercase",marginBottom:24,display:"flex",alignItems:"center",gap:12,fontFamily:"Cairo",opacity:visible?1:0,transform:visible?"none":"translateX(20px)",transition:"all .7s ease"}}>
            <span style={{width:30,height:1,background:"var(--blue-accent)"}}/>الخدمات
          </div>
          <h2 style={{fontFamily:"Cairo",fontSize:"clamp(36px,5vw,72px)",fontWeight:900,lineHeight:.95,letterSpacing:"-.025em",color:"var(--text-primary)",opacity:visible?1:0,transform:visible?"none":"translateY(40px)",transition:"all 1s ease .2s"}}>
            كل ما يحتاجه<br/><em style={{fontStyle:"normal",color:"var(--blue-accent)"}}>مطعمك</em>
          </h2>
        </div>
        <p style={{fontFamily:"Cairo",fontSize:16,color:"var(--text-secondary)",lineHeight:1.9,opacity:visible?1:0,transform:visible?"none":"translateY(30px)",transition:"all 1s ease .3s"}}>
          من التشخيص الأولي حتى المتابعة الشهرية — 19 خدمة متكاملة تغطي كل جانب من جوانب مطعمك، مصممة خصيصاً للسوق العراقي.
        </p>
      </div>

      {pillars.map((pillar, pi) => (
        <div key={pi} style={{marginBottom:72}}>
          <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:20,opacity:visible?1:0,transform:visible?"none":"translateY(20px)",transition:`all .7s ease ${.2+pi*.1}s`}}>
            <span style={{fontFamily:"Cairo",fontSize:16,fontWeight:900,color:pillar.color}}>{pillar.pillar}</span>
            <span style={{flex:1,height:1,background:`linear-gradient(to left, transparent, ${pillar.color}40)`}}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:3}}>
            {pillar.services.map((s, i) => (
              <Card3D key={i} style={{background:"var(--bg-secondary)",padding:"40px 32px",position:"relative",overflow:"hidden",opacity:visible?1:0,transform:visible?"none":"translateY(50px)",transition:`all .9s ease ${.3+(i%4)*.1}s`,borderTop:`2px solid ${pillar.color}20`}}>
                <div style={{fontFamily:"Space Mono",fontSize:10,color:`${pillar.color}80`,letterSpacing:".2em",marginBottom:20}}>{s.n}</div>
                <div style={{width:48,height:48,background:`${pillar.color}15`,border:`1px solid ${pillar.color}30`,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,marginBottom:20}}>{s.icon}</div>
                <h3 style={{fontFamily:"Cairo",fontSize:18,fontWeight:900,marginBottom:10,lineHeight:1.2,color:"var(--text-primary)"}}>{s.t}</h3>
                <p style={{fontFamily:"Cairo",fontSize:13,color:"var(--text-secondary)",lineHeight:1.8}}>{s.d}</p>
              </Card3D>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

// ─── PROCESS ──────────────────────────────────────────────────────────────────
function Process() {
  const [ref, visible] = useVisible(.1);
  const steps = [
    {n:"01",t:"التشخيص",d:"نزور مطعمك، نحلل عملياتك الحالية، ونحدد أكبر مصادر الخسارة والفرص المهدرة.",color:"var(--blue-accent)"},
    {n:"02",t:"التصميم",d:"نبني نظام عمليات مخصص لمطعمك — ليس نظاماً جاهزاً، بل حل مصمم لطبيعة عملك تحديداً.",color:"var(--blue-accent)"},
    {n:"03",t:"التطبيق والتدريب",d:"ننفذ النظام معك خطوة بخطوة، وندرب فريقك على كل أداة وإجراء حتى يصبح طبيعياً.",color:"#ffd60a"},
    {n:"04",t:"المتابعة والتطوير",d:"نتابع معك شهرياً، نقيس النتائج، ونحدّث النظام باستمرار — لأن المطعم الناجح لا يتوقف عن التحسين.",color:"#00ff88"},
  ];

  return (
    <section id="process" ref={ref} style={{padding:"160px 48px",background:"var(--bg-primary)",overflow:"hidden",position:"relative",zIndex:2}}>
      <div style={{maxWidth:1400,margin:"0 auto",direction:"rtl"}}>
        <div style={{fontSize:10,fontWeight:700,letterSpacing:".4em",color:"var(--blue-accent)",textTransform:"uppercase",marginBottom:24,display:"flex",alignItems:"center",gap:12,fontFamily:"Cairo",opacity:visible?1:0,transition:"all .7s ease"}}>
          <span style={{width:30,height:1,background:"var(--blue-accent)"}}/>كيف نعمل
        </div>
        <h2 style={{fontFamily:"Cairo",fontSize:"clamp(36px,5vw,72px)",fontWeight:900,lineHeight:.95,letterSpacing:"-.025em",marginBottom:80,color:"var(--text-primary)",opacity:visible?1:0,transform:visible?"none":"translateY(40px)",transition:"all 1s ease .2s"}}>
          من الفوضى<br/>إلى <em style={{fontStyle:"normal",color:"var(--blue-accent)"}}>الدقة</em>
        </h2>

        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:1,position:"relative"}}>
          <div style={{position:"absolute",top:36,right:"12.5%",left:"12.5%",height:1,background:"linear-gradient(to left, transparent, #1a4fc4, #00c3ff, transparent)",zIndex:0,opacity:visible?1:0,transition:"opacity 1s ease .5s"}}/>
          {steps.map((s, i) => (
            <div key={i} style={{padding:"48px 28px 40px",textAlign:"center",position:"relative",zIndex:1,opacity:visible?1:0,transform:visible?"none":"translateY(30px)",transition:`all .9s ease ${.3+i*.15}s`}}>
              <div style={{width:16,height:16,borderRadius:"50%",background:s.color,margin:"0 auto 40px",boxShadow:`0 0 24px ${s.color}`,position:"relative"}}/>
              <div style={{fontFamily:"Space Mono",fontSize:10,color:`${s.color}60`,letterSpacing:".25em",marginBottom:16}}>{s.n}</div>
              <h3 style={{fontFamily:"Cairo",fontSize:18,fontWeight:900,marginBottom:12,color:"var(--text-primary)"}}>{s.t}</h3>
              <p style={{fontFamily:"Cairo",fontSize:13,color:"var(--text-secondary)",lineHeight:1.8}}>{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── RESULTS ──────────────────────────────────────────────────────────────────
function Results() {
  const [ref, visible] = useVisible(.1);
  const nums = [
    {n:35,suffix:"%+",label:"زيادة في الكفاءة التشغيلية خلال أول ٣ أشهر",color:"var(--blue-accent)"},
    {n:28,suffix:"%-",label:"تراجع في الهدر الغذائي وتكاليف المواد الخام",color:"#ffd60a"},
    {n:40,suffix:"%+",label:"ارتفاع في صافي الأرباح مقارنة بما قبل النظام",color:"var(--blue-accent)"},
    {n:3,suffix:"x",label:"سرعة في معالجة الطلبات وتقليل أوقات الانتظار",color:"var(--blue-accent)"},
  ];

  return (
    <section id="results" ref={ref} style={{padding:"140px 48px",maxWidth:1400,margin:"0 auto",position:"relative",zIndex:2,direction:"rtl"}}>
      <div style={{fontSize:10,fontWeight:700,letterSpacing:".4em",color:"var(--blue-accent)",textTransform:"uppercase",marginBottom:24,display:"flex",alignItems:"center",gap:12,fontFamily:"Cairo",opacity:visible?1:0,transition:"all .7s ease"}}>
        <span style={{width:30,height:1,background:"var(--blue-accent)"}}/>النتائج
      </div>
      <h2 style={{fontFamily:"Cairo",fontSize:"clamp(36px,5vw,72px)",fontWeight:900,lineHeight:.95,letterSpacing:"-.025em",marginBottom:80,color:"var(--text-primary)",opacity:visible?1:0,transform:visible?"none":"translateY(40px)",transition:"all 1s ease .2s"}}>
        أرقام <em style={{fontStyle:"normal",color:"var(--blue-accent)"}}>حقيقية</em><br/><span style={{color:"rgba(240,244,255,.2)"}}>من عملاء حقيقيين</span>
      </h2>

      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:3}}>
        {nums.map((n, i) => (
          <Card3D key={i} style={{padding:"52px 36px",background:"var(--bg-secondary)",textAlign:"center",position:"relative",overflow:"hidden",opacity:visible?1:0,transform:visible?"none":"scale(.9)",transition:`all .8s cubic-bezier(.34,1.56,.64,1) ${.2+i*.1}s`}}>
            <div style={{fontFamily:"Space Mono",fontSize:"clamp(40px,5vw,64px)",fontWeight:700,lineHeight:1,marginBottom:12,color:n.color,textShadow:`0 0 40px ${n.color}50`}}>
              {visible ? <Counter target={n.n} suffix={n.suffix}/> : `0${n.suffix}`}
            </div>
            <div style={{fontFamily:"Cairo",fontSize:13,color:"var(--text-secondary)",lineHeight:1.7,fontWeight:600,letterSpacing:".04em"}}>{n.label}</div>
          </Card3D>
        ))}
      </div>
    </section>
  );
}

// ─── CTA ──────────────────────────────────────────────────────────────────────
function CTA() {
  const [ref, visible] = useVisible(.1);
  return (
    <section id="cta" ref={ref} style={{padding:"160px 48px",background:"var(--bg-primary)",textAlign:"center",position:"relative",overflow:"hidden",zIndex:2}}>
      <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:700,height:700,borderRadius:"50%",background:"radial-gradient(ellipse, rgba(26,79,196,.12), transparent 65%)",pointerEvents:"none",filter:"blur(40px)"}}/>
      <div style={{position:"absolute",top:"30%",right:"20%",width:400,height:400,borderRadius:"50%",background:"radial-gradient(ellipse, rgba(0,195,255,.07), transparent 65%)",pointerEvents:"none",filter:"blur(60px)"}}/>

      <div style={{position:"relative",zIndex:2,maxWidth:800,margin:"0 auto",direction:"rtl"}}>
        <div style={{display:"inline-flex",alignItems:"center",gap:10,background:"rgba(26,79,196,.07)",border:"1px solid rgba(26,79,196,.25)",borderRadius:99,padding:"8px 20px",fontFamily:"Cairo",fontSize:12,fontWeight:700,letterSpacing:".1em",color:"var(--blue-accent)",marginBottom:40,opacity:visible?1:0,transform:visible?"none":"translateY(20px)",transition:"all .7s ease"}}>
          <span style={{width:6,height:6,background:"var(--blue-accent)",borderRadius:"50%",animation:"blink 1.5s infinite"}}/>
          نقبل عملاء جدد الآن — العراق فقط
        </div>

        <h2 style={{fontFamily:"Cairo",fontSize:"clamp(40px,6vw,80px)",fontWeight:900,lineHeight:.95,letterSpacing:"-.025em",marginBottom:28,color:"var(--text-primary)",opacity:visible?1:0,transform:visible?"none":"translateY(30px)",transition:"all 1s ease .2s"}}>
          مطعمك يستحق<br/><span style={{color:"var(--blue-accent)",textShadow:"0 0 60px rgba(26,79,196,.5)"}}>أكثر</span>
        </h2>
        <p style={{fontFamily:"Cairo",fontSize:17,color:"var(--text-secondary)",lineHeight:1.8,marginBottom:48,opacity:visible?1:0,transform:visible?"none":"translateY(20px)",transition:"all 1s ease .3s"}}>
          سواء كنت تفتح مطعمك الأول أو عندك فرع قائم تريد تطويره — نبدأ بمحادثة مجانية نفهم فيها وضعك. <strong style={{color:"var(--text-primary)"}}>الأسعار تختلف حسب حالة المطعم والسلسلة.</strong>
        </p>

        <div style={{display:"flex",gap:16,justifyContent:"center",flexWrap:"wrap",marginBottom:36,opacity:visible?1:0,transform:visible?"none":"translateY(20px)",transition:"all 1s ease .4s"}}>
          {[
            {icon:<WhatsAppIcon size={26} color="#25D366"/>,label:"WHATSAPP",val:"07734383431",link:"https://wa.me/9647734383431",color:"rgba(37,211,102,.3)",bg:"rgba(37,211,102,.08)",tc:"rgba(37,211,102,.8)"},
            {icon:<svg width={26} height={26} viewBox="0 0 24 24" fill="var(--blue-accent)"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>,label:"EMAIL",val:"info@iqrhq.me",link:"mailto:info@iqrhq.me",color:"rgba(0,195,255,.25)",bg:"rgba(0,195,255,.07)",tc:"var(--blue-accent)"},
            {icon:<InstagramIcon size={26} color="#E1306C"/>,label:"INSTAGRAM / TIKTOK",val:"@iqrhq_ops",link:"https://instagram.com/iqrhq_ops",color:"rgba(26,79,196,.15)",bg:"rgba(26,79,196,.07)",tc:"var(--blue-accent)"},
          ].map((c) => (
            <a key={c.label} href={c.link} target="_blank" style={{display:"flex",alignItems:"center",gap:12,background:c.bg,border:`1px solid ${c.color}`,borderRadius:10,padding:"16px 28px",textDecoration:"none",color:"var(--text-primary)",cursor:"none",transition:"all .3s",fontFamily:"Cairo"}}
              onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow=`0 8px 30px ${c.color}`}}
              onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow=""}}>
              <span style={{display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{c.icon}</span>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:11,color:c.tc,letterSpacing:".15em",fontWeight:700,marginBottom:4}}>{c.label}</div>
                <div style={{fontFamily:"Space Mono",fontSize:14,fontWeight:700,direction:"ltr"}}>{c.val}</div>
              </div>
            </a>
          ))}
        </div>

        <div style={{display:"flex",gap:16,justifyContent:"center",flexWrap:"wrap",opacity:visible?1:0,transform:visible?"none":"translateY(20px)",transition:"all 1s ease .5s"}}>
          <a href="https://wa.me/9647734383431?text=مرحبا،+أريد+استشارة+مجانية+لمطعمي" target="_blank"
            style={{fontFamily:"Cairo",fontSize:14,fontWeight:700,padding:"16px 44px",background:"var(--blue-accent)",color:"var(--text-primary)",borderRadius:4,textDecoration:"none",cursor:"none",letterSpacing:".06em",boxShadow:"0 0 40px rgba(26,79,196,.4)",transition:"all .2s"}}
            onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow="0 12px 50px rgba(26,79,196,.6)"}}
            onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="0 0 40px rgba(26,79,196,.4)"}}>
            📲 احجز استشارة مجانية على واتساب
          </a>
          <a href="mailto:info@iqrhq.me"
            style={{fontFamily:"Cairo",fontSize:14,fontWeight:700,padding:"15px 44px",background:"transparent",color:"rgba(240,244,255,.6)",border:"1px solid rgba(255,255,255,.1)",borderRadius:4,textDecoration:"none",cursor:"none",letterSpacing:".06em",transition:"all .3s"}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--blue-accent)";e.currentTarget.style.color="var(--blue-accent)"}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.color="rgba(240,244,255,.6)"}}>
            راسلنا على الإيميل
          </a>
        </div>
      </div>
    </section>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{background:"var(--bg-primary)",borderTop:"1px solid rgba(255,255,255,.05)",padding:"60px 48px",position:"relative",zIndex:2}}>
      <div style={{maxWidth:1400,margin:"0 auto",display:"grid",gridTemplateColumns:"1.5fr 1fr 1fr",gap:60,alignItems:"start",direction:"rtl"}}>
        <div>
          <a href="/" style={{display:"block",marginBottom:16,textDecoration:"none",cursor:"none"}}>
            <img src="/logo-white.png" alt="IQR" style={{height:32,width:"auto"}}/>
          </a>
          <p style={{fontFamily:"Cairo",fontSize:13,color:"var(--text-muted)",lineHeight:1.8,marginBottom:16}}>لإدارة وتطوير المطاعم — نحول فوضى مطعمك إلى دقة هندسية ذاتية في العراق.</p>
          <div style={{display:"flex",gap:10,marginTop:8}}>
            {[
              {l:"https://instagram.com/iqrhq_ops",icon:<InstagramIcon size={16}/>,hc:"rgba(193,53,132,.8)",hb:"rgba(193,53,132,.12)"},
              {l:"https://www.facebook.com/iqrhq_ops",icon:<FacebookIcon size={16}/>,hc:"rgba(66,103,178,.8)",hb:"rgba(66,103,178,.12)"},
              {l:"https://www.tiktok.com/@iqrhq_ops",icon:<TikTokIcon size={16}/>,hc:"var(--text-secondary)",hb:"var(--border)"},
              {l:"https://wa.me/9647734383431",icon:<WhatsAppIcon size={16}/>,hc:"rgba(37,211,102,.8)",hb:"rgba(37,211,102,.12)"},
            ].map((s,i) => (
              <a key={i} href={s.l} target="_blank" style={{width:36,height:36,border:"1px solid rgba(255,255,255,.08)",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",textDecoration:"none",cursor:"none",transition:"all .3s",background:"var(--bg-card)"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=s.hc;e.currentTarget.style.background=s.hb;e.currentTarget.style.transform="translateY(-2px)"}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.background="var(--bg-card)";e.currentTarget.style.transform=""}}>
                {s.icon}
              </a>
            ))}
          </div>
        </div>
        {[
          {h:"الخدمات",links:[
            {l:"الاستشارات التشغيلية", h:"#services"},
            {l:"نظام المخزون الذكي",   h:"#services"},
            {l:"الكول سنتر وCRM",      h:"#services"},
            {l:"هندسة العمليات",        h:"#services"},
            {l:"التسويق والنمو",        h:"#services"},
          ]},
          {h:"من نحن",links:[
            {l:"التحديات", h:"#problem"},
            {l:"الحل",     h:"#solution"},
            {l:"كيف نعمل", h:"#process"},
            {l:"النتائج",  h:"#results"},
          ]},
        ].map(col => (
          <div key={col.h}>
            <h4 style={{fontFamily:"Cairo",fontSize:11,fontWeight:700,letterSpacing:".2em",color:"var(--text-muted)",textTransform:"uppercase",marginBottom:20}}>{col.h}</h4>
            {col.links.map(item => (
              <a key={item.l} href={item.h} style={{display:"block",fontFamily:"Cairo",fontSize:14,fontWeight:600,color:"var(--text-secondary)",textDecoration:"none",marginBottom:12,cursor:"none",transition:"color .3s"}}
                onMouseEnter={e=>e.target.style.color="var(--text-primary)"} onMouseLeave={e=>e.target.style.color="var(--text-secondary)"}>{item.l}</a>
            ))}
          </div>
        ))}
      </div>
      <div style={{maxWidth:1400,margin:"40px auto 0",paddingTop:28,borderTop:"1px solid rgba(255,255,255,.05)",display:"flex",justifyContent:"space-between",alignItems:"center",direction:"rtl"}}>
        <span style={{fontFamily:"Cairo",fontSize:12,color:"var(--text-muted)",letterSpacing:".08em"}}>© 2026 IQR لإدارة وتطوير المطاعم — العراق — جميع الحقوق محفوظة</span>
        <div style={{display:"flex",alignItems:"center",gap:8,fontFamily:"Space Mono",fontSize:11,color:"rgba(240,244,255,.2)"}}>
          <span style={{width:6,height:6,background:"var(--blue-accent)",borderRadius:"50%",animation:"blink 2s infinite"}}/>
          ONLINE
        </div>
      </div>
    </footer>
  );
}

function Noise() {
  return (
    <div style={{position:"fixed",inset:0,zIndex:1,pointerEvents:"none",backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,opacity:.4}}/>
  );
}

export default function App() {
  return (
    <>
      <style>{G}</style>
      <ParticleBackground />
      <Noise />
      <CursorTrail />
      <Nav />
      <Hero />
      <Marquee />
      <Problem />
      <Solution />
      <Services />
      <Process />
      <Results />
      <CTA />
      <Footer />
    </>
  );
}
