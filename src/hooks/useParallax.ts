import { useState, useEffect, useCallback } from 'react';

interface ParallaxState {
  scrollY: number;
  offsetY: number;
  mouseX: number;
  mouseY: number;
}

export const useParallax = (speed: number = 0.5) => {
  const [state, setState] = useState<ParallaxState>({
    scrollY: 0,
    offsetY: 0,
    mouseX: 0,
    mouseY: 0,
  });

  const handleScroll = useCallback(() => {
    setState(prev => ({
      ...prev,
      scrollY: window.scrollY,
      offsetY: window.scrollY * speed,
    }));
  }, [speed]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;
    setState(prev => ({
      ...prev,
      mouseX: x * 20,
      mouseY: y * 20,
    }));
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [handleScroll, handleMouseMove]);

  return state;
};
