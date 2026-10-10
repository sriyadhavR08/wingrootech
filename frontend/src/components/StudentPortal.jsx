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
  PlusCircle,
  Send,
  PhoneCall
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
  const [canForceLogin, setCanForceLogin] = useState(false);

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

  // Tabs: 'internship' (Internship Apply) | 'events' (Events Apply) | 'projects' (Project Client Requests) | 'new_project'
  const [activeTab, setActiveTab] = useState('internship');

  const [searchQuery, setSearchQuery] = useState(() => {
    return initialQuery || sessionStorage.getItem('wingroo_student_lookup') || '';
  });
  const [applications, setApplications] = useState([]);
  const [eventRegistrations, setEventRegistrations] = useState([]);
  const [projectRequests, setProjectRequests] = useState([]);
  const [newProjectForm, setNewProjectForm] = useState({ subject: 'Web Application Development', message: '', phone: '' });
  const [newProjectSubmitting, setNewProjectSubmitting] = useState(false);
  const [newProjectSuccess, setNewProjectSuccess] = useState('');
  const [newProjectError, setNewProjectError] = useState('');
  const [selectedProjectSlip, setSelectedProjectSlip] = useState(null);

  const isProjectClient = currentUser?.candidate_type === 'PROJECT_CLIENT';

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

  // Switch tab automatically based on candidate type
  useEffect(() => {
    if (currentUser?.candidate_type === 'PROJECT_CLIENT') {
      setActiveTab('projects');
    } else {
      setActiveTab('internship');
    }
  }, [currentUser?.candidate_type]);

  // Live reload whenever contact or project inquiry is submitted anywhere
  useEffect(() => {
    const handleDataChange = () => {
      if (currentUser?.email) {
        fetchStudentApplications(currentUser.email);
      }
    };
    window.addEventListener('wingroo_data_changed', handleDataChange);
    return () => window.removeEventListener('wingroo_data_changed', handleDataChange);
  }, [currentUser?.email]);

  // When modal opens or user logs in, automatically fetch records if user is logged in
  useEffect(() => {
    if (isOpen) {
      if (sessionStorage.getItem('wingroo_open_register_tab') === 'true') {
        sessionStorage.removeItem('wingroo_open_register_tab');
        setAuthMode('register');
      }
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

  const handleLoginSubmit = async (e, forceLogin = false) => {
    if (e && e.preventDefault) e.preventDefault();
    setLoginError('');
    setCanForceLogin(false);
    setLoginLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginForm.email.trim(),
          password: loginForm.password,
          force_login: forceLogin
        })
      });
      const data = await res.json();
      if (res.ok && data.user) {
        sessionStorage.setItem('wingroo_student_user', JSON.stringify(data.user));
        localStorage.setItem('wingroo_student_user', JSON.stringify(data.user));
        if (data.access && data.refresh) {
          const tokenObj = { access: data.access, refresh: data.refresh };
          sessionStorage.setItem('tokens', JSON.stringify(tokenObj));
          localStorage.setItem('tokens', JSON.stringify(tokenObj));
          sessionStorage.setItem('wingroo_student_tokens', JSON.stringify(tokenObj));
        }
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
        if (data.code === 'CONCURRENT_LOGIN_BLOCKED' || data.can_force) {
          setCanForceLogin(true);
        }
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
        localStorage.setItem('wingroo_student_user', JSON.stringify(data.user));
        if (data.access && data.refresh) {
          const tokenObj = { access: data.access, refresh: data.refresh };
          sessionStorage.setItem('tokens', JSON.stringify(tokenObj));
          localStorage.setItem('tokens', JSON.stringify(tokenObj));
          sessionStorage.setItem('wingroo_student_tokens', JSON.stringify(tokenObj));
        }
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
    try {
      if (currentUser?.email) {
        fetch(`${API_BASE}/api/auth/logout/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: currentUser.email })
        }).catch(() => {});
      }
    } catch {}
    sessionStorage.removeItem('wingroo_student_user');
    localStorage.removeItem('wingroo_student_user');
    sessionStorage.removeItem('tokens');
    localStorage.removeItem('tokens');
    sessionStorage.removeItem('wingroo_student_tokens');
    window.dispatchEvent(new CustomEvent('wingroo_student_logged_out'));
    window.dispatchEvent(new Event('wingroo_auth_state_changed'));
    window.dispatchEvent(new Event('session-ended'));
    setCurrentUser(null);
    setApplications([]);
    setEventRegistrations([]);
    setProjectRequests([]);
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
        const prjReqs = Array.isArray(data.project_requests) ? data.project_requests : [];
        setApplications(apps);
        setEventRegistrations(evRegs);
        setProjectRequests(prjReqs);
        if (apps.length > 0 || evRegs.length > 0 || prjReqs.length > 0) {
          sessionStorage.setItem('wingroo_student_lookup', q);
          if (currentUser?.candidate_type === 'PROJECT_CLIENT') {
            setActiveTab('projects');
          } else if (apps.length === 0 && evRegs.length > 0) {
            setActiveTab('events');
          } else if (apps.length > 0) {
            setActiveTab('internship');
          }
        } else {
          setTrackErrorMsg(
            currentUser?.candidate_type === 'PROJECT_CLIENT'
              ? 'No project requests found for this account.'
              : (data.message || 'No applications or event registrations found for this account.')
          );
        }
      } else {
        setApplications([]);
        setEventRegistrations([]);
        setProjectRequests([]);
        setTrackErrorMsg(data.message || 'No records found.');
      }
    } catch {
      setSearched(true);
      setTrackErrorMsg('Failed to connect to candidate server. Please check your connection.');
      setApplications([]);
      setEventRegistrations([]);
      setProjectRequests([]);
    } finally {
      setTrackLoading(false);
    }
  };

  const handleNewProjectSubmit = async (e) => {
    e.preventDefault();
    if (!newProjectForm.message.trim()) {
      setNewProjectError('Please describe your project requirements.');
      return;
    }

    setNewProjectSubmitting(true);
    setNewProjectError('');
    setNewProjectSuccess('');

    try {
      const res = await fetch(`${API_BASE}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: currentUser?.full_name || 'Project Client',
          email: currentUser?.email || '',
          phone: newProjectForm.phone || currentUser?.phone || '',
          subject: newProjectForm.subject || 'Project Inquiry',
          message: newProjectForm.message
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setNewProjectSuccess(`Project request submitted successfully! Ref: ${data.request_no || 'Recorded'}`);
        setNewProjectForm({ subject: 'Web Application Development', message: '', phone: '' });
        window.dispatchEvent(new CustomEvent('wingroo_data_changed'));
        if (currentUser?.email) {
          fetchStudentApplications(currentUser.email);
        }
        setTimeout(() => {
          setActiveTab('projects');
          setNewProjectSuccess('');
        }, 1200);
      } else {
        setNewProjectError(data.message || 'Failed to submit request.');
      }
    } catch {
      setNewProjectError('Failed to connect to server. Please try again.');
    } finally {
      setNewProjectSubmitting(false);
    }
  };

  const getApplicantProfile = () => {
    if (isProjectClient) {
      return {
        name: currentUser?.full_name || (projectRequests[0]?.name) || 'Project Client',
        email: currentUser?.email || (projectRequests[0]?.email) || '',
        phone: currentUser?.phone || (projectRequests[0]?.phone) || '',
        college: 'Project Client Partner',
        course: 'Custom Software & Web Engineering'
      };
    }
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
            {isProjectClient ? (
              <>
                <button 
                  type="button"
                  className={`student-nav-tab ${activeTab === 'projects' ? 'active' : ''}`}
                  onClick={() => setActiveTab('projects')}
                >
                  <Briefcase size={16} />
                  <span>Project Requests</span>
                  {projectRequests.length > 0 && (
                    <span className="live-pill" style={{ background: '#7c3aed', color: '#fff' }}>
                      {projectRequests.length}
                    </span>
                  )}
                </button>

                <button 
                  type="button"
                  className={`student-nav-tab ${activeTab === 'new_project' ? 'active' : ''}`}
                  onClick={() => setActiveTab('new_project')}
                >
                  <PlusCircle size={16} />
                  <span>Submit Project Request</span>
                </button>
              </>
            ) : (
              <>
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
              </>
            )}
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
                    <div className="candidate-pending-banner">
                      <div className="pending-banner-icon">
                        <Lock size={18} />
                      </div>
                      <div className="pending-banner-body">
                        <div className="pending-banner-heading">Login Required to Apply</div>
                        <div className="pending-banner-text">
                          <div style={{ color: '#1e293b', fontWeight: 600, fontSize: '0.85rem' }}>
                            ⚡ Sign in in 30 seconds to get direct technical mentor review & live tracking for {pendingApply.title || 'your application'}!
                          </div>
                          <div style={{ color: '#0284c7', fontWeight: 600, marginTop: '3px', fontSize: '0.81rem' }}>
                            ✓ Your application form will open automatically once signed in.
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {authMode === 'login' ? (
                    <>
                      <div className="candidate-login-icon-wrap">
                        <LogIn size={26} />
                      </div>
                      <h3 className="candidate-login-title">Candidate Sign In</h3>
                      <p className="candidate-login-desc">
                        Sign in to view your internship applications, review statuses, and download official event passes.
                      </p>

                      {loginError && (
                        <div className="candidate-auth-error" style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start' }}>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                            <span>{loginError}</span>
                          </div>
                          {canForceLogin && (
                            <button
                              type="button"
                              onClick={() => handleLoginSubmit(null, true)}
                              disabled={loginLoading}
                              style={{
                                background: '#dc2626',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '6px 14px',
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                marginTop: '4px',
                                alignSelf: 'flex-start',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                            >
                              <span>Sign Out Other Session & Log In Here</span>
                              <ArrowRight size={14} />
                            </button>
                          )}
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
                          <span>{loginLoading ? 'Signing in…' : 'Sign In to Candidate Portal'}</span>
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
                        Create your account to submit and track internships, view passes, and earn verified certificates.
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
                          <span>{registerLoading ? 'Creating Account…' : 'Create Candidate Account'}</span>
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

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {isProjectClient ? (
                    <button
                      type="button"
                      onClick={() => setActiveTab('new_project')}
                      className="candidate-portal-btn"
                      title="Submit a new project inquiry or requirement"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: '#f3e8ff',
                        color: '#7c3aed',
                        border: '1px solid #d8b4fe',
                        padding: '7px 14px',
                        borderRadius: '10px',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <PlusCircle size={15} />
                      <span>Request New Project</span>
                    </button>
                  ) : (
                    <a
                      href="/internship/student/dashboard"
                      className="candidate-portal-btn"
                      title="Open your Internship Workspace"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: '#eff6ff',
                        color: '#2563eb',
                        border: '1px solid #bfdbfe',
                        padding: '7px 14px',
                        borderRadius: '10px',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        textDecoration: 'none',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <GraduationCap size={15} />
                      <span>Internship Portal &rarr;</span>
                    </a>
                  )}

                  <button type="button" onClick={handleSignOut} className="candidate-signout-btn" title="Sign out of your account">
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>

              {/* Lookup / Search Bar for logged-in user */}
              <div className="student-search-card">
                <div className="search-caption">
                  <Sparkles size={16} style={{ color: isProjectClient ? '#7c3aed' : '#0284c7' }} />
                  <span>
                    {isProjectClient
                      ? 'Track Client Project Requests, Requirements & Development Status'
                      : activeTab === 'internship'
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
                      placeholder={
                        isProjectClient 
                          ? "Lookup by Email, Phone, or Project Request Ref # (e.g. WINGROO-PRJ-0001)" 
                          : "Lookup by Email, Phone, or Application / Registration #"
                      }
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
                  <p>{isProjectClient ? 'Fetching your project requests and development status…' : 'Fetching your application details and real-time review status…'}</p>
                </div>
              )}

              {/* Searched Results View */}
              {!trackLoading && (
                <>
                  {/* Profile Summary Strip */}
                  {applicantProfile && (
                    <div className="student-profile-strip">
                      <div className="student-avatar-big" style={isProjectClient ? { background: 'linear-gradient(135deg, #7c3aed, #a855f7)' } : {}}>
                        {applicantProfile.name?.slice(0, 2).toUpperCase() || (isProjectClient ? 'PC' : 'CD')}
                      </div>
                      <div className="student-profile-info">
                        <div className="student-full-name">{applicantProfile.name}</div>
                        <div className="student-sub-detail">
                          {applicantProfile.college || (isProjectClient ? 'Project Client Partner' : 'Candidate')} {applicantProfile.course ? `• ${applicantProfile.course}` : ''}
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
                        <span className="count-num" style={isProjectClient ? { color: '#7c3aed' } : {}}>
                          {isProjectClient ? projectRequests.length : (activeTab === 'internship' ? applications.length : eventRegistrations.length)}
                        </span>
                        <span className="count-text">
                          {isProjectClient ? 'Project Requests' : (activeTab === 'internship' ? 'Applications' : 'Registrations')}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* ========================================================= */}
                  {/* A. PROJECT CLIENT VIEWS (PROJECTS & NEW PROJECT REQUEST)  */}
                  {/* ========================================================= */}
                  {isProjectClient && (
                    <>
                      {/* 1. Projects Request List View */}
                      {activeTab === 'projects' && (
                        <div>
                          {projectRequests.length > 0 ? (
                            <div className="student-apps-list">
                              {projectRequests.map((req) => (
                                <div key={req.id} className="student-app-card" style={{ borderLeft: '4px solid #7c3aed' }}>
                                  <div className="app-card-top">
                                    <div className="app-id-pill" style={{ background: 'rgba(124, 58, 237, 0.1)', color: '#7c3aed', borderColor: '#d8b4fe' }}>
                                      <Briefcase size={14} />
                                      <span>{req.request_no}</span>
                                    </div>
                                    <div className="app-date-meta">
                                      <Calendar size={13} />
                                      <span>Submitted on {req.created_at ? req.created_at.slice(0, 10) : 'Recently'}</span>
                                    </div>
                                    <span className="status-pill" style={{
                                      background: req.status === 'Completed' ? '#dcfce7' : req.status === 'In Progress' ? '#f3e8ff' : '#eff6ff',
                                      color: req.status === 'Completed' ? '#15803d' : req.status === 'In Progress' ? '#7c3aed' : '#2563eb',
                                      borderColor: req.status === 'Completed' ? '#86efac' : req.status === 'In Progress' ? '#d8b4fe' : '#bfdbfe'
                                    }}>
                                      {req.status || 'Under Review'}
                                    </span>
                                  </div>

                                  <div className="app-program-row">
                                    <div>
                                      <div className="program-title" style={{ color: '#1e293b', fontSize: '1.1rem', fontWeight: 700 }}>
                                        {req.subject || 'Custom Project Inquiry'}
                                      </div>
                                      <div className="program-type" style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '2px' }}>
                                        Client: {req.name} {req.phone ? `• ${req.phone}` : ''}
                                      </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                      <a
                                        href={`https://wa.me/917418579998?text=Hello%20Wingroo%20Team%2C%20following%20up%20on%20Project%20Request%20${encodeURIComponent(req.request_no)}%20(${encodeURIComponent(req.subject || 'Project')})`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn-print-slip"
                                        style={{ color: '#16a34a', borderColor: '#bbf7d0', background: '#f0fdf4' }}
                                      >
                                        <span>Chat with Lead Engineer</span>
                                      </a>
                                      <button 
                                        type="button"
                                        onClick={() => setSelectedProjectSlip(req)} 
                                        className="btn-print-slip"
                                        title="Print Project Request Receipt"
                                      >
                                        <Printer size={15} />
                                        <span>Print Project Slip</span>
                                      </button>
                                    </div>
                                  </div>

                                  {/* Project Scope / Description */}
                                  <div style={{
                                    background: '#f8fafc',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '10px',
                                    padding: '14px 16px',
                                    marginTop: '12px',
                                    fontSize: '0.88rem',
                                    color: '#334155',
                                    lineHeight: '1.6'
                                  }}>
                                    <strong style={{ color: '#0f172a', display: 'block', marginBottom: '4px', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                      Project Requirements & Specifications:
                                    </strong>
                                    {req.message}
                                  </div>

                                  {/* 5-Stage Stepper for Client Projects */}
                                  <div className="app-stepper-wrap" style={{ marginTop: '18px' }}>
                                    <div className="stepper-title">Development & Lifecycle Tracking</div>
                                    <div className="app-stepper">
                                      {[
                                        { key: 'Received', label: 'Inquiry Received' },
                                        { key: 'Review', label: 'Tech Review' },
                                        { key: 'Discussion', label: 'Scope & Proposal' },
                                        { key: 'Development', label: 'In Development' },
                                        { key: 'Delivered', label: 'Delivered' }
                                      ].map((step, idx) => {
                                        const st = req.status || 'Under Review';
                                        const isDone = 
                                          idx === 0 ||
                                          (idx === 1 && st !== 'Cancelled') ||
                                          (idx === 2 && (st === 'In Discussion' || st === 'Proposal Sent' || st === 'In Progress' || st === 'Completed')) ||
                                          (idx === 3 && (st === 'In Progress' || st === 'Completed')) ||
                                          (idx === 4 && st === 'Completed');

                                        return (
                                          <React.Fragment key={step.key}>
                                            <div className={`step-node ${isDone ? 'step-done' : ''}`}>
                                              <div className="step-circle" style={isDone ? { background: '#7c3aed', color: '#fff' } : {}}>
                                                {isDone ? <Check size={13} /> : idx + 1}
                                              </div>
                                              <div className="step-label">{step.label}</div>
                                            </div>
                                            {idx < 4 && <div className={`step-line ${isDone ? 'line-done' : ''}`} style={isDone ? { borderColor: '#7c3aed' } : {}} />}
                                          </React.Fragment>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="student-not-found-card" style={{ borderColor: '#e9d5ff', background: '#faf5ff' }}>
                              <Briefcase size={38} style={{ color: '#a855f7', margin: '0 auto 12px auto' }} />
                              <h4 style={{ color: '#581c87' }}>No Project Requests Found Yet</h4>
                              <p style={{ color: '#7e22ce' }}>
                                You haven't submitted any client project inquiries yet. You can submit your requirements right here or through the main website contact form!
                              </p>
                              <button
                                type="button"
                                onClick={() => setActiveTab('new_project')}
                                className="btn btn-primary"
                                style={{ margin: '14px auto 0 auto', background: '#7c3aed', borderColor: '#7c3aed' }}
                              >
                                <PlusCircle size={16} />
                                <span>Submit Your Project Requirements</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* 2. Submit New Project Request Tab View */}
                      {activeTab === 'new_project' && (
                        <div className="student-app-card" style={{ border: '1px solid #e9d5ff', background: '#ffffff', padding: '24px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#f3e8ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Briefcase size={20} />
                            </div>
                            <div>
                              <h4 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a', fontWeight: 700 }}>Submit New Project Request</h4>
                              <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>Provide your technical specifications or project idea. Our lead engineers will review and reach out.</p>
                            </div>
                          </div>

                          {newProjectSuccess && (
                            <div className="candidate-auth-success" style={{ marginBottom: '16px' }}>
                              <CheckCircle size={16} style={{ flexShrink: 0 }} />
                              <span>{newProjectSuccess}</span>
                            </div>
                          )}

                          {newProjectError && (
                            <div className="candidate-auth-error" style={{ marginBottom: '16px' }}>
                              <AlertCircle size={16} style={{ flexShrink: 0 }} />
                              <span>{newProjectError}</span>
                            </div>
                          )}

                          <form onSubmit={handleNewProjectSubmit}>
                            <div className="candidate-form-group">
                              <label className="candidate-form-label">Project Domain / Service Type *</label>
                              <select 
                                value={newProjectForm.subject}
                                onChange={(e) => setNewProjectForm(prev => ({ ...prev, subject: e.target.value }))}
                                className="candidate-input"
                                style={{ marginTop: '6px' }}
                                required
                              >
                                <option value="Web Application Development">Full Stack Web Application</option>
                                <option value="Mobile App Development">Mobile App (iOS / Android / Flutter)</option>
                                <option value="Enterprise Software Solution">Enterprise Software Solution</option>
                                <option value="AI & Machine Learning Solution">AI & Machine Learning Solution</option>
                                <option value="Cloud Architecture & API">Cloud Architecture & Custom API</option>
                                <option value="UI/UX & Frontend Engineering">UI/UX Design & Frontend Engineering</option>
                                <option value="Other Project Inquiry">Other Custom Project</option>
                              </select>
                            </div>

                            <div className="candidate-form-group" style={{ marginTop: '14px' }}>
                              <label className="candidate-form-label">Contact Mobile / WhatsApp Number *</label>
                              <input 
                                type="tel"
                                value={newProjectForm.phone}
                                onChange={(e) => setNewProjectForm(prev => ({ ...prev, phone: e.target.value }))}
                                placeholder="e.g. +91 9876543210"
                                className="candidate-input"
                                style={{ marginTop: '6px' }}
                                required
                              />
                            </div>

                            <div className="candidate-form-group" style={{ marginTop: '14px' }}>
                              <label className="candidate-form-label">Project Overview & Requirements *</label>
                              <textarea 
                                rows={4}
                                value={newProjectForm.message}
                                onChange={(e) => setNewProjectForm(prev => ({ ...prev, message: e.target.value }))}
                                placeholder="Describe your project goal, expected features, tech preferences, timeline, and deliverables…"
                                className="candidate-input"
                                style={{ marginTop: '6px', resize: 'vertical' }}
                                required
                              />
                            </div>

                            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                              <button 
                                type="submit" 
                                disabled={newProjectSubmitting}
                                className="candidate-auth-btn"
                                style={{ background: '#7c3aed', flex: 1 }}
                              >
                                {newProjectSubmitting ? <RefreshCw size={16} className="spin-anim" /> : <Send size={16} />}
                                <span>{newProjectSubmitting ? 'Submitting Request…' : 'Submit Project Request'}</span>
                              </button>
                              <button 
                                type="button" 
                                onClick={() => setActiveTab('projects')}
                                className="candidate-back-btn"
                              >
                                Cancel
                              </button>
                            </div>
                          </form>
                        </div>
                      )}
                    </>
                  )}

                  {/* ========================================================= */}
                  {/* B. INTERNSHIP & EVENT CANDIDATE VIEWS                     */}
                  {/* ========================================================= */}
                  {!isProjectClient && (
                    <>
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
            </>
          )}

          {/* Bottom Redirect Banner: Differentiated for Project Client vs Intern */}
          {isProjectClient ? (
            <div className="portal-redirect-banner" style={{ background: '#faf5ff', borderColor: '#e9d5ff' }}>
              <div className="portal-redirect-left">
                <PhoneCall size={22} style={{ color: '#7c3aed', flexShrink: 0 }} />
                <div>
                  <strong style={{ fontSize: '0.88rem', color: '#581c87' }}>Need Direct Architecture Consultation with our Lead Engineers?</strong>
                  <div style={{ fontSize: '0.8rem', color: '#7e22ce' }}>Have custom tech specifications or urgent delivery milestones? Connect directly with our solutions architect.</div>
                </div>
              </div>
              <a 
                href="https://wa.me/917418579998?text=Hello%20Wingroo%20Technologies%2C%20I%20would%20like%20to%20discuss%20a%20software%20project%20scope." 
                target="_blank"
                rel="noopener noreferrer"
                className="portal-redirect-btn"
                style={{ background: '#7c3aed', color: '#ffffff', borderColor: '#7c3aed' }}
              >
                <span>WhatsApp Solutions Desk</span>
                <ExternalLink size={13} />
              </a>
            </div>
          ) : (
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
          )}
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

      {/* Printable Slip Popup Modal for Project Request */}
      {selectedProjectSlip && (
        <div className="slip-modal-overlay" onClick={() => setSelectedProjectSlip(null)}>
          <div className="slip-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="slip-modal-header no-print">
              <span>Official Project Request & Scope Summary</span>
              <div className="slip-header-actions">
                <button 
                  type="button" 
                  onClick={() => window.print()} 
                  className="slip-print-btn"
                >
                  <Printer size={14} />
                  <span>Print Slip</span>
                </button>
                <button type="button" onClick={() => setSelectedProjectSlip(null)} className="slip-close-btn">
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="slip-document-sheet" id="printable-project-slip">
              <div className="slip-doc-header">
                <div>
                  <div className="doc-brand">WINGROO TECHNOLOGIES</div>
                  <div className="doc-sub">Software Engineering • Custom Web & Mobile Solutions</div>
                  <div className="doc-sub">Coimbatore, Tamil Nadu, India • contact@wingrootech.com</div>
                </div>
                <div className="doc-app-stamp" style={{ borderColor: '#7c3aed', background: '#faf5ff' }}>
                  <div className="doc-stamp-title" style={{ color: '#7c3aed' }}>PROJECT INQUIRY REF</div>
                  <div className="doc-stamp-no" style={{ color: '#6b21a8' }}>{selectedProjectSlip.request_no}</div>
                </div>
              </div>

              <div className="doc-divider" />

              <div className="doc-grid-info">
                <div className="doc-info-item">
                  <span className="doc-info-label">Client Name</span>
                  <span className="doc-info-val">{selectedProjectSlip.name}</span>
                </div>
                <div className="doc-info-item">
                  <span className="doc-info-label">Current Status</span>
                  <span className="doc-info-val" style={{ color: '#7c3aed', fontWeight: 700 }}>
                    {selectedProjectSlip.status || 'Under Review'}
                  </span>
                </div>
                <div className="doc-info-item">
                  <span className="doc-info-label">Client Email</span>
                  <span className="doc-info-val">{selectedProjectSlip.email}</span>
                </div>
                <div className="doc-info-item">
                  <span className="doc-info-label">Client Mobile</span>
                  <span className="doc-info-val">{selectedProjectSlip.phone || 'N/A'}</span>
                </div>
                <div className="doc-info-item" style={{ gridColumn: 'span 2' }}>
                  <span className="doc-info-label">Project Domain / Service</span>
                  <span className="doc-info-val">{selectedProjectSlip.subject || 'Custom Project Inquiry'}</span>
                </div>
                <div className="doc-info-item" style={{ gridColumn: 'span 2' }}>
                  <span className="doc-info-label">Date Submitted</span>
                  <span className="doc-info-val">{selectedProjectSlip.created_at || 'Recently'}</span>
                </div>
              </div>

              <div style={{ marginTop: '20px', padding: '16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                <span className="doc-info-label" style={{ display: 'block', marginBottom: '6px', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', color: '#64748b' }}>Project Overview & Scope Description:</span>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#1e293b', lineHeight: 1.6 }}>{selectedProjectSlip.message}</p>
              </div>

              <div className="doc-verification-seal-row" style={{ marginTop: '28px' }}>
                <div className="doc-seal-box">
                  <ShieldCheck size={28} style={{ color: '#7c3aed' }} />
                  <div>
                    <div className="seal-title" style={{ color: '#6b21a8' }}>CONFIRMED CLIENT PROJECT INQUIRY</div>
                    <div className="seal-sub">Directly assigned for engineering review at Wingroo Technologies</div>
                  </div>
                </div>
                <div className="doc-sign-area">
                  <div className="sign-line" />
                  <div className="sign-title">Lead Solutions Architect</div>
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
