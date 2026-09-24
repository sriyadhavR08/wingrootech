import React from 'react';
import { 
  Globe, 
  Smartphone, 
  ShoppingCart, 
  Megaphone, 
  Bot, 
  Cloud, 
  ArrowRight,
  Check 
} from 'lucide-react';
import './Services.css';

const SERVICES_DATA = [
  {
    num: '01',
    category: 'Web Development',
    title: 'Websites That Do More Than Look Good.',
    desc: 'Your website is often the first interaction people have with your brand. We create modern, responsive and user-friendly websites designed to communicate your brand clearly and provide a smooth experience across devices.',
    icon: <Globe size={26} />,
    tags: [
      'Business Websites',
      'Corporate Websites',
      'Web Applications',
      'Frontend Development',
      'Backend Development',
      'Full-Stack Solutions'
    ]
  },
  {
    num: '02',
    category: 'Mobile App Development',
    title: 'Ideas Designed for the Mobile World.',
    desc: 'Mobile has become one of the most important ways people interact with businesses and services. We create intuitive mobile experiences that focus on usability, performance and simplicity.',
    icon: <Smartphone size={26} />,
    tags: [
      'iOS & Android Solutions',
      'Cross-Platform Apps',
      'High Performance',
      'Intuitive Navigation'
    ]
  },
  {
    num: '03',
    category: 'E-Commerce Solutions',
    title: 'From Browsing to Buying.',
    desc: 'We develop digital commerce experiences that help businesses take their products and services online with simple navigation, product discovery, customer experience, and smooth purchasing journeys.',
    icon: <ShoppingCart size={26} />,
    tags: [
      'Product Discovery',
      'Customer Experience',
      'Secure Transactions',
      'Smooth Checkout Flow'
    ]
  },
  {
    num: '04',
    category: 'Digital Marketing',
    title: 'Grow Your Reach. Accelerate Real Results.',
    desc: 'In today\'s digital landscape, visibility is everything. We create data-driven digital marketing campaigns, SEO strategies, and content funnels that connect your brand with the right audience and drive measurable growth.',
    icon: <Megaphone size={26} />,
    tags: [
      'Search Engine Optimization (SEO)',
      'Social Media Marketing (SMM)',
      'Targeted Ad Campaigns & PPC',
      'Content Strategy & Branding',
      'Conversion Rate Optimization',
      'Performance Analytics'
    ]
  },
  {
    num: '05',
    category: 'AI Chatbots',
    title: '24/7 Intelligent Automation & Conversational AI.',
    desc: 'Transform customer engagement and operational efficiency with custom AI-powered chatbots. We build intelligent conversational agents capable of natural language understanding, instant query resolution, and seamless system integrations.',
    icon: <Bot size={26} />,
    tags: [
      'Custom Conversational AI',
      '24/7 Automated Support',
      'Natural Language Processing (NLP)',
      'CRM & Database Integrations',
      'Multi-Channel (Web & WhatsApp)',
      'Smart Lead Qualification'
    ]
  },
  {
    num: '06',
    category: 'Deployment and DevOps',
    title: 'Reliable Infrastructure. Zero Downtime Delivery.',
    desc: 'Ship faster and scale seamlessly with automated CI/CD pipelines and robust cloud infrastructure. We manage containerization, automated deployments, cloud hosting, and continuous monitoring to guarantee peak performance and security.',
    icon: <Cloud size={26} />,
    tags: [
      'CI/CD Automated Pipelines',
      'Cloud Hosting (AWS, GCP, Azure)',
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

        {/* 6 Modern Service Cards */}
        <div className="services-grid">
          {SERVICES_DATA.map((srv) => (
            <div key={srv.num} className="service-card modern-card">
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
          ))}
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
