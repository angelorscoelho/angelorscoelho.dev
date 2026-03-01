import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import profilePhotoSmall from '../src/assets/profile_photo_small.webp';
import profilePhotoMedium from '../src/assets/profile_photo_medium.webp';
import profilePhotoLarge from '../src/assets/profile_photo_large.webp';
import { CloseIcon } from './Icon';

export const ProfileImageModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [highResImage, setHighResImage] = useState<string>(profilePhotoSmall);
  const modalContainerRef = useRef<HTMLDivElement | null>(null);

  // create a DOM node for portal under body so stacking context isn't constrained by
  // header/parent elements. This also makes z-index management simpler.
  useEffect(() => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    modalContainerRef.current = el;
    return () => {
      if (modalContainerRef.current) {
        document.body.removeChild(modalContainerRef.current);
      }
    };
  }, []);

  // Eager load high-resolution assets post-render
  useEffect(() => {
    // Use requestIdleCallback for non-blocking load
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        const img = new Image();
        img.onload = () => setHighResImage(profilePhotoLarge);
        img.src = profilePhotoLarge;
      }, { timeout: 2000 });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        const img = new Image();
        img.onload = () => setHighResImage(profilePhotoLarge);
        img.src = profilePhotoLarge;
      }, 1000);
    }
  }, []);

  return (
    <>
      {/* Avatar Trigger */}
      <div 
        onClick={() => setIsOpen(true)}
        className="h-44 w-44 relative overflow-hidden rounded-full border-4 border-slate-800 shadow-2xl group cursor-pointer"
      >
        <img
          src={profilePhotoSmall}
          srcSet={`${profilePhotoSmall} 600w, ${profilePhotoMedium} 1200w`}
          sizes="176px"
          alt="Ângelo Coelho"
          width={176}
          height={176}
          fetchPriority="high"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-slate-900/10"></div>
      </div>

      {/* Modal Overlay */}
      {isOpen && modalContainerRef.current && createPortal(
        <div
          className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsOpen(false)}
        >
          {/* Modal Content */}
          <div 
            className="relative max-w-2xl w-full animate-scale-up z-50"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute -top-10 right-0 text-slate-400 hover:text-teal-300 transition-colors focus:outline-none"
              aria-label="Close modal"
            >
              <CloseIcon className="w-6 h-6" />
            </button>

            {/* Image */}
            <img
              src={highResImage}
              alt="Ângelo Coelho - High Resolution"
              className="w-full rounded-lg shadow-2xl border border-slate-700"
            />
          </div>
        </div>,
        modalContainerRef.current
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleUp {
          from { 
            opacity: 0;
            transform: scale(0.95);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-scale-up {
          animation: scaleUp 0.3s ease-out;
        }
      `}</style>
    </>
  );
};
