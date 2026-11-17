import assert from "node:assert/strict";
import { test } from "node:test";
import * as XLSX from "xlsx";
import { Prisma } from "@prisma/client";
import { loadTypescript } from "./helpers/load-typescript.mjs";

const {
  ATTENDANCE_COLUMNS,
  DEFAULT_ATTENDANCE_COLUMNS,
  INITIAL_ATTENDANCE_FILTERS,
  INITIAL_ATTENDANCE_SORT,
  attendanceCell,
  attendanceExcelValue,
  attendanceFilterSummary,
  attendanceType,
  filterAttendance,
  formatAttendanceShares,
  paginateAttendance,
  representativeLabel,
  representativeOptions,
  sumAttendanceShares,
  validateAttendanceFilters,
} = loadTypescript("lib/attendance-report.ts");

function row(overrides = {}) {
  return {
    id: "attendance-1",
    shareholderId: "001",
    shareholderName: "Abebe Bekele",
    shareholderNameAm: "አበበ በቀለ",
    shareValue: "100.125",
    representedById: null,
    representedByName: null,
    representativeName: null,
    createdAt: "2026-11-17T06:00:00.000Z",
    ...overrides,
  };
}

function filters(overrides = {}) {
  return { ...INITIAL_ATTENDANCE_FILTERS, ...overrides };
}

function ids(rows) {
  return rows.map((item) => item.id);
}

test("default columns retain the existing attendance table and every selectable column has a value", () => {
  assert.deepEqual(DEFAULT_ATTENDANCE_COLUMNS, ["shareholderId", "shareholderName", "shareValue", "representedByName", "createdAt"]);
  assert.equal(new Set(ATTENDANCE_COLUMNS.map((column) => column.key)).size, 8);
  const sample = row();
  for (const column of ATTENDANCE_COLUMNS) assert.equal(typeof attendanceCell(sample, column.key), "string");
  assert.equal(attendanceCell(sample, "shareholderNameAm"), "አበበ በቀለ");
  assert.equal(attendanceCell(sample, "shareValue"), "100.125");
  assert.match(attendanceCell(sample, "createdAt"), /17 Nov 2026.*09:00/);
});

test("legacy name-only attendance and unnamed representatives remain represented", () => {
  assert.equal(attendanceType(row()), "self");
  assert.equal(representativeLabel(row()), "Self");
  assert.equal(attendanceType(row({ representativeName: "Legacy Representative" })), "represented");
  assert.equal(representativeLabel(row({ representativeName: "Legacy Representative" })), "Legacy Representative");
  assert.equal(attendanceType(row({ representedById: "REP-1" })), "represented");
  assert.equal(representativeLabel(row({ representedById: "REP-1" })), "Unknown representative");
  assert.equal(attendanceType(row({ representedByName: "   ", representativeName: "" })), "self");
});

test("representative choices distinguish identical names and correctly select legacy records", () => {
  const first = row({ id: "a", representedById: "R:1", representedByName: "Same Name" });
  const second = row({ id: "b", representedById: "R:2", representedByName: "Same Name" });
  const legacy = row({ id: "c", representativeName: "Same Name" });
  const rows = [first, second, legacy, row({ id: "self" }), { ...first, id: "again" }];
  const options = representativeOptions(rows);
  assert.equal(options.length, 3);
  assert.equal(new Set(options.map((option) => option.value)).size, 3);
  const secondOption = options.find((option) => option.label.endsWith("(R:2)"));
  assert.deepEqual(ids(filterAttendance(rows, filters({ representative: secondOption.value }))), ["b"]);
  const legacyOption = options.find((option) => option.label.endsWith("(name only)"));
  assert.deepEqual(ids(filterAttendance(rows, filters({ representative: legacyOption.value }))), ["c"]);
});

test("global search includes names, Amharic, representative IDs, shares and attendance type", () => {
  const represented = row({ id: "represented", shareholderId: "0002", representedById: "REP-10", representedByName: "Agent Alice" });
  const self = row({ id: "self", shareholderName: "Other Person", shareholderNameAm: null, shareValue: "500" });
  for (const query of [" AGENT alice ", "rep-10", "0002", "አበበ", "100.125", "represented"]) {
    assert.deepEqual(ids(filterAttendance([represented, self], filters({ search: query }))), ["represented"], query);
  }
  assert.deepEqual(ids(filterAttendance([represented, self], filters({ search: "Self" }))), ["self"]);
  assert.deepEqual(ids(filterAttendance([row({ shareValue: "1000.123456" }), self], filters({ search: "1,000.123456" }))), ["attendance-1"]);
});

test("cached search, dates and share values refresh if a caller updates a row", () => {
  const sample = row({ representedById: "REP-1", representativeName: "First Agent" });
  assert.deepEqual(ids(filterAttendance([sample], filters({ search: "first agent" }))), [sample.id]);
  assert.equal(sumAttendanceShares([sample]), "100.125");
  Object.assign(sample, {
    shareholderName: "Changed Name",
    shareValue: "2000.123456",
    representativeName: "Second Agent",
    createdAt: "2026-11-18T06:00:00Z",
  });
  assert.deepEqual(filterAttendance([sample], filters({ search: "First Agent" })), []);
  assert.deepEqual(ids(filterAttendance([sample], filters({ search: "2,000.123456" }))), [sample.id]);
  assert.deepEqual(ids(filterAttendance([sample], filters({ shareholderName: "changed", representativeName: "second" }))), [sample.id]);
  assert.equal(sumAttendanceShares([sample]), "2000.123456");
  assert.match(attendanceCell(sample, "createdAt"), /18 Nov 2026.*09:00/);
});

test("individual text, type, date and share filters combine with AND semantics", () => {
  const represented = row({ id: "matches", shareholderId: "0002", representedById: "REP-10", representedByName: "Agent Alice" });
  const excluded = [
    row({ id: "self" }),
    { ...represented, id: "wrong-share", shareValue: "101" },
    { ...represented, id: "wrong-time", createdAt: "2026-11-17T06:01:00Z" },
    { ...represented, id: "wrong-id", shareholderId: "OTHER" },
    { ...represented, id: "wrong-representative", representedByName: "Agent Bob" },
  ];
  const applied = filters({
    shareholderId: "002",
    shareholderName: "BEKELE",
    shareholderNameAm: "በቀለ",
    representativeId: "rep-",
    representativeName: "alice",
    attendanceType: "represented",
    minShares: "100.125",
    maxShares: "100.125",
    from: "2026-11-17T09:00",
    to: "2026-11-17T09:00",
  });
  assert.deepEqual(ids(filterAttendance([represented, ...excluded], applied)), ["matches"]);
  assert.deepEqual(ids(filterAttendance([represented, row({ id: "direct" })], filters({ attendanceType: "self" }))), ["direct"]);
});

test("null optional names match empty filters but never match nonempty filters", () => {
  const sample = row({ shareholderNameAm: null });
  assert.equal(filterAttendance([sample], filters()).length, 1);
  assert.equal(filterAttendance([sample], filters({ shareholderNameAm: "name" })).length, 0);
  assert.equal(filterAttendance([sample], filters({ representativeId: "rep" })).length, 0);
});

test("EAT ranges include exact endpoints and the entire final minute across midnight", () => {
  const rows = [
    row({ id: "before", createdAt: "2026-11-16T20:59:59.999Z" }),
    row({ id: "start", createdAt: "2026-11-16T21:00:00.000Z" }),
    row({ id: "end", createdAt: "2026-11-16T22:02:59.999Z" }),
    row({ id: "after", createdAt: "2026-11-16T22:03:00.000Z" }),
  ];
  const applied = filters({ from: "2026-11-17T00:00", to: "2026-11-17T01:02" });
  assert.deepEqual(ids(filterAttendance(rows, applied)), ["start", "end"]);
  assert.deepEqual(ids(filterAttendance(rows, filters({ from: "2026-11-17T01:03" }))), ["after"]);
});

test("filter times and exported Excel dates are independent of the device timezone", () => {
  const previousTimezone = process.env.TZ;
  const sample = row({ createdAt: "2026-11-16T21:05:30Z" });
  const applied = filters({ from: "2026-11-17T00:05", to: "2026-11-17T00:05" });
  const values = [];
  try {
    for (const timezone of ["UTC", "America/New_York", "Asia/Tokyo"]) {
      process.env.TZ = timezone;
      values.push([ids(filterAttendance([sample], applied)), attendanceCell(sample, "createdAt"), attendanceExcelValue(sample, "createdAt")]);
    }
  } finally {
    if (previousTimezone === undefined) delete process.env.TZ;
    else process.env.TZ = previousTimezone;
  }
  assert.deepEqual(values[0], values[1]);
  assert.deepEqual(values[1], values[2]);
  assert.deepEqual(values[0][0], [sample.id]);
  const parts = XLSX.SSF.parse_date_code(values[0][2]);
  assert.deepEqual([parts.y, parts.m, parts.d, parts.H, parts.M, parts.S], [2026, 11, 17, 0, 5, 30]);
});

test("invalid, inverted, negative and over-precision filter ranges return useful errors", () => {
  for (const overrides of [
    { minShares: "-1" },
    { maxShares: "NaN" },
    { minShares: "1e3" },
    { maxShares: "1,000" },
    { minShares: "0.1234567" },
    { minShares: "2", maxShares: "1" },
    { from: "2026-02-30T09:00" },
    { to: "2026-11-17T25:00" },
    { from: "invalid" },
    { from: "2026-11-17T09:01", to: "2026-11-17T09:00" },
  ]) {
    const applied = filters(overrides);
    assert.notEqual(validateAttendanceFilters(applied), "", JSON.stringify(overrides));
    assert.deepEqual(filterAttendance([row()], applied), [], JSON.stringify(overrides));
  }
  assert.equal(validateAttendanceFilters(filters({ minShares: "0", maxShares: ".000001" })), "");
  assert.equal(validateAttendanceFilters(filters({ from: "2026-11-17T09:00", to: "2026-11-17T09:00" })), "");
});

test("shares filter and sort at full Decimal(30,6) precision", () => {
  const rows = [
    row({ id: "highest", shareValue: "999999999999999999999999.999999" }),
    row({ id: "lowest", shareValue: "999999999999999999999999.999997" }),
    row({ id: "middle", shareValue: "999999999999999999999999.999998" }),
  ];
  assert.equal(Number(rows[0].shareValue), Number(rows[1].shareValue), "fixture must expose floating-point precision loss");
  assert.deepEqual(ids(filterAttendance(rows, filters(), [{ key: "shareValue", direction: "asc" }])), ["lowest", "middle", "highest"]);
  assert.deepEqual(ids(filterAttendance(rows, filters(), [{ key: "shareValue", direction: "desc" }])), ["highest", "middle", "lowest"]);
  assert.deepEqual(ids(filterAttendance(rows, filters({ minShares: rows[2].shareValue, maxShares: rows[2].shareValue }))), ["middle"]);
  assert.deepEqual(ids(filterAttendance([row({ shareValue: "0" }), row({ id: "positive", shareValue: ".000001" })], filters({ maxShares: "0" }))), ["attendance-1"]);
});

test("real Prisma Decimal scientific serialization retains exact filtering, sorting, sums and Excel text", () => {
  const exactValues = [
    "123456789012345678901234.123456",
    "123456789012345678901234.123454",
    "123456789012345678901234.123455",
  ];
  const rows = exactValues.map((value, index) => row({ id: String(index), shareValue: new Prisma.Decimal(value).toString() }));
  assert.match(rows[0].shareValue, /e\+23$/);
  assert.equal(Number(rows[0].shareValue), Number(rows[1].shareValue));
  assert.deepEqual(ids(filterAttendance(rows, filters(), [{ key: "shareValue", direction: "asc" }])), ["1", "2", "0"]);
  assert.deepEqual(ids(filterAttendance(rows, filters({ minShares: exactValues[2], maxShares: exactValues[2] }))), ["2"]);
  assert.equal(sumAttendanceShares(rows), "370370367037037036703702.370365");
  assert.equal(formatAttendanceShares(rows[0].shareValue), "123,456,789,012,345,678,901,234.123456");
  assert.deepEqual(ids(filterAttendance(rows, filters({ search: "123,456,789,012,345,678,901,234.123456" }))), ["0"]);
  assert.deepEqual(ids(filterAttendance(rows, filters({ search: exactValues[0] }))), ["0"]);
  const sheet = XLSX.utils.aoa_to_sheet([["Shares"], ...rows.map((item) => [attendanceExcelValue(item, "shareValue")])]);
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, "Attendance");
  const read = XLSX.read(XLSX.write(book, { type: "buffer", bookType: "xlsx" }), { type: "buffer" });
  assert.equal(read.Sheets.Attendance.A2.t, "s");
  assert.equal(read.Sheets.Attendance.A2.v, exactValues[0]);
});

test("scientific row values expand exactly while filters continue requiring plain decimals", () => {
  const rows = [
    row({ id: "large", shareValue: "1.23456789012345e+23" }),
    row({ id: "small", shareValue: "1.23e-4" }),
    row({ id: "millionth", shareValue: "1.0000000e-6" }),
  ];
  assert.equal(formatAttendanceShares(rows[0].shareValue), "123,456,789,012,345,000,000,000");
  assert.equal(formatAttendanceShares(rows[1].shareValue), "0.000123");
  assert.equal(formatAttendanceShares(rows[2].shareValue), "0.000001");
  assert.equal(sumAttendanceShares(rows), "123456789012345000000000.000124");
  assert.deepEqual(ids(filterAttendance(rows, filters({ maxShares: "0.000001" }))), ["millionth"]);
  assert.notEqual(validateAttendanceFilters(filters({ minShares: "1e-6" })), "");
  assert.notEqual(validateAttendanceFilters(filters({ maxShares: "1.23456789012345e+23" })), "");
});

test("share formatting and matching totals retain six decimal places and large integers", () => {
  assert.equal(formatAttendanceShares("999999999999999999999999.123456"), "999,999,999,999,999,999,999,999.123456");
  assert.equal(formatAttendanceShares("0001000.120000"), "1,000.12");
  assert.equal(formatAttendanceShares("0.000001"), "0.000001");
  assert.equal(sumAttendanceShares([row({ shareValue: "999999999999999999999999.999999" }), row({ shareValue: "0.000001" })]), "1000000000000000000000000");
  assert.equal(sumAttendanceShares([row({ shareValue: "0.1" }), row({ shareValue: "0.2" })]), "0.3");
  assert.equal(sumAttendanceShares([]), "0");
});

test("text sorting uses natural IDs and case-insensitive names", () => {
  const rows = [row({ id: "ten", shareholderId: "SH-10" }), row({ id: "two", shareholderId: "sh-2" })];
  assert.deepEqual(ids(filterAttendance(rows, filters(), [{ key: "shareholderId", direction: "asc" }])), ["two", "ten"]);
  const names = [row({ id: "b", shareholderName: "bob" }), row({ id: "a", shareholderName: "Alice" })];
  assert.deepEqual(ids(filterAttendance(names, filters(), [{ key: "shareholderName", direction: "asc" }])), ["a", "b"]);
});

test("multi-column sorting honors priority, each direction and deterministic attendance-ID ties", () => {
  const rows = [
    row({ id: "c", shareholderName: "Beta", shareValue: "20" }),
    row({ id: "b", shareholderName: "Alpha", shareValue: "10" }),
    row({ id: "a", shareholderName: "alpha", shareValue: "10" }),
    row({ id: "d", shareholderName: "Alpha", shareValue: "20" }),
  ];
  const sorts = [{ key: "shareholderName", direction: "asc" }, { key: "shareValue", direction: "desc" }];
  assert.deepEqual(ids(filterAttendance(rows, filters(), sorts)), ["d", "a", "b", "c"]);
  assert.deepEqual(ids(filterAttendance([...rows].reverse(), filters(), sorts)), ["d", "a", "b", "c"]);
});

test("check-in sorting compares chronological timestamps instead of display dates", () => {
  const rows = [row({ id: "nov", createdAt: "2026-11-01T00:00:00Z" }), row({ id: "oct", createdAt: "2026-10-31T23:59:59Z" })];
  assert.deepEqual(ids(filterAttendance(rows, filters(), INITIAL_ATTENDANCE_SORT)), ["oct", "nov"]);
});

test("all other displayed fields are sortable including null and legacy representatives", () => {
  const rows = [
    row({ id: "b", shareholderNameAm: "በ", representedById: "REP-10", representedByName: "Zulu" }),
    row({ id: "a", shareholderNameAm: "አ", representedById: "REP-2", representativeName: "Alpha" }),
  ];
  for (const key of ["shareholderNameAm", "representedById", "representedByName"]) {
    const ascending = filterAttendance(rows, filters(), [{ key, direction: "asc" }]);
    const descending = filterAttendance(rows, filters(), [{ key, direction: "desc" }]);
    assert.deepEqual(ids(descending), ids(ascending).reverse(), key);
  }
  assert.deepEqual(ids(filterAttendance([rows[0], row({ id: "self" })], filters(), [{ key: "attendanceType", direction: "asc" }])), ["b", "self"]);
});

test("filtering, sorting and pagination preserve source arrays and exportable matching rows", () => {
  const rows = Array.from({ length: 61 }, (_, index) => Object.freeze(row({ id: String(index).padStart(3, "0"), shareValue: String(index) })));
  Object.freeze(rows);
  const sorts = Object.freeze([Object.freeze({ key: "shareValue", direction: "desc" })]);
  const applied = Object.freeze(filters({ minShares: "1" }));
  const matching = filterAttendance(rows, applied, sorts);
  assert.equal(matching.length, 60);
  const paginated = paginateAttendance(matching, 2, 25);
  assert.deepEqual(ids(paginated.rows), matching.slice(25, 50).map((item) => item.id));
  assert.deepEqual({ page: paginated.page, size: paginated.size }, { page: 2, size: 25 });
  assert.equal(matching.length, 60, "pagination must not truncate all-matching exports");
  assert.equal(rows[0].id, "000");
  assert.equal(rows[60].id, "060");
  assert.deepEqual(paginateAttendance(matching, 10, "all"), { page: 1, size: 60, rows: matching });
  assert.equal(paginateAttendance(matching, 99, 25).page, 3);
  assert.deepEqual(paginateAttendance([], 99, "all"), { page: 1, size: 1, rows: [] });
});

test("filter summary includes only active filters and identifies representative and EAT bounds", () => {
  assert.deepEqual(attendanceFilterSummary(filters()), []);
  const sample = row({ representedById: "REP-1", representedByName: "Alice" });
  const options = representativeOptions([sample]);
  const summary = attendanceFilterSummary(filters({ search: "  Bekele  ", representative: options[0].value, minShares: "0", to: "2026-11-17T09:00" }), options);
  assert.deepEqual(summary, [["Search", "Bekele"], ["Representative", "Alice (REP-1)"], ["Minimum shares", "0"], ["Check-in to (EAT, inclusive minute)", "2026-11-17 09:00"]]);
});

test("Excel cells preserve leading-zero IDs, formula-like text, large shares and usable numeric values", () => {
  const sample = row({ shareholderId: "000123", shareholderName: "=HYPERLINK(\"https://example.test\")", shareValue: "999999999999999999999999.999999" });
  assert.equal(attendanceExcelValue(sample, "shareValue"), sample.shareValue);
  assert.equal(attendanceExcelValue(row({ shareValue: "123.125" }), "shareValue"), 123.125);
  assert.equal(attendanceExcelValue(row({ shareValue: "0.000001" }), "shareValue"), 0.000001);
  assert.equal(attendanceExcelValue(row({ shareValue: "123456789012345" }), "shareValue"), 123456789012345);
  assert.equal(attendanceExcelValue(row({ shareValue: "1234567890123456" }), "shareValue"), "1234567890123456");
  const sheet = XLSX.utils.aoa_to_sheet([["ID", "Name", "Shares", "Check-in (EAT)"], [
    attendanceExcelValue(sample, "shareholderId"), attendanceExcelValue(sample, "shareholderName"), attendanceExcelValue(sample, "shareValue"), attendanceExcelValue(sample, "createdAt"),
  ]]);
  sheet.D2.z = "dd mmm yyyy hh:mm:ss";
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, "Attendance");
  const read = XLSX.read(XLSX.write(book, { type: "buffer", bookType: "xlsx" }), { type: "buffer", cellNF: true });
  const exported = read.Sheets.Attendance;
  assert.equal(exported.A2.t, "s");
  assert.equal(exported.A2.v, "000123");
  assert.equal(exported.B2.t, "s");
  assert.equal(exported.B2.v, sample.shareholderName);
  assert.equal(exported.B2.f, undefined);
  assert.equal(exported.C2.t, "s");
  assert.equal(exported.C2.v, sample.shareValue);
  assert.equal(exported.D2.t, "n");
  assert.equal(exported.D2.z, "dd mmm yyyy hh:mm:ss");
});
