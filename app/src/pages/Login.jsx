import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { siteConfig } from "@/config";
import { BookOpen, ArrowRight, Shield, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

export default function Login() {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("student");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const navigate = useNavigate();

  const getRoleDisplayName = (role) => {
    switch (role) {
      case "faculty":
        return "Faculty Member";
      case "librarian":
        return "Librarian";
      case "admin":
        return "Admin";
      default:
        return "Student";
    }
  };

  const getAllowedAuthRoles = (selectedRole) => {
    switch (selectedRole) {
      case "faculty":
        return ["FACULTY"];
      case "librarian":
        return ["LIBRARIAN"];
      case "admin":
        return ["ADMIN"];
      default:
        return ["UNDERGRADUATE", "POSTGRADUATE"];
    }
  };

  const isRegisterAllowedForRole = (selectedRole) => {
    return selectedRole === "student" || selectedRole === "faculty";
  };

  const getIdPlaceholder = (selectedRole) => {
    switch (selectedRole) {
      case "faculty":
        return "e.g. ST20210045";
      case "librarian":
        return "e.g. LIB001";
      case "admin":
        return "e.g. ADMIN001";
      default:
        return "e.g. IT20234567";
    }
  };

  const getVisibleRoles = () => {
    return isRegistering ? ["student", "faculty"] : ["student", "faculty", "librarian", "admin"];
  };

  const persistAuth = (authData) => {
    localStorage.setItem("token", authData.token);
    localStorage.setItem("refreshToken", authData.refreshToken || "");
    localStorage.setItem("userId", authData.userId);
    localStorage.setItem("fullName", authData.fullName);
    localStorage.setItem("email", authData.email);
    localStorage.setItem("role", authData.role);
    localStorage.setItem("isMember", authData.isMember ? "true" : "false");
    localStorage.setItem("membershipId", authData.membershipId || "");
    localStorage.setItem("membershipStatus", authData.membershipStatus || "");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (isRegistering) {
      await handleRegister();
      return;
    }
    if (isForgotPassword) {
      await handleForgotPassword();
      return;
    }
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || "Invalid credentials. Please try again.");
        setLoading(false);
        return;
      }

      const authData = data?.data;
      if (!authData?.token) {
        setError("Login failed. Please try again.");
        setLoading(false);
        return;
      }

      const userRole = String(authData.role || "").toUpperCase();
      const allowedRoles = getAllowedAuthRoles(role);
      if (!allowedRoles.includes(userRole)) {
        setError(
          `This login form is for ${getRoleDisplayName(role)} accounts. The provided credentials belong to a ${userRole} account. Please select the correct login type.`
        );
        setLoading(false);
        return;
      }

      persistAuth(authData);
      if (userRole === "ADMIN" || userRole === "LIBRARIAN") {
        navigate("/admin");
      } else if (userRole === "FACULTY") {
        navigate("/faculty");
      } else {
        navigate("/dashboard");
      }
    } catch {
      setError("Cannot connect to server. Please make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      if (!isRegisterAllowedForRole(role)) {
        setError("Librarian and admin accounts cannot self-register. Please login with your assigned credentials.");
        setLoading(false);
        return;
      }
      const res = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, password, firstName, lastName, email, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.message || "Registration failed. Please try again.");
        setLoading(false);
        return;
      }
      const authData = data?.data;
      if (!authData?.token) {
        setError("Registration failed. Please try again.");
        setLoading(false);
        return;
      }
      persistAuth(authData);
      setSuccess("Account created successfully. You are now signed in.");
      const userRole = String(authData.role || "").toUpperCase();
      if (userRole === "ADMIN" || userRole === "LIBRARIAN") {
        navigate("/admin");
      } else if (userRole === "FACULTY") {
        navigate("/faculty");
      } else {
        navigate("/dashboard");
      }
    } catch {
      setError("Cannot connect to server. Please make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8080/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.message || "Unable to reset password right now.");
        setLoading(false);
        return;
      }
      setSuccess(`Temporary password generated: ${data?.data || "check your inbox"}. Please sign in with it and update your password.`);
      setIsForgotPassword(false);
      setPassword("");
    } catch {
      setError("Cannot connect to server. Please make sure the backend is running.");
    } finally {
      setLoading(false);
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
        overflowY: "auto",
      }}
    >
      {/* Header */}
      <div style={{ padding: "32px 48px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
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
          <Link to="/catalogue" style={{ color: "#1d3205", textDecoration: "none", opacity: 0.6 }}>
            Catalogue
          </Link>
          <Link to="/info" style={{ color: "#1d3205", textDecoration: "none", opacity: 0.6 }}>
            About
          </Link>
        </div>
      </div>

      {/* Marquee */}
      <div style={{ overflow: "hidden", whiteSpace: "nowrap", borderTop: "1px solid #1d3205", borderBottom: "1px solid #1d3205", padding: "12px 0", flexShrink: 0 }}>
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
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "48px 48px 64px",
        }}
      >
        <div style={{ width: "100%", maxWidth: "440px" }}>
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
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
            <p style={{ fontSize: "14px", opacity: 0.6 }}>
              {isRegistering
                ? `Register as a ${getRoleDisplayName(role)}`
                : isForgotPassword
                ? `Reset password for ${getRoleDisplayName(role)}`
                : `Login as ${getRoleDisplayName(role)}`}
            </p>
          </div>

          {/* Role Selection */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", marginBottom: "12px" }}>
              {getVisibleRoles().map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    setRole(r);
                    setError("");
                    setSuccess("");
                    if ((r === "librarian" || r === "admin") && isRegistering) {
                      setIsRegistering(false);
                    }
                  }}
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
            <div style={{ marginBottom: "24px", fontSize: "12px", opacity: 0.75, color: "#3b4b34" }}>
              Use the selected tab to login with the correct account type. Student login requires student ID, faculty login requires faculty member ID, and librarian/admin use their unique librarian/admin ID.
            </div>

          {/* Error / Success Message */}
          {error && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "14px 16px",
                background: "#fff5f5",
                border: "1px solid #ff2600",
                color: "#ff2600",
                fontSize: "13px",
                marginBottom: "20px",
              }}
            >
              <AlertCircle size={16} />
              {error}
            </div>
          )}
          {success && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "14px 16px",
                background: "#f4fbf0",
                border: "1px solid #4caf50",
                color: "#2e7d32",
                fontSize: "13px",
                marginBottom: "20px",
              }}
            >
              <CheckCircle2 size={16} />
              {success}
            </div>
          )}

          <form onSubmit={handleLogin}>

            {!isForgotPassword && (
              <div style={{ display: "flex", gap: "16px", marginBottom: "20px" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px", opacity: 0.7 }}>
                    {getRoleDisplayName(role)} ID
                  </label>
                  <input
                    type="text"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder={getIdPlaceholder(role)}
                    required={!isForgotPassword}
                    disabled={loading}
                    style={{ width: "100%", height: "56px", padding: "0 16px", border: "1px solid #1d3205", fontSize: "15px", fontFamily: "'Inter', sans-serif", color: "#1d3205", background: loading ? "#f8f8f8" : "#ffffff", outline: "none", boxSizing: "border-box" }}
                  />
                </div>
              </div>
            )}

            {isRegistering && (
              <>
                <div style={{ display: "flex", gap: "16px", marginBottom: "20px" }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px", opacity: 0.7 }}>First Name</label>
                    <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" required disabled={loading} style={{ width: "100%", height: "56px", padding: "0 16px", border: "1px solid #1d3205", fontSize: "15px", fontFamily: "'Inter', sans-serif", color: "#1d3205", background: loading ? "#f8f8f8" : "#ffffff", outline: "none", boxSizing: "border-box" }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px", opacity: 0.7 }}>Last Name</label>
                    <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name" required disabled={loading} style={{ width: "100%", height: "56px", padding: "0 16px", border: "1px solid #1d3205", fontSize: "15px", fontFamily: "'Inter', sans-serif", color: "#1d3205", background: loading ? "#f8f8f8" : "#ffffff", outline: "none", boxSizing: "border-box" }} />
                  </div>
                </div>
                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px", opacity: 0.7 }}>Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" required disabled={loading} style={{ width: "100%", height: "56px", padding: "0 16px", border: "1px solid #1d3205", fontSize: "15px", fontFamily: "'Inter', sans-serif", color: "#1d3205", background: loading ? "#f8f8f8" : "#ffffff", outline: "none", boxSizing: "border-box" }} />
                </div>
              </>
            )}

            {isForgotPassword ? (
              <div style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px", opacity: 0.7 }}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  disabled={loading}
                  style={{ width: "100%", height: "56px", padding: "0 16px", border: "1px solid #1d3205", fontSize: "15px", fontFamily: "'Inter', sans-serif", color: "#1d3205", background: loading ? "#f8f8f8" : "#ffffff", outline: "none", boxSizing: "border-box" }}
                />
              </div>
            ) : (
              <div style={{ marginBottom: "24px" }}>
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
                  required={!isRegistering}
                  disabled={loading}
                  style={{
                    width: "100%",
                    height: "56px",
                    padding: "0 16px",
                    border: "1px solid #1d3205",
                    fontSize: "15px",
                    fontFamily: "'Inter', sans-serif",
                    color: "#1d3205",
                    background: loading ? "#f8f8f8" : "#ffffff",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                height: "56px",
                background: loading ? "#5a6e4a" : "#1d3205",
                color: "#ffffff",
                border: "none",
                fontSize: "13px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "'Inter', sans-serif",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "background 0.3s",
                marginBottom: "24px",
              }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = "#ff2600"; }}
              onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = "#1d3205"; }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                  {isForgotPassword ? "Resetting Password..." : isRegistering ? "Creating Account..." : "Signing In..."}
                </>
              ) : (
                <>
                  {isForgotPassword ? "Reset Password" : isRegistering ? "Create Account" : "Sign In"} <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Hint box with test credentials */}
          <div
            style={{
              border: "1px solid rgba(29,50,5,0.2)",
              padding: "16px",
              marginBottom: "24px",
              fontSize: "12px",
              background: "rgba(29,50,5,0.02)",
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: "8px", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", opacity: 0.6 }}>
              Test Credentials
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px", opacity: 0.7 }}>
              <div><span style={{ fontWeight: 600 }}>Student:</span> IT20234567 / student123</div>
              <div><span style={{ fontWeight: 600 }}>Faculty:</span> ST20210045 / faculty123</div>
              <div><span style={{ fontWeight: 600 }}>Librarian:</span> LIB001 / lib123</div>
              <div><span style={{ fontWeight: 600 }}>Admin:</span> ADMIN001 / admin123</div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
            <button
              type="button"
              onClick={() => {
                setError("");
                setSuccess("");
                setIsForgotPassword(true);
                setIsRegistering(false);
              }}
              style={{ background: "transparent", border: "none", color: "#1d3205", opacity: 0.6, textDecoration: "underline", textUnderlineOffset: "3px", cursor: "pointer", fontSize: "12px", padding: 0 }}
            >
              Forgot password?
            </button>
            {isRegisterAllowedForRole(role) ? (
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setSuccess("");
                  setIsRegistering(!isRegistering);
                  setIsForgotPassword(false);
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#1d3205",
                  opacity: 0.6,
                  textDecoration: "underline",
                  textUnderlineOffset: "3px",
                  cursor: "pointer",
                  fontSize: "12px",
                  padding: 0
                }}
              >
                {isRegistering ? "Back to Login" : "Register new account"}
              </button>
            ) : (
              <div style={{ color: "#1d3205", opacity: 0.7, textAlign: "right" }}>
                Librarian and admin accounts are created in the database only. Please login with your assigned credentials.
              </div>
            )}
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
          flexShrink: 0,
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
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
