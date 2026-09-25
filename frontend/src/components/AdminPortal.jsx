import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  X, 
  RefreshCw, 
  Mail, 
  Phone, 
  GraduationCap, 
  MessageSquare, 
  Trash2, 
  ExternalLink, 
  Search, 
  Download, 
  Eye, 
  Lock, 
  CheckCircle, 
  Database, 
  PlusCircle, 
  FolderGit2, 
  CalendarCheck, 
  Globe, 
  Upload, 
  Image as ImageIcon, 
  Video 
} from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import './AdminPortal.css';

const API_BASE = API_BASE_URL || '';

export default function AdminPortal({ isOpen, onClose, onDataChanged }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('wingroo_admin_auth') === 'true';
  });
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState('');
  
  const [activeTab, setActiveTab] = useState('contacts'); // 'contacts' | 'internships' | 'event_registrations' | 'projects' | 'events'
  const [stats, setStats] = useState({ 
    total_contacts: 0, 
    total_internships: 0, 
    total_projects: 0, 
    total_events: 0, 
    total_event_registrations: 0,
    total_submissions: 0 
  });
  const [contacts, setContacts] = useState([]);
  const [internships, setInternships] = useState([]);
  const [eventRegistrations, setEventRegistrations] = useState([]);
  const [projects, setProjects] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selected detail item for full popup
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedType, setSelectedType] = useState(''); // 'contact' | 'internship'

  // Form states for creating new project
  const [newProject, setNewProject] = useState({
    title: '',
    heading: '',
    category: 'Web Application',
    tag: 'Featured Project',
    tags: '',
    demoUrl: 'https://wingrootechnologies.com/',
    themeColor: '#4f46e5',
    image: '',
    videoUrl: '',
    mediaType: 'image',
    description: ''
  });
  const [projectPosting, setProjectPosting] = useState(false);
  const [projectUploading, setProjectUploading] = useState(false);
  const [projectSuccessMsg, setProjectSuccessMsg] = useState('');

  // Form states for creating new event
  const [newEvent, setNewEvent] = useState({
    title: '',
    tagline: '',
    badge: 'Interactive',
    event_date: 'Upcoming Cohort',
    location: 'Wingroo Innovation Hub & Online',
    poster_url: '',
    description: ''
  });
  const [eventPosting, setEventPosting] = useState(false);
  const [eventUploading, setEventUploading] = useState(false);
  const [eventSuccessMsg, setEventSuccessMsg] = useState('');

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      loadAllData();
    }
  }, [isOpen, isAuthenticated]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!passcode) return;
    
    // Default passcodes
    if (['admin', 'admin123', 'wingroo', 'wingroo2026'].includes(passcode.trim())) {
      setIsAuthenticated(true);
      sessionStorage.setItem('wingroo_admin_auth', 'true');
      setAuthError('');
      loadAllData();
    } else {
      setAuthError('Incorrect passcode. Try: admin123');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('wingroo_admin_auth');
    setPasscode('');
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      // 1. Overview stats
      const statsRes = await fetch(`${API_BASE}/api/admin/overview`);
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        if (statsData.success) {
          setStats(statsData.stats);
        }
      }

      // 2. Contacts
      const contactsRes = await fetch(`${API_BASE}/api/admin/contacts`);
      if (contactsRes.ok) {
        const contactsData = await contactsRes.json();
        if (contactsData.success) {
          setContacts(contactsData.contacts || []);
        }
      }

      // 3. Internships
      const internsRes = await fetch(`${API_BASE}/api/admin/internships`);
      if (internsRes.ok) {
        const internsData = await internsRes.json();
        if (internsData.success) {
          setInternships(internsData.internships || []);
        }
      }

      // 3b. Event Registrations
      const evRegRes = await fetch(`${API_BASE}/api/admin/event-registrations`);
      if (evRegRes.ok) {
        const evRegData = await evRegRes.json();
        if (evRegData.success) {
          setEventRegistrations(evRegData.registrations || []);
        }
      }

      // 4. Projects
      const projRes = await fetch(`${API_BASE}/api/projects`);
      if (projRes.ok) {
        const projData = await projRes.json();
        if (projData.success) {
          setProjects(projData.projects || []);
        }
      }

      // 5. Events
      const evRes = await fetch(`${API_BASE}/api/events`);
      if (evRes.ok) {
        const evData = await evRes.json();
        if (evData.success) {
          setEvents(evData.events || []);
        }
      }
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  // --- FILE UPLOAD HANDLERS ---
  const handleProjectFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setProjectUploading(true);
    try {
      const res = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        if (data.media_type === 'video') {
          setNewProject(prev => ({ ...prev, videoUrl: data.url, mediaType: 'video' }));
        } else {
          setNewProject(prev => ({ ...prev, image: data.url, mediaType: 'image' }));
        }
      } else {
        alert(data.message || 'File upload failed');
      }
    } catch (err) {
      alert('Error uploading file to server: ' + err.message);
    } finally {
      setProjectUploading(false);
    }
  };

  const handleEventPosterUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setEventUploading(true);
    try {
      const res = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setNewEvent(prev => ({ ...prev, poster_url: data.url }));
      } else {
        alert(data.message || 'Poster upload failed');
      }
    } catch (err) {
      alert('Error uploading poster: ' + err.message);
    } finally {
      setEventUploading(false);
    }
  };

  // --- DELETE HANDLERS ---
  const handleDeleteContact = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete inquiry #${id}?`)) return;

    try {
      const res = await fetch(`${API_BASE}/api/admin/contacts/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setContacts(prev => prev.filter(c => c.id !== id));
        setStats(prev => ({
          ...prev, 
          total_contacts: Math.max(0, prev.total_contacts - 1),
          total_submissions: Math.max(0, prev.total_submissions - 1)
        }));
        if (selectedItem?.id === id) setSelectedItem(null);
      }
    } catch (err) {
      alert('Failed to delete contact record.');
    }
  };

  const handleDeleteInternship = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete internship application #${id}?`)) return;

    try {
      const res = await fetch(`${API_BASE}/api/admin/internships/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setInternships(prev => prev.filter(i => i.id !== id));
        setStats(prev => ({
          ...prev, 
          total_internships: Math.max(0, prev.total_internships - 1),
          total_submissions: Math.max(0, prev.total_submissions - 1)
        }));
        if (selectedItem?.id === id) setSelectedItem(null);
      }
    } catch (err) {
      alert('Failed to delete internship record.');
    }
  };

  const handleUpdateInternshipStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/internships/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setInternships(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
        window.dispatchEvent(new CustomEvent('wingroo_data_changed'));
        if (typeof onDataChanged === 'function') onDataChanged();
      } else {
        alert(data.message || 'Failed to update status');
      }
    } catch (err) {
      alert('Status update error: ' + err.message);
    }
  };

  const handleUpdateEventRegStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/event-registrations/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setEventRegistrations(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
        window.dispatchEvent(new CustomEvent('wingroo_data_changed'));
        if (typeof onDataChanged === 'function') onDataChanged();
      } else {
        alert(data.message || 'Failed to update status');
      }
    } catch (err) {
      alert('Status update error: ' + err.message);
    }
  };

  const handleDeleteEventReg = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete event registration #${id}?`)) return;

    try {
      const res = await fetch(`${API_BASE}/api/admin/event-registrations/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setEventRegistrations(prev => prev.filter(r => r.id !== id));
        setStats(prev => ({
          ...prev, 
          total_event_registrations: Math.max(0, (prev.total_event_registrations || 1) - 1),
          total_submissions: Math.max(0, (prev.total_submissions || 1) - 1)
        }));
        window.dispatchEvent(new CustomEvent('wingroo_data_changed'));
        if (typeof onDataChanged === 'function') onDataChanged();
      } else {
        alert(data.message || 'Failed to delete event registration.');
      }
    } catch (err) {
      alert('Delete error: ' + err.message);
    }
  };


  const handleDeleteProject = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete project #${id}?`)) return;

    try {
      const res = await fetch(`${API_BASE}/api/projects/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setProjects(prev => prev.filter(p => p.id !== id));
        setStats(prev => ({
          ...prev, 
          total_projects: Math.max(0, (prev.total_projects || 1) - 1)
        }));
        // Fire live update event so website updates instantly
        window.dispatchEvent(new CustomEvent('wingroo_data_changed'));
        if (typeof onDataChanged === 'function') onDataChanged();
      } else {
        alert(data.message || 'Failed to delete project.');
      }
    } catch (err) {
      alert('Failed to delete project: ' + err.message);
    }
  };

  const handleDeleteEvent = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete event #${id}?`)) return;

    try {
      const res = await fetch(`${API_BASE}/api/events/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setEvents(prev => prev.filter(ev => ev.id !== id));
        setStats(prev => ({
          ...prev, 
          total_events: Math.max(0, (prev.total_events || 1) - 1)
        }));
        // Fire live update event so website updates instantly
        window.dispatchEvent(new CustomEvent('wingroo_data_changed'));
        if (typeof onDataChanged === 'function') onDataChanged();
      } else {
        alert(data.message || 'Failed to delete event.');
      }
    } catch (err) {
      alert('Failed to delete event: ' + err.message);
    }
  };

  // --- POST NEW PROJECT ---
  const handlePostProject = async (e) => {
    e.preventDefault();
    if (!newProject.title || !newProject.description) {
      alert('Please fill Project Title and Description.');
      return;
    }

    setProjectPosting(true);
    setProjectSuccessMsg('');
    try {
      const res = await fetch(`${API_BASE}/api/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProject)
      });
      const data = await res.json();
      if (data.success) {
        setProjectSuccessMsg('Project posted successfully to Portfolio!');
        setNewProject({
          title: '',
          heading: '',
          category: 'Web Application',
          tag: 'Featured Project',
          tags: '',
          demoUrl: 'https://wingrootechnologies.com/',
          themeColor: '#4f46e5',
          image: '',
          videoUrl: '',
          mediaType: 'image',
          description: ''
        });
        loadAllData();
        window.dispatchEvent(new CustomEvent('wingroo_data_changed'));
        if (typeof onDataChanged === 'function') onDataChanged();
        setTimeout(() => setProjectSuccessMsg(''), 4000);
      } else {
        alert(data.message || 'Error posting project.');
      }
    } catch (err) {
      alert('Failed to connect to backend server: ' + err.message);
    } finally {
      setProjectPosting(false);
    }
  };

  // --- POST NEW EVENT ---
  const handlePostEvent = async (e) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.description) {
      alert('Please fill Event Title and Description.');
      return;
    }

    setEventPosting(true);
    setEventSuccessMsg('');
    try {
      const res = await fetch(`${API_BASE}/api/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEvent)
      });
      const data = await res.json();
      if (data.success) {
        setEventSuccessMsg('New event published successfully!');
        setNewEvent({
          title: '',
          tagline: '',
          badge: 'Interactive',
          event_date: 'Upcoming Cohort',
          location: 'Wingroo Innovation Hub & Online',
          poster_url: '',
          description: ''
        });
        loadAllData();
        window.dispatchEvent(new CustomEvent('wingroo_data_changed'));
        if (typeof onDataChanged === 'function') onDataChanged();
        setTimeout(() => setEventSuccessMsg(''), 4000);
      } else {
        alert(data.message || 'Error posting event.');
      }
    } catch (err) {
      alert('Failed to connect to backend server: ' + err.message);
    } finally {
      setEventPosting(false);
    }
  };

  const exportToCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    if (activeTab === 'contacts') {
      csvContent += "ID,Name,Email,Phone,Subject,Message,Date\n";
      contacts.forEach(c => {
        const cleanMsg = `"${(c.message || '').replace(/"/g, '""')}"`;
        csvContent += `${c.id},"${c.name}","${c.email}","${c.phone || ''}","${c.subject || ''}",${cleanMsg},"${c.created_at || ''}"\n`;
      });
    } else if (activeTab === 'internships') {
      csvContent += "ID,Name,Email,Phone,College,Course,Year,InternshipType,Technology,Message,Date\n";
      internships.forEach(i => {
        const cleanMsg = `"${(i.message || '').replace(/"/g, '""')}"`;
        csvContent += `${i.id},"${i.name}","${i.email}","${i.phone}","${i.college}","${i.course}","${i.year}","${i.internship_type}","${i.technology}",${cleanMsg},"${i.created_at || ''}"\n`;
      });
    } else if (activeTab === 'event_registrations') {
      csvContent += "ID,RegNo,Event,Name,Email,Phone,College,Year,Status,Date\n";
      eventRegistrations.forEach(r => {
        csvContent += `${r.id},"${r.registration_no}","${r.event_title}","${r.name}","${r.email}","${r.phone}","${r.college}","${r.year || ''}","${r.status}","${r.created_at || ''}"\n`;
      });
    } else if (activeTab === 'projects') {
      csvContent += "ID,Title,Heading,Category,Tags,Media,DemoURL\n";
      projects.forEach(p => {
        csvContent += `${p.id},"${p.title}","${p.heading || ''}","${p.category || ''}","${(p.tags || []).join(';')}","${p.videoUrl || p.image || ''}","${p.demoUrl || ''}"\n`;
      });
    } else {
      csvContent += "ID,Title,Tagline,Badge,Date,Location,Poster\n";
      events.forEach(ev => {
        csvContent += `${ev.id},"${ev.title}","${ev.tagline || ''}","${ev.badge || ''}","${ev.event_date || ''}","${ev.location || ''}","${ev.poster_url || ''}"\n`;
      });
    }
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `wingroo_${activeTab}_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  // Search filters
  const filteredContacts = contacts.filter(c => {
    const q = searchQuery.toLowerCase();
    return (
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.phone && c.phone.toLowerCase().includes(q)) ||
      (c.subject && c.subject.toLowerCase().includes(q)) ||
      (c.message && c.message.toLowerCase().includes(q))
    );
  });

  const filteredInternships = internships.filter(i => {
    const q = searchQuery.toLowerCase();
    return (
      (i.name && i.name.toLowerCase().includes(q)) ||
      (i.email && i.email.toLowerCase().includes(q)) ||
      (i.phone && i.phone.toLowerCase().includes(q)) ||
      (i.college && i.college.toLowerCase().includes(q)) ||
      (i.course && i.course.toLowerCase().includes(q)) ||
      (i.technology && i.technology.toLowerCase().includes(q))
    );
  });

  const filteredEventRegs = eventRegistrations.filter(r => {
    const q = searchQuery.toLowerCase();
    return (
      (r.name && r.name.toLowerCase().includes(q)) ||
      (r.email && r.email.toLowerCase().includes(q)) ||
      (r.phone && r.phone.toLowerCase().includes(q)) ||
      (r.college && r.college.toLowerCase().includes(q)) ||
      (r.event_title && r.event_title.toLowerCase().includes(q)) ||
      (r.registration_no && r.registration_no.toLowerCase().includes(q))
    );
  });

  const filteredProjects = projects.filter(p => {
    const q = searchQuery.toLowerCase();
    return (
      (p.title && p.title.toLowerCase().includes(q)) ||
      (p.heading && p.heading.toLowerCase().includes(q)) ||
      (p.category && p.category.toLowerCase().includes(q)) ||
      (p.description && p.description.toLowerCase().includes(q))
    );
  });

  const filteredEvents = events.filter(ev => {
    const q = searchQuery.toLowerCase();
    return (
      (ev.title && ev.title.toLowerCase().includes(q)) ||
      (ev.tagline && ev.tagline.toLowerCase().includes(q)) ||
      (ev.location && ev.location.toLowerCase().includes(q)) ||
      (ev.description && ev.description.toLowerCase().includes(q))
    );
  });

  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div className="admin-portal-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="admin-modal-header">
          <div className="admin-header-title-wrap">
            <div className="admin-header-icon">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h3 className="admin-header-title">
                Wingroo Technologies — Admin Center
                <span className="admin-db-badge">
                  <span className="pulse-live-dot" />
                  Live MySQL: wingrootech_db
                </span>
              </h3>
              <p className="admin-header-subtitle">
                Manage inquiries, student applications, portfolio projects & public events
              </p>
            </div>
          </div>

          <div className="admin-header-actions">
            {isAuthenticated && (
              <>
                <button 
                  onClick={loadAllData} 
                  className="admin-icon-btn" 
                  title="Refresh latest data from database"
                >
                  <RefreshCw size={16} className={loading ? 'spin-anim' : ''} />
                </button>
                <button 
                  onClick={handleLogout} 
                  className="admin-icon-btn" 
                  title="Lock / Logout"
                >
                  <Lock size={16} />
                </button>
              </>
            )}
            <button 
              onClick={onClose} 
              className="admin-icon-btn admin-close-btn" 
              title="Close Portal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Not Authenticated: Login View */}
        {!isAuthenticated ? (
          <div className="admin-login-body">
            <div className="admin-login-card">
              <div className="admin-login-icon">
                <Lock size={26} />
              </div>
              <h3 className="admin-login-title">Admin Access Required</h3>
              <p className="admin-login-subtitle">
                Enter your security passcode to manage website content, form submissions and postings.
              </p>

              <form onSubmit={handleLogin}>
                <input 
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter Admin Passcode"
                  className="admin-passcode-input"
                  autoFocus
                />
                {authError && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginBottom: '10px' }}>{authError}</p>}
                
                <button type="submit" className="admin-login-btn">
                  <span>Unlock Admin Portal</span>
                  <CheckCircle size={16} />
                </button>
              </form>
              <p className="admin-hint-text">Default Key: <code>admin123</code></p>
            </div>
          </div>
        ) : (
          /* Authenticated Dashboard */
          <div className="admin-dashboard-body">
            {/* Stats Row */}
            <div className="admin-stats-grid">
              <div className="admin-stat-card">
                <div className="admin-stat-icon-wrap icon-purple">
                  <MessageSquare size={24} />
                </div>
                <div>
                  <div className="admin-stat-val">{stats.total_contacts}</div>
                  <div className="admin-stat-label">Contact Inquiries</div>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="admin-stat-icon-wrap icon-emerald">
                  <GraduationCap size={24} />
                </div>
                <div>
                  <div className="admin-stat-val">{stats.total_internships}</div>
                  <div className="admin-stat-label">Intern Applications</div>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="admin-stat-icon-wrap icon-blue">
                  <FolderGit2 size={24} />
                </div>
                <div>
                  <div className="admin-stat-val">{projects.length}</div>
                  <div className="admin-stat-label">Portfolio Projects</div>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="admin-stat-icon-wrap" style={{ background: '#e0f2fe', color: '#0284c7' }}>
                  <CalendarCheck size={24} />
                </div>
                <div>
                  <div className="admin-stat-val">{eventRegistrations.length}</div>
                  <div className="admin-stat-label">Event Registrations</div>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="admin-stat-icon-wrap" style={{ background: '#fffbeb', color: '#d97706' }}>
                  <CalendarCheck size={24} />
                </div>
                <div>
                  <div className="admin-stat-val">{events.length}</div>
                  <div className="admin-stat-label">Public Events</div>
                </div>
              </div>
            </div>

            {/* Controls Bar: 5 Tabs, Search, Export */}
            <div className="admin-controls-bar">
              <div className="admin-tabs-list">
                <button 
                  className={`admin-tab-btn ${activeTab === 'contacts' ? 'active' : ''}`}
                  onClick={() => setActiveTab('contacts')}
                >
                  <MessageSquare size={16} />
                  <span>Contacts</span>
                  <span className="admin-tab-count">{contacts.length}</span>
                </button>
                <button 
                  className={`admin-tab-btn ${activeTab === 'internships' ? 'active' : ''}`}
                  onClick={() => setActiveTab('internships')}
                >
                  <GraduationCap size={16} />
                  <span>Internships</span>
                  <span className="admin-tab-count">{internships.length}</span>
                </button>
                <button 
                  className={`admin-tab-btn ${activeTab === 'event_registrations' ? 'active' : ''}`}
                  onClick={() => setActiveTab('event_registrations')}
                >
                  <CalendarCheck size={16} />
                  <span>Event Registrations</span>
                  <span className="admin-tab-count">{eventRegistrations.length}</span>
                </button>
                <button 
                  className={`admin-tab-btn ${activeTab === 'projects' ? 'active' : ''}`}
                  onClick={() => setActiveTab('projects')}
                >
                  <FolderGit2 size={16} />
                  <span>Portfolio Postings</span>
                  <span className="admin-tab-count">{projects.length}</span>
                </button>
                <button 
                  className={`admin-tab-btn ${activeTab === 'events' ? 'active' : ''}`}
                  onClick={() => setActiveTab('events')}
                >
                  <CalendarCheck size={16} />
                  <span>Events Postings</span>
                  <span className="admin-tab-count">{events.length}</span>
                </button>
              </div>

              <div className="admin-actions-group">
                <div className="admin-search-wrap">
                  <Search size={16} className="admin-search-icon" />
                  <input 
                    type="text"
                    placeholder={`Search ${activeTab}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="admin-search-input"
                  />
                </div>

                <button onClick={exportToCSV} className="admin-export-btn" title="Export as CSV spreadsheet">
                  <Download size={14} />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* TAB 1: CONTACTS */}
            {activeTab === 'contacts' && (
              <div className="admin-table-card">
                <div className="admin-table-responsive">
                  <table className="admin-data-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Sender Name & Contact</th>
                        <th>Subject</th>
                        <th>Message Preview</th>
                        <th>Received On</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredContacts.length > 0 ? (
                        filteredContacts.map((c) => (
                          <tr key={c.id}>
                            <td><strong>#{c.id}</strong></td>
                            <td>
                              <div className="candidate-name-cell">{c.name}</div>
                              <div className="candidate-contact-sub">
                                {c.email} {c.phone && `• ${c.phone}`}
                              </div>
                            </td>
                            <td>
                              <span className="admin-badge badge-inquiry">{c.subject || 'General'}</span>
                            </td>
                            <td>
                              <div className="message-preview-cell" title={c.message}>
                                {c.message}
                              </div>
                            </td>
                            <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                              {c.created_at || 'Recently'}
                            </td>
                            <td>
                              <div className="table-actions-cell">
                                <button 
                                  onClick={() => { setSelectedItem(c); setSelectedType('contact'); }}
                                  className="action-pill-btn action-view"
                                  title="View Full Details"
                                >
                                  <Eye size={13} />
                                  <span>View</span>
                                </button>
                                {c.phone && (
                                  <a 
                                    href={`https://wa.me/91${c.phone.replace(/[^0-9]/g, '')}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="action-pill-btn action-whatsapp"
                                    title="Chat on WhatsApp"
                                  >
                                    <span>WhatsApp</span>
                                  </a>
                                )}
                                <a 
                                  href={`mailto:${c.email}?subject=Reply regarding ${encodeURIComponent(c.subject || 'Wingroo Technologies')}`}
                                  className="action-pill-btn action-email"
                                  title="Send Email"
                                >
                                  <Mail size={13} />
                                </a>
                                <button 
                                  onClick={(e) => handleDeleteContact(c.id, e)}
                                  className="action-pill-btn action-delete"
                                  title="Delete Record"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6">
                            <div className="admin-empty-state">
                              <MessageSquare className="admin-empty-icon" />
                              <p>No contact inquiries found.</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 2: INTERNSHIPS */}
            {activeTab === 'internships' && (
              <div className="admin-table-card">
                <div className="admin-table-responsive">
                  <table className="admin-data-table">
                    <thead>
                      <tr>
                        <th>Application Ref</th>
                        <th>Student Name & Contact</th>
                        <th>College & Course</th>
                        <th>Program & Technology</th>
                        <th>Review Status</th>
                        <th>Applied On</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredInternships.length > 0 ? (
                        filteredInternships.map((i) => (
                          <tr key={i.id}>
                            <td>
                              <strong style={{ color: '#0ea5e9', fontSize: '0.8rem' }}>
                                {i.application_no || `#WINGROO-INT-${String(i.id).padStart(4, '0')}`}
                              </strong>
                            </td>
                            <td>
                              <div className="candidate-name-cell">{i.name}</div>
                              <div className="candidate-contact-sub">
                                {i.email} • {i.phone}
                              </div>
                            </td>
                            <td>
                              <div style={{ fontWeight: 500, fontSize: '0.85rem' }}>{i.college}</div>
                              <div className="candidate-contact-sub">{i.course} ({i.year})</div>
                            </td>
                            <td>
                              <span className="admin-badge badge-intern">{i.internship_type}</span>
                              <div style={{ marginTop: '4px' }}>
                                <span className="admin-badge badge-tech">{i.technology}</span>
                              </div>
                            </td>
                            <td>
                              <select 
                                value={i.status || 'Under Review'}
                                onChange={(e) => handleUpdateInternshipStatus(i.id, e.target.value)}
                                style={{
                                  padding: '5px 10px',
                                  borderRadius: '8px',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  border: '1px solid rgba(0,0,0,0.1)',
                                  background: (i.status === 'Selected') ? '#dcfce7' : (i.status === 'Shortlisted') ? '#e0f2fe' : (i.status === 'Interview Scheduled') ? '#e0e7ff' : (i.status === 'Rejected') ? '#fee2e2' : '#fef9c3',
                                  color: (i.status === 'Selected') ? '#15803d' : (i.status === 'Shortlisted') ? '#0369a1' : (i.status === 'Interview Scheduled') ? '#4338ca' : (i.status === 'Rejected') ? '#b91c1c' : '#a16207',
                                  cursor: 'pointer'
                                }}
                              >
                                <option value="Under Review">⏳ Under Review</option>
                                <option value="Shortlisted">📋 Shortlisted</option>
                                <option value="Interview Scheduled">💻 Interview Scheduled</option>
                                <option value="Selected">✅ Selected</option>
                                <option value="Completed">🎓 Completed</option>
                                <option value="Rejected">❌ Rejected</option>
                              </select>
                            </td>
                            <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                              {i.created_at || 'Recently'}
                            </td>
                            <td>
                              <div className="table-actions-cell">
                                <button 
                                  onClick={() => { setSelectedItem(i); setSelectedType('internship'); }}
                                  className="action-pill-btn action-view"
                                  title="View Full Details"
                                >
                                  <Eye size={13} />
                                  <span>View</span>
                                </button>
                                {i.phone && (
                                  <a 
                                    href={`https://wa.me/91${i.phone.replace(/[^0-9]/g, '')}?text=Hi ${encodeURIComponent(i.name)}, regarding your internship application at Wingroo Technologies:`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="action-pill-btn action-whatsapp"
                                    title="Contact on WhatsApp"
                                  >
                                    <span>WhatsApp</span>
                                  </a>
                                )}
                                <a 
                                  href={`mailto:${i.email}?subject=Wingroo Technologies - Internship Application Follow-up`}
                                  className="action-pill-btn action-email"
                                  title="Send Email"
                                >
                                  <Mail size={13} />
                                </a>
                                <button 
                                  onClick={(e) => handleDeleteInternship(i.id, e)}
                                  className="action-pill-btn action-delete"
                                  title="Delete Record"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6">
                            <div className="admin-empty-state">
                              <GraduationCap className="admin-empty-icon" />
                              <p>No internship applications found.</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: EVENT REGISTRATIONS */}
            {activeTab === 'event_registrations' && (
              <div className="admin-table-card">
                <div className="admin-table-responsive">
                  <table className="admin-data-table">
                    <thead>
                      <tr>
                        <th>Registration Ref</th>
                        <th>Attendee Name & Contact</th>
                        <th>College / Organization</th>
                        <th>Registered Event</th>
                        <th>Status</th>
                        <th>Registered On</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEventRegs.length > 0 ? (
                        filteredEventRegs.map((reg) => (
                          <tr key={reg.id}>
                            <td>
                              <strong style={{ color: '#0284c7', fontSize: '0.82rem' }}>
                                {reg.registration_no}
                              </strong>
                            </td>
                            <td>
                              <div className="candidate-name-cell">{reg.name}</div>
                              <div className="candidate-contact-sub">
                                {reg.email} • {reg.phone}
                              </div>
                            </td>
                            <td>
                              <div style={{ fontWeight: 500, fontSize: '0.85rem' }}>{reg.college}</div>
                              {reg.year && <div className="candidate-contact-sub">{reg.year}</div>}
                            </td>
                            <td>
                              <span className="admin-badge badge-tech" style={{ background: '#e0f2fe', color: '#0369a1' }}>
                                {reg.event_title}
                              </span>
                            </td>
                            <td>
                              <select 
                                value={reg.status || 'Confirmed'}
                                onChange={(e) => handleUpdateEventRegStatus(reg.id, e.target.value)}
                                style={{
                                  padding: '5px 10px',
                                  borderRadius: '8px',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  border: '1px solid rgba(0,0,0,0.1)',
                                  background: (reg.status === 'Confirmed' || reg.status === 'Attended') ? '#dcfce7' : (reg.status === 'Waitlist') ? '#fef9c3' : '#fee2e2',
                                  color: (reg.status === 'Confirmed' || reg.status === 'Attended') ? '#15803d' : (reg.status === 'Waitlist') ? '#a16207' : '#b91c1c',
                                  cursor: 'pointer'
                                }}
                              >
                                <option value="Confirmed">✅ Confirmed</option>
                                <option value="Waitlist">⏳ Waitlist</option>
                                <option value="Attended">🎓 Attended</option>
                                <option value="Cancelled">❌ Cancelled</option>
                              </select>
                            </td>
                            <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                              {reg.created_at || 'Recently'}
                            </td>
                            <td>
                              <div className="table-actions-cell">
                                {reg.phone && (
                                  <a 
                                    href={`https://wa.me/91${reg.phone.replace(/[^0-9]/g, '')}?text=Hi ${encodeURIComponent(reg.name)}, regarding your registration for ${encodeURIComponent(reg.event_title)} at Wingroo Technologies:`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="action-pill-btn action-whatsapp"
                                    title="WhatsApp Attendee"
                                  >
                                    <span>WhatsApp</span>
                                  </a>
                                )}
                                <a 
                                  href={`mailto:${reg.email}?subject=Wingroo Technologies - Registration for ${encodeURIComponent(reg.event_title)}`}
                                  className="action-pill-btn action-email"
                                  title="Send Email"
                                >
                                  <Mail size={13} />
                                </a>
                                <button 
                                  onClick={(e) => handleDeleteEventReg(reg.id, e)}
                                  className="action-pill-btn action-delete"
                                  title="Delete Registration"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7">
                            <div className="admin-empty-state">
                              <CalendarCheck className="admin-empty-icon" />
                              <p>No event registrations found.</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}


            {/* TAB 3: MANAGE PORTFOLIO (POST & MANAGE) */}
            {activeTab === 'projects' && (
              <div>
                {/* Add New Project Form */}
                <div className="admin-post-form-card">
                  <div className="admin-form-header">
                    <h4 className="admin-form-title">
                      <PlusCircle size={20} style={{ color: '#4f46e5' }} />
                      <span>Post New Portfolio Project</span>
                    </h4>
                    {projectSuccessMsg && (
                      <span className="admin-post-success-msg">
                        <CheckCircle size={16} />
                        {projectSuccessMsg}
                      </span>
                    )}
                  </div>

                  <form onSubmit={handlePostProject} className="admin-form-grid">
                    <div className="admin-form-field">
                      <label className="admin-form-label">Project Name / Brand Title *</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="e.g. AGRIFLOW, PAYROLL AI"
                        value={newProject.title}
                        onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                        className="admin-input"
                      />
                    </div>

                    <div className="admin-form-field">
                      <label className="admin-form-label">Main Heading / Tagline</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Next-Gen Smart Agricultural Platform."
                        value={newProject.heading}
                        onChange={(e) => setNewProject({ ...newProject, heading: e.target.value })}
                        className="admin-input"
                      />
                    </div>

                    <div className="admin-form-field">
                      <label className="admin-form-label">Category</label>
                      <select 
                        value={newProject.category}
                        onChange={(e) => setNewProject({ ...newProject, category: e.target.value })}
                        className="admin-select"
                      >
                        <option value="Web Application">Web Application</option>
                        <option value="Digital Platform">Digital Platform</option>
                        <option value="Mobile Application">Mobile Application</option>
                        <option value="AI / Machine Learning">AI / Machine Learning</option>
                        <option value="Enterprise SaaS">Enterprise SaaS</option>
                        <option value="E-Commerce System">E-Commerce System</option>
                      </select>
                    </div>

                    <div className="admin-form-field">
                      <label className="admin-form-label">Theme Color Accent</label>
                      <select 
                        value={newProject.themeColor}
                        onChange={(e) => setNewProject({ ...newProject, themeColor: e.target.value })}
                        className="admin-select"
                      >
                        <option value="#4f46e5">Indigo (#4f46e5)</option>
                        <option value="#0ea5e9">Sky Blue (#0ea5e9)</option>
                        <option value="#10b981">Emerald Green (#10b981)</option>
                        <option value="#8b5cf6">Violet (#8b5cf6)</option>
                        <option value="#f59e0b">Amber Gold (#f59e0b)</option>
                        <option value="#ec4899">Rose Pink (#ec4899)</option>
                      </select>
                    </div>

                    <div className="admin-form-field">
                      <label className="admin-form-label">Feature Tags (comma separated)</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Cloud Sync, Modern UI, AI Insights, Realtime Analytics"
                        value={newProject.tags}
                        onChange={(e) => setNewProject({ ...newProject, tags: e.target.value })}
                        className="admin-input"
                      />
                    </div>

                    <div className="admin-form-field">
                      <label className="admin-form-label">Live Platform / Demo URL</label>
                      <input 
                        type="url" 
                        placeholder="https://..."
                        value={newProject.demoUrl}
                        onChange={(e) => setNewProject({ ...newProject, demoUrl: e.target.value })}
                        className="admin-input"
                      />
                    </div>

                    {/* PICTURE OR VIDEO UPLOAD FIELD */}
                    <div className="admin-form-field admin-form-full">
                      <label className="admin-form-label">Project Media (Upload Picture or Video)</label>
                      <div className="admin-media-type-pills">
                        <button 
                          type="button" 
                          className={`media-pill-btn ${newProject.mediaType === 'image' ? 'active' : ''}`}
                          onClick={() => setNewProject({ ...newProject, mediaType: 'image' })}
                        >
                          <ImageIcon size={14} />
                          <span>Picture / Screenshot</span>
                        </button>
                        <button 
                          type="button" 
                          className={`media-pill-btn ${newProject.mediaType === 'video' ? 'active' : ''}`}
                          onClick={() => setNewProject({ ...newProject, mediaType: 'video' })}
                        >
                          <Video size={14} />
                          <span>Video File (MP4/WebM)</span>
                        </button>
                      </div>

                      <div className="admin-file-upload-box">
                        <label className="admin-file-upload-label">
                          <Upload size={18} style={{ color: '#4f46e5' }} />
                          <span>
                            {projectUploading 
                              ? 'Uploading to server...' 
                              : `Click to Browse & Upload ${newProject.mediaType === 'video' ? 'Video File' : 'Picture File'}`}
                          </span>
                          <input 
                            type="file" 
                            accept={newProject.mediaType === 'video' ? "video/*" : "image/*"}
                            onChange={handleProjectFileUpload}
                            className="admin-file-hidden-input"
                            disabled={projectUploading}
                          />
                        </label>
                      </div>

                      <div style={{ marginTop: '8px' }}>
                        <input 
                          type="url" 
                          placeholder={newProject.mediaType === 'video' ? "Or paste Video URL (https://...)" : "Or paste Picture URL (https://...)"}
                          value={newProject.mediaType === 'video' ? newProject.videoUrl : newProject.image}
                          onChange={(e) => {
                            if (newProject.mediaType === 'video') {
                              setNewProject({ ...newProject, videoUrl: e.target.value });
                            } else {
                              setNewProject({ ...newProject, image: e.target.value });
                            }
                          }}
                          className="admin-input"
                        />
                      </div>

                      {/* Live Media Preview Box */}
                      {newProject.videoUrl ? (
                        <div className="admin-media-preview-box">
                          <video src={newProject.videoUrl} controls className="admin-preview-video" />
                          <button 
                            type="button" 
                            onClick={() => setNewProject({ ...newProject, videoUrl: '' })} 
                            className="admin-remove-media-btn"
                            title="Remove Video"
                          >
                            ✕
                          </button>
                        </div>
                      ) : newProject.image ? (
                        <div className="admin-media-preview-box">
                          <img src={newProject.image} alt="Preview" className="admin-preview-img" />
                          <button 
                            type="button" 
                            onClick={() => setNewProject({ ...newProject, image: '' })} 
                            className="admin-remove-media-btn"
                            title="Remove Image"
                          >
                            ✕
                          </button>
                        </div>
                      ) : null}
                    </div>

                    <div className="admin-form-field admin-form-full">
                      <label className="admin-form-label">Project Description *</label>
                      <textarea 
                        required
                        rows="3"
                        placeholder="Describe the problem, architectural approach, and how it impacts end-users..."
                        value={newProject.description}
                        onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                        className="admin-textarea"
                      />
                    </div>

                    <div className="admin-form-full">
                      <button type="submit" disabled={projectPosting || projectUploading} className="admin-submit-btn">
                        <PlusCircle size={16} />
                        <span>{projectPosting ? 'Publishing...' : 'Publish Project to Website'}</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Current Active Projects List */}
                <div className="admin-table-card">
                  <div className="admin-table-responsive">
                    <table className="admin-data-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Project Title & Media</th>
                          <th>Category</th>
                          <th>Feature Tags</th>
                          <th>Live URL</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProjects.length > 0 ? (
                          filteredProjects.map((p) => (
                            <tr key={p.id}>
                              <td><strong>#{p.id}</strong></td>
                              <td>
                                <div className="candidate-name-cell" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: p.themeColor || '#4f46e5' }} />
                                  {p.title}
                                  {p.videoUrl ? (
                                    <span style={{ fontSize: '0.7rem', background: '#e0e7ff', color: '#4338ca', padding: '1px 6px', borderRadius: '4px' }}>🎥 Video</span>
                                  ) : p.image ? (
                                    <span style={{ fontSize: '0.7rem', background: '#ecfdf5', color: '#047857', padding: '1px 6px', borderRadius: '4px' }}>🖼️ Image</span>
                                  ) : null}
                                </div>
                                <div className="candidate-contact-sub">{p.heading}</div>
                              </td>
                              <td>
                                <span className="admin-badge badge-tech">{p.category}</span>
                              </td>
                              <td>
                                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', maxWidth: '240px' }}>
                                  {(p.tags || []).slice(0, 3).map((t, idx) => (
                                    <span key={idx} style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontSize: '0.72rem' }}>
                                      {t}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td>
                                {p.demoUrl && (
                                  <a href={p.demoUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#4f46e5', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <span>Visit</span>
                                    <ExternalLink size={12} />
                                  </a>
                                )}
                              </td>
                              <td>
                                <button 
                                  onClick={(e) => handleDeleteProject(p.id, e)}
                                  className="action-pill-btn action-delete"
                                  title="Delete Project"
                                >
                                  <Trash2 size={13} />
                                  <span>Delete</span>
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                              No portfolio projects found. Use the form above to add a project.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: MANAGE EVENTS (POST & MANAGE) */}
            {activeTab === 'events' && (
              <div>
                {/* Add New Event Form */}
                <div className="admin-post-form-card">
                  <div className="admin-form-header">
                    <h4 className="admin-form-title">
                      <PlusCircle size={20} style={{ color: '#4f46e5' }} />
                      <span>Post New Public Event / Workshop</span>
                    </h4>
                    {eventSuccessMsg && (
                      <span className="admin-post-success-msg">
                        <CheckCircle size={16} />
                        {eventSuccessMsg}
                      </span>
                    )}
                  </div>

                  <form onSubmit={handlePostEvent} className="admin-form-grid">
                    <div className="admin-form-field">
                      <label className="admin-form-label">Event Title *</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="e.g. AI & Cloud Workshop 2026, Full-Stack Hackathon"
                        value={newEvent.title}
                        onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                        className="admin-input"
                      />
                    </div>

                    <div className="admin-form-field">
                      <label className="admin-form-label">Tagline</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Build What's Next in AI & Cloud."
                        value={newEvent.tagline}
                        onChange={(e) => setNewEvent({ ...newEvent, tagline: e.target.value })}
                        className="admin-input"
                      />
                    </div>

                    <div className="admin-form-field">
                      <label className="admin-form-label">Badge / Event Type</label>
                      <select 
                        value={newEvent.badge}
                        onChange={(e) => setNewEvent({ ...newEvent, badge: e.target.value })}
                        className="admin-select"
                      >
                        <option value="Interactive">Interactive (Tech Talk)</option>
                        <option value="Hands-On">Hands-On (Workshop)</option>
                        <option value="Competition">Competition (Hackathon)</option>
                        <option value="Career Growth">Career Growth (Industry)</option>
                        <option value="Special Event">Special Cohort</option>
                      </select>
                    </div>

                    <div className="admin-form-field">
                      <label className="admin-form-label">Event Date / Schedule</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Saturday, October 24, 2026 or Bi-Weekly"
                        value={newEvent.event_date}
                        onChange={(e) => setNewEvent({ ...newEvent, event_date: e.target.value })}
                        className="admin-input"
                      />
                    </div>

                    <div className="admin-form-field admin-form-full">
                      <label className="admin-form-label">Venue / Location</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Wingroo Innovation Hub, Coimbatore & Live Stream"
                        value={newEvent.location}
                        onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                        className="admin-input"
                      />
                    </div>

                    {/* POSTER UPLOAD FIELD FOR EVENTS */}
                    <div className="admin-form-field admin-form-full">
                      <label className="admin-form-label">Event Poster Image (Upload or Paste URL)</label>
                      <div className="admin-file-upload-box">
                        <label className="admin-file-upload-label">
                          <Upload size={18} style={{ color: '#4f46e5' }} />
                          <span>{eventUploading ? 'Uploading poster...' : 'Click to Upload Event Poster Image (PNG, JPG, WebP)'}</span>
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={handleEventPosterUpload}
                            className="admin-file-hidden-input"
                            disabled={eventUploading}
                          />
                        </label>
                      </div>

                      <div style={{ marginTop: '8px' }}>
                        <input 
                          type="url" 
                          placeholder="Or paste Poster Image URL (https://...)"
                          value={newEvent.poster_url}
                          onChange={(e) => setNewEvent({ ...newEvent, poster_url: e.target.value })}
                          className="admin-input"
                        />
                      </div>

                      {newEvent.poster_url && (
                        <div className="admin-media-preview-box">
                          <img src={newEvent.poster_url} alt="Poster Preview" className="admin-preview-img" />
                          <button 
                            type="button" 
                            onClick={() => setNewEvent({ ...newEvent, poster_url: '' })} 
                            className="admin-remove-media-btn"
                            title="Remove Poster"
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="admin-form-field admin-form-full">
                      <label className="admin-form-label">Event Description *</label>
                      <textarea 
                        required
                        rows="3"
                        placeholder="Detailed overview of what participants will learn, build, or experience..."
                        value={newEvent.description}
                        onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                        className="admin-textarea"
                      />
                    </div>

                    <div className="admin-form-full">
                      <button type="submit" disabled={eventPosting || eventUploading} className="admin-submit-btn">
                        <PlusCircle size={16} />
                        <span>{eventPosting ? 'Publishing...' : 'Publish Event to Website'}</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Current Active Events List */}
                <div className="admin-table-card">
                  <div className="admin-table-responsive">
                    <table className="admin-data-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Event Title & Poster</th>
                          <th>Badge</th>
                          <th>Date / Schedule</th>
                          <th>Location</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredEvents.length > 0 ? (
                          filteredEvents.map((ev) => (
                            <tr key={ev.id}>
                              <td><strong>#{ev.id}</strong></td>
                              <td>
                                <div className="candidate-name-cell" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  {ev.poster_url ? (
                                    <img src={ev.poster_url} alt="" style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover' }} />
                                  ) : null}
                                  <div>
                                    <div>{ev.title}</div>
                                    <div className="candidate-contact-sub">{ev.tagline}</div>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <span className="admin-badge badge-intern">{ev.badge}</span>
                              </td>
                              <td style={{ fontSize: '0.85rem' }}>{ev.event_date}</td>
                              <td style={{ fontSize: '0.82rem', color: '#64748b' }}>{ev.location}</td>
                              <td>
                                <button 
                                  onClick={(e) => handleDeleteEvent(ev.id, e)}
                                  className="action-pill-btn action-delete"
                                  title="Delete Event"
                                >
                                  <Trash2 size={13} />
                                  <span>Delete</span>
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                              No events found. Use the form above to add an event.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Detailed Item Modal (Drawer for Contacts / Internships) */}
        {selectedItem && (
          <div className="detail-overlay" onClick={() => setSelectedItem(null)}>
            <div className="detail-card" onClick={(e) => e.stopPropagation()}>
              <div className="detail-header">
                <div>
                  <h4 className="detail-title">
                    {selectedType === 'contact' ? 'Contact Inquiry' : 'Internship Application'} #{selectedItem.id}
                  </h4>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    Received: {selectedItem.created_at || 'Recent'}
                  </span>
                </div>
                <button 
                  onClick={() => setSelectedItem(null)} 
                  className="admin-icon-btn admin-close-btn"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="detail-body">
                <div className="detail-row">
                  <span className="detail-row-label">Full Name</span>
                  <span className="detail-row-value" style={{ fontWeight: 600 }}>{selectedItem.name}</span>
                </div>

                <div className="detail-row">
                  <span className="detail-row-label">Email Address</span>
                  <span className="detail-row-value">{selectedItem.email}</span>
                </div>

                <div className="detail-row">
                  <span className="detail-row-label">Phone Number</span>
                  <span className="detail-row-value">{selectedItem.phone || 'N/A'}</span>
                </div>

                {selectedType === 'contact' ? (
                  <>
                    <div className="detail-row">
                      <span className="detail-row-label">Subject</span>
                      <span className="detail-row-value">{selectedItem.subject}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-row-label">Full Message</span>
                      <div className="detail-message-box">{selectedItem.message}</div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="detail-row">
                      <span className="detail-row-label">College / University</span>
                      <span className="detail-row-value">{selectedItem.college}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-row-label">Degree & Year</span>
                      <span className="detail-row-value">{selectedItem.course} — {selectedItem.year}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-row-label">Internship Track</span>
                      <span className="detail-row-value">{selectedItem.internship_type}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-row-label">Domain / Technology</span>
                      <span className="detail-row-value" style={{ color: '#4f46e5', fontWeight: 600 }}>
                        {selectedItem.technology}
                      </span>
                    </div>
                    {selectedItem.message && (
                      <div className="detail-row">
                        <span className="detail-row-label">Candidate Goals / Message</span>
                        <div className="detail-message-box">{selectedItem.message}</div>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="detail-actions-footer">
                {selectedItem.phone && (
                  <a 
                    href={`https://wa.me/91${selectedItem.phone.replace(/[^0-9]/g, '')}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="action-pill-btn action-whatsapp"
                    style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                  >
                    <span>Connect on WhatsApp</span>
                  </a>
                )}
                <a 
                  href={`mailto:${selectedItem.email}`}
                  className="action-pill-btn action-email"
                  style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                >
                  <Mail size={15} />
                  <span>Send Direct Email</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
