export interface Student {
  id: string; // unique ID
  stt: string; // e.g. "001", "025"
  code: string; // e.g. "HS2026025"
  name: string; // e.g. "Nguyễn Minh Khang"
  className: string; // e.g. "11A4"
}

export interface Question {
  id: string;
  question: string;
  subject?: string; // Môn học: Toán, Vật lí, Hóa học, Sinh học, Tin học...
  grade?: string; // Khối: 10, 11, 12, Trung cấp
  topic?: string; // Chủ đề
  level?: 'Nhận biết' | 'Thông hiểu' | 'Vận dụng';
  image?: string; // Hình ảnh câu hỏi (URL hoặc Base64)
  optionA: string;
  imageA?: string;
  optionB: string;
  imageB?: string;
  optionC: string;
  imageC?: string;
  optionD: string;
  imageD?: string;
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation?: string; // Giải thích chi tiết đáp án
  explanationImage?: string; // Hình ảnh minh họa lời giải
}

export interface StudentScore {
  studentId: string;
  stt: string;
  code: string;
  name: string;
  className: string;
  timesCalled: number;
  correctCount: number;
  wrongCount: number;
  totalScore: number;
  lastUpdated: number;
}

export type NumberSource = 'stt' | 'code_last';

export interface GameSettings {
  appTitle?: string; // e.g. "BINGO CLASSROOM"
  appSubtitle?: string; // e.g. "QUAY SỐ – CHINH PHỤC THỬ THÁCH"
  stageBadgeText?: string; // e.g. "HỆ THỐNG QUAY SỐ THỬ THÁCH"
  activeClass?: string; // e.g. 'ALL' or '11A4' (Lớp đang chơi)
  numSlots: number; // 1 to 6, default 3
  numberSource: NumberSource; // 'stt' or 'code_last'
  noRepeatStudent: boolean; // default true
  noRepeatQuestion: boolean; // default true
  timeLimitSeconds: number; // default 15
  soundEnabled: boolean; // default true
  confettiEnabled: boolean; // default true
  pointsPerCorrect: number; // default 10
  questionFilterSubject?: string; // Bộ lọc môn học
  questionFilterGrade?: string; // Bộ lọc khối
  questionFilterLevel?: string; // Bộ lọc mức độ
}

export type GameState = 
  | 'READY'
  | 'SPINNING'
  | 'STUDENT_SELECTED'
  | 'QUESTION'
  | 'ANSWERED';

export interface HistoryEntry {
  id: string;
  numberStr: string;
  studentName: string;
  className: string;
  studentCode: string;
  timestamp: number;
  result?: 'correct' | 'wrong' | 'timeout';
}
