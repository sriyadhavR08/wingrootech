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
  Briefcase
} from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import './AIChatbot.css';

const QUICK_PROMPTS = [
  { 
    id: 'internship', 
    label: 'College Internship & Scholarship', 
    icon: <GraduationCap size={14} />,
    reply: '🎓 **College Internship Program (15–20 Days):**\n• Structured daily timetable (09:30 AM – 12:30 PM Theory & 01:30 PM – 04:30 PM Hands-on Lab).\n• **Up to 100% Merit Scholarships** based on our 20-min online screening assessment.\n• Recognized ISO 9001:2015, MSME & Startup India certification with real GitHub repos.\n\nWould you like to explore the timetable or apply with scholarship?'
  },
  { 
    id: 'live_project', 
    label: 'Live Project Internship', 
    icon: <Rocket size={14} />,
    reply: '🚀 **Live Project Internship:**\n• Work directly on live production software (ZENTIME, IIE PLUS & client systems).\n• Includes git commit sprints, peer reviews, merit project stipends, and experience letters.\n• Direct application with Resume upload available!'
  },
  { 
    id: 'services', 
    label: 'Software & Vibe Coding Services', 
    icon: <Code2 size={14} />,
    reply: '💻 **Software Solutions & Vibe Coding:**\n• We build full-stack web and mobile apps combining traditional engineering with AI-driven **Vibe Coding**.\n• Rapid turnarounds: functional prototypes in hours and production-grade deployments in 72 hours!\n• E-commerce, modern SPAs, and enterprise systems.'
  },
  { 
    id: 'agentic_ai', 
    label: 'Agentic AI & Custom AI Agents', 
    icon: <Sparkles size={14} />,
    reply: '🤖 **Agentic AI & Custom Autonomous Agents:**\n• We build autonomous AI agents capable of tool execution, multi-step routing, and system integrations.\n• Examples: Autonomous Gmail customer auto-responders, CRM lead qualifiers, and self-operating business workflows using ChatGPT-4o & Claude 3.5.'
  },
  { 
    id: 'careers', 
    label: 'Careers & Join Our Team', 
    icon: <Briefcase size={14} />,
    reply: '💼 **Join Our Engineering Team:**\n• We are hiring developers and Prompt Engineers for live products like ZENTIME & IIE PLUS.\n• Open for both Freshers and experienced developers. You can apply directly with your resume in our Careers section!'
  }
];

export default function AIChatbot({ onOpenSchedule, onOpenStudentPortal }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Hello! 👋 Welcome to Wingroo Technologies. I am your AI assistant. How can I help you today with our Internships, Software Services, or Engineering Roles?',
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
    
    // Simple intelligent keyword match
    let botReplyText = "Thank you for asking! Wingroo Technologies provides industry-grade Software Development, 15-20 Days College Internships with Up to 100% Scholarships, Live Client Projects, and Agentic AI solutions. Would you like our senior consultant to connect with you directly?";
    const lower = userText.toLowerCase();

    if (lower.includes('intern') || lower.includes('college') || lower.includes('fee') || lower.includes('scholarship')) {
      botReplyText = "🎓 Our College Internship runs for 15 to 20 working days with daily structured timetable slots. We provide Up to 100% Merit Scholarships based on an online 20-minute screening test. Certificates are ISO 9001:2015 & MSME certified.";
    } else if (lower.includes('live') || lower.includes('project') || lower.includes('stipend')) {
      botReplyText = "🚀 Live Project Internships involve real client applications and internal platforms like ZENTIME and IIE PLUS. Resume submission is required, and top contributors receive merit stipends.";
    } else if (lower.includes('vibe') || lower.includes('ai') || lower.includes('agent') || lower.includes('prompt')) {
      botReplyText = "🤖 We specialize in Vibe Coding (rapid 72-hour MVP delivery using Cursor & Claude) as well as autonomous Agentic AI systems for automated workflows like Gmail responders and CRM integrations.";
    } else if (lower.includes('job') || lower.includes('career') || lower.includes('hiring') || lower.includes('apply')) {
      botReplyText = "💼 We are actively hiring developers and AI prompt engineers for our Coimbatore hub & remote projects. Head to the 'Careers' banner on this page to apply with your resume!";
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
        text: `🎉 Thank you${leadContact.name ? ', ' + leadContact.name : ''}! Our academic and technical leads will reach out to you on **${leadContact.phone}** shortly. You can also message us directly on WhatsApp at +91 96267 79609.`,
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
          aria-label="Open Wingroo AI Assistant"
        >
          <div className="launcher-pulse-ring" />
          <div className="launcher-icon-wrap">
            <Bot size={28} />
          </div>
          <div className="launcher-tooltip">
            <span className="tooltip-dot" />
            <span>Chat with Wingroo AI</span>
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
                <h4 className="bot-name">Wingroo AI Assistant</h4>
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
