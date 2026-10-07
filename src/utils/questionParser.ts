import * as XLSX from 'xlsx';
import mammoth from 'mammoth';
import { Question } from '../types';

export interface ParsedQuestionResult {
  index: number;
  question?: Question;
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface BulkQuestionParseReport {
  validQuestions: Question[];
  results: ParsedQuestionResult[];
  total: number;
  hasErrors: boolean;
}

/**
 * Downloads a standardized Question Bank Excel template (.xlsx)
 */
export function downloadSampleQuestionsExcel() {
  const sampleData = [
    {
      'STT': 1,
      'Môn': 'Toán học',
      'Khối': '11',
      'Chủ đề': 'Giới hạn',
      'Mức độ': 'Nhận biết',
      'Câu hỏi': 'Tính giới hạn $\\lim_{x \\to 0} \\frac{\\sin x}{x}$:',
      'A': '$0$',
      'B': '$1$',
      'C': '$\\infty$',
      'D': '$-1$',
      'Đáp án': 'B',
      'Giải thích': 'Đây là giới hạn lượng giác cơ bản: $\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1$.',
      'Hình ảnh': '',
    },
    {
      'STT': 2,
      'Môn': 'Vật lí',
      'Khối': '10',
      'Chủ đề': 'Động học',
      'Mức độ': 'Thông hiểu',
      'Câu hỏi': 'Vận tốc của chuyển động thẳng biến đổi đều tính theo công thức nào?',
      'A': '$v = v_0 + a \\cdot t$',
      'B': '$v = v_0 - a \\cdot t^2$',
      'C': '$v = v_0 + 2a \\cdot t$',
      'D': '$v = a \\cdot t^2$',
      'Đáp án': 'A',
      'Giải thích': 'Công thức vận tốc tức thời: $v = v_0 + at$ với $a$ là gia tốc không đổi.',
      'Hình ảnh': '',
    },
    {
      'STT': 3,
      'Môn': 'Hóa học',
      'Khối': '10',
      'Chủ đề': 'Phản ứng hóa học',
      'Mức độ': 'Nhận biết',
      'Câu hỏi': 'Phản ứng nào sau đây tạo ra nước?',
      'A': '$2\\text{H}_2 + \\text{O}_2 \\to 2\\text{H}_2\\text{O}$',
      'B': '$\\text{C} + \\text{O}_2 \\to \\text{CO}_2$',
      'C': '$\\text{N}_2 + 3\\text{H}_2 \\to 2\\text{NH}_3$',
      'D': '$\\text{Fe} + \\text{S} \\to \\text{FeS}$',
      'Đáp án': 'A',
      'Giải thích': 'Khí hidro cháy trong oxi tạo thành hơi nước và tỏa nhiều nhiệt.',
      'Hình ảnh': '',
    },
    {
      'STT': 4,
      'Môn': 'Sinh học',
      'Khối': '10',
      'Chủ đề': 'Sinh học phân tử',
      'Mức độ': 'Nhận biết',
      'Câu hỏi': 'Loại đường nào có trong phân tử axit nuclêic ADN?',
      'A': 'Đường Đêôxiribôzơ',
      'B': 'Đường Ribôzơ',
      'C': 'Đường Glucôzơ',
      'D': 'Đường Fructôzơ',
      'Đáp án': 'A',
      'Giải thích': 'Phân tử ADN chứa đường đêôxiribôzơ ($C_5H_{10}O_4$), phân tử ARN chứa đường ribôzơ ($C_5H_{10}O_5$).',
      'Hình ảnh': '',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  worksheet['!cols'] = [
    { wch: 6 }, // STT
    { wch: 12 }, // Môn
    { wch: 8 }, // Khối
    { wch: 15 }, // Chủ đề
    { wch: 12 }, // Mức độ
    { wch: 35 }, // Câu hỏi
    { wch: 18 }, // A
    { wch: 18 }, // B
    { wch: 18 }, // C
    { wch: 18 }, // D
    { wch: 10 }, // Đáp án
    { wch: 35 }, // Giải thích
    { wch: 15 }, // Hình ảnh
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'NganHangCauHoi');
  XLSX.writeFile(workbook, 'Mau_ngan_hang_cau_hoi.xlsx');
}

/**
 * Parses questions from raw pasted text (Section 22)
 * Supports standard format:
 * Câu 1: [Nội dung]
 * A. ...
 * B. ...
 * C. ...
 * D. ...
 * Đáp án: B
 * Giải thích: ...
 */
export function parseBulkTextQuestions(text: string): BulkQuestionParseReport {
  const blocks = text.split(/(?:^|\n)(?=(?:Câu|Bài)\s*\d+[:.]|\b\d+[:.])/gi);
  const results: ParsedQuestionResult[] = [];
  const validQuestions: Question[] = [];

  let questionIndex = 1;

  for (const rawBlock of blocks) {
    const trimmed = rawBlock.trim();
    if (!trimmed) continue;

    const errors: string[] = [];
    const warnings: string[] = [];

    const lines = trimmed.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
    if (lines.length < 3) continue;

    let questionContent = '';
    let optA = '';
    let optB = '';
    let optC = '';
    let optD = '';
    let correctAnswer: 'A' | 'B' | 'C' | 'D' = 'A';
    let explanation = '';

    // First line typically starts with "Câu 1: " or "1. "
    const firstLine = lines[0];
    questionContent = firstLine.replace(/^(?:Câu|Bài)\s*\d+[:.]\s*|^\d+[:.]\s*/i, '').trim();

    // Scan remaining lines
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];

      if (/^A[\.\:]\s*/i.test(line)) {
        optA = line.replace(/^A[\.\:]\s*/i, '').trim();
      } else if (/^B[\.\:]\s*/i.test(line)) {
        optB = line.replace(/^B[\.\:]\s*/i, '').trim();
      } else if (/^C[\.\:]\s*/i.test(line)) {
        optC = line.replace(/^C[\.\:]\s*/i, '').trim();
      } else if (/^D[\.\:]\s*/i.test(line)) {
        optD = line.replace(/^D[\.\:]\s*/i, '').trim();
      } else if (/^(?:Đáp án|ĐA|Answer|Key)[\:\s]/i.test(line)) {
        const match = line.match(/(?:Đáp án|ĐA|Answer|Key)[\:\s]*([A-D])/i);
        if (match) {
          correctAnswer = match[1].toUpperCase() as 'A' | 'B' | 'C' | 'D';
        }
      } else if (/^(?:Giải thích|Lời giải|HD|HDG)[\:\s]/i.test(line)) {
        explanation = line.replace(/^(?:Giải thích|Lời giải|HD|HDG)[\:\s]*/i, '').trim();
      } else if (!optA) {
        // Multi-line question prompt before option A
        questionContent += '\n' + line;
      } else if (explanation) {
        explanation += '\n' + line;
      }
    }

    if (!questionContent) {
      errors.push('Thiếu nội dung câu hỏi');
    }
    if (!optA) errors.push('Thiếu đáp án A');
    if (!optB) errors.push('Thiếu đáp án B');
    if (!optC) warnings.push('Thiếu đáp án C (được đặt mặc định)');
    if (!optD) warnings.push('Thiếu đáp án D (được đặt mặc định)');

    const isValid = errors.length === 0;
    let question: Question | undefined = undefined;

    if (isValid) {
      question = {
        id: `q-bulk-${Date.now()}-${questionIndex}`,
        question: questionContent,
        optionA: optA,
        optionB: optB,
        optionC: optC || 'Không có đáp án C',
        optionD: optD || 'Không có đáp án D',
        correctAnswer,
        explanation: explanation || undefined,
      };
      validQuestions.push(question);
    }

    results.push({
      index: questionIndex++,
      question,
      isValid,
      errors,
      warnings,
    });
  }

  return {
    validQuestions,
    results,
    total: results.length,
    hasErrors: results.some((r) => !r.isValid),
  };
}

/**
 * Parses questions from Excel file (.xlsx, .xls)
 */
export async function parseQuestionsExcel(file: File): Promise<BulkQuestionParseReport> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) throw new Error('File Excel không có sheet nào.');

  const worksheet = workbook.Sheets[sheetName];
  const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

  if (rawRows.length === 0) {
    throw new Error('Sheet Excel trống hoặc không có dòng dữ liệu.');
  }

  const results: ParsedQuestionResult[] = [];
  const validQuestions: Question[] = [];

  rawRows.forEach((row, idx) => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Keys matching (case-insensitive)
    const findVal = (possibleKeys: string[]): string => {
      const rowKeys = Object.keys(row);
      for (const pk of possibleKeys) {
        const found = rowKeys.find((k) => k.trim().toLowerCase() === pk.toLowerCase());
        if (found && row[found] !== undefined && row[found] !== null) {
          return String(row[found]).trim();
        }
      }
      return '';
    };

    const questionText = findVal(['Câu hỏi', 'Cau hoi', 'Question', 'Nội dung', 'Noi dung']);
    const optA = findVal(['A', 'Đáp án A', 'Dap an A', 'Option A']);
    const optB = findVal(['B', 'Đáp án B', 'Dap an B', 'Option B']);
    const optC = findVal(['C', 'Đáp án C', 'Dap an C', 'Option C']);
    const optD = findVal(['D', 'Đáp án D', 'Dap an D', 'Option D']);
    const correctRaw = findVal(['Đáp án', 'Dap an', 'Correct', 'Key', 'Answer']).toUpperCase();
    const explanation = findVal(['Giải thích', 'Giai thich', 'Lời giải', 'Loi giai', 'Explanation']);
    const subject = findVal(['Môn', 'Mon', 'Môn học', 'Subject']);
    const grade = findVal(['Khối', 'Khoi', 'Grade']);
    const topic = findVal(['Chủ đề', 'Chu de', 'Topic']);
    const level = findVal(['Mức độ', 'Muc do', 'Level']) as any;
    const image = findVal(['Hình ảnh', 'Hinh anh', 'Image', 'Hình']);

    if (!questionText) {
      errors.push('Thiếu nội dung câu hỏi');
    }
    if (!optA) errors.push('Thiếu đáp án A');
    if (!optB) errors.push('Thiếu đáp án B');

    let correctAnswer: 'A' | 'B' | 'C' | 'D' = 'A';
    if (['A', 'B', 'C', 'D'].includes(correctRaw)) {
      correctAnswer = correctRaw as 'A' | 'B' | 'C' | 'D';
    } else {
      warnings.push(`Đáp án đúng không rõ ràng (${correctRaw || 'trống'}), mặc định chọn A`);
    }

    const isValid = errors.length === 0;
    let question: Question | undefined = undefined;

    if (isValid) {
      question = {
        id: `q-excel-${Date.now()}-${idx}`,
        question: questionText,
        optionA: optA,
        optionB: optB,
        optionC: optC || 'Không có đáp án C',
        optionD: optD || 'Không có đáp án D',
        correctAnswer,
        explanation: explanation || undefined,
        subject: subject || undefined,
        grade: grade || undefined,
        topic: topic || undefined,
        level: ['Nhận biết', 'Thông hiểu', 'Vận dụng'].includes(level) ? level : undefined,
        image: image || undefined,
      };
      validQuestions.push(question);
    }

    results.push({
      index: idx + 1,
      question,
      isValid,
      errors,
      warnings,
    });
  });

  return {
    validQuestions,
    results,
    total: results.length,
    hasErrors: results.some((r) => !r.isValid),
  };
}

/**
 * Parses questions from Word .docx file using mammoth client-side (Section 24)
 */
export async function parseQuestionsDocx(file: File): Promise<BulkQuestionParseReport> {
  const arrayBuffer = await file.arrayBuffer();
  const { value: rawText } = await mammoth.extractRawText({ arrayBuffer });
  if (!rawText || !rawText.trim()) {
    throw new Error('File Word (.docx) không chứa văn bản.');
  }

  return parseBulkTextQuestions(rawText);
}
