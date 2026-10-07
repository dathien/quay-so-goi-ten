import React, { useState, useMemo } from 'react';
import { Student } from '../types';
import { INITIAL_STUDENTS } from '../data/initialData';
import { ExcelImportModal } from './ExcelImportModal';
import { downloadSampleExcel } from '../utils/excelParser';
import {
  X,
  UserPlus,
  Trash2,
  Edit2,
  RotateCcw,
  Search,
  FileSpreadsheet,
  Download,
  Filter,
} from 'lucide-react';

interface StudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  onUpdateStudents: (students: Student[]) => void;
  numSlots?: number;
  activeClass?: string;
  onSelectActiveClass?: (className: string) => void;
  onStartSpinningNow?: () => void;
}

export const StudentsModal: React.FC<StudentsModalProps> = ({
  isOpen,
  onClose,
  students,
  onUpdateStudents,
  numSlots = 3,
  activeClass = 'ALL',
  onSelectActiveClass,
  onStartSpinningNow,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>(activeClass);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showExcelModal, setShowExcelModal] = useState(false);

  // Form states for single add/edit
  const [formStt, setFormStt] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formClassName, setFormClassName] = useState('11A4');

  // Distinct classes in current student list
  const distinctClasses = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => {
      if (s.className) set.add(s.className);
    });
    return Array.from(set);
  }, [students]);

  if (!isOpen) return null;

  // Filter students by search term and selected class
  const filteredStudents = students.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.stt.includes(searchTerm) ||
      s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.className.toLowerCase().includes(searchTerm.toLowerCase());

    const matchClass =
      selectedClassFilter === 'ALL' || s.className === selectedClassFilter;

    return matchSearch && matchClass;
  });

  const startEdit = (s: Student) => {
    setEditingStudent(s);
    setFormStt(s.stt);
    setFormCode(s.code);
    setFormName(s.name);
    setFormClassName(s.className);
    setShowAddForm(true);
  };

  const cancelForm = () => {
    setShowAddForm(false);
    setEditingStudent(null);
    setFormStt('');
    setFormCode('');
    setFormName('');
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const formattedStt = formStt.trim().padStart(numSlots, '0') || '001';
    const formattedCode = formCode.trim() || `HS2026${formattedStt}`;
    const formattedClass = formClassName.trim() || '11A4';

    if (editingStudent) {
      const updated = students.map((s) =>
        s.id === editingStudent.id
          ? {
              ...s,
              stt: formattedStt,
              code: formattedCode,
              name: formName.trim(),
              className: formattedClass,
            }
          : s
      );
      onUpdateStudents(updated);
    } else {
      const newStudent: Student = {
        id: `hs-${Date.now()}`,
        stt: formattedStt,
        code: formattedCode,
        name: formName.trim(),
        className: formattedClass,
      };
      onUpdateStudents([...students, newStudent]);
    }

    cancelForm();
  };

  const handleDeleteStudent = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa học sinh này?')) {
      onUpdateStudents(students.filter((s) => s.id !== id));
    }
  };

  const handleClearAll = () => {
    if (confirm('CẢNH BÁO: Xóa toàn bộ danh sách học sinh hiện tại?')) {
      onUpdateStudents([]);
    }
  };

  const handleResetSample = () => {
    if (confirm('Tải lại 40 học sinh mẫu chuẩn lớp 11A4?')) {
      onUpdateStudents(INITIAL_STUDENTS);
      if (onSelectActiveClass) onSelectActiveClass('11A4');
      setSelectedClassFilter('11A4');
    }
  };

  const handleConfirmExcelImport = (
    newStudents: Student[],
    mode: 'replace' | 'append',
    chosenClass: string
  ) => {
    if (mode === 'replace') {
      onUpdateStudents(newStudents);
    } else {
      // Append mode: avoid duplicates by STT in same class or identical code
      const existingKeySet = new Set(
        students.map((s) => `${s.className}___${s.stt}`)
      );
      const toAdd = newStudents.filter(
        (s) => !existingKeySet.has(`${s.className}___${s.stt}`)
      );
      onUpdateStudents([...students, ...toAdd]);
    }

    if (onSelectActiveClass) {
      onSelectActiveClass(chosenClass);
    }
    setSelectedClassFilter(chosenClass);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="w-full max-w-4xl rounded-2xl bg-gradient-to-b from-slate-900 to-[#0b1328] border-2 border-cyan-500/40 shadow-2xl p-6 text-slate-100 flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
            <div>
              <h2 className="text-xl font-black text-white tracking-wide flex items-center gap-2 uppercase">
                <span>QUẢN LÝ DANH SÁCH HỌC SINH</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold normal-case">
                  {students.length} học sinh
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Import Excel, lọc theo từng lớp và chuẩn hóa số ô quay {numSlots} chữ số
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Action Toolbar (1. NÚT CHỨC NĂNG) */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Button 1: [ 📥 IMPORT EXCEL ] */}
              <button
                onClick={() => setShowExcelModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer active:scale-95"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>📥 IMPORT EXCEL</span>
              </button>

              {/* Button 2: [ 📄 TẢI FILE EXCEL MẪU ] */}
              <button
                onClick={() => downloadSampleExcel(numSlots)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                title="Tải file mẫu Excel (.xlsx)"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>📄 TẢI FILE EXCEL MẪU</span>
              </button>

              {/* Button 3: [ + THÊM HỌC SINH ] */}
              <button
                onClick={() => {
                  cancelForm();
                  setShowAddForm(!showAddForm);
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md transition-colors cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ THÊM HỌC SINH</span>
              </button>

              {/* Button 4: [ 🗑 XÓA DANH SÁCH ] */}
              <button
                onClick={handleClearAll}
                disabled={students.length === 0}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-800/60 text-xs font-semibold transition-colors disabled:opacity-40 cursor-pointer"
                title="Xóa toàn bộ học sinh"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>🗑 XÓA DANH SÁCH</span>
              </button>

              {/* Reset Sample Data */}
              <button
                onClick={handleResetSample}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium transition-colors cursor-pointer"
                title="Tải lại 40 học sinh mẫu 11A4"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                <span>↺ HỌC SINH MẪU</span>
              </button>
            </div>
          </div>

          {/* Search & Class Filter Row (8. NHIỀU LỚP TRONG CÙNG FILE) */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 p-3 rounded-xl bg-slate-800/50 border border-slate-800">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm kiếm theo STT, tên học sinh, mã số..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700 rounded-lg pl-9 pr-4 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* Filter by class */}
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-xs font-bold text-slate-300">LỚP ĐANG CHƠI:</span>
              <select
                value={selectedClassFilter}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedClassFilter(val);
                  if (onSelectActiveClass) onSelectActiveClass(val);
                }}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-bold text-cyan-300 focus:border-cyan-400 cursor-pointer"
              >
                <option value="ALL">Tất cả các lớp ({students.length} HS)</option>
                {distinctClasses.map((cls) => {
                  const count = students.filter((s) => s.className === cls).length;
                  return (
                    <option key={cls} value={cls}>
                      Lớp {cls} ({count} HS)
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Single Add/Edit Student Form */}
          {showAddForm && (
            <form
              onSubmit={handleSaveStudent}
              className="p-4 mb-4 rounded-xl bg-slate-800/90 border border-cyan-500/40 animate-in fade-in duration-200"
            >
              <div className="text-xs font-bold text-cyan-300 uppercase tracking-wider mb-3">
                {editingStudent ? 'Chỉnh sửa thông tin học sinh' : 'Thêm học sinh mới'}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">STT ({numSlots} chữ số)</label>
                  <input
                    type="text"
                    placeholder={String(1).padStart(numSlots, '0')}
                    value={formStt}
                    onChange={(e) => setFormStt(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Mã học sinh</label>
                  <input
                    type="text"
                    placeholder="HS2026001"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Họ và tên</label>
                  <input
                    type="text"
                    placeholder="Nguyễn Văn An"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Lớp</label>
                  <input
                    type="text"
                    placeholder="11A4"
                    value={formClassName}
                    onChange={(e) => setFormClassName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={cancelForm}
                  className="px-3 py-1.5 rounded-lg bg-slate-700 text-slate-200 text-xs font-semibold hover:bg-slate-600"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold"
                >
                  {editingStudent ? 'Cập nhật' : 'Thêm vào danh sách'}
                </button>
              </div>
            </form>
          )}

          {/* Student Table */}
          <div className="flex-1 overflow-y-auto border border-slate-800 rounded-xl bg-slate-950/60">
            {filteredStudents.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                {students.length === 0
                  ? 'Chưa có học sinh nào. Hãy nhấn [ 📥 IMPORT EXCEL ] hoặc [ ↺ HỌC SINH MẪU ] để bắt đầu.'
                  : 'Không tìm thấy học sinh nào phù hợp với bộ lọc tìm kiếm.'}
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/90 sticky top-0 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3 w-16 text-center">STT</th>
                    <th className="py-2.5 px-3 w-32">Mã HS</th>
                    <th className="py-2.5 px-3">Họ và tên</th>
                    <th className="py-2.5 px-3 w-24">Lớp</th>
                    <th className="py-2.5 px-3 w-20 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 text-slate-200">
                  {filteredStudents.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2 px-3 text-center font-mono font-bold text-cyan-300">
                        {s.stt}
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-400">{s.code}</td>
                      <td className="py-2 px-3 font-medium text-white">{s.name}</td>
                      <td className="py-2 px-3">
                        <span className="bg-slate-800 px-2 py-0.5 rounded text-[11px] font-semibold text-cyan-300">
                          {s.className}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => startEdit(s)}
                            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-cyan-300"
                            title="Sửa"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(s.id)}
                            className="p-1 rounded hover:bg-rose-950 text-slate-400 hover:text-rose-400"
                            title="Xóa"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Footer Info */}
          <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
            <span>
              Hiển thị: <strong>{filteredStudents.length}</strong> / {students.length} học sinh
              {selectedClassFilter !== 'ALL' && ` (Lớp ${selectedClassFilter})`}
            </span>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>

      {/* Excel Import Modal */}
      <ExcelImportModal
        isOpen={showExcelModal}
        onClose={() => setShowExcelModal(false)}
        numSlots={numSlots}
        currentStudents={students}
        onConfirmImport={handleConfirmExcelImport}
        onStartSpinningNow={() => {
          setShowExcelModal(false);
          onClose();
          if (onStartSpinningNow) {
            onStartSpinningNow();
          }
        }}
      />
    </>
  );
};
