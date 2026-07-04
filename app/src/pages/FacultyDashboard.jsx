import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { siteConfig } from "@/config";
import { BookOpen, Bookmark, FileText, Shield, User, LogOut, Clock, AlertTriangle } from "lucide-react";

const NAV_ITEMS = [
  { id: "profile", label: "My Profile", icon: User },
  { id: "loans", label: "Current Loans", icon: BookOpen },
  { id: "reservations", label: "Reservations", icon: Bookmark },
  { id: "courseMaterial", label: "Course Materials", icon: FileText },
  { id: "research", label: "Research Requests", icon: Shield },
];

const MOCK_LOANS = [
  { id: "F-2001", title: "Research Methods in Computer Science", author: "S. Bose", borrowed: "2026-05-06", due: "2026-06-06", status: "Active" },
  { id: "F-2002", title: "Academic Publishing Essentials", author: "J. Reed", borrowed: "2026-04-29", due: "2026-05-29", status: "Active" },
];

const MOCK_RESERVATIONS = [
  { id: "FR-110", title: "Machine Learning for Educators", author: "P. Witten", queuePosition: 1, estimatedDate: "2026-06-03" },
];

const MOCK_COURSE_MATERIALS = [
  { code: "CS101", title: "Data Structures and Algorithms", status: "Assigned" },
  { code: "CS512", title: "Advanced Database Systems", status: "Review Pending" },
];

const MOCK_RESEARCH_REQUESTS = [
  { id: "RR-01", topic: "Open access repositories for Sri Lankan research", submitted: "2026-05-12", status: "In Review" },
  { id: "RR-02", topic: "Library support for online course readings", submitted: "2026-04-30", status: "Approved" },
];

export default function FacultyDashboard() {
  const [activeTab, setActiveTab] = useState("profile");
  const [currentUser, setCurrentUser] = useState({ userId: "", fullName: "", email: "", role: "" });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    const userId = localStorage.getItem("userId") || "";
    const fullName = localStorage.getItem("fullName") || "Faculty Member";
    const email = localStorage.getItem("email") || "";
    const role = localStorage.getItem("role") || "FACULTY";
    setCurrentUser({ userId, fullName, email, role });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const activeLoans = MOCK_LOANS.filter((l) => l.status === "Active").length;
  const pendingReservations = MOCK_RESERVATIONS.length;
  const courseMaterialsAssigned = MOCK_COURSE_MATERIALS.length;
  const researchRequests = MOCK_RESEARCH_REQUESTS.length;

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return <ProfileView user={currentUser} />;
      case "loans":
        return <LoansView />;
      case "reservations":
        return <ReservationsView />;
      case "courseMaterial":
        return <CourseMaterialsView />;
      case "research":
        return <ResearchRequestsView />;
      default:
        return <ProfileView user={currentUser} />;
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#ffffff", color: "#1d3205", fontFamily: "'Inter', system-ui, sans-serif", display: "flex" }}>
      <aside
        style={{
          width: "250px",
          background: "#1d3205",
          color: "#ffffff",
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          height: "100vh",
        }}
      >
        <div style={{ padding: "32px 24px 24px" }}>
          <Link to="/" style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", color: "#ffffff", textDecoration: "none" }}>
            {siteConfig.brandName}
          </Link>
          <div style={{ fontSize: "11px", opacity: 0.6, marginTop: "4px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Faculty Portal
          </div>
          <div style={{ marginTop: "12px" }}>
            <Link to="/catalogue" style={{ color: "#ffffff", textDecoration: "none", opacity: 0.8, fontSize: "11px", letterSpacing: "0.08em" }}>
              Browse Catalogue
            </Link>
          </div>
        </div>

        <nav style={{ flex: 1, padding: "0 16px" }}>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                width: "100%",
                padding: "12px 16px",
                fontSize: "14px",
                fontFamily: "'Inter', sans-serif",
                background: activeTab === item.id ? "rgba(255,255,255,0.1)" : "transparent",
                color: "#ffffff",
                border: "none",
                cursor: "pointer",
                marginBottom: "2px",
                transition: "background 0.3s",
                fontWeight: activeTab === item.id ? 500 : 400,
              }}
            >
              <item.icon size={16} strokeWidth={1.5} />
              {item.label}
            </button>
          ))}
        </nav>

        <div style={{ padding: "16px" }}>
          <button
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px 16px",
              fontSize: "14px",
              color: "rgba(255,255,255,0.6)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              width: "100%",
              fontFamily: "'Inter', sans-serif",
              transition: "color 0.3s",
            }}
          >
            <LogOut size={16} strokeWidth={1.5} />
            Logout
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, marginLeft: "250px", padding: "40px 48px" }}>
        <div style={{ animation: "dashFadeIn 0.45s cubic-bezier(0.22, 1, 0.36, 1) both" }}>
          <div style={{ marginBottom: "40px" }}>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "30px", fontWeight: 400, marginBottom: "8px" }}>
              Faculty Dashboard
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", opacity: 0.5 }}>
              <Clock size={13} />
              {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "40px" }}>
            <StatCard label="Active Loans" value={activeLoans} />
            <StatCard label="Pending Reservations" value={pendingReservations} />
            <StatCard label="Assigned Materials" value={courseMaterialsAssigned} />
            <StatCard label="Research Requests" value={researchRequests} />
          </div>

          {renderContent()}
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div style={{ background: "#1d3205", color: "#ffffff", padding: "20px 24px", border: "1px solid #1d3205" }}>
      <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.7, marginBottom: "8px" }}>{label}</div>
      <div style={{ fontSize: "30px", fontWeight: 600 }}>{value}</div>
    </div>
  );
}

function ProfileView({ user }) {
  const initials = user.fullName
    ? user.fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "FM";
  const roleDisplay = user.role ? user.role.charAt(0) + user.role.slice(1).toLowerCase().replace("_", " ") : "Faculty";

  return (
    <div>
      <div style={{ border: "1px solid #1d3205", padding: "32px", marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "24px", marginBottom: "32px" }}>
          <div
            style={{
              width: "80px",
              height: "80px",
              background: "#1d3205",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "28px",
              fontWeight: 600,
              color: "#ffffff",
              fontFamily: "'Playfair Display', serif",
            }}
          >
            {initials}
          </div>
          <div>
            <div style={{ fontSize: "20px", fontWeight: 600, marginBottom: "4px" }}>{user.fullName || "Faculty Member"}</div>
            <div style={{ fontSize: "13px", opacity: 0.6 }}>{roleDisplay}</div>
            <div style={{ fontSize: "12px", opacity: 0.5, marginTop: "4px" }}>{user.userId} | SLIIT Library</div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
          <div>
            <div style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.5, marginBottom: "4px" }}>Email</div>
            <div style={{ fontSize: "14px" }}>{user.email || "—"}</div>
          </div>
          <div>
            <div style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.5, marginBottom: "4px" }}>Role</div>
            <div style={{ fontSize: "14px" }}>{roleDisplay}</div>
          </div>
          <div>
            <div style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.5, marginBottom: "4px" }}>Department</div>
            <div style={{ fontSize: "14px" }}>Computing Faculty</div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "24px" }}>
        <div style={{ border: "1px solid #1d3205", padding: "24px" }}>
          <h3 style={{ fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "16px", fontWeight: 600 }}>Faculty Resources</h3>
          <p style={{ fontSize: "14px", opacity: 0.75, lineHeight: 1.7 }}>
            Access institution reading lists, course material requests, and research support information. Your profile is used to keep loan and reservation details up to date for faculty privileges.
          </p>
        </div>
        <div style={{ border: "1px solid #1d3205", padding: "24px" }}>
          <h3 style={{ fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "16px", fontWeight: 600 }}>Teaching & Research</h3>
          <p style={{ fontSize: "14px", opacity: 0.75, lineHeight: 1.7 }}>
            Manage course readings and request library support for new academic resources. Use current loans and reservations to keep your teaching materials on time.
          </p>
        </div>
      </div>
    </div>
  );
}

function LoansView() {
  return (
    <div>
      {MOCK_LOANS.some((l) => l.status === "Overdue") && (
        <div
          style={{
            background: "#fff5f5",
            border: "1px solid #ff2600",
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "24px",
            fontSize: "14px",
            color: "#ff2600",
          }}
        >
          <AlertTriangle size={18} />
          <span>You have overdue faculty loans. Please return or renew before the next review cycle.</span>
        </div>
      )}

      <DataTable
        columns={['Title', 'Author', 'Borrowed', 'Due Date', 'Status']}
        data={MOCK_LOANS.map((l) => ({
          Title: <div style={{ fontWeight: 500 }}>{l.title}</div>,
          Author: l.author,
          Borrowed: l.borrowed,
          'Due Date': l.due,
          Status: (
            <span style={{ fontWeight: 600, color: l.status === 'Overdue' ? '#ff2600' : '#1d3205' }}>{l.status}</span>
          ),
        }))}
      />
    </div>
  );
}

function ReservationsView() {
  return (
    <div>
      <DataTable
        columns={['Title', 'Author', 'Queue Pos', 'Expected Pickup']}
        data={MOCK_RESERVATIONS.map((r) => ({
          Title: <div style={{ fontWeight: 500 }}>{r.title}</div>,
          Author: r.author,
          'Queue Pos': r.queuePosition > 0 ? `#${r.queuePosition}` : '-',
          'Expected Pickup': new Date(r.estimatedDate).toLocaleDateString(),
        }))}
      />
    </div>
  );
}

function CourseMaterialsView() {
  return (
    <DataTable
      columns={['Course', 'Title', 'Status']}
      data={MOCK_COURSE_MATERIALS.map((material) => ({
        Course: material.code,
        Title: material.title,
        Status: material.status,
      }))}
    />
  );
}

function ResearchRequestsView() {
  return (
    <DataTable
      columns={['Request ID', 'Topic', 'Submitted', 'Status']}
      data={MOCK_RESEARCH_REQUESTS.map((request) => ({
        'Request ID': request.id,
        Topic: request.topic,
        Submitted: request.submitted,
        Status: request.status,
      }))}
    />
  );
}

function DataTable({ columns, data }) {
  return (
    <div style={{ border: "1px solid #1d3205", overflow: "hidden" }}>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns.length}, 1fr)`, background: "#1d3205", color: "#ffffff" }}>
        {columns.map((col) => (
          <div key={col} style={{ padding: "12px 16px", fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em" }}>
            {col}
          </div>
        ))}
      </div>
      {data.map((row, i) => (
        <div
          key={i}
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${columns.length}, 1fr)`,
            borderBottom: "1px solid rgba(29,50,5,0.15)",
            background: i % 2 === 1 ? "rgba(29,50,5,0.03)" : "transparent",
          }}
        >
          {columns.map((col) => (
            <div key={col} style={{ padding: "14px 16px", fontSize: "13px" }}>{row[col]}</div>
          ))}
        </div>
      ))}
    </div>
  );
}
