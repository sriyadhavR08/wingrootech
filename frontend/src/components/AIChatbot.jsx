import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  Phone, 
  MessageSquare, 
  ChevronRight, 
  Check, 
  ArrowRight, 
  ExternalLink, 
  GraduationCap, 
  Rocket, 
  Code2, 
  Briefcase, 
  Smartphone,
  Zap,
  HelpCircle 
} from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import { AEO_GEO_FAQS } from '../data/aeoGeoFaqs';
import './AIChatbot.css';

const QUICK_PROMPTS = [
  { 
    id: 'start_project', 
    label: '🚀 Start a Web or Mobile Project', 
    icon: <Rocket size={14} />,
    reply: '🚀 **Start Your Project with Wingroo:**\nWe engineer custom Web Apps, SaaS platforms, and Mobile Apps deployed to both Google Play Store (Android) & Apple App Store (iOS). We also ship 72-Hour MVPs with Vibe Coding & Agentic AI!\n\n👇 Please share your contact details below so our lead engineer can get in touch with a free architecture plan & estimate.',
    isDev: true,
    defaultType: 'Custom Web & Mobile Application'
  },
  { 
    id: 'mobile_stores', 
    label: '📱 Play Store & App Store Deployment', 
    icon: <Smartphone size={14} />,
    reply: '📱 **Google Play Store & Apple App Store Publishing:**\nYes, we provide end-to-end publishing! We build cross-platform apps with Flutter & React Native, handle Apple Developer & Google Play Console submissions, store guideline compliance, and ensure guaranteed live store approval.\n\n👇 Drop your contact details below to discuss your mobile app idea!',
    isDev: true,
    defaultType: 'Mobile App (Google Play Store & Apple App Store)'
  },
  { 
    id: 'mvp_speed', 
    label: '⚡ 72-Hour Production MVP Sprint', 
    icon: <Zap size={14} />,
    reply: '⚡ **72-Hour Rapid MVP Delivery:**\nNeed to launch fast? Using our Vibe Coding & Agentic AI workflows, we can build functional interactive prototypes and production-grade MVPs within 72 hours for live market validation.\n\n👇 Leave your details below for a free technical feasibility check!',
    isDev: true,
    defaultType: '72-Hour Rapid MVP'
  },
  { 
    id: 'internship', 
    label: '🎓 College Internship & 100% Scholarship', 
    icon: <GraduationCap size={14} />,
    reply: '🎓 **College Internship Program (15–20 Days):**\n• Structured daily timetable (Theory & Hands-on Lab).\n• **Up to 100% Merit Scholarships** based on our 20-min online screening assessment.\n• Recognized ISO 9001:2015, MSME & Startup India certification with real GitHub repos.\n• Apply right on our site or track your status in the Student Portal!',
    isDev: false,
    defaultType: 'College Internship / Student Inquiry'
  },
  { 
    id: 'ai_replace', 
    label: '🤖 Will AI replace software developers?', 
    icon: <Sparkles size={14} />,
    reply: '🤖 **Will AI replace software developers?**\nNo! AI will not replace software developers, but developers who master AI workflows (Cursor, Claude 3.5 Sonnet, v0) will replace those who do not.\n\nModern developers act as architectural orchestrators—guiding AI code generators, verifying system security, and building scalable production software.',
    isDev: false
  },
  { 
    id: 'location', 
    label: '📍 Coimbatore Hub & WhatsApp', 
    icon: <Phone size={14} />,
    reply: '📍 **Wingroo Technologies Coimbatore Hub:**\n2nd Floor, SS Complex, 64/1, 7th Street, Tatabad, Coimbatore, TN 641012 (near Gandhipuram).\n📞 Phone / WhatsApp: +91 81247 79111.',
    isDev: false
  }
];

export default function AIChatbot({ onOpenSchedule, onOpenStudentPortal }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "Hello! 👋 I'm **Wingy**, your Wingroo AI Assistant. How can I help you today with Custom Software Development (Web & Mobile Apps for Play Store & App Store), Rapid 72h MVPs, or our College Internships?",
      time: 'Just now'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadContact, setLeadContact] = useState({ 
    name: '', 
    phone: '', 
    email: '', 
    projectType: 'Mobile App (Google Play Store & Apple App Store)',
    notes: ''
  });
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendPrompt = (prompt) => {
    const userMsg = { sender: 'user', text: prompt.label, time: 'Just now' };
    const botMsg = { sender: 'bot', text: prompt.reply, time: 'Just now', promptId: prompt.id };

    setMessages(prev => [...prev, userMsg, botMsg]);

    if (prompt.isDev) {
      if (prompt.defaultType) {
        setLeadContact(prev => ({ ...prev, projectType: prompt.defaultType }));
      }
      setTimeout(() => {
        setShowLeadForm(true);
      }, 400);
    } else if (!leadSubmitted && messages.length >= 2) {
      setTimeout(() => {
        setShowLeadForm(true);
      }, 800);
    }
  };

  const handleCustomSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userText = inputText.trim();
    setInputText('');

    const userMsg = { sender: 'user', text: userText, time: 'Just now' };
    const lower = userText.toLowerCase().trim();
    const words = lower.split(/\s+/).filter(w => w.length > 2);
    
    // Dynamic Intelligent Search against all 60 AEO_GEO_FAQS
    let bestMatch = null;
    let highestScore = 0;

    for (const faq of AEO_GEO_FAQS) {
      let score = 0;
      const qLower = faq.q.toLowerCase();
      const aLower = faq.a.toLowerCase();
      const tags = faq.tags || [];

      // Exact phrase match in question gets massive boost
      if (qLower.includes(lower)) {
        score += 25;
      }

      // Keyword matches in question, tags, and answer
      for (const w of words) {
        if (qLower.includes(w)) score += 6;
        if (tags.some(t => t.toLowerCase().includes(w))) score += 5;
        if (aLower.includes(w)) score += 1;
      }

      if (score > highestScore) {
        highestScore = score;
        bestMatch = faq;
      }
    }

    let botReplyText = "";

    const isDevQuery = lower.includes('dev') || lower.includes('app') || lower.includes('play store') || lower.includes('app store') || lower.includes('web') || lower.includes('software') || lower.includes('build') || lower.includes('project') || lower.includes('mvp') || lower.includes('cost') || lower.includes('quote') || lower.includes('price') || lower.includes('hire') || lower.includes('client') || lower.includes('android') || lower.includes('ios');

    if (bestMatch && highestScore >= 6) {
      botReplyText = `💡 **${bestMatch.q}**\n\n${bestMatch.a}\n\n👉 *Need a custom architecture plan or cost estimate for your project? Share your contact details below to get a free 30-min consultation!*`;
    } else if (lower.includes('play store') || lower.includes('app store') || (lower.includes('mobile') && lower.includes('app'))) {
      botReplyText = "📱 **Mobile App Development (Google Play Store & Apple App Store):**\nYes! We build high-performance mobile apps with Flutter & React Native and manage the entire publishing pipeline for both Google Play Store (Android) and Apple App Store (iOS)—including Apple Developer and Google Play Console setup, app signing, store guidelines compliance, and guaranteed live approval.\n\n👇 Please share your contact details below to discuss your app idea!";
    } else if (lower.includes('72') || lower.includes('mvp') || lower.includes('speed') || lower.includes('fast')) {
      botReplyText = "⚡ **72-Hour Rapid MVP Delivery:**\nThrough our Vibe Coding & Agentic AI framework, we deliver functional prototypes in hours and production-grade Minimum Viable Products in as little as 72 hours for live market validation.\n\n👇 Leave your details below for a free technical feasibility check!";
    } else if (lower.includes('replace') || lower.includes('ai replace')) {
      botReplyText = "🤖 **Will AI replace developers?**\nNo! AI won't replace software developers, but developers who master modern AI workflows (Cursor, Claude 3.5 Sonnet, v0) will replace those who don't. At Wingroo, we train students to act as architectural conductors who guide AI tools to build production apps 5x faster.";
    } else if (lower.includes('2026') || (lower.includes('job') && (lower.includes('fresher') || lower.includes('get')))) {
      botReplyText = "🚀 **How Can Freshers Secure Software Jobs in the AI Era?**\nTech companies are actively hiring freshers who possess practical full-stack project experience, verified GitHub commits, and proficiency with AI developer tools. Rote LeetCode memorization is being replaced by practical product delivery—which is exactly what we teach in our 15-20 Days Internship!";
    } else if (lower.includes('where to start') || lower.includes('fresher') || lower.includes('beginner') || lower.includes('roadmap')) {
      botReplyText = "🎓 **As a Fresher, Where Should You Start?**\n1. Master Web Fundamentals (HTML, CSS, JavaScript) & REST APIs.\n2. Pick a specialization: Full-Stack React/Next.js or Python for Backend/AI.\n3. Learn Git & push every project to GitHub.\n4. Complete a structured 15-20 Days Internship with live mentors at Wingroo to get certified proof-of-work!";
    } else if (lower.includes('coimbatore') || lower.includes('tatabad') || lower.includes('address') || lower.includes('location')) {
      botReplyText = "📍 **Wingroo Technologies Coimbatore Hub:**\n2nd Floor, SS Complex, 64/1, 7th Street, Tatabad, Coimbatore, TN 641012. We are situated right in Coimbatore's innovation district near Gandhipuram. Call or WhatsApp us at +91 81247 79111.";
    } else if (lower.includes('intern') || lower.includes('college') || lower.includes('fee') || lower.includes('scholarship')) {
      botReplyText = "🎓 Our College Internship runs for 15 to 20 working days with daily structured timetable slots. We provide Up to 100% Merit Scholarships based on an online 20-minute screening test. Certificates are ISO 9001:2015 & MSME certified.";
    } else if (lower.includes('live') || lower.includes('stipend')) {
      botReplyText = "🚀 Live Project Internships involve real client applications and internal platforms like ZENTIME and IIE PLUS. Resume submission is required, and top contributors receive merit stipends.";
    } else if (lower.includes('vibe') || lower.includes('agent') || lower.includes('prompt')) {
      botReplyText = "⚡ We specialize in Vibe Coding (rapid 72-hour MVP delivery using Cursor & Claude) as well as autonomous Agentic AI systems for automated workflows like Gmail responders and CRM integrations.";
    } else if (lower.includes('job') || lower.includes('career') || lower.includes('hiring') || lower.includes('apply')) {
      botReplyText = "💼 We are actively hiring developers and AI prompt engineers for our Coimbatore hub & remote projects. Head to the 'Careers' banner on this page to apply with your resume!";
    } else {
      botReplyText = "Thank you for asking! Wingroo Technologies provides custom Software Development (Web & Mobile Apps for Play Store & App Store), 72-Hour Rapid MVPs, Agentic AI, and 15-20 Days College Internships with Up to 100% Scholarships.\n\n👇 Feel free to leave your contact details below to discuss your project with our engineering team!";
    }

    const botMsg = { sender: 'bot', text: botReplyText, time: 'Just now' };
    setMessages(prev => [...prev, userMsg, botMsg]);

    if (isDevQuery) {
      if (lower.includes('mobile') || lower.includes('play store') || lower.includes('app store') || lower.includes('android') || lower.includes('ios')) {
        setLeadContact(prev => ({ ...prev, projectType: 'Mobile App (Google Play Store & Apple App Store)' }));
      } else if (lower.includes('mvp') || lower.includes('72')) {
        setLeadContact(prev => ({ ...prev, projectType: '72-Hour Rapid MVP' }));
      } else if (lower.includes('ai') || lower.includes('agent')) {
        setLeadContact(prev => ({ ...prev, projectType: 'Agentic AI / Automation Workflow' }));
      } else {
        setLeadContact(prev => ({ ...prev, projectType: 'Custom Web Application & SaaS' }));
      }
      setTimeout(() => setShowLeadForm(true), 400);
    } else if (!leadSubmitted) {
      setTimeout(() => setShowLeadForm(true), 600);
    }
  };

  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    if (!leadContact.phone) return;

    try {
      await fetch(`${API_BASE_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: leadContact.name || 'Chatbot Project Client',
          email: leadContact.email || 'chatbot-lead@wingrootech.com',
          phone: leadContact.phone,
          subject: `Chatbot Project Lead: ${leadContact.projectType || 'Development Inquiry'}`,
          message: `[AI Chatbot Client Lead]\nClient Name: ${leadContact.name || 'Not provided'}\nPhone/WhatsApp: ${leadContact.phone}\nEmail: ${leadContact.email || 'N/A'}\nProject Type: ${leadContact.projectType}\nRequirement: ${leadContact.notes || 'Client requested free architecture consultation and quote.'}`
        })
      });
    } catch (err) {
      console.warn('Lead submit fallback:', err);
    }

    setLeadSubmitted(true);
    setShowLeadForm(false);
    setMessages(prev => [
      ...prev,
      {
        sender: 'bot',
        text: `🎉 Thank you${leadContact.name ? ', ' + leadContact.name : ''}! We have received your project inquiry for **${leadContact.projectType}**.\n\nOur senior engineering lead will review your requirements and reach out to you on **${leadContact.phone}** to schedule your free 30-minute architecture consultation.\n\n👉 Need an immediate response? Message us directly on WhatsApp at **+91 81247 79111**!`,
        time: 'Just now'
      }
    ]);
  };

  return (
    <div className="ai-chatbot-root">
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)} 
          className="ai-chat-launcher-btn"
          aria-label="Open Wingy - Wingroo AI Assistant"
        >
          <div className="launcher-pulse-ring" />
          <div className="launcher-icon-wrap">
            <Bot size={28} />
          </div>
          <div className="launcher-tooltip">
            <span className="tooltip-dot" />
            <span>Chat with Wingy</span>
          </div>
        </button>
      )}

      {/* Chat Window Modal */}
      {isOpen && (
        <div className="ai-chat-window">
          {/* Header */}
          <div className="chat-window-header">
            <div className="header-bot-info">
              <div className="bot-avatar-circle">
                <Bot size={20} />
                <span className="status-dot-online" />
              </div>
              <div>
                <h4 className="bot-name">Wingy <span style={{ fontSize: '0.72rem', opacity: 0.85, fontWeight: 500 }}>(Wingroo AI)</span></h4>
                <span className="bot-status-text">Online • Instant Answers</span>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="chat-header-close" 
              aria-label="Close Chat"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="chat-messages-area">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-bubble-row ${msg.sender === 'user' ? 'user-row' : 'bot-row'}`}>
                {msg.sender === 'bot' && (
                  <div className="bubble-bot-avatar">
                    <Bot size={14} />
                  </div>
                )}
                <div className={`chat-bubble ${msg.sender === 'user' ? 'user-bubble' : 'bot-bubble'}`}>
                  <div className="bubble-content" style={{ whiteSpace: 'pre-line' }}>
                    {msg.text}
                  </div>
                  <span className="bubble-time">{msg.time}</span>
                </div>
              </div>
            ))}

            {/* Quick Prompts Chips */}
            <div className="quick-prompts-container">
              <div className="quick-prompts-title">
                <Sparkles size={12} />
                <span>Suggested Questions:</span>
              </div>
              <div className="quick-prompts-scroll">
                {QUICK_PROMPTS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSendPrompt(p)}
                    className="quick-prompt-chip"
                  >
                    {p.icon}
                    <span>{p.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Project Consultation & Lead Capture Card */}
            {showLeadForm && !leadSubmitted && (
              <div className="lead-capture-card">
                <div className="lead-capture-header">
                  <Rocket size={18} className="lead-icon" />
                  <div>
                    <strong>Request Free Architecture Consultation & Quote</strong>
                    <p>Share your project details — our senior engineering lead will connect with you directly.</p>
                  </div>
                </div>
                <form onSubmit={handleLeadSubmit} className="lead-form">
                  <input 
                    type="text" 
                    placeholder="Enter your full name *" 
                    required
                    value={leadContact.name}
                    onChange={(e) => setLeadContact(prev => ({ ...prev, name: e.target.value }))}
                    className="lead-input"
                  />
                  <input 
                    type="tel" 
                    placeholder="Mobile / WhatsApp Number *" 
                    required
                    value={leadContact.phone}
                    onChange={(e) => setLeadContact(prev => ({ ...prev, phone: e.target.value }))}
                    className="lead-input"
                  />
                  <input 
                    type="email" 
                    placeholder="Email Address (Optional)" 
                    value={leadContact.email}
                    onChange={(e) => setLeadContact(prev => ({ ...prev, email: e.target.value }))}
                    className="lead-input"
                  />
                  <select
                    value={leadContact.projectType}
                    onChange={(e) => setLeadContact(prev => ({ ...prev, projectType: e.target.value }))}
                    className="lead-input lead-select"
                  >
                    <option value="Mobile App (Google Play Store & Apple App Store)">Mobile App (Google Play Store & Apple App Store)</option>
                    <option value="Custom Web Application & SaaS">Custom Web Application & SaaS</option>
                    <option value="72-Hour Rapid MVP">72-Hour Rapid MVP</option>
                    <option value="Agentic AI / Automation Workflow">Agentic AI / Automation Workflow</option>
                    <option value="E-Commerce Storefront">E-Commerce Storefront</option>
                    <option value="College Internship / Academic Project">College Internship / Academic Project</option>
                    <option value="Other Technology Solution">Other Technology Solution</option>
                  </select>
                  <input 
                    type="text" 
                    placeholder="Brief Project Requirement / Idea (Optional)" 
                    value={leadContact.notes}
                    onChange={(e) => setLeadContact(prev => ({ ...prev, notes: e.target.value }))}
                    className="lead-input"
                  />
                  <div className="lead-actions-row">
                    <button type="submit" className="btn-lead-submit">
                      <span>Request Free Consultation 🚀</span>
                      <ArrowRight size={13} />
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setShowLeadForm(false)} 
                      className="btn-lead-skip"
                    >
                      Dismiss
                    </button>
                  </div>
                  <a 
                    href="https://wa.me/918124779111?text=Hi%20Wingroo%20Technologies,%20I%20would%20like%20to%20discuss%20a%20new%20project" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="lead-whatsapp-direct"
                  >
                    <span>Or Chat on WhatsApp: +91 81247 79111 ↗</span>
                  </a>
                </form>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input */}
          <form onSubmit={handleCustomSend} className="chat-window-footer">
            <input 
              type="text" 
              placeholder="Ask anything about Wingroo..." 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="chat-input-field"
            />
            <button 
              type="submit" 
              disabled={!inputText.trim()} 
              className="chat-send-btn"
              aria-label="Send message"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
