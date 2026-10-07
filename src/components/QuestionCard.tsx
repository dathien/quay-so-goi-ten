import React, { useEffect, useState, useRef } from 'react';
import { Question, Student } from '../types';
import { sound } from '../utils/sound';
import { fireConfetti, clearAllConfetti } from '../utils/confetti';
import { MathRenderer } from './MathRenderer';
import {
  Timer,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  RotateCw,
  Lightbulb,
  Maximize2,
  X,
} from 'lucide-react';

interface QuestionCardProps {
  question: Question;
  student: Student;
  digitsStr: string;
  timeLimit: number; // in seconds
  pointsPerCorrect: number;
  confettiEnabled: boolean;
  onAnswerSubmit: (isCorrect: boolean, chosenOption: 'A' | 'B' | 'C' | 'D' | null) => void;
  onNextSpin: () => void;
  onRerollQuestion: () => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  student,
  digitsStr,
  timeLimit,
  pointsPerCorrect,
  confettiEnabled,
  onAnswerSubmit,
  onNextSpin,
  onRerollQuestion,
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(timeLimit);
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isTimeOut, setIsTimeOut] = useState<boolean>(false);
  const [timerStarted, setTimerStarted] = useState<boolean>(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  const timerRef = useRef<number | null>(null);

  // Mandatory Requirement 13: Stop and clear all confetti when Question component mounts!
  useEffect(() => {
    clearAllConfetti();
  }, []);

  // Timer starts only after question renders (350ms delay)
  useEffect(() => {
    setTimeLeft(timeLimit);
    setSelectedOption(null);
    setIsAnswered(false);
    setIsTimeOut(false);
    setTimerStarted(false);

    const startTimeout = window.setTimeout(() => {
      setTimerStarted(true);
    }, 350);

    return () => clearTimeout(startTimeout);
  }, [question.id, timeLimit]);

  // Countdown timer loop
  useEffect(() => {
    if (!timerStarted || isAnswered || isTimeOut) return;

    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleTimeOut();
          return 0;
        }

        const nextVal = prev - 1;
        if (nextVal <= 5) {
          sound.playTimerTick(true);
        } else {
          sound.playTimerTick(false);
        }
        return nextVal;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerStarted, isAnswered, isTimeOut]);

  const handleTimeOut = () => {
    setIsTimeOut(true);
    setIsAnswered(true);
    sound.playTimeUp();
    onAnswerSubmit(false, null);
  };

  const handleSelectOption = (opt: 'A' | 'B' | 'C' | 'D') => {
    if (isAnswered || isTimeOut) return;

    if (timerRef.current) clearInterval(timerRef.current);
    setSelectedOption(opt);
    setIsAnswered(true);

    const isCorrect = opt === question.correctAnswer;
    if (isCorrect) {
      sound.playCorrect();
      if (confettiEnabled) {
        // Requirement 16: ONLY NOW fire confetti for the 2nd time! Short burst 1-1.5s
        fireConfetti('correct');
      }
    } else {
      sound.playWrong();
      // Requirement 17: NO confetti on wrong answer
      clearAllConfetti();
    }

    onAnswerSubmit(isCorrect, opt);
  };

  // Keyboard shortcut listener: A/B/C/D or 1/2/3/4 to choose, Space/Enter for next turn
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (!isAnswered) {
        const key = e.key.toUpperCase();
        if (key === 'A' || key === '1') handleSelectOption('A');
        else if (key === 'B' || key === '2') handleSelectOption('B');
        else if (key === 'C' || key === '3') handleSelectOption('C');
        else if (key === 'D' || key === '4') handleSelectOption('D');
      } else {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          onNextSpin();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnswered, question.correctAnswer, onNextSpin]);

  const options: Array<{
    key: 'A' | 'B' | 'C' | 'D';
    label: string;
    image?: string;
  }> = [
    { key: 'A', label: question.optionA, image: question.imageA },
    { key: 'B', label: question.optionB, image: question.imageB },
    { key: 'C', label: question.optionC, image: question.imageC },
    { key: 'D', label: question.optionD, image: question.imageD },
  ];

  const isUrgent = timeLeft <= 5 && !isAnswered;
  const progressPercent = Math.max(0, Math.min(100, (timeLeft / timeLimit) * 100));

  return (
    <>
      <div className="w-full max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-400">
        {/* Top Header: Requirement 14 -> 025 • NGUYỄN MINH KHANG • 11A4 + Timer 15s */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900/95 via-[#0b1633]/95 to-slate-900/95 border border-cyan-500/40 shadow-xl backdrop-blur-md mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-mono font-black text-slate-950 text-base shadow-md">
              {digitsStr}
            </div>
            <div>
              <div className="text-lg sm:text-2xl font-black text-white tracking-wide uppercase">
                {student.name}
              </div>
              <div className="text-xs text-cyan-300 font-semibold">
                Lớp {student.className} • {student.code}
              </div>
            </div>
          </div>

          {/* Countdown Clock Badge */}
          <div
            className={`flex items-center gap-2.5 px-4 py-2 rounded-xl border font-mono font-bold transition-all duration-300
              ${
                isTimeOut
                  ? 'bg-rose-950/80 border-rose-500 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                  : isUrgent
                  ? 'bg-amber-950/80 border-amber-400 text-amber-300 animate-pulse shadow-[0_0_15px_rgba(251,191,36,0.3)]'
                  : 'bg-slate-800/90 border-cyan-500/40 text-cyan-300'
              }
            `}
          >
            {isTimeOut ? (
              <Clock className="w-5 h-5 text-rose-400 animate-bounce" />
            ) : (
              <Timer className={`w-5 h-5 ${isUrgent ? 'text-amber-400' : 'text-cyan-400'}`} />
            )}
            <span className="text-lg sm:text-2xl tabular-nums">
              {timeLeft}s
            </span>
          </div>
        </div>

        {/* Timer Progress Bar */}
        <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden mb-5 border border-slate-700/60 shadow-inner">
          <div
            style={{ width: `${progressPercent}%` }}
            className={`h-full transition-all duration-1000 ease-linear rounded-full
              ${
                isUrgent
                  ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                  : 'bg-gradient-to-r from-cyan-400 via-blue-500 to-emerald-400'
              }
            `}
          />
        </div>

        {/* Question Prompt Box */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#0e1c3c] to-[#09132b] border-2 border-cyan-500/40 shadow-2xl mb-5 relative overflow-hidden">
          <div className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-3 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="bg-cyan-500/20 px-2 py-0.5 rounded text-cyan-300 border border-cyan-500/30">
                {question.subject || 'CÂU HỎI THỬ THÁCH'}
              </span>
              {question.level && (
                <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300 border border-slate-700">
                  {question.level}
                </span>
              )}
            </span>

            <button
              onClick={onRerollQuestion}
              disabled={isAnswered}
              className="flex items-center gap-1.5 text-slate-400 hover:text-cyan-300 text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title="Đổi câu hỏi khác"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Đổi câu hỏi</span>
            </button>
          </div>

          {/* Question Text (with STEM KaTeX Formula Support) */}
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white leading-relaxed tracking-wide">
            <MathRenderer content={question.question} />
          </h3>

          {/* Question Diagram / Image if attached */}
          {question.image && (
            <div className="mt-4 relative group max-w-lg mx-auto rounded-2xl overflow-hidden border border-cyan-500/30 bg-slate-950/60 p-2 shadow-inner">
              <img
                src={question.image}
                alt="Minh họa câu hỏi"
                className="w-full max-h-72 object-contain mx-auto rounded-xl transition-transform group-hover:scale-[1.01]"
              />
              <button
                onClick={() => setZoomedImage(question.image || null)}
                className="absolute top-4 right-4 bg-slate-900/80 hover:bg-cyan-500 hover:text-slate-950 text-white p-2 rounded-xl border border-slate-700 transition-colors shadow-md cursor-pointer"
                title="Phóng to hình ảnh"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Answer Options Grid (Desktop: 2x2, Mobile: 1 col) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4 mb-6">
          {options.map(({ key, label, image }) => {
            const isSelected = selectedOption === key;
            const isCorrectAnswer = question.correctAnswer === key;

            let btnStyle =
              'bg-slate-900/90 hover:bg-slate-850 border-slate-700/80 text-slate-100 hover:border-cyan-400/60 shadow-md';

            if (isAnswered) {
              if (isCorrectAnswer) {
                btnStyle =
                  'bg-emerald-950/90 border-emerald-400 text-emerald-100 ring-2 ring-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.4)]';
              } else if (isSelected && !isCorrectAnswer) {
                btnStyle =
                  'bg-rose-950/90 border-rose-500 text-rose-200 ring-2 ring-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.3)]';
              } else {
                btnStyle = 'bg-slate-900/40 border-slate-800 text-slate-500 opacity-60';
              }
            }

            return (
              <button
                key={key}
                onClick={() => handleSelectOption(key)}
                disabled={isAnswered}
                className={`group flex items-start text-left gap-3.5 p-4 sm:p-5 rounded-2xl border-2 transition-all duration-200 cursor-pointer
                  ${btnStyle}
                  ${!isAnswered ? 'active:scale-[0.99] hover:shadow-lg' : 'cursor-default'}
                `}
              >
                {/* Option Letter Tag */}
                <span
                  className={`w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-xl flex items-center justify-center font-extrabold text-base sm:text-lg transition-colors
                    ${
                      isAnswered && isCorrectAnswer
                        ? 'bg-emerald-500 text-slate-950 shadow-md'
                        : isAnswered && isSelected && !isCorrectAnswer
                        ? 'bg-rose-500 text-white shadow-md'
                        : 'bg-slate-800 border border-slate-700 text-cyan-300 group-hover:bg-cyan-500 group-hover:text-slate-950'
                    }
                  `}
                >
                  {key}
                </span>

                {/* Option Content (Supports Math & Image) */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="text-base sm:text-lg font-medium text-balance">
                    <MathRenderer content={label} />
                  </div>
                  {image && (
                    <div className="mt-2 rounded-xl overflow-hidden border border-slate-700 max-h-36 bg-black/40">
                      <img
                        src={image}
                        alt={`Đáp án ${key}`}
                        className="w-full h-32 object-contain"
                      />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Answer Feedback Banner (Requirement 16, 17, 18) */}
        {isAnswered && (
          <div className="animate-in fade-in zoom-in-95 duration-300 flex flex-col sm:flex-row items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-[#0d1c3a] to-slate-900 border-2 border-cyan-500/40 shadow-2xl mb-4">
            <div className="flex items-center gap-3.5 text-center sm:text-left">
              {selectedOption === question.correctAnswer ? (
                <>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-400 shrink-0 shadow-lg">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-black text-emerald-400 tracking-wide uppercase">
                      ✓ CHÍNH XÁC! +{pointsPerCorrect} ĐIỂM
                    </div>
                    <div className="text-xs sm:text-sm text-slate-200 mt-0.5">
                      🎉 XUẤT SẮC, <strong>{student.name}</strong>!
                    </div>
                  </div>
                </>
              ) : isTimeOut ? (
                <>
                  <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-400 flex items-center justify-center text-rose-400 shrink-0 shadow-lg">
                    <Clock className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-black text-rose-400 tracking-wide uppercase">
                      ⏱ HẾT GIỜ!
                    </div>
                    <div className="text-xs sm:text-sm text-slate-300 mt-0.5">
                      Đáp án đúng là: <strong className="text-emerald-400 font-bold">{question.correctAnswer}</strong>.
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-400 flex items-center justify-center text-rose-400 shrink-0 shadow-lg">
                    <XCircle className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-black text-rose-400 tracking-wide uppercase">
                      ✕ CHƯA CHÍNH XÁC
                    </div>
                    <div className="text-xs sm:text-sm text-slate-300 mt-0.5">
                      Đáp án đúng là: <strong className="text-emerald-400 font-bold">{question.correctAnswer}</strong>.
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Requirement 19: [ 🎲 QUAY LƯỢT TIẾP ] button */}
            <button
              onClick={onNextSpin}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl font-black text-base sm:text-lg text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 shadow-[0_0_25px_rgba(6,182,212,0.45)] active:scale-95 transition-all cursor-pointer whitespace-nowrap"
            >
              <span>🎲 QUAY LƯỢT TIẾP</span>
              <ArrowRight className="w-5 h-5 text-slate-950" />
            </button>
          </div>
        )}

        {/* Detailed Explanation Box (Requirement 19) */}
        {isAnswered && (question.explanation || question.explanationImage) && (
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-blue-950/70 via-indigo-950/60 to-slate-900/80 border border-cyan-500/40 shadow-xl animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shrink-0 shadow-sm">
                <Lightbulb className="w-5 h-5 text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-black text-cyan-300 uppercase tracking-wider mb-1 flex items-center gap-2">
                  <span>💡 GIẢI THÍCH ĐÁP ÁN</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-emerald-400 font-bold">
                    Đáp án đúng: {question.correctAnswer}
                  </span>
                </div>
                {question.explanation && (
                  <div className="text-sm sm:text-base text-slate-200 leading-relaxed font-normal mt-1">
                    <MathRenderer content={question.explanation} />
                  </div>
                )}
                {question.explanationImage && (
                  <div className="mt-3 relative group max-w-md rounded-xl overflow-hidden border border-slate-700 bg-black/40 p-2">
                    <img
                      src={question.explanationImage}
                      alt="Hình minh họa lời giải"
                      className="w-full max-h-60 object-contain mx-auto rounded-lg"
                    />
                    <button
                      onClick={() => setZoomedImage(question.explanationImage || null)}
                      className="absolute top-3 right-3 bg-slate-900/80 hover:bg-cyan-500 hover:text-slate-950 text-white p-1.5 rounded-lg border border-slate-700 cursor-pointer"
                      title="Phóng to hình"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Image Zoom Modal */}
      {zoomedImage && (
        <div
          onClick={() => setZoomedImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in cursor-zoom-out"
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={zoomedImage}
              alt="Hình ảnh phóng to"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl border-2 border-cyan-400/60 shadow-2xl"
            />
            <button
              onClick={() => setZoomedImage(null)}
              className="absolute -top-3 -right-3 w-9 h-9 rounded-full bg-slate-900 border border-cyan-400 text-white flex items-center justify-center hover:bg-rose-600 transition-colors cursor-pointer shadow-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
