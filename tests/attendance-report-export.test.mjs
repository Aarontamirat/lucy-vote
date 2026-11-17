import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { inflateSync } from "node:zlib";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import { loadTypescript } from "./helpers/load-typescript.mjs";

const helpers = loadTypescript("lib/attendance-report.ts");
const exports = loadTypescript("lib/attendance-report-export.ts");

function options(overrides = {}) {
  const attendance = [
    {
      id: "record-a", shareholderId: "000012", shareholderName: "=2+2",
      shareholderNameAm: "አበበ", shareValue: "123456789012345678901234.123456",
      representedById: "000099", representedByName: "+SUM(A1:A2)",
      representativeName: null, createdAt: "2026-11-17T00:01:12.000Z",
    },
    {
      id: "record-b", shareholderId: "000002", shareholderName: "Normal holder",
      shareholderNameAm: null, shareValue: "12.123456", representedById: null,
      representedByName: null, representativeName: null, createdAt: "2026-11-16T22:00:00.000Z",
    },
  ];
  return {
    report: {
      meetingTitle: "Meeting 2026", meetingStatus: "OPEN", quorumPct: 50,
      totalShares: 1000, attendedShares: 800, quorumMet: true, required: 500,
      attendeesCount: attendance.length, totalShareholdersCount: 20, attendance,
    },
    rows: attendance,
    matchingRows: attendance,
    columns: helpers.ATTENDANCE_COLUMNS.map((column) => column.key),
    filters: { ...helpers.INITIAL_ATTENDANCE_FILTERS },
    sorts: [{ key: "shareholderId", direction: "asc" }],
    scopeLabel: "All matching records",
    ...overrides,
  };
}

function roundTrip(input) {
  return XLSX.read(XLSX.write(exports.createAttendanceWorkbook(input), {
    type: "buffer", bookType: "xlsx", compression: true,
  }), { type: "buffer", cellNF: true });
}

test("Excel preserves exact shares, zero-prefixed IDs, formula-like names and real EAT dates", () => {
  const workbook = roundTrip(options());
  const sheet = workbook.Sheets.Attendance;
  assert.deepEqual(workbook.SheetNames, ["Summary", "Filters", "Attendance"]);
  assert.equal(sheet.A2.v, "000012");
  assert.equal(sheet.A2.t, "s");
  assert.equal(sheet.B2.v, "=2+2");
  assert.equal(sheet.B2.f, undefined);
  assert.equal(sheet.C2.v, "አበበ");
  assert.equal(sheet.D2.v, "123456789012345678901234.123456");
  assert.equal(sheet.D2.t, "s");
  assert.equal(sheet.D3.v, 12.123456);
  assert.equal(sheet.D3.t, "n");
  assert.equal(sheet.F2.v, "000099");
  assert.equal(sheet.G2.v, "+SUM(A1:A2)");
  assert.equal(sheet.G2.f, undefined);
  assert.equal(sheet.H2.t, "n");
  const eat = XLSX.SSF.parse_date_code(sheet.H2.v);
  assert.deepEqual([eat.y, eat.m, eat.d, eat.H, eat.M, eat.S], [2026, 11, 17, 3, 1, 12]);
  assert.equal(sheet.H2.z, "dd/mm/yyyy hh:mm:ss");
  assert.deepEqual(sheet["!autofilter"], { ref: "A1:H3" });
});

test("Excel exports only selected columns and scope in the exact sorted table order", () => {
  const input = options();
  const rows = helpers.filterAttendance(input.report.attendance, input.filters, input.sorts);
  const page = helpers.paginateAttendance(rows, 1, 1);
  const workbook = roundTrip({ ...input, rows: page.rows, matchingRows: rows,
    columns: ["shareholderId", "shareValue"], scopeLabel: "Current page (1)" });
  assert.deepEqual(XLSX.utils.sheet_to_json(workbook.Sheets.Attendance, { header: 1 }), [
    ["ID", "Shares"], ["000002", 12.123456],
  ]);
  const summary = new Map(XLSX.utils.sheet_to_json(workbook.Sheets.Summary, { header: 1 }).slice(1));
  assert.equal(summary.get("Matching attendance records"), 2);
  assert.equal(summary.get("Exported attendance records"), 1);
  assert.equal(summary.get("Exported shares"), "12.123456");
  assert.equal(summary.get("Attended shareholders (whole meeting)"), 2);
  assert.equal(summary.get("Quorum status (whole meeting)"), "Met");
  assert.equal(summary.get("Export scope"), "Current page (1)");
});

test("workbook metadata records active filters, secondary sort order and empty results retain headers", () => {
  const input = options({
    rows: [], matchingRows: [], columns: ["shareholderId", "createdAt"],
    filters: { ...helpers.INITIAL_ATTENDANCE_FILTERS, attendanceType: "represented",
      minShares: "0", from: "2026-11-17T03:00", representative: "id:000099" },
    sorts: [{ key: "representedByName", direction: "asc" }, { key: "shareValue", direction: "desc" }],
  });
  const workbook = roundTrip(input);
  assert.deepEqual(XLSX.utils.sheet_to_json(workbook.Sheets.Attendance, { header: 1 }), [
    ["ID", "Check-in (EAT)"],
  ]);
  const settings = new Map(XLSX.utils.sheet_to_json(workbook.Sheets.Filters, { header: 1 }).slice(1));
  assert.equal(settings.get("Sorting (in priority order)"), "1. Represented by (ascending); 2. Shares (descending)");
  assert.equal(settings.get("Selected columns"), "ID, Check-in (EAT)");
  assert.match(settings.get("Time zone"), /UTC\+03:00/);
  assert.ok([...settings.values()].some((value) => String(value).includes("000099")));
  assert.equal(settings.get("Check-in from (EAT)"), "2026-11-17 03:00");
  assert.ok([...settings.values()].some((value) => value === "0"));
});

test("PDF creates readable Unicode tables across pages using local fonts and a safe filename", async () => {
  let saved;
  class CapturingPDF extends jsPDF {
    constructor(config) {
      super(config);
      this.save = (filename) => { saved = { filename, doc: this }; return this; };
    }
  }
  const pdfExports = loadTypescript("lib/attendance-report-export.ts", {}, {
    jspdf: { jsPDF: CapturingPDF },
  });
  const fetchBefore = globalThis.fetch;
  globalThis.fetch = async (url) => new Response(readFileSync(`public${url}`));
  try {
    const input = options();
    input.report.meetingTitle = "2026 / አበበ meeting";
    input.rows = Array.from({ length: 100 }, (_, index) => ({ ...input.rows[0], id: `record-${index}` }));
    input.matchingRows = input.rows;
    await pdfExports.downloadAttendancePDF(input);
    assert.equal(saved.filename, "Attendance_Report_2026 _ አበበ meeting.pdf");
    assert.ok(saved.doc.getNumberOfPages() > 1);
    assert.ok(saved.doc.internal.pageSize.getWidth() > saved.doc.internal.pageSize.getHeight());
    const output = saved.doc.output();
    assert.match(output, /^%PDF-/);
    assert.ok(output.length < 2_000_000, `100-row PDF is too large: ${output.length} bytes`);
    assert.match(output, /\/ToUnicode/);
    const unicodeMaps = [...output.matchAll(/\/ToUnicode (\d+) 0 R/g)].map((reference) => {
      const stream = new RegExp(`\\b${reference[1]} 0 obj\\n(.*?)stream\\n([\\s\\S]*?)\\nendstream`, "s").exec(output);
      assert.ok(stream, "Missing PDF Unicode map");
      const buffer = Buffer.from(stream[2], "latin1");
      return /\/FlateDecode/.test(stream[1]) ? inflateSync(buffer).toString() : buffer.toString();
    }).join("\n");
    assert.match(unicodeMaps, /12a0/i);
    assert.match(unicodeMaps, /1260/i);
  } finally {
    globalThis.fetch = fetchBefore;
  }
});
