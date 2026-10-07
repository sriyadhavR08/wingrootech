import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useParams } from 'react-router-dom'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Services from './components/Services'
import Internship from './components/Internship'
import Careers from './components/Careers'
import Events from './components/Events'
import Portfolio from './components/Portfolio'
import WhyWingroo from './components/WhyWingroo'
import Reviews from './components/Reviews'
import AEOKnowledgeHub from './components/AEOKnowledgeHub'
import CTA from './components/CTA'
import Contact from './components/Contact'
import Footer from './components/Footer'
import AdminPortal from './components/AdminPortal'
import StudentPortal from './components/StudentPortal'
import AIChatbot from './components/AIChatbot'
import SocialSidebar from './components/SocialSidebar'
import ScrollNavigator from './components/ScrollNavigator'
import InternshipApp from './internship-portal/App'

function LandingPage() {
  const [activePortal, setActivePortal] = useState(null); // null | 'student' | 'admin'
  const [studentLookupQuery, setStudentLookupQuery] = useState('');
  const [dataVersion, setDataVersion] = useState(0);

  const handleOpenStudent = (query = '') => {
    setStudentLookupQuery(query || '');
    setActivePortal('student');
  };

  const handleOpenLogin = (role = 'student') => {
    setActivePortal(role);
  };

  useEffect(() => {
    // Check URL hashes for #admin, #student, or #login
    const handleHashChange = () => {
      if (window.location.hash === '#admin') {
        setActivePortal('admin');
      } else if (window.location.hash === '#student' || window.location.hash === '#student-portal' || window.location.hash === '#login') {
        setActivePortal('student');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);

    // Keyboard shortcuts
    const handleKeyDown = (e) => {
      // Ctrl + Shift + A -> Admin
      if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setActivePortal(prev => prev === 'admin' ? null : 'admin');
      }
      // Ctrl + Shift + S -> Student
      if (e.ctrlKey && e.shiftKey && (e.key === 'S' || e.key === 's')) {
        e.preventDefault();
        setActivePortal(prev => prev === 'student' ? null : 'student');
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="wingroo-landing-page">
      <Navbar 
        onOpenLogin={handleOpenLogin}
        onOpenAdmin={() => handleOpenLogin('admin')} 
        onOpenStudentPortal={handleOpenStudent}
      />
      <main>
        <Hero />
        <About />
        <Services />
        <Portfolio key={`portfolio-${dataVersion}`} />
        <Internship onOpenStudentPortal={handleOpenStudent} />
        <Events key={`events-${dataVersion}`} />
        <WhyWingroo />
        <Reviews />
        <AEOKnowledgeHub />
        <Careers />
        <CTA />
        <Contact />
      </main>
      <Footer 
        onOpenAdmin={() => handleOpenLogin('admin')} 
        onOpenStudentPortal={handleOpenStudent}
        onOpenLogin={handleOpenLogin}
      />

      {/* Interactive AI Chatbot Widget */}
      <AIChatbot onOpenStudentPortal={handleOpenStudent} />

      {/* Floating Social Media Side Dock */}
      <SocialSidebar />

      {/* Floating Right-Side Scroll Navigator & Section Spy */}
      <ScrollNavigator />

      {/* Unified Login Portal: Student / Candidate View */}
      {activePortal === 'student' && (
        <StudentPortal 
          isOpen={true}
          initialQuery={studentLookupQuery}
          onSwitchRole={() => setActivePortal('admin')}
          onClose={() => {
            setActivePortal(null);
            if (window.location.hash.includes('student') || window.location.hash.includes('login')) {
              window.history.replaceState(null, '', ' ');
            }
          }}
        />
      )}

      {/* Unified Login Portal: Admin & Staff View */}
      {activePortal === 'admin' && (
        <AdminPortal 
          isOpen={true} 
          onDataChanged={() => setDataVersion(v => v + 1)}
          onSwitchRole={() => setActivePortal('student')}
          onClose={() => {
            setActivePortal(null);
            if (window.location.hash === '#admin' || window.location.hash.includes('login')) {
              window.history.replaceState(null, '', ' ');
            }
          }} 
        />
      )}
    </div>
  );
}

function VerifyTokenRedirect() {
  const { token } = useParams();
  return <Navigate to={token ? `/internship/verify/${token}` : `/internship/verify`} replace />;
}

export default function App() {
  return (
    <Routes>
      {/* 1. Main Wingroo Landing Page */}
      <Route path="/" element={<LandingPage />} />

      {/* 2. Dedicated Dynamic Internship & Certificate System */}
      <Route path="/internship/*" element={<InternshipApp />} />

      {/* 3. Direct Route Shortcuts & QR Code Verification Links */}
      <Route path="/verify" element={<Navigate to="/internship/verify" replace />} />
      <Route path="/verify/:token" element={<VerifyTokenRedirect />} />
      <Route path="/login" element={<Navigate to="/internship/login" replace />} />
      <Route path="/register" element={<Navigate to="/internship/register" replace />} />
      <Route path="/student/*" element={<Navigate to="/internship/student/dashboard" replace />} />
      <Route path="/admin/*" element={<Navigate to="/internship/admin/dashboard" replace />} />

      {/* 4. Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
