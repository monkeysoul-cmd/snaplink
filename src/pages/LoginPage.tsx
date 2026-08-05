import React, { useState, useEffect, useRef } from "react";
import { Loader2, Mail, Lock, ArrowRight, Eye, EyeOff, Zap, Link2 } from "lucide-react";
import { useAuth } from "../context/AuthContext.js";
import { useToast } from "../context/ToastContext.js";

/* ─── Hook: watch html.dark class ─── */
function useIsDark() {
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains("dark")
  );
  useEffect(() => {
    const obs = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);
  return isDark;
}

/* ─── Floating particle canvas (dark mode only visual) ─── */
const ParticleCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let animId: number;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener("resize", resize);
    const particles: { x: number; y: number; vx: number; vy: number; r: number; a: number }[] = [];
    for (let i = 0; i < 55; i++) {
      particles.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4, r: Math.random() * 1.4 + 0.3, a: Math.random() });
    }
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(52,211,153,${p.a * 0.45})`; ctx.fill();
      }
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(20,184,166,${(1 - dist / 100) * 0.12})`; ctx.lineWidth = 0.5; ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: 0.55 }} />;
};

/* ─── Light-mode particle canvas (soft indigo dots) ─── */
const ParticleCanvasLight: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let animId: number;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener("resize", resize);
    const particles: { x: number; y: number; vx: number; vy: number; r: number; a: number }[] = [];
    for (let i = 0; i < 45; i++) {
      particles.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3, r: Math.random() * 2 + 0.5, a: Math.random() });
    }
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(16,185,129,${p.a * 0.18})`; ctx.fill();
      }
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 90) {
            ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(20,184,166,${(1 - dist / 90) * 0.07})`; ctx.lineWidth = 0.6; ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: 0.8 }} />;
};

/* ─── Floating label input ─── */
interface FloatingInputProps {
  id: string; type: string; value: string; onChange: (v: string) => void;
  label: string; icon: React.ReactNode; autoComplete?: string; showToggle?: boolean;
  isDark: boolean;
}
const FloatingInput: React.FC<FloatingInputProps> = ({ id, type, value, onChange, label, icon, autoComplete, showToggle, isDark }) => {
  const [focused, setFocused] = useState(false);
  const [show, setShow] = useState(false);
  const active = focused || value.length > 0;

  const fieldStyle: React.CSSProperties = {
    display: "flex", alignItems: "center", position: "relative",
    background: isDark
      ? (focused ? "rgba(16,185,129,0.07)" : "rgba(255,255,255,0.035)")
      : (focused ? "rgba(16,185,129,0.06)" : "#ffffff"),
    border: `1px solid ${isDark
      ? (focused ? "rgba(52,211,153,0.55)" : "rgba(20,184,166,0.18)")
      : (focused ? "rgba(5,150,105,0.6)" : "rgba(167,243,208,0.9)")}`,
    borderRadius: 14, padding: "0.25rem 0.75rem", gap: "0.5rem",
    boxShadow: focused
      ? isDark
        ? "0 0 0 3px rgba(52,211,153,0.12), 0 0 20px rgba(52,211,153,0.08)"
        : "0 0 0 3px rgba(16,185,129,0.12)"
      : isDark ? "none" : "0 1px 3px rgba(0,0,0,0.06)",
    transition: "border-color 0.25s, box-shadow 0.25s, background 0.25s",
  };

  const iconColor = isDark
    ? (focused ? "#34d399" : "rgba(52,211,153,0.5)")
    : (focused ? "#059669" : "rgba(16,185,129,0.45)");

  const labelStyle: React.CSSProperties = {
    position: "absolute",
    top: active ? 4 : "50%",
    transform: active ? "none" : "translateY(-50%)",
    left: 0,
    fontSize: active ? "0.65rem" : "0.85rem",
    fontWeight: active ? 700 : 400,
    color: active
      ? (isDark ? "#34d399" : "#059669")
      : (isDark ? "rgba(255,255,255,0.28)" : "rgba(6,78,59,0.6)"),
    letterSpacing: active ? "0.04em" : "normal",
    textTransform: active ? "uppercase" : "none",
    pointerEvents: "none",
    transition: "top 0.2s, font-size 0.2s, color 0.2s, transform 0.2s",
    whiteSpace: "nowrap",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "transparent", border: "none", outline: "none",
    fontSize: "0.9rem",
    color: isDark ? "#f1f5f9" : "#0f172a",
    fontWeight: 500, fontFamily: "'Inter', sans-serif",
    paddingTop: "0.1rem", paddingBottom: "0.1rem",
  };

  return (
    <div style={{ marginBottom: "1rem" }}>
      <div style={fieldStyle}>
        <span style={{ color: iconColor, display: "flex", alignItems: "center", flexShrink: 0, transition: "color 0.25s" }}>{icon}</span>
        <div style={{ flex: 1, position: "relative", padding: "0.85rem 0 0.2rem" }}>
          <label htmlFor={id} style={labelStyle}>{label}</label>
          <input id={id} type={showToggle ? (show ? "text" : "password") : type} value={value} autoComplete={autoComplete}
            onChange={(e) => onChange(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} style={inputStyle} />
        </div>
        {showToggle && (
          <button type="button" onClick={() => setShow((s) => !s)} tabIndex={-1}
            style={{ color: isDark ? "rgba(255,255,255,0.28)" : "rgba(71,85,105,0.5)", background: "none", border: "none", cursor: "pointer", padding: "0.25rem", display: "flex", alignItems: "center", flexShrink: 0, transition: "color 0.2s" }}>
            {show ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>
    </div>
  );
};

/* ─── Main Login Page ─── */
export const LoginPage: React.FC = () => {
  const isDark = useIsDark();
  const { login } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setErrorMsg("Please fill in all fields."); return; }
    setIsSubmitting(true); setErrorMsg(null);
    try {
      await login(email, password);
      toast.success("Welcome back!");
      window.location.hash = "#/dashboard";
    } catch (err: any) {
      const msg = err.message || "Invalid email or password.";
      setErrorMsg(msg); toast.error(msg);
    } finally { setIsSubmitting(false); }
  };

  /* ── Theme-specific tokens — Emerald & Teal ── */
  const bg = isDark ? "#020d0a" : "#f0fdf4";
  const leftBg = isDark
    ? "radial-gradient(ellipse at 20% 30%, rgba(16,185,129,0.25) 0%, transparent 55%), radial-gradient(ellipse at 80% 70%, rgba(20,184,166,0.2) 0%, transparent 55%)"
    : "radial-gradient(ellipse at 20% 30%, rgba(16,185,129,0.18) 0%, transparent 55%), radial-gradient(ellipse at 80% 70%, rgba(20,184,166,0.14) 0%, transparent 55%), radial-gradient(ellipse at 50% 80%, rgba(34,211,238,0.08) 0%, transparent 55%)";
  const gridColor = isDark ? "rgba(20,184,166,0.06)" : "rgba(16,185,129,0.07)";
  const cardBg = isDark
    ? "linear-gradient(145deg, rgba(3,26,22,0.9), rgba(1,14,11,0.95))"
    : "linear-gradient(145deg, rgba(255,255,255,0.98), rgba(240,253,244,0.95))";
  const cardBorder = isDark
    ? { border: "1px solid rgba(20,184,166,0.18)", borderTop: "1px solid rgba(52,211,153,0.35)", borderLeft: "1px solid rgba(52,211,153,0.25)" }
    : { border: "1px solid rgba(167,243,208,0.9)", borderTop: "1px solid #ffffff", borderLeft: "1px solid #ffffff" };
  const cardShadow = isDark
    ? "0 0 0 1px rgba(16,185,129,0.06), 0 32px 64px rgba(0,0,0,0.55), 0 0 60px rgba(16,185,129,0.08), inset 0 1px 0 rgba(255,255,255,0.07)"
    : "0 4px 6px rgba(0,0,0,0.04), 0 20px 48px rgba(16,185,129,0.13), 0 0 0 1px rgba(167,243,208,0.6), inset 0 1px 0 rgba(255,255,255,1)";
  const topLine = isDark
    ? "linear-gradient(90deg, transparent, #34d399, #2dd4bf, #22d3ee, transparent)"
    : "linear-gradient(90deg, transparent, #059669, #0d9488, #0891b2, transparent)";
  const badgeBg = isDark ? "rgba(52,211,153,0.1)" : "rgba(16,185,129,0.1)";
  const badgeBorder = isDark ? "rgba(52,211,153,0.25)" : "rgba(16,185,129,0.25)";
  const badgeColor = isDark ? "#34d399" : "#065f46";
  const titleColor = isDark ? "#ecfdf5" : "#022c22";
  const subColor = isDark ? "rgba(255,255,255,0.38)" : "rgba(6,78,59,0.6)";
  const leftTitleColor = isDark ? "#ecfdf5" : "#022c22";
  const leftSubColor = isDark ? "rgba(255,255,255,0.45)" : "rgba(6,78,59,0.6)";
  const pillBg = isDark ? "rgba(20,184,166,0.12)" : "rgba(16,185,129,0.08)";
  const pillBorder = isDark ? "rgba(20,184,166,0.22)" : "rgba(16,185,129,0.18)";
  const pillColor = isDark ? "rgba(255,255,255,0.5)" : "rgba(6,78,59,0.7)";
  const pillIconColor = isDark ? "#34d399" : "#059669";
  const dividerColor = isDark ? "rgba(255,255,255,0.15)" : "rgba(6,78,59,0.5)";
  const footerColor = isDark ? "rgba(255,255,255,0.3)" : "rgba(6,78,59,0.6)";
  const footerLinkColor = isDark ? "#34d399" : "#065f46";
  const blob1Bg = isDark
    ? "radial-gradient(circle, rgba(52,211,153,0.18), transparent 70%)"
    : "radial-gradient(circle, rgba(110,231,183,0.22), transparent 70%)";
  const blob2Bg = isDark
    ? "radial-gradient(circle, rgba(20,184,166,0.14), transparent 70%)"
    : "radial-gradient(circle, rgba(45,212,191,0.18), transparent 70%)";
  const logoGradient = isDark
    ? "linear-gradient(135deg, #059669 0%, #0d9488 50%, #0891b2 100%)"
    : "linear-gradient(135deg, #047857 0%, #0f766e 50%, #0369a1 100%)";
  const btnBg = isDark
    ? "linear-gradient(135deg, #059669 0%, #0d9488 50%, #0891b2 100%)"
    : "linear-gradient(135deg, #047857 0%, #0f766e 50%, #0369a1 100%)";
  const btnShadow = isDark
    ? "0 4px 20px rgba(16,185,129,0.45), 0 0 0 1px rgba(52,211,153,0.2)"
    : "0 4px 20px rgba(5,150,105,0.35), 0 0 0 1px rgba(16,185,129,0.2)";

  return (
    <div style={{ minHeight: "calc(100vh - 4rem)", display: "flex", alignItems: "stretch", position: "relative", overflow: "hidden", background: bg, transition: "background 0.4s" }}>
      {/* Background blobs */}
      <div style={{ position: "absolute", width: 500, height: 500, top: "-10%", left: "-10%", borderRadius: "50%", filter: "blur(100px)", background: blob1Bg, animation: "blob-move 14s ease-in-out infinite", pointerEvents: "none" }} />
      <div style={{ position: "absolute", width: 400, height: 400, bottom: "-5%", right: "-5%", borderRadius: "50%", filter: "blur(100px)", background: blob2Bg, animation: "blob-move 18s ease-in-out infinite reverse", pointerEvents: "none" }} />
      <div style={{ position: "absolute", width: 300, height: 300, top: "40%", left: "40%", borderRadius: "50%", filter: "blur(90px)", background: isDark ? "radial-gradient(circle, rgba(34,211,238,0.08), transparent 70%)" : "radial-gradient(circle, rgba(34,211,238,0.07), transparent 70%)", animation: "blob-move 10s ease-in-out infinite 3s", pointerEvents: "none" }} />

      {/* Left decorative panel — desktop only */}
      <div style={{ display: "none", flexDirection: "column", justifyContent: "center", alignItems: "center", flex: 1, padding: "3rem", position: "relative", overflow: "hidden" }}
        className="login-left-panel">
        <style>{`.login-left-panel { display: none !important; } @media (min-width: 1024px) { .login-left-panel { display: flex !important; } }`}</style>
        <div style={{ position: "absolute", inset: 0, background: leftBg }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${gridColor} 1px, transparent 1px), linear-gradient(90deg, ${gridColor} 1px, transparent 1px)`, backgroundSize: "48px 48px", maskImage: "radial-gradient(ellipse at center, black 40%, transparent 75%)" }} />
        {isDark ? <ParticleCanvas /> : <ParticleCanvasLight />}

        <div style={{ position: "relative", zIndex: 2, textAlign: "center" }}>
          <div style={{ width: 80, height: 80, borderRadius: 22, background: logoGradient, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 2rem", boxShadow: isDark ? "0 0 40px rgba(16,185,129,0.5), 0 20px 40px rgba(0,0,0,0.4)" : "0 0 30px rgba(16,185,129,0.35), 0 12px 30px rgba(0,0,0,0.12)", animation: "login-logo-float 4s ease-in-out infinite" }}>
            <Link2 size={36} color="#fff" />
          </div>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "2.4rem", fontWeight: 800, color: leftTitleColor, lineHeight: 1.15, marginBottom: "1rem", transition: "color 0.3s" }}>
            Shorten.<br />
            <span style={{ background: "linear-gradient(135deg, #34d399, #2dd4bf, #22d3ee)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Amplify.</span>
            <br />Track.
          </h1>
          <p style={{ fontSize: "0.95rem", color: leftSubColor, maxWidth: 320, margin: "0 auto 2.5rem", lineHeight: 1.6, transition: "color 0.3s" }}>
            The smartest URL shortener for professionals who care about analytics and brand presence.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0.4rem" }}>
            {["Real-time Analytics", "Custom Aliases", "QR Codes", "Link Expiry"].map((f) => (
              <span key={f} style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: pillBg, border: `1px solid ${pillBorder}`, borderRadius: 99, padding: "0.4rem 0.9rem", fontSize: "0.78rem", color: pillColor, transition: "all 0.3s" }}>
                <Zap size={11} color={pillIconColor} />{f}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", flex: 1, padding: "2rem 1.5rem", position: "relative", zIndex: 2 }}>
        <div style={{
          width: "100%", maxWidth: 420, position: "relative",
          background: cardBg,
          backdropFilter: "blur(32px) saturate(180%)",
          WebkitBackdropFilter: "blur(32px) saturate(180%)",
          ...cardBorder,
          borderRadius: 24, padding: "2.5rem 2rem",
          boxShadow: cardShadow,
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(28px)",
          transition: "opacity 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.6s cubic-bezier(0.16,1,0.3,1), background 0.4s, box-shadow 0.4s, border-color 0.4s",
        }}>
          {/* Animated top border line */}
          <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", height: 2, background: topLine, borderRadius: 99, animation: "login-topline 3s ease-in-out infinite", transition: "background 0.4s" }} />

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: badgeBg, border: `1px solid ${badgeBorder}`, borderRadius: 99, padding: "0.3rem 0.85rem", fontSize: "0.7rem", fontWeight: 700, color: badgeColor, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "1rem", transition: "all 0.3s" }}>
              <Zap size={11} /> Secure Login
            </div>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "1.75rem", fontWeight: 800, color: titleColor, marginBottom: "0.35rem", lineHeight: 1.2, transition: "color 0.3s" }}>Welcome back 👋</h2>
            <p style={{ fontSize: "0.85rem", color: subColor, transition: "color 0.3s" }}>Sign in to manage your links</p>
          </div>

          {/* Error */}
          {errorMsg && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.75rem 1rem", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, marginBottom: "1.25rem", fontSize: "0.8rem", color: isDark ? "#fca5a5" : "#b91c1c", fontWeight: 500, animation: "login-card-in 0.3s cubic-bezier(0.16,1,0.3,1) forwards" }}>
              <span>⚠</span><span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} id="login-form">
            <FloatingInput id="login-email" type="email" value={email} onChange={setEmail} label="Email address" autoComplete="email" icon={<Mail size={17} />} isDark={isDark} />
            <FloatingInput id="login-password" type="password" value={password} onChange={setPassword} label="Password" autoComplete="current-password" icon={<Lock size={17} />} showToggle isDark={isDark} />

            <button type="submit" disabled={isSubmitting} id="login-submit-btn"
              style={{ width: "100%", padding: "0.9rem 1.5rem", border: "none", borderRadius: 14, cursor: isSubmitting ? "not-allowed" : "pointer", fontSize: "0.95rem", fontWeight: 700, fontFamily: "'Outfit', sans-serif", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", background: btnBg, position: "relative", overflow: "hidden", boxShadow: btnShadow, opacity: isSubmitting ? 0.55 : 1, marginTop: "0.5rem", transition: "transform 0.25s, box-shadow 0.25s, opacity 0.2s" }}
              onMouseEnter={(e) => { if (!isSubmitting) { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)"; } }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; }}>
              <div style={{ position: "absolute", top: 0, left: "-100%", width: "60%", height: "100%", background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)", transform: "skewX(-20deg)", animation: "login-shimmer 2.5s ease-in-out infinite" }} />
              {isSubmitting ? (<><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /><span>Signing in…</span></>) : (<><span>Sign in</span><ArrowRight size={16} /></>)}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", margin: "1.25rem 0", color: dividerColor, fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            <div style={{ flex: 1, height: 1, background: isDark ? "linear-gradient(90deg, transparent, rgba(20,184,166,0.22), transparent)" : "linear-gradient(90deg, transparent, rgba(16,185,129,0.15), transparent)" }} />
            or
            <div style={{ flex: 1, height: 1, background: isDark ? "linear-gradient(90deg, transparent, rgba(20,184,166,0.22), transparent)" : "linear-gradient(90deg, transparent, rgba(16,185,129,0.15), transparent)" }} />
          </div>

          <div style={{ textAlign: "center", fontSize: "0.82rem", color: footerColor, transition: "color 0.3s" }}>
            Don't have an account?{" "}
            <button onClick={() => { window.location.hash = "#/register"; }} style={{ background: "none", border: "none", color: footerLinkColor, fontWeight: 700, cursor: "pointer", fontSize: "0.82rem", fontFamily: "'Inter', sans-serif", transition: "color 0.2s" }}>
              Create one free →
            </button>
          </div>
        </div>
      </div>

      {/* Keyframes injected once */}
      <style>{`
        @keyframes login-logo-float { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-10px) rotate(3deg)} }
        @keyframes login-topline { 0%,100%{opacity:.7;width:50%} 50%{opacity:1;width:70%} }
        @keyframes login-card-in { from{opacity:0;transform:scale(.97)} to{opacity:1;transform:scale(1)} }
        @keyframes login-shimmer { 0%{left:-100%} 100%{left:200%} }
      `}</style>
    </div>
  );
};
