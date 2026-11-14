import React, { useState, useEffect } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Send,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  ShieldCheck,
  KeyRound
} from 'lucide-react';
import './Contact.css';

import { API_BASE_URL } from '../config/api';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Project Inquiry',
    message: ''
  });

  const [status, setStatus] = useState(null); // { success: boolean, message: string }
  const [loading, setLoading] = useState(false);

  // Email OTP Verification States
  const [emailVerified, setEmailVerified] = useState(false);
  const [verificationToken, setVerificationToken] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [otpStatus, setOtpStatus] = useState(null); // { success: boolean, message: string }
  const [emailError, setEmailError] = useState('');

  // Phone Validation States
  const [phoneError, setPhoneError] = useState('');

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('wingroo_student_user') || sessionStorage.getItem('wingroo_candidate_user');
      if (stored) {
        const u = JSON.parse(stored);
        if (u) {
          setFormData(prev => ({
            ...prev,
            name: prev.name || u.full_name || '',
            email: prev.email || u.email || '',
            phone: prev.phone || u.phone || ''
          }));
        }
      }
    } catch { }
  }, []);

  // OTP Countdown Timer
  useEffect(() => {
    if (otpCountdown > 0) {
      const timer = setTimeout(() => setOtpCountdown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpCountdown]);

  // Email format validator
  const isEmailFormatValid = (val) => {
    if (!val) return false;
    const pattern = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
    return pattern.test(val.trim());
  };

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setFormData(prev => ({ ...prev, email: val }));
    
    // If email changes after verification, invalidate verification
    if (emailVerified || otpSent) {
      setEmailVerified(false);
      setVerificationToken('');
      setOtpSent(false);
      setOtpCode('');
      setOtpStatus(null);
    }

    if (val && !isEmailFormatValid(val)) {
      setEmailError('Please enter a valid email address (e.g. name@gmail.com)');
    } else {
      setEmailError('');
    }
  };

  // Indian Phone Number strict validator
  const validatePhone = (val) => {
    if (!val || !val.trim()) {
      return ''; // will be caught by required on submit
    }
    const cleanDigits = val.replace(/\D/g, '');
    let coreDigits = cleanDigits;
    if (coreDigits.length === 12 && coreDigits.startsWith('91')) {
      coreDigits = coreDigits.slice(2);
    } else if (coreDigits.length === 11 && coreDigits.startsWith('0')) {
      coreDigits = coreDigits.slice(1);
    }

    if (coreDigits.length !== 10) {
      return 'Mobile number must be exactly 10 digits.';
    }

    if (!/^[6-9]/.test(coreDigits)) {
      return 'Mobile number must start with 6, 7, 8, or 9.';
    }

    const unique = new Set(coreDigits.split(''));
    if (unique.size === 1) {
      return 'Dummy number: Repeated digits are not allowed (e.g. 9999999999).';
    }

    if (unique.size < 4) {
      return 'Please enter a valid personal mobile number.';
    }

    const dummyPatterns = [
      '1234567890', '0123456789', '9876543210', '8765432109',
      '9898989898', '9090909090', '9191919191', '8989898989',
      '7878787878', '6767676767', '9876598765', '1122334455'
    ];
    if (dummyPatterns.includes(coreDigits)) {
      return 'Dummy or sequential phone number detected.';
    }

    return '';
  };

  const handlePhoneChange = (e) => {
    const val = e.target.value;
    setFormData(prev => ({ ...prev, phone: val }));
    const err = validatePhone(val);
    setPhoneError(err);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Send Email OTP
  const handleSendOtp = async () => {
    if (!formData.email || !isEmailFormatValid(formData.email)) {
      setEmailError('Please enter a valid email address first.');
      return;
    }

    setOtpLoading(true);
    setOtpStatus(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/contact/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email.trim(),
          name: formData.name.trim() || 'Valued Visitor'
        })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setOtpSent(true);
        setOtpCountdown(60);
        setOtpStatus({
          success: true,
          message: data.message || `Verification code sent to ${formData.email}. Please check your inbox or spam.`
        });
      } else {
        setOtpStatus({
          success: false,
          message: data.message || 'Failed to send OTP code. Please try again.'
        });
      }
    } catch (err) {
      setOtpStatus({
        success: false,
        message: 'Could not connect to server. Please check your network and try again.'
      });
    } finally {
      setOtpLoading(false);
    }
  };

  // Verify Email OTP
  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.trim().length !== 6) {
      setOtpStatus({
        success: false,
        message: 'Please enter the complete 6-digit OTP code.'
      });
      return;
    }

    setOtpVerifying(true);
    setOtpStatus(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/contact/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email.trim(),
          otp: otpCode.trim()
        })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setEmailVerified(true);
        setVerificationToken(data.verification_token || '');
        setOtpStatus({
          success: true,
          message: '✓ Email verified successfully!'
        });
      } else {
        setOtpStatus({
          success: false,
          message: data.message || 'Invalid verification code. Please check and try again.'
        });
      }
    } catch (err) {
      setOtpStatus({
        success: false,
        message: 'Error verifying code. Please try again.'
      });
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleResetEmail = () => {
    setEmailVerified(false);
    setVerificationToken('');
    setOtpSent(false);
    setOtpCode('');
    setOtpStatus(null);
  };

  // Submit Contact Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);

    // 1. Email Verification Check
    if (!emailVerified) {
      setStatus({
        success: false,
        message: 'Please verify your email address with the OTP code before submitting.'
      });
      return;
    }

    // 2. Phone Check
    const phoneErr = validatePhone(formData.phone);
    if (!formData.phone || phoneErr) {
      setPhoneError(phoneErr || 'Valid 10-digit phone number is required.');
      setStatus({
        success: false,
        message: phoneErr || 'Please provide a valid 10-digit mobile number.'
      });
      return;
    }

    setLoading(true);
    const submittedEmail = formData.email;

    try {
      const response = await fetch(`${API_BASE_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          verification_token: verificationToken
        })
      });
      const data = await response.json();

      if (response.ok && data.success) {
        const refMsg = data.request_no ? ` (Ref: ${data.request_no})` : '';
        setStatus({
          success: true,
          message: (data.message || "Thanks for reaching out! We'll get back to you soon.") + refMsg
        });
        if (submittedEmail) {
          sessionStorage.setItem('wingroo_student_lookup', submittedEmail);
        }
        window.dispatchEvent(new CustomEvent('wingroo_data_changed'));
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: 'Project Inquiry',
          message: ''
        });
        setEmailVerified(false);
        setVerificationToken('');
        setOtpSent(false);
        setOtpCode('');
        setOtpStatus(null);
      } else {
        setStatus({
          success: false,
          message: data.message || 'Error sending message. Please try again.'
        });
      }
    } catch (err) {
      setStatus({
        success: false,
        message: 'Network error: Failed to reach the server. Please check your connection and try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="contact-section">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <div className="section-tag">
            <span className="dot" />
            <span>Get In Touch</span>
          </div>
          <h2 className="section-title">Let's Start a Conversation.</h2>
          <p className="section-desc">
            Have a project in mind? Looking for a technology partner? Interested in an internship or collaboration?
            Tell us what you're working on. Let's explore what we can create together.
          </p>
        </div>

        {/* Contact Layout Grid */}
        <div className="contact-grid">
          {/* Left Column: Form */}
          <div className="contact-form-card modern-card">
            <div className="form-card-header">
              <h3 className="form-card-title">Send Us a Direct Message</h3>
              <p className="form-card-desc">We usually respond within 24 business hours.</p>
            </div>

            {status && (
              <div className={`status-banner ${status.success ? 'status-success' : 'status-error'}`}>
                {status.success ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                <span>{status.message}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="contact-form">
              {/* Name Field */}
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  className="form-input"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              {/* Email Field with Real-time OTP Verification */}
              <div className="form-group email-verify-group">
                <div className="form-label-row">
                  <label className="form-label">Email Address *</label>
                  {emailVerified ? (
                    <span className="verify-badge verified">
                      <CheckCircle2 size={13} /> Email Verified
                    </span>
                  ) : (
                    <span className="verify-badge unverified">
                      Verification Required
                    </span>
                  )}
                </div>

                <div className="input-with-action">
                  <input
                    type="email"
                    name="email"
                    required
                    disabled={emailVerified}
                    className={`form-input ${emailVerified ? 'input-verified' : ''} ${emailError ? 'input-error' : ''}`}
                    placeholder="Enter your active email address"
                    value={formData.email}
                    onChange={handleEmailChange}
                  />
                  {!emailVerified && (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={otpLoading || !isEmailFormatValid(formData.email) || otpCountdown > 0}
                      className="btn-verify-action"
                    >
                      {otpLoading ? (
                        <span className="btn-loading-wrap">
                          <Loader2 size={13} className="spin-icon" /> Sending...
                        </span>
                      ) : otpCountdown > 0 ? (
                        `Resend (${otpCountdown}s)`
                      ) : otpSent ? (
                        'Resend OTP'
                      ) : (
                        'Verify Email'
                      )}
                    </button>
                  )}
                  {emailVerified && (
                    <button
                      type="button"
                      onClick={handleResetEmail}
                      className="btn-change-email"
                      title="Change email"
                    >
                      Change
                    </button>
                  )}
                </div>

                {emailError && <div className="field-error-msg">{emailError}</div>}

                {/* OTP Drawer */}
                {otpSent && !emailVerified && (
                  <div className="otp-verification-card">
                    <div className="otp-card-header">
                      <KeyRound size={16} className="otp-icon" />
                      <span>
                        Enter the 6-digit code sent to <strong>{formData.email}</strong>
                      </span>
                    </div>

                    <div className="otp-input-row">
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        className="otp-code-input"
                        placeholder="• • • • • •"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      />
                      <button
                        type="button"
                        onClick={handleVerifyOtp}
                        disabled={otpVerifying || otpCode.length !== 6}
                        className="btn btn-primary btn-verify-otp"
                      >
                        {otpVerifying ? (
                          <>
                            <Loader2 size={14} className="spin-icon" /> Verifying...
                          </>
                        ) : (
                          'Verify OTP'
                        )}
                      </button>
                    </div>

                    {otpStatus && (
                      <div className={`otp-status-msg ${otpStatus.success ? 'success' : 'error'}`}>
                        {otpStatus.success ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                        <span>{otpStatus.message}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Phone & Inquiry Row */}
              <div className="form-row">
                {/* Phone Field with Strict Indian Validation */}
                <div className="form-group">
                  <div className="form-label-row">
                    <label className="form-label">Phone Number *</label>
                    {formData.phone && !phoneError && formData.phone.replace(/\D/g, '').length === 10 && (
                      <span className="verify-badge valid-badge">
                        <CheckCircle2 size={13} /> Valid 10-Digit
                      </span>
                    )}
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    required
                    maxLength={13}
                    className={`form-input ${phoneError ? 'input-error' : ''}`}
                    placeholder="Enter 10-digit mobile number"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                  />
                  {phoneError ? (
                    <div className="field-error-msg">{phoneError}</div>
                  ) : (
                    <div className="field-hint-msg">Must be 10 digits starting with 6, 7, 8, or 9.</div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">What are you looking for?</label>
                  <select
                    name="subject"
                    className="form-select"
                    value={formData.subject}
                    onChange={handleChange}
                  >
                    <option value="Project">Project / Client Solution</option>
                    <option value="Internship">Internship Inquiry</option>
                    <option value="Collaboration">Institutional / College Collaboration</option>
                    <option value="Other">Other Query</option>
                  </select>
                </div>
              </div>

              {/* Message Field */}
              <div className="form-group">
                <label className="form-label">Tell us about it *</label>
                <textarea
                  name="message"
                  required
                  className="form-textarea"
                  rows={4}
                  placeholder="Describe your requirements, goals, or project scope..."
                  value={formData.message}
                  onChange={handleChange}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !emailVerified || !!phoneError || !formData.name || !formData.message}
                className={`btn btn-primary contact-submit-btn ${!emailVerified ? 'btn-needs-verification' : ''}`}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="spin-icon" />
                    <span>Sending Message...</span>
                  </>
                ) : (
                  <>
                    <span>{emailVerified ? 'SEND MESSAGE' : 'VERIFY EMAIL TO SUBMIT'}</span>
                    <Send size={16} />
                  </>
                )}
              </button>

              {!emailVerified && (
                <p className="submit-hint-note">
                  🔒 Note: Please click <strong>"Verify Email"</strong> and enter the 6-digit OTP code to enable message sending.
                </p>
              )}
            </form>
          </div>

          {/* Right Column: Company Info */}
          <div className="contact-info-col">
            <div className="info-card modern-card">
              <div className="info-card-header">
                <h3 className="info-card-title">Wingroo Technologies</h3>
                <p className="info-card-sub">Engineering Modern Solutions & Opportunities</p>
              </div>

              <div className="info-items-list">
                <div className="info-item">
                  <div className="info-icon-box">
                    <MapPin size={20} />
                  </div>
                  <div className="info-details">
                    <span className="info-label">Office Address</span>
                    <p className="info-val">
                      9/4, Kurinji Nagar, Near Central Studio,<br />
                      Singanallur, Ramanathapuram,<br />
                      Coimbatore - 641005, Tamil Nadu, India.
                    </p>
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-icon-box">
                    <Mail size={20} />
                  </div>
                  <div className="info-details">
                    <span className="info-label">Email Support</span>
                    <a href="mailto:wingrootechnologies@gmail.com" className="info-link">
                      wingrootechnologies@gmail.com
                    </a>
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-icon-box">
                    <Phone size={20} />
                  </div>
                  <div className="info-details">
                    <span className="info-label">Direct Line</span>
                    <a href="tel:+919626779609" className="info-link">
                      +91 96267 79609
                    </a>
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-icon-box">
                    <Clock size={20} />
                  </div>
                  <div className="info-details">
                    <span className="info-label">Business Hours</span>
                    <p className="info-val">
                      Monday – Saturday: 9:30 AM – 6:30 PM<br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>

              {/* WhatsApp Quick Connect Box */}
              <div className="whatsapp-quick-box">
                <div className="whatsapp-text">
                  <strong>Prefer Instant WhatsApp Chat?</strong>
                  <p>Connect with our engineering & support team directly on WhatsApp.</p>
                </div>
                <a
                  href="https://wa.me/919626779609?text=Hello%20Wingroo%20Technologies,%20I%20have%20an%20inquiry."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline whatsapp-btn"
                >
                  <MessageSquare size={16} />
                  <span>Chat on WhatsApp</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Embedded Google Map Section */}
        <div className="contact-map-full-card">
          <div className="map-card-header">
            <div className="map-pin-pill">
              <MapPin size={14} />
              <span>Wingroo Technologies HQ • Coimbatore</span>
            </div>
            <a
              href="https://maps.google.com/?q=Wingroo+Technologies+Singanallur+Coimbatore"
              target="_blank"
              rel="noopener noreferrer"
              className="map-directions-link"
            >
              <span>Get Directions</span>
              <ExternalLink size={13} />
            </a>
          </div>

          <div className="google-map-iframe-wrap">
            <iframe
              title="Wingroo Technologies Office Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3916.486241285098!2d76.99532587570417!3d11.002081654992985!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba859b99911e3b5%3A0xe7f98d7db52ec44e!2sKurinji%20Nagar%2C%20Singanallur%2C%20Tamil%20Nadu%20641005!5e0!3m2!1sen!2sin!4v1711200000000!5m2!1sen!2sin"
              width="100%"
              height="260"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          <div className="map-address-footer">
            <p>
              📍 9/4, Kurinji Nagar, Near Central Studio, Singanallur, Ramanathapuram, Coimbatore - 641005. Landmark: Near Singanallur Central Studio.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
