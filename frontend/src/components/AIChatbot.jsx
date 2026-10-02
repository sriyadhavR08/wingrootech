import React, { useState, useRef, useEffect } from 'react';
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
  HelpCircle
} from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import { AEO_GEO_FAQS } from '../data/aeoGeoFaqs';
import './AIChatbot.css';

const QUICK_PROMPTS = [
  { 
    id: 'ai_replace', 
    label: 'Will AI replace software developers?', 
    icon: <Sparkles size={14} />,
    reply: '🤖 **Will AI replace software developers?**\nNo! AI will not replace software developers, but developers who master AI workflows (Cursor, Claude 3.5 Sonnet, v0) will replace those who do not.\n\nModern developers act as architectural orchestrators—guiding AI code generators, verifying system security, and building scalable production software.'
  },
  { 
    id: 'fresher_start', 
    label: 'As a fresher, where should I start?', 
    icon: <GraduationCap size={14} />,
    reply: '🎓 **Fresher Developer Roadmap:**\n1. Master Web Fundamentals (HTML, modern CSS, JavaScript) & REST APIs.\n2. Specialize in either Full-Stack React/Next.js or Python for Backend/AI.\n3. Learn Git from Day 1 and push all code to GitHub.\n4. Complete a structured 15-20 Days Internship with live mentors at Wingroo to get verified commercial proof-of-work!'
  },
  { 
    id: 'internship', 
    label: 'College Internship & 100% Scholarship', 
    icon: <Briefcase size={14} />,
    reply: '🎓 **College Internship Program (15–20 Days):**\n• Structured daily timetable (Theory & Hands-on Lab).\n• **Up to 100% Merit Scholarships** based on our 20-min online screening assessment.\n• Recognized ISO 9001:2015, MSME & Startup India certification with real GitHub repos.'
  },
  { 
    id: 'vibe_coding', 
    label: 'What is Vibe Coding?', 
    icon: <Code2 size={14} />,
    reply: '⚡ **What is Vibe Coding?**\nVibe Coding is the modern software development methodology where developers describe intentions and system specs in natural language while AI tools (Cursor, Claude 3.5 Sonnet, v0) write boilerplate code.\n\nWingroo pioneers this workflow to ship production MVPs in 72 hours!'
  },
  { 
    id: 'location', 
    label: 'Coimbatore Hub & Contact', 
    icon: <Rocket size={14} />,
    reply: '📍 **Wingroo Technologies Coimbatore Hub:**\n2nd Floor, SS Complex, 64/1, 7th Street, Tatabad, Coimbatore, TN 641012 (near Gandhipuram).\n📞 Phone / WhatsApp: +91 81247 79111.'
  }
];

export default function AIChatbot({ onOpenSchedule, onOpenStudentPortal }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "Hello! 👋 I'm **Wingy**, your Wingroo AI Assistant. How can I help you today with our Internships, Software Services, or Engineering Roles?",
      time: 'Just now'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadContact, setLeadContact] = useState({ name: '', phone: '' });
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

    // After 2 messages, softly prompt for lead contact if not yet submitted
    if (!leadSubmitted && messages.length >= 2) {
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

    if (bestMatch && highestScore >= 6) {
      botReplyText = `💡 **${bestMatch.q}**\n\n${bestMatch.a}\n\n👉 *Need more details or want to join our hands-on internship cohort? You can apply on our website or leave your phone number below for our mentors to connect!*`;
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
    } else if (lower.includes('live') || lower.includes('project') || lower.includes('stipend')) {
      botReplyText = "🚀 Live Project Internships involve real client applications and internal platforms like ZENTIME and IIE PLUS. Resume submission is required, and top contributors receive merit stipends.";
    } else if (lower.includes('vibe') || lower.includes('agent') || lower.includes('prompt')) {
      botReplyText = "⚡ We specialize in Vibe Coding (rapid 72-hour MVP delivery using Cursor & Claude) as well as autonomous Agentic AI systems for automated workflows like Gmail responders and CRM integrations.";
    } else if (lower.includes('job') || lower.includes('career') || lower.includes('hiring') || lower.includes('apply')) {
      botReplyText = "💼 We are actively hiring developers and AI prompt engineers for our Coimbatore hub & remote projects. Head to the 'Careers' banner on this page to apply with your resume!";
    } else {
      botReplyText = "Thank you for asking! Wingroo Technologies provides industry-grade Software Development, 15-20 Days College Internships with Up to 100% Scholarships, Live Client Projects, and Agentic AI solutions. You can also explore our 60+ FAQs in the 'AI & Career FAQs Hub' section on our site!";
    }

    const botMsg = { sender: 'bot', text: botReplyText, time: 'Just now' };
    setMessages(prev => [...prev, userMsg, botMsg]);

    if (!leadSubmitted) {
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
          name: leadContact.name || 'Chatbot Visitor',
          email: 'chatbot-lead@wingrootech.com',
          phone: leadContact.phone,
          subject: 'AI Chatbot Callback Request',
          message: 'Visitor requested direct callback / WhatsApp connection via AI Chatbot widget.'
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
        text: `🎉 Thank you${leadContact.name ? ', ' + leadContact.name : ''}! Our academic and technical leads will reach out to you on **${leadContact.phone}** shortly. You can also message us directly on WhatsApp at +91 81247 79111.`,
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

            {/* Optional Lead Callback Capture Box */}
            {showLeadForm && !leadSubmitted && (
              <div className="lead-capture-card">
                <div className="lead-capture-header">
                  <Phone size={16} className="lead-icon" />
                  <div>
                    <strong>Direct Callback / WhatsApp Connection</strong>
                    <p>Leave your contact in case the chat ends or to get personalized counseling.</p>
                  </div>
                </div>
                <form onSubmit={handleLeadSubmit} className="lead-form">
                  <input 
                    type="text" 
                    placeholder="Your Name (Optional)" 
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
                  <div className="lead-actions-row">
                    <button type="submit" className="btn-lead-submit">
                      <span>Request Callback</span>
                      <ArrowRight size={13} />
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setShowLeadForm(false)} 
                      className="btn-lead-skip"
                    >
                      Skip & Chat
                    </button>
                  </div>
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
