import React from 'react';

interface CelebrationOverlayProps {
  active: boolean;
}

export const CelebrationOverlay: React.FC<CelebrationOverlayProps> = ({ active }) => {
  if (!active) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
      {/* Pink Triangle (Top-Right as in Image 2) */}
      <div className="absolute top-2 right-4 sm:top-6 sm:right-12 animate-bounce duration-1000">
        <svg width="40" height="40" viewBox="0 0 40 40" className="drop-shadow-[0_0_12px_rgba(244,63,94,0.8)]">
          <polygon points="20,4 36,34 4,34" fill="#fb7185" />
        </svg>
      </div>

      {/* Green Squiggly Ribbon (Center-Top as in Image 2) */}
      <div className="absolute top-6 left-1/3 sm:top-8 sm:left-2/5 -translate-x-1/2 animate-pulse">
        <svg width="60" height="30" viewBox="0 0 60 30" className="drop-shadow-[0_0_10px_rgba(52,211,153,0.8)]">
          <path
            d="M 5,20 Q 15,0 25,18 T 45,12 T 55,22"
            fill="none"
            stroke="#34d399"
            strokeWidth="5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* White Glowing Star (Center between digits as in Image 2) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin duration-3000">
        <svg width="36" height="36" viewBox="0 0 24 24" className="drop-shadow-[0_0_16px_rgba(255,255,255,0.9)]">
          <polygon
            points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9"
            fill="#ffffff"
          />
        </svg>
      </div>

      {/* White Diamond (Center-Left of star as in Image 2) */}
      <div className="absolute top-1/2 left-1/3 -translate-y-1/2 animate-pulse">
        <svg width="24" height="24" viewBox="0 0 24 24" className="drop-shadow-[0_0_12px_rgba(255,255,255,0.8)]">
          <polygon points="12,2 22,12 12,22 2,12" fill="#ffffff" />
        </svg>
      </div>

      {/* Pink Wavy Streamer (Bottom-Left as in Image 2) */}
      <div className="absolute bottom-6 left-4 sm:bottom-10 sm:left-12 animate-pulse">
        <svg width="65" height="35" viewBox="0 0 65 35" className="drop-shadow-[0_0_12px_rgba(244,63,94,0.8)]">
          <path
            d="M 5,10 Q 20,35 35,15 T 60,25"
            fill="none"
            stroke="#f43f5e"
            strokeWidth="5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Golden Donut / Circle (Bottom-Right as in Image 2) */}
      <div className="absolute bottom-6 right-8 sm:bottom-10 sm:right-16 animate-bounce duration-700">
        <svg width="34" height="34" viewBox="0 0 34 34" className="drop-shadow-[0_0_12px_rgba(251,191,36,0.8)]">
          <circle cx="17" cy="17" r="12" fill="none" stroke="#fbbf24" strokeWidth="6" />
        </svg>
      </div>

      {/* Small Gold Star (Near donut as in Image 2) */}
      <div className="absolute bottom-16 right-4 sm:bottom-20 sm:right-10 animate-spin duration-2000">
        <svg width="22" height="22" viewBox="0 0 24 24" className="drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]">
          <polygon
            points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9"
            fill="#fbbf24"
          />
        </svg>
      </div>
    </div>
  );
};
