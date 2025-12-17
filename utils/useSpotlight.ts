import { useEffect, RefObject } from 'react';

// Global mouse tracker to allow updates during scroll even if mouse doesn't move
let globalMouseX = 0;
let globalMouseY = 0;

if (typeof window !== 'undefined') {
    window.addEventListener('mousemove', (e) => {
        globalMouseX = e.clientX;
        globalMouseY = e.clientY;
    });
}

export const useSpotlight = (ref: RefObject<HTMLElement | null>) => {
  useEffect(() => {
    const handleUpdate = () => {
      if (!ref.current) return;
      
      const rect = ref.current.getBoundingClientRect();
      const x = globalMouseX - rect.left;
      const y = globalMouseY - rect.top;
      
      ref.current.style.setProperty('--mouse-x', `${x}px`);
      ref.current.style.setProperty('--mouse-y', `${y}px`);
    };

    // Update on mouse move
    window.addEventListener('mousemove', handleUpdate);
    // CRITICAL: Update on scroll to handle "static mouse" case
    window.addEventListener('scroll', handleUpdate);

    // Initial update
    handleUpdate();

    return () => {
      window.removeEventListener('mousemove', handleUpdate);
      window.removeEventListener('scroll', handleUpdate);
    };
  }, [ref]);
};