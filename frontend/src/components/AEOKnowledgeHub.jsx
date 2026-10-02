import React, { useState, useMemo } from 'react';
import { 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  Rocket, 
  GraduationCap, 
  Zap, 
  Bot, 
  MapPin, 
  Briefcase, 
  HelpCircle,
  X,
  ArrowRight,
  MessageSquare
} from 'lucide-react';
import { AEO_CATEGORIES, AEO_GEO_FAQS } from '../data/aeoGeoFaqs';
import './AEOKnowledgeHub.css';

const ICON_MAP = {
  Sparkles: Sparkles,
  Rocket: Rocket,
  GraduationCap: GraduationCap,
  Zap: Zap,
  Bot: Bot,
  MapPin: MapPin,
  Briefcase: Briefcase
};

export default function AEOKnowledgeHub({ onOpenChatbot }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaqId, setOpenFaqId] = useState(1); // First item open by default
  const [visibleLimit, setVisibleLimit] = useState(8);

  // Filter questions based on category and search query
  const filteredFaqs = useMemo(() => {
    let list = AEO_GEO_FAQS;

    if (activeCategory !== 'all') {
      list = list.filter(item => item.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(item => 
        item.q.toLowerCase().includes(q) ||
        item.a.toLowerCase().includes(q) ||
        item.tags.some(tag => tag.toLowerCase().includes(q))
      );
    }

    return list;
  }, [activeCategory, searchQuery]);

  const displayedFaqs = useMemo(() => {
    return filteredFaqs.slice(0, visibleLimit);
  }, [filteredFaqs, visibleLimit]);

  const handleToggle = (id) => {
    setOpenFaqId(prev => prev === id ? null : id);
  };

  const handleCategoryChange = (catId) => {
    setActiveCategory(catId);
    setVisibleLimit(8);
  };

  // Structured Data Schema for Google SGE, Perplexity & Bing (FAQPage JSON-LD)
  const faqSchemaData = useMemo(() => {
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": AEO_GEO_FAQS.slice(0, 30).map(faq => ({
        "@type": "Question",
        "name": faq.q,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.a
        }
      }))
    };
  }, []);

  return (
    <section id="faq-knowledge-hub" className="aeo-hub-section">
      {/* Schema.org FAQPage JSON-LD for Search Engines & AEO Bots */}
      <script 
        type="application/ld+json" 
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchemaData) }} 
      />

      <div className="container">
        {/* Section Header */}
        <div className="section-header aeo-header">
          <div className="section-tag">
            <span className="dot" />
            <span>AI Answer Engine & Regional Career Knowledge Hub (AEO & GEO)</span>
          </div>
          <h2 className="section-title">
            Answers for Modern Tech Careers, AI & Freshers
          </h2>
          <p className="section-desc">
            Direct, authoritative answers to the most frequently queried questions across Google, Perplexity, and AlsoAsked about job security in the AI era, Vibe Coding, career roadmaps, and practical software internships in Coimbatore.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="aeo-controls-wrap">
          <div className="aeo-search-box">
            <Search size={18} className="search-icon" />
            <input 
              type="text"
              placeholder="Search 60+ questions (e.g., 'careers in AI era', 'will AI replace', 'where to start', 'Coimbatore')..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setVisibleLimit(8);
              }}
              className="aeo-search-input"
            />
            {searchQuery && (
              <button 
                type="button" 
                onClick={() => setSearchQuery('')}
                className="search-clear-btn"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="aeo-category-tabs">
            {AEO_CATEGORIES.map(cat => {
              const IconComp = ICON_MAP[cat.icon] || HelpCircle;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`aeo-cat-btn ${isActive ? 'active' : ''}`}
                >
                  <IconComp size={15} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Counter */}
        <div className="aeo-results-meta">
          <span>Showing <strong>{displayedFaqs.length}</strong> of <strong>{filteredFaqs.length}</strong> questions</span>
          {searchQuery && (
            <span className="query-badge">Filtered by: "{searchQuery}"</span>
          )}
        </div>

        {/* Accordion FAQ Grid */}
        {filteredFaqs.length === 0 ? (
          <div className="aeo-empty-state">
            <HelpCircle size={36} className="empty-icon" />
            <h3>No matching questions found</h3>
            <p>Try searching with simpler keywords like "2026", "internship", "AI", or "freshers".</p>
            <button 
              type="button" 
              onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
              className="btn btn-secondary"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="aeo-accordion-list">
            {displayedFaqs.map((faq, index) => {
              const isOpen = openFaqId === faq.id;
              return (
                <div 
                  key={faq.id} 
                  className={`aeo-card-item ${isOpen ? 'aeo-card-open' : ''}`}
                >
                  <button
                    type="button"
                    className="aeo-question-btn"
                    onClick={() => handleToggle(faq.id)}
                    aria-expanded={isOpen}
                  >
                    <span className="aeo-q-text">
                      <span className="aeo-q-num">Q{faq.id}.</span> {faq.q}
                    </span>
                    <span className="aeo-chevron-icon">
                      {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="aeo-answer-pane">
                      <p>{faq.a}</p>
                      {faq.tags && faq.tags.length > 0 && (
                        <div className="aeo-tag-list">
                          {faq.tags.map((tag, tIdx) => (
                            <span 
                              key={tIdx} 
                              className="aeo-micro-tag"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSearchQuery(tag);
                              }}
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* View More Button */}
        {filteredFaqs.length > visibleLimit && (
          <div className="aeo-load-more-wrap">
            <button
              type="button"
              onClick={() => setVisibleLimit(prev => Math.min(prev + 12, filteredFaqs.length))}
              className="btn btn-secondary aeo-more-btn"
            >
              <span>Explore More Questions ({filteredFaqs.length - visibleLimit} remaining)</span>
              <ChevronDown size={16} />
            </button>
          </div>
        )}

        {/* Knowledge Footer Banner */}
        <div className="aeo-hub-footer-card">
          <div className="footer-card-content">
            <div className="footer-card-badge">
              <Sparkles size={15} />
              <span>Have a specific career question?</span>
            </div>
            <h3 className="footer-card-title">Ask Wingy, Our Real-Time AI Technical Advisor</h3>
            <p className="footer-card-desc">
              Get personalized roadmaps for your specific college semester, domain syllabus, and eligibility for up to 100% merit scholarship in Coimbatore.
            </p>
          </div>
          <div className="footer-card-actions">
            <button 
              type="button" 
              onClick={() => {
                if (onOpenChatbot) onOpenChatbot();
                else {
                  const botBtn = document.querySelector('.chat-toggle-btn');
                  if (botBtn) botBtn.click();
                }
              }} 
              className="btn btn-primary"
            >
              <MessageSquare size={16} />
              <span>Ask Wingy AI</span>
            </button>
            <a href="#internship" className="btn btn-secondary">
              <span>Explore Internships</span>
              <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
