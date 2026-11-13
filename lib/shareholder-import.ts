import * as XLSX from "xlsx";
import {
  SHAREHOLDER_IMPORT_COLUMNS,
  SHAREHOLDER_IMPORT_MAX_ISSUES,
  SHAREHOLDER_IMPORT_MAX_ROWS,
  SHAREHOLDER_IMPORT_SHEET,
  type ShareholderImportIssue,
} from "@/lib/shareholder-import-config";

type ImportKey = (typeof SHAREHOLDER_IMPORT_COLUMNS)[number]["key"];

export type ImportedShareholder = {
  id: string;
  name: string;
  nameAm: string | null;
  phone: string | null;
  address: string | null;
  shareValue: string;
};

export class ShareholderImportError extends Error {
  constructor(
    message: string,
    public readonly issues: ShareholderImportIssue[] = [],
    public readonly issueCount = issues.length,
    public readonly status = 400,
  ) {
    super(message);
    this.name = "ShareholderImportError";
  }
}

const normalizeHeader = (value: string) =>
  value.trim().replace(/\s+/g, " ").toLowerCase();

// Covers common MySQL case/accent equivalences; the unique constraint remains
// authoritative for every ID collision, including concurrent imports.
export const shareholderIdKey = (id: string) =>
  id.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

const isBlank = (cell: XLSX.CellObject | undefined) =>
  !cell || (!cell.f && (cell.v == null || String(cell.v).trim() === ""));

function plainNumber(value: number): string {
  const text = String(value);
  if (!/[eE]/.test(text)) return text;
  const [coefficient, exponent] = text.split(/[eE]/);
  const [integer, fraction = ""] = coefficient.split(".");
  const digits = integer + fraction;
  const point = integer.length + Number(exponent);
  if (point <= 0) return `0.${"0".repeat(-point)}${digits}`;
  if (point >= digits.length) return digits + "0".repeat(point - digits.length);
  return `${digits.slice(0, point)}.${digits.slice(point)}`;
}

function readText(
  cell: XLSX.CellObject | undefined,
  required: boolean,
  allowNumber = false,
): string | null {
  if (isBlank(cell)) {
    if (required) throw new Error("This field is required.");
    return null;
  }
  if (!cell) return null;
  if (cell.f) throw new Error("Replace the formula with its value before importing.");
  let value: string;
  if (cell.t === "s" && typeof cell.v === "string") {
    value = cell.v.trim();
  } else if (allowNumber && cell.t === "n" && typeof cell.v === "number") {
    if (!Number.isSafeInteger(cell.v) || cell.v < 0 || cell.v >= 1e15) {
      throw new Error("Enter this value as text to preserve every digit.");
    }
    // Retain zero-padding from an existing workbook's format, such as 00000.
    value = typeof cell.z === "string" && /^0+$/.test(cell.z)
      ? XLSX.utils.format_cell(cell)
      : String(cell.v);
  } else {
    throw new Error("Enter a text value, not a date, boolean, or Excel error.");
  }
  if (value.length > 382 || [...value].length > 191) {
    throw new Error("Use 191 characters or fewer.");
  }
  return value;
}

function readShareValue(cell: XLSX.CellObject | undefined): string {
  if (isBlank(cell) || !cell) throw new Error("This field is required.");
  if (cell.f) throw new Error("Replace the formula with its value before importing.");
  let value: string;
  if (cell.t === "n" && typeof cell.v === "number") {
    if (!Number.isFinite(cell.v) || cell.v < 0) {
      throw new Error("Enter a non-negative share value.");
    }
    value = plainNumber(cell.v);
    const significantDigits = value.replace(".", "").replace(/^0+|0+$/g, "");
    if (significantDigits.length > 15 || cell.v >= 1e15) {
      throw new Error("Enter large or high-precision share values as text.");
    }
  } else if (cell.t === "s" && typeof cell.v === "string") {
    value = cell.v.trim();
  } else {
    throw new Error("Enter a non-negative decimal share value.");
  }
  if (!/^(?:\d+(?:\.\d+)?|\.\d+)$/.test(value)) {
    throw new Error("Enter a non-negative decimal without commas or currency symbols.");
  }
  const [integer = "", fraction = ""] = value.split(".");
  const whole = integer.replace(/^0+/, "") || "0";
  if (whole.length > 24 || fraction.length > 6) {
    throw new Error("Use at most 24 digits before the decimal and 6 after it.");
  }
  return fraction ? `${whole}.${fraction}` : whole;
}

export function parseShareholderWorkbook(buffer: Buffer, filename: string) {
  const signature = /\.xlsx$/i.test(filename)
    ? Buffer.from([0x50, 0x4b, 0x03, 0x04])
    : Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);
  if (!buffer.subarray(0, signature.length).equals(signature)) {
    throw new ShareholderImportError("The file is not a valid Excel workbook. Download the template and try again.");
  }

  let sheet: XLSX.WorkSheet | undefined;
  try {
    const metadata = XLSX.read(buffer, { type: "buffer", bookSheets: true });
    const sheetName = metadata.SheetNames.find(
      (name) => normalizeHeader(name) === normalizeHeader(SHAREHOLDER_IMPORT_SHEET),
    ) ?? metadata.SheetNames[0];
    if (!sheetName) throw new Error("No worksheets");
    const workbook = XLSX.read(buffer, {
      type: "buffer",
      sheets: sheetName,
      sheetRows: SHAREHOLDER_IMPORT_MAX_ROWS + 2,
      cellDates: true,
      cellNF: true,
      cellText: false,
    });
    sheet = workbook.Sheets[sheetName];
  } catch {
    throw new ShareholderImportError("The Excel workbook could not be read. It may be damaged or password protected.");
  }
  if (!sheet?.["!ref"]) {
    throw new ShareholderImportError("The worksheet is empty. Use the downloaded template.");
  }
  const range = XLSX.utils.decode_range(sheet["!fullref"] ?? sheet["!ref"]);
  if (range.e.r > SHAREHOLDER_IMPORT_MAX_ROWS) {
    throw new ShareholderImportError(`Use at most ${SHAREHOLDER_IMPORT_MAX_ROWS.toLocaleString("en-GB")} rows below the header. Split larger files into separate imports.`);
  }
  if (range.e.c >= 64) {
    throw new ShareholderImportError("The worksheet has too many columns. Use the downloaded template.");
  }

  const issues: ShareholderImportIssue[] = [];
  let issueCount = 0;
  const addIssue = (row: number, column: string, message: string) => {
    issueCount++;
    if (issues.length < SHAREHOLDER_IMPORT_MAX_ISSUES) issues.push({ row, column, message });
  };
  const columns = new Map<ImportKey, number>();
  for (let columnIndex = 0; columnIndex <= range.e.c; columnIndex++) {
    const cell: XLSX.CellObject | undefined = sheet[XLSX.utils.encode_cell({ r: 0, c: columnIndex })];
    if (isBlank(cell)) continue;
    if (cell?.f || cell?.t !== "s") {
      addIssue(1, XLSX.utils.encode_col(columnIndex), "Column headers must be text.");
      continue;
    }
    const column = SHAREHOLDER_IMPORT_COLUMNS.find(
      (item) => normalizeHeader(item.header) === normalizeHeader(String(cell.v)),
    );
    if (!column) {
      addIssue(1, String(cell.v).slice(0, 40), "Unrecognized column. Use the headers in the template.");
    } else if (columns.has(column.key)) {
      addIssue(1, column.header, "This column appears more than once.");
    } else {
      columns.set(column.key, columnIndex);
    }
  }
  for (const column of SHAREHOLDER_IMPORT_COLUMNS) {
    if (column.required && !columns.has(column.key)) {
      addIssue(1, column.header, "This required column is missing.");
    }
  }
  if (issueCount) {
    throw new ShareholderImportError("Fix the worksheet headers before importing. No shareholders were imported.", issues, issueCount);
  }

  const shareholders: ImportedShareholder[] = [];
  const rowsById = new Map<string, number>();
  const mappedColumns = new Set(columns.values());
  for (let rowIndex = 1; rowIndex <= range.e.r; rowIndex++) {
    const rowCells = Array.from({ length: range.e.c + 1 }, (_, c) =>
      sheet[XLSX.utils.encode_cell({ r: rowIndex, c })] as XLSX.CellObject | undefined,
    );
    if (rowCells.every(isBlank)) continue;
    const row = rowIndex + 1;
    const before = issueCount;
    for (let c = 0; c < rowCells.length; c++) {
      if (!isBlank(rowCells[c]) && !mappedColumns.has(c)) {
        addIssue(row, XLSX.utils.encode_col(c), "This value has no column header.");
      }
    }
    const values: Partial<Record<ImportKey, string | null>> = {};
    for (const column of SHAREHOLDER_IMPORT_COLUMNS) {
      const index = columns.get(column.key);
      const cell = index == null ? undefined : rowCells[index];
      try {
        values[column.key] = column.key === "shareValue"
          ? readShareValue(cell)
          : readText(cell, column.required, column.key === "id" || column.key === "phone");
      } catch (error) {
        addIssue(row, column.header, error instanceof Error ? error.message : "Invalid value.");
      }
    }
    if (values.id) {
      const key = shareholderIdKey(values.id);
      const previous = rowsById.get(key);
      if (previous != null) {
        addIssue(row, "Id", `This ID is repeated; it first appears on row ${previous}.`);
      } else {
        rowsById.set(key, row);
      }
    }
    if (before === issueCount && values.id && values.name && values.shareValue != null) {
      shareholders.push({
        id: values.id,
        name: values.name,
        nameAm: values.nameAm ?? null,
        phone: values.phone ?? null,
        address: values.address ?? null,
        shareValue: values.shareValue,
      });
    }
  }
  if (issueCount) {
    throw new ShareholderImportError("Fix the listed rows and upload the file again. No shareholders were imported.", issues, issueCount);
  }
  if (!shareholders.length) {
    throw new ShareholderImportError("No shareholder data was found. Fill in the Shareholders worksheet below the header.");
  }
  return { shareholders, rowsById };
}

export function createShareholderTemplate(): Buffer {
  const workbook = XLSX.utils.book_new();
  const sheet = XLSX.utils.aoa_to_sheet([SHAREHOLDER_IMPORT_COLUMNS.map((column) => column.header)]);
  // Blank text cells preserve zeros and exact decimals without sample records.
  for (let row = 1; row <= 1000; row++) {
    for (let column = 0; column < SHAREHOLDER_IMPORT_COLUMNS.length; column++) {
      sheet[XLSX.utils.encode_cell({ r: row, c: column })] = { t: "s", v: "", z: "@" };
    }
  }
  sheet["!ref"] = "A1:F1001";
  sheet["!cols"] = [18, 34, 34, 22, 40, 30].map((wch) => ({ wch }));
  sheet["!autofilter"] = { ref: "A1:F1001" };
  XLSX.utils.book_append_sheet(workbook, sheet, SHAREHOLDER_IMPORT_SHEET);

  const instructions = XLSX.utils.aoa_to_sheet([
    ["Shareholder import instructions", ""],
    ["Where to enter data", "Use the Shareholders worksheet. Keep the header on row 1 and enter one shareholder per row starting at row 2."],
    ["Required columns", "Id, Name, Share Value"],
    ["Optional columns", "Name Am, Phone, Address. Leave unused values blank."],
    ["Id", "Use a unique ID, stored as text. Letters and leading zeros are supported. Existing IDs cannot be imported again."],
    ["Name", "Enter the shareholder's full name."],
    ["Name Am", "Enter the Amharic name if available."],
    ["Phone", "Store phone numbers as text to retain leading zeros and the country code."],
    ["Share Value", "Enter a non-negative decimal as text, with no commas or currency symbols. Maximum: 24 digits before the decimal and 6 after it. Zero is allowed."],
    ["Text formatting", "The first 1,000 data rows are formatted as Text. Keep this format when pasting, and format further rows as Text before entering data."],
    ["Limits", "Excel files (.xlsx or .xls), up to 5 MB and 10,000 rows below the header. Completely blank rows are ignored."],
    ["Formulas", "Paste values instead of formulas. Dates, booleans and Excel errors are not shareholder data."],
    ["Validation", "All rows are checked before saving. If any row is invalid or an ID already exists, no shareholders are imported."],
    [],
    ["Examples (for guidance only; these rows are not imported)", ""],
    ["Id", "000123 or SH-001"],
    ["Name", "Abebe Bekele"],
    ["Name Am", "አበበ በቀለ"],
    ["Phone", "+251911000000"],
    ["Share Value", "494 or 1234.123456"],
  ]);
  instructions["!cols"] = [{ wch: 35 }, { wch: 110 }];
  XLSX.utils.book_append_sheet(workbook, instructions, "Instructions");
  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx", compression: true });
}
