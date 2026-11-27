import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";


const LINKS = [
  { to: "/dashboard", label: "Overview" },
  { to: "/projects", label: "Projects" },
  { to: "/tasks", label: "Task board" },
  { to: "/notes", label: "Personal workspace" },
  { to: "/github-activity", label: "GitHub", dot: "#22c55e" },
  { to: "/analytics", label: "Analytics", dot: "#a78bfa" },
];

export default function AppHeader({ children, bottomSpace = 56 }) {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate("/login");
    }
  };

  const shownName = user?.name || user?.username || user?.email?.split("@")[0];

  return (
    
    <header style={{ background: "#111", color: "white" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", minHeight: 88, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 32, flexWrap: "wrap" }}>
          <Link to="/dashboard" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
            <img
              src="/Focus%20flow.jpg.jpeg?v=3"
              alt="FocusFlow"
              style={{ height: 76, width: "auto", objectFit: "contain", mixBlendMode: "lighten" }}
            />
          </Link>
          <nav style={{ display: "flex", gap: 24, fontSize: 13, flexWrap: "wrap" }}>
            {LINKS.map((l) => {
              const active = pathname === l.to;
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  style={{
                    color: active ? "white" : "#a1a1aa",
                    textDecoration: "none",
                    borderBottom: active ? "2px solid #C6F24E" : "2px solid transparent",
                    paddingBottom: 4,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  {l.dot && <span style={{ width: 8, height: 8, background: l.dot, borderRadius: "50%", display: "inline-block" }} />}
                  {l.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 12, minHeight: 30 }}>
          {loading ? null : isAuthenticated ? (
            <>
              {shownName && <span style={{ color: "#a1a1aa" }}>{shownName}</span>}
              <button
                type="button"
                onClick={handleLogout}
                style={{ background: "white", color: "black", padding: "6px 12px", fontWeight: 600, border: "none", cursor: "pointer", fontSize: 12 }}
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ color: "#a1a1aa", textDecoration: "none" }}>Log in</Link>
              <Link to="/register" style={{ background: "white", color: "black", padding: "6px 12px", fontWeight: 600, textDecoration: "none" }}>Create account</Link>
            </>
          )}
        </div>
      </div>

      {children && (
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: `36px 24px ${bottomSpace}px` }}>{children}</div>
      )}
    </header>
  );
}


