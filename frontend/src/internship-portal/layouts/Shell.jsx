import { useState, useEffect } from "react";
import { NavLink, Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/Auth";
import logo from "../assets/WINGROO.jpeg";

export function Brand({ prefix = "/internship" }) {
  return (
    <Link className="brand" to={prefix || "/internship"} aria-label="Wingroo home">
      <img src={logo} alt="Wingroo" />
      <span>INTERNSHIP PORTAL</span>
    </Link>
  );
}

export default function Shell() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const admin = user?.role === "ADMIN";
  const prefix = location.pathname.startsWith("/internship") ? "/internship" : "";

  // Auto-close mobile menu on route change
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  async function leave() {
    try {
      await logout();
    } finally {
      navigate(`${prefix || "/internship"}/login`);
    }
  }

  const adminLinks = [
    [`${prefix}/admin/dashboard`, "grid", "Dashboard"],
    [`${prefix}/admin/students`, "people", "Students"],
    [`${prefix}/admin/internships`, "briefcase", "Internships"],
    [`${prefix}/admin/certificates`, "patch-check", "Certificates"],
    [`${prefix}/verify`, "qr-code-scan", "Verify certificate"],
  ];

  return (
    <div className={`app-shell ${admin ? "admin-shell" : ""}`}>
      {/* Mobile Drawer Backdrop */}
      {open && (
        <div
          className="mobile-backdrop is-visible"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Top Navigation Bar */}
      <header className="topbar">
        <Brand prefix={prefix} />

        {/* Mobile Hamburger Toggle Button */}
        <button
          className="btn btn-light mobile-toggle"
          aria-label="Toggle navigation"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          <i aria-hidden="true" className={`bi bi-${open ? "x-lg" : "list"} fs-4`} />
        </button>

        {/* Desktop Top Links (Hidden on Mobile) */}
        <nav className="desktop-toplinks" aria-label="Desktop navigation">
          <a href="/" className="btn btn-outline-secondary btn-sm me-1" title="Back to Main Website">
            <i className="bi bi-arrow-left me-1"></i> Main Site
          </a>
          {!user ? (
            <>
              <NavLink to={prefix || "/internship"}>Home</NavLink>
              <NavLink to={`${prefix}/verify`}>Verify certificate</NavLink>
              <NavLink to={`${prefix}/login`}>Login</NavLink>
              <Link className="btn btn-primary btn-sm" to={`${prefix}/register`}>
                Register
              </Link>
            </>
          ) : (
            <div className="d-flex align-items-center gap-3">
              <span className="badge text-bg-light border px-2 py-1 text-secondary">
                <i className={`bi bi-${admin ? "shield-lock" : "person"} me-1`}></i>
                {user.full_name} ({user.role})
              </span>
              <NavLink to={admin ? `${prefix}/admin/dashboard` : `${prefix}/student/dashboard`}>
                Dashboard
              </NavLink>
              <NavLink to={`${prefix}/verify`}>Verify certificate</NavLink>
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={leave}
              >
                Logout
              </button>
            </div>
          )}
        </nav>

        {/* Mobile Navigation Drawer / Dropdown */}
        <nav
          className={`mobile-nav-drawer ${open ? "is-open" : ""}`}
          aria-label="Mobile navigation"
        >
          <div className="p-3 border-bottom d-flex justify-content-between align-items-center bg-light">
            <span className="small fw-bold text-uppercase text-secondary">Menu</span>
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={() => setOpen(false)}
            />
          </div>

          <div className="mobile-nav-content p-3">
            <a href="/" className="btn btn-outline-secondary btn-sm w-100 mb-3 text-start">
              <i className="bi bi-arrow-left me-2"></i> Return to Main Website
            </a>
            {!user ? (
              <div className="d-flex flex-column gap-2">
                <NavLink to={prefix || "/internship"} className="mobile-nav-link" onClick={() => setOpen(false)}>
                  <i className="bi bi-house me-2"></i> Home
                </NavLink>
                <NavLink to={`${prefix}/verify`} className="mobile-nav-link" onClick={() => setOpen(false)}>
                  <i className="bi bi-qr-code-scan me-2"></i> Verify Certificate
                </NavLink>
                <NavLink to={`${prefix}/login`} className="mobile-nav-link" onClick={() => setOpen(false)}>
                  <i className="bi bi-box-arrow-in-right me-2"></i> Login
                </NavLink>
                <Link
                  className="btn btn-primary w-100 mt-2"
                  to={`${prefix}/register`}
                  onClick={() => setOpen(false)}
                >
                  <i className="bi bi-person-plus me-1"></i> Register Student
                </Link>
              </div>
            ) : (
              <div className="d-flex flex-column gap-2">
                <div className="p-2 mb-2 bg-light rounded border">
                  <div className="fw-bold text-dark">{user.full_name}</div>
                  <small className="text-muted d-block">{user.email}</small>
                  <span className="badge text-bg-primary mt-1">{user.role}</span>
                </div>

                {admin ? (
                  <>
                    <div className="eyebrow my-2 px-1">WORKSPACE</div>
                    {adminLinks.map(([to, icon, label]) => (
                      <NavLink
                        key={to}
                        to={to}
                        className="mobile-nav-link"
                        onClick={() => setOpen(false)}
                      >
                        <i className={`bi bi-${icon} me-2`}></i> {label}
                      </NavLink>
                    ))}
                  </>
                ) : (
                  <>
                    <NavLink
                      to={`${prefix}/student/dashboard`}
                      className="mobile-nav-link"
                      onClick={() => setOpen(false)}
                    >
                      <i className="bi bi-grid me-2"></i> Student Dashboard
                    </NavLink>
                    <NavLink
                      to={`${prefix}/verify`}
                      className="mobile-nav-link"
                      onClick={() => setOpen(false)}
                    >
                      <i className="bi bi-qr-code-scan me-2"></i> Verify Certificate
                    </NavLink>
                  </>
                )}

                <hr className="my-2" />
                <button
                  className="btn btn-outline-danger w-100 mt-1 d-flex align-items-center justify-content-center gap-2"
                  onClick={() => {
                    setOpen(false);
                    leave();
                  }}
                >
                  <i className="bi bi-box-arrow-right"></i> Logout
                </button>
              </div>
            )}
          </div>
        </nav>
      </header>

      {/* Desktop Admin Sidebar (Visible only on desktop screens) */}
      {admin && (
        <aside className="sidebar desktop-only">
          <div className="eyebrow mb-4">WORKSPACE</div>
          {adminLinks.map(([to, icon, label]) => (
            <NavLink key={to} to={to}>
              <i aria-hidden="true" className={`bi bi-${icon}`} />
              {label}
            </NavLink>
          ))}
          <div className="sidebar-note">
            <i aria-hidden="true" className="bi bi-shield-check" />
            <p>
              Every certificate.
              <br />
              Accounted for.
            </p>
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <main className={admin ? "admin-main" : "container page-main"}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="page-footer">
        © {new Date().getFullYear()} Wingroo · Learn. Build. Achieve.
      </footer>
    </div>
  );
}

