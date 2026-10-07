import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Student,
  Question,
  GameSettings,
  GameState,
  StudentScore,
  HistoryEntry,
} from './types';
import { INITIAL_STUDENTS, INITIAL_QUESTIONS } from './data/initialData';
import { sound } from './utils/sound';
import { fireCelebrationShower, clearAllConfetti } from './utils/confetti';
import { Header } from './components/Header';
import { SlotMachine } from './components/SlotMachine';
import { SlotDigitReel } from './components/SlotDigitReel';
import { QuestionCard } from './components/QuestionCard';
import { HistoryBar } from './components/HistoryBar';
import { SettingsModal } from './components/SettingsModal';
import { StudentsModal } from './components/StudentsModal';
import { QuestionsModal } from './components/QuestionsModal';
import { ResultsModal } from './components/ResultsModal';
import { ArrowLeft, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';

const STORAGE_KEYS = {
  STUDENTS: 'bingo_students_v1',
  QUESTIONS: 'bingo_questions_v1',
  SETTINGS: 'bingo_settings_v1',
  SCORES: 'bingo_scores_v1',
  CALLED_IDS: 'bingo_called_ids_v1',
  USED_Q_IDS: 'bingo_used_q_ids_v1',
  HISTORY: 'bingo_history_v1',
};

const DEFAULT_SETTINGS: GameSettings = {
  appTitle: 'QUAY SỐ THỬ THÁCH',
  appSubtitle: 'QUAY SỐ GỌI TÊN – CHINH PHỤC CÂU HỎI',
  stageBadgeText: 'HỆ THỐNG QUAY SỐ LỚP HỌC',
  numSlots: 3,
  numberSource: 'stt',
  noRepeatStudent: true,
  noRepeatQuestion: true,
  timeLimitSeconds: 15,
  soundEnabled: true,
  confettiEnabled: true,
  pointsPerCorrect: 10,
};

export default function App() {
  // --- Persistent States ---
  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
    } catch {
      return INITIAL_STUDENTS;
    }
  });

  const [questions, setQuestions] = useState<Question[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
      if (!saved) return INITIAL_QUESTIONS;
      const parsed: Question[] = JSON.parse(saved);
      // Auto-enrich pre-existing questions with detailed explanations
      return parsed.map((q) => {
        const found = INITIAL_QUESTIONS.find((iq) => iq.id === q.id);
        if (found && !q.explanation) {
          return { ...q, explanation: found.explanation };
        }
        return q;
      });
    } catch {
      return INITIAL_QUESTIONS;
    }
  });

  const [settings, setSettings] = useState<GameSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [scores, setScores] = useState<Record<string, StudentScore>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SCORES);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [calledStudentIds, setCalledStudentIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CALLED_IDS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [usedQuestionIds, setUsedQuestionIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USED_Q_IDS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HISTORY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // --- Runtime Game States ---
  const [gameState, setGameState] = useState<GameState>('READY');
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  // Default waiting/READY state: "0".repeat(numSlots) (e.g. [0, 0, 0] for 3 slots)
  const [targetDigits, setTargetDigits] = useState<number[]>(() =>
    new Array(settings.numSlots || 3).fill(0)
  );
  const [digitsString, setDigitsString] = useState<string>(() =>
    '0'.repeat(settings.numSlots || 3)
  );
  const transitionTimerRef = useRef<number | null>(null);

  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    };
  }, []);

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isStudentsOpen, setIsStudentsOpen] = useState(false);
  const [isQuestionsOpen, setIsQuestionsOpen] = useState(false);
  const [isResultsOpen, setIsResultsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Sync settings sound with sound engine
  useEffect(() => {
    sound.setEnabled(settings.soundEnabled);
  }, [settings.soundEnabled]);

  // Save changes to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
  }, [questions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SCORES, JSON.stringify(scores));
  }, [scores]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CALLED_IDS, JSON.stringify(calledStudentIds));
  }, [calledStudentIds]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USED_Q_IDS, JSON.stringify(usedQuestionIds));
  }, [usedQuestionIds]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  }, [history]);

  // Sync digits array when slot count changes in READY state (1 -> 0, 2 -> 00, 3 -> 000, 4 -> 0000, etc.)
  useEffect(() => {
    if (gameState === 'READY') {
      const count = settings.numSlots;
      setTargetDigits(new Array(count).fill(0));
      setDigitsString('0'.repeat(count));
    }
  }, [settings.numSlots, gameState]);

  // When active class changes in READY state, ensure machine remains in READY 000
  useEffect(() => {
    if (gameState === 'READY') {
      setCurrentStudent(null);
      setCurrentQuestion(null);
      setTargetDigits(new Array(settings.numSlots).fill(0));
      setDigitsString('0'.repeat(settings.numSlots));
    }
  }, [settings.activeClass]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  // Extract digits for a student according to settings.numberSource and settings.numSlots
  const getDigitsForStudent = useCallback(
    (student: Student, slotCount: number): { digitsArr: number[]; digitsStr: string } => {
      let rawStr = '';
      if (settings.numberSource === 'stt') {
        // e.g. "025" or "25"
        rawStr = student.stt.replace(/\D/g, '');
      } else {
        // 3 or N last digits of student code, e.g. HS2026025 -> 025
        const digitsOnly = student.code.replace(/\D/g, '');
        rawStr = digitsOnly.slice(-slotCount);
      }

      // Pad or slice to exactly slotCount
      let padded = rawStr.padStart(slotCount, '0');
      if (padded.length > slotCount) {
        padded = padded.slice(-slotCount);
      }

      const digitsArr = padded.split('').map((c) => parseInt(c, 10) || 0);
      return { digitsArr, digitsStr: padded };
    },
    [settings.numberSource]
  );

  const formatStudentDisplayCode = useCallback(
    (code: string, stt: string): string => {
      if (settings.numberSource === 'stt') {
        return `STT ${stt}`;
      }
      if (code.length > 5) {
        return `${code.slice(0, 2)}***${code.slice(-2)}`;
      }
      return code;
    },
    [settings.numberSource]
  );

  const currentTurnNumber = useMemo(() => {
    if (gameState === 'READY') {
      return history.length + 1;
    }
    return Math.max(1, history.length);
  }, [gameState, history.length]);

  // Distinct classes in students list
  const distinctClasses = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => {
      if (s.className) set.add(s.className);
    });
    return Array.from(set);
  }, [students]);

  // Active class pool of students (Requirement 8: Máy quay chỉ lấy học sinh thuộc lớp đang chọn)
  const activeClassStudents = useMemo(() => {
    if (!settings.activeClass || settings.activeClass === 'ALL') {
      return students;
    }
    const filtered = students.filter((s) => s.className === settings.activeClass);
    return filtered.length > 0 ? filtered : students;
  }, [students, settings.activeClass]);

  // Available students list (filtered by active class and uncalled if noRepeatStudent)
  const availableStudents = useMemo(() => {
    if (!settings.noRepeatStudent) {
      return activeClassStudents;
    }
    const uncalled = activeClassStudents.filter((s) => !calledStudentIds.includes(s.id));
    return uncalled.length > 0 ? uncalled : activeClassStudents;
  }, [activeClassStudents, calledStudentIds, settings.noRepeatStudent]);

  // Available questions list
  const availableQuestions = useMemo(() => {
    if (!settings.noRepeatQuestion) {
      return questions;
    }
    const unused = questions.filter((q) => !usedQuestionIds.includes(q.id));
    return unused.length > 0 ? unused : questions;
  }, [questions, usedQuestionIds, settings.noRepeatQuestion]);

  // Start spinning
  const handleStartSpin = useCallback(() => {
    if (gameState === 'SPINNING') return;
    if (students.length === 0) {
      alert('Danh sách học sinh đang trống! Vui lòng import Excel hoặc thêm học sinh trước.');
      setIsStudentsOpen(true);
      return;
    }
    if (activeClassStudents.length === 0) {
      alert(`Không có học sinh nào thuộc lớp ${settings.activeClass || ''}! Vui lòng chọn lớp khác.`);
      setIsStudentsOpen(true);
      return;
    }
    if (questions.length === 0) {
      alert('Ngân hàng câu hỏi đang trống! Vui lòng thêm câu hỏi trước.');
      setIsQuestionsOpen(true);
      return;
    }

    if (settings.noRepeatStudent && availableStudents.length === 0) {
      const clsName = settings.activeClass && settings.activeClass !== 'ALL' ? `lớp ${settings.activeClass}` : 'danh sách';
      if (confirm(`Đã gọi hết tất cả học sinh trong ${clsName}! Bạn có muốn đặt lại lượt quay không?`)) {
        setCalledStudentIds([]);
      }
      return;
    }

    // 1. Pick Student strictly from available pool
    const pool = availableStudents;
    const chosenStudent = pool[Math.floor(Math.random() * pool.length)];

    // 2. Pick Question strictly from available questions
    const qPool = availableQuestions;
    const chosenQuestion = qPool[Math.floor(Math.random() * qPool.length)];

    // 3. Compute exact target digits that the slots must land on
    const { digitsArr, digitsStr } = getDigitsForStudent(chosenStudent, settings.numSlots);

    setCurrentStudent(chosenStudent);
    setCurrentQuestion(chosenQuestion);
    setTargetDigits(digitsArr);
    setDigitsString(digitsStr);

    // Switch state
    setGameState('SPINNING');
  }, [gameState, students.length, questions.length, availableStudents, availableQuestions, getDigitsForStudent, settings.numSlots]);

  // Triggered when the last slot reel has locked
  const handleSpinComplete = useCallback(() => {
    if (!currentStudent) return;

    setGameState('STUDENT_SELECTED');

    // Hiệu ứng hoa chúc mừng khi chọn được học sinh
    if (settings.confettiEnabled) {
      fireCelebrationShower();
    }

    // Mark student as called
    setCalledStudentIds((prev) => {
      if (prev.includes(currentStudent.id)) return prev;
      return [...prev, currentStudent.id];
    });

    // Add to history
    const entry: HistoryEntry = {
      id: `hist-${Date.now()}`,
      numberStr: digitsString,
      studentName: currentStudent.name,
      className: currentStudent.className,
      studentCode: currentStudent.code,
      timestamp: Date.now(),
    };
    setHistory((prev) => [...prev, entry]);

    // Mandatory Requirement 11, 12, 13:
    // Giữ vinh danh khoảng 5 giây. TUYỆT ĐỐI KHÔNG DÙNG COUNTDOWN 5-4-3-2-1.
    // Trước khi câu hỏi xuất hiện: DỪNG + XÓA TOÀN BỘ CONFETTI!
    if (transitionTimerRef.current) {
      clearTimeout(transitionTimerRef.current);
    }

    transitionTimerRef.current = window.setTimeout(() => {
      clearAllConfetti();
      setGameState('QUESTION');
    }, 5000);
  }, [currentStudent, digitsString, settings.confettiEnabled]);

  // Cho phép giáo viên bấm bỏ qua để vào ngay câu hỏi nếu không muốn đợi đủ 5s
  const handleSkipReveal = useCallback(() => {
    if (transitionTimerRef.current) {
      clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }
    clearAllConfetti();
    setGameState('QUESTION');
  }, []);

  // Handle Question Answer Submission
  const handleAnswerSubmit = (isCorrect: boolean, chosenOption: 'A' | 'B' | 'C' | 'D' | null) => {
    if (!currentStudent || !currentQuestion) return;

    setGameState('ANSWERED');

    // Update session score
    const studentId = currentStudent.id;
    setScores((prev) => {
      const existing = prev[studentId] || {
        studentId,
        stt: currentStudent.stt,
        code: currentStudent.code,
        name: currentStudent.name,
        className: currentStudent.className,
        timesCalled: 0,
        correctCount: 0,
        wrongCount: 0,
        totalScore: 0,
        lastUpdated: Date.now(),
      };

      const updatedScore: StudentScore = {
        ...existing,
        timesCalled: existing.timesCalled + 1,
        correctCount: isCorrect ? existing.correctCount + 1 : existing.correctCount,
        wrongCount: !isCorrect ? existing.wrongCount + 1 : existing.wrongCount,
        totalScore: isCorrect
          ? existing.totalScore + settings.pointsPerCorrect
          : existing.totalScore,
        lastUpdated: Date.now(),
      };

      return {
        ...prev,
        [studentId]: updatedScore,
      };
    });

    // Mark question as used
    setUsedQuestionIds((prev) => {
      if (prev.includes(currentQuestion.id)) return prev;
      return [...prev, currentQuestion.id];
    });

    // Update history entry with result
    setHistory((prev) => {
      if (prev.length === 0) return prev;
      const last = { ...prev[prev.length - 1] };
      last.result = chosenOption === null ? 'timeout' : isCorrect ? 'correct' : 'wrong';
      return [...prev.slice(0, -1), last];
    });
  };

  // Re-roll question for current student if teacher needs
  const handleRerollQuestion = () => {
    if (questions.length <= 1) return;
    const candidates = questions.filter((q) => q.id !== currentQuestion?.id);
    const nextQ = candidates[Math.floor(Math.random() * candidates.length)];
    setCurrentQuestion(nextQ);
  };

  // Next spin button (QUAY LƯỢT TIẾP) - Returns machine to READY 000 state before next spin
  const handleNextTurn = () => {
    setGameState('READY');
    setCurrentStudent(null);
    setCurrentQuestion(null);
    setTargetDigits(new Array(settings.numSlots).fill(0));
    setDigitsString('0'.repeat(settings.numSlots));
  };

  // Reset called turns
  const handleResetCalledTurn = () => {
    if (confirm('Đặt lại lượt quay? Toàn bộ học sinh sẽ sẵn sàng để được gọi lại.')) {
      setCalledStudentIds([]);
      if (gameState === 'READY') {
        setCurrentStudent(null);
        setCurrentQuestion(null);
        setTargetDigits(new Array(settings.numSlots).fill(0));
        setDigitsString('0'.repeat(settings.numSlots));
      }
    }
  };

  // Reset entire session
  const handleResetSession = () => {
    setScores({});
    setCalledStudentIds([]);
    setUsedQuestionIds([]);
    setHistory([]);
    setCurrentStudent(null);
    setCurrentQuestion(null);
    setGameState('READY');
    setTargetDigits(new Array(settings.numSlots).fill(0));
    setDigitsString('0'.repeat(settings.numSlots));
  };

  // Global Keyboard listener for Space bar to spin when in READY state, or advance when in STUDENT_SELECTED
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }
      if (e.code === 'Space' && gameState === 'READY') {
        e.preventDefault();
        handleStartSpin();
      } else if ((e.code === 'Space' || e.key === 'Enter') && gameState === 'STUDENT_SELECTED') {
        e.preventDefault();
        handleSkipReveal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, handleStartSpin, handleSkipReveal]);

  return (
    <div className="min-h-screen flex flex-col bg-[#050b1a] text-slate-100 selection:bg-cyan-500 selection:text-black overflow-x-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Dynamic Stage Lighting Background */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_30%,#152e6d_0%,#091539_45%,#040817_100%)] z-0" />
      <div className="fixed inset-0 pointer-events-none opacity-20 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] z-0" />

      {/* Top Header */}
      <Header
        appTitle={settings.appTitle || 'QUAY SỐ THỬ THÁCH'}
        appSubtitle={settings.appSubtitle || 'QUAY SỐ GỌI TÊN – CHINH PHỤC CÂU HỎI'}
        soundEnabled={settings.soundEnabled}
        onToggleSound={() =>
          setSettings((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }))
        }
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenStudents={() => setIsStudentsOpen(true)}
        onOpenQuestions={() => setIsQuestionsOpen(true)}
        onOpenResults={() => setIsResultsOpen(true)}
        isSpinning={gameState === 'SPINNING'}
      />

      {/* Main Game Stage */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-4 sm:py-6">
        {/* All Students Called Alert */}
        {settings.noRepeatStudent &&
          calledStudentIds.filter((id) => activeClassStudents.some((s) => s.id === id)).length >= activeClassStudents.length &&
          activeClassStudents.length > 0 &&
          gameState === 'READY' && (
            <div className="mb-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-950/70 border border-amber-500/50 text-amber-200 text-xs sm:text-sm animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Đã gọi hết tất cả học sinh trong {settings.activeClass && settings.activeClass !== 'ALL' ? `lớp ${settings.activeClass}` : 'danh sách'}! Nhấn</span>
              <button
                onClick={handleResetCalledTurn}
                className="font-bold underline text-white hover:text-cyan-300"
              >
                Đặt lại lượt
              </button>
              <span>để bắt đầu vòng mới.</span>
            </div>
          )}

        {/* STATE 1: SLOT DRUM AS PRIMARY HERO (READY / SPINNING / STUDENT_SELECTED - IMAGES 1 & 2) */}
        {(gameState === 'READY' ||
          gameState === 'SPINNING' ||
          gameState === 'STUDENT_SELECTED') && (
          <div className="w-full max-w-4xl flex flex-col items-center justify-center animate-in fade-in duration-300">
            {/* Header Lockup Above Slots - EXACTLY AS IN IMAGE 1 & 2 */}
            <div className="text-center mb-3 sm:mb-5 min-h-[90px] flex flex-col items-center justify-center">
              {/* LƯỢT X • LỚP */}
              <div className="text-xs sm:text-sm font-extrabold tracking-widest uppercase text-cyan-400 mb-1.5 flex items-center justify-center gap-2 flex-wrap">
                <span>LƯỢT {currentTurnNumber}</span>
                <span>•</span>
                {distinctClasses.length > 1 ? (
                  <div className="inline-flex items-center gap-1.5 bg-slate-900/90 border border-slate-700/80 px-2.5 py-0.5 rounded-lg text-cyan-300">
                    <span className="text-[11px] text-slate-400 font-bold">LỚP:</span>
                    <select
                      value={settings.activeClass || 'ALL'}
                      onChange={(e) => setSettings((s) => ({ ...s, activeClass: e.target.value }))}
                      disabled={gameState === 'SPINNING'}
                      className="bg-transparent text-cyan-300 font-extrabold focus:outline-none cursor-pointer"
                    >
                      <option value="ALL" className="bg-slate-900 text-white">Tất cả ({students.length} HS)</option>
                      {distinctClasses.map((cls) => {
                        const count = students.filter((s) => s.className === cls).length;
                        return (
                          <option key={cls} value={cls} className="bg-slate-900 text-white">
                            Lớp {cls} ({count} HS)
                          </option>
                        );
                      })}
                    </select>
                  </div>
                ) : (
                  <span>LỚP {currentStudent?.className || students[0]?.className || '11A4'}</span>
                )}
              </div>

              {/* Student Name Display in Grand Typography */}
              {gameState === 'STUDENT_SELECTED' && currentStudent ? (
                <div className="animate-in fade-in zoom-in-95 duration-400">
                  <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-wide uppercase drop-shadow-[0_4px_24px_rgba(6,182,212,0.9)] flex flex-wrap items-center justify-center gap-3">
                    <span>{currentStudent.name}</span>
                    <span className="font-mono text-cyan-300 text-2xl sm:text-4xl md:text-5xl font-extrabold">
                      {formatStudentDisplayCode(currentStudent.code, currentStudent.stt)}
                    </span>
                  </h2>
                </div>
              ) : gameState === 'SPINNING' ? (
                <div className="text-2xl sm:text-4xl font-extrabold text-cyan-300 tracking-wider uppercase animate-pulse">
                  ĐANG BỐC THĂM...
                </div>
              ) : (
                <div className="text-2xl sm:text-4xl font-extrabold text-slate-300 tracking-wider uppercase">
                  CHUẨN BỊ BỐC THĂM
                </div>
              )}
            </div>

            {/* Slot Machine with Celebratory Shapes directly over reels (Image 2) */}
            <SlotMachine
              digits={targetDigits}
              isSpinning={gameState === 'SPINNING'}
              isCelebrating={gameState === 'STUDENT_SELECTED'}
              onSpin={handleStartSpin}
              onSkipReveal={handleSkipReveal}
              numSlots={settings.numSlots}
              onNumSlotsChange={(n) => setSettings((s) => ({ ...s, numSlots: n }))}
              onSpinComplete={handleSpinComplete}
              confettiEnabled={settings.confettiEnabled}
              disabled={students.length === 0}
            />
          </div>
        )}

        {/* STATE 2: QUESTION CHALLENGE STAGE (EXACTLY AS IN IMAGE 3) */}
        {(gameState === 'QUESTION' || gameState === 'ANSWERED') &&
          currentStudent &&
          currentQuestion && (
            <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-stretch gap-6 animate-in fade-in slide-in-from-bottom-6 duration-400">
              {/* Left Column: Student Winner & Compact Reels (Image 3 Left Zone) */}
              <div className="lg:w-80 shrink-0 flex flex-col justify-between p-6 rounded-3xl bg-gradient-to-b from-[#0e1d42] to-[#07112a] border-2 border-cyan-500/40 shadow-2xl backdrop-blur-xl">
                <div>
                  <div className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-1">
                    LƯỢT {currentTurnNumber}
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-white tracking-wide uppercase leading-tight mb-1">
                    {currentStudent.name}
                  </h3>
                  <div className="font-mono text-cyan-300 font-bold text-sm mb-4">
                    {formatStudentDisplayCode(currentStudent.code, currentStudent.stt)} • Lớp {currentStudent.className}
                  </div>

                  {/* Compact Slot Reels Display (As in Image 3) */}
                  <div className="mt-4 pt-4 border-t border-slate-700/60">
                    <div className="text-xs text-slate-400 font-semibold mb-2.5 uppercase tracking-wider">
                      Số may mắn:
                    </div>
                    <div className="flex items-center gap-2">
                      {targetDigits.map((digit, idx) => (
                        <SlotDigitReel
                          key={`compact-${idx}`}
                          digit={digit}
                          isSpinning={false}
                          reelIndex={idx}
                          totalReels={targetDigits.length}
                          compact={true}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Return button at bottom */}
                <div className="mt-6 pt-4 border-t border-slate-800">
                  <button
                    onClick={handleNextTurn}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4 text-cyan-400" />
                    <span>Màn hình quay số</span>
                  </button>
                </div>
              </div>

              {/* Right Column: Question Card with Prompt & Options (Image 3 Right Zone) */}
              <div className="flex-1 min-w-0">
                <QuestionCard
                  question={currentQuestion}
                  student={currentStudent}
                  digitsStr={digitsString}
                  timeLimit={settings.timeLimitSeconds}
                  pointsPerCorrect={settings.pointsPerCorrect}
                  confettiEnabled={settings.confettiEnabled}
                  onAnswerSubmit={handleAnswerSubmit}
                  onNextSpin={handleNextTurn}
                  onRerollQuestion={handleRerollQuestion}
                />
              </div>
            </div>
          )}
      </main>

      {/* History and Status Bottom Bar */}
      <HistoryBar
        history={history}
        calledCount={calledStudentIds.length}
        totalStudents={students.length}
        onResetTurn={handleResetCalledTurn}
        isSpinning={gameState === 'SPINNING'}
      />

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={(newVals) => setSettings((prev) => ({ ...prev, ...newVals }))}
      />

      <StudentsModal
        isOpen={isStudentsOpen}
        onClose={() => setIsStudentsOpen(false)}
        students={students}
        onUpdateStudents={setStudents}
        numSlots={settings.numSlots}
        activeClass={settings.activeClass || 'ALL'}
        onSelectActiveClass={(cls) => setSettings((prev) => ({ ...prev, activeClass: cls }))}
        onStartSpinningNow={() => {
          setIsStudentsOpen(false);
          setGameState('READY');
          setCurrentStudent(null);
          setCurrentQuestion(null);
          setTargetDigits(new Array(settings.numSlots).fill(0));
          setDigitsString('0'.repeat(settings.numSlots));
        }}
      />

      <QuestionsModal
        isOpen={isQuestionsOpen}
        onClose={() => setIsQuestionsOpen(false)}
        questions={questions}
        onUpdateQuestions={setQuestions}
      />

      <ResultsModal
        isOpen={isResultsOpen}
        onClose={() => setIsResultsOpen(false)}
        scores={scores}
        onResetSession={handleResetSession}
      />
    </div>
  );
}
