import React, { useState, useEffect } from "react";
import { Loader2, User, Mail, Lock, ShieldCheck, ArrowRight, Eye, EyeOff, Link2 } from "lucide-react";
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
      ? (focused ? "rgba(16,185,129,0.07)" : "rgba(255,255,255,0.03)")
      : (focused ? "rgba(16,185,129,0.05)" : "#ffffff"),
    border: `1px solid ${isDark
      ? (focused ? "rgba(52,211,153,0.55)" : "rgba(20,184,166,0.15)")
      : (focused ? "rgba(5,150,105,0.55)" : "rgba(167,243,208,0.9)")}`,
    borderRadius: 14, padding: "0.25rem 0.75rem", gap: "0.5rem",
    boxShadow: focused
      ? isDark
        ? "0 0 0 3px rgba(52,211,153,0.1), 0 0 20px rgba(52,211,153,0.07)"
        : "0 0 0 3px rgba(16,185,129,0.1)"
      : isDark ? "none" : "0 1px 3px rgba(0,0,0,0.06)",
    transition: "border-color 0.25s, box-shadow 0.25s, background 0.25s",
  };

  const iconColor = isDark
    ? (focused ? "#34d399" : "rgba(52,211,153,0.5)")
    : (focused ? "#059669" : "rgba(16,185,129,0.4)");

  const labelStyle: React.CSSProperties = {
    position: "absolute",
    top: active ? 4 : "50%",
    transform: active ? "none" : "translateY(-50%)",
    left: 0, fontSize: active ? "0.65rem" : "0.85rem", fontWeight: active ? 700 : 400,
    color: active
      ? (isDark ? "#34d399" : "#059669")
      : (isDark ? "rgba(255,255,255,0.28)" : "rgba(6,78,59,0.6)"),
    letterSpacing: active ? "0.04em" : "normal",
    textTransform: active ? "uppercase" : "none",
    pointerEvents: "none",
    transition: "top 0.2s, font-size 0.2s, color 0.2s, transform 0.2s",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "transparent", border: "none", outline: "none",
    fontSize: "0.9rem", color: isDark ? "#f1f5f9" : "#0f172a",
    fontWeight: 500, fontFamily: "'Inter', sans-serif",
    paddingTop: "0.1rem", paddingBottom: "0.1rem",
  };

  return (
    <div style={{ marginBottom: "0.9rem" }}>
      <div style={fieldStyle}>
        <span style={{ color: iconColor, display: "flex", alignItems: "center", flexShrink: 0, transition: "color 0.25s" }}>{icon}</span>
        <div style={{ flex: 1, position: "relative", padding: "0.85rem 0 0.2rem" }}>
          <label htmlFor={id} style={labelStyle}>{label}</label>
          <input id={id} type={showToggle ? (show ? "text" : "password") : type} value={value}
            autoComplete={autoComplete} onChange={(e) => onChange(e.target.value)}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} style={inputStyle} />
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

/* ─── Password strength indicator ─── */
const PasswordStrength: React.FC<{ password: string; isDark: boolean }> = ({ password, isDark }) => {
  const checks = [password.length >= 6, /[A-Z]/.test(password), /[0-9]/.test(password), /[^A-Za-z0-9]/.test(password)];
  const strength = checks.filter(Boolean).length;
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["", "#ef4444", "#f97316", "#eab308", "#22c55e"];
  if (!password) return null;
  return (
    <div style={{ marginTop: "0.5rem" }}>
      <div style={{ display: "flex", gap: 4, marginBottom: "0.3rem" }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: i <= strength ? colors[strength] : (isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"), transition: "background 0.3s" }} />
        ))}
      </div>
      <span style={{ fontSize: "0.7rem", color: colors[strength], fontWeight: 600 }}>{labels[strength]}</span>
    </div>
  );
};

/* ─── Register Page ─── */
export const RegisterPage: React.FC = () => {
  const isDark = useIsDark();
  const { register } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) { setErrorMsg("Hey, don't forget to fill everything in!"); return; }
    if (password.length < 6) { setErrorMsg("Make your password at least 6 characters — keep it safe!"); return; }
    if (password !== confirmPassword) { setErrorMsg("Hmm, those passwords don't quite match."); return; }
    setIsSubmitting(true); setErrorMsg(null);
    try {
      await register(name.trim(), email.trim(), password);
      toast.success("You're in! Welcome to LinkCut 🎉");
      window.location.hash = "#/dashboard";
    } catch (err: any) {
      const msg = err.message || "Oops, something went wrong. Give it another shot!";
      setErrorMsg(msg); toast.error(msg);
    } finally { setIsSubmitting(false); }
  };

  /* ── Theme tokens — Emerald & Teal ── */
  const bg = isDark ? "#020d0a" : "#f0fdf4";
  const gridColor = isDark ? "rgba(20,184,166,0.04)" : "rgba(16,185,129,0.06)";

  const cardBg = isDark
    ? "linear-gradient(145deg, rgba(3,26,22,0.9), rgba(1,14,11,0.95))"
    : "linear-gradient(145deg, rgba(255,255,255,0.98), rgba(240,253,244,0.96))";
  const cardBorder = isDark
    ? { border: "1px solid rgba(20,184,166,0.15)", borderTop: "1px solid rgba(52,211,153,0.32)", borderLeft: "1px solid rgba(52,211,153,0.22)" }
    : { border: "1px solid rgba(167,243,208,0.9)", borderTop: "1px solid #ffffff", borderLeft: "1px solid #ffffff" };
  const cardShadow = isDark
    ? "0 0 0 1px rgba(16,185,129,0.05), 0 32px 64px rgba(0,0,0,0.6), 0 0 70px rgba(16,185,129,0.08), inset 0 1px 0 rgba(255,255,255,0.06)"
    : "0 4px 6px rgba(0,0,0,0.04), 0 20px 48px rgba(16,185,129,0.13), 0 0 0 1px rgba(167,243,208,0.6), inset 0 1px 0 rgba(255,255,255,1)";
  const topLine = isDark
    ? "linear-gradient(90deg, transparent, #34d399, #2dd4bf, #22d3ee, transparent)"
    : "linear-gradient(90deg, transparent, #059669, #0d9488, #0891b2, transparent)";

  const badgeBg = isDark ? "rgba(52,211,153,0.1)" : "rgba(16,185,129,0.1)";
  const badgeBorder = isDark ? "rgba(52,211,153,0.25)" : "rgba(16,185,129,0.25)";
  const badgeColor = isDark ? "#34d399" : "#065f46";
  const titleColor = isDark ? "#ecfdf5" : "#022c22";
  const subColor = isDark ? "rgba(255,255,255,0.38)" : "rgba(6,78,59,0.6)";
  const perkColor = isDark ? "rgba(255,255,255,0.38)" : "rgba(6,78,59,0.6)";
  const perkCheck = isDark ? "#34d399" : "#059669";
  const footerColor = isDark ? "rgba(255,255,255,0.3)" : "rgba(6,78,59,0.6)";
  const footerLinkColor = isDark ? "#34d399" : "#065f46";
  const dividerLineColor = isDark ? "rgba(20,184,166,0.22)" : "rgba(16,185,129,0.15)";
  const dividerTextColor = isDark ? "rgba(255,255,255,0.13)" : "rgba(6,78,59,0.55)";
  const matchColor = password === confirmPassword ? (isDark ? "#34d399" : "#059669") : (isDark ? "#ef4444" : "#b91c1c");

  const blob1Bg = isDark
    ? "radial-gradient(circle, rgba(52,211,153,0.18), transparent 70%)"
    : "radial-gradient(circle, rgba(110,231,183,0.25), transparent 70%)";
  const blob2Bg = isDark
    ? "radial-gradient(circle, rgba(20,184,166,0.15), transparent 70%)"
    : "radial-gradient(circle, rgba(45,212,191,0.18), transparent 70%)";
  const blob3Bg = isDark
    ? "radial-gradient(circle, rgba(34,211,238,0.08), transparent 70%)"
    : "radial-gradient(circle, rgba(103,232,249,0.12), transparent 70%)";
  const btnBg = isDark
    ? "linear-gradient(135deg, #059669 0%, #0d9488 50%, #0891b2 100%)"
    : "linear-gradient(135deg, #047857 0%, #0f766e 50%, #0369a1 100%)";
  const btnShadow = isDark
    ? "0 4px 20px rgba(16,185,129,0.45), 0 0 0 1px rgba(52,211,153,0.2)"
    : "0 4px 20px rgba(5,150,105,0.35), 0 0 0 1px rgba(16,185,129,0.2)";

  return (
    <>
      <style>{`
        @keyframes reg-topline { 0%,100%{opacity:.6;width:45%} 50%{opacity:1;width:65%} }
        @keyframes reg-card-in { from{opacity:0;transform:scale(.97)} to{opacity:1;transform:scale(1)} }
        @keyframes reg-shimmer { 0%{left:-100%} 100%{left:200%} }
      `}</style>

      <div style={{ minHeight: "calc(100vh - 4rem)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", background: bg, padding: "2rem 1.5rem", transition: "background 0.4s" }}>
        {/* Background */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${gridColor} 1px, transparent 1px), linear-gradient(90deg, ${gridColor} 1px, transparent 1px)`, backgroundSize: "56px 56px", pointerEvents: "none", transition: "all 0.4s" }} />

        {/* Blobs */}
        <div style={{ position: "absolute", width: 500, height: 500, top: "-15%", right: "-10%", borderRadius: "50%", filter: "blur(110px)", background: blob1Bg, animation: "blob-move 16s ease-in-out infinite", pointerEvents: "none" }} />
        <div style={{ position: "absolute", width: 400, height: 400, bottom: "-10%", left: "-5%", borderRadius: "50%", filter: "blur(110px)", background: blob2Bg, animation: "blob-move 20s ease-in-out infinite reverse", pointerEvents: "none" }} />
        <div style={{ position: "absolute", width: 250, height: 250, top: "30%", left: "20%", borderRadius: "50%", filter: "blur(90px)", background: blob3Bg, animation: "blob-move 12s ease-in-out infinite 5s", pointerEvents: "none" }} />

        {/* Card */}
        <div style={{
          width: "100%", maxWidth: 460, position: "relative",
          background: cardBg,
          backdropFilter: "blur(32px) saturate(180%)",
          WebkitBackdropFilter: "blur(32px) saturate(180%)",
          ...cardBorder, borderRadius: 24, padding: "2.5rem 2rem",
          boxShadow: cardShadow,
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(28px)",
          transition: "opacity 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.6s cubic-bezier(0.16,1,0.3,1), background 0.4s, box-shadow 0.4s",
          zIndex: 2,
        }}>
          {/* Top glow line */}
          <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", height: 2, background: topLine, borderRadius: 99, animation: "reg-topline 3.5s ease-in-out infinite", transition: "background 0.4s" }} />

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: badgeBg, border: `1px solid ${badgeBorder}`, borderRadius: 99, padding: "0.3rem 0.85rem", fontSize: "0.7rem", fontWeight: 700, color: badgeColor, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "1rem", transition: "all 0.3s" }}>
              <Link2 size={11} /> Join Us
            </div>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "1.75rem", fontWeight: 800, color: titleColor, marginBottom: "0.35rem", lineHeight: 1.2, transition: "color 0.3s" }}>Let's get you set up 🔗</h2>
            <p style={{ fontSize: "0.85rem", color: subColor, transition: "color 0.3s" }}>Totally free. Jump right in — no card needed.</p>
          </div>

          {/* Perks */}
          <div style={{ display: "flex", gap: "1rem", marginBottom: "1.75rem", justifyContent: "center" }}>
            {["Always free", "Links without limits", "Real insights"].map((p) => (
              <span key={p} style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.72rem", color: perkColor, transition: "color 0.3s" }}>
                <span style={{ color: perkCheck, fontWeight: 800, fontSize: "0.7rem" }}>✓</span>{p}
              </span>
            ))}
          </div>

          {/* Error */}
          {errorMsg && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.75rem 1rem", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.18)", borderRadius: 12, marginBottom: "1.25rem", fontSize: "0.8rem", color: isDark ? "#fca5a5" : "#b91c1c", fontWeight: 500, animation: "reg-card-in 0.3s cubic-bezier(0.16,1,0.3,1) forwards" }}>
              <span>⚠</span><span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} id="register-form">
            <FloatingInput id="register-name" type="text" value={name} onChange={setName} label="Full name" autoComplete="name" icon={<User size={17} />} isDark={isDark} />
            <FloatingInput id="register-email" type="email" value={email} onChange={setEmail} label="Email address" autoComplete="email" icon={<Mail size={17} />} isDark={isDark} />
            <FloatingInput id="register-password" type="password" value={password} onChange={setPassword} label="Password" autoComplete="new-password" icon={<Lock size={17} />} showToggle isDark={isDark} />
            {password && <PasswordStrength password={password} isDark={isDark} />}

            <div style={{ marginTop: password ? "0.9rem" : 0 }}>
              <FloatingInput id="register-confirm-password" type="password" value={confirmPassword} onChange={setConfirmPassword} label="Confirm password" autoComplete="new-password" icon={<ShieldCheck size={17} />} showToggle isDark={isDark} />
            </div>

            {/* Match indicator */}
            {confirmPassword && password && (
              <div style={{ fontSize: "0.72rem", fontWeight: 600, marginTop: "0.35rem", marginBottom: "0.25rem", color: matchColor }}>
                {password === confirmPassword ? "✓ Passwords match" : "✗ Passwords don't match"}
              </div>
            )}

            <button type="submit" disabled={isSubmitting} id="register-submit-btn"
              style={{ width: "100%", padding: "0.9rem 1.5rem", border: "none", borderRadius: 14, cursor: isSubmitting ? "not-allowed" : "pointer", fontSize: "0.95rem", fontWeight: 700, fontFamily: "'Outfit', sans-serif", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", background: btnBg, position: "relative", overflow: "hidden", boxShadow: btnShadow, opacity: isSubmitting ? 0.55 : 1, marginTop: "0.75rem", transition: "transform 0.25s, box-shadow 0.25s, opacity 0.2s" }}
              onMouseEnter={(e) => { if (!isSubmitting) (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; }}>
              <div style={{ position: "absolute", top: 0, left: "-100%", width: "60%", height: "100%", background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)", transform: "skewX(-20deg)", animation: "reg-shimmer 2.5s ease-in-out infinite" }} />
              {isSubmitting ? (<><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /><span>Almost there…</span></>) : (<><span>Let's go!</span><ArrowRight size={16} /></>)}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", margin: "1.25rem 0", color: dividerTextColor, fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, transparent, ${dividerLineColor}, transparent)` }} />
            or
            <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, transparent, ${dividerLineColor}, transparent)` }} />
          </div>

          <div style={{ textAlign: "center", fontSize: "0.82rem", color: footerColor, transition: "color 0.3s" }}>
            Been here before?{" "}
            <button onClick={() => { window.location.hash = "#/login"; }} style={{ background: "none", border: "none", color: footerLinkColor, fontWeight: 700, cursor: "pointer", fontSize: "0.82rem", fontFamily: "'Inter', sans-serif", transition: "color 0.2s" }}>
              Welcome back →
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
