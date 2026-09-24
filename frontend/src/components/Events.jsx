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
  const [registered, setRegistered] = useState(false);

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
    setRegistered(false);
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setRegistered(true);
    setTimeout(() => {
      setSelectedEvent(null);
      setRegistered(false);
    }, 2200);
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

            {registered ? (
              <div className="status-alert status-success">
                <CheckCircle size={18} />
                <span>You're on the invite list! We'll notify you when dates are announced.</span>
              </div>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="intern-form">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input type="text" required className="form-input" placeholder="Enter your full name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input type="email" required className="form-input" placeholder="Enter your email address" />
                </div>
                <div className="form-group">
                  <label className="form-label">College / Organization</label>
                  <input type="text" required className="form-input" placeholder="Enter college or organization name" />
                </div>
                <button type="submit" className="btn btn-primary modal-submit-btn">
                  <span>Confirm Registration</span>
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
