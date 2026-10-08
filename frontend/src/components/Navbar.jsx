import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, ArrowRight, Sparkles, LogIn, ShieldCheck, User, LogOut, ChevronDown, GraduationCap, LayoutDashboard } from 'lucide-react';
import './Navbar.css';

const NAV_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Events', href: '#events' },
  { label: 'FAQs', href: '#faq-knowledge-hub' },
  { label: 'Careers', href: '#careers' },
  { label: 'Contact', href: '#contact' }
];

export default function Navbar({ onOpenLogin, onOpenAdmin, onOpenStudentPortal }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null); // 'student' | 'admin' | null
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileRef = useRef(null);

  const syncUser = () => {
    try {
      const studentStr = sessionStorage.getItem('wingroo_student_user');
      const adminStr = sessionStorage.getItem('wingroo_admin_user');
      const adminAuth = sessionStorage.getItem('wingroo_admin_auth') === 'true';

      if (adminAuth && adminStr) {
        setUserRole('admin');
        setCurrentUser(JSON.parse(adminStr));
      } else if (studentStr) {
        setUserRole('student');
        setCurrentUser(JSON.parse(studentStr));
      } else {
        setUserRole(null);
        setCurrentUser(null);
      }
    } catch {
      setUserRole(null);
      setCurrentUser(null);
    }
  };

  useEffect(() => {
    syncUser();

    const handleAuthChange = () => {
      syncUser();
    };

    window.addEventListener('wingroo_student_logged_in', handleAuthChange);
    window.addEventListener('wingroo_student_logged_out', handleAuthChange);
    window.addEventListener('wingroo_admin_logged_in', handleAuthChange);
    window.addEventListener('wingroo_admin_logged_out', handleAuthChange);
    window.addEventListener('wingroo_auth_state_changed', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);

    return () => {
      window.removeEventListener('wingroo_student_logged_in', handleAuthChange);
      window.removeEventListener('wingroo_student_logged_out', handleAuthChange);
      window.removeEventListener('wingroo_admin_logged_in', handleAuthChange);
      window.removeEventListener('wingroo_admin_logged_out', handleAuthChange);
      window.removeEventListener('wingroo_auth_state_changed', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    };
    if (profileDropdownOpen) {
      document.addEventListener('click', handleOutsideClick);
    }
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [profileDropdownOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      // Section spy
      const sections = NAV_LINKS.map(link => link.href.substring(1));
      const scrollPosition = window.scrollY + 140;

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLinkClick = (e, targetId) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const element = document.querySelector(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNavbarSignOut = () => {
    if (userRole === 'admin') {
      sessionStorage.removeItem('wingroo_admin_auth');
      sessionStorage.removeItem('wingroo_admin_user');
      window.dispatchEvent(new CustomEvent('wingroo_admin_logged_out'));
    } else {
      sessionStorage.removeItem('wingroo_student_user');
      window.dispatchEvent(new CustomEvent('wingroo_student_logged_out'));
    }
    sessionStorage.removeItem('tokens');
    window.dispatchEvent(new Event('wingroo_auth_state_changed'));
    setProfileDropdownOpen(false);
    syncUser();
  };

  const userName = currentUser?.full_name || currentUser?.name || (userRole === 'admin' ? 'Administrator' : 'Candidate');
  const firstName = userName.split(' ')[0] || userName;
  const userEmail = currentUser?.email || (userRole === 'admin' ? 'admin@wingroo.com' : '');
  const userInitial = (userName || userEmail || 'U')[0].toUpperCase();
  const userPhoto = currentUser?.photo_url || currentUser?.photo || currentUser?.profile_photo || null;

  return (
    <header className={`navbar-header ${isScrolled ? 'navbar-scrolled' : ''}`}>
      <div className="container navbar-container">
        {/* Official Brand Logo */}
        <a 
          href="#home" 
          className="navbar-brand" 
          onClick={(e) => handleLinkClick(e, '#home')}
        >
          <img 
            src="/logo.png" 
            alt="Wingroo Technologies" 
            className="navbar-brand-logo" 
          />
          <div className="brand-text">
            <span className="brand-title">WINGROO</span>
            <span className="brand-subtitle">TECHNOLOGIES</span>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="desktop-nav">
          {NAV_LINKS.map((link) => {
            const id = link.href.substring(1);
            const isActive = activeSection === id;
            return (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className={`nav-link-item ${isActive ? 'nav-link-item-active' : ''}`}
              >
                {link.label}
                {isActive && <span className="nav-indicator" />}
              </a>
            );
          })}
        </nav>

        {/* Action Buttons */}
        <div className="navbar-actions">
          <a
            href="/internship"
            className="nav-verify-btn"
            title="Certificate & Verification Portal"
          >
            <ShieldCheck size={16} />
            <span>Certificate & Verification</span>
          </a>

          {/* User Profile Avatar (Google-style) OR Login Button */}
          {currentUser ? (
            <div className="nav-profile-container" ref={profileRef}>
              <button
                type="button"
                className={`nav-profile-pill ${profileDropdownOpen ? 'active' : ''}`}
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                aria-expanded={profileDropdownOpen}
                title={`Logged in as ${userName} (${userRole})`}
              >
                <div className={`nav-avatar-circle ${userRole === 'admin' ? 'avatar-admin' : 'avatar-student'}`}>
                  {userPhoto ? (
                    <img src={userPhoto} alt="User Avatar" className="nav-avatar-img" />
                  ) : (
                    <span className="nav-avatar-initial">{userInitial}</span>
                  )}
                </div>
                <span className="nav-profile-name">{firstName}</span>
                <ChevronDown size={14} className={`nav-profile-chevron ${profileDropdownOpen ? 'rotated' : ''}`} />
              </button>

              {/* Google-style Profile Popover Menu */}
              {profileDropdownOpen && (
                <div className="nav-profile-dropdown animate-fade-in">
                  <div className="profile-dropdown-header">
                    <div className={`profile-dropdown-large-avatar ${userRole === 'admin' ? 'avatar-admin' : 'avatar-student'}`}>
                      {userPhoto ? (
                        <img src={userPhoto} alt="Profile" className="nav-avatar-img" />
                      ) : (
                        <span>{userInitial}</span>
                      )}
                    </div>
                    <div className="profile-dropdown-user-info">
                      <div className="profile-dropdown-name">{userName}</div>
                      <div className="profile-dropdown-email">{userEmail}</div>
                      <span className={`profile-dropdown-role-badge ${userRole === 'admin' ? 'role-admin' : 'role-student'}`}>
                        {userRole === 'admin' ? 'Administrator' : 'Candidate'}
                      </span>
                    </div>
                  </div>

                  <div className="profile-dropdown-divider" />

                  <div className="profile-dropdown-actions">
                    {userRole === 'admin' ? (
                      <>
                        <button
                          type="button"
                          className="profile-action-btn"
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            if (typeof onOpenAdmin === 'function') onOpenAdmin();
                            else if (typeof onOpenLogin === 'function') onOpenLogin('admin');
                          }}
                        >
                          <ShieldCheck size={16} />
                          <span>Admin Control Console</span>
                        </button>
                        <a
                          href="/internship/admin/dashboard"
                          className="profile-action-btn"
                          onClick={() => setProfileDropdownOpen(false)}
                        >
                          <LayoutDashboard size={16} />
                          <span>Internship Admin Dashboard</span>
                        </a>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="profile-action-btn"
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            if (typeof onOpenStudentPortal === 'function') onOpenStudentPortal();
                            else if (typeof onOpenLogin === 'function') onOpenLogin('student');
                          }}
                        >
                          <User size={16} />
                          <span>My Applications & Status</span>
                        </button>
                        <a
                          href="/internship/student/dashboard"
                          className="profile-action-btn"
                          onClick={() => setProfileDropdownOpen(false)}
                        >
                          <GraduationCap size={16} />
                          <span>Internship Candidate Portal</span>
                        </a>
                      </>
                    )}
                  </div>

                  <div className="profile-dropdown-divider" />

                  <div className="profile-dropdown-footer">
                    <button
                      type="button"
                      className="profile-signout-btn"
                      onClick={handleNavbarSignOut}
                    >
                      <LogOut size={15} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => typeof onOpenLogin === 'function' ? onOpenLogin('student') : (onOpenStudentPortal && onOpenStudentPortal())}
              className="nav-login-btn"
              title="Access Candidate & Admin Login Portal"
            >
              <LogIn size={16} />
              <span>Login</span>
            </button>
          )}

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            className="mobile-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div className={`mobile-nav-drawer ${mobileMenuOpen ? 'mobile-nav-open' : ''}`}>
        <div className="mobile-nav-inner">
          {currentUser && (
            <div className="mobile-profile-card">
              <div className="mobile-profile-header">
                <div className={`mobile-avatar-circle ${userRole === 'admin' ? 'avatar-admin' : 'avatar-student'}`}>
                  {userPhoto ? (
                    <img src={userPhoto} alt="Profile" className="nav-avatar-img" />
                  ) : (
                    <span>{userInitial}</span>
                  )}
                </div>
                <div>
                  <div className="mobile-profile-name">{userName}</div>
                  <div className="mobile-profile-email">{userEmail}</div>
                  <span className={`mobile-role-pill ${userRole === 'admin' ? 'role-admin' : 'role-student'}`}>
                    {userRole === 'admin' ? 'Administrator' : 'Candidate'}
                  </span>
                </div>
              </div>
              <div className="mobile-profile-links">
                {userRole === 'admin' ? (
                  <button
                    type="button"
                    className="mobile-profile-action"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      if (typeof onOpenAdmin === 'function') onOpenAdmin();
                      else if (typeof onOpenLogin === 'function') onOpenLogin('admin');
                    }}
                  >
                    <ShieldCheck size={16} />
                    <span>Admin Control Console</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    className="mobile-profile-action"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      if (typeof onOpenStudentPortal === 'function') onOpenStudentPortal();
                      else if (typeof onOpenLogin === 'function') onOpenLogin('student');
                    }}
                  >
                    <User size={16} />
                    <span>My Applications & Status</span>
                  </button>
                )}
                <button
                  type="button"
                  className="mobile-profile-signout"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleNavbarSignOut();
                  }}
                >
                  <LogOut size={15} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}

          {NAV_LINKS.map((link) => {
            const id = link.href.substring(1);
            const isActive = activeSection === id;
            return (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className={`mobile-nav-link ${isActive ? 'mobile-nav-link-active' : ''}`}
              >
                <span>{link.label}</span>
                {isActive && <span className="mobile-active-dot" />}
              </a>
            );
          })}
          <div className="mobile-cta-wrapper">
            <a
              href="/internship"
              className="mobile-verify-btn"
              onClick={() => setMobileMenuOpen(false)}
            >
              <ShieldCheck size={16} />
              <span>Certificate & Verification</span>
            </a>
            {!currentUser && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (typeof onOpenLogin === 'function') onOpenLogin('student');
                  else if (onOpenStudentPortal) onOpenStudentPortal();
                }}
                className="mobile-login-btn"
              >
                <LogIn size={16} />
                <span>Login Portal</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
