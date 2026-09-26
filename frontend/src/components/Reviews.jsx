import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Quote, 
  Star, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2 
} from 'lucide-react';
import './Reviews.css';

const STUDENT_REVIEWS = [
  {
    id: 1,
    name: 'Dhivya Dharshini',
    initials: 'DD',
    avatarGradient: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
    review: 'What I liked most about my internship was the way the concepts were explained before we started working on the project. It made the learning process much easier for me, especially when I was working with technologies I had not used before.'
  },
  {
    id: 2,
    name: 'Gowtham',
    initials: 'G',
    avatarGradient: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
    review: 'The best part of my internship was getting hands-on experience with GitHub and the development workflow. I learned how developers manage code, make changes, work with repositories, and build a project step by step.'
  },
  {
    id: 3,
    name: 'Abinaya',
    initials: 'A',
    avatarGradient: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
    review: 'I really enjoyed the project-based learning at Wingroo Technologies. Instead of only learning theory, I got the opportunity to actually build features and solve problems. That experience gave me much more confidence in my technical skills.'
  },
  {
    id: 4,
    name: 'Jamuna',
    initials: 'J',
    avatarGradient: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
    review: 'My internship helped me understand what a real working environment feels like. From discussing requirements to completing tasks and presenting the work, I got exposure to different stages of a project. It was a useful experience for my career.'
  },
  {
    id: 5,
    name: 'Preetha',
    initials: 'P',
    avatarGradient: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
    review: 'One of the things I found valuable was learning about new technologies and AI-based development. I got to explore concepts like AI tools and prompt engineering, which made the internship more interesting and helped me understand how technology is evolving.'
  },
  {
    id: 6,
    name: 'Mithun',
    initials: 'M',
    avatarGradient: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
    review: 'The internship gave me a chance to improve not only my coding skills but also my problem-solving approach. Whenever I faced an issue, I had to understand the problem, try different solutions, and then improve the implementation. That was one of my biggest takeaways.'
  }
];

// Append first 3 items at the end so it loops infinitely and seamlessly
const DISPLAY_REVIEWS = [
  ...STUDENT_REVIEWS,
  ...STUDENT_REVIEWS.slice(0, 3)
];

export default function Reviews() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [enableTransition, setEnableTransition] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  const trackRef = useRef(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Auto-slide loop every 2.2 seconds (pauses when mouse/arrow is held on review or arrows)
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setEnableTransition(true);
      setCurrentIndex((prev) => prev + 1);
    }, 2200);

    return () => clearInterval(timer);
  }, [isPaused]);

  // Update track position with smooth translation or silent reset
  useEffect(() => {
    const updatePosition = () => {
      if (!trackRef.current) return;
      const cards = trackRef.current.children;
      if (cards && cards[currentIndex]) {
        const offset = cards[currentIndex].offsetLeft;
        trackRef.current.style.transition = enableTransition 
          ? 'transform 0.65s cubic-bezier(0.22, 1, 0.36, 1)' 
          : 'none';
        trackRef.current.style.transform = `translateX(-${offset}px)`;
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [currentIndex, enableTransition]);

  // Seamless infinite loop handler
  const handleTransitionEnd = () => {
    if (currentIndex >= STUDENT_REVIEWS.length) {
      setEnableTransition(false);
      setCurrentIndex(0);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setEnableTransition(true);
        });
      });
    }
  };

  const handleNext = () => {
    setEnableTransition(true);
    setCurrentIndex((prev) => prev + 1);
  };

  const handlePrev = () => {
    setEnableTransition(true);
    if (currentIndex <= 0) {
      setEnableTransition(false);
      setCurrentIndex(STUDENT_REVIEWS.length);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setEnableTransition(true);
          setCurrentIndex(STUDENT_REVIEWS.length - 1);
        });
      });
    } else {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleDotClick = (idx) => {
    setEnableTransition(true);
    setCurrentIndex(idx);
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e) => {
    setIsPaused(true);
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 45) {
      handleNext();
    } else if (diff < -45) {
      handlePrev();
    }
    setIsPaused(false);
  };

  const activeDotIndex = currentIndex % STUDENT_REVIEWS.length;

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
              ref={trackRef}
              className="reviews-slider-track"
              onTransitionEnd={handleTransitionEnd}
            >
              {DISPLAY_REVIEWS.map((review, idx) => (
                <div 
                  key={`${review.id}-${idx}`} 
                  className="review-card"
                  onMouseEnter={() => setIsPaused(true)}
                  onMouseLeave={() => setIsPaused(false)}
                >
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

                  {/* Reviewer Profile - Name Only */}
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
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              onMouseDown={() => setIsPaused(true)}
              onMouseUp={() => setIsPaused(false)}
              className="review-arrow-btn"
              aria-label="Previous review"
              title="Previous"
            >
              <ChevronLeft size={20} />
            </button>

            {/* Pagination Dots */}
            <div className="review-dots-container">
              {STUDENT_REVIEWS.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleDotClick(idx)}
                  onMouseEnter={() => setIsPaused(true)}
                  onMouseLeave={() => setIsPaused(false)}
                  className={`review-dot ${activeDotIndex === idx ? 'review-dot-active' : ''}`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={handleNext}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              onMouseDown={() => setIsPaused(true)}
              onMouseUp={() => setIsPaused(false)}
              className="review-arrow-btn"
              aria-label="Next review"
              title="Next"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
