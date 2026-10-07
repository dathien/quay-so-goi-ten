import React from 'react';
import { HistoryEntry } from '../types';
import { RotateCcw } from 'lucide-react';

interface HistoryBarProps {
  history: HistoryEntry[];
  calledCount: number;
  totalStudents: number;
  onResetTurn: () => void;
  isSpinning?: boolean;
}

export const HistoryBar: React.FC<HistoryBarProps> = ({
  history,
  calledCount,
  totalStudents,
  onResetTurn,
  isSpinning = false,
}) => {
  return (
    <footer className="w-full max-w-5xl mx-auto px-4 py-2 sm:py-3 mt-auto">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800/90 text-xs sm:text-sm backdrop-blur-md">
        {/* Left: Progress info */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-semibold uppercase tracking-wider text-xs">
            ĐÃ GỌI:
          </span>
          <span className="font-mono font-bold text-cyan-400 text-sm">
            {calledCount}/{totalStudents}
          </span>
          <button
            onClick={onResetTurn}
            disabled={isSpinning || calledCount === 0}
            className="flex items-center gap-1 ml-2 text-xs font-medium text-slate-400 hover:text-cyan-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="Đưa toàn bộ học sinh trở lại danh sách quay"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Đặt lại lượt</span>
          </button>
        </div>

        {/* Center / Right: Number sequence */}
        <div className="flex items-center gap-2 overflow-x-auto max-w-full py-0.5 scrollbar-thin">
          <span className="text-slate-400 font-semibold uppercase tracking-wider text-xs whitespace-nowrap">
            LỊCH SỬ:
          </span>

          {history.length === 0 ? (
            <span className="text-slate-500 italic text-xs whitespace-nowrap">
              Chưa có số nào được quay
            </span>
          ) : (
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              {history.slice(-8).map((item, idx, arr) => {
                const isLatest = idx === arr.length - 1;
                return (
                  <React.Fragment key={item.id}>
                    <span
                      title={`${item.studentName} (${item.className})`}
                      className={`font-mono text-xs px-2 py-0.5 rounded transition-all
                        ${
                          isLatest
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 font-bold ring-2 ring-cyan-400/30 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                            : 'bg-slate-800/70 text-slate-300 hover:bg-slate-700/70 font-medium'
                        }
                      `}
                    >
                      {item.numberStr}
                    </span>
                    {idx < arr.length - 1 && (
                      <span className="text-slate-600 font-bold text-xs">•</span>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
};
