import React, { useEffect, useRef, useState } from 'react';
import { SlotDigitReel } from './SlotDigitReel';
import { CelebrationOverlay } from './CelebrationOverlay';
import { sound } from '../utils/sound';
import { fireConfetti } from '../utils/confetti';
import { Minus, Plus, ArrowRight } from 'lucide-react';

interface SlotMachineProps {
  digits: number[]; // array of target digits, e.g. [0, 2, 5]
  isSpinning: boolean;
  isCelebrating?: boolean;
  onSpin: () => void;
  onSkipReveal?: () => void;
  numSlots: number;
  onNumSlotsChange: (count: number) => void;
  onSpinComplete: () => void;
  confettiEnabled: boolean;
  disabled?: boolean;
}

export const SlotMachine: React.FC<SlotMachineProps> = ({
  digits,
  isSpinning,
  isCelebrating = false,
  onSpin,
  onSkipReveal,
  numSlots,
  onNumSlotsChange,
  onSpinComplete,
  confettiEnabled,
  disabled = false,
}) => {
  const [popScale, setPopScale] = useState<boolean>(false);
  const stoppedReelsCount = useRef<number>(0);
  const audioIntervalRef = useRef<number | null>(null);

  // Sound ticking management during spin
  useEffect(() => {
    if (isSpinning) {
      stoppedReelsCount.current = 0;
      setPopScale(false);

      const startTime = performance.now();
      const totalEstimated = 2400 + (numSlots - 1) * 220;

      let tickDelay = 35; // initial fast tick
      let timerId: number;

      const scheduleNextTick = () => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / totalEstimated, 1);

        // Sound modulation
        if (progress < 0.5) {
          // High speed phase
          tickDelay = 35 + Math.random() * 8;
          sound.playSpinTick(1.0);
        } else if (progress < 0.8) {
          // Decelerating phase
          tickDelay = 50 + (progress - 0.5) * 280;
          sound.playSpinTick(0.9);
        } else {
          // Late roll phase
          tickDelay = 130 + (progress - 0.8) * 380;
          sound.playSpinTick(0.8);
        }

        if (stoppedReelsCount.current < numSlots) {
          timerId = window.setTimeout(scheduleNextTick, tickDelay);
        }
      };

      timerId = window.setTimeout(scheduleNextTick, tickDelay);

      return () => {
        clearTimeout(timerId);
      };
    }
  }, [isSpinning, numSlots]);

  const handleReelStop = (reelIdx: number) => {
    stoppedReelsCount.current += 1;
    sound.playReelStop();

    // Check if this was the last reel
    if (stoppedReelsCount.current >= numSlots) {
      sound.playFinalStop();
      if (confettiEnabled) {
        fireConfetti('reel');
      }
      setPopScale(true);
      setTimeout(() => {
        setPopScale(false);
      }, 500);

      onSpinComplete();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto px-4 py-3 sm:py-6">
      {/* Slot Reel Count Adjuster - Subtle and unobtrusive */}
      {!isSpinning && (
        <div className="flex items-center gap-3 mb-6 bg-slate-900/70 border border-slate-800 rounded-full px-4 py-1.5 backdrop-blur-md">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Số ô quay:
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onNumSlotsChange(Math.max(1, numSlots - 1))}
              disabled={numSlots <= 1 || disabled}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 transition-colors"
              title="Giảm 1 ô"
              aria-label="Giảm ô quay"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-10 text-center font-bold text-cyan-400 text-sm tabular-nums">
              {numSlots} Ô
            </span>
            <button
              onClick={() => onNumSlotsChange(Math.min(6, numSlots + 1))}
              disabled={numSlots >= 6 || disabled}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 transition-colors"
              title="Tăng 1 ô"
              aria-label="Tăng ô quay"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main 2.5D Bingo Drum Housing */}
      <div
        className={`relative flex items-center justify-center gap-2.5 sm:gap-4 md:gap-5 p-4 sm:p-7 md:p-9 rounded-2xl sm:rounded-3xl
          bg-gradient-to-b from-[#0a142c] via-[#0d1d44] to-[#060c1d]
          border-2 border-cyan-500/30
          shadow-[0_20px_60px_rgba(0,0,0,0.85),inset_0_1px_3px_rgba(255,255,255,0.18)]
          transition-transform duration-300
          ${popScale ? 'scale-105 ring-4 ring-cyan-400/50' : 'scale-100'}
        `}
      >
        {/* Subtle decorative stage lights on corners */}
        <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-cyan-400/50 blur-[1px]" />
        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-cyan-400/50 blur-[1px]" />
        <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-cyan-400/50 blur-[1px]" />
        <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-cyan-400/50 blur-[1px]" />

        {/* Floating Confetti Shapes (Image 2 style) */}
        <CelebrationOverlay active={isCelebrating} />

        {/* Reels */}
        {digits.map((digit, idx) => (
          <SlotDigitReel
            key={`reel-${idx}-${numSlots}`}
            digit={digit}
            isSpinning={isSpinning}
            reelIndex={idx}
            totalReels={numSlots}
            onReelStop={handleReelStop}
          />
        ))}
      </div>

      {/* Status banner */}
      <div className="h-9 mt-4 flex items-center justify-center">
        {isSpinning ? (
          <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm sm:text-base tracking-widest uppercase animate-pulse">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            Đang bốc thăm...
          </div>
        ) : isCelebrating ? (
          <div className="flex items-center gap-2 text-amber-300 font-black text-sm sm:text-base tracking-widest uppercase animate-pulse">
            <span className="text-xl">🎉</span>
            <span>CHÚC MỪNG HỌC SINH ĐÃ ĐƯỢC CHỌN!</span>
            <span className="text-xl">🎉</span>
          </div>
        ) : (
          <div className="text-slate-400 text-xs sm:text-sm font-medium tracking-wide">
            Nhấn <strong className="text-cyan-400 font-semibold">QUAY SỐ</strong> hoặc bấm phím <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300 font-mono text-xs">Space</kbd>
          </div>
        )}
      </div>

      {/* Prominent Action Button: Spin or Enter Question */}
      <div className="mt-2 flex flex-col items-center">
        {isCelebrating ? (
          <>
            <button
              onClick={onSkipReveal}
              className="group relative inline-flex items-center justify-center gap-3 px-8 sm:px-12 py-4 sm:py-5 rounded-2xl
                font-extrabold text-base sm:text-xl text-white tracking-wider uppercase
                bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600
                border-t border-emerald-300/40
                shadow-[0_12px_32px_rgba(16,185,129,0.35),inset_0_2px_4px_rgba(255,255,255,0.3)]
                hover:shadow-[0_16px_40px_rgba(16,185,129,0.5)]
                hover:brightness-110 active:scale-[0.98]
                transition-all duration-200 cursor-pointer animate-pulse"
            >
              <span>BẮT ĐẦU CÂU HỎI NGAY</span>
              <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <p className="mt-2 text-xs text-slate-400 font-medium">
              Tự động hiển thị câu hỏi sau 5 giây • Bấm phím <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300 font-mono text-xs">Space</kbd> để vào ngay
            </p>
          </>
        ) : (
          <button
            onClick={onSpin}
            disabled={isSpinning || disabled}
            className={`group relative inline-flex items-center justify-center gap-3 px-8 sm:px-12 py-4 sm:py-5 rounded-2xl
              font-extrabold text-lg sm:text-2xl text-white tracking-wider uppercase
              bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600
              border-t border-cyan-300/40
              shadow-[0_12px_32px_rgba(6,182,212,0.35),inset_0_2px_4px_rgba(255,255,255,0.3)]
              hover:shadow-[0_16px_40px_rgba(6,182,212,0.5),inset_0_2px_6px_rgba(255,255,255,0.4)]
              hover:brightness-110 active:scale-[0.98]
              disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none
              transition-all duration-200 cursor-pointer
            `}
          >
            <span className="text-2xl sm:text-3xl filter drop-shadow">🎲</span>
            <span>QUAY SỐ</span>
          </button>
        )}
      </div>
    </div>
  );
};
