"use client";

import { useEffect, useRef, useState } from "react";

type AnimationType = 'fadeUp' | 'fadeLeft' | 'fadeRight' | 'scaleUp' | 'rotateIn' | 'slideUp';

interface RevealOnScrollProps {
  children: React.ReactNode;
  animation?: AnimationType;
  delay?: number;
  duration?: number;
}

export default function RevealOnScroll({ 
  children, 
  animation = 'fadeUp', 
  delay = 0,
  duration = 700 
}: RevealOnScrollProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  const getAnimationClasses = () => {
    const baseClasses = `transition-all ease-out`;
    const durationClass = duration === 700 ? 'duration-700' : duration === 500 ? 'duration-500' : 'duration-1000';
    
    switch (animation) {
      case 'fadeLeft':
        return `${baseClasses} ${durationClass} ${
          isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
        }`;
      case 'fadeRight':
        return `${baseClasses} ${durationClass} ${
          isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
        }`;
      case 'scaleUp':
        return `${baseClasses} ${durationClass} ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`;
      case 'rotateIn':
        return `${baseClasses} ${durationClass} ${
          isVisible ? 'opacity-100 rotate-0' : 'opacity-0 rotate-3'
        }`;
      case 'slideUp':
        return `${baseClasses} ${durationClass} transform ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
        }`;
      default: // fadeUp
        return `${baseClasses} ${durationClass} ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`;
    }
  };

  return (
    <div ref={ref} className={getAnimationClasses()}>
      {children}
    </div>
  );
}

