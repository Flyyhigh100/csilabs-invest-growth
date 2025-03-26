
import React, { useEffect, useRef, useState } from 'react';

interface FadeInSectionProps {
  children: React.ReactNode;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  delay?: number;
}

const FadeInSection: React.FC<FadeInSectionProps> = ({ 
  children, 
  className = '', 
  direction = 'up',
  delay = 0 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      });
    }, { 
      threshold: 0.15 
    });
    
    if (domRef.current) {
      observer.observe(domRef.current);
    }

    return () => {
      if (domRef.current) {
        observer.unobserve(domRef.current);
      }
    };
  }, []);

  const getAnimationClass = () => {
    switch (direction) {
      case 'up': return 'translate-y-8';
      case 'down': return '-translate-y-8';
      case 'left': return 'translate-x-8';
      case 'right': return '-translate-x-8';
      default: return 'opacity-0';
    }
  };

  return (
    <div
      ref={domRef}
      className={`transition-all duration-700 ease-out ${getAnimationClass()} opacity-0 ${isVisible ? 'translate-x-0 translate-y-0 opacity-100' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export default FadeInSection;
