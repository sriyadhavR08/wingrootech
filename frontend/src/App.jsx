import React, { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Services from './components/Services'
import Internship from './components/Internship'
import Events from './components/Events'
import Portfolio from './components/Portfolio'
import WhyWingroo from './components/WhyWingroo'
import CTA from './components/CTA'
import Contact from './components/Contact'
import Footer from './components/Footer'
import AdminPortal from './components/AdminPortal'
import StudentPortal from './components/StudentPortal'
import { ShieldCheck, GraduationCap } from 'lucide-react'

export default function App() {
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isStudentOpen, setIsStudentOpen] = useState(false);
  const [studentLookupQuery, setStudentLookupQuery] = useState('');
  const [dataVersion, setDataVersion] = useState(0);

  const handleOpenStudent = (query = '') => {
    setStudentLookupQuery(query || '');
    setIsStudentOpen(true);
  };

  useEffect(() => {
    // Check URL hashes for #admin or #student
    const handleHashChange = () => {
      if (window.location.hash === '#admin') {
        setIsAdminOpen(true);
      } else if (window.location.hash === '#student' || window.location.hash === '#student-portal') {
        setIsStudentOpen(true);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);

    // Keyboard shortcuts
    const handleKeyDown = (e) => {
      // Ctrl + Shift + A -> Admin
      if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setIsAdminOpen(prev => !prev);
      }
      // Ctrl + Shift + S -> Student
      if (e.ctrlKey && e.shiftKey && (e.key === 'S' || e.key === 's')) {
        e.preventDefault();
        setIsStudentOpen(prev => !prev);
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
        onOpenAdmin={() => setIsAdminOpen(true)} 
        onOpenStudentPortal={handleOpenStudent}
      />
      <main>
        <Hero />
        <About />
        <Services />
        <Internship onOpenStudentPortal={handleOpenStudent} />
        <Events key={`events-${dataVersion}`} />
        <Portfolio key={`portfolio-${dataVersion}`} />
        <WhyWingroo />
        <CTA />
        <Contact />
      </main>
      <Footer 
        onOpenAdmin={() => setIsAdminOpen(true)} 
        onOpenStudentPortal={handleOpenStudent}
      />

      {/* Floating Triggers Container */}
      <div className="portal-floating-triggers">
        {/* Floating Student Portal Button */}
        <button 
          className="portal-fab student-fab" 
          onClick={() => handleOpenStudent()}
          title="Student Portal (Track Application • Ctrl+Shift+S)"
        >
          <GraduationCap size={16} />
          <span>Student Portal</span>
        </button>

        {/* Floating Admin Trigger Button */}
        <button 
          className="portal-fab admin-fab" 
          onClick={() => setIsAdminOpen(true)}
          title="Admin Portal (Ctrl+Shift+A)"
        >
          <ShieldCheck size={16} />
          <span>Admin Portal</span>
        </button>
      </div>

      {/* Admin Portal Modal */}
      <AdminPortal 
        isOpen={isAdminOpen} 
        onDataChanged={() => setDataVersion(v => v + 1)}
        onClose={() => {
          setIsAdminOpen(false);
          if (window.location.hash === '#admin') {
            window.history.replaceState(null, '', ' ');
          }
        }} 
      />

      {/* Student Portal Modal */}
      <StudentPortal 
        isOpen={isStudentOpen}
        initialQuery={studentLookupQuery}
        onClose={() => {
          setIsStudentOpen(false);
          if (window.location.hash.includes('student')) {
            window.history.replaceState(null, '', ' ');
          }
        }}
      />
    </div>
  )
}
