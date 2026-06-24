import { useState } from "react";
import { Link } from "react-router";
import { siteConfig } from "@/config";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Repeat,
  BarChart3,
  Settings,
  LogOut,
  Clock,
  AlertTriangle,
  CheckCircle,
  Plus,
  Upload,
  Search,
  Ban,
  Edit3,
  ArrowUpDown,
} from "lucide-react";

const ADMIN_NAV = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "catalogue", label: "Catalogue Mgmt", icon: BookOpen },
  { id: "circulation", label: "Loan Processing", icon: Repeat },
  { id: "users", label: "User Management", icon: Users },
  { id: "reports", label: "Reports", icon: BarChart3 },
  { id: "settings", label: "System Settings", icon: Settings },
];

const MOCK_OVERDUE = [
  { id: "L-1003", title: "A Brief History of Time", borrower: "Samantha T.", due: "2026-05-19", daysOverdue: 5, fine: 25 },
  { id: "L-1045", title: "Design Patterns", borrower: "Kasun P.", due: "2026-05-15", daysOverdue: 9, fine: 45 },
  { id: "L-1089", title: "The Great Gatsby", borrower: "Nimsha R.", due: "2026-05-10", daysOverdue: 14, fine: 70 },
];

const MOCK_RECENT_TRANSACTIONS = [
  { id: "T-5001", type: "Issue", book: "Clean Code", user: "Amal Perera", date: "2026-06-24 09:15", status: "Success" },
  { id: "T-5002", type: "Return", book: "Sapiens", user: "Dilini Silva", date: "2026-06-24 09:42", status: "Success" },
  { id: "T-5003", type: "Renew", book: "Introduction to Algorithms", user: "Samantha T.", date: "2026-06-24 10:05", status: "Success" },
  { id: "T-5004", type: "Issue", book: "Database Systems", user: "Roshan Jay", date: "2026-06-24 10:30", status: "Blocked" },
  { id: "T-5005", type: "Return", book: "1984", user: "Pavithra S.", date: "2026-06-24 11:00", status: "Fined" },
];

const MOCK_USERS = [
  { id: "IT20234567", name: "Samantha Thilakarathne", role: "Undergraduate", faculty: "Computing", loans: 3, fines: 75, status: "Active" },
  { id: "IT20238901", name: "Kasun Perera", role: "Undergraduate", faculty: "Engineering", loans: 2, fines: 45, status: "Active" },
  { id: "ST20210045", name: "Dr. Nimal Fernando", role: "Faculty", faculty: "Computing", loans: 1, fines: 0, status: "Active" },
  { id: "IT20231234", name: "Nimsha Rodrigo", role: "Undergraduate", faculty: "Business", loans: 4, fines: 120, status: "Suspended" },
  { id: "PG20230078", name: "Dinesh Kumar", role: "Postgraduate", faculty: "Computing", loans: 2, fines: 0, status: "Active" },
];

export default function Admin() {
  const [activeTab, setActiveTab] = useState("overview");

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewView />;
      case "catalogue":
        return <CatalogueMgmtView />;
      case "circulation":
        return <CirculationView />;
      case "users":
        return <UsersView />;
      case "reports":
        return <ReportsView />;
      case "settings":
        return <SystemSettingsView />;
      default:
        return <OverviewView />;
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
          position: "fixed",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ padding: "32px 24px 24px" }}>
          <Link to="/" style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", color: "#ffffff", textDecoration: "none" }}>
            {siteConfig.brandName}
          </Link>
          <div style={{ fontSize: "11px", opacity: 0.6, marginTop: "4px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Admin Portal
          </div>
        </div>

        <nav style={{ flex: 1, padding: "0 16px" }}>
          {ADMIN_NAV.map((item) => (
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
            }}
          >
            <LogOut size={16} strokeWidth={1.5} />
            Logout
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, marginLeft: "250px", padding: "40px 48px" }}>
        <div style={{ marginBottom: "40px" }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "30px", fontWeight: 400, marginBottom: "8px" }}>
            {ADMIN_NAV.find((n) => n.id === activeTab)?.label}
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", opacity: 0.5 }}>
            <Clock size={13} />
            {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </div>
        </div>

        {renderContent()}
      </main>
    </div>
  );
}

/* Overview */
function OverviewView() {
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "40px" }}>
        <StatCard label="Total Books" value={50142} />
        <StatCard label="Active Loans" value={1286} />
        <StatCard label="Overdue Items" value={MOCK_OVERDUE.length} alert />
        <StatCard label="Monthly Fine Rev. (LKR)" value={15480} prefix="LKR " />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        <div>
          <h3 style={{ fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "16px", fontWeight: 600 }}>
            Recent Transactions
          </h3>
          <DataTable
            columns={["Type", "Book", "User", "Status"]}
            data={MOCK_RECENT_TRANSACTIONS.map((t) => ({
              Type: (
                <span style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {t.type}
                </span>
              ),
              Book: <div style={{ fontWeight: 500, fontSize: "13px" }}>{t.book}</div>,
              User: t.user,
              Status: (
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    color:
                      t.status === "Success" ? "#1d3205" : t.status === "Blocked" ? "#ff2600" : "#cc8800",
                  }}
                >
                  {t.status}
                </span>
              ),
            }))}
          />
        </div>

        <div>
          <h3 style={{ fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "16px", fontWeight: 600 }}>
            Overdue Items
          </h3>
          <DataTable
            columns={["Book", "Borrower", "Days Overdue", "Fine (LKR)"]}
            data={MOCK_OVERDUE.map((o) => ({
              Book: <div style={{ fontWeight: 500, fontSize: "13px" }}>{o.title}</div>,
              Borrower: o.borrower,
              "Days Overdue": (
                <span style={{ color: "#ff2600", fontWeight: 600 }}>{o.daysOverdue}</span>
              ),
              "Fine (LKR)": `LKR ${o.fine}.00`,
            }))}
          />
        </div>
      </div>
    </div>
  );
}

/* Catalogue Management */
function CatalogueMgmtView() {
  return (
    <div>
      <div style={{ display: "flex", gap: "12px", marginBottom: "32px" }}>
        <button
          style={{
            padding: "12px 24px",
            background: "#ff2600",
            color: "#ffffff",
            border: "none",
            fontSize: "12px",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            cursor: "pointer",
            fontFamily: "'Inter', sans-serif",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Plus size={14} /> Add New Book
        </button>
        <button
          style={{
            padding: "12px 24px",
            background: "transparent",
            color: "#1d3205",
            border: "1px solid #1d3205",
            fontSize: "12px",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            cursor: "pointer",
            fontFamily: "'Inter', sans-serif",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Upload size={14} /> Bulk Import CSV
        </button>
      </div>

      <div style={{ border: "1px solid #1d3205", padding: "32px" }}>
        <h3 style={{ fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "24px", fontWeight: 600 }}>
          Add New Book
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px", marginBottom: "16px" }}>
          <FormInput label="Title" placeholder="Enter book title" />
          <FormInput label="Author(s)" placeholder="Enter author names" />
          <FormInput label="ISBN" placeholder="978-0XXXXXXXXXX" />
          <FormInput label="Publisher" placeholder="Publisher name" />
          <FormInput label="Category" placeholder="e.g. Technology, Fiction" />
          <FormInput label="DDC Number" placeholder="e.g. 005.1" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
          <FormInput label="Year" placeholder="Publication year" />
          <FormInput label="Copies" placeholder="Number of copies" type="number" />
          <FormInput label="Shelf Location" placeholder="e.g. A-12-3" />
        </div>
        <button
          style={{
            padding: "12px 32px",
            background: "#1d3205",
            color: "#ffffff",
            border: "none",
            fontSize: "12px",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            cursor: "pointer",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          Save Book
        </button>
      </div>
    </div>
  );
}

/* Circulation */
function CirculationView() {
  return (
    <div>
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
        <span>Fine threshold: Users with fines exceeding LKR 500 are blocked from borrowing.</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px", marginBottom: "32px" }}>
        <div style={{ border: "1px solid #1d3205", padding: "20px" }}>
          <label style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.5, display: "block", marginBottom: "8px" }}>
            Scan Book Barcode
          </label>
          <input
            type="text"
            placeholder="Enter or scan barcode"
            style={{
              width: "100%",
              height: "48px",
              padding: "0 16px",
              border: "1px solid #1d3205",
              fontSize: "14px",
              fontFamily: "'Inter', sans-serif",
            }}
          />
        </div>
        <div style={{ border: "1px solid #1d3205", padding: "20px" }}>
          <label style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.5, display: "block", marginBottom: "8px" }}>
            Scan User ID
          </label>
          <input
            type="text"
            placeholder="Enter or scan user ID"
            style={{
              width: "100%",
              height: "48px",
              padding: "0 16px",
              border: "1px solid #1d3205",
              fontSize: "14px",
              fontFamily: "'Inter', sans-serif",
            }}
          />
        </div>
      </div>

      <div style={{ display: "flex", gap: "12px" }}>
        <ActionButton icon={<CheckCircle size={14} />} label="Issue Book" primary />
        <ActionButton icon={<ArrowUpDown size={14} />} label="Process Return" />
        <ActionButton icon={<RefreshCwIcon size={14} />} label="Renew Loan" />
      </div>
    </div>
  );
}

/* Users Management */
function UsersView() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = MOCK_USERS.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <div style={{ position: "relative", maxWidth: "400px" }}>
          <Search size={16} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", opacity: 0.4 }} />
          <input
            type="text"
            placeholder="Search by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              height: "44px",
              padding: "0 16px 0 44px",
              border: "1px solid #1d3205",
              fontSize: "14px",
              fontFamily: "'Inter', sans-serif",
            }}
          />
        </div>
      </div>

      <DataTable
        columns={["ID", "Name", "Role", "Faculty", "Loans", "Fines (LKR)", "Status", ""]}
        data={filteredUsers.map((u) => ({
          ID: <span style={{ fontSize: "12px", opacity: 0.6 }}>{u.id}</span>,
          Name: <div style={{ fontWeight: 500 }}>{u.name}</div>,
          Role: u.role,
          Faculty: u.faculty,
          Loans: u.loans,
          "Fines (LKR)": (
            <span style={{ color: u.fines > 500 ? "#ff2600" : "#1d3205", fontWeight: u.fines > 500 ? 600 : 400 }}>
              LKR {u.fines}
            </span>
          ),
          Status: (
            <span
              style={{
                fontSize: "11px",
                fontWeight: 600,
                textTransform: "uppercase",
                color: u.status === "Active" ? "#1d3205" : "#ff2600",
              }}
            >
              {u.status}
            </span>
          ),
          "": (
            <div style={{ display: "flex", gap: "6px" }}>
              <button style={{ padding: "4px 8px", border: "1px solid #1d3205", background: "transparent", cursor: "pointer" }}>
                <Edit3 size={12} />
              </button>
              {u.status === "Active" ? (
                <button style={{ padding: "4px 8px", border: "1px solid #ff2600", background: "transparent", color: "#ff2600", cursor: "pointer" }}>
                  <Ban size={12} />
                </button>
              ) : (
                <button style={{ padding: "4px 8px", border: "1px solid #1d3205", background: "transparent", cursor: "pointer" }}>
                  <CheckCircle size={12} />
                </button>
              )}
            </div>
          ),
        }))}
      />
    </div>
  );
}

/* Reports */
function ReportsView() {
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "24px" }}>
        {[
          { title: "Active Loans Report", desc: "All currently borrowed books with due dates" },
          { title: "Overdue Items Report", desc: "Books past their due date with fine calculations" },
          { title: "Fine Collection Report", desc: "Monthly fine revenue and payment status" },
          { title: "User Activity Report", desc: "Borrowing patterns by faculty and role" },
          { title: "Inventory Report", desc: "Complete catalogue listing with availability" },
          { title: "New Acquisitions Report", desc: "Books added in the last 30 days" },
        ].map((report) => (
          <div
            key={report.title}
            style={{
              border: "1px solid #1d3205",
              padding: "24px",
              cursor: "pointer",
              transition: "background 0.3s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(29,50,5,0.03)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <h4 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "6px" }}>{report.title}</h4>
            <p style={{ fontSize: "13px", opacity: 0.6, marginBottom: "16px" }}>{report.desc}</p>
            <button
              style={{
                padding: "8px 16px",
                fontSize: "11px",
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                border: "1px solid #1d3205",
                background: "transparent",
                color: "#1d3205",
                cursor: "pointer",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Generate PDF
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* System Settings */
function SystemSettingsView() {
  return (
    <div style={{ maxWidth: "700px" }}>
      <div style={{ border: "1px solid #1d3205", padding: "24px", marginBottom: "24px" }}>
        <h3 style={{ fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "20px", fontWeight: 600 }}>
          Loan Policies
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
          <FormInput label="Undergraduate Limit" value="4" />
          <FormInput label="Postgraduate Limit" value="6" />
          <FormInput label="Faculty Limit" value="10" />
          <FormInput label="UG Loan Period (days)" value="14" />
          <FormInput label="PG Loan Period (days)" value="21" />
          <FormInput label="Faculty Period (days)" value="30" />
        </div>
      </div>

      <div style={{ border: "1px solid #1d3205", padding: "24px", marginBottom: "24px" }}>
        <h3 style={{ fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "20px", fontWeight: 600 }}>
          Fine Configuration
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
          <FormInput label="Daily Fine Rate (LKR)" value="5" />
          <FormInput label="Max Fine Cap (%)" value="150" />
          <FormInput label="Block Threshold (LKR)" value="500" />
        </div>
      </div>

      <div style={{ border: "1px solid #1d3205", padding: "24px" }}>
        <h3 style={{ fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "20px", fontWeight: 600 }}>
          Notification Settings
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {["Enable email notifications", "Enable SMS notifications", "Due date reminders (3 days before)", "Daily overdue alerts"].map((s) => (
            <label key={s} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", cursor: "pointer" }}>
              <input type="checkbox" defaultChecked style={{ accentColor: "#1d3205" }} />
              {s}
            </label>
          ))}
        </div>
      </div>

      <button
        style={{
          marginTop: "24px",
          padding: "14px 32px",
          background: "#1d3205",
          color: "#ffffff",
          border: "none",
          fontSize: "12px",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          cursor: "pointer",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        Save All Changes
      </button>
    </div>
  );
}

/* Shared Components */
function StatCard({ label, value, prefix = "", alert }: { label: string; value: number; prefix?: string; alert?: boolean }) {
  return (
    <div style={{ background: alert ? "#ff2600" : "#1d3205", color: "#ffffff", padding: "20px 24px", border: "1px solid #1d3205" }}>
      <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.7, marginBottom: "8px" }}>{label}</div>
      <div style={{ fontSize: "30px", fontWeight: 600 }}>
        {prefix}{value.toLocaleString()}
      </div>
    </div>
  );
}

function FormInput({ label, placeholder, value, type = "text" }: { label: string; placeholder?: string; value?: string; type?: string }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.5, marginBottom: "6px" }}>
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        defaultValue={value}
        style={{
          width: "100%",
          height: "44px",
          padding: "0 12px",
          border: "1px solid rgba(29,50,5,0.3)",
          fontSize: "14px",
          fontFamily: "'Inter', sans-serif",
          outline: "none",
        }}
      />
    </div>
  );
}

function ActionButton({ icon, label, primary }: { icon: React.ReactNode; label: string; primary?: boolean }) {
  return (
    <button
      style={{
        padding: "14px 28px",
        fontSize: "12px",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        background: primary ? "#ff2600" : "transparent",
        color: primary ? "#ffffff" : "#1d3205",
        border: "1px solid #1d3205",
        cursor: "pointer",
        fontFamily: "'Inter', sans-serif",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        transition: "all 0.3s",
      }}
    >
      {icon} {label}
    </button>
  );
}

function DataTable({ columns, data }: { columns: string[]; data: Record<string, React.ReactNode>[] }) {
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
            transition: "background 0.2s",
            cursor: "default",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#1d3205";
            e.currentTarget.querySelectorAll("div").forEach((d) => (d.style.color = "#ffffff"));
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = i % 2 === 1 ? "rgba(29,50,5,0.03)" : "transparent";
            e.currentTarget.querySelectorAll("div").forEach((d) => (d.style.color = ""));
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

function RefreshCwIcon({ size }: { size: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 16h5v5" />
    </svg>
  );
}
