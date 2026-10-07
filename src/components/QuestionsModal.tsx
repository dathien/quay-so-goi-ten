import React, { useState, useMemo } from 'react';
import { Question } from '../types';
import { INITIAL_QUESTIONS } from '../data/initialData';
import { MathRenderer } from './MathRenderer';
import { FormulaToolbar } from './FormulaToolbar';
import {
  downloadSampleQuestionsExcel,
  parseQuestionsExcel,
  parseQuestionsDocx,
  parseBulkTextQuestions,
  BulkQuestionParseReport,
} from '../utils/questionParser';
import {
  X,
  Plus,
  Trash2,
  Edit2,
  RotateCcw,
  Clipboard,
  FileSpreadsheet,
  FileText,
  BookOpen,
  Search,
  CheckCircle2,
  AlertTriangle,
  Image as ImageIcon,
  Eye,
  Download,
  Filter,
} from 'lucide-react';

interface QuestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: Question[];
  onUpdateQuestions: (questions: Question[]) => void;
}

type TabType = 'list' | 'single' | 'bulk' | 'excel' | 'word';

export const QuestionsModal: React.FC<QuestionsModalProps> = ({
  isOpen,
  onClose,
  questions,
  onUpdateQuestions,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('ALL');
  const [filterLevel, setFilterLevel] = useState('ALL');

  // Single Question Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formSubject, setFormSubject] = useState('Toán học');
  const [formGrade, setFormGrade] = useState('11');
  const [formTopic, setFormTopic] = useState('');
  const [formLevel, setFormLevel] = useState<'Nhận biết' | 'Thông hiểu' | 'Vận dụng'>('Thông hiểu');
  const [formQuestion, setFormQuestion] = useState('');
  const [formImage, setFormImage] = useState<string>('');
  const [formOptA, setFormOptA] = useState('');
  const [formImageA, setFormImageA] = useState<string>('');
  const [formOptB, setFormOptB] = useState('');
  const [formImageB, setFormImageB] = useState<string>('');
  const [formOptC, setFormOptC] = useState('');
  const [formImageC, setFormImageC] = useState<string>('');
  const [formOptD, setFormOptD] = useState('');
  const [formImageD, setFormImageD] = useState<string>('');
  const [formCorrect, setFormCorrect] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [formExplanation, setFormExplanation] = useState('');
  const [formExplanationImage, setFormExplanationImage] = useState<string>('');

  // Active input ref for inserting formula snippets
  const [activeInput, setActiveInput] = useState<'question' | 'explanation' | 'optA' | 'optB' | 'optC' | 'optD'>('question');

  // Preview Modal
  const [previewQuestion, setPreviewQuestion] = useState<Question | null>(null);

  // Bulk Paste State
  const [bulkText, setBulkText] = useState('');
  const [bulkReport, setBulkReport] = useState<BulkQuestionParseReport | null>(null);

  // File Import State (Excel / Word)
  const [importReport, setImportReport] = useState<BulkQuestionParseReport | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  if (!isOpen) return null;

  // Filter questions
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchSearch =
        q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.optionA.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.optionB.toLowerCase().includes(searchTerm.toLowerCase());

      const matchSubject =
        filterSubject === 'ALL' || q.subject === filterSubject;

      const matchLevel =
        filterLevel === 'ALL' || q.level === filterLevel;

      return matchSearch && matchSubject && matchLevel;
    });
  }, [questions, searchTerm, filterSubject, filterLevel]);

  // Insert formula snippet to current active field
  const handleInsertSnippet = (snippet: string) => {
    if (activeInput === 'question') {
      setFormQuestion((prev) => prev + snippet);
    } else if (activeInput === 'explanation') {
      setFormExplanation((prev) => prev + snippet);
    } else if (activeInput === 'optA') {
      setFormOptA((prev) => prev + snippet);
    } else if (activeInput === 'optB') {
      setFormOptB((prev) => prev + snippet);
    } else if (activeInput === 'optC') {
      setFormOptC((prev) => prev + snippet);
    } else if (activeInput === 'optD') {
      setFormOptD((prev) => prev + snippet);
    }
  };

  // Helper for image upload (Base64)
  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (val: string) => void
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setter(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startEditQuestion = (q: Question) => {
    setEditingId(q.id);
    setFormSubject(q.subject || 'Toán học');
    setFormGrade(q.grade || '11');
    setFormTopic(q.topic || '');
    setFormLevel(q.level || 'Thông hiểu');
    setFormQuestion(q.question);
    setFormImage(q.image || '');
    setFormOptA(q.optionA);
    setFormImageA(q.imageA || '');
    setFormOptB(q.optionB);
    setFormImageB(q.imageB || '');
    setFormOptC(q.optionC);
    setFormImageC(q.imageC || '');
    setFormOptD(q.optionD);
    setFormImageD(q.imageD || '');
    setFormCorrect(q.correctAnswer);
    setFormExplanation(q.explanation || '');
    setFormExplanationImage(q.explanationImage || '');
    setActiveTab('single');
  };

  const resetSingleForm = () => {
    setEditingId(null);
    setFormSubject('Toán học');
    setFormGrade('11');
    setFormTopic('');
    setFormLevel('Thông hiểu');
    setFormQuestion('');
    setFormImage('');
    setFormOptA('');
    setFormImageA('');
    setFormOptB('');
    setFormImageB('');
    setFormOptC('');
    setFormImageC('');
    setFormOptD('');
    setFormImageD('');
    setFormCorrect('A');
    setFormExplanation('');
    setFormExplanationImage('');
  };

  const handleSaveSingle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formQuestion.trim() || !formOptA.trim() || !formOptB.trim()) {
      alert('Vui lòng nhập đầy đủ nội dung câu hỏi và ít nhất 2 đáp án A, B.');
      return;
    }

    const item: Question = {
      id: editingId || `q-${Date.now()}`,
      subject: formSubject,
      grade: formGrade,
      topic: formTopic || undefined,
      level: formLevel,
      question: formQuestion.trim(),
      image: formImage || undefined,
      optionA: formOptA.trim(),
      imageA: formImageA || undefined,
      optionB: formOptB.trim(),
      imageB: formImageB || undefined,
      optionC: formOptC.trim() || 'Không có đáp án C',
      imageC: formImageC || undefined,
      optionD: formOptD.trim() || 'Không có đáp án D',
      imageD: formImageD || undefined,
      correctAnswer: formCorrect,
      explanation: formExplanation.trim() || undefined,
      explanationImage: formExplanationImage || undefined,
    };

    if (editingId) {
      onUpdateQuestions(questions.map((q) => (q.id === editingId ? item : q)));
    } else {
      onUpdateQuestions([...questions, item]);
    }

    resetSingleForm();
    setActiveTab('list');
  };

  // Bulk paste preview
  const handleParseBulk = () => {
    if (!bulkText.trim()) {
      alert('Vui lòng dán nội dung các câu hỏi vào ô văn bản.');
      return;
    }
    const report = parseBulkTextQuestions(bulkText);
    setBulkReport(report);
  };

  const handleConfirmBulk = () => {
    if (!bulkReport || bulkReport.validQuestions.length === 0) return;
    onUpdateQuestions([...questions, ...bulkReport.validQuestions]);
    setBulkText('');
    setBulkReport(null);
    setActiveTab('list');
  };

  // Excel / Word file handling
  const handleExcelUpload = async (file: File) => {
    setIsProcessingFile(true);
    setImportError(null);
    try {
      const rep = await parseQuestionsExcel(file);
      setImportReport(rep);
    } catch (err: any) {
      setImportError(err.message || 'Lỗi khi đọc file Excel.');
    } finally {
      setIsProcessingFile(false);
    }
  };

  const handleWordUpload = async (file: File) => {
    setIsProcessingFile(true);
    setImportError(null);
    try {
      const rep = await parseQuestionsDocx(file);
      setImportReport(rep);
    } catch (err: any) {
      setImportError(err.message || 'Lỗi khi đọc file Word (.docx).');
    } finally {
      setIsProcessingFile(false);
    }
  };

  const handleConfirmImportFile = () => {
    if (!importReport || importReport.validQuestions.length === 0) return;
    onUpdateQuestions([...questions, ...importReport.validQuestions]);
    setImportReport(null);
    setActiveTab('list');
  };

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc muốn xóa câu hỏi này?')) {
      onUpdateQuestions(questions.filter((q) => q.id !== id));
    }
  };

  const handleResetSampleQuestions = () => {
    if (confirm('Tải lại ngân hàng câu hỏi STEM mẫu (Toán, Lí, Hóa, Sinh, Tin)?')) {
      onUpdateQuestions(INITIAL_QUESTIONS);
      setActiveTab('list');
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
        <div className="w-full max-w-5xl rounded-3xl bg-gradient-to-b from-[#0e1d42] via-[#091533] to-[#050b1d] border-2 border-cyan-500/40 shadow-[0_20px_60px_rgba(0,0,0,0.9)] p-6 text-slate-100 flex flex-col max-h-[92vh]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white tracking-wide uppercase flex items-center gap-2">
                  <span>NGÂN HÀNG CÂU HỎI THỬ THÁCH</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 normal-case font-semibold">
                    {questions.length} câu
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Hỗ trợ công thức Toán - Lí - Hóa - Sinh (KaTeX), hình ảnh STEM và import Word/Excel
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs (Section 20: [ + THÊM ], [ 📋 THÊM HÀNG LOẠT ], [ 📥 EXCEL ], [ 📄 WORD ], [ 📚 DANH SÁCH ]) */}
          <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-3 flex-wrap">
            <button
              onClick={() => {
                resetSingleForm();
                setActiveTab('single');
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'single'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>+ THÊM CÂU HỎI</span>
            </button>

            <button
              onClick={() => setActiveTab('bulk')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'bulk'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
              }`}
            >
              <Clipboard className="w-4 h-4" />
              <span>📋 THÊM HÀNG LOẠT</span>
            </button>

            <button
              onClick={() => setActiveTab('excel')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'excel'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>📥 IMPORT EXCEL</span>
            </button>

            <button
              onClick={() => setActiveTab('word')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'word'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>📄 IMPORT WORD</span>
            </button>

            <button
              onClick={() => setActiveTab('list')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'list'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>📚 DANH SÁCH CÂU HỎI</span>
            </button>

            {/* Template Download */}
            <button
              onClick={downloadSampleQuestionsExcel}
              className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer border border-slate-700"
              title="Tải file Excel mẫu câu hỏi"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>TẢI EXCEL MẪU</span>
            </button>
          </div>

          {/* TAB 1: DANH SÁCH CÂU HỎI */}
          {activeTab === 'list' && (
            <div className="flex-1 flex flex-col min-h-0 space-y-3">
              {/* Filter Row */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm nội dung, đáp án..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-white placeholder-slate-400 focus:border-cyan-400"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-slate-400 font-semibold">Môn:</span>
                  <select
                    value={filterSubject}
                    onChange={(e) => setFilterSubject(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 font-bold text-cyan-300"
                  >
                    <option value="ALL">Tất cả môn</option>
                    <option value="Toán học">Toán học</option>
                    <option value="Vật lí">Vật lí</option>
                    <option value="Hóa học">Hóa học</option>
                    <option value="Sinh học">Sinh học</option>
                    <option value="Tin học">Tin học</option>
                  </select>
                </div>

                <button
                  onClick={handleResetSampleQuestions}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                  <span>Dữ liệu mẫu STEM</span>
                </button>
              </div>

              {/* Questions List */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {filteredQuestions.length === 0 ? (
                  <div className="p-12 text-center text-slate-500 text-xs">
                    Không tìm thấy câu hỏi nào phù hợp với bộ lọc.
                  </div>
                ) : (
                  filteredQuestions.map((q, idx) => (
                    <div
                      key={q.id}
                      className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2 flex-wrap text-xs">
                          <span className="font-mono font-bold text-cyan-400">
                            #{idx + 1}
                          </span>
                          {q.subject && (
                            <span className="bg-cyan-950 border border-cyan-800 text-cyan-300 px-2 py-0.5 rounded text-[11px] font-semibold">
                              {q.subject} {q.grade ? `K${q.grade}` : ''}
                            </span>
                          )}
                          {q.level && (
                            <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[11px]">
                              {q.level}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setPreviewQuestion(q)}
                            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-cyan-300"
                            title="Xem trước như học sinh thấy"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => startEditQuestion(q)}
                            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-cyan-300"
                            title="Sửa"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(q.id)}
                            className="p-1.5 rounded hover:bg-rose-950 text-slate-400 hover:text-rose-400"
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Question Content */}
                      <div className="text-sm font-semibold text-white mb-2 leading-relaxed">
                        <MathRenderer content={q.question} />
                      </div>

                      {q.image && (
                        <div className="mb-2 max-w-xs rounded-lg overflow-hidden border border-slate-700">
                          <img src={q.image} alt="Minh họa" className="max-h-28 object-contain" />
                        </div>
                      )}

                      {/* Options grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {(['A', 'B', 'C', 'D'] as const).map((opt) => {
                          const val = q[`option${opt}` as keyof Question] as string;
                          const isCorrect = q.correctAnswer === opt;
                          return (
                            <div
                              key={opt}
                              className={`p-2 rounded-lg border ${
                                isCorrect
                                  ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-200 font-semibold'
                                  : 'bg-slate-950/60 border-slate-800 text-slate-300'
                              }`}
                            >
                              <strong className="mr-1.5 text-cyan-300">{opt}.</strong>
                              <MathRenderer content={val} inline={true} />
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation */}
                      {q.explanation && (
                        <div className="mt-2.5 pt-2 border-t border-slate-800 text-xs text-slate-300 flex items-start gap-1.5">
                          <span className="font-bold text-amber-400 shrink-0">💡 Giải thích:</span>
                          <span className="text-slate-300">
                            <MathRenderer content={q.explanation} inline={true} />
                          </span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 2: THÊM / CHỈNH SỬA MỘT CÂU HỎI (Section 21) */}
          {activeTab === 'single' && (
            <form onSubmit={handleSaveSingle} className="flex-1 overflow-y-auto pr-1 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Môn học</label>
                  <select
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-bold"
                  >
                    <option value="Toán học">Toán học</option>
                    <option value="Vật lí">Vật lí</option>
                    <option value="Hóa học">Hóa học</option>
                    <option value="Sinh học">Sinh học</option>
                    <option value="Tin học">Tin học</option>
                    <option value="Tiếng Anh">Tiếng Anh</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Khối</label>
                  <select
                    value={formGrade}
                    onChange={(e) => setFormGrade(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-bold"
                  >
                    <option value="10">Khối 10</option>
                    <option value="11">Khối 11</option>
                    <option value="12">Khối 12</option>
                    <option value="Trung cấp">Trung cấp</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Chủ đề</label>
                  <input
                    type="text"
                    placeholder="VD: Đạo hàm, Mạng LAN..."
                    value={formTopic}
                    onChange={(e) => setFormTopic(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Mức độ</label>
                  <select
                    value={formLevel}
                    onChange={(e) => setFormLevel(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-bold"
                  >
                    <option value="Nhận biết">Nhận biết</option>
                    <option value="Thông hiểu">Thông hiểu</option>
                    <option value="Vận dụng">Vận dụng</option>
                  </select>
                </div>
              </div>

              {/* Formula Toolbar for easy LaTeX insertion (Section 27) */}
              <FormulaToolbar onInsert={handleInsertSnippet} />

              {/* Question text */}
              <div>
                <div className="flex items-center justify-between mb-1 text-xs">
                  <label className="text-cyan-300 font-bold uppercase tracking-wider">
                    Nội dung câu hỏi:
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Bao quanh công thức bằng dấu $ ví dụ: $\frac&#123;a&#125;&#123;b&#125;$
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={formQuestion}
                  onFocus={() => setActiveInput('question')}
                  onChange={(e) => setFormQuestion(e.target.value)}
                  placeholder="Nhập nội dung câu hỏi, ví dụ: Tính giá trị giới hạn $\lim_{x \to 0} \frac{\sin x}{x}$:"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white font-mono focus:border-cyan-400"
                  required
                />

                {/* Question Image Attachment */}
                <div className="mt-2 flex items-center gap-3">
                  <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer border border-slate-700">
                    <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{formImage ? 'Đổi hình câu hỏi' : '+ Thêm hình câu hỏi'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e, setFormImage)}
                    />
                  </label>
                  {formImage && (
                    <button
                      type="button"
                      onClick={() => setFormImage('')}
                      className="text-xs text-rose-400 hover:underline"
                    >
                      Xóa hình
                    </button>
                  )}
                </div>
                {formImage && (
                  <div className="mt-2 max-w-xs rounded-xl overflow-hidden border border-slate-700">
                    <img src={formImage} alt="Preview" className="max-h-32 object-contain" />
                  </div>
                )}
              </div>

              {/* Options A, B, C, D */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {(['A', 'B', 'C', 'D'] as const).map((opt) => {
                  const val = opt === 'A' ? formOptA : opt === 'B' ? formOptB : opt === 'C' ? formOptC : formOptD;
                  const setter = opt === 'A' ? setFormOptA : opt === 'B' ? setFormOptB : opt === 'C' ? setFormOptC : setFormOptD;
                  const isCorrect = formCorrect === opt;

                  return (
                    <div key={opt} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="font-bold text-cyan-300">Đáp án {opt}:</label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="correctAnswer"
                            checked={isCorrect}
                            onChange={() => setFormCorrect(opt)}
                            className="text-emerald-500 focus:ring-emerald-400"
                          />
                          <span className={`text-[11px] font-bold ${isCorrect ? 'text-emerald-400' : 'text-slate-400'}`}>
                            {isCorrect ? '✓ ĐÁP ÁN ĐÚNG' : 'Chọn làm đáp án đúng'}
                          </span>
                        </label>
                      </div>
                      <input
                        type="text"
                        value={val}
                        onFocus={() => setActiveInput(`opt${opt}` as any)}
                        onChange={(e) => setter(e.target.value)}
                        placeholder={`Nội dung đáp án ${opt}`}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                        required={opt === 'A' || opt === 'B'}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Explanation / Solution */}
              <div>
                <label className="text-cyan-300 font-bold block mb-1 text-xs uppercase tracking-wider">
                  Giải thích / Lời giải chi tiết:
                </label>
                <textarea
                  rows={2}
                  value={formExplanation}
                  onFocus={() => setActiveInput('explanation')}
                  onChange={(e) => setFormExplanation(e.target.value)}
                  placeholder="Ghi chú kiến thức mở rộng hoặc các bước giải để giáo viên giảng bài trên lớp..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white font-mono focus:border-cyan-400"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setPreviewQuestion({
                      id: 'preview',
                      subject: formSubject,
                      grade: formGrade,
                      topic: formTopic,
                      level: formLevel,
                      question: formQuestion || '(Chưa nhập nội dung)',
                      image: formImage || undefined,
                      optionA: formOptA || 'A',
                      optionB: formOptB || 'B',
                      optionC: formOptC || 'C',
                      optionD: formOptD || 'D',
                      correctAnswer: formCorrect,
                      explanation: formExplanation || undefined,
                    });
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 inline mr-1" />
                  <span>XEM TRƯỚC</span>
                </button>

                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs shadow-lg transition-all cursor-pointer active:scale-95"
                >
                  <span>{editingId ? 'CẬP NHẬT CÂU HỎI' : 'LƯU CÂU HỎI'}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: THÊM CÂU HỎI HÀNG LOẠT (Section 22) */}
          {activeTab === 'bulk' && (
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {!bulkReport ? (
                <>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
                    <strong className="text-cyan-300 block mb-1">Quy cách định dạng:</strong>
                    <code>Câu 1: [Nội dung câu hỏi]<br />A. [Đáp án A]<br />B. [Đáp án B]<br />C. [Đáp án C]<br />D. [Đáp án D]<br />Đáp án: B<br />Giải thích: [Lời giải]</code>
                  </div>
                  <textarea
                    rows={8}
                    value={bulkText}
                    onChange={(e) => setBulkText(e.target.value)}
                    placeholder="Dán toàn bộ các câu hỏi vào đây..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-4 text-xs font-mono text-white placeholder-slate-500 focus:border-cyan-400"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={handleParseBulk}
                      className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs shadow-lg cursor-pointer active:scale-95"
                    >
                      PHÂN TÍCH CÂU HỎI
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                    <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{bulkReport.validQuestions.length} câu hợp lệ</span>
                    </span>
                    <button
                      onClick={() => setBulkReport(null)}
                      className="text-slate-400 hover:text-white underline cursor-pointer"
                    >
                      Dán lại nội dung khác
                    </button>
                  </div>

                  <div className="max-h-72 overflow-y-auto space-y-2">
                    {bulkReport.results.map((res, i) => (
                      <div
                        key={i}
                        className={`p-3 rounded-xl border text-xs ${
                          res.isValid ? 'bg-slate-950/60 border-slate-800' : 'bg-rose-950/30 border-rose-500/40'
                        }`}
                      >
                        <div className="font-bold text-white mb-1">
                          Câu {res.index}: {res.question?.question || '(Lỗi nội dung)'}
                        </div>
                        {res.errors.length > 0 && (
                          <div className="text-rose-400 font-semibold">{res.errors.join(', ')}</div>
                        )}
                        {res.warnings.length > 0 && (
                          <div className="text-amber-400">{res.warnings.join(', ')}</div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                    <button
                      onClick={() => setBulkReport(null)}
                      className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                    >
                      HỦY BỎ
                    </button>
                    <button
                      onClick={handleConfirmBulk}
                      disabled={bulkReport.validQuestions.length === 0}
                      className="px-6 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs cursor-pointer shadow-lg active:scale-95 disabled:opacity-50"
                    >
                      XÁC NHẬN LƯU ({bulkReport.validQuestions.length} CÂU)
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: IMPORT EXCEL (Section 23) */}
          {activeTab === 'excel' && (
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {!importReport ? (
                <div className="border-2 border-dashed border-cyan-500/40 rounded-3xl p-8 sm:p-12 text-center bg-slate-950/40">
                  <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto mb-4">
                    <FileSpreadsheet className="w-8 h-8" />
                  </div>
                  <h4 className="text-base font-bold text-white mb-1">Chọn file Excel (.xlsx, .xls)</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6">
                    File cần có các cột: Câu hỏi, A, B, C, D, Đáp án, Giải thích, Môn, Khối...
                  </p>

                  <label className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs shadow-lg cursor-pointer active:scale-95">
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>CHỌN FILE EXCEL</span>
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleExcelUpload(e.target.files[0]);
                        }
                      }}
                    />
                  </label>

                  {importError && (
                    <div className="mt-4 text-xs text-rose-400 flex items-center justify-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" />
                      <span>{importError}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                    <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{importReport.validQuestions.length} câu hỏi hợp lệ từ Excel</span>
                    </span>
                    <button
                      onClick={() => setImportReport(null)}
                      className="text-slate-400 hover:text-white underline cursor-pointer"
                    >
                      Chọn file khác
                    </button>
                  </div>

                  <div className="max-h-72 overflow-y-auto space-y-2">
                    {importReport.results.map((res, i) => (
                      <div
                        key={i}
                        className={`p-3 rounded-xl border text-xs ${
                          res.isValid ? 'bg-slate-950/60 border-slate-800' : 'bg-rose-950/30 border-rose-500/40'
                        }`}
                      >
                        <div className="font-bold text-white mb-1">
                          Dòng {res.index}: {res.question?.question || '(Lỗi nội dung)'}
                        </div>
                        {res.errors.length > 0 && (
                          <div className="text-rose-400 font-semibold">{res.errors.join(', ')}</div>
                        )}
                        {res.warnings.length > 0 && (
                          <div className="text-amber-400">{res.warnings.join(', ')}</div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                    <button
                      onClick={() => setImportReport(null)}
                      className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                    >
                      HỦY BỎ
                    </button>
                    <button
                      onClick={handleConfirmImportFile}
                      className="px-6 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs cursor-pointer shadow-lg active:scale-95"
                    >
                      XÁC NHẬN IMPORT ({importReport.validQuestions.length} CÂU)
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: IMPORT WORD .DOCX (Section 24) */}
          {activeTab === 'word' && (
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {!importReport ? (
                <div className="border-2 border-dashed border-cyan-500/40 rounded-3xl p-8 sm:p-12 text-center bg-slate-950/40">
                  <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto mb-4">
                    <FileText className="w-8 h-8" />
                  </div>
                  <h4 className="text-base font-bold text-white mb-1">Chọn file Word (.docx)</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6">
                    Đọc trực tiếp file Word gồm các câu dạng: Câu 1. ... A. ... B. ... C. ... D. ... Đáp án: ...
                  </p>

                  <label className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs shadow-lg cursor-pointer active:scale-95">
                    <FileText className="w-4 h-4" />
                    <span>CHỌN FILE WORD (.DOCX)</span>
                    <input
                      type="file"
                      accept=".docx"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleWordUpload(e.target.files[0]);
                        }
                      }}
                    />
                  </label>

                  {importError && (
                    <div className="mt-4 text-xs text-rose-400 flex items-center justify-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" />
                      <span>{importError}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                    <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{importReport.validQuestions.length} câu hỏi trích xuất từ Word</span>
                    </span>
                    <button
                      onClick={() => setImportReport(null)}
                      className="text-slate-400 hover:text-white underline cursor-pointer"
                    >
                      Chọn file khác
                    </button>
                  </div>

                  <div className="max-h-72 overflow-y-auto space-y-2">
                    {importReport.results.map((res, i) => (
                      <div
                        key={i}
                        className={`p-3 rounded-xl border text-xs ${
                          res.isValid ? 'bg-slate-950/60 border-slate-800' : 'bg-rose-950/30 border-rose-500/40'
                        }`}
                      >
                        <div className="font-bold text-white mb-1">
                          Câu {res.index}: {res.question?.question || '(Lỗi nội dung)'}
                        </div>
                        {res.errors.length > 0 && (
                          <div className="text-rose-400 font-semibold">{res.errors.join(', ')}</div>
                        )}
                        {res.warnings.length > 0 && (
                          <div className="text-amber-400">{res.warnings.join(', ')}</div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                    <button
                      onClick={() => setImportReport(null)}
                      className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                    >
                      HỦY BỎ
                    </button>
                    <button
                      onClick={handleConfirmImportFile}
                      className="px-6 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs cursor-pointer shadow-lg active:scale-95"
                    >
                      XÁC NHẬN IMPORT ({importReport.validQuestions.length} CÂU)
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Footer Close */}
          <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
            <span>Tổng số: <strong>{questions.length}</strong> câu hỏi trong ngân hàng</span>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>

      {/* Preview Modal (Section 30: XEM TRƯỚC CÂU HỎI) */}
      {previewQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-2xl rounded-3xl bg-slate-900 border-2 border-cyan-400/60 p-6 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
                <Eye className="w-4 h-4" />
                <span>XEM TRƯỚC HIỂN THỊ CÂU HỎI (HỌC SINH THẤY)</span>
              </span>
              <button
                onClick={() => setPreviewQuestion(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-[#0b1633] border border-cyan-500/40 mb-4">
              <h3 className="text-xl font-bold text-white mb-2 leading-relaxed">
                <MathRenderer content={previewQuestion.question} />
              </h3>
              {previewQuestion.image && (
                <img
                  src={previewQuestion.image}
                  alt="Minh họa"
                  className="max-h-48 object-contain rounded-xl mx-auto my-2"
                />
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 text-sm">
              {(['A', 'B', 'C', 'D'] as const).map((opt) => (
                <div
                  key={opt}
                  className={`p-3 rounded-xl border ${
                    previewQuestion.correctAnswer === opt
                      ? 'bg-emerald-950 border-emerald-400 text-emerald-100 font-bold ring-1 ring-emerald-400'
                      : 'bg-slate-950 border-slate-800 text-slate-200'
                  }`}
                >
                  <span className="text-cyan-300 font-bold mr-2">{opt}.</span>
                  <MathRenderer
                    content={previewQuestion[`option${opt}` as keyof Question] as string}
                    inline={true}
                  />
                </div>
              ))}
            </div>

            {previewQuestion.explanation && (
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300">
                <strong className="text-amber-400 block mb-1">💡 Lời giải / Giải thích:</strong>
                <MathRenderer content={previewQuestion.explanation} />
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setPreviewQuestion(null)}
                className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs cursor-pointer"
              >
                ĐÓNG XEM TRƯỚC
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
