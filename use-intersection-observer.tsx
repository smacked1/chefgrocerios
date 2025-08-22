import { useEffect, useRef, useState } from 'react';

interface UseIntersectionObserverProps {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export function useIntersectionObserver({
  threshold = 0,
  rootMargin = '0px',
  triggerOnce = true
}: UseIntersectionObserverProps = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isElementIntersecting = entry.isIntersecting;
        
        if (isElementIntersecting && triggerOnce && !hasTriggered) {
          setHasTriggered(true);
        }
        
        setIsIntersecting(isElementIntersecting);
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold, rootMargin, triggerOnce, hasTriggered]);

  return { ref, isIntersecting, hasTriggered };
}

// Hook for lazy loading components when they come into view
export function useLazyLoad() {
  const { ref, isIntersecting, hasTriggered } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '50px'
  });

  return {
    ref,
    shouldLoad: isIntersecting || hasTriggered
  };
}