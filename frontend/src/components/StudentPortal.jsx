import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Search, 
  X, 
  CheckCircle, 
  FileText, 
  ExternalLink, 
  Printer, 
  Phone, 
  Mail, 
  Sparkles, 
  Calendar, 
  ArrowRight, 
  RefreshCw, 
  AlertCircle,
  ShieldCheck,
  Award,
  Check,
  Lock,
  LogIn,
  LogOut,
  User,
  KeyRound,
  UserPlus,
  Briefcase,
  Zap
} from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './StudentPortal.css';

const API_BASE = API_BASE_URL || '';

export default function StudentPortal({ isOpen, onClose, initialQuery = '', onSwitchRole }) {
  // Authentication State: candidate must be logged in to view their applications & passes
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = sessionStorage.getItem('wingroo_student_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Auth view mode: 'login' | 'register'
  const [authMode, setAuthMode] = useState('login');

  // Login form state
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Register form state
  const [registerForm, setRegisterForm] = useState({
    candidate_type: 'INTERNSHIP_EVENT',
    full_name: '',
    email: '',
    phone: '',
    college: '',
    department: '',
    course: '',
    password: '',
    confirm_password: ''
  });
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');

  // Forgot Password state
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotNewPass, setForgotNewPass] = useState('');
  const [forgotConfirmPass, setForgotConfirmPass] = useState('');
  const [forgotUserId, setForgotUserId] = useState(null);
  const [forgotStep, setForgotStep] = useState('verify'); // 'verify' | 'reset'
  const [forgotMsg, setForgotMsg] = useState('');
  const [forgotErr, setForgotErr] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  // Tabs: 'internship' (Internship Apply) | 'events' (Events Apply)
  const [activeTab, setActiveTab] = useState('internship');

  const [searchQuery, setSearchQuery] = useState(() => {
    return initialQuery || sessionStorage.getItem('wingroo_student_lookup') || '';
  });
  const [applications, setApplications] = useState([]);
  const [eventRegistrations, setEventRegistrations] = useState([]);
  const [trackLoading, setTrackLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [trackErrorMsg, setTrackErrorMsg] = useState('');
  const [activeSlip, setActiveSlip] = useState(null);
  const [activePass, setActivePass] = useState(null);

  const [pendingApply, setPendingApply] = useState(() => {
    try {
      const raw = sessionStorage.getItem('wingroo_pending_apply');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  // When modal opens or user logs in, automatically fetch records if user is logged in
  useEffect(() => {
    if (isOpen) {
      try {
        const raw = sessionStorage.getItem('wingroo_pending_apply');
        setPendingApply(raw ? JSON.parse(raw) : null);
      } catch {
        setPendingApply(null);
      }
      if (currentUser?.email) {
        fetchStudentApplications(currentUser.email);
      } else if (initialQuery) {
        setLoginForm(prev => ({ ...prev, email: initialQuery }));
      }
    }
  }, [isOpen, currentUser]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginForm.email.trim(),
          password: loginForm.password
        })
      });
      const data = await res.json();
      if (res.ok && data.user) {
        sessionStorage.setItem('wingroo_student_user', JSON.stringify(data.user));
        setCurrentUser(data.user);
        window.dispatchEvent(new CustomEvent('wingroo_student_logged_in', { detail: data.user }));
        window.dispatchEvent(new Event('wingroo_auth_state_changed'));
        fetchStudentApplications(data.user.email);
        const hasPending = !!sessionStorage.getItem('wingroo_pending_apply');
        if (hasPending && typeof onClose === 'function') {
          setTimeout(() => {
            onClose();
          }, 350);
        }
      } else {
        setLoginError(data.detail || 'Invalid email or password. Please check your credentials.');
      }
    } catch {
      setLoginError('Unable to connect to authentication server. Please check your connection.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegisterError('');
    setRegisterSuccess('');

    if (!registerForm.full_name.trim()) {
      setRegisterError('Please enter your full name.');
      return;
    }
    if (!registerForm.email.trim()) {
      setRegisterError('Please enter your email address.');
      return;
    }
    if (registerForm.password !== registerForm.confirm_password) {
      setRegisterError('Passwords do not match.');
      return;
    }
    if (registerForm.password.length < 6) {
      setRegisterError('Password must be at least 6 characters long.');
      return;
    }

    setRegisterLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/candidate-register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidate_type: registerForm.candidate_type || 'INTERNSHIP_EVENT',
          full_name: registerForm.full_name.trim(),
          email: registerForm.email.trim(),
          password: registerForm.password,
          confirm_password: registerForm.confirm_password,
          phone: registerForm.phone.trim(),
          college: registerForm.college.trim(),
          department: registerForm.department.trim(),
          course: registerForm.course.trim()
        })
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setRegisterSuccess('Account created successfully! Logging you in…');
        sessionStorage.setItem('wingroo_student_user', JSON.stringify(data.user));
        window.dispatchEvent(new CustomEvent('wingroo_student_logged_in', { detail: data.user }));
        window.dispatchEvent(new Event('wingroo_auth_state_changed'));
        const hasPending = !!sessionStorage.getItem('wingroo_pending_apply');
        setTimeout(() => {
          setCurrentUser(data.user);
          fetchStudentApplications(data.user.email);
          if (hasPending && typeof onClose === 'function') {
            onClose();
          }
        }, 600);
      } else {
        setRegisterError(data.detail || data.message || 'Registration failed. Please check the entered details.');
      }
    } catch {
      setRegisterError('Unable to connect to registration server. Please try again.');
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleForgotVerify = async (e) => {
    e.preventDefault();
    setForgotErr('');
    setForgotMsg('');
    setForgotLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: forgotEmail.trim(), 
          register_number: forgotEmail.trim() 
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Verification failed');
      setForgotUserId(data.user_id);
      setForgotMsg(data.message || `Account verified for ${data.full_name}. Please choose a new password.`);
      setForgotStep('reset');
    } catch (err) {
      setForgotErr(err.message);
    } finally {
      setForgotLoading(false);
    }
  };

  const handleForgotReset = async (e) => {
    e.preventDefault();
    setForgotErr('');
    setForgotMsg('');
    setForgotLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-password/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: forgotUserId,
          email: forgotEmail.trim(),
          new_password: forgotNewPass,
          confirm_password: forgotConfirmPass
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Password reset failed');
      setForgotMsg(data.message || 'Password successfully updated! You can now sign in.');
      setTimeout(() => {
        setShowForgot(false);
        setForgotStep('verify');
        setLoginForm(prev => ({ ...prev, email: forgotEmail, password: forgotNewPass }));
      }, 1500);
    } catch (err) {
      setForgotErr(err.message);
    } finally {
      setForgotLoading(false);
    }
  };

  const handleSignOut = () => {
    sessionStorage.removeItem('wingroo_student_user');
    window.dispatchEvent(new CustomEvent('wingroo_student_logged_out'));
    window.dispatchEvent(new Event('wingroo_auth_state_changed'));
    setCurrentUser(null);
    setApplications([]);
    setEventRegistrations([]);
    setSearched(false);
    setLoginForm({ email: '', password: '' });
  };

  const fetchStudentApplications = async (queryToSearch) => {
    const q = (queryToSearch !== undefined ? queryToSearch : searchQuery).trim();
    if (!q) {
      setTrackErrorMsg('Please enter your email, phone number, or application / registration number.');
      return;
    }

    setTrackLoading(true);
    setTrackErrorMsg('');
    try {
      const res = await fetch(`${API_BASE}/api/student/applications?query=${encodeURIComponent(q)}`);
      const data = await res.json();
      setSearched(true);
      if (data.success) {
        const apps = Array.isArray(data.applications) ? data.applications : [];
        const evRegs = Array.isArray(data.event_registrations) ? data.event_registrations : [];
        setApplications(apps);
        setEventRegistrations(evRegs);
        if (apps.length > 0 || evRegs.length > 0) {
          sessionStorage.setItem('wingroo_student_lookup', q);
          if (apps.length === 0 && evRegs.length > 0) {
            setActiveTab('events');
          } else if (apps.length > 0) {
            setActiveTab('internship');
          }
        } else {
          setTrackErrorMsg(data.message || 'No applications or event registrations found for this account.');
        }
      } else {
        setApplications([]);
        setEventRegistrations([]);
        setTrackErrorMsg(data.message || 'No applications or event registrations found.');
      }
    } catch {
      setSearched(true);
      setTrackErrorMsg('Failed to connect to candidate server. Please check your connection.');
      setApplications([]);
      setEventRegistrations([]);
    } finally {
      setTrackLoading(false);
    }
  };

  const getApplicantProfile = () => {
    if (applications.length > 0) {
      return {
        name: applications[0].name,
        email: applications[0].email,
        phone: applications[0].phone,
        college: applications[0].college,
        course: applications[0].course
      };
    }
    if (eventRegistrations.length > 0) {
      return {
        name: eventRegistrations[0].name,
        email: eventRegistrations[0].email,
        phone: eventRegistrations[0].phone,
        college: eventRegistrations[0].college,
        course: `Year: ${eventRegistrations[0].year || 'N/A'}`
      };
    }
    if (currentUser) {
      return {
        name: currentUser.full_name,
        email: currentUser.email,
        phone: '',
        college: 'Registered Candidate',
        course: ''
      };
    }
    return null;
  };

  const applicantProfile = getApplicantProfile();

  if (!isOpen) return null;

  return (
    <div className="student-portal-overlay" onClick={onClose}>
      <div className="student-portal-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Top Header */}
        <div className="student-portal-header">
          <div className="student-brand-title">
            <img 
              src="/logo.png" 
              alt="Wingroo Technologies" 
              className="portal-brand-logo" 
              style={{ height: '36px', width: 'auto', objectFit: 'contain' }}
            />
            <div className="student-icon-badge">
              <GraduationCap size={20} />
            </div>
            <div>
              <div className="student-portal-tag">Candidate Applications & Passes</div>
              <h3 className="student-portal-heading">Wingroo Candidate Portal</h3>
            </div>
          </div>

          {/* Unified Role Switcher / Header Actions */}
          <div className="student-header-right-group">
            <div className="portal-role-switch-tabs">
              <button type="button" className="portal-role-btn active" title="Current: Candidate Portal">
                <GraduationCap size={15} />
                <span>Candidate Portal</span>
              </button>
              <button 
                type="button" 
                className="portal-role-btn" 
                onClick={() => typeof onSwitchRole === 'function' && onSwitchRole('admin')}
                title="Switch to Admin & Staff Login"
              >
                <ShieldCheck size={15} />
                <span>Admin Login</span>
              </button>
            </div>

            <div className="student-header-actions">
              <button onClick={onClose} className="student-icon-btn student-close-btn" title="Close">
                <X size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Feature Navigation Bar: Only when candidate is logged in */}
        {currentUser && (
          <div className="student-nav-tabs-bar">
            <button 
              type="button"
              className={`student-nav-tab ${activeTab === 'internship' ? 'active' : ''}`}
              onClick={() => setActiveTab('internship')}
            >
              <GraduationCap size={16} />
              <span>Internship Apply</span>
              {applications.length > 0 && (
                <span className="live-pill" style={{ background: '#0284c7', color: '#fff' }}>
                  {applications.length}
                </span>
              )}
            </button>

            <button 
              type="button"
              className={`student-nav-tab ${activeTab === 'events' ? 'active' : ''}`}
              onClick={() => setActiveTab('events')}
            >
              <Calendar size={16} />
              <span>Events Apply</span>
              {eventRegistrations.length > 0 && (
                <span className="live-pill" style={{ background: '#0ea5e9', color: '#fff' }}>
                  {eventRegistrations.length}
                </span>
              )}
            </button>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="student-portal-body">
          {/* ========================================================= */}
          {/* 1. NOT LOGGED IN: SHOW CANDIDATE LOGIN & FORGOT PASSWORD  */}
          {/* ========================================================= */}
          {!currentUser ? (
            <div className="candidate-login-container">
              {showForgot ? (
                /* Forgot / Reset Password Card */
                <div className="candidate-login-card">
                  <div className="candidate-login-icon-wrap">
                    <KeyRound size={26} />
                  </div>
                  <h3 className="candidate-login-title">Reset Candidate Password</h3>
                  <p className="candidate-login-desc">
                    {forgotStep === 'verify'
                      ? 'Enter your registered email address to verify your candidate account and create a new password.'
                      : 'Set your new candidate portal password below.'}
                  </p>

                  {forgotErr && (
                    <div className="candidate-auth-error">
                      <AlertCircle size={16} style={{ flexShrink: 0 }} />
                      <span>{forgotErr}</span>
                    </div>
                  )}

                  {forgotMsg && (
                    <div className="candidate-auth-success">
                      <CheckCircle size={16} style={{ flexShrink: 0 }} />
                      <span>{forgotMsg}</span>
                    </div>
                  )}

                  {forgotStep === 'verify' ? (
                    <form onSubmit={handleForgotVerify}>
                      <div className="candidate-form-group">
                        <label className="candidate-form-label">Registered Email Address</label>
                        <div className="candidate-input-wrap" style={{ marginTop: '6px' }}>
                          <Mail size={17} className="candidate-input-icon" />
                          <input 
                            type="email"
                            value={forgotEmail}
                            onChange={(e) => setForgotEmail(e.target.value)}
                            placeholder="Enter your registered email address"
                            className="candidate-input"
                            required
                          />
                        </div>
                      </div>

                      <button type="submit" disabled={forgotLoading} className="candidate-auth-btn">
                        {forgotLoading ? <RefreshCw size={16} className="spin-anim" /> : <ShieldCheck size={16} />}
                        <span>{forgotLoading ? 'Verifying Account…' : 'Verify Candidate Account'}</span>
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleForgotReset}>
                      <div className="candidate-form-group">
                        <label className="candidate-form-label">New Password (min 6 characters)</label>
                        <div className="candidate-input-wrap" style={{ marginTop: '6px' }}>
                          <Lock size={17} className="candidate-input-icon" />
                          <input 
                            type="password"
                            value={forgotNewPass}
                            onChange={(e) => setForgotNewPass(e.target.value)}
                            placeholder="Enter new password"
                            className="candidate-input"
                            required
                          />
                        </div>
                      </div>

                      <div className="candidate-form-group">
                        <label className="candidate-form-label">Confirm New Password</label>
                        <div className="candidate-input-wrap" style={{ marginTop: '6px' }}>
                          <Lock size={17} className="candidate-input-icon" />
                          <input 
                            type="password"
                            value={forgotConfirmPass}
                            onChange={(e) => setForgotConfirmPass(e.target.value)}
                            placeholder="Re-enter new password"
                            className="candidate-input"
                            required
                          />
                        </div>
                      </div>

                      <button type="submit" disabled={forgotLoading} className="candidate-auth-btn">
                        {forgotLoading ? <RefreshCw size={16} className="spin-anim" /> : <Lock size={16} />}
                        <span>{forgotLoading ? 'Updating Password…' : 'Save New Password & Sign In'}</span>
                      </button>
                    </form>
                  )}

                  <div className="candidate-auth-footer">
                    <button 
                      type="button" 
                      onClick={() => { setShowForgot(false); setForgotErr(''); setForgotMsg(''); }}
                      className="candidate-back-btn"
                    >
                      ← Back to Candidate Login
                    </button>
                  </div>
                </div>
              ) : (
                /* Standard Candidate Login & Registration Form */
                <div className="candidate-login-card">
                  {/* Mode Switcher: Sign In vs Create Account */}
                  <div className="candidate-auth-toggle-tabs">
                    <button 
                      type="button" 
                      className={`candidate-toggle-tab ${authMode === 'login' ? 'active' : ''}`}
                      onClick={() => { setAuthMode('login'); setLoginError(''); setRegisterError(''); setRegisterSuccess(''); }}
                    >
                      <LogIn size={15} />
                      <span>Candidate Sign In</span>
                    </button>
                    <button 
                      type="button" 
                      className={`candidate-toggle-tab ${authMode === 'register' ? 'active' : ''}`}
                      onClick={() => { setAuthMode('register'); setLoginError(''); setRegisterError(''); setRegisterSuccess(''); }}
                    >
                      <UserPlus size={15} />
                      <span>Create Account</span>
                    </button>
                  </div>

                  {pendingApply && (
                    <div className="candidate-quick-hook">
                      <div className="quick-hook-badge">
                        <Zap size={13} />
                        <span>One-Click Apply</span>
                      </div>
                      <p className="quick-hook-text">
                        🎯 <strong>Sign in</strong> to submit your profile directly to <strong>technical leads</strong> for <em>{pendingApply.title || 'your application'}</em>.
                      </p>
                    </div>
                  )}

                  {authMode === 'login' ? (
                    <>
                      <div className="candidate-login-icon-wrap">
                        <LogIn size={24} />
                      </div>
                      <h3 className="candidate-login-title">Candidate Sign In</h3>
                      <p className="candidate-login-desc">
                        🎯 Sign in to submit your profile directly to technical leads & track status live.
                      </p>

                      {loginError && (
                        <div className="candidate-auth-error">
                          <AlertCircle size={16} style={{ flexShrink: 0 }} />
                          <span>{loginError}</span>
                        </div>
                      )}

                      <form onSubmit={handleLoginSubmit}>
                        <div className="candidate-form-group">
                          <label className="candidate-form-label">Registered Email Address</label>
                          <div className="candidate-input-wrap" style={{ marginTop: '6px' }}>
                            <Mail size={17} className="candidate-input-icon" />
                            <input 
                              type="email"
                              value={loginForm.email}
                              onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                              placeholder="Enter your email address"
                              className="candidate-input"
                              autoComplete="username"
                              required
                            />
                          </div>
                        </div>

                        <div className="candidate-form-group">
                          <div className="candidate-label-row">
                            <label className="candidate-form-label">Password</label>
                            <button 
                              type="button"
                              onClick={() => {
                                setShowForgot(true);
                                setForgotEmail(loginForm.email);
                                setForgotErr('');
                                setForgotMsg('');
                                setForgotStep('verify');
                              }}
                              className="candidate-forgot-link"
                            >
                              Forgot Password?
                            </button>
                          </div>
                          <div className="candidate-input-wrap">
                            <Lock size={17} className="candidate-input-icon" />
                            <input 
                              type="password"
                              value={loginForm.password}
                              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                              placeholder="Enter your password"
                              className="candidate-input"
                              autoComplete="current-password"
                              required
                            />
                          </div>
                        </div>

                        <button type="submit" disabled={loginLoading} className="candidate-auth-btn">
                          {loginLoading ? <RefreshCw size={16} className="spin-anim" /> : <LogIn size={16} />}
                          <span>{loginLoading ? 'Signing in…' : (pendingApply ? 'Sign In & Continue Application →' : 'Sign In to Candidate Portal')}</span>
                        </button>
                      </form>

                      <div className="candidate-auth-footer">
                        <span>New candidate to Wingroo? </span>
                        <button 
                          type="button" 
                          onClick={() => { setAuthMode('register'); setLoginError(''); }}
                          className="candidate-switch-link"
                        >
                          Create an account
                        </button>
                      </div>
                    </>
                  ) : (
                    /* Create Account Form */
                    <>
                      <div className="candidate-login-icon-wrap" style={{ background: '#ecfdf5', borderColor: '#a7f3d0', color: '#059669' }}>
                        <UserPlus size={26} />
                      </div>
                      <h3 className="candidate-login-title">Create Candidate Account</h3>
                      <p className="candidate-login-desc">
                        🎯 Create a free account in 30s to submit your profile directly to technical leads.
                      </p>

                      {registerError && (
                        <div className="candidate-auth-error">
                          <AlertCircle size={16} style={{ flexShrink: 0 }} />
                          <span>{registerError}</span>
                        </div>
                      )}

                      {registerSuccess && (
                        <div className="candidate-auth-success">
                          <CheckCircle size={16} style={{ flexShrink: 0 }} />
                          <span>{registerSuccess}</span>
                        </div>
                      )}

                      <form onSubmit={handleRegisterSubmit}>
                        {/* 2 Candidate Types Track Selection */}
                        <div className="candidate-form-group" style={{ marginBottom: '18px' }}>
                          <label className="candidate-form-label" style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span>Select Candidate Type / Track</span>
                            <span style={{ fontSize: '0.74rem', color: registerForm.candidate_type === 'PROJECT_CLIENT' ? '#7c3aed' : '#0284c7', fontWeight: 700 }}>
                              {registerForm.candidate_type === 'PROJECT_CLIENT' ? 'Project Client Track' : 'Internship & Event Track'}
                            </span>
                          </label>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                            <button
                              type="button"
                              onClick={() => setRegisterForm({ ...registerForm, candidate_type: 'PROJECT_CLIENT' })}
                              style={{
                                border: registerForm.candidate_type === 'PROJECT_CLIENT' ? '2px solid #7c3aed' : '1px solid #e2e8f0',
                                background: registerForm.candidate_type === 'PROJECT_CLIENT' ? '#faf5ff' : '#ffffff',
                                borderRadius: '12px',
                                padding: '12px 14px',
                                textAlign: 'left',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '5px'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.86rem', color: registerForm.candidate_type === 'PROJECT_CLIENT' ? '#6d28d9' : '#1e293b' }}>
                                  <Briefcase size={16} color={registerForm.candidate_type === 'PROJECT_CLIENT' ? '#7c3aed' : '#64748b'} />
                                  <span>Project Client Candidate</span>
                                </div>
                                <span style={{
                                  width: '15px',
                                  height: '15px',
                                  borderRadius: '50%',
                                  border: registerForm.candidate_type === 'PROJECT_CLIENT' ? '5px solid #7c3aed' : '2px solid #cbd5e1',
                                  background: '#fff',
                                  display: 'inline-block'
                                }} />
                              </div>
                              <span style={{ fontSize: '0.73rem', color: '#64748b', lineHeight: 1.35 }}>
                                Live client software projects, tech stack & corporate deliverables
                              </span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setRegisterForm({ ...registerForm, candidate_type: 'INTERNSHIP_EVENT' })}
                              style={{
                                border: registerForm.candidate_type === 'INTERNSHIP_EVENT' ? '2px solid #0284c7' : '1px solid #e2e8f0',
                                background: registerForm.candidate_type === 'INTERNSHIP_EVENT' ? '#f0f9ff' : '#ffffff',
                                borderRadius: '12px',
                                padding: '12px 14px',
                                textAlign: 'left',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '5px'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.86rem', color: registerForm.candidate_type === 'INTERNSHIP_EVENT' ? '#0284c7' : '#1e293b' }}>
                                  <GraduationCap size={16} color={registerForm.candidate_type === 'INTERNSHIP_EVENT' ? '#0284c7' : '#64748b'} />
                                  <span>Internship & Event Candidate</span>
                                </div>
                                <span style={{
                                  width: '15px',
                                  height: '15px',
                                  borderRadius: '50%',
                                  border: registerForm.candidate_type === 'INTERNSHIP_EVENT' ? '5px solid #0284c7' : '2px solid #cbd5e1',
                                  background: '#fff',
                                  display: 'inline-block'
                                }} />
                              </div>
                              <span style={{ fontSize: '0.73rem', color: '#64748b', lineHeight: 1.35 }}>
                                College internship programs, technical workshops & campus events
                              </span>
                            </button>
                          </div>
                        </div>

                        <div className="candidate-form-group">
                          <label className="candidate-form-label">Full Name</label>
                          <div className="candidate-input-wrap" style={{ marginTop: '6px' }}>
                            <User size={17} className="candidate-input-icon" />
                            <input 
                              type="text"
                              value={registerForm.full_name}
                              onChange={(e) => setRegisterForm({ ...registerForm, full_name: e.target.value })}
                              placeholder="Enter your full name"
                              className="candidate-input"
                              required
                            />
                          </div>
                        </div>

                        <div className="candidate-form-group">
                          <label className="candidate-form-label">Email Address</label>
                          <div className="candidate-input-wrap" style={{ marginTop: '6px' }}>
                            <Mail size={17} className="candidate-input-icon" />
                            <input 
                              type="email"
                              value={registerForm.email}
                              onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                              placeholder="Enter your email address"
                              className="candidate-input"
                              autoComplete="username"
                              required
                            />
                          </div>
                        </div>

                        <div className="row g-2" style={{ display: 'flex', gap: '10px' }}>
                          <div className="candidate-form-group" style={{ flex: 1, marginBottom: '14px' }}>
                            <label className="candidate-form-label">
                              {registerForm.candidate_type === 'PROJECT_CLIENT' ? 'Client Company / Organization' : 'College / Institute'}
                            </label>
                            <div className="candidate-input-wrap" style={{ marginTop: '6px' }}>
                              {registerForm.candidate_type === 'PROJECT_CLIENT' ? (
                                <Briefcase size={17} className="candidate-input-icon" />
                              ) : (
                                <GraduationCap size={17} className="candidate-input-icon" />
                              )}
                              <input 
                                type="text"
                                value={registerForm.college}
                                onChange={(e) => setRegisterForm({ ...registerForm, college: e.target.value })}
                                placeholder={registerForm.candidate_type === 'PROJECT_CLIENT' ? 'Enter client or company name' : 'Enter your college / institute name'}
                                className="candidate-input"
                              />
                            </div>
                          </div>

                          <div className="candidate-form-group" style={{ flex: 1, marginBottom: '14px' }}>
                            <label className="candidate-form-label">
                              {registerForm.candidate_type === 'PROJECT_CLIENT' ? 'Domain / Tech Stack' : 'Department / Stream'}
                            </label>
                            <div className="candidate-input-wrap" style={{ marginTop: '6px' }}>
                              <Sparkles size={17} className="candidate-input-icon" />
                              <input 
                                type="text"
                                value={registerForm.department}
                                onChange={(e) => setRegisterForm({ ...registerForm, department: e.target.value })}
                                placeholder={registerForm.candidate_type === 'PROJECT_CLIENT' ? 'e.g. Full Stack Web, AI/ML' : 'e.g. Computer Science, IT, ECE'}
                                className="candidate-input"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="row g-2" style={{ display: 'flex', gap: '10px' }}>
                          <div className="candidate-form-group" style={{ flex: 1, marginBottom: '14px' }}>
                            <label className="candidate-form-label">Mobile Number</label>
                            <div className="candidate-input-wrap" style={{ marginTop: '6px' }}>
                              <Phone size={17} className="candidate-input-icon" />
                              <input 
                                type="tel"
                                value={registerForm.phone}
                                onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                                placeholder="Enter your mobile number"
                                className="candidate-input"
                              />
                            </div>
                          </div>

                          <div className="candidate-form-group" style={{ flex: 1, marginBottom: '14px' }}>
                            <label className="candidate-form-label">
                              {registerForm.candidate_type === 'PROJECT_CLIENT' ? 'Project Role / Track' : 'Course / Degree'}
                            </label>
                            <div className="candidate-input-wrap" style={{ marginTop: '6px' }}>
                              <FileText size={17} className="candidate-input-icon" />
                              <input 
                                type="text"
                                value={registerForm.course}
                                onChange={(e) => setRegisterForm({ ...registerForm, course: e.target.value })}
                                placeholder={registerForm.candidate_type === 'PROJECT_CLIENT' ? 'e.g. Client Project Intern' : 'e.g. B.E, B.Tech, MCA'}
                                className="candidate-input"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="candidate-form-group">
                          <label className="candidate-form-label">Password (min 6 characters)</label>
                          <div className="candidate-input-wrap" style={{ marginTop: '6px' }}>
                            <Lock size={17} className="candidate-input-icon" />
                            <input 
                              type="password"
                              value={registerForm.password}
                              onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                              placeholder="Enter your password"
                              className="candidate-input"
                              autoComplete="new-password"
                              required
                            />
                          </div>
                        </div>

                        <div className="candidate-form-group">
                          <label className="candidate-form-label">Confirm Password</label>
                          <div className="candidate-input-wrap" style={{ marginTop: '6px' }}>
                            <Lock size={17} className="candidate-input-icon" />
                            <input 
                              type="password"
                              value={registerForm.confirm_password}
                              onChange={(e) => setRegisterForm({ ...registerForm, confirm_password: e.target.value })}
                              placeholder="Confirm your password"
                              className="candidate-input"
                              autoComplete="new-password"
                              required
                            />
                          </div>
                        </div>

                        <button type="submit" disabled={registerLoading} className="candidate-auth-btn">
                          {registerLoading ? <RefreshCw size={16} className="spin-anim" /> : <UserPlus size={16} />}
                          <span>{registerLoading ? 'Creating Account…' : (pendingApply ? 'Create Account & Continue Application →' : 'Create Candidate Account')}</span>
                        </button>
                      </form>

                      <div className="candidate-auth-footer">
                        <span>Already have an account? </span>
                        <button 
                          type="button" 
                          onClick={() => { setAuthMode('login'); setRegisterError(''); }}
                          className="candidate-switch-link"
                        >
                          Sign In
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* ========================================================= */
            /* 2. LOGGED IN: SHOW CANDIDATE DETAILS, APPLICATIONS & PASSES*/
            /* ========================================================= */
            <>
              {/* Candidate Logged-In Session Strip */}
              <div className="candidate-session-bar">
                <div className="candidate-session-info">
                  <div className="candidate-session-avatar">
                    {currentUser.full_name?.slice(0, 2).toUpperCase() || 'CD'}
                  </div>
                  <div>
                    <div className="candidate-session-name" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span>{currentUser.full_name}</span>
                      <span style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '12px',
                        background: currentUser.candidate_type === 'PROJECT_CLIENT' ? '#f3e8ff' : '#e0f2fe',
                        color: currentUser.candidate_type === 'PROJECT_CLIENT' ? '#7c3aed' : '#0284c7',
                        border: `1px solid ${currentUser.candidate_type === 'PROJECT_CLIENT' ? '#d8b4fe' : '#bae6fd'}`
                      }}>
                        {currentUser.candidate_type_display || (currentUser.candidate_type === 'PROJECT_CLIENT' ? 'Project Client Candidate' : 'Internship & Event Candidate')}
                      </span>
                    </div>
                    <div className="candidate-session-email">
                      {currentUser.email} • Candidate Account Active
                    </div>
                  </div>
                </div>

                <button type="button" onClick={handleSignOut} className="candidate-signout-btn" title="Sign out of your account">
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </div>

              {/* Lookup / Search Bar for logged-in user */}
              <div className="student-search-card">
                <div className="search-caption">
                  <Sparkles size={16} style={{ color: '#0284c7' }} />
                  <span>
                    {activeTab === 'internship'
                      ? 'Track Internship Application Status & Download Official Slip'
                      : 'Track Event Registration Status & Download Verified Entry Pass'}
                  </span>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); fetchStudentApplications(searchQuery); }} className="student-search-form">
                  <div className="search-input-wrap">
                    <Search size={18} className="search-field-icon" />
                    <input 
                      type="text" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Lookup by Email, Phone, or Application / Registration #"
                      className="student-search-input"
                    />
                  </div>
                  <button type="submit" disabled={trackLoading} className="student-search-btn">
                    <span>{trackLoading ? 'Searching…' : 'Search Records'}</span>
                    <ArrowRight size={16} />
                  </button>
                </form>
                {trackErrorMsg && (
                  <div className="student-search-error">
                    <AlertCircle size={15} />
                    <span>{trackErrorMsg}</span>
                  </div>
                )}
              </div>

              {/* Loading State */}
              {trackLoading && (
                <div className="student-loading-state">
                  <RefreshCw size={28} className="spin-anim" />
                  <p>Fetching your application details and real-time review status…</p>
                </div>
              )}

              {/* Searched Results View */}
              {!trackLoading && (
                <>
                  {/* Profile Summary Strip */}
                  {applicantProfile && (
                    <div className="student-profile-strip">
                      <div className="student-avatar-big">
                        {applicantProfile.name?.slice(0, 2).toUpperCase() || 'CD'}
                      </div>
                      <div className="student-profile-info">
                        <div className="student-full-name">{applicantProfile.name}</div>
                        <div className="student-sub-detail">
                          {applicantProfile.college || 'Candidate'} {applicantProfile.course ? `• ${applicantProfile.course}` : ''}
                        </div>
                        <div className="student-contact-chips">
                          {applicantProfile.email && (
                            <span className="contact-chip">
                              <Mail size={12} />
                              <span>{applicantProfile.email}</span>
                            </span>
                          )}
                          {applicantProfile.phone && (
                            <span className="contact-chip">
                              <Phone size={12} />
                              <span>{applicantProfile.phone}</span>
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="student-apps-count">
                        <span className="count-num">
                          {activeTab === 'internship' ? applications.length : eventRegistrations.length}
                        </span>
                        <span className="count-text">
                          {activeTab === 'internship' ? 'Applications' : 'Registrations'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* 1. Internship Apply Results */}
                  {activeTab === 'internship' && (
                    <div>
                      {applications.length > 0 ? (
                        <div className="student-apps-list">
                          {applications.map((app) => (
                            <div key={app.id} className="student-app-card">
                              <div className="app-card-top">
                                <div className="app-id-pill">
                                  <FileText size={14} />
                                  <span>{app.application_no}</span>
                                </div>
                                <div className="app-date-meta">
                                  <Calendar size={13} />
                                  <span>Applied on {app.created_at ? app.created_at.slice(0, 10) : 'Recently'}</span>
                                </div>
                                <span className={`status-pill ${
                                  app.status === 'Approved' || app.status === 'Selected' ? 'badge-selected' :
                                  app.status === 'Shortlisted' ? 'badge-shortlist' :
                                  app.status === 'Rejected' ? 'badge-rejected' : 'badge-review'
                                }`}>
                                  {app.status || 'Under Review'}
                                </span>
                              </div>

                              <div className="app-program-row">
                                <div>
                                  <div className="program-title">{app.technology || 'Full Stack Development'}</div>
                                  <div className="program-type">{app.internship_type || 'Internship'} • {app.college}</div>
                                </div>
                                <button 
                                  type="button"
                                  onClick={() => setActiveSlip(app)} 
                                  className="btn-print-slip"
                                  title="Print Official Slip"
                                >
                                  <Printer size={15} />
                                  <span>Print Application Slip</span>
                                </button>
                              </div>

                              {/* 4-Stage Stepper */}
                              <div className="app-stepper-wrap">
                                <div className="stepper-title">Application Progress Tracking</div>
                                <div className="app-stepper">
                                  {[
                                    { key: 'Submitted', label: 'Submitted' },
                                    { key: 'Review', label: 'Under Review' },
                                    { key: 'Shortlisted', label: 'Shortlisted' },
                                    { key: 'Approved', label: 'Offer Confirmed' }
                                  ].map((step, idx) => {
                                    const currentStatus = app.status || 'Under Review';
                                    const isDone = 
                                      idx === 0 || 
                                      (idx === 1 && currentStatus !== 'Rejected') ||
                                      (idx === 2 && (currentStatus === 'Shortlisted' || currentStatus === 'Approved' || currentStatus === 'Selected')) ||
                                      (idx === 3 && (currentStatus === 'Approved' || currentStatus === 'Selected'));

                                    return (
                                      <React.Fragment key={step.key}>
                                        <div className={`step-node ${isDone ? 'step-done' : ''}`}>
                                          <div className="step-circle">{isDone ? <Check size={13} /> : idx + 1}</div>
                                          <div className="step-label">{step.label}</div>
                                        </div>
                                        {idx < 3 && <div className={`step-line ${isDone ? 'line-done' : ''}`} />}
                                      </React.Fragment>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="student-not-found-card">
                          <GraduationCap size={36} style={{ color: '#94a3b8', margin: '0 auto 12px auto' }} />
                          <h4>No Internship Applications Found</h4>
                          <p>
                            We could not find any internship applications registered with your account.
                            If you registered for an event instead, check the <strong>Events Apply</strong> tab above.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 2. Events Apply Results */}
                  {activeTab === 'events' && (
                    <div>
                      {eventRegistrations.length > 0 ? (
                        <div className="student-apps-list">
                          {eventRegistrations.map((ev) => (
                            <div key={ev.id} className="student-app-card" style={{ borderLeft: '4px solid #0284c7' }}>
                              <div className="app-card-top">
                                <div className="app-id-pill" style={{ background: 'rgba(2, 132, 199, 0.1)', color: '#0284c7', borderColor: '#bae6fd' }}>
                                  <Award size={14} />
                                  <span>{ev.registration_no}</span>
                                </div>
                                <div className="app-date-meta">
                                  <Calendar size={13} />
                                  <span>Registered on {ev.created_at ? ev.created_at.slice(0, 10) : 'Recently'}</span>
                                </div>
                                <span className="status-pill badge-selected">
                                  {ev.status || 'Confirmed'}
                                </span>
                              </div>

                              <div className="app-program-row">
                                <div>
                                  <div className="program-title">{ev.event_title}</div>
                                  <div className="program-type">Attendee: {ev.name} • {ev.college} {ev.year ? `(${ev.year})` : ''}</div>
                                </div>
                                <button 
                                  type="button"
                                  onClick={() => setActivePass(ev)} 
                                  className="btn-print-slip"
                                  style={{ background: 'linear-gradient(135deg, #0284c7, #0369a1)', color: '#fff', borderColor: 'transparent' }}
                                  title="View & Print Official Event Pass"
                                >
                                  <Award size={15} />
                                  <span>View & Print Pass</span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="student-not-found-card">
                          <Calendar size={36} style={{ color: '#94a3b8', margin: '0 auto 12px auto' }} />
                          <h4>No Event Registrations Found</h4>
                          <p>
                            We could not find any event passes registered with your account.
                            If you submitted an internship application instead, check the <strong>Internship Apply</strong> tab above.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* Certificate & Verification Portal Redirect Banner */}
          <div className="portal-redirect-banner">
            <div className="portal-redirect-left">
              <ShieldCheck size={22} style={{ color: '#0284c7', flexShrink: 0 }} />
              <div>
                <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>Looking for Certificate Verification or Candidate Credential Account?</strong>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Certificate verification, candidate login & credential registration are hosted in the Certification Portal.</div>
              </div>
            </div>
            <a 
              href="/internship" 
              className="portal-redirect-btn"
            >
              <span>Go to Certificate & Verification Portal</span>
              <ExternalLink size={13} />
            </a>
          </div>
        </div>
      </div>

      {/* Printable Slip Popup Modal for Internship Application */}
      {activeSlip && (
        <div className="slip-modal-overlay" onClick={() => setActiveSlip(null)}>
          <div className="slip-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="slip-modal-header no-print">
              <span>Official Internship Application Receipt</span>
              <div className="slip-header-actions">
                <button 
                  type="button" 
                  onClick={() => window.print()} 
                  className="slip-print-btn"
                >
                  <Printer size={14} />
                  <span>Print Slip</span>
                </button>
                <button type="button" onClick={() => setActiveSlip(null)} className="slip-close-btn">
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="slip-document-sheet" id="printable-slip">
              <div className="slip-doc-header">
                <div>
                  <div className="doc-brand">WINGROO TECHNOLOGIES</div>
                  <div className="doc-sub">Software & Web Development • Digital Innovation Center</div>
                  <div className="doc-sub">Coimbatore, Tamil Nadu, India</div>
                </div>
                <div className="doc-app-stamp">
                  <div className="doc-stamp-title">APPLICATION NUMBER</div>
                  <div className="doc-stamp-no">{activeSlip.application_no}</div>
                </div>
              </div>

              <div className="doc-divider" />

              <div className="doc-grid-info">
                <div className="doc-info-item">
                  <span className="doc-info-label">Candidate Name</span>
                  <span className="doc-info-val">{activeSlip.name}</span>
                </div>
                <div className="doc-info-item">
                  <span className="doc-info-label">Current Status</span>
                  <span className="doc-info-val status-highlight">{activeSlip.status || 'Under Review'}</span>
                </div>
                <div className="doc-info-item">
                  <span className="doc-info-label">Email Address</span>
                  <span className="doc-info-val">{activeSlip.email}</span>
                </div>
                <div className="doc-info-item">
                  <span className="doc-info-label">Phone Number</span>
                  <span className="doc-info-val">{activeSlip.phone}</span>
                </div>
                <div className="doc-info-item">
                  <span className="doc-info-label">College / Institute</span>
                  <span className="doc-info-val">{activeSlip.college}</span>
                </div>
                <div className="doc-info-item">
                  <span className="doc-info-label">Course & Year</span>
                  <span className="doc-info-val">{activeSlip.course} {activeSlip.year ? `(${activeSlip.year})` : ''}</span>
                </div>
                <div className="doc-info-item">
                  <span className="doc-info-label">Domain / Technology</span>
                  <span className="doc-info-val">{activeSlip.technology || 'Full Stack Development'}</span>
                </div>
                <div className="doc-info-item">
                  <span className="doc-info-label">Internship Program</span>
                  <span className="doc-info-val">{activeSlip.internship_type || 'Short Term Internship'}</span>
                </div>
              </div>

              <div className="doc-verification-seal-row">
                <div className="doc-seal-box">
                  <ShieldCheck size={28} style={{ color: '#10b981' }} />
                  <div>
                    <div className="seal-title">OFFICIALLY REGISTERED APPLICANT</div>
                    <div className="seal-sub">Valid for interview & cohort verification at Wingroo Tech Hub</div>
                  </div>
                </div>
                <div className="doc-sign-area">
                  <div className="sign-line" />
                  <div className="sign-title">Academic Operations Desk</div>
                  <div className="sign-sub">Wingroo Technologies</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Printable Event Pass Modal */}
      {activePass && (
        <div className="slip-modal-overlay" onClick={() => setActivePass(null)}>
          <div className="slip-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="slip-modal-header no-print">
              <span>Official Event Entry Pass</span>
              <div className="slip-header-actions">
                <button 
                  type="button" 
                  onClick={() => window.print()} 
                  className="slip-print-btn"
                >
                  <Printer size={14} />
                  <span>Print Pass</span>
                </button>
                <button type="button" onClick={() => setActivePass(null)} className="slip-close-btn">
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="slip-document-sheet" id="printable-event-pass">
              <div className="slip-doc-header">
                <div>
                  <div className="doc-brand">WINGROO TECHNOLOGIES</div>
                  <div className="doc-sub">Official Event Participant Badge & Entry Pass</div>
                  <div className="doc-sub">Coimbatore, Tamil Nadu, India</div>
                </div>
                <div className="doc-app-stamp" style={{ borderColor: '#0ea5e9', background: '#f0f9ff' }}>
                  <div className="doc-stamp-title" style={{ color: '#0284c7' }}>REGISTRATION NUMBER</div>
                  <div className="doc-stamp-no">{activePass.registration_no}</div>
                </div>
              </div>

              <div className="doc-divider" />

              <div className="doc-grid-info">
                <div className="doc-info-item">
                  <span className="doc-info-label">Event Name</span>
                  <span className="doc-info-val status-highlight">{activePass.event_title}</span>
                </div>
                <div className="doc-info-item">
                  <span className="doc-info-label">Registration Status</span>
                  <span className="doc-info-val" style={{ color: '#16a34a' }}>{activePass.status || 'Confirmed'}</span>
                </div>
                <div className="doc-info-item">
                  <span className="doc-info-label">Attendee Name</span>
                  <span className="doc-info-val">{activePass.name}</span>
                </div>
                <div className="doc-info-item">
                  <span className="doc-info-label">Email Address</span>
                  <span className="doc-info-val">{activePass.email}</span>
                </div>
                <div className="doc-info-item">
                  <span className="doc-info-label">Phone Number</span>
                  <span className="doc-info-val">{activePass.phone}</span>
                </div>
                <div className="doc-info-item">
                  <span className="doc-info-label">College / Organization</span>
                  <span className="doc-info-val">{activePass.college} {activePass.year ? `(${activePass.year})` : ''}</span>
                </div>
              </div>

              <div className="doc-verification-seal-row">
                <div className="doc-seal-box">
                  <Award size={28} style={{ color: '#0284c7' }} />
                  <div>
                    <div className="seal-title">CONFIRMED EVENT PARTICIPANT</div>
                    <div className="seal-sub">Valid for entry at Wingroo Tech Hub & Partner Venues</div>
                  </div>
                </div>
                <div className="doc-sign-area">
                  <div className="sign-line" />
                  <div className="sign-title">Event Operations Desk</div>
                  <div className="sign-sub">Wingroo Technologies</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
