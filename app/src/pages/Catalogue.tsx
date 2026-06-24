import { useState, useEffect, useRef, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import { siteConfig, booksData } from "@/config";
import { Search, ArrowRight, Clock, BookOpen } from "lucide-react";
import gsap from "gsap";

const CATEGORIES = ["ALL", "FICTION", "TECHNOLOGY", "SCIENCE", "HISTORY", "LITERATURE"];

const MANIFESTO_TEXT =
  "The SLIIT Library exists to democratize access to knowledge empowering every student researcher and faculty member to discover learn and create without boundaries. Our collection represents centuries of human thought from ancient philosophy to cutting edge artificial intelligence ensuring that the next generation of Sri Lankan innovators has the intellectual foundation to transform the world.";

export default function Catalogue() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [sortBy, setSortBy] = useState<"newest" | "title" | "availability">("newest");
  const [currentTime, setCurrentTime] = useState(new Date());
  const gridRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const manifestoRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (headerRef.current) {
      const els = headerRef.current.querySelectorAll(".animate-in");
      gsap.fromTo(
        els,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power2.out" }
      );
    }
  }, []);

  useEffect(() => {
    if (gridRef.current) {
      const cards = gridRef.current.querySelectorAll(".book-card");
      gsap.fromTo(
        cards,
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.05, ease: "power2.out" }
      );
    }
  }, [activeCategory, sortBy]);

  const filteredBooks = useMemo(() => {
    let filtered = [...booksData];

    if (activeCategory !== "ALL") {
      filtered = filtered.filter((b) => b.category.toUpperCase() === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.isbn.includes(q) ||
          b.category.toLowerCase().includes(q)
      );
    }

    if (sortBy === "title") {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === "availability") {
      filtered.sort((a, b) => b.available - a.available);
    }

    return filtered;
  }, [activeCategory, searchQuery, sortBy]);

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        background: "#ffffff",
        color: "#1d3205",
        fontFamily: "'Inter', system-ui, sans-serif",
        overflowX: "hidden",
      }}
    >
      {/* Header */}
      <div ref={headerRef} style={{ position: "relative", padding: "32px 48px 0" }}>
        {/* Top Bar */}
        <div
          className="animate-in"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "48px",
          }}
        >
          {/* Logo */}
          <Link
            to="/"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "24px",
              fontWeight: 400,
              color: "#1d3205",
              textDecoration: "none",
              letterSpacing: "0.02em",
            }}
          >
            {siteConfig.brandName}
          </Link>

          {/* Clock & Nav */}
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                justifyContent: "flex-end",
                marginBottom: "8px",
              }}
            >
              <Clock size={13} strokeWidth={1.5} />
              <span style={{ fontSize: "13px", fontWeight: 500, letterSpacing: "0.05em" }}>
                {currentTime.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })}
              </span>
            </div>
            <div style={{ display: "flex", gap: "16px", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              <Link to="/" style={{ color: "#1d3205", textDecoration: "none", opacity: 0.6, transition: "opacity 0.3s" }}>
                Home
              </Link>
              <span style={{ color: "#1d3205", opacity: 0.3 }}>|</span>
              <Link to="/info" style={{ color: "#1d3205", textDecoration: "none", opacity: 0.6, transition: "opacity 0.3s" }}>
                About
              </Link>
              <span style={{ color: "#1d3205", opacity: 0.3 }}>|</span>
              <Link to="/login" style={{ color: "#1d3205", textDecoration: "none", opacity: 0.6, transition: "opacity 0.3s" }}>
                Login
              </Link>
            </div>
          </div>
        </div>

        {/* Manifesto */}
        <div className="animate-in" ref={manifestoRef} style={{ maxWidth: "720px", marginBottom: "48px" }}>
          <ManifestoText text={MANIFESTO_TEXT} />
        </div>

        {/* Search Bar */}
        <div
          className="animate-in"
          style={{
            display: "flex",
            alignItems: "center",
            borderBottom: "1px solid #1d3205",
            marginBottom: "24px",
            maxWidth: "800px",
          }}
        >
          <Search size={18} strokeWidth={1.5} style={{ opacity: 0.5, marginRight: "12px", flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search by title, author, ISBN, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              height: "56px",
              border: "none",
              outline: "none",
              fontSize: "15px",
              fontFamily: "'Inter', sans-serif",
              color: "#1d3205",
              background: "transparent",
            }}
          />
          <button
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              border: "1px solid #1d3205",
              background: "transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.3s ease",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#1d3205";
              const svg = e.currentTarget.querySelector("svg");
              if (svg) svg.style.color = "#ffffff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              const svg = e.currentTarget.querySelector("svg");
              if (svg) svg.style.color = "#1d3205";
            }}
          >
            <ArrowRight size={16} style={{ color: "#1d3205", transition: "color 0.3s" }} />
          </button>
        </div>

        {/* Filter Tags */}
        <div
          className="animate-in"
          style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: "6px 16px",
                fontSize: "11px",
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                border: "1px solid #1d3205",
                background: activeCategory === cat ? "#1d3205" : "transparent",
                color: activeCategory === cat ? "#ffffff" : "#1d3205",
                cursor: "pointer",
                transition: "all 0.3s ease",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sort Controls */}
        <div
          className="animate-in"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "24px",
            fontSize: "12px",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          <span style={{ opacity: 0.5 }}>Sort by</span>
          {(["newest", "title", "availability"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: sortBy === s ? "#ff2600" : "#1d3205",
                fontWeight: sortBy === s ? 600 : 400,
                fontFamily: "'Inter', sans-serif",
                transition: "color 0.3s",
              }}
            >
              {s}
              {sortBy === s && <span style={{ marginLeft: "4px" }}>&#8595;</span>}
            </button>
          ))}
          <span style={{ marginLeft: "auto", opacity: 0.5, fontSize: "12px" }}>
            {filteredBooks.length} results
          </span>
        </div>

        {/* Divider */}
        <div style={{ width: "100%", height: "1px", background: "#1d3205", marginBottom: "32px" }} />
      </div>

      {/* Book Grid */}
      <div
        ref={gridRef}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: "24px",
          padding: "0 48px 80px",
        }}
      >
        {filteredBooks.map((book) => (
          <div
            key={book.id}
            className="book-card"
            onClick={() => navigate(`/book/${book.id}`)}
            style={{
              cursor: "pointer",
              transition: "transform 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            {/* Book Cover */}
            <div
              style={{
                aspectRatio: "2/3",
                background: "#f5f5f5",
                overflow: "hidden",
                marginBottom: "12px",
                position: "relative",
              }}
            >
              <img
                src={book.src}
                alt={book.title}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
              {book.available === 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: "8px",
                    left: "8px",
                    background: "#ff2600",
                    color: "#fff",
                    fontSize: "10px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    padding: "3px 8px",
                  }}
                >
                  On Loan
                </div>
              )}
            </div>
            {/* Meta */}
            <div style={{ fontSize: "13px", fontWeight: 600, color: "#1d3205", marginBottom: "4px", lineHeight: 1.3 }}>
              {book.title}
            </div>
            <div style={{ fontSize: "12px", color: "#1d3205", opacity: 0.7, marginBottom: "8px" }}>
              {book.author}
            </div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "11px",
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: book.available > 0 ? "#1d3205" : "#ff2600",
              }}
            >
              <BookOpen size={12} />
              {book.available > 0 ? `Available (${book.available}/${book.copies})` : "On Loan"}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredBooks.length === 0 && (
        <div style={{ textAlign: "center", padding: "80px 48px", opacity: 0.5 }}>
          <BookOpen size={48} strokeWidth={1} style={{ marginBottom: "16px" }} />
          <p style={{ fontSize: "15px" }}>No books found matching your criteria.</p>
        </div>
      )}

      {/* Footer */}
      <div
        style={{
          borderTop: "1px solid #1d3205",
          padding: "24px 48px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "12px",
          opacity: 0.6,
        }}
      >
        <span>{siteConfig.copyright}</span>
        <Link to="/" style={{ color: "#1d3205", textDecoration: "none" }}>
          Back to Home
        </Link>
      </div>
    </div>
  );
}

/* Manifesto Component with Scramble Effect */
function ManifestoText({ text }: { text: string }) {
  const words = text.split(" ");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!containerRef.current) return;
      const spans = containerRef.current.querySelectorAll("span");
      spans.forEach((s) => (s.style.opacity = "1"));
      const indices = new Set<number>();
      while (indices.size < 6 && indices.size < spans.length) {
        const idx = Math.floor(Math.random() * spans.length);
        if (idx > 0) indices.add(idx);
      }
      indices.forEach((i) => {
        const s = spans[i];
        if (s) s.style.opacity = "0.2";
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [words.length]);

  return (
    <div
      ref={containerRef}
      style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: "clamp(20px, 2.4vw, 30px)",
        fontWeight: 400,
        lineHeight: 1.3,
        color: "#1d3205",
      }}
    >
      {words.map((word, i) => (
        <span
          key={i}
          style={{
            transition: "opacity 0.4s ease",
            marginRight: "0.3em",
            display: "inline",
          }}
        >
          {word}
        </span>
      ))}
    </div>
  );
}
