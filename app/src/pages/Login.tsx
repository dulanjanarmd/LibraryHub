import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { siteConfig } from "@/config";
import { BookOpen, ArrowRight, Shield } from "lucide-react";

export default function Login() {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"student" | "faculty" | "librarian" | "admin">("student");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (role === "admin" || role === "librarian") {
      navigate("/admin");
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        background: "#ffffff",
        color: "#1d3205",
        fontFamily: "'Inter', system-ui, sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div style={{ padding: "32px 48px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link
          to="/"
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "24px",
            fontWeight: 400,
            color: "#1d3205",
            textDecoration: "none",
          }}
        >
          {siteConfig.brandName}
        </Link>
        <div style={{ display: "flex", gap: "24px", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          <Link to="/catalogue" style={{ color: "#1d3205", textDecoration: "none", opacity: 0.6, transition: "opacity 0.3s" }}>
            Catalogue
          </Link>
          <Link to="/info" style={{ color: "#1d3205", textDecoration: "none", opacity: 0.6, transition: "opacity 0.3s" }}>
            About
          </Link>
        </div>
      </div>

      {/* Marquee */}
      <div style={{ overflow: "hidden", whiteSpace: "nowrap", borderTop: "1px solid #1d3205", borderBottom: "1px solid #1d3205", padding: "12px 0" }}>
        <div
          style={{
            display: "inline-block",
            animation: "marquee-scroll 30s linear infinite",
            fontSize: "18px",
            fontWeight: 600,
            color: "#1d3205",
            letterSpacing: "0.05em",
          }}
        >
          <span>
            * INCLUSIVE * ACCESSIBLE * INNOVATIVE * EMPOWERING * INCLUSIVE * ACCESSIBLE * INNOVATIVE * EMPOWERING *&nbsp;&nbsp;&nbsp;
            * INCLUSIVE * ACCESSIBLE * INNOVATIVE * EMPOWERING * INCLUSIVE * ACCESSIBLE * INNOVATIVE * EMPOWERING *&nbsp;&nbsp;&nbsp;
          </span>
        </div>
      </div>

      {/* Login Form */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px",
        }}
      >
        <div style={{ width: "100%", maxWidth: "440px" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <div
              style={{
                width: "64px",
                height: "64px",
                border: "1px solid #1d3205",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px",
              }}
            >
              <BookOpen size={28} strokeWidth={1.5} />
            </div>
            <h1
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "36px",
                fontWeight: 400,
                marginBottom: "8px",
              }}
            >
              Library Portal
            </h1>
            <p style={{ fontSize: "14px", opacity: 0.6 }}>Sign in to access your library account</p>
          </div>

          {/* Role Selection */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", marginBottom: "32px" }}>
            {(["student", "faculty", "librarian", "admin"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                style={{
                  padding: "10px",
                  fontSize: "11px",
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  border: "1px solid #1d3205",
                  background: role === r ? "#1d3205" : "transparent",
                  color: role === r ? "#ffffff" : "#1d3205",
                  cursor: "pointer",
                  fontFamily: "'Inter', sans-serif",
                  transition: "all 0.3s",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                {r === "admin" && <Shield size={14} />}
                {r}
              </button>
            ))}
          </div>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "11px",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  marginBottom: "8px",
                  opacity: 0.7,
                }}
              >
                Student / Staff ID
              </label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter your ID"
                required
                style={{
                  width: "100%",
                  height: "56px",
                  padding: "0 16px",
                  border: "1px solid #1d3205",
                  fontSize: "15px",
                  fontFamily: "'Inter', sans-serif",
                  color: "#1d3205",
                  background: "#ffffff",
                  outline: "none",
                }}
              />
            </div>

            <div style={{ marginBottom: "32px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "11px",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  marginBottom: "8px",
                  opacity: 0.7,
                }}
              >
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                style={{
                  width: "100%",
                  height: "56px",
                  padding: "0 16px",
                  border: "1px solid #1d3205",
                  fontSize: "15px",
                  fontFamily: "'Inter', sans-serif",
                  color: "#1d3205",
                  background: "#ffffff",
                  outline: "none",
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                width: "100%",
                height: "56px",
                background: "#ff2600",
                color: "#ffffff",
                border: "none",
                fontSize: "13px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                cursor: "pointer",
                fontFamily: "'Inter', sans-serif",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "background 0.3s",
                marginBottom: "24px",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#1d3205")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#ff2600")}
            >
              Sign In <ArrowRight size={16} />
            </button>
          </form>

          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
            <Link to="#" style={{ color: "#1d3205", opacity: 0.6, textDecoration: "underline", textUnderlineOffset: "3px" }}>
              Forgot password?
            </Link>
            <Link to="#" style={{ color: "#1d3205", opacity: 0.6, textDecoration: "underline", textUnderlineOffset: "3px" }}>
              Register new account
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          borderTop: "1px solid rgba(29,50,5,0.1)",
          padding: "24px 48px",
          display: "flex",
          justifyContent: "space-between",
          fontSize: "12px",
          opacity: 0.6,
        }}
      >
        <span>{siteConfig.copyright}</span>
        <Link to="/" style={{ color: "#1d3205", textDecoration: "none" }}>
          Back to Home
        </Link>
      </div>

      <style>{`
        @keyframes marquee-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
