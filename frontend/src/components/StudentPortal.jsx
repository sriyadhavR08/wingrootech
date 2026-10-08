import React, { useState, useEffect, useRef } from 'react';
import { 
  GraduationCap, 
  Search, 
  X, 
  CheckCircle, 
  Clock, 
  FileText, 
  ExternalLink, 
  Printer, 
  Phone, 
  Mail, 
  Sparkles, 
  Building2, 
  Calendar, 
  ArrowRight, 
  RefreshCw, 
  AlertCircle,
  ShieldCheck,
  Award,
  BookOpen,
  Lock,
  User,
  Camera,
  Download,
  Check,
  QrCode,
  LogIn,
  UserPlus,
  ShieldAlert,
  ArrowLeft
} from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import { 
  getAuthTokens, 
  saveAuthTokens, 
  clearStudentSession, 
  getCurrentStudentUser, 
  saveCurrentStudentUser, 
  certFetch, 
  downloadCertificatePdf 
} from '../utils/certApi';
import Scanner from './Scanner';
import './StudentPortal.css';

const API_BASE = API_BASE_URL || '';

// Client-side image resize helper
function resizeImage(file, maxWidth = 800, maxHeight = 800, quality = 0.85) {
  return new Promise((resolve) => {
    if (!file) return resolve(null);
    if (file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width || 480;
        canvas.height = height || 480;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(objectUrl);
        resolve(canvas.toDataURL('image/jpeg', quality));
      } catch {
        URL.revokeObjectURL(objectUrl);
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    };
    img.src = objectUrl;
  });
}

const CANDIDATE_CATEGORIES = [
  {
    key: 'COLLEGE_INTERN',
    label: 'College Candidate Intern',
    badge: 'College Intern',
    desc: 'Degree / Diploma candidate currently undergoing internship',
    academicTitle: 'College & Academic Details',
    institutionLabel: 'College / Institution Name *',
    institutionPlaceholder: 'e.g. Coimbatore Institute of Technology',
    departmentLabel: 'Department *',
    departmentPlaceholder: 'e.g. Computer Science & Engineering',
    courseLabel: 'Course / Degree *',
    coursePlaceholder: 'e.g. B.E. / B.Tech / MCA',
    regNoLabel: 'College Register / Roll Number *',
    regNoPlaceholder: 'e.g. 717721CSR099',
    projectPlaceholder: 'e.g. Full Stack Web & Mobile Development',
    proofLabel: 'College ID Card Proof *',
    proofHint: 'Upload clear photo or scan of your College ID card (JPG, PNG, PDF)',
    proofBadge: 'College ID Card Attached',
    missingProofMsg: 'Please attach your College ID Card photo or document.'
  },
  {
    key: 'SCHOOL_STUDENT',
    label: 'School Candidate Intern',
    badge: 'School Candidate',
    desc: 'School candidate undergoing foundational technology internship',
    academicTitle: 'School & Academic Details',
    institutionLabel: 'School Name *',
    institutionPlaceholder: "e.g. Kendriya Vidyalaya / St. Joseph's Matriculation",
    departmentLabel: 'Board / Stream *',
    departmentPlaceholder: 'e.g. CBSE / State Board / Bio-Maths / Computer Science',
    courseLabel: 'Class / Standard *',
    coursePlaceholder: 'e.g. 11th Standard / 12th Standard',
    regNoLabel: 'School Roll Number / Candidate ID *',
    regNoPlaceholder: 'e.g. 12A-24 / SCH-2025',
    projectPlaceholder: 'e.g. Python Foundation & Web Development',
    proofLabel: 'School ID Card / Student Proof *',
    proofHint: 'Upload clear photo or scan of School ID card or Bonafide letter (JPG, PNG, PDF)',
    proofBadge: 'School ID / Student Proof Attached',
    missingProofMsg: 'Please attach your School ID Card or Student Bonafide proof.'
  },
  {
    key: 'COLLEGE_COMPLETED',
    label: 'College Completed Candidate Intern',
    badge: 'Graduate Intern',
    desc: 'Degree completed graduate / alumni undergoing project training & internship',
    academicTitle: 'Graduation & Degree Details',
    institutionLabel: 'Graduated College / University *',
    institutionPlaceholder: 'e.g. PSG College of Technology / Anna University',
    departmentLabel: 'Department / Specialization *',
    departmentPlaceholder: 'e.g. Computer Science / Data Analytics / Mechanical',
    courseLabel: 'Highest Qualification / Degree *',
    coursePlaceholder: 'e.g. B.Tech / M.Sc / MCA / B.E.',
    regNoLabel: 'Degree Roll No / Registration ID *',
    regNoPlaceholder: 'e.g. 19BCS104 / Grad-2024',
    projectPlaceholder: 'e.g. Full Stack Cloud Application',
    proofLabel: 'ID Proof (Aadhaar / Degree / Govt ID) *',
    proofHint: 'Upload clear photo or scan of valid ID proof (Aadhaar, Degree Certificate, Govt ID)',
    proofBadge: 'ID Document Attached',
    missingProofMsg: 'Please attach your ID Proof (Aadhaar, Degree Certificate, or Govt ID).'
  }
];

export default function StudentPortal({ isOpen, onClose, initialQuery = '', onSwitchRole }) {
  // Top Active Mode: 'login' | 'register' | 'workspace' | 'track' | 'verify' | 'forgot'
  const [activeMode, setActiveMode] = useState(() => {
    if (window.location.hash.startsWith('#verify')) return 'verify';
    if (getCurrentStudentUser()) return 'workspace';
    return 'login';
  });

  // ==========================================
  // 1. VERIFICATION STATE (Public QR / ID)
  // ==========================================
  const [verifyQuery, setVerifyQuery] = useState(() => {
    if (window.location.hash.startsWith('#verify/')) {
      return window.location.hash.replace('#verify/', '').trim();
    }
    return '';
  });
  const [verifyType, setVerifyType] = useState('id'); // 'id' | 'token'
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [captchaData, setCaptchaData] = useState(null);
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captchaLoading, setCaptchaLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);
  const [verifyError, setVerifyError] = useState('');

  // ==========================================
  // 2. AUTHENTICATION (Login, Register & Forgot Password)
  // ==========================================
  const [currentUser, setCurrentUser] = useState(() => getCurrentStudentUser());
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Forgot Password State
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotNewPass, setForgotNewPass] = useState('');
  const [forgotConfirmPass, setForgotConfirmPass] = useState('');
  const [forgotUserId, setForgotUserId] = useState(null);
  const [forgotStep, setForgotStep] = useState('verify'); // 'verify' | 'reset'
  const [forgotMsg, setForgotMsg] = useState('');
  const [forgotErr, setForgotErr] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const [regForm, setRegForm] = useState({
    candidate_type: 'COLLEGE_INTERN',
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
    mobile_number: '',
    gender: 'MALE',
    college_name: '',
    department: '',
    course: '',
    register_number: '',
    start_date: new Date().toISOString().slice(0, 10),
    end_date: '',
    project_name: 'Full Stack Web Platform',
    college_id_card: null,
    selfie_photo: null
  });
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');

  const activeCatConfig = CANDIDATE_CATEGORIES.find(c => c.key === regForm.candidate_type) || CANDIDATE_CATEGORIES[0];

  // Camera snap for selfie
  const [selfieCameraActive, setSelfieCameraActive] = useState(false);
  const selfieVideoRef = useRef(null);
  const selfieStreamRef = useRef(null);

  // ==========================================
  // 3. STUDENT WORKSPACE / DASHBOARD
  // ==========================================
  const [studentProfile, setStudentProfile] = useState(null);
  const [workspaceLoading, setWorkspaceLoading] = useState(false);
  const [downloadingCert, setDownloadingCert] = useState(false);
  const [certActionMsg, setCertActionMsg] = useState('');

  // ==========================================
  // 4. LEGACY APPLICATION TRACKING
  // ==========================================
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
  const [activeSubTab, setActiveSubTab] = useState('all');

  // Load CAPTCHA challenge
  const loadCaptcha = async () => {
    setCaptchaLoading(true);
    setCaptchaAnswer('');
    try {
      const res = await fetch(`${API_BASE}/api/public/captcha/`);
      const data = await res.json();
      setCaptchaData(data);
    } catch {
      const rand = Math.floor(100000 + Math.random() * 900000).toString();
      setCaptchaData({ question: rand, otp: rand, code: rand, token: 'offline' });
    } finally {
      setCaptchaLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadCaptcha();
      if (currentUser) {
        fetchStudentWorkspace();
      }
      if (initialQuery) {
        setSearchQuery(initialQuery);
        fetchStudentApplications(initialQuery);
      }
    }
  }, [isOpen]);

  // Handle hash changes like #verify/<token>
  useEffect(() => {
    const checkHash = () => {
      if (window.location.hash.startsWith('#verify')) {
        const token = window.location.hash.replace('#verify/', '').replace('#verify', '').trim();
        if (token) {
          setVerifyQuery(token);
          setVerifyType('token');
        }
        setActiveMode('verify');
      }
    };
    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  // Fetch Student Workspace details
  const fetchStudentWorkspace = async () => {
    setWorkspaceLoading(true);
    setCertActionMsg('');
    try {
      const res = await certFetch('/api/student/profile/');
      if (res.ok) {
        const data = await res.json();
        setStudentProfile(data);
        saveCurrentStudentUser(data);
      } else if (res.status === 401) {
        handleLogout();
      }
    } catch (err) {
      console.warn('Workspace fetch error:', err);
    } finally {
      setWorkspaceLoading(false);
    }
  };

  // Perform Certificate Verification
  const handleVerifySubmit = async (e) => {
    if (e) e.preventDefault();
    setVerifyError('');
    setVerifyResult(null);

    const q = verifyQuery.trim();
    if (!q) {
      setVerifyError('Please enter a Certificate ID (e.g. INT-2026-00001) or Scan QR Code.');
      return;
    }

    if (!captchaAnswer || captchaAnswer.trim().length < 6) {
      setVerifyError('Please enter the complete 6-digit Security OTP verification code.');
      return;
    }

    setVerifyLoading(true);
    try {
      const isToken = verifyType === 'token' || (!q.toUpperCase().startsWith('INT-') && q.length > 20);
      const endpoint = isToken 
        ? `/api/public/verify/token/${encodeURIComponent(q)}/`
        : `/api/public/verify/id/${encodeURIComponent(q.toUpperCase())}/`;

      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          captcha_token: captchaData?.token || '',
          captcha_answer: captchaAnswer.trim()
        })
      });

      const data = await res.json();
      if (res.ok) {
        setVerifyResult(data);
      } else {
        setVerifyError(data.detail || data.captcha || 'Certificate not found or verification failed.');
        loadCaptcha(); // refresh captcha on failure
      }
    } catch {
      setVerifyError('Failed to communicate with verification server. Please check your connection.');
      loadCaptcha();
    } finally {
      setVerifyLoading(false);
    }
  };

  // Student Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });
      const data = await res.json();
      if (res.ok && data.user) {
        saveAuthTokens({ access: data.access, refresh: data.refresh });
        saveCurrentStudentUser(data.user);
        setCurrentUser(data.user);
        setActiveMode('workspace');
        fetchStudentWorkspace();
      } else {
        setLoginError(data.detail || 'Invalid email or password.');
      }
    } catch {
      setLoginError('Unable to sign in. Please check connection and try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Candidate Forgot Password Handlers
  const handleForgotVerify = async (e) => {
    e.preventDefault();
    setForgotErr('');
    setForgotMsg('');
    setForgotLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail, register_number: forgotEmail })
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
          email: forgotEmail,
          new_password: forgotNewPass,
          confirm_password: forgotConfirmPass
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Reset failed');
      setForgotMsg(data.message || 'Password successfully updated! You can now sign in.');
      setTimeout(() => {
        setActiveMode('login');
        setForgotStep('verify');
        setForgotNewPass('');
        setForgotConfirmPass('');
        setLoginForm(prev => ({ ...prev, email: forgotEmail }));
      }, 2000);
    } catch (err) {
      setForgotErr(err.message);
    } finally {
      setForgotLoading(false);
    }
  };

  // Student Registration
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    if (regForm.password !== regForm.confirm_password) {
      setRegError('Passwords do not match.');
      return;
    }
    if (regForm.password.length < 8) {
      setRegError('Password must be at least 8 characters long.');
      return;
    }
    if (!regForm.college_id_card) {
      setRegError(activeCatConfig.missingProofMsg);
      return;
    }
    if (!regForm.selfie_photo) {
      setRegError('Please provide a live Selfie Photo (via camera snap or upload).');
      return;
    }

    setRegLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regForm)
      });
      const data = await res.json();
      if (res.ok) {
        setRegSuccess('Registration successful! You can now login with your email and password.');
        setLoginForm({ email: regForm.email, password: regForm.password });
        setTimeout(() => {
          setActiveMode('login');
          setRegSuccess('');
        }, 2200);
      } else {
        const errorMsg = data.email?.[0] || data.register_number?.[0] || data.detail || 'Registration failed. Please check form values.';
        setRegError(errorMsg);
      }
    } catch {
      setRegError('Server connection error. Please try again.');
    } finally {
      setRegLoading(false);
    }
  };

  // Camera handling for selfie snap
  const startSelfieCamera = async () => {
    try {
      setSelfieCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 480, height: 480 } });
      selfieStreamRef.current = stream;
      if (selfieVideoRef.current) {
        selfieVideoRef.current.srcObject = stream;
      }
    } catch {
      alert('Camera access denied or webcam unavailable. You can use standard file upload.');
      setSelfieCameraActive(false);
    }
  };

  const captureSelfiePhoto = () => {
    if (!selfieVideoRef.current) return;
    const video = selfieVideoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, 400, 400);
    const dataUri = canvas.toDataURL('image/jpeg', 0.85);
    setRegForm(prev => ({ ...prev, selfie_photo: dataUri }));
    stopSelfieCamera();
  };

  const stopSelfieCamera = () => {
    if (selfieStreamRef.current) {
      selfieStreamRef.current.getTracks().forEach(t => t.stop());
      selfieStreamRef.current = null;
    }
    setSelfieCameraActive(false);
  };

  const handleLogout = () => {
    clearStudentSession();
    setCurrentUser(null);
    setStudentProfile(null);
    setActiveMode('login');
  };

  // Download Certificate PDF
  const handleDownloadCertificate = async (certId) => {
    setDownloadingCert(true);
    setCertActionMsg('');
    try {
      await downloadCertificatePdf(certId, `Wingroo-Certificate-${studentProfile?.certificate?.certificate_id || 'Issued'}.pdf`);
      setCertActionMsg('Certificate downloaded successfully!');
    } catch (err) {
      setCertActionMsg(err.message || 'Error downloading certificate.');
    } finally {
      setDownloadingCert(false);
    }
  };

  // Track Application Lookup
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
        } else {
          setTrackErrorMsg(data.message || 'No applications or event registrations found.');
        }
      } else {
        setApplications([]);
        setEventRegistrations([]);
        setTrackErrorMsg(data.message || 'No applications or event registrations found.');
      }
    } catch {
      setSearched(true);
      setTrackErrorMsg('Failed to connect to candidate server. Please check connection.');
      setApplications([]);
      setEventRegistrations([]);
    } finally {
      setTrackLoading(false);
    }
  };

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
              <div className="student-portal-tag">Candidate & Certificate Services</div>
              <h3 className="student-portal-heading">Wingroo Candidate Portal</h3>
            </div>
          </div>

          {/* Unified Role Switcher */}
          <div className="portal-role-switch-tabs">
            <button type="button" className="portal-role-btn active" title="Current: Candidate Portal">
              <GraduationCap size={15} />
              <span>Candidate</span>
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

        {/* Feature Navigation Bar: Candidate Login First, Track Application Middle, Verify Certificate Last */}
        <div className="student-nav-tabs-bar">
          {currentUser ? (
            <button 
              type="button"
              className={`student-nav-tab ${activeMode === 'workspace' ? 'active' : ''}`}
              onClick={() => { setActiveMode('workspace'); fetchStudentWorkspace(); }}
            >
              <Award size={16} />
              <span>My Workspace</span>
              <span className="live-pill">Active</span>
            </button>
          ) : (
            <button 
              type="button"
              className={`student-nav-tab ${(activeMode === 'login' || activeMode === 'register' || activeMode === 'forgot') ? 'active' : ''}`}
              onClick={() => setActiveMode('login')}
            >
              <LogIn size={16} />
              <span>Candidate Login</span>
            </button>
          )}

          <button 
            type="button"
            className={`student-nav-tab ${activeMode === 'track' ? 'active' : ''}`}
            onClick={() => setActiveMode('track')}
          >
            <Search size={16} />
            <span>Track Application</span>
          </button>

          <button 
            type="button"
            className={`student-nav-tab ${activeMode === 'verify' ? 'active' : ''}`}
            onClick={() => setActiveMode('verify')}
          >
            <ShieldCheck size={16} />
            <span>Verify Certificate</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="student-portal-body">
          
          {/* ========================================================= */}
          {/* 1. PUBLIC CERTIFICATE VERIFICATION & QR CODE SCANNER     */}
          {/* ========================================================= */}
          {activeMode === 'verify' && (
            <div className="verify-workspace-wrap">
              <div className="verify-banner-hero">
                <div className="verify-badge">
                  <ShieldCheck size={16} />
                  <span>Tamper-Proof Digital Verification</span>
                </div>
                <h3>Official Internship Certificate Verification</h3>
                <p>
                  Validate genuine Wingroo Technologies internship completion certificates by Certificate ID or QR code token.
                </p>
              </div>

              {/* Camera Scanner Toggle Card */}
              {isScannerOpen ? (
                <Scanner 
                  onScanSuccess={(token) => {
                    setVerifyQuery(token);
                    setVerifyType('token');
                    setIsScannerOpen(false);
                  }}
                  onClose={() => setIsScannerOpen(false)}
                />
              ) : (
                <div className="scanner-prompt-bar">
                  <div className="prompt-left">
                    <QrCode size={22} style={{ color: '#0284c7' }} />
                    <div>
                      <strong>Have a physical or printed certificate?</strong>
                      <p>Scan the QR code printed on the document with your camera.</p>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    className="scanner-open-btn"
                    onClick={() => setIsScannerOpen(true)}
                  >
                    <Camera size={15} />
                    <span>Open Camera Scanner</span>
                  </button>
                </div>
              )}

              {/* Search Form */}
              <form onSubmit={handleVerifySubmit} className="verify-search-form">
                <div className="form-group-flex">
                  <div className="verify-input-wrap">
                    <Search size={18} className="field-icon" />
                    <input 
                      type="text"
                      value={verifyQuery}
                      onChange={(e) => setVerifyQuery(e.target.value)}
                      placeholder="Enter Certificate ID (e.g. INT-2026-00001) or QR Token"
                      className="verify-text-input"
                      required
                    />
                  </div>
                </div>

                {/* 6-Digit Security OTP Challenge */}
                <div className="captcha-challenge-box">
                  <div className="captcha-header">
                    <div className="captcha-label">
                      <Lock size={14} style={{ color: '#f17d47' }} />
                      <span>Security Verification OTP (Anti-Automated Check):</span>
                    </div>
                    <div className="captcha-code-pill" onClick={() => setCaptchaAnswer(captchaData?.otp || '')} title="Click to Auto-Fill">
                      <code>{captchaData?.otp || '......'}</code>
                      <span className="auto-fill-hint">Click to Autofill</span>
                    </div>
                    <button 
                      type="button" 
                      onClick={loadCaptcha} 
                      className="captcha-refresh-btn" 
                      title="Generate new OTP"
                    >
                      <RefreshCw size={13} className={captchaLoading ? 'spin-anim' : ''} />
                    </button>
                  </div>
                  <div className="captcha-input-row">
                    <input 
                      type="text" 
                      value={captchaAnswer}
                      onChange={(e) => setCaptchaAnswer(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="Enter the 6-digit code shown above"
                      className="captcha-answer-input"
                      maxLength={6}
                      required
                    />
                    <button type="submit" disabled={verifyLoading} className="verify-submit-btn">
                      {verifyLoading ? (
                        <>
                          <RefreshCw size={15} className="spin-anim" />
                          <span>Verifying...</span>
                        </>
                      ) : (
                        <>
                          <span>Verify Certificate</span>
                          <ArrowRight size={15} />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>

              {/* Error Notice */}
              {verifyError && (
                <div className="verify-error-notice">
                  <ShieldAlert size={18} />
                  <div>
                    <strong>Verification Failed</strong>
                    <p>{verifyError}</p>
                  </div>
                </div>
              )}

              {/* Verified Result Card */}
              {verifyResult && (
                <div className={`verified-card-result ${verifyResult.status === 'VALID' ? 'status-valid' : 'status-revoked'}`}>
                  <div className="verified-header-strip">
                    <div className="verified-status-chip">
                      {verifyResult.status === 'VALID' ? (
                        <>
                          <CheckCircle size={18} />
                          <span>AUTHENTIC CERTIFICATE VERIFIED</span>
                        </>
                      ) : (
                        <>
                          <ShieldAlert size={18} />
                          <span>CERTIFICATE REVOKED</span>
                        </>
                      )}
                    </div>
                    <div className="verified-id-pill">
                      <span>ID: {verifyResult.certificate_id}</span>
                    </div>
                  </div>

                  <div className="verified-details-grid">
                    <div className="detail-item">
                      <label>Candidate Name</label>
                      <div className="val highlight">{verifyResult.student_name}</div>
                    </div>
                    <div className="detail-item">
                      <label>Internship Category</label>
                      <div className="val">{verifyResult.candidate_type_label || 'College Intern'}</div>
                    </div>
                    <div className="detail-item">
                      <label>
                        {verifyResult.candidate_type === 'SCHOOL_STUDENT'
                          ? 'School Name'
                          : verifyResult.candidate_type === 'COLLEGE_COMPLETED'
                          ? 'Graduated Institution'
                          : 'Institution / College'}
                      </label>
                      <div className="val">{verifyResult.college_name || 'Wingroo Academic Partner'}</div>
                    </div>
                    <div className="detail-item">
                      <label>
                        {verifyResult.candidate_type === 'SCHOOL_STUDENT'
                          ? 'Board & Class'
                          : verifyResult.candidate_type === 'COLLEGE_COMPLETED'
                          ? 'Specialization & Qualification'
                          : 'Department / Course'}
                      </label>
                      <div className="val">{verifyResult.department} {verifyResult.course ? `(${verifyResult.course})` : ''}</div>
                    </div>
                    <div className="detail-item">
                      <label>
                        {verifyResult.candidate_type === 'SCHOOL_STUDENT'
                          ? 'School Roll Number'
                          : verifyResult.candidate_type === 'COLLEGE_COMPLETED'
                          ? 'Member / Reg ID'
                          : 'Register / Roll Number'}
                      </label>
                      <div className="val">{verifyResult.register_number || 'N/A'}</div>
                    </div>
                    <div className="detail-item">
                      <label>Assigned Project</label>
                      <div className="val">{verifyResult.project_name || 'Full Stack Development'}</div>
                    </div>
                    {verifyResult.start_date && (
                      <div className="detail-item">
                        <label>Internship Period</label>
                        <div className="val">{verifyResult.start_date} to {verifyResult.end_date || 'Present'}</div>
                      </div>
                    )}
                    <div className="detail-item">
                      <label>Official Issue Date</label>
                      <div className="val">{verifyResult.issue_date || 'N/A'}</div>
                    </div>
                  </div>

                  <div className="verified-footer-note">
                    <ShieldCheck size={14} style={{ color: '#10b981' }} />
                    <span>Verified on {verifyResult.verified_at} • Direct digital verification powered by Wingroo Technologies Certificate Registry.</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* 2. CANDIDATE LOGIN (FIRST TAB)                            */}
          {/* ========================================================= */}
          {activeMode === 'login' && !currentUser && (
            <div className="auth-form-container">
              <div className="auth-header-card">
                <div className="auth-icon-circle">
                  <LogIn size={24} />
                </div>
                <h3>Candidate Login</h3>
                <p>Sign in to access your internship workspace, track milestones, and download issued certificates.</p>
              </div>

              {loginError && (
                <div className="auth-error-banner">
                  <AlertCircle size={16} />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="auth-form">
                <div className="form-row">
                  <label>Registered Email Address</label>
                  <div className="form-input-wrap">
                    <Mail size={16} />
                    <input 
                      type="email" 
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      placeholder="candidate@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ margin: 0 }}>Password</label>
                    <button 
                      type="button" 
                      onClick={() => { setActiveMode('forgot'); setForgotErr(''); setForgotMsg(''); setForgotStep('verify'); }}
                      className="forgot-password-link"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="form-input-wrap">
                    <Lock size={16} />
                    <input 
                      type="password" 
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                <button type="submit" disabled={loginLoading} className="auth-submit-btn">
                  {loginLoading ? <RefreshCw size={16} className="spin-anim" /> : <LogIn size={16} />}
                  <span>{loginLoading ? 'Signing In...' : 'Sign In to Workspace'}</span>
                </button>
              </form>

              {/* Direct Redirect to Register Account */}
              <div className="register-redirect-card">
                <div className="register-redirect-text">
                  <strong>Don't have an internship account?</strong>
                  <p>Register as a College Intern, School Candidate, or Graduate to get verified certificates.</p>
                </div>
                <button 
                  type="button" 
                  onClick={() => setActiveMode('register')} 
                  className="register-redirect-btn"
                >
                  <UserPlus size={16} />
                  <span>Register Account Now →</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 2.1 FORGOT PASSWORD VIEW                                  */}
          {/* ========================================================= */}
          {activeMode === 'forgot' && !currentUser && (
            <div className="auth-form-container">
              <div className="auth-header-card">
                <div className="auth-icon-circle">
                  <Lock size={24} />
                </div>
                <h3>Reset Candidate Password</h3>
                <p>Enter your registered email address or register number to reset your password.</p>
              </div>

              {forgotErr && (
                <div className="auth-error-banner">
                  <AlertCircle size={16} />
                  <span>{forgotErr}</span>
                </div>
              )}

              {forgotMsg && (
                <div className="auth-success-banner">
                  <CheckCircle size={16} />
                  <span>{forgotMsg}</span>
                </div>
              )}

              {forgotStep === 'verify' ? (
                <form onSubmit={handleForgotVerify} className="auth-form">
                  <div className="form-row">
                    <label>Registered Email or Register Number</label>
                    <div className="form-input-wrap">
                      <Mail size={16} />
                      <input 
                        type="text" 
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="candidate@example.com or Roll No"
                        required
                      />
                    </div>
                  </div>

                  <button type="submit" disabled={forgotLoading} className="auth-submit-btn">
                    {forgotLoading ? <RefreshCw size={16} className="spin-anim" /> : <CheckCircle size={16} />}
                    <span>{forgotLoading ? 'Verifying...' : 'Verify Candidate Account'}</span>
                  </button>
                </form>
              ) : (
                <form onSubmit={handleForgotReset} className="auth-form">
                  <div className="form-row">
                    <label>New Password (min 6 characters)</label>
                    <div className="form-input-wrap">
                      <Lock size={16} />
                      <input 
                        type="password" 
                        value={forgotNewPass}
                        onChange={(e) => setForgotNewPass(e.target.value)}
                        placeholder="Enter new password"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <label>Confirm New Password</label>
                    <div className="form-input-wrap">
                      <Lock size={16} />
                      <input 
                        type="password" 
                        value={forgotConfirmPass}
                        onChange={(e) => setForgotConfirmPass(e.target.value)}
                        placeholder="Re-enter new password"
                        required
                      />
                    </div>
                  </div>

                  <button type="submit" disabled={forgotLoading} className="auth-submit-btn">
                    {forgotLoading ? <RefreshCw size={16} className="spin-anim" /> : <Lock size={16} />}
                    <span>{forgotLoading ? 'Updating Password...' : 'Save New Password'}</span>
                  </button>
                </form>
              )}

              <div className="auth-switch-prompt">
                <button 
                  type="button" 
                  onClick={() => { setActiveMode('login'); setForgotErr(''); setForgotMsg(''); }} 
                  className="switch-link"
                >
                  ← Back to Candidate Login
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 3. STUDENT REGISTRATION (ACCESSIBLE VIA LOGIN REDIRECT)   */}
          {/* ========================================================= */}
          {activeMode === 'register' && !currentUser && (
            <div className="auth-form-container register-large">
              <div className="register-top-back-bar">
                <button 
                  type="button" 
                  onClick={() => setActiveMode('login')} 
                  className="back-to-login-btn"
                >
                  <ArrowLeft size={16} />
                  <span>Already have an account? Back to Candidate Login</span>
                </button>
              </div>

              <div className="auth-header-card">
                <div className="auth-icon-circle">
                  <UserPlus size={24} />
                </div>
                <h3>Internship Candidate Registration</h3>
                <p>Register your candidate profile for official certificate tracking, identity validation, and project assignment.</p>
              </div>

              {regError && (
                <div className="auth-error-banner">
                  <AlertCircle size={16} />
                  <span>{regError}</span>
                </div>
              )}

              {regSuccess && (
                <div className="auth-success-banner">
                  <CheckCircle size={16} />
                  <span>{regSuccess}</span>
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="register-grid-form">
                {/* Candidate Type Selection */}
                <div className="form-col-full">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <label className="mb-0">Candidate Category *</label>
                    <span className="badge text-bg-primary" style={{ fontSize: '0.72rem' }}>
                      Selected: {activeCatConfig.badge}
                    </span>
                  </div>

                  {/* Interactive Category Selector Cards */}
                  <div className="portal-candidate-type-grid">
                    {CANDIDATE_CATEGORIES.map((cat) => {
                      const isSelected = regForm.candidate_type === cat.key;
                      return (
                        <div
                          key={cat.key}
                          className={`portal-cat-card ${isSelected ? 'active' : ''}`}
                          onClick={() => setRegForm(prev => ({ ...prev, candidate_type: cat.key }))}
                          role="button"
                          tabIndex={0}
                        >
                          <div className="portal-cat-card-top">
                            <span className="portal-cat-badge">{cat.badge}</span>
                            {isSelected && <CheckCircle size={15} className="portal-cat-check" />}
                          </div>
                          <div className="portal-cat-title">{cat.label}</div>
                          <div className="portal-cat-desc">{cat.desc}</div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="category-active-notice">
                    <Sparkles size={14} style={{ flexShrink: 0 }} />
                    <span>
                      Form customized for <strong>{activeCatConfig.label}</strong>. Fields and required verification proof adapt automatically.
                    </span>
                  </div>
                </div>

                {/* Full Name & Gender */}
                <div className="form-col">
                  <label>Full Name (As on Certificate) *</label>
                  <input 
                    type="text" 
                    value={regForm.full_name}
                    onChange={(e) => setRegForm({ ...regForm, full_name: e.target.value })}
                    placeholder="Enter full name"
                    required
                  />
                </div>
                <div className="form-col">
                  <label>Gender Title *</label>
                  <select 
                    value={regForm.gender}
                    onChange={(e) => setRegForm({ ...regForm, gender: e.target.value })}
                    className="styled-select"
                  >
                    <option value="MALE">Male (Mr.)</option>
                    <option value="FEMALE">Female (Ms.)</option>
                  </select>
                </div>

                {/* Email & Mobile */}
                <div className="form-col">
                  <label>Email Address *</label>
                  <input 
                    type="email" 
                    value={regForm.email}
                    onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                    placeholder="candidate@example.com"
                    required
                  />
                </div>
                <div className="form-col">
                  <label>Mobile Number *</label>
                  <input 
                    type="tel" 
                    value={regForm.mobile_number}
                    onChange={(e) => setRegForm({ ...regForm, mobile_number: e.target.value })}
                    placeholder="+91 9876543210"
                    required
                  />
                </div>

                {/* Password & Confirm Password */}
                <div className="form-col">
                  <label>Password (Min 8 chars) *</label>
                  <input 
                    type="password" 
                    value={regForm.password}
                    onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                    placeholder="Create secure password"
                    required
                  />
                </div>
                <div className="form-col">
                  <label>Confirm Password *</label>
                  <input 
                    type="password" 
                    value={regForm.confirm_password}
                    onChange={(e) => setRegForm({ ...regForm, confirm_password: e.target.value })}
                    placeholder="Re-enter password"
                    required
                  />
                </div>

                {/* Adaptive Institution Name */}
                <div className="form-col-full">
                  <label>{activeCatConfig.institutionLabel}</label>
                  <input 
                    type="text" 
                    value={regForm.college_name}
                    onChange={(e) => setRegForm({ ...regForm, college_name: e.target.value })}
                    placeholder={activeCatConfig.institutionPlaceholder}
                    required
                  />
                </div>

                {/* Adaptive Department & Course */}
                <div className="form-col">
                  <label>{activeCatConfig.departmentLabel}</label>
                  <input 
                    type="text" 
                    value={regForm.department}
                    onChange={(e) => setRegForm({ ...regForm, department: e.target.value })}
                    placeholder={activeCatConfig.departmentPlaceholder}
                    required
                  />
                </div>
                <div className="form-col">
                  <label>{activeCatConfig.courseLabel}</label>
                  <input 
                    type="text" 
                    value={regForm.course}
                    onChange={(e) => setRegForm({ ...regForm, course: e.target.value })}
                    placeholder={activeCatConfig.coursePlaceholder}
                    required
                  />
                </div>

                {/* Adaptive Register / Roll Number */}
                <div className="form-col-full">
                  <label>{activeCatConfig.regNoLabel}</label>
                  <input 
                    type="text" 
                    value={regForm.register_number}
                    onChange={(e) => setRegForm({ ...regForm, register_number: e.target.value })}
                    placeholder={activeCatConfig.regNoPlaceholder}
                    required
                  />
                </div>

                {/* Project & Dates */}
                <div className="form-col-full">
                  <label>Internship Project Title *</label>
                  <input 
                    type="text" 
                    value={regForm.project_name}
                    onChange={(e) => setRegForm({ ...regForm, project_name: e.target.value })}
                    placeholder={activeCatConfig.projectPlaceholder}
                    required
                  />
                </div>
                <div className="form-col">
                  <label>Internship Start Date *</label>
                  <input 
                    type="date" 
                    value={regForm.start_date}
                    onChange={(e) => setRegForm({ ...regForm, start_date: e.target.value })}
                    required
                  />
                </div>
                <div className="form-col">
                  <label>Internship End Date (Optional)</label>
                  <input 
                    type="date" 
                    value={regForm.end_date}
                    onChange={(e) => setRegForm({ ...regForm, end_date: e.target.value })}
                  />
                </div>

                {/* Adaptive Identity Document Proof & Selfie */}
                <div className="form-col">
                  <label>{activeCatConfig.proofLabel}</label>
                  <div className="doc-upload-box">
                    <input 
                      type="file" 
                      accept="image/*,application/pdf"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const dataUri = await resizeImage(file, 1000);
                          setRegForm(prev => ({ ...prev, college_id_card: dataUri }));
                        }
                      }}
                    />
                    {regForm.college_id_card ? (
                      <div className="upload-preview-chip">
                        <CheckCircle size={14} style={{ color: '#10b981' }} />
                        <span>{activeCatConfig.proofBadge}</span>
                      </div>
                    ) : (
                      <span className="upload-hint">{activeCatConfig.proofHint}</span>
                    )}
                  </div>
                </div>

                <div className="form-col">
                  <label>Live Selfie Photo *</label>
                  <div className="doc-upload-box">
                    {selfieCameraActive ? (
                      <div className="selfie-camera-live">
                        <video ref={selfieVideoRef} autoPlay playsInline style={{ width: '100%', height: '140px', borderRadius: '8px', objectFit: 'cover' }} />
                        <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                          <button type="button" onClick={captureSelfiePhoto} className="btn-snap">Capture</button>
                          <button type="button" onClick={stopSelfieCamera} className="btn-cancel-cam">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div className="selfie-options">
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const dataUri = await resizeImage(file, 640);
                              setRegForm(prev => ({ ...prev, selfie_photo: dataUri }));
                            }
                          }}
                        />
                        <button type="button" onClick={startSelfieCamera} className="btn-open-selfie-cam">
                          <Camera size={13} />
                          <span>Snap Photo</span>
                        </button>
                      </div>
                    )}

                    {regForm.selfie_photo && !selfieCameraActive && (
                      <div className="upload-preview-chip">
                        <CheckCircle size={14} style={{ color: '#10b981' }} />
                        <span>Selfie Photo Attached</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-col-full">
                  <button type="submit" disabled={regLoading} className="auth-submit-btn">
                    {regLoading ? <RefreshCw size={16} className="spin-anim" /> : <UserPlus size={16} />}
                    <span>{regLoading ? 'Registering...' : 'Complete Registration'}</span>
                  </button>
                </div>
              </form>

              <div className="auth-switch-prompt">
                <span>Already have an account?</span>
                <button type="button" onClick={() => setActiveMode('login')} className="switch-link">
                  Sign in here
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 4. STUDENT WORKSPACE / DASHBOARD                          */}
          {/* ========================================================= */}
          {activeMode === 'workspace' && currentUser && (
            <div className="student-workspace-view">
              <div className="workspace-hero-strip">
                <div className="user-avatar-hex">
                  {currentUser.full_name?.slice(0, 2).toUpperCase() || 'ST'}
                </div>
                <div className="user-headline">
                  <div className="eyebrow">INTERN WORKSPACE</div>
                  <h4>Welcome, {studentProfile?.full_name || currentUser.full_name}</h4>
                  <p>{studentProfile?.college_name || 'Wingroo Internship Cohort'} • {studentProfile?.candidate_type_display || 'College Intern'}</p>
                </div>
                <button type="button" onClick={handleLogout} className="workspace-logout-btn">
                  <span>Sign Out</span>
                </button>
              </div>

              {certActionMsg && (
                <div className="cert-action-alert">
                  <Sparkles size={16} />
                  <span>{certActionMsg}</span>
                </div>
              )}

              {/* Progress Milestones Tracker */}
              <div className="internship-tracker-card">
                <div className="tracker-header">
                  <div className="tracker-title">
                    <Clock size={16} />
                    <span>Internship Milestones & Status</span>
                  </div>
                  <div className={`status-tag status-${(studentProfile?.status || 'REGISTERED').toLowerCase()}`}>
                    {studentProfile?.status || 'REGISTERED'}
                  </div>
                </div>

                <div className="tracker-steps-line">
                  {[
                    { key: 'REGISTERED', label: 'Registered' },
                    { key: 'IN_PROGRESS', label: 'In Progress' },
                    { key: 'COMPLETED', label: 'Completed' },
                    { key: 'CERTIFICATE_ISSUED', label: 'Certificate Issued' }
                  ].map((st, idx) => {
                    const statusOrder = ['REGISTERED', 'IN_PROGRESS', 'COMPLETED', 'CERTIFICATE_ISSUED'];
                    const currentIdx = statusOrder.indexOf(studentProfile?.status || 'REGISTERED');
                    const isDone = currentIdx >= idx;
                    const isCurrent = currentIdx === idx;

                    return (
                      <div key={st.key} className={`tracker-step ${isDone ? 'done' : ''} ${isCurrent ? 'current' : ''}`}>
                        <div className="step-bullet">{isDone ? <Check size={12} /> : idx + 1}</div>
                        <div className="step-label">{st.label}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Certificate Download / Preview Action Box */}
              {studentProfile?.certificate ? (
                <div className="certificate-ready-card">
                  <div className="cert-ribbon">
                    <Award size={20} />
                    <span>Official Certificate Issued</span>
                  </div>
                  <h3>Your Certificate is Ready!</h3>
                  <p>Certificate Serial: <strong>{studentProfile.certificate.certificate_id}</strong> • Issued on {studentProfile.certificate.issue_date}</p>
                  
                  <div className="cert-buttons-row">
                    <button 
                      type="button" 
                      onClick={() => handleDownloadCertificate(studentProfile.certificate.id)}
                      disabled={downloadingCert}
                      className="btn-cert-download"
                    >
                      <Download size={16} />
                      <span>{downloadingCert ? 'Downloading...' : 'Download Official PDF'}</span>
                    </button>

                    <button 
                      type="button" 
                      onClick={() => {
                        setVerifyQuery(studentProfile.certificate.certificate_id);
                        setActiveMode('verify');
                      }}
                      className="btn-cert-verify"
                    >
                      <ShieldCheck size={16} />
                      <span>Verify Online</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="certificate-pending-card">
                  <Award size={22} style={{ color: '#0284c7' }} />
                  <div>
                    <strong>Certificate Issuance in Progress</strong>
                    <p>Once your project evaluation is completed and verified by the Wingroo administration, your verifiable digital certificate will appear here.</p>
                  </div>
                </div>
              )}

              {/* Candidate Info Grid */}
              <div className="workspace-profile-grid">
                <div className="info-box">
                  <label>
                    {studentProfile?.candidate_type === 'SCHOOL_STUDENT'
                      ? 'Board / Stream'
                      : studentProfile?.candidate_type === 'COLLEGE_COMPLETED'
                      ? 'Specialization'
                      : 'Department / Stream'}
                  </label>
                  <div>{studentProfile?.department || 'N/A'}</div>
                </div>
                <div className="info-box">
                  <label>
                    {studentProfile?.candidate_type === 'SCHOOL_STUDENT'
                      ? 'Class / Standard'
                      : studentProfile?.candidate_type === 'COLLEGE_COMPLETED'
                      ? 'Qualification'
                      : 'Degree / Course'}
                  </label>
                  <div>{studentProfile?.course || 'N/A'}</div>
                </div>
                <div className="info-box">
                  <label>
                    {studentProfile?.candidate_type === 'SCHOOL_STUDENT'
                      ? 'School Roll Number'
                      : studentProfile?.candidate_type === 'COLLEGE_COMPLETED'
                      ? 'Member / Reg ID'
                      : 'Register / Roll Number'}
                  </label>
                  <div>{studentProfile?.register_number || 'N/A'}</div>
                </div>
                <div className="info-box">
                  <label>Project Title</label>
                  <div>{studentProfile?.project_name || 'Web Development'}</div>
                </div>
                <div className="info-box">
                  <label>Start Date</label>
                  <div>{studentProfile?.start_date || 'N/A'}</div>
                </div>
                <div className="info-box">
                  <label>End Date</label>
                  <div>{studentProfile?.end_date || 'Pending completion'}</div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 5. TRACK APPLICATIONS & EVENT PASSES (LEGACY)             */}
          {/* ========================================================= */}
          {activeMode === 'track' && (
            <div className="track-legacy-wrap">
              <div className="student-search-card">
                <div className="search-caption">
                  <Sparkles size={16} style={{ color: '#0284c7' }} />
                  <span>Lookup Direct Applications & Event Passes</span>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); fetchStudentApplications(searchQuery); }} className="student-search-form">
                  <div className="search-input-wrap">
                    <Search size={18} className="search-field-icon" />
                    <input 
                      type="text" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Enter Email, Phone, or Application # (e.g. WINGROO-INT-0001)"
                      className="student-search-input"
                      required
                    />
                  </div>
                  <button type="submit" disabled={trackLoading} className="student-search-btn">
                    <span>{trackLoading ? 'Searching...' : 'Track Application'}</span>
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

              {/* Results View */}
              {trackLoading ? (
                <div className="student-loading-state">
                  <RefreshCw size={28} className="spin-anim" />
                  <p>Fetching your application profile and status...</p>
                </div>
              ) : searched && (applications.length > 0 || eventRegistrations.length > 0) ? (
                <div className="student-results-wrap">
                  {applications.length > 0 && (
                    <div className="student-apps-list" style={{ marginTop: '16px' }}>
                      {applications.map((app) => (
                        <div key={app.id} className="student-app-card">
                          <div className="app-card-top">
                            <div className="app-id-pill">
                              <FileText size={14} />
                              <span>{app.application_no}</span>
                            </div>
                            <div className="app-date-meta">
                              <Calendar size={13} />
                              <span>Applied on {app.created_at || 'Recently'}</span>
                            </div>
                            <span className="status-pill badge-selected">
                              {app.status || 'Under Review'}
                            </span>
                          </div>

                          <div className="app-program-row">
                            <div>
                              <div className="program-title">{app.technology || 'Full Stack Development'}</div>
                              <div className="program-type">{app.internship_type} • {app.college}</div>
                            </div>
                            <button 
                              onClick={() => setActiveSlip(app)} 
                              className="btn-print-slip"
                              title="Print Official Slip"
                            >
                              <Printer size={14} />
                              <span>Print Slip</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {eventRegistrations.length > 0 && (
                    <div className="student-apps-list" style={{ marginTop: '16px' }}>
                      {eventRegistrations.map((ev) => (
                        <div key={ev.id} className="student-app-card" style={{ borderLeft: '4px solid #38bdf8' }}>
                          <div className="app-card-top">
                            <div className="app-id-pill" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
                              <FileText size={14} />
                              <span>{ev.registration_no}</span>
                            </div>
                            <span className="status-pill badge-selected">{ev.status || 'Confirmed'}</span>
                          </div>
                          <div className="app-program-row">
                            <div>
                              <div className="program-title">{ev.event_title}</div>
                              <div className="program-type">Attendee: {ev.name} • {ev.college}</div>
                            </div>
                            <button 
                              onClick={() => setActivePass(ev)} 
                              className="btn-print-slip"
                              style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', color: '#fff' }}
                            >
                              <Award size={14} />
                              <span>View Pass</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}

        </div>
      </div>

      {/* Printable Slip Popup Modal */}
      {activeSlip && (
        <div className="slip-modal-overlay" onClick={() => setActiveSlip(null)}>
          <div className="slip-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="slip-modal-actions no-print">
              <button onClick={() => window.print()} className="slip-action-btn print">
                <Printer size={16} />
                <span>Print Confirmation Slip</span>
              </button>
              <button onClick={() => setActiveSlip(null)} className="slip-action-btn close">
                <X size={16} />
              </button>
            </div>

            <div className="printable-slip-sheet" id="printable-slip">
              <div className="slip-header-brand">
                <img src="/logo.png" alt="Wingroo" className="slip-logo" />
                <div className="slip-brand-text">
                  <h3>WINGROO TECHNOLOGIES</h3>
                  <p>Software & Web Development • Digital Innovation Center</p>
                  <span>Coimbatore, Tamil Nadu, India</span>
                </div>
              </div>

              <div className="slip-title-band">
                <span>OFFICIAL INTERNSHIP APPLICATION RECEIPT</span>
              </div>

              <div className="slip-details-grid">
                <div className="slip-detail-row">
                  <span className="slip-label">Application Number:</span>
                  <span className="slip-value highlight">{activeSlip.application_no}</span>
                </div>
                <div className="slip-detail-row">
                  <span className="slip-label">Candidate Name:</span>
                  <span className="slip-value">{activeSlip.name}</span>
                </div>
                <div className="slip-detail-row">
                  <span className="slip-label">Email Address:</span>
                  <span className="slip-value">{activeSlip.email}</span>
                </div>
                <div className="slip-detail-row">
                  <span className="slip-label">Phone Number:</span>
                  <span className="slip-value">{activeSlip.phone}</span>
                </div>
                <div className="slip-detail-row">
                  <span className="slip-label">College / Institute:</span>
                  <span className="slip-value">{activeSlip.college}</span>
                </div>
                <div className="slip-detail-row">
                  <span className="slip-label">Course & Year:</span>
                  <span className="slip-value">{activeSlip.course} ({activeSlip.year})</span>
                </div>
                <div className="slip-detail-row">
                  <span className="slip-label">Domain Applied:</span>
                  <span className="slip-value">{activeSlip.technology}</span>
                </div>
                <div className="slip-detail-row">
                  <span className="slip-label">Current Status:</span>
                  <span className="slip-value highlight">{activeSlip.status}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
