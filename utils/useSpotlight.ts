import { useEffect, RefObject } from 'react';

// Global pointer tracker (mouse or touch) to allow updates during scroll even if the
// physical cursor isn't moving.  Initialized to center of viewport so the effect is
// visible before any interaction.
let globalMouseX = typeof window !== 'undefined' ? window.innerWidth / 2 : 0;
let globalMouseY = typeof window !== 'undefined' ? window.innerHeight / 2 : 0;

if (typeof window !== 'undefined') {
    // pointermove covers mouse and pen; touchmove handles finger drags
    const updateFromPointer = (x: number, y: number) => {
      globalMouseX = x;
      globalMouseY = y;
    };

    window.addEventListener('pointermove', (e) => {
        updateFromPointer(e.clientX, e.clientY);
    });
    window.addEventListener('pointerdown', (e) => {
        updateFromPointer(e.clientX, e.clientY);
    });

    window.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
            updateFromPointer(e.touches[0].clientX, e.touches[0].clientY);
        }
    }, { passive: true });
    window.addEventListener('touchstart', (e) => {
        if (e.touches.length > 0) {
            updateFromPointer(e.touches[0].clientX, e.touches[0].clientY);
        }
    }, { passive: true });

    // keep center coords updated on resize so initial glow remains centered
    window.addEventListener('resize', () => {
      globalMouseX = window.innerWidth / 2;
      globalMouseY = window.innerHeight / 2;
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