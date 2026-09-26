import React, { useState, useRef, useEffect } from 'react';
import { 
  Globe, 
  Smartphone, 
  ShoppingCart, 
  Megaphone, 
  Bot, 
  Cloud, 
  ArrowRight,
  Check,
  Cpu,
  Sparkles,
  Workflow,
  Zap,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import './Services.css';

const SERVICES_DATA = [
  {
    num: '01',
    category: 'Web Development & Vibe Coding',
    title: 'Websites & Web Apps Built with Precision and Speed.',
    desc: 'We combine traditional robust engineering (HTML5, CSS3, React, Node.js, Python) with modern Vibe Coding workflows using Cursor, v0, and Claude to build and deploy high-performance applications in record time (rapid prototype in hours to full production deployment in 72 hours).',
    icon: <Globe size={26} />,
    tags: [
      'Full-Stack Architecture',
      'Vibe Coding & Rapid Sprints',
      '72-Hour Production Deployments',
      'React & Next.js SPAs',
      'RESTful & GraphQL APIs',
      'Clean Code & Responsive UI'
    ]
  },
  {
    num: '02',
    category: 'Mobile App Development',
    title: 'Ideas Designed for the Mobile World.',
    desc: 'Mobile has become the primary medium for customer interaction. We engineer native and cross-platform mobile apps using Flutter and React Native focusing on speed, native gesture fluidity, offline-first caching, and seamless cloud sync.',
    icon: <Smartphone size={26} />,
    tags: [
      'iOS & Android Solutions',
      'Cross-Platform Apps (Flutter/React Native)',
      'Offline-First Data Caching',
      'High Performance & Fluidity',
      'Intuitive Navigation & UX'
    ]
  },
  {
    num: '03',
    category: 'E-Commerce Solutions',
    title: 'From Browsing to Buying.',
    desc: 'Digital commerce experiences engineered for high conversion rates. We design storefronts with friction-free product discovery, secure checkout workflows, real-time inventory management, and multi-gateway payment integrations (Razorpay, Stripe, UPI).',
    icon: <ShoppingCart size={26} />,
    tags: [
      'Product Discovery & Search',
      'Frictionless Checkout Flow',
      'Payment Gateway Integration',
      'Inventory & Order Tracking',
      'Customer Loyalty Features'
    ]
  },
  {
    num: '04',
    category: 'Agentic AI & Custom AI Agents',
    title: 'Autonomous Systems That Think, Route, and Act.',
    desc: 'Move beyond static bots. We design and build Agentic AI workflows and autonomous agents capable of independent reasoning, multi-step tool execution, and task automation—from autonomous Gmail client responders and CRM routing to automated system maintenance.',
    icon: <Workflow size={26} />,
    tags: [
      'Autonomous AI Agent Building',
      'Tool-Use LLM Orchestration',
      'Gmail & CRM Auto-Responders',
      'Multi-Agent System Architecture',
      'Automated Task Execution',
      'Enterprise Workflow Bots'
    ]
  },
  {
    num: '05',
    category: 'Prompt Engineering & GenAI',
    title: 'Harness Next-Gen Large Language Models.',
    desc: 'Unlock the true power of ChatGPT-4o, Claude 3.5, Gemini, and Gamma. We design structured prompt chains, context-window optimizations, Retrieval-Augmented Generation (RAG) knowledge pipelines, and custom enterprise AI integrations.',
    icon: <Cpu size={26} />,
    tags: [
      'Advanced Prompt Engineering',
      'ChatGPT-4o & Claude Integration',
      'RAG (Retrieval Augmented Gen)',
      'Gamma & AI Slide/Doc Systems',
      'Context-Aware AI Assistants',
      'Enterprise Model Guardrails'
    ]
  },
  {
    num: '06',
    category: 'SEO, GEO & Digital Marketing',
    title: 'Rank on Search Engines & AI Answer Engines.',
    desc: 'In modern discovery, visibility spans Google and generative AI engines. We execute comprehensive Search Engine Optimization (SEO) and Generative Engine Optimization (GEO/AEO) so your brand ranks top in Google, Bing, and AI summaries like ChatGPT and Perplexity.',
    icon: <Megaphone size={26} />,
    tags: [
      'Technical & On-Page SEO',
      'GEO / AEO (AI Engine Optimization)',
      'Content Interlinking Strategy',
      'Local Business SEO (Coimbatore)',
      'Conversion Rate Optimization',
      'Targeted Ad Campaigns & PPC'
    ]
  },
  {
    num: '07',
    category: 'Deployment and DevOps',
    title: 'Reliable Infrastructure. Zero Downtime Delivery.',
    desc: 'Ship faster and scale seamlessly with automated CI/CD pipelines and robust cloud infrastructure. We manage containerization, automated deployments, cloud hosting (AWS, Render, Vercel), and continuous monitoring to guarantee peak performance and security.',
    icon: <Cloud size={26} />,
    tags: [
      'CI/CD Automated Pipelines',
      'Cloud Hosting (AWS, Render, Vercel)',
      'Docker Containerization',
      'Infrastructure Monitoring & Uptime',
      'SSL, Security & Load Balancing',
      'High-Availability Architecture'
    ]
  }
];

export default function Services() {
  const scrollToContact = () => {
    const el = document.querySelector('#contact');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // User-Controlled Services Slider State (No Auto-Slide)
  const servicesSliderRef = useRef(null);
  const [activeServiceIndex, setActiveServiceIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);

  const checkServicesScroll = () => {
    const el = servicesSliderRef.current;
    if (!el) return;
    setCanScrollPrev(el.scrollLeft > 10);
    setCanScrollNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);

    const firstCard = el.querySelector('.service-slide-item');
    if (firstCard) {
      const cardWidth = firstCard.offsetWidth + 24;
      const index = Math.round(el.scrollLeft / cardWidth);
      setActiveServiceIndex(Math.min(Math.max(index, 0), SERVICES_DATA.length - 1));
    }
  };

  useEffect(() => {
    checkServicesScroll();
    window.addEventListener('resize', checkServicesScroll);
    return () => window.removeEventListener('resize', checkServicesScroll);
  }, []);

  const scrollServices = (direction) => {
    const el = servicesSliderRef.current;
    if (!el) return;
    const firstCard = el.querySelector('.service-slide-item');
    const scrollAmount = firstCard ? (firstCard.offsetWidth + 24) : 380;
    el.scrollBy({
      left: direction === 'next' ? scrollAmount : -scrollAmount,
      behavior: 'smooth'
    });
  };

  const scrollToServiceIndex = (index) => {
    const el = servicesSliderRef.current;
    if (!el) return;
    const cards = el.querySelectorAll('.service-slide-item');
    if (cards[index]) {
      cards[index].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
      setActiveServiceIndex(index);
    }
  };

  return (
    <section id="services" className="services-section">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <div className="section-tag">
            <span className="dot" />
            <span>Expertise & Capabilities</span>
          </div>
          <h2 className="section-title">Technology Built Around Your Needs.</h2>
          <p className="section-desc">
            Every business has a different challenge. Every idea has a different requirement. 
            That's why we don't believe in one-size-fits-all technology. At Wingroo Technologies, 
            we understand your requirements, identify the right approach and build digital solutions 
            that are designed around your goals.
          </p>
        </div>

        {/* User-Controlled Services Slider (No Auto-Slide) */}
        <div className="services-slider-wrapper">
          <div className="services-slider-container">
            <button 
              type="button"
              className="services-slider-arrow services-slider-prev"
              onClick={() => scrollServices('prev')}
              disabled={!canScrollPrev}
              aria-label="Previous service"
              title="Previous service"
            >
              <ChevronLeft size={22} />
            </button>

            <div 
              className="services-slider-track" 
              ref={servicesSliderRef}
              onScroll={checkServicesScroll}
            >
              {SERVICES_DATA.map((srv) => (
                <div key={srv.num} className="service-slide-item">
                  <div className="service-card modern-card">
                    <div className="service-top">
                      <div className="service-icon-box">
                        {srv.icon}
                      </div>
                      <div className="service-number">Service {srv.num}</div>
                    </div>

                    <div className="service-category">{srv.category}</div>
                    <h3 className="service-card-title">{srv.title}</h3>
                    <p className="service-card-desc">{srv.desc}</p>

                    <div className="service-tags-wrapper">
                      {srv.tags.map((tag, i) => (
                        <span key={i} className="service-pill-tag">
                          <Check size={12} className="tag-check" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button 
              type="button"
              className="services-slider-arrow services-slider-next"
              onClick={() => scrollServices('next')}
              disabled={!canScrollNext}
              aria-label="Next service"
              title="Next service"
            >
              <ChevronRight size={22} />
            </button>
          </div>

          {/* Slider Navigation Controls (Dots + Hint + Counter) */}
          <div className="services-slider-controls">
            <div className="services-slider-dots">
              {SERVICES_DATA.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`services-dot ${activeServiceIndex === idx ? 'active' : ''}`}
                  onClick={() => scrollToServiceIndex(idx)}
                  aria-label={`Go to service ${idx + 1}`}
                />
              ))}
            </div>
            <div className="slider-hint-text">
              <span>← Drag or click arrows to explore services →</span>
            </div>
            <div className="services-slider-counter">
              <span>{activeServiceIndex + 1}</span> / <span>{SERVICES_DATA.length}</span>
            </div>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="services-cta-banner">
          <div className="services-cta-content">
            <h3 className="services-cta-title">Ready to bring your vision to life?</h3>
            <p className="services-cta-desc">Let us craft an engineered solution tailored specifically to your goals.</p>
          </div>
          <button onClick={scrollToContact} className="btn btn-primary services-action-btn">
            <span>Build My Solution</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
