import React, { useEffect, useState, useRef } from 'react';

interface SlotDigitReelProps {
  digit: number; // target digit 0-9
  isSpinning: boolean;
  reelIndex: number;
  totalReels: number;
  onReelStop?: (index: number) => void;
  compact?: boolean;
}

export const SlotDigitReel: React.FC<SlotDigitReelProps> = ({
  digit,
  isSpinning,
  reelIndex,
  totalReels,
  onReelStop,
  compact = false,
}) => {
  // Height per digit item (px)
  const itemHeight = compact ? 52 : 136;
  const itemWidth = compact ? 42 : 108;

  const [currentDigit, setCurrentDigit] = useState<number>(digit);
  const [stripNumbers, setStripNumbers] = useState<number[]>([digit]);
  const [offsetY, setOffsetY] = useState<number>(0);
  const [transitionStyle, setTransitionStyle] = useState<string>('none');
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [hasStarted, setHasStarted] = useState<boolean>(false);

  const prevSpinning = useRef<boolean>(false);

  useEffect(() => {
    // Detect trigger of spin
    if (isSpinning && !prevSpinning.current) {
      setIsLocked(false);
      setHasStarted(true);

      // Build sequence of rolling numbers
      // Slot 0 stops first, Slot 1 stops after 200ms, Slot 2 after 200ms, etc.
      // Base rolling count ~ 26 + reelIndex * 5
      const rollCount = 24 + reelIndex * 5;
      const sequence: number[] = [currentDigit];

      for (let i = 1; i < rollCount - 3; i++) {
        sequence.push(Math.floor(Math.random() * 10));
      }
      // Leading approach numbers for natural deceleration
      sequence.push((digit + 8) % 10);
      sequence.push((digit + 9) % 10);
      sequence.push(digit);

      setStripNumbers(sequence);
      setOffsetY(0);
      setTransitionStyle('none');

      // Calculate duration for this reel:
      // Base duration 2.4s + reelIndex * 0.22s (e.g. 2.4s, 2.62s, 2.84s)
      // Total spin is ~ 2.9 - 3.2s for 3 reels
      const durationSec = 2.4 + reelIndex * 0.22;

      // Small tick to ensure DOM reset before applying transition
      const frameId = requestAnimationFrame(() => {
        const frameId2 = requestAnimationFrame(() => {
          // Use cubic-bezier that starts fast and decelerates smoothly through the end
          setTransitionStyle(`transform ${durationSec}s cubic-bezier(0.14, 0.88, 0.24, 1.0)`);
          const targetOffset = (sequence.length - 1) * itemHeight;
          setOffsetY(targetOffset);
        });
        return () => cancelAnimationFrame(frameId2);
      });

      // Timer for when this reel finishes rolling
      const timer = setTimeout(() => {
        setIsLocked(true);
        setCurrentDigit(digit);
        if (onReelStop) {
          onReelStop(reelIndex);
        }
      }, durationSec * 1000);

      return () => {
        cancelAnimationFrame(frameId);
        clearTimeout(timer);
      };
    } else if (!isSpinning && prevSpinning.current) {
      // Stopped
      setCurrentDigit(digit);
      setStripNumbers([digit]);
      setOffsetY(0);
      setTransitionStyle('none');
      setIsLocked(true);
    } else if (!isSpinning) {
      // Digit changed while stationary (e.g., initial setup or reset)
      setCurrentDigit(digit);
      setStripNumbers([digit]);
      setOffsetY(0);
      setTransitionStyle('none');
    }

    prevSpinning.current = isSpinning;
  }, [isSpinning, digit, reelIndex, itemHeight, currentDigit, onReelStop]);

  return (
    <div
      style={{
        width: `${itemWidth}px`,
        height: `${itemHeight}px`,
      }}
      className={`relative select-none rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-300
        ${
          compact
            ? 'bg-slate-900/90 border border-cyan-500/50 shadow-md'
            : isLocked && !isSpinning && hasStarted
            ? 'bg-gradient-to-b from-[#0c1836] via-[#102450] to-[#071026] border-2 border-cyan-400 shadow-[0_0_35px_rgba(6,182,212,0.45),inset_0_2px_4px_rgba(255,255,255,0.3)] ring-2 ring-cyan-400/30'
            : 'bg-gradient-to-b from-[#0a1532] via-[#0d1e44] to-[#060e22] border-2 border-cyan-600/40 shadow-[0_12px_28px_rgba(0,0,0,0.7),inset_0_2px_4px_rgba(255,255,255,0.15)]'
        }
      `}
    >
      {/* Vertical Rolling Strip */}
      <div
        style={{
          transform: `translateY(-${offsetY}px)`,
          transition: transitionStyle,
          willChange: 'transform',
        }}
        className="flex flex-col items-center w-full"
      >
        {stripNumbers.map((num, idx) => (
          <div
            key={idx}
            style={{ height: `${itemHeight}px` }}
            className={`w-full flex items-center justify-center font-extrabold tabular-nums tracking-wider text-white
              ${compact ? 'text-2xl font-bold' : 'text-6xl sm:text-7xl md:text-8xl drop-shadow-[0_4px_12px_rgba(0,0,0,0.95)]'}
            `}
          >
            {num}
          </div>
        ))}
      </div>

      {/* 2.5D Cylinder Bevel Shadows (Top & Bottom) to give 3D drum window feel */}
      {!compact && (
        <>
          {/* Top curve shadow */}
          <div className="absolute inset-x-0 top-0 h-10 pointer-events-none bg-gradient-to-b from-black/85 via-black/40 to-transparent z-10" />

          {/* Center horizontal glass reflection band */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-10 pointer-events-none bg-gradient-to-b from-white/[0.08] via-white/[0.03] to-transparent z-10" />

          {/* Bottom curve shadow */}
          <div className="absolute inset-x-0 bottom-0 h-10 pointer-events-none bg-gradient-to-t from-black/85 via-black/40 to-transparent z-10" />

          {/* Side subtle rim lights */}
          <div className="absolute inset-y-0 left-0 w-1 pointer-events-none bg-gradient-to-r from-cyan-400/20 to-transparent z-10" />
          <div className="absolute inset-y-0 right-0 w-1 pointer-events-none bg-gradient-to-l from-cyan-400/20 to-transparent z-10" />
        </>
      )}

      {/* Compact subtle shadows */}
      {compact && (
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/60 via-transparent to-black/60 z-10" />
      )}
    </div>
  );
};
