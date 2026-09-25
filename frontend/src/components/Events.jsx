import React, { useState, useEffect } from 'react';
import { 
  Mic2, 
  TerminalSquare, 
  Trophy, 
  Briefcase, 
  Calendar, 
  MapPin, 
  ArrowRight, 
  Sparkles,
  CheckCircle,
  X
} from 'lucide-react';
import './Events.css';

import { API_BASE_URL } from '../config/api';

const DEFAULT_EVENTS = [
  {
    id: 1,
    title: 'Tech Talks',
    tagline: 'Ideas Worth Talking About.',
    description: 'Interactive sessions covering emerging technologies, development trends, career opportunities and insights from the technology industry.',
    event_date: 'Monthly Series',
    location: 'Wingroo Innovation Hub & Virtual Stream',
    badge: 'Interactive',
    icon: <Mic2 size={24} />
  },
  {
    id: 2,
    title: 'Technical Workshops',
    tagline: "Don't Just Watch. Build.",
    description: 'Hands-on learning sessions where participants can explore technologies, work with tools and understand concepts by actually applying them.',
    event_date: 'Bi-Weekly Cohorts',
    location: 'Hybrid Labs (Hands-on)',
    badge: 'Hands-On',
    icon: <TerminalSquare size={24} />
  },
  {
    id: 3,
    title: 'Hackathons',
    tagline: 'Think Fast. Build Smart.',
    description: 'Collaborative challenges that encourage participants to turn ideas into working solutions while solving practical problems.',
    event_date: 'Quarterly Sprint',
    location: 'Campus & Open Tech Arena',
    badge: 'Competition',
    icon: <Trophy size={24} />
  },
  {
    id: 4,
    title: 'Career & Industry Sessions',
    tagline: 'Know What Comes After College.',
    description: 'Sessions designed to help students understand industry expectations, career paths, technical skills and the transition from student life to professional life.',
    event_date: 'Upcoming Schedule',
    location: 'Industry Mentor Panel',
    badge: 'Career Growth',
    icon: <Briefcase size={24} />
  }
];

export default function Events() {
  const [eventsList, setEventsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [regResult, setRegResult] = useState(null);
  const [regError, setRegError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    college: '',
    year: ''
  });

  const fetchEvents = () => {
    fetch(`${API_BASE_URL}/api/events`)
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.events)) {
          const icons = [<Mic2 size={24} />, <TerminalSquare size={24} />, <Trophy size={24} />, <Briefcase size={24} />];
          const enriched = data.events.map((ev, index) => ({
            ...ev,
            icon: icons[index % icons.length]
          }));
          setEventsList(enriched);
        } else {
          setEventsList([]);
        }
      })
      .catch(() => {
        setEventsList([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchEvents();
    window.addEventListener('wingroo_data_changed', fetchEvents);
    return () => window.removeEventListener('wingroo_data_changed', fetchEvents);
  }, []);

  const handleRegisterClick = (event) => {
    setSelectedEvent(event);
    setRegResult(null);
    setRegError('');
    setFormData({
      name: '',
      email: '',
      phone: '',
      college: '',
      year: ''
    });
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setRegError('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/events/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          event_id: selectedEvent?.id,
          event_title: selectedEvent?.title
        })
      });
      const data = await res.json();
      if (data.success) {
        setRegResult(data);
        // Save email so student portal opens right into this student's records
        if (formData.email) {
          sessionStorage.setItem('wingroo_student_lookup', formData.email);
        }
        // Dispatch live event to update Admin and Student portals everywhere
        window.dispatchEvent(new CustomEvent('wingroo_data_changed'));
      } else {
        setRegError(data.message || 'Registration failed. Please check details.');
      }
    } catch (err) {
      setRegError('Unable to connect to server. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="events" className="events-section">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <div className="section-tag">
            <span className="dot" />
            <span>Community & Learning</span>
          </div>
          <h2 className="section-title">Where Curiosity Meets Technology.</h2>
          <p className="section-desc">
            Technology never stands still. New tools, ideas and opportunities are constantly changing 
            the way we build and work. Our events are designed to bring students, developers and 
            technology enthusiasts together to learn, explore and exchange ideas beyond the classroom.
          </p>
        </div>

        {/* Event Cards */}
        {eventsList.length > 0 ? (
          <div className="events-grid">
            {eventsList.map((ev, idx) => (
              <div key={ev.id || idx} className="event-card modern-card">
                {/* Event Poster Image if available */}
                {ev.poster_url && (
                  <div className="event-poster-container">
                    <img src={ev.poster_url} alt={ev.title} className="event-poster-img" />
                  </div>
                )}

              <div className="event-card-top">
                <div className="event-icon-box">
                  {ev.icon || <Sparkles size={24} />}
                </div>
                <span className="event-badge">{ev.badge || 'Featured Event'}</span>
              </div>

              <div className="event-card-body">
                <h3 className="event-title">{ev.title}</h3>
                <div className="event-tagline">{ev.tagline}</div>
                <p className="event-desc">{ev.description}</p>
              </div>

              <div className="event-card-meta">
                <div className="meta-item">
                  <Calendar size={15} className="meta-icon" />
                  <span>{ev.event_date}</span>
                </div>
                <div className="meta-item">
                  <MapPin size={15} className="meta-icon" />
                  <span>{ev.location}</span>
                </div>
              </div>

              <button 
                onClick={() => handleRegisterClick(ev)} 
                className="btn btn-outline event-action-btn"
              >
                <span>Register Interest</span>
                <ArrowRight size={15} />
              </button>
            </div>
          ))}
          </div>
        ) : (
          <div className="events-empty-state modern-card" style={{ textAlign: 'center', padding: '50px 20px', margin: '20px 0', border: '1px dashed rgba(255,255,255,0.12)' }}>
            <Calendar size={40} style={{ color: '#0ea5e9', marginBottom: '14px', opacity: 0.8 }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#f8fafc', marginBottom: '8px' }}>No Scheduled Events at the Moment</h3>
            <p style={{ color: '#94a3b8', maxWidth: '520px', margin: '0 auto', fontSize: '0.92rem' }}>
              We are curating high-impact tech talks, workshops, and hackathons. New session schedules will be announced here shortly!
            </p>
          </div>
        )}
        <div className="events-footer-cta">
          <div className="events-cta-text">
            <h4>Host an Event at Your Institution or Organization?</h4>
            <p>We partner with engineering colleges and tech clubs for tailored hackathons and bootcamps.</p>
          </div>
          <a href="#contact" className="btn btn-primary">
            <span>Explore Upcoming Events</span>
            <ArrowRight size={16} />
          </a>
        </div>
      </div>

      {/* Event Interest Modal */}
      {selectedEvent && (
        <div className="modal-overlay" onClick={() => setSelectedEvent(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedEvent(null)}>
              <X size={20} />
            </button>

            <div className="modal-header">
              <div className="modal-tag">{selectedEvent.title}</div>
              <h3 className="modal-title">Join Next Session</h3>
              <p className="modal-desc">{selectedEvent.tagline}</p>
            </div>

            {selectedEvent.poster_url && (
              <div className="modal-poster-wrap">
                <img src={selectedEvent.poster_url} alt={selectedEvent.title} className="modal-poster-img" />
              </div>
            )}

            {regResult ? (
              <div className="event-reg-success-card">
                <div className="status-alert status-success" style={{ marginBottom: '16px' }}>
                  <CheckCircle size={20} style={{ color: '#10b981', flexShrink: 0 }} />
                  <div>
                    <strong>Registration Confirmed!</strong>
                    <div>You are officially registered for {selectedEvent.title}.</div>
                  </div>
                </div>

                <div className="reg-id-display-box" style={{ background: 'rgba(14, 165, 233, 0.1)', border: '1px solid rgba(14, 165, 233, 0.3)', borderRadius: '8px', padding: '14px', textAlign: 'center', marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Event Registration Ref</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#38bdf8', letterSpacing: '0.03em', marginTop: '4px' }}>
                    {regResult.registration_no}
                  </div>
                </div>

                <div style={{ fontSize: '0.86rem', color: '#cbd5e1', lineHeight: '1.5', marginBottom: '20px', textAlign: 'center' }}>
                  Your details have been updated in both the <strong>Admin Portal</strong> and <strong>Student Portal</strong>. You can search your email anytime in the Student Portal to view your official Entry Pass!
                </div>

                <button 
                  type="button" 
                  onClick={() => setSelectedEvent(null)} 
                  className="btn btn-primary" 
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <span>Done / Close</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="intern-form">
                {regError && (
                  <div className="status-alert status-error" style={{ color: '#ef4444', background: 'rgba(239,68,68,0.1)', padding: '10px 14px', borderRadius: '8px', marginBottom: '14px', fontSize: '0.85rem' }}>
                    {regError}
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="form-input" 
                    placeholder="Enter your full name" 
                  />
                </div>
                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Email Address *</label>
                    <input 
                      type="email" 
                      required 
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="form-input" 
                      placeholder="e.g. candidate@gmail.com" 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone / WhatsApp *</label>
                    <input 
                      type="tel" 
                      required 
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="form-input" 
                      placeholder="e.g. 9876543210" 
                    />
                  </div>
                </div>
                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">College / Organization *</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.college}
                      onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                      className="form-input" 
                      placeholder="College or company name" 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Year / Role</label>
                    <input 
                      type="text" 
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      className="form-input" 
                      placeholder="e.g. 3rd Year / Dev" 
                    />
                  </div>
                </div>
                <button 
                  type="submit" 
                  disabled={submitting} 
                  className="btn btn-primary modal-submit-btn" 
                  style={{ width: '100%', marginTop: '8px' }}
                >
                  <span>{submitting ? 'Registering...' : 'Confirm Registration'}</span>
                  <ArrowRight size={16} />
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
