import React from 'react';
import { Student } from '../types';
import { PartyPopper, UserCheck } from 'lucide-react';

interface StudentCardProps {
  student: Student;
  digitsStr: string;
  sourceType: 'stt' | 'code_last';
  variant: 'banner_large' | 'compact_badge';
}

export const StudentCard: React.FC<StudentCardProps> = ({
  student,
  digitsStr,
  sourceType,
  variant,
}) => {
  if (variant === 'banner_large') {
    return (
      <div className="w-full max-w-2xl mx-auto mt-5 px-6 py-7 sm:py-8 rounded-3xl bg-gradient-to-b from-[#112456]/95 via-[#0d1a40]/95 to-[#070f26]/95 border-2 border-cyan-400/70 shadow-[0_0_60px_rgba(6,182,212,0.4),inset_0_2px_6px_rgba(255,255,255,0.2)] text-center animate-in fade-in zoom-in-95 duration-500 backdrop-blur-xl relative overflow-hidden">
        {/* Subtle pulsing background aura - no countdown */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.18)_0%,transparent_70%)] animate-pulse pointer-events-none" />

        {/* Header: 🎉 CHÚC MỪNG 🎉 */}
        <div className="flex items-center justify-center gap-2 text-amber-300 text-sm sm:text-base font-black tracking-widest uppercase mb-2">
          <PartyPopper className="w-5 h-5 text-amber-400 animate-bounce" />
          <span>🎉 CHÚC MỪNG 🎉</span>
          <PartyPopper className="w-5 h-5 text-amber-400 scale-x-[-1] animate-bounce" />
        </div>

        {/* Lucky Number & Class */}
        <div className="flex items-center justify-center gap-3 text-cyan-300 font-mono text-xl sm:text-2xl font-black mb-2">
          <span className="bg-slate-900/90 border border-cyan-500/40 px-3.5 py-1 rounded-xl shadow-inner tracking-widest">
            {digitsStr}
          </span>
          <span className="text-slate-600 font-sans">•</span>
          <span className="bg-slate-900/90 border border-cyan-500/40 px-3.5 py-1 rounded-xl text-sm sm:text-base font-sans font-bold text-slate-200">
            LỚP <strong className="text-cyan-300 font-extrabold">{student.className}</strong>
          </span>
        </div>

        {/* Prominent Student Name */}
        <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-wide uppercase drop-shadow-[0_4px_24px_rgba(6,182,212,0.9)] my-3 transition-transform">
          {student.name}
        </h2>

        {/* Requirement 11: 🎯 SẴN SÀNG CHINH PHỤC THỬ THÁCH! */}
        <div className="mt-4 pt-4 border-t border-slate-700/60 flex items-center justify-center gap-2 text-amber-300 font-extrabold text-xs sm:text-sm tracking-wider uppercase">
          <span className="text-base">🎯</span>
          <span>SẴN SÀNG CHINH PHỤC THỬ THÁCH!</span>
        </div>
      </div>
    );
  }

  // Compact variant for Question stage: 025 • NGUYỄN MINH KHANG • 11A4
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 rounded-2xl bg-gradient-to-r from-slate-900/95 via-[#0b1633]/95 to-slate-900/95 border border-cyan-500/40 shadow-lg backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-black shadow-md">
          <UserCheck className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="text-base sm:text-lg font-black text-white tracking-wide uppercase">
            <span className="text-cyan-400 font-mono font-bold mr-2">{digitsStr} •</span>
            <span>{student.name}</span>
            <span className="text-slate-400 text-xs sm:text-sm font-semibold ml-2">
              • Lớp {student.className}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-slate-950/80 px-3 py-1 rounded-lg border border-cyan-500/20 text-xs font-semibold text-slate-400">
        {sourceType === 'stt' ? `STT ${student.stt}` : student.code}
      </div>
    </div>
  );
};
