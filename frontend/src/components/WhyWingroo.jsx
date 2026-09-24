import React from 'react';
import { 
  Target, 
  Lightbulb, 
  ShieldCheck, 
  GraduationCap, 
  Briefcase, 
  TrendingUp 
} from 'lucide-react';
import './WhyWingroo.css';

const WHY_FEATURES = [
  {
    num: '01',
    title: 'Practical Thinking',
    desc: 'We focus on understanding the actual problem before deciding on the technology.',
    icon: <Target size={24} />
  },
  {
    num: '02',
    title: 'Innovation',
    desc: 'We explore modern technologies and creative approaches to build solutions that move beyond the ordinary.',
    icon: <Lightbulb size={24} />
  },
  {
    num: '03',
    title: 'Quality',
    desc: 'We believe good digital products should be reliable, usable and thoughtfully designed.',
    icon: <ShieldCheck size={24} />
  },
  {
    num: '04',
    title: 'Learning Culture',
    desc: 'We encourage continuous learning because technology never stops evolving.',
    icon: <GraduationCap size={24} />
  },
  {
    num: '05',
    title: 'Real Experience',
    desc: 'Our projects and internship programs focus on practical exposure rather than only theoretical knowledge.',
    icon: <Briefcase size={24} />
  },
  {
    num: '06',
    title: 'Growth',
    desc: 'We create an environment where ideas, skills and people can grow together.',
    icon: <TrendingUp size={24} />
  }
];

export default function WhyWingroo() {
  return (
    <section className="why-wingroo-section">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <div className="section-tag">
            <span className="dot" />
            <span>Core Values</span>
          </div>
          <h2 className="section-title">Why Wingroo?</h2>
          <div className="section-subheading">
            Because Building Technology Is Only One Part of the Journey.
          </div>
          <p className="section-desc">
            We believe a successful technology company should not only deliver solutions 
            but also create knowledge, opportunities and meaningful experiences along the way.
          </p>
        </div>

        {/* 6 Feature Blocks */}
        <div className="why-features-grid">
          {WHY_FEATURES.map((item) => (
            <div key={item.num} className="why-block-card modern-card">
              <div className="why-block-header">
                <div className="why-icon-box">
                  {item.icon}
                </div>
                <span className="why-num">{item.num}</span>
              </div>
              <h3 className="why-block-title">{item.title}</h3>
              <p className="why-block-desc">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
