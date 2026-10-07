import React from 'react';
import { Volume2, VolumeX, Maximize2, Minimize2, Settings, Users, HelpCircle, Trophy, Sparkles } from 'lucide-react';

interface HeaderProps {
  appTitle?: string;
  appSubtitle?: string;
  soundEnabled: boolean;
  onToggleSound: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onOpenSettings: () => void;
  onOpenStudents: () => void;
  onOpenQuestions: () => void;
  onOpenResults: () => void;
  isSpinning?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  appTitle = 'QUAY SỐ THỬ THÁCH',
  appSubtitle = 'QUAY SỐ GỌI TÊN – CHINH PHỤC CÂU HỎI',
  soundEnabled,
  onToggleSound,
  isFullscreen,
  onToggleFullscreen,
  onOpenSettings,
  onOpenStudents,
  onOpenQuestions,
  onOpenResults,
  isSpinning = false,
}) => {
  return (
    <header className="w-full border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Zone 1: Brand title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)] text-white">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black tracking-tight text-white uppercase flex items-center gap-2">
              {appTitle}
            </h1>
            <p className="text-[11px] font-semibold tracking-wider text-cyan-400 uppercase">
              {appSubtitle}
            </p>
          </div>
        </div>

        {/* Zone 2: Fast Navigation Modals */}
        <nav className="hidden lg:flex items-center gap-1.5 text-xs font-semibold text-slate-300">
          <button
            onClick={onOpenStudents}
            disabled={isSpinning}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
          >
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span>Học sinh</span>
          </button>

          <button
            onClick={onOpenQuestions}
            disabled={isSpinning}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
          >
            <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
            <span>Ngân hàng câu hỏi</span>
          </button>

          <button
            onClick={onOpenResults}
            disabled={isSpinning}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Bảng kết quả</span>
          </button>
        </nav>

        {/* Zone 3: Game Controls & Tools */}
        <div className="flex items-center gap-2">
          {/* Mobile extra tools trigger */}
          <div className="flex lg:hidden items-center gap-1">
            <button
              onClick={onOpenStudents}
              disabled={isSpinning}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-colors"
              title="Danh sách học sinh"
            >
              <Users className="w-4 h-4 text-cyan-400" />
            </button>
            <button
              onClick={onOpenResults}
              disabled={isSpinning}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-colors"
              title="Bảng điểm kết quả"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
            </button>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className={`p-2 sm:px-3 sm:py-1.5 rounded-lg border flex items-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer
              ${
                soundEnabled
                  ? 'bg-slate-900/90 border-slate-700 text-slate-200 hover:bg-slate-800'
                  : 'bg-rose-950/40 border-rose-800/60 text-rose-300 hover:bg-rose-900/40'
              }
            `}
            title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
            aria-label="Toggle Sound"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-cyan-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-rose-400" />
            )}
            <span className="hidden sm:inline">{soundEnabled ? 'Bật âm' : 'Tắt âm'}</span>
          </button>

          {/* Settings Modal Toggle */}
          <button
            onClick={onOpenSettings}
            disabled={isSpinning}
            className="p-2 sm:px-3 sm:py-1.5 rounded-lg bg-slate-900/90 border border-slate-700 hover:bg-slate-800 text-slate-200 flex items-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
            title="Cài đặt trò chơi"
            aria-label="Cài đặt"
          >
            <Settings className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Cài đặt</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={onToggleFullscreen}
            className="p-2 rounded-lg bg-slate-900/90 border border-slate-700 hover:bg-slate-800 text-slate-200 transition-colors cursor-pointer"
            title={isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình (F11)'}
            aria-label="Toàn màn hình"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4 text-cyan-400" />
            ) : (
              <Maximize2 className="w-4 h-4 text-slate-300" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
