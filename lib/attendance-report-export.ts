import * as XLSX from "xlsx";
import { formatDate, formatNumber } from "@/lib/display";
import {
  ATTENDANCE_COLUMNS,
  attendanceCell,
  attendanceExcelValue,
  attendanceFilterSummary,
  formatAttendanceShares,
  representativeOptions,
  sumAttendanceShares,
  type AttendanceColumnKey,
  type AttendanceFilters,
  type AttendanceReport,
  type AttendanceRow,
  type AttendanceSort,
} from "@/lib/attendance-report";

export type AttendanceExportOptions = {
  report: AttendanceReport;
  rows: AttendanceRow[];
  matchingRows: AttendanceRow[];
  columns: AttendanceColumnKey[];
  filters: AttendanceFilters;
  sorts: AttendanceSort[];
  scopeLabel: string;
};

const columnLabel = (key: AttendanceColumnKey) =>
  ATTENDANCE_COLUMNS.find((column) => column.key === key)!.label;

function exportFilename(title: string, extension: string) {
  const safeTitle = title
    .normalize("NFKC")
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "_")
    .replace(/[.\s]+$/g, "")
    .slice(0, 100);
  return `Attendance_Report_${safeTitle || "Meeting"}.${extension}`;
}

function sortDescription(sorts: AttendanceSort[]) {
  return sorts
    .map((sort, index) =>
      `${index + 1}. ${columnLabel(sort.key)} (${sort.direction === "asc" ? "ascending" : "descending"})`,
    )
    .join("; ");
}

function exportMetadata(options: AttendanceExportOptions): [string, string][] {
  const activeFilters = attendanceFilterSummary(
    options.filters,
    representativeOptions(options.report.attendance),
  );
  return [
    ...(activeFilters.length ? activeFilters : [["Filters", "All attendance records"] as [string, string]]),
    ["Sorting (in priority order)", sortDescription(options.sorts)],
    ["Export scope", options.scopeLabel],
    ["Selected columns", options.columns.map(columnLabel).join(", ")],
    ["Time zone", "East Africa Time (Africa/Nairobi, UTC+03:00)"],
  ];
}

function reportSummary(options: AttendanceExportOptions): [string, string | number][] {
  const { report, rows, matchingRows, scopeLabel } = options;
  return [
    ["Meeting", report.meetingTitle],
    ["Meeting status", report.meetingStatus],
    ["Registered shareholders (whole meeting)", report.totalShareholdersCount],
    ["Attended shareholders (whole meeting)", report.attendeesCount],
    ["Total shares (whole meeting)", report.totalShares],
    ["Attended shares (whole meeting)", sumAttendanceShares(report.attendance)],
    ["Quorum target", `${report.quorumPct}%`],
    ["Required shares (whole meeting)", report.required],
    ["Quorum status (whole meeting)", report.quorumMet ? "Met" : "Not met"],
    ["Matching attendance records", matchingRows.length],
    ["Matching shares", sumAttendanceShares(matchingRows)],
    ["Exported attendance records", rows.length],
    ["Exported shares", sumAttendanceShares(rows)],
    ["Export scope", scopeLabel],
    ["Generated at (EAT)", formatDate(new Date(), true)],
    ["Excel values", "Shareholder and representative IDs are text. Shares with more than 15 significant digits are text to preserve their exact value. Check-in times are Excel dates in EAT."],
  ];
}

export function createAttendanceWorkbook(options: AttendanceExportOptions) {
  const workbook = XLSX.utils.book_new();
  const summary = XLSX.utils.aoa_to_sheet([
    ["Metric", "Value"],
    ...reportSummary(options),
  ]);
  summary["!cols"] = [{ wch: 42 }, { wch: 95 }];
  XLSX.utils.book_append_sheet(workbook, summary, "Summary");

  const filters = XLSX.utils.aoa_to_sheet([
    ["Setting", "Value"],
    ...exportMetadata(options),
  ]);
  filters["!cols"] = [{ wch: 32 }, { wch: 100 }];
  XLSX.utils.book_append_sheet(workbook, filters, "Filters");

  const attendance = XLSX.utils.aoa_to_sheet([
    options.columns.map(columnLabel),
    ...options.rows.map((row) =>
      options.columns.map((key) => attendanceExcelValue(row, key)),
    ),
  ]);
  attendance["!cols"] = options.columns.map((key) => ({
    wch: key === "shareholderName" || key === "shareholderNameAm" || key === "representedByName"
      ? 32
      : key === "createdAt" ? 24 : key === "shareValue" ? 28 : 22,
  }));
  if (attendance["!ref"]) attendance["!autofilter"] = { ref: attendance["!ref"] };
  options.columns.forEach((key, column) => {
    if (key !== "createdAt" && key !== "shareValue") return;
    options.rows.forEach((_, index) => {
      const cell = attendance[XLSX.utils.encode_cell({ r: index + 1, c: column })];
      if (cell?.t === "n") {
        cell.z = key === "createdAt" ? "dd/mm/yyyy hh:mm:ss" : "#,##0.######";
      }
    });
  });
  XLSX.utils.book_append_sheet(workbook, attendance, "Attendance");
  return workbook;
}

export function downloadAttendanceExcel(options: AttendanceExportOptions) {
  XLSX.writeFile(
    createAttendanceWorkbook(options),
    exportFilename(options.report.meetingTitle, "xlsx"),
    { compression: true },
  );
}

let pdfFont: Promise<string> | undefined;

async function pdfFontData() {
  if (!pdfFont) {
    pdfFont = (async () => {
      const response = await fetch("/fonts/AttendanceSans-Regular.ttf");
      if (!response.ok) throw new Error("The report font could not be loaded.");
      const bytes = new Uint8Array(await response.arrayBuffer());
      // Chunks avoid the argument limit for String.fromCharCode on large fonts.
      let binary = "";
      for (let index = 0; index < bytes.length; index += 8192)
        binary += String.fromCharCode(...bytes.subarray(index, index + 8192));
      return btoa(binary);
    })().catch((error) => {
      pdfFont = undefined;
      throw error;
    });
  }
  return pdfFont;
}

export async function downloadAttendancePDF(options: AttendanceExportOptions) {
  const [{ jsPDF }, { default: autoTable }, font, logoResponse] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
    pdfFontData(),
    fetch("/logo.png"),
  ]);
  if (!logoResponse.ok) throw new Error("The report logo could not be loaded.");
  const logo = new Uint8Array(await logoResponse.arrayBuffer());
  const doc = new jsPDF({
    orientation: options.columns.length > 5 ? "landscape" : "portrait",
    compress: true,
    putOnlyUsedFonts: true,
  });
  doc.addFileToVFS("AttendanceSans-Regular.ttf", font);
  doc.addFont("AttendanceSans-Regular.ttf", "AttendanceFont", "normal");
  // The same Unicode font is used for table headings so Amharic names stay readable.
  doc.addFont("AttendanceSans-Regular.ttf", "AttendanceFont", "bold");
  doc.setFont("AttendanceFont", "normal");
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();
  doc.addImage(logo, "PNG", (width - 70) / 2, 10, 70, 15);
  doc.setFontSize(17);
  doc.text("Meeting Attendance Report", width / 2, 36, { align: "center" });
  doc.setFontSize(11);
  const title = doc.splitTextToSize(options.report.meetingTitle, width - 28);
  doc.text(title, 14, 45);
  let nextY = 45 + title.length * 6 + 3;
  const tableStyles = { font: "AttendanceFont", fontSize: 9, overflow: "linebreak" as const };
  const lastTableY = () =>
    (doc as typeof doc & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? nextY;

  autoTable(doc, {
    head: [["Meeting totals", "Value"]],
    body: [
      ["Status", options.report.meetingStatus],
      ["Attended shareholders", `${formatNumber(options.report.attendeesCount)} / ${formatNumber(options.report.totalShareholdersCount)}`],
      ["Attended shares", `${formatAttendanceShares(sumAttendanceShares(options.report.attendance))} / ${formatNumber(options.report.totalShares, 6)}`],
      ["Quorum", `${options.report.quorumPct}% | Required shares: ${formatNumber(options.report.required, 6)} | ${options.report.quorumMet ? "Met" : "Not met"}`],
      ["Matching records / shares", `${formatNumber(options.matchingRows.length)} / ${formatAttendanceShares(sumAttendanceShares(options.matchingRows))}`],
      ["Exported records / shares", `${formatNumber(options.rows.length)} / ${formatAttendanceShares(sumAttendanceShares(options.rows))}`],
      ["Generated at (EAT)", formatDate(new Date(), true)],
    ],
    startY: nextY,
    margin: { top: 14, bottom: 18 },
    styles: tableStyles,
    headStyles: { fillColor: [36, 95, 210] },
    columnStyles: { 0: { cellWidth: 55 } },
  });
  nextY = lastTableY() + 8;
  autoTable(doc, {
    head: [["Filters and export settings", "Value"]],
    body: exportMetadata(options),
    startY: nextY,
    margin: { top: 14, bottom: 18 },
    styles: tableStyles,
    headStyles: { fillColor: [36, 95, 210] },
    columnStyles: { 0: { cellWidth: 55 } },
  });
  nextY = lastTableY() + 8;
  autoTable(doc, {
    head: [options.columns.map(columnLabel)],
    body: options.rows.map((row) => options.columns.map((key) => attendanceCell(row, key))),
    startY: nextY,
    margin: { top: 14, bottom: 18 },
    styles: { ...tableStyles, fontSize: options.columns.length > 5 ? 8 : 9 },
    headStyles: { fillColor: [36, 95, 210] },
    columnStyles: Object.fromEntries(options.columns.map((key, index) =>
      [index, key === "shareValue" ? { halign: "right" } : {}],
    )),
  });
  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page++) {
    doc.setPage(page);
    doc.setFont("AttendanceFont", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text(`Attendance report | Times in EAT | Page ${page} of ${pages}`, width - 14, height - 8, { align: "right" });
  }
  doc.save(exportFilename(options.report.meetingTitle, "pdf"));
}
