import React, { useState, useEffect } from 'react';
import { Student } from '../types';
import {
  ExcelParseResult,
  ColumnMapping,
  parseExcelFile,
} from '../utils/excelParser';
import {
  X,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RotateCw,
  Sparkles,
  Layers,
  Play,
  Upload,
} from 'lucide-react';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  numSlots: number;
  currentStudents: Student[];
  onConfirmImport: (
    newStudents: Student[],
    importMode: 'replace' | 'append',
    chosenClass: string
  ) => void;
  onStartSpinningNow?: () => void;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen,
  onClose,
  numSlots,
  currentStudents,
  onConfirmImport,
  onStartSpinningNow,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parseResult, setParseResult] = useState<ExcelParseResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Column Mapping State
  const [showMapping, setShowMapping] = useState(false);
  const [customMapping, setCustomMapping] = useState<ColumnMapping>({
    sttCol: '',
    codeCol: '',
    nameCol: '',
    classCol: '',
  });

  // Import Options
  const [importMode, setImportMode] = useState<'replace' | 'append'>('replace');
  const [selectedClass, setSelectedClass] = useState<string>('ALL');

  // Success screen state
  const [importSuccess, setImportSuccess] = useState<{
    count: number;
    classes: string[];
  } | null>(null);

  if (!isOpen) return null;

  const handleFileChange = async (file: File) => {
    setSelectedFile(file);
    setIsLoading(true);
    setErrorMessage(null);
    setImportSuccess(null);

    try {
      const result = await parseExcelFile(file, numSlots);
      setParseResult(result);
      setCustomMapping(result.autoMapping);

      // Auto-select first class or ALL
      if (result.detectedClasses.length === 1) {
        setSelectedClass(result.detectedClasses[0]);
      } else {
        setSelectedClass('ALL');
      }

      // If headers had to be guessed or couldn't find Name column with high confidence, show mapping
      const headers = result.headers.map((h) => h.toLowerCase());
      const hasObviousName = headers.some((h) =>
        h.includes('tên') || h.includes('ten') || h.includes('name')
      );
      if (!hasObviousName) {
        setShowMapping(true);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Không thể đọc file Excel. Vui lòng thử lại.');
      setParseResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyCustomMapping = async () => {
    if (!selectedFile) return;
    setIsLoading(true);
    try {
      const result = await parseExcelFile(selectedFile, numSlots, customMapping);
      setParseResult(result);
      setShowMapping(false);
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi khi áp dụng ánh xạ cột.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = () => {
    if (!parseResult || parseResult.validRows.length === 0) return;

    let studentsToImport = parseResult.validRows;

    // Filter by chosen class if teacher chose a specific class
    if (selectedClass !== 'ALL') {
      studentsToImport = studentsToImport.filter((s) => s.className === selectedClass);
    }

    if (studentsToImport.length === 0) {
      alert('Không có học sinh nào thuộc lớp đã chọn.');
      return;
    }

    // Pass back to parent
    onConfirmImport(studentsToImport, importMode, selectedClass);

    // Show success view
    setImportSuccess({
      count: studentsToImport.length,
      classes:
        selectedClass === 'ALL'
          ? parseResult.detectedClasses
          : [selectedClass],
    });
  };

  const handleStartSpin = () => {
    onClose();
    if (onStartSpinningNow) {
      onStartSpinningNow();
    }
  };

  const totalWarnings =
    parseResult?.rowResults.reduce((acc, r) => acc + r.warnings.length, 0) || 0;
  const totalErrors =
    parseResult?.rowResults.reduce((acc, r) => acc + r.errors.length, 0) || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl rounded-3xl bg-gradient-to-b from-[#0e1d42] via-[#091533] to-[#050b1d] border-2 border-cyan-500/40 shadow-[0_20px_60px_rgba(0,0,0,0.9)] p-6 text-slate-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-wide uppercase flex items-center gap-2">
                <span>IMPORT DANH SÁCH HỌC SINH TỪ EXCEL</span>
              </h2>
              <p className="text-xs text-slate-400">
                Hỗ trợ .xlsx, .xls, .csv • Đọc trực tiếp trên trình duyệt
              </p>
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

        {/* SUCCESS VIEW (Step 12: Sau khi import) */}
        {importSuccess ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-8 px-4 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 mb-4 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-wide mb-2">
              IMPORT THÀNH CÔNG!
            </h3>
            <p className="text-slate-300 text-sm sm:text-base max-w-md mb-6">
              Đã nạp <strong className="text-emerald-400 font-extrabold">{importSuccess.count} học sinh</strong> vào hệ thống.
              <br />
              <span className="text-xs text-cyan-300 font-medium">
                Lớp:{' '}
                {importSuccess.classes.length > 1
                  ? importSuccess.classes.join(', ')
                  : importSuccess.classes[0] || '11A4'}
              </span>
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={handleStartSpin}
                className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-base shadow-[0_0_25px_rgba(6,182,212,0.4)] active:scale-95 transition-all cursor-pointer"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>BẮT ĐẦU QUAY SỐ NGAY</span>
              </button>
              <button
                onClick={onClose}
                className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto pr-1 space-y-5">
            {/* FILE SELECTION DROPZONE */}
            {!parseResult && (
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-cyan-500/40 rounded-3xl p-8 sm:p-12 bg-slate-900/50 hover:bg-slate-900/80 transition-all text-center">
                <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4">
                  <Upload className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-bold text-white mb-1">
                  Chọn file danh sách học sinh
                </h4>
                <p className="text-xs sm:text-sm text-slate-400 max-w-sm mb-6">
                  Kéo thả file Excel (.xlsx, .xls) hoặc .csv vào đây, hoặc nhấn nút bên dưới để chọn từ máy tính.
                </p>

                <label className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-lg cursor-pointer transition-all active:scale-95">
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Chọn file Excel từ máy</span>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileChange(e.target.files[0]);
                      }
                    }}
                  />
                </label>

                {errorMessage && (
                  <div className="mt-4 p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}
              </div>
            )}

            {/* PARSE & PREVIEW CONTENT */}
            {parseResult && (
              <div className="space-y-4 animate-in fade-in duration-300">
                {/* Stats & Class Filter Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                  <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-500/40 px-3 py-1.5 rounded-lg">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{parseResult.validRows.length} học sinh hợp lệ</span>
                    </span>

                    {(totalWarnings > 0 || totalErrors > 0) && (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-amber-300 bg-amber-950/70 border border-amber-500/40 px-3 py-1.5 rounded-lg">
                        <AlertTriangle className="w-4 h-4" />
                        <span>{totalWarnings + totalErrors} cảnh báo dữ liệu</span>
                      </span>
                    )}

                    <button
                      onClick={() => setShowMapping(!showMapping)}
                      className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 underline cursor-pointer ml-1"
                    >
                      {showMapping ? 'Ẩn ánh xạ cột' : 'Tùy chỉnh cột Excel'}
                    </button>
                  </div>

                  {/* Re-pick File */}
                  <label className="text-xs font-semibold text-slate-400 hover:text-white cursor-pointer flex items-center gap-1">
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Đổi file khác</span>
                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileChange(e.target.files[0]);
                        }
                      }}
                    />
                  </label>
                </div>

                {/* STEP 4: ÁNH XẠ CỘT (Nếu giáo viên muốn chỉnh cột thủ công) */}
                {showMapping && (
                  <div className="p-4 rounded-2xl bg-slate-900/90 border border-cyan-500/30 space-y-3 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Layers className="w-4 h-4" />
                        <span>ÁNH XẠ CỘT EXCEL</span>
                      </h4>
                      <span className="text-[11px] text-slate-400">
                        Chọn cột tương ứng trong file của bạn
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                      <div>
                        <label className="text-slate-300 block mb-1 font-semibold">
                          Cột STT:
                        </label>
                        <select
                          value={customMapping.sttCol}
                          onChange={(e) =>
                            setCustomMapping({ ...customMapping, sttCol: e.target.value })
                          }
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-medium focus:border-cyan-400"
                        >
                          {parseResult.headers.map((h) => (
                            <option key={h} value={h}>
                              {h}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-slate-300 block mb-1 font-semibold">
                          Cột Mã học sinh:
                        </label>
                        <select
                          value={customMapping.codeCol}
                          onChange={(e) =>
                            setCustomMapping({ ...customMapping, codeCol: e.target.value })
                          }
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-medium focus:border-cyan-400"
                        >
                          {parseResult.headers.map((h) => (
                            <option key={h} value={h}>
                              {h}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-slate-300 block mb-1 font-semibold">
                          Cột Họ và tên:
                        </label>
                        <select
                          value={customMapping.nameCol}
                          onChange={(e) =>
                            setCustomMapping({ ...customMapping, nameCol: e.target.value })
                          }
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-medium focus:border-cyan-400"
                        >
                          {parseResult.headers.map((h) => (
                            <option key={h} value={h}>
                              {h}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-slate-300 block mb-1 font-semibold">
                          Cột Lớp:
                        </label>
                        <select
                          value={customMapping.classCol}
                          onChange={(e) =>
                            setCustomMapping({ ...customMapping, classCol: e.target.value })
                          }
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-medium focus:border-cyan-400"
                        >
                          {parseResult.headers.map((h) => (
                            <option key={h} value={h}>
                              {h}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        onClick={handleApplyCustomMapping}
                        className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
                      >
                        Áp dụng lại ánh xạ
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 7 & 8: TÙY CHỌN IMPORT & CHỌN LỚP ĐANG CHƠI */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {/* Option 1: Xử lý danh sách hiện tại (Nếu đã có học sinh) */}
                  {currentStudents.length > 0 && (
                    <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
                      <div className="text-xs font-bold text-white mb-2">
                        Danh sách hiện tại đang có {currentStudents.length} học sinh:
                      </div>
                      <div className="space-y-1.5 text-xs">
                        <label className="flex items-center gap-2 cursor-pointer p-1.5 rounded-lg hover:bg-slate-800">
                          <input
                            type="radio"
                            name="importMode"
                            checked={importMode === 'replace'}
                            onChange={() => setImportMode('replace')}
                            className="text-cyan-500 focus:ring-cyan-400"
                          />
                          <span className="font-semibold text-slate-200">
                            ○ THAY THẾ danh sách hiện tại
                          </span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer p-1.5 rounded-lg hover:bg-slate-800">
                          <input
                            type="radio"
                            name="importMode"
                            checked={importMode === 'append'}
                            onChange={() => setImportMode('append')}
                            className="text-cyan-500 focus:ring-cyan-400"
                          />
                          <span className="font-semibold text-slate-200">
                            ○ THÊM VÀO danh sách hiện tại (bỏ qua trùng lặp)
                          </span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Option 2: Chọn lớp đang chơi (Nếu file có nhiều lớp) */}
                  <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-center">
                    <label className="text-xs font-bold text-cyan-300 block mb-1.5">
                      LỚP ĐANG CHƠI TRÊN MÁY QUAY:
                    </label>
                    <div className="flex items-center gap-2">
                      <select
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:border-cyan-400"
                      >
                        <option value="ALL">
                          Tất cả các lớp ({parseResult.validRows.length} học sinh)
                        </option>
                        {parseResult.detectedClasses.map((cls) => {
                          const count = parseResult.validRows.filter(
                            (s) => s.className === cls
                          ).length;
                          return (
                            <option key={cls} value={cls}>
                              Lớp {cls} ({count} học sinh)
                            </option>
                          );
                        })}
                      </select>
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1">
                      Máy quay sẽ chỉ bốc thăm học sinh thuộc lớp này.
                    </span>
                  </div>
                </div>

                {/* STEP 5: BẢNG XEM TRƯỚC DANH SÁCH (Preview Table) */}
                <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/60">
                  <div className="max-h-[300px] overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900/90 sticky top-0 border-b border-slate-800 text-slate-300 font-bold uppercase tracking-wider">
                        <tr>
                          <th className="py-2.5 px-3 w-16 text-center">STT</th>
                          <th className="py-2.5 px-3 w-32">Mã HS</th>
                          <th className="py-2.5 px-3">Họ và tên</th>
                          <th className="py-2.5 px-3 w-24">Lớp</th>
                          <th className="py-2.5 px-3 w-40">Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900 text-slate-200">
                        {parseResult.rowResults.map((res, i) => (
                          <tr
                            key={i}
                            className={`hover:bg-slate-800/40 transition-colors ${
                              !res.isValid
                                ? 'bg-rose-950/30'
                                : res.warnings.length > 0
                                ? 'bg-amber-950/20'
                                : ''
                            }`}
                          >
                            <td className="py-2 px-3 text-center font-mono font-bold text-cyan-300">
                              {res.student ? res.student.stt : '—'}
                            </td>
                            <td className="py-2 px-3 font-mono text-slate-300">
                              {res.student ? res.student.code : '—'}
                            </td>
                            <td className="py-2 px-3 font-semibold text-white">
                              {res.student ? res.student.name : String(res.raw[parseResult.autoMapping.nameCol] || '').trim() || '(Trống)'}
                            </td>
                            <td className="py-2 px-3">
                              <span className="bg-slate-800 px-2 py-0.5 rounded text-[11px] font-bold text-cyan-300">
                                {res.student ? res.student.className : '—'}
                              </span>
                            </td>
                            <td className="py-2 px-3">
                              {res.errors.length > 0 ? (
                                <span className="text-rose-400 font-semibold text-[11px] flex items-center gap-1">
                                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                                  <span>{res.errors.join(', ')}</span>
                                </span>
                              ) : res.warnings.length > 0 ? (
                                <span className="text-amber-300 text-[11px] flex items-center gap-1">
                                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                                  <span>{res.warnings.join(', ')}</span>
                                </span>
                              ) : (
                                <span className="text-emerald-400 text-[11px] font-medium flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                  <span>Hợp lệ</span>
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer Actions */}
        {!importSuccess && (
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-3 text-xs">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-colors cursor-pointer"
            >
              HỦY BỎ
            </button>

            {parseResult && parseResult.validRows.length > 0 && (
              <button
                onClick={handleConfirm}
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black shadow-lg transition-all cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4 text-slate-950" />
                <span>XÁC NHẬN IMPORT ({parseResult.validRows.length} HỌC SINH)</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
