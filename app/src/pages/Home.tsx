import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import VortexGallery from "@/lib/VortexGallery";
import Lenis from "lenis";
import {
  siteConfig,
  galleryConfig,
} from "@/config";
import ImageDetailOverlay from "@/components/ImageDetailOverlay";
import { Search, ArrowRight } from "lucide-react";

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const vortexRef = useRef<VortexGallery | null>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const images = galleryConfig.images;
  const hasImages = images.length > 0;

  useEffect(() => {
    if (!canvasRef.current || !hasImages) return;

    const vortex = new VortexGallery(
      canvasRef.current,
      images.map((i) => i.src)
    );
    vortexRef.current = vortex;

    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    lenis.on("scroll", () => {});

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => {
      vortex.destroy();
      lenis.destroy();
    };
  }, [hasImages, images]);

  useEffect(() => {
    vortexRef.current?.setPaused(selectedIdx !== null);
  }, [selectedIdx]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalogue`);
    }
  };

  if (!hasImages) return null;

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const vortex = vortexRef.current;
    const canvas = canvasRef.current;
    if (!vortex || !canvas) return;
    const idx = vortex.pickAtScreen(
      e.clientX,
      e.clientY,
      canvas.getBoundingClientRect()
    );
    if (idx !== null) {
      setSelectedIdx(idx);
    }
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        background: "#ffffff",
      }}
    >
      {/* WebGL Canvas */}
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 1,
          cursor: "pointer",
        }}
      />

      {/* UI Overlay */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 10,
          pointerEvents: "none",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {/* Top Bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            padding: "24px 32px",
            pointerEvents: "auto",
          }}
        >
          {/* Logo */}
          <Link
            to="/"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "18px",
              fontWeight: 400,
              color: "#1d3205",
              textDecoration: "none",
              letterSpacing: "0.02em",
              transition: "opacity 0.3s ease",
            }}
          >
            {siteConfig.brandName}
          </Link>

          {/* Nav Links */}
          <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
            <Link
              to="/catalogue"
              style={{
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: "13px",
                fontWeight: 400,
                color: "#1d3205",
                textDecoration: "none",
                transition: "opacity 0.3s ease",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.5")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              Search
            </Link>
            <Link
              to="/info"
              style={{
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: "13px",
                fontWeight: 400,
                color: "#1d3205",
                textDecoration: "none",
                transition: "opacity 0.3s ease",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.5")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              About
            </Link>
            <Link
              to="/login"
              style={{
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: "13px",
                fontWeight: 400,
                color: "#1d3205",
                textDecoration: "none",
                transition: "opacity 0.3s ease",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.5")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              Login
            </Link>
          </div>
        </div>

        {/* Center Search */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 48px",
            pointerEvents: "auto",
          }}
        >
          <form
            onSubmit={handleSearch}
            style={{
              width: "100%",
              maxWidth: "700px",
              borderBottom: "1px solid #1d3205",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <Search size={18} strokeWidth={1.5} style={{ color: "#1d3205", opacity: 0.5, flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search by title, author, ISBN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                height: "60px",
                border: "none",
                outline: "none",
                fontSize: "18px",
                fontFamily: "'Playfair Display', serif",
                color: "#1d3205",
                background: "transparent",
              }}
            />
            <button
              type="submit"
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
                flexShrink: 0,
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#1d3205";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              <ArrowRight size={16} style={{ color: "#1d3205" }} />
            </button>
          </form>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 32px",
            pointerEvents: "auto",
          }}
        >
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "12px",
              color: "#1d3205",
              opacity: 0.5,
              letterSpacing: "0.02em",
            }}
          >
            {siteConfig.copyright}
          </span>

          {/* Marquee */}
          <div
            style={{
              overflow: "hidden",
              whiteSpace: "nowrap",
              maxWidth: "400px",
              flex: 1,
              margin: "0 32px",
            }}
          >
            <div
              style={{
                display: "inline-block",
                animation: "marquee-scroll 20s linear infinite",
                fontSize: "13px",
                fontWeight: 600,
                color: "#ff2600",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
              }}
            >
              <span>
                DISCOVER KNOWLEDGE &bull; EXPLORE WORLDS &bull; EMPOWER YOUR FUTURE &bull; SLIIT LIBRARY &bull;&nbsp;&nbsp;&nbsp;
                DISCOVER KNOWLEDGE &bull; EXPLORE WORLDS &bull; EMPOWER YOUR FUTURE &bull; SLIIT LIBRARY &bull;&nbsp;&nbsp;&nbsp;
              </span>
            </div>
          </div>

          <Link
            to="/catalogue"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "12px",
              color: "#1d3205",
              opacity: 0.5,
              textDecoration: "none",
              transition: "opacity 0.3s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.5")}
          >
            Browse Catalogue
          </Link>
        </div>
      </div>

      <ImageDetailOverlay
        image={selectedIdx !== null ? images[selectedIdx] : null}
        onClose={() => setSelectedIdx(null)}
      />

      <style>{`
        @keyframes marquee-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
