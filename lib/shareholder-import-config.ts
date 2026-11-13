export const SHAREHOLDER_IMPORT_COLUMNS = [
  { key: "id", header: "Id", required: true },
  { key: "name", header: "Name", required: true },
  { key: "nameAm", header: "Name Am", required: false },
  { key: "phone", header: "Phone", required: false },
  { key: "address", header: "Address", required: false },
  { key: "shareValue", header: "Share Value", required: true },
] as const;

export const SHAREHOLDER_IMPORT_SHEET = "Shareholders";
export const SHAREHOLDER_TEMPLATE_FILENAME = "shareholders-import-template.xlsx";
export const SHAREHOLDER_IMPORT_MAX_BYTES = 5 * 1024 * 1024;
export const SHAREHOLDER_IMPORT_MAX_ROWS = 10_000;
export const SHAREHOLDER_IMPORT_MAX_ISSUES = 50;

export type ShareholderImportIssue = {
  row: number;
  column: string;
  message: string;
};

export function validateShareholderImportFile(file: {
  name: string;
  size: number;
}): string | null {
  if (!/\.(xlsx|xls)$/i.test(file.name)) {
    return "Select an Excel workbook (.xlsx or .xls).";
  }
  if (file.size === 0) return "The selected file is empty.";
  if (file.size > SHAREHOLDER_IMPORT_MAX_BYTES) {
    return "The Excel workbook must be 5 MB or smaller.";
  }
  return null;
}
