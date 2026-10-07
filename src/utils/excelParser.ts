import * as XLSX from 'xlsx';
import { Student } from '../types';

export interface ColumnMapping {
  sttCol: string;
  codeCol: string;
  nameCol: string;
  classCol: string;
}

export interface ParsedRowResult {
  rowNumber: number;
  raw: Record<string, any>;
  student?: Student;
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ExcelParseResult {
  sheetName: string;
  headers: string[];
  totalRows: number;
  validRows: Student[];
  rowResults: ParsedRowResult[];
  detectedClasses: string[];
  autoMapping: ColumnMapping;
  hasErrors: boolean;
}

// Normalized aliases for header auto-detection
const STT_ALIASES = ['stt', 'số thứ tự', 'so thu tu', 'sothutu', 'no', 'stt.', 'tt', 'index', '#', 'order'];
const CODE_ALIASES = [
  'mã học sinh',
  'ma hoc sinh',
  'mahocsinh',
  'mã hs',
  'ma hs',
  'mahs',
  'mshs',
  'mã số',
  'ma so',
  'mã',
  'ma',
  'student code',
  'student id',
  'code',
  'id',
];
const NAME_ALIASES = [
  'họ và tên',
  'ho va ten',
  'hovaten',
  'họ tên',
  'ho ten',
  'hoten',
  'tên học sinh',
  'ten hoc sinh',
  'tenhocsinh',
  'họ và tên học sinh',
  'tên',
  'ten',
  'full name',
  'fullname',
  'student name',
  'name',
];
const CLASS_ALIASES = [
  'lớp',
  'lop',
  'tên lớp',
  'ten lop',
  'tenlop',
  'lớp học',
  'lop hoc',
  'class',
  'classname',
  'grade',
];

function cleanString(str: any): string {
  if (str === null || str === undefined) return '';
  return String(str).trim();
}

function matchAlias(header: string, aliases: string[]): boolean {
  const norm = cleanString(header).toLowerCase();
  return aliases.some((a) => norm === a || norm.includes(a));
}

/**
 * Auto detects header mapping from Excel headers
 */
export function detectColumnMapping(headers: string[]): ColumnMapping {
  let sttCol = '';
  let codeCol = '';
  let nameCol = '';
  let classCol = '';

  for (const h of headers) {
    if (!sttCol && matchAlias(h, STT_ALIASES)) {
      sttCol = h;
      continue;
    }
    if (!codeCol && matchAlias(h, CODE_ALIASES)) {
      codeCol = h;
      continue;
    }
    if (!nameCol && matchAlias(h, NAME_ALIASES)) {
      nameCol = h;
      continue;
    }
    if (!classCol && matchAlias(h, CLASS_ALIASES)) {
      classCol = h;
      continue;
    }
  }

  // Fallbacks by order if not detected
  if (!sttCol && headers.length >= 1) sttCol = headers[0];
  if (!codeCol && headers.length >= 2) codeCol = headers[1];
  if (!nameCol && headers.length >= 3) nameCol = headers[2];
  if (!classCol && headers.length >= 4) classCol = headers[3];

  return { sttCol, codeCol, nameCol, classCol };
}

/**
 * Reads an Excel file buffer and parses sheet data
 */
export async function parseExcelFile(
  file: File,
  numSlots: number = 3,
  customMapping?: ColumnMapping
): Promise<ExcelParseResult> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });

  // Read first worksheet with data
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw new Error('File Excel không có sheet nào chứa dữ liệu.');
  }

  const worksheet = workbook.Sheets[sheetName];
  if (!worksheet) {
    throw new Error('Sheet dữ liệu trống.');
  }

  // Convert to JSON with raw values (as array of objects)
  const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, {
    defval: '',
    raw: false, // Ensures formatting as strings where possible
  });

  if (rawRows.length === 0) {
    throw new Error('Không tìm thấy dữ liệu học sinh trong file Excel.');
  }

  // Extract headers
  const headers = Object.keys(rawRows[0] || {});
  const mapping = customMapping || detectColumnMapping(headers);

  const rowResults: ParsedRowResult[] = [];
  const validRows: Student[] = [];
  const detectedClassesSet = new Set<string>();

  const seenStt = new Set<string>();
  const seenCode = new Set<string>();

  rawRows.forEach((row, index) => {
    const rowNumber = index + 2; // Excel 1-based, +1 header row
    const errors: string[] = [];
    const warnings: string[] = [];

    // Extract raw values from mapped columns
    const rawStt = cleanString(row[mapping.sttCol]);
    const rawCode = cleanString(row[mapping.codeCol]);
    const rawName = cleanString(row[mapping.nameCol]);
    const rawClass = cleanString(row[mapping.classCol]);

    // Check if entire row is empty
    const allValuesEmpty = Object.values(row).every((v) => cleanString(v) === '');
    if (allValuesEmpty) {
      return; // Skip completely empty rows
    }

    // Check for header row accidentally read as data row
    if (
      matchAlias(rawName, NAME_ALIASES) ||
      matchAlias(rawCode, CODE_ALIASES) ||
      matchAlias(rawStt, STT_ALIASES)
    ) {
      return; // Skip repeated header rows
    }

    // Validate Name
    if (!rawName) {
      errors.push('Thiếu họ và tên học sinh');
    }

    // Validate and Normalize STT (CRITICAL: preserve 001, 010, 025 according to numSlots)
    let normalizedStt = '';
    if (!rawStt) {
      // Auto-assign sequential STT if completely missing
      normalizedStt = String(index + 1).padStart(numSlots, '0');
      warnings.push(`Thiếu STT: Tự động gán ${normalizedStt}`);
    } else {
      // Extract numeric digits
      const digitsOnly = rawStt.replace(/\D/g, '');
      if (digitsOnly) {
        normalizedStt = digitsOnly.padStart(numSlots, '0');
      } else {
        normalizedStt = String(index + 1).padStart(numSlots, '0');
        warnings.push(`STT không phải số: Chuẩn hóa thành ${normalizedStt}`);
      }
    }

    // Check Duplicate STT within same class (or file)
    if (seenStt.has(normalizedStt)) {
      warnings.push(`Trùng STT ${normalizedStt}`);
    } else {
      seenStt.add(normalizedStt);
    }

    // Validate and Normalize Student Code
    let normalizedCode = rawCode;
    if (!normalizedCode) {
      normalizedCode = `HS2026${normalizedStt}`;
      warnings.push(`Thiếu Mã HS: Tự động tạo ${normalizedCode}`);
    }

    if (seenCode.has(normalizedCode)) {
      warnings.push(`Trùng Mã học sinh ${normalizedCode}`);
    } else {
      seenCode.add(normalizedCode);
    }

    // Validate and Normalize Class
    const normalizedClass = rawClass || '11A4';
    detectedClassesSet.add(normalizedClass);

    const isValid = errors.length === 0;

    let student: Student | undefined = undefined;
    if (isValid) {
      student = {
        id: `hs-import-${Date.now()}-${index}`,
        stt: normalizedStt,
        code: normalizedCode,
        name: rawName,
        className: normalizedClass,
      };
      validRows.push(student);
    }

    rowResults.push({
      rowNumber,
      raw: row,
      student,
      isValid,
      errors,
      warnings,
    });
  });

  return {
    sheetName,
    headers,
    totalRows: rawRows.length,
    validRows,
    rowResults,
    detectedClasses: Array.from(detectedClassesSet),
    autoMapping: mapping,
    hasErrors: rowResults.some((r) => !r.isValid),
  };
}

/**
 * Generates and downloads a real sample .xlsx template
 */
export function downloadSampleExcel(numSlots: number = 3) {
  // Sample data with text formatted STT so Excel preserves leading zeros
  const sampleData = [
    {
      'STT': String(1).padStart(numSlots, '0'),
      'MÃ HỌC SINH': `HS2026${String(1).padStart(numSlots, '0')}`,
      'HỌ VÀ TÊN': 'Nguyễn Văn An',
      'LỚP': '11A4',
    },
    {
      'STT': String(2).padStart(numSlots, '0'),
      'MÃ HỌC SINH': `HS2026${String(2).padStart(numSlots, '0')}`,
      'HỌ VÀ TÊN': 'Trần Minh Anh',
      'LỚP': '11A4',
    },
    {
      'STT': String(3).padStart(numSlots, '0'),
      'MÃ HỌC SINH': `HS2026${String(3).padStart(numSlots, '0')}`,
      'HỌ VÀ TÊN': 'Lê Hoàng Nam',
      'LỚP': '11A4',
    },
    {
      'STT': String(10).padStart(numSlots, '0'),
      'MÃ HỌC SINH': `HS2026${String(10).padStart(numSlots, '0')}`,
      'HỌ VÀ TÊN': 'Phạm Minh Khang',
      'LỚP': '11A4',
    },
    {
      'STT': String(25).padStart(numSlots, '0'),
      'MÃ HỌC SINH': `HS2026${String(25).padStart(numSlots, '0')}`,
      'HỌ VÀ TÊN': 'Nguyễn Ngọc Anh',
      'LỚP': '11A4',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);

  // Set column widths for clean readability in Excel
  worksheet['!cols'] = [
    { wch: 10 }, // STT
    { wch: 18 }, // MÃ HỌC SINH
    { wch: 28 }, // HỌ VÀ TÊN
    { wch: 12 }, // LỚP
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'DanhSachHocSinh');

  // Trigger download
  XLSX.writeFile(workbook, 'Danh_sach_hoc_sinh_mau.xlsx');
}
