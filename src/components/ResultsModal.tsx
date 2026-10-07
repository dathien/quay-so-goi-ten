import React from 'react';
import { StudentScore } from '../types';
import { X, Trophy, RotateCcw, Copy, Download, Award, CheckCircle, XCircle } from 'lucide-react';

interface ResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  scores: Record<string, StudentScore>;
  onResetSession: () => void;
}

export const ResultsModal: React.FC<ResultsModalProps> = ({
  isOpen,
  onClose,
  scores,
  onResetSession,
}) => {
  if (!isOpen) return null;

  const scoreList = Object.values(scores).sort((a, b) => {
    if (b.totalScore !== a.totalScore) {
      return b.totalScore - a.totalScore;
    }
    return b.correctCount - a.correctCount;
  });

  const totalCalls = scoreList.reduce((sum, s) => sum + s.timesCalled, 0);
  const totalCorrect = scoreList.reduce((sum, s) => sum + s.correctCount, 0);
  const totalWrong = scoreList.reduce((sum, s) => sum + s.wrongCount, 0);
  const accuracy = totalCalls > 0 ? Math.round((totalCorrect / totalCalls) * 100) : 0;

  const copyToClipboard = () => {
    let text = 'BẢNG ĐIỂM QUAY SỐ LỚP HỌC\n';
    text += 'STT\tMã HS\tHọ và tên\tLớp\tSố lần gọi\tĐúng\tSai\tĐiểm\n';
    scoreList.forEach((s) => {
      text += `${s.stt}\t${s.code}\t${s.name}\t${s.className}\t${s.timesCalled}\t${s.correctCount}\t${s.wrongCount}\t${s.totalScore}\n`;
    });
    navigator.clipboard.writeText(text);
    alert('Đã sao chép bảng điểm vào clipboard!');
  };

  const exportCSV = () => {
    let csv = '\uFEFF'; // BOM for Excel UTF-8
    csv += 'STT,Mã học sinh,Họ và tên,Lớp,Số lần gọi,Số câu đúng,Số câu sai,Tổng điểm\n';
    scoreList.forEach((s) => {
      csv += `"${s.stt}","${s.code}","${s.name}","${s.className}",${s.timesCalled},${s.correctCount},${s.wrongCount},${s.totalScore}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Bang_diem_Quay_so_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-4xl rounded-2xl bg-gradient-to-b from-slate-900 to-[#0b1328] border-2 border-cyan-500/40 shadow-2xl p-6 text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-wide">Bảng Kết Quả & Điểm Số</h2>
              <p className="text-xs text-slate-400">Tổng kết điểm các lượt quay trong buổi học</p>
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

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-center">
            <div className="text-xs text-slate-400 font-medium">Tổng lượt đã gọi</div>
            <div className="text-2xl font-extrabold text-cyan-400 font-mono mt-0.5">
              {totalCalls}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-center">
            <div className="text-xs text-slate-400 font-medium">Số câu đúng</div>
            <div className="text-2xl font-extrabold text-emerald-400 font-mono mt-0.5">
              {totalCorrect}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-center">
            <div className="text-xs text-slate-400 font-medium">Số câu sai / Hết giờ</div>
            <div className="text-2xl font-extrabold text-rose-400 font-mono mt-0.5">
              {totalWrong}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-center">
            <div className="text-xs text-slate-400 font-medium">Tỷ lệ chính xác</div>
            <div className="text-2xl font-extrabold text-amber-400 font-mono mt-0.5">
              {accuracy}%
            </div>
          </div>
        </div>

        {/* Action bar */}
        <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
          <div className="text-xs text-slate-400">
            {scoreList.length} học sinh đã tham gia trả lời
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={copyToClipboard}
              disabled={scoreList.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 disabled:opacity-40"
            >
              <Copy className="w-3.5 h-3.5 text-cyan-400" />
              <span>Sao chép</span>
            </button>
            <button
              onClick={exportCSV}
              disabled={scoreList.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 disabled:opacity-40"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Xuất CSV</span>
            </button>
            <button
              onClick={() => {
                if (confirm('Đặt lại toàn bộ bảng điểm phiên chơi này?')) {
                  onResetSession();
                }
              }}
              disabled={scoreList.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-800/60 text-xs font-semibold disabled:opacity-40"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Đặt lại game</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/40">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-slate-900 border-b border-slate-800 text-slate-400 font-semibold">
              <tr>
                <th className="py-2.5 px-3 text-center w-12">Hạng</th>
                <th className="py-2.5 px-3 w-16 text-center">STT</th>
                <th className="py-2.5 px-3">Mã HS</th>
                <th className="py-2.5 px-3">Họ và tên</th>
                <th className="py-2.5 px-3 text-center">Lớp</th>
                <th className="py-2.5 px-3 text-center">Lần gọi</th>
                <th className="py-2.5 px-3 text-center">Đúng</th>
                <th className="py-2.5 px-3 text-center">Sai</th>
                <th className="py-2.5 px-3 text-right">Tổng điểm</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {scoreList.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500 italic">
                    Chưa có học sinh nào được gọi trong phiên này. Hãy nhấn &quot;Quay số&quot; để bắt đầu!
                  </td>
                </tr>
              ) : (
                scoreList.map((s, idx) => (
                  <tr key={s.studentId} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-2 px-3 text-center font-bold">
                      {idx === 0 ? (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-400/20 text-amber-300 font-black">
                          1
                        </span>
                      ) : idx === 1 ? (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-400/20 text-slate-300 font-black">
                          2
                        </span>
                      ) : idx === 2 ? (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-700/20 text-amber-500 font-black">
                          3
                        </span>
                      ) : (
                        <span className="text-slate-500">{idx + 1}</span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-center font-mono font-bold text-cyan-400">
                      {s.stt}
                    </td>
                    <td className="py-2 px-3 font-mono text-slate-400">{s.code}</td>
                    <td className="py-2 px-3 font-bold text-white flex items-center gap-1.5">
                      <span>{s.name}</span>
                      {s.totalScore >= 20 && <Award className="w-3.5 h-3.5 text-amber-400 inline" />}
                    </td>
                    <td className="py-2 px-3 text-center text-slate-300">{s.className}</td>
                    <td className="py-2 px-3 text-center font-mono">{s.timesCalled}</td>
                    <td className="py-2 px-3 text-center text-emerald-400 font-bold font-mono">
                      {s.correctCount}
                    </td>
                    <td className="py-2 px-3 text-center text-rose-400 font-mono">
                      {s.wrongCount}
                    </td>
                    <td className="py-2 px-3 text-right font-extrabold text-cyan-300 text-sm font-mono">
                      {s.totalScore}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
