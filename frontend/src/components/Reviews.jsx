import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Quote, 
  Star, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  GraduationCap 
} from 'lucide-react';
import './Reviews.css';

const STUDENT_REVIEWS = [
  {
    id: 1,
    name: 'Dhivya Dharshini',
    role: 'Full Stack Development Intern',
    cohort: 'Wingroo Tech Cohort',
    initials: 'DD',
    avatarGradient: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
    review: 'What I liked most about my internship was the way the concepts were explained before we started working on the project. It made the learning process much easier for me, especially when I was working with technologies I had not used before.'
  },
  {
    id: 2,
    name: 'Gowtham',
    role: 'Software Development Intern',
    cohort: 'Wingroo Tech Cohort',
    initials: 'G',
    avatarGradient: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
    review: 'The best part of my internship was getting hands-on experience with GitHub and the development workflow. I learned how developers manage code, make changes, work with repositories, and build a project step by step.'
  },
  {
    id: 3,
    name: 'Abinaya',
    role: 'Web Development Intern',
    cohort: 'Wingroo Tech Cohort',
    initials: 'A',
    avatarGradient: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
    review: 'I really enjoyed the project-based learning at Wingroo Technologies. Instead of only learning theory, I got the opportunity to actually build features and solve problems. That experience gave me much more confidence in my technical skills.'
  },
  {
    id: 4,
    name: 'Jamuna',
    role: 'Full Stack Engineering Intern',
    cohort: 'Wingroo Tech Cohort',
    initials: 'J',
    avatarGradient: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
    review: 'My internship helped me understand what a real working environment feels like. From discussing requirements to completing tasks and presenting the work, I got exposure to different stages of a project. It was a useful experience for my career.'
  },
  {
    id: 5,
    name: 'Preetha',
    role: 'AI & Machine Learning Intern',
    cohort: 'Wingroo Tech Cohort',
    initials: 'P',
    avatarGradient: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
    review: 'One of the things I found valuable was learning about new technologies and AI-based development. I got to explore concepts like AI tools and prompt engineering, which made the internship more interesting and helped me understand how technology is evolving.'
  },
  {
    id: 6,
    name: 'Mithun',
    role: 'Software Engineering Intern',
    cohort: 'Wingroo Tech Cohort',
    initials: 'M',
    avatarGradient: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
    review: 'The internship gave me a chance to improve not only my coding skills but also my problem-solving approach. Whenever I faced an issue, I had to understand the problem, try different solutions, and then improve the implementation. That was one of my biggest takeaways.'
  }
];

export default function Reviews() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);
  const [isPaused, setIsPaused] = useState(false);

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Responsive visible cards count
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 720) {
        setVisibleCount(1);
      } else if (window.innerWidth < 1080) {
        setVisibleCount(2);
      } else {
        setVisibleCount(3);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxIndex = Math.max(0, STUDENT_REVIEWS.length - visibleCount);

  // Auto-slide effect (4-second interval)
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 4000);

    return () => clearInterval(interval);
  }, [isPaused, maxIndex]);

  // Clamp index on resize
  useEffect(() => {
    if (currentIndex > maxIndex) {
      setCurrentIndex(maxIndex);
    }
  }, [maxIndex, currentIndex]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = e.targetTouches[0].clientX;
    setIsPaused(true);
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) {
      handleNext();
    } else if (diff < -50) {
      handlePrev();
    }
    setIsPaused(false);
  };

  return (
    <section id="reviews" className="reviews-section">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <div className="section-tag">
            <Sparkles size={14} className="tag-sparkle" />
            <span>Student Reviews</span>
          </div>
          <h2 className="section-title">
            Real Experiences. Real Impact.
          </h2>
          <p className="section-desc">
            Discover what our internship students have to say about their hands-on project journey, mentor support, and real-world learning at Wingroo Technologies.
          </p>
        </div>

        {/* Carousel Container */}
        <div 
          className="reviews-carousel-wrapper"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="reviews-slider-viewport">
            <div 
              className="reviews-slider-track"
              style={{
                '--current-index': currentIndex,
                '--visible-count': visibleCount
              }}
            >
              {STUDENT_REVIEWS.map((review) => (
                <div key={review.id} className="review-card">
                  {/* Top card bar with stars and quote icon */}
                  <div className="review-card-top">
                    <div className="review-stars-row" aria-label="5 out of 5 stars">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={16} 
                          className="review-star-icon" 
                          fill="#f59e0b" 
                          color="#f59e0b" 
                        />
                      ))}
                    </div>
                    <div className="review-quote-badge">
                      <Quote size={20} className="quote-icon" />
                    </div>
                  </div>

                  {/* Review Text */}
                  <p className="review-text">
                    “{review.review}”
                  </p>

                  {/* Reviewer Profile */}
                  <div className="review-author-row">
                    <div 
                      className="review-avatar" 
                      style={{ background: review.avatarGradient }}
                    >
                      <span>{review.initials}</span>
                    </div>
                    <div className="review-author-info">
                      <div className="review-author-name-row">
                        <h4 className="review-author-name">{review.name}</h4>
                        <span className="review-verified-badge" title="Verified Wingroo Student">
                          <CheckCircle2 size={13} />
                          <span>Verified</span>
                        </span>
                      </div>
                      <p className="review-author-role">{review.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="reviews-controls-row">
            <button
              type="button"
              onClick={handlePrev}
              className="review-arrow-btn"
              aria-label="Previous reviews"
              title="Previous"
            >
              <ChevronLeft size={20} />
            </button>

            {/* Pagination Dots */}
            <div className="review-dots-container">
              {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`review-dot ${currentIndex === idx ? 'review-dot-active' : ''}`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={handleNext}
              className="review-arrow-btn"
              aria-label="Next reviews"
              title="Next"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Auto-Slide Indicator Hint */}
          <div className="reviews-auto-hint">
            <span className="hint-pulse" />
            <span>Auto-sliding • Hover or tap to pause</span>
          </div>
        </div>
      </div>
    </section>
  );
}
