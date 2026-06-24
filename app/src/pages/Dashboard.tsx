import { useState } from "react";
import { Link } from "react-router";
import { siteConfig } from "@/config";
import {
  BookOpen,
  Clock,
  Bookmark,
  History,
  Settings,
  LogOut,
  RefreshCw,
  AlertTriangle,
  User,
} from "lucide-react";

const NAV_ITEMS = [
  { id: "profile", label: "My Profile", icon: User },
  { id: "loans", label: "Current Loans", icon: BookOpen },
  { id: "reservations", label: "Reservations", icon: Bookmark },
  { id: "history", label: "History", icon: History },
  { id: "settings", label: "Settings", icon: Settings },
];

const MOCK_LOANS = [
  { id: "L-1001", title: "Introduction to Algorithms", author: "Cormen et al.", borrowed: "2026-05-15", due: "2026-06-05", status: "Active" },
  { id: "L-1002", title: "Clean Code", author: "Robert C. Martin", borrowed: "2026-05-20", due: "2026-06-10", status: "Active" },
  { id: "L-1003", title: "A Brief History of Time", author: "Stephen Hawking", borrowed: "2026-04-28", due: "2026-05-19", status: "Overdue" },
];

const MOCK_RESERVATIONS = [
  { id: "R-501", title: "Pride and Prejudice", author: "Jane Austen", queuePosition: 2, estimatedDate: "2026-06-28" },
  { id: "R-502", title: "The Catcher in the Rye", author: "J.D. Salinger", queuePosition: 1, estimatedDate: "2026-06-22" },
];

const MOCK_HISTORY = [
  { id: "H-201", title: "Sapiens", author: "Yuval Noah Harari", borrowed: "2026-01-10", returned: "2026-01-28" },
  { id: "H-202", title: "1984", author: "George Orwell", borrowed: "2025-11-05", returned: "2025-11-20" },
  { id: "H-203", title: "The Great Gatsby", author: "F. Scott Fitzgerald", borrowed: "2025-09-15", returned: "2025-10-01" },
  { id: "H-204", title: "To Kill a Mockingbird", author: "Harper Lee", borrowed: "2025-08-01", returned: "2025-08-18" },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("loans");

  const activeLoans = MOCK_LOANS.filter((l) => l.status === "Active").length;
  const overdueLoans = MOCK_LOANS.filter((l) => l.status === "Overdue").length;
  const totalFines = overdueLoans * 75;

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return <ProfileView />;
      case "loans":
        return <LoansView />;
      case "reservations":
        return <ReservationsView />;
      case "history":
        return <HistoryView />;
      case "settings":
        return <SettingsView />;
      default:
        return <LoansView />;
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#ffffff", color: "#1d3205", fontFamily: "'Inter', system-ui, sans-serif", display: "flex" }}>
      {/* Sidebar */}
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
        {/* Logo */}
        <div style={{ padding: "32px 24px 24px" }}>
          <Link to="/" style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", color: "#ffffff", textDecoration: "none" }}>
            {siteConfig.brandName}
          </Link>
          <div style={{ fontSize: "11px", opacity: 0.6, marginTop: "4px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Student Portal
          </div>
        </div>

        {/* Nav */}
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

        {/* Logout */}
        <div style={{ padding: "16px" }}>
          <Link
            to="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px 16px",
              fontSize: "14px",
              color: "rgba(255,255,255,0.6)",
              textDecoration: "none",
              transition: "color 0.3s",
            }}
          >
            <LogOut size={16} strokeWidth={1.5} />
            Logout
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, marginLeft: "250px", padding: "40px 48px" }}>
        {/* Header */}
        <div style={{ marginBottom: "40px" }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "30px", fontWeight: 400, marginBottom: "8px" }}>
            {NAV_ITEMS.find((n) => n.id === activeTab)?.label}
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", opacity: 0.5 }}>
            <Clock size={13} />
            {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </div>
        </div>

        {/* Stats Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "40px" }}>
          <StatCard label="Active Loans" value={activeLoans} />
          <StatCard label="Pending Reservations" value={MOCK_RESERVATIONS.length} />
          <StatCard label="Outstanding Fines (LKR)" value={totalFines} prefix="LKR " />
          <StatCard label="Total Borrowed" value={MOCK_HISTORY.length + MOCK_LOANS.length} />
        </div>

        {/* Tab Content */}
        {renderContent()}
      </main>
    </div>
  );
}

/* Stat Card */
function StatCard({ label, value, prefix = "" }: { label: string; value: number; prefix?: string }) {
  return (
    <div
      style={{
        background: "#1d3205",
        color: "#ffffff",
        padding: "20px 24px",
        border: "1px solid #1d3205",
      }}
    >
      <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.7, marginBottom: "8px" }}>
        {label}
      </div>
      <div style={{ fontSize: "30px", fontWeight: 600 }}>
        {prefix}{value}
      </div>
    </div>
  );
}

/* Profile View */
function ProfileView() {
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
            ST
          </div>
          <div>
            <div style={{ fontSize: "20px", fontWeight: 600, marginBottom: "4px" }}>Samantha Thilakarathne</div>
            <div style={{ fontSize: "13px", opacity: 0.6 }}>Undergraduate Student</div>
            <div style={{ fontSize: "12px", opacity: 0.5, marginTop: "4px" }}>IT20234567 | Faculty of Computing</div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
          <div>
            <div style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.5, marginBottom: "4px" }}>Email</div>
            <div style={{ fontSize: "14px" }}>samantha.t@sliit.lk</div>
          </div>
          <div>
            <div style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.5, marginBottom: "4px" }}>Programme</div>
            <div style={{ fontSize: "14px" }}>BSc (Hons) in Information Technology</div>
          </div>
          <div>
            <div style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.5, marginBottom: "4px" }}>Membership</div>
            <div style={{ fontSize: "14px" }}>Active since 2022</div>
          </div>
        </div>
      </div>

      <div style={{ border: "1px solid #1d3205", padding: "24px" }}>
        <h3 style={{ fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "16px", fontWeight: 600 }}>
          Notification Preferences
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {["Email notifications for due dates", "SMS notifications for overdue items", "New book arrival alerts"].map((pref) => (
            <label key={pref} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", cursor: "pointer" }}>
              <input type="checkbox" defaultChecked style={{ accentColor: "#1d3205" }} />
              {pref}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

/* Loans View */
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
          <span>You have overdue items. Fine accruing at LKR 5/day per item.</span>
        </div>
      )}

      <DataTable
        columns={["Book Title", "Author", "Borrowed", "Due Date", "Status", ""]}
        data={MOCK_LOANS.map((l) => ({
          "Book Title": <div style={{ fontWeight: 500 }}>{l.title}</div>,
          Author: l.author,
          Borrowed: l.borrowed,
          "Due Date": l.due,
          Status: (
            <span
              style={{
                fontSize: "11px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: l.status === "Overdue" ? "#ff2600" : "#1d3205",
              }}
            >
              {l.status}
            </span>
          ),
          "": (
            <button
              disabled={l.status === "Overdue"}
              style={{
                padding: "6px 14px",
                fontSize: "11px",
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                border: "1px solid #1d3205",
                background: "transparent",
                color: "#1d3205",
                cursor: l.status === "Overdue" ? "not-allowed" : "pointer",
                opacity: l.status === "Overdue" ? 0.4 : 1,
                fontFamily: "'Inter', sans-serif",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <RefreshCw size={12} /> Renew
            </button>
          ),
        }))}
      />
    </div>
  );
}

/* Reservations View */
function ReservationsView() {
  return (
    <DataTable
      columns={["Book Title", "Author", "Queue Position", "Est. Available", ""]}
      data={MOCK_RESERVATIONS.map((r) => ({
        "Book Title": <div style={{ fontWeight: 500 }}>{r.title}</div>,
        Author: r.author,
        "Queue Position": (
          <span style={{ fontWeight: 600, color: r.queuePosition === 1 ? "#ff2600" : "#1d3205" }}>
            #{r.queuePosition}
          </span>
        ),
        "Est. Available": r.estimatedDate,
        "": (
          <button
            style={{
              padding: "6px 14px",
              fontSize: "11px",
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              border: "1px solid #ff2600",
              background: "transparent",
              color: "#ff2600",
              cursor: "pointer",
              fontFamily: "'Inter', sans-serif",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#ff2600";
              e.currentTarget.style.color = "#ffffff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#ff2600";
            }}
          >
            Cancel
          </button>
        ),
      }))}
    />
  );
}

/* History View */
function HistoryView() {
  return (
    <DataTable
      columns={["Book Title", "Author", "Borrowed", "Returned"]}
      data={MOCK_HISTORY.map((h) => ({
        "Book Title": <div style={{ fontWeight: 500 }}>{h.title}</div>,
        Author: h.author,
        Borrowed: h.borrowed,
        Returned: h.returned,
      }))}
    />
  );
}

/* Settings View */
function SettingsView() {
  return (
    <div style={{ maxWidth: "600px" }}>
      <div style={{ border: "1px solid #1d3205", padding: "24px", marginBottom: "24px" }}>
        <h3 style={{ fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "20px", fontWeight: 600 }}>
          Change Password
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <input type="password" placeholder="Current password" style={{ height: "48px", padding: "0 16px", border: "1px solid #1d3205", fontSize: "14px", fontFamily: "'Inter', sans-serif" }} />
          <input type="password" placeholder="New password" style={{ height: "48px", padding: "0 16px", border: "1px solid #1d3205", fontSize: "14px", fontFamily: "'Inter', sans-serif" }} />
          <input type="password" placeholder="Confirm new password" style={{ height: "48px", padding: "0 16px", border: "1px solid #1d3205", fontSize: "14px", fontFamily: "'Inter', sans-serif" }} />
          <button
            style={{
              padding: "12px 24px",
              background: "#1d3205",
              color: "#ffffff",
              border: "none",
              fontSize: "12px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              cursor: "pointer",
              fontFamily: "'Inter', sans-serif",
              alignSelf: "flex-start",
            }}
          >
            Update Password
          </button>
        </div>
      </div>

      <div style={{ border: "1px solid #ff2600", padding: "24px" }}>
        <h3 style={{ fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px", fontWeight: 600, color: "#ff2600" }}>
          Danger Zone
        </h3>
        <p style={{ fontSize: "14px", opacity: 0.7, marginBottom: "16px" }}>
          Deleting your account will permanently remove all your data including borrowing history and reading lists.
        </p>
        <button
          style={{
            padding: "10px 20px",
            background: "transparent",
            color: "#ff2600",
            border: "1px solid #ff2600",
            fontSize: "12px",
            fontWeight: 500,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            cursor: "pointer",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          Delete Account
        </button>
      </div>
    </div>
  );
}

/* Generic Data Table */
function DataTable({ columns, data }: { columns: string[]; data: Record<string, React.ReactNode>[] }) {
  return (
    <div style={{ border: "1px solid #1d3205", overflow: "hidden" }}>
      {/* Header */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${columns.length}, 1fr)`,
          background: "#1d3205",
          color: "#ffffff",
        }}
      >
        {columns.map((col) => (
          <div
            key={col}
            style={{
              padding: "12px 16px",
              fontSize: "10px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            {col}
          </div>
        ))}
      </div>

      {/* Rows */}
      {data.map((row, i) => (
        <div
          key={i}
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${columns.length}, 1fr)`,
            borderBottom: "1px solid rgba(29,50,5,0.15)",
            background: i % 2 === 1 ? "rgba(29,50,5,0.03)" : "transparent",
            transition: "background 0.2s",
            cursor: "default",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#1d3205";
            e.currentTarget.querySelectorAll("div").forEach((d) => {
              d.style.color = "#ffffff";
            });
            const btns = e.currentTarget.querySelectorAll("button");
            btns.forEach((b) => {
              b.style.borderColor = "#ffffff";
              b.style.color = "#ffffff";
            });
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = i % 2 === 1 ? "rgba(29,50,5,0.03)" : "transparent";
            e.currentTarget.querySelectorAll("div").forEach((d) => {
              d.style.color = "";
            });
            const btns = e.currentTarget.querySelectorAll("button");
            btns.forEach((b) => {
              b.style.borderColor = "";
              b.style.color = "";
            });
          }}
        >
          {columns.map((col) => (
            <div key={col} style={{ padding: "14px 16px", fontSize: "13px", transition: "color 0.2s" }}>
              {row[col]}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
