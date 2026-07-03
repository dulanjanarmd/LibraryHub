import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { siteConfig } from "@/config";
import { ArrowLeft, BookOpen, Calendar, Hash, Building2, Layers, Tag, CheckCircle, XCircle, Download } from "lucide-react";

export default function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reserving, setReserving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`http://localhost:8080/api/books/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setBook(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleReserve = async () => {
    setReserving(true);
    setMessage("");
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      const res = await fetch(`http://localhost:8080/api/reservations/book/${id}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Reservation successful! You will be notified when the book is available.");
      } else {
        setMessage(data?.message || "Failed to reserve the book.");
      }
    } catch (err) {
      setMessage("Error connecting to the server.");
    } finally {
      setReserving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center" }}>
        Loading...
      </div>
    );
  }

  if (!book) {
    return (
      <div style={{ minHeight: "100vh", background: "#ffffff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', sans-serif" }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "36px", color: "#1d3205", marginBottom: "16px" }}>Book Not Found</h1>
        <p style={{ color: "#1d3205", opacity: 0.6, marginBottom: "32px" }}>The book you are looking for does not exist in our catalogue.</p>
        <Link to="/catalogue" style={{ color: "#ff2600", textDecoration: "none", fontSize: "14px", fontWeight: 500 }}>
          Back to Catalogue
        </Link>
      </div>
    );
  }

  const isAvailable = book.availableCopies > 0;
  const isEbook = book.format === 'EBOOK';
  // Note: related books fetch not implemented to save complexity, using empty array
  const relatedBooks = [];

  return (
    <div style={{ minHeight: "100vh", background: "#ffffff", color: "#1d3205", fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ padding: "32px 48px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(29,50,5,0.1)" }}>
        <Link to="/" style={{ fontFamily: "'Playfair Display', serif", fontSize: "24px", fontWeight: 400, color: "#1d3205", textDecoration: "none" }}>
          {siteConfig.brandName}
        </Link>
        <div style={{ display: "flex", gap: "24px", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          <Link to="/catalogue" style={{ color: "#1d3205", textDecoration: "none", opacity: 0.6 }}>Catalogue</Link>
          <Link to="/info" style={{ color: "#1d3205", textDecoration: "none", opacity: 0.6 }}>About</Link>
          <Link to="/login" style={{ color: "#1d3205", textDecoration: "none", opacity: 0.6 }}>Login</Link>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "48px" }}>
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "none",
            border: "none",
            color: "#1d3205",
            fontSize: "12px",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            cursor: "pointer",
            marginBottom: "40px",
            fontFamily: "'Inter', sans-serif",
            opacity: 0.6,
            transition: "opacity 0.3s",
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = "1"}
          onMouseLeave={(e) => e.currentTarget.style.opacity = "0.6"}
        >
          <ArrowLeft size={14} /> Back
        </button>

        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.5fr)", gap: "64px", alignItems: "start" }}>
          {/* Left: Cover */}
          <div>
            <div style={{ aspectRatio: "2/3", background: "#f5f5f5", overflow: "hidden", marginBottom: "24px" }}>
              <img src={book.coverImageUrl || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800"} alt={book.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                fontSize: "12px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                background: isAvailable ? "#1d3205" : "#ff2600",
                color: "#ffffff",
              }}
            >
              {isAvailable || isEbook ? <CheckCircle size={14} /> : <XCircle size={14} />}
              {isEbook ? "Digital Copy Available" : (isAvailable ? `Available (${book.availableCopies} of ${book.totalCopies})` : "Currently On Loan")}
            </div>
          </div>

          {/* Right: Details */}
          <div>
            <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.12em", opacity: 0.5, marginBottom: "12px" }}>
              {book.categoryName || 'General'}
            </div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(32px, 3.6vw, 52px)", fontWeight: 400, lineHeight: 1.1, marginBottom: "16px" }}>
              {book.title}
            </h1>
            <div style={{ fontSize: "15px", color: "#1d3205", opacity: 0.7, marginBottom: "32px" }}>
              by {book.author}
            </div>

            <p style={{ fontSize: "15px", lineHeight: 1.7, marginBottom: "40px", maxWidth: "600px" }}>
              {book.description}
            </p>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
              {isEbook ? (
                 <a
                 href={book.resourceUrl || "#"}
                 target="_blank"
                 rel="noopener noreferrer"
                 style={{
                   display: "inline-flex",
                   alignItems: "center",
                   gap: "8px",
                   padding: "14px 32px",
                   fontSize: "13px",
                   fontWeight: 600,
                   textTransform: "uppercase",
                   letterSpacing: "0.08em",
                   background: "#1d3205",
                   color: "#ffffff",
                   textDecoration: "none",
                   fontFamily: "'Inter', sans-serif",
                   transition: "background 0.3s",
                 }}
               >
                 <Download size={16} /> Read Online / Download
               </a>
              ) : (
                <button
                  disabled={reserving || isAvailable}
                  onClick={handleReserve}
                  style={{
                    padding: "14px 32px",
                    fontSize: "13px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    background: isAvailable ? "#cccccc" : "#ff2600",
                    color: "#ffffff",
                    border: "none",
                    cursor: (isAvailable || reserving) ? "not-allowed" : "pointer",
                    fontFamily: "'Inter', sans-serif",
                    transition: "background 0.3s",
                  }}
                  onMouseEnter={(e) => !isAvailable && !reserving && (e.currentTarget.style.background = "#1d3205")}
                  onMouseLeave={(e) => !isAvailable && !reserving && (e.currentTarget.style.background = "#ff2600")}
                >
                  {reserving ? "Processing..." : (isAvailable ? "Borrow in Person" : "Reserve (Join Queue)")}
                </button>
              )}
              <button
                style={{
                  padding: "14px 32px",
                  fontSize: "13px",
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  background: "transparent",
                  color: "#1d3205",
                  border: "1px solid #1d3205",
                  cursor: "pointer",
                  fontFamily: "'Inter', sans-serif",
                  transition: "all 0.3s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#1d3205";
                  e.currentTarget.style.color = "#ffffff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#1d3205";
                }}
              >
                Add to Reading List
              </button>
            </div>

            {message && (
              <div style={{ marginBottom: "24px", padding: "12px", background: message.includes("Error") || message.includes("Failed") ? "#ffcccc" : "#d4edda", color: message.includes("Error") || message.includes("Failed") ? "#ff2600" : "#155724", fontSize: "14px", borderRadius: "4px" }}>
                {message}
              </div>
            )}

            {/* Metadata Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px", maxWidth: "500px" }}>
              <MetaItem icon={<Hash size={14} />} label="ISBN" value={book.isbn} />
              <MetaItem icon={<Building2 size={14} />} label="Publisher" value={book.publisher} />
              <MetaItem icon={<Calendar size={14} />} label="Year" value={book.publicationYear || "Unknown"} />
              <MetaItem icon={<Layers size={14} />} label="Format" value={book.format} />
              <MetaItem icon={<Tag size={14} />} label="DDC" value={book.ddcNumber} />
              <MetaItem icon={<BookOpen size={14} />} label="Copies" value={`${book.availableCopies} / ${book.totalCopies}`} />
            </div>
          </div>
        </div>

        {/* Related Books */}
        {relatedBooks.length > 0 && (
          <div style={{ marginTop: "80px", paddingTop: "48px", borderTop: "1px solid rgba(29,50,5,0.1)" }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "24px", fontWeight: 400, marginBottom: "32px" }}>
              More in {book.category}
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "24px" }}>
              {relatedBooks.map((b) => (
                <Link key={b.id} to={`/book/${b.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                  <div style={{ aspectRatio: "2/3", background: "#f5f5f5", overflow: "hidden", marginBottom: "8px" }}>
                    <img src={b.src} alt={b.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "#1d3205" }}>{b.title}</div>
                  <div style={{ fontSize: "11px", opacity: 0.6 }}>{b.author}</div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ borderTop: "1px solid rgba(29,50,5,0.1)", padding: "24px 48px", display: "flex", justifyContent: "space-between", fontSize: "12px", opacity: 0.6, marginTop: "80px" }}>
        <span>{siteConfig.copyright}</span>
        <Link to="/catalogue" style={{ color: "#1d3205", textDecoration: "none" }}>Browse Catalogue</Link>
      </div>
    </div>
  );
}

function MetaItem({ icon, label, value }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
      <span style={{ opacity: 0.4, marginTop: "2px" }}>{icon}</span>
      <div>
        <div style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.5, marginBottom: "2px" }}>{label}</div>
        <div style={{ fontSize: "14px", fontWeight: 500 }}>{value}</div>
      </div>
    </div>
  );
}
