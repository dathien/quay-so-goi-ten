import React from 'react';
import { GameSettings, NumberSource } from '../types';
import { X, Minus, Plus, Settings, Volume2, Sparkles, Clock, Hash, Repeat } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl bg-gradient-to-b from-slate-900 to-[#0b1328] border-2 border-cyan-500/40 shadow-2xl p-6 text-slate-100 overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-wide">Cài Đặt Giáo Viên</h2>
              <p className="text-xs text-slate-400">Tùy biến hệ thống quay số và luật chơi trên lớp</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5">
          {/* Tùy chỉnh Tiêu đề & Tên chương trình */}
          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-3">
            <label className="text-sm font-semibold text-white block">
              Tên tiêu đề hiển thị trên màn hình
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Tiêu đề chính</label>
                <input
                  type="text"
                  value={settings.appTitle || 'QUAY SỐ THỬ THÁCH'}
                  onChange={(e) => onUpdateSettings({ appTitle: e.target.value })}
                  placeholder="QUAY SỐ THỬ THÁCH"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Dòng chữ phụ</label>
                <input
                  type="text"
                  value={settings.appSubtitle || 'QUAY SỐ GỌI TÊN – CHINH PHỤC CÂU HỎI'}
                  onChange={(e) => onUpdateSettings({ appSubtitle: e.target.value })}
                  placeholder="QUAY SỐ GỌI TÊN – CHINH PHỤC CÂU HỎI"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Nhãn sân khấu quay số</label>
              <input
                type="text"
                value={settings.stageBadgeText || 'HỆ THỐNG QUAY SỐ LỚP HỌC'}
                onChange={(e) => onUpdateSettings({ stageBadgeText: e.target.value })}
                placeholder="HỆ THỐNG QUAY SỐ LỚP HỌC"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Số ô quay */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <div>
              <label className="text-sm font-semibold text-white flex items-center gap-2">
                <Hash className="w-4 h-4 text-cyan-400" />
                Số ô quay số (1 – 6)
              </label>
              <p className="text-xs text-slate-400 mt-0.5">Số chữ số hiển thị trên lồng quay (mặc định: 3)</p>
            </div>
            <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-700">
              <button
                onClick={() => onUpdateSettings({ numSlots: Math.max(1, settings.numSlots - 1) })}
                disabled={settings.numSlots <= 1}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-8 text-center font-bold text-cyan-400 font-mono">
                {settings.numSlots}
              </span>
              <button
                onClick={() => onUpdateSettings({ numSlots: Math.min(6, settings.numSlots + 1) })}
                disabled={settings.numSlots >= 6}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Nguồn số quay */}
          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <label className="text-sm font-semibold text-white mb-2 block">
              Nguồn dữ liệu quay
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={() => onUpdateSettings({ numberSource: 'stt' as NumberSource })}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer
                  ${
                    settings.numberSource === 'stt'
                      ? 'bg-cyan-500/20 border-cyan-400 text-white font-bold ring-1 ring-cyan-400/40'
                      : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }
                `}
              >
                <div className="text-sm">STT Học sinh</div>
                <div className="text-xs text-slate-400 font-normal mt-0.5">Ví dụ: 001, 010, 025</div>
              </button>

              <button
                onClick={() => onUpdateSettings({ numberSource: 'code_last' as NumberSource })}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer
                  ${
                    settings.numberSource === 'code_last'
                      ? 'bg-cyan-500/20 border-cyan-400 text-white font-bold ring-1 ring-cyan-400/40'
                      : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }
                `}
              >
                <div className="text-sm">Các số cuối mã HS</div>
                <div className="text-xs text-slate-400 font-normal mt-0.5">HS2026025 → 025</div>
              </button>
            </div>
          </div>

          {/* Thời gian trả lời */}
          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                Thời gian trả lời câu hỏi (10s – 15 phút)
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min={10}
                  max={900}
                  value={settings.timeLimitSeconds}
                  onChange={(e) => onUpdateSettings({ timeLimitSeconds: Math.max(10, Math.min(900, parseInt(e.target.value, 10) || 15)) })}
                  className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-center font-mono font-bold text-cyan-400 text-xs focus:border-cyan-400"
                />
                <span className="text-xs text-slate-400 font-semibold">giây</span>
              </div>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
              {[10, 15, 30, 45, 60, 90, 120].map((sec) => (
                <button
                  key={sec}
                  onClick={() => onUpdateSettings({ timeLimitSeconds: sec })}
                  className={`py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer
                    ${
                      settings.timeLimitSeconds === sec
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-extrabold'
                        : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                    }
                  `}
                >
                  {sec}s
                </button>
              ))}
            </div>
          </div>

          {/* Không lặp học sinh */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <div>
              <label className="text-sm font-semibold text-white flex items-center gap-2">
                <Repeat className="w-4 h-4 text-cyan-400" />
                Không lặp lại học sinh
              </label>
              <p className="text-xs text-slate-400 mt-0.5">
                Học sinh đã gọi sẽ không xuất hiện lại cho tới khi đặt lại lượt
              </p>
            </div>
            <button
              onClick={() => onUpdateSettings({ noRepeatStudent: !settings.noRepeatStudent })}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer
                ${settings.noRepeatStudent ? 'bg-cyan-500 justify-end' : 'bg-slate-700 justify-start'}
              `}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-md" />
            </button>
          </div>

          {/* Không lặp câu hỏi */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <div>
              <label className="text-sm font-semibold text-white">Không lặp câu hỏi</label>
              <p className="text-xs text-slate-400 mt-0.5">
                Mỗi câu hỏi chỉ xuất hiện một lần trong một vòng quay
              </p>
            </div>
            <button
              onClick={() => onUpdateSettings({ noRepeatQuestion: !settings.noRepeatQuestion })}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer
                ${settings.noRepeatQuestion ? 'bg-cyan-500 justify-end' : 'bg-slate-700 justify-start'}
              `}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-md" />
            </button>
          </div>

          {/* Âm thanh & Confetti */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-cyan-400" />
                Âm thanh
              </span>
              <button
                onClick={() => onUpdateSettings({ soundEnabled: !settings.soundEnabled })}
                className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer
                  ${settings.soundEnabled ? 'bg-cyan-500 justify-end' : 'bg-slate-700 justify-start'}
                `}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
              </button>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Confetti
              </span>
              <button
                onClick={() => onUpdateSettings({ confettiEnabled: !settings.confettiEnabled })}
                className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer
                  ${settings.confettiEnabled ? 'bg-cyan-500 justify-end' : 'bg-slate-700 justify-start'}
                `}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3.5 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-400 font-normal tracking-wide select-none text-center sm:text-left">
            Tác giả: GV.Hồ Nguyễn Đa Thiện
          </p>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-md transition-colors cursor-pointer"
          >
            Hoàn tất
          </button>
        </div>
      </div>
    </div>
  );
};
