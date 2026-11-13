import assert from "node:assert/strict";
import { test } from "node:test";
import * as XLSX from "xlsx";
import { loadAuthenticatedRoute as loadTypescript } from "./helpers/load-typescript.mjs";

const {
  parseShareholderWorkbook,
  createShareholderTemplate,
} = loadTypescript("lib/shareholder-import.ts");
const {
  SHAREHOLDER_IMPORT_COLUMNS,
  SHAREHOLDER_IMPORT_MAX_BYTES,
  SHAREHOLDER_IMPORT_MAX_ROWS,
  SHAREHOLDER_IMPORT_MAX_ISSUES,
} = loadTypescript("lib/shareholder-import-config.ts");
const headers = SHAREHOLDER_IMPORT_COLUMNS.map((column) => column.header);
const valid = ["000123", "Abebe Bekele", "አበበ በቀለ", "+251911000000", "Addis Ababa", "494.123456"];

function workbook(rows, { columns = headers, bookType = "xlsx", edit } = {}) {
  const book = XLSX.utils.book_new();
  const sheet = XLSX.utils.aoa_to_sheet([columns, ...rows]);
  edit?.(sheet, book);
  XLSX.utils.book_append_sheet(book, sheet, "Shareholders");
  return XLSX.write(book, { type: "buffer", bookType });
}

function parse(rows, options) {
  return parseShareholderWorkbook(workbook(rows, options), options?.bookType === "xls" ? "holders.xls" : "holders.xlsx");
}

function expectIssue(rows, column, message, options) {
  assert.throws(() => parse(rows, options), (error) => {
    assert.equal(error.status, 400);
    assert.ok(error.issues.some((issue) => issue.column === column && message.test(issue.message)), JSON.stringify(error.issues));
    return true;
  });
}

test("the downloadable template is a real workbook, with empty data rows and text formats", async () => {
  const response = loadTypescript("app/api/shareholders/template/route.ts").GET();
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("content-type"), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  assert.match(response.headers.get("content-disposition"), /attachment; filename="shareholders-import-template.xlsx"/);
  const buffer = Buffer.from(await response.arrayBuffer());
  const book = XLSX.read(buffer, { type: "buffer", cellNF: true });
  assert.deepEqual(book.SheetNames, ["Shareholders", "Instructions"]);
  assert.deepEqual(XLSX.utils.sheet_to_json(book.Sheets.Shareholders, { header: 1, blankrows: false })[0], headers);
  for (const address of ["A2", "D2", "F2", "A1001", "F1001"]) {
    assert.equal(book.Sheets.Shareholders[address].z, "@");
    assert.equal(book.Sheets.Shareholders[address].v, "");
  }
  assert.throws(() => parseShareholderWorkbook(buffer, "template.xlsx"), /No shareholder data/);
});

test("a filled-in generated template round-trips leading zeros, Amharic and exact decimal strings", () => {
  const book = XLSX.read(createShareholderTemplate(), { type: "buffer" });
  XLSX.utils.sheet_add_aoa(book.Sheets.Shareholders, [valid], { origin: "A2" });
  const { shareholders } = parseShareholderWorkbook(XLSX.write(book, { type: "buffer", bookType: "xlsx" }), "template.xlsx");
  assert.deepEqual(shareholders, [{
    id: "000123", name: "Abebe Bekele", nameAm: "አበበ በቀለ", phone: "+251911000000", address: "Addis Ababa", shareValue: "494.123456",
  }]);
});

test("legacy .xls workbooks remain supported", () => {
  assert.equal(parse([valid], { bookType: "xls" }).shareholders[0].nameAm, "አበበ በቀለ");
});

test("optional columns may be absent, and zero shares and alphanumeric IDs are valid", () => {
  const { shareholders } = parse([["SH-001", "Name", 0]], { columns: ["Id", "Name", "Share Value"] });
  assert.deepEqual(shareholders[0], { id: "SH-001", name: "Name", nameAm: null, phone: null, address: null, shareValue: "0" });
});

test("reordered, trimmed and case-insensitive headers work without losing data", () => {
  const { shareholders } = parse([[" 0.000001 ", "  Name  ", " SH-123 "]], { columns: [" share   value ", "NAME", " id "] });
  assert.equal(shareholders[0].id, "SH-123");
  assert.equal(shareholders[0].name, "Name");
  assert.equal(shareholders[0].shareValue, "0.000001");
});

test("the Shareholders worksheet is selected even when instructions are first", () => {
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, XLSX.utils.aoa_to_sheet([["Instructions"]]), "Instructions");
  XLSX.utils.book_append_sheet(book, XLSX.utils.aoa_to_sheet([headers, valid]), "Shareholders");
  assert.equal(parseShareholderWorkbook(XLSX.write(book, { type: "buffer", bookType: "xlsx" }), "data.xlsx").shareholders.length, 1);
});

test("existing files with a different first worksheet name can still import", () => {
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, XLSX.utils.aoa_to_sheet([headers, valid]), "Sheet1");
  assert.equal(parseShareholderWorkbook(XLSX.write(book, { type: "buffer", bookType: "xlsx" }), "data.xlsx").shareholders.length, 1);
});

test("blank rows are ignored, and errors retain the original Excel row number", () => {
  const row = [...valid];
  row[1] = " ";
  assert.throws(() => parse([[], valid, [], row]), (error) => {
    assert.ok(error.issues.some((issue) => issue.row === 5 && issue.column === "Name"));
    return true;
  });
  assert.equal(parse([[], valid, [], []]).shareholders.length, 1);
});

test("numeric ID and phone cells retain explicit leading-zero formatting", () => {
  const row = [...valid];
  row[0] = 123;
  row[3] = 911000000;
  const { shareholders } = parse([row], { edit: (sheet) => {
    sheet.A2.z = "000000";
    sheet.D2.z = "0000000000";
  } });
  assert.equal(shareholders[0].id, "000123");
  assert.equal(shareholders[0].phone, "0911000000");
});

test("missing, duplicated and unknown headers are rejected before row mapping", () => {
  expectIssue([valid], "Id", /missing/, { columns: ["", ...headers.slice(1)] });
  expectIssue([valid], "Id", /more than once/, { columns: ["Id", " id ", ...headers.slice(2)] });
  expectIssue([valid], "Nmae", /Unrecognized/, { columns: ["Id", "Nmae", ...headers.slice(2)] });
});

test("data under a blank column header is rejected rather than silently discarded", () => {
  expectIssue([[...valid, "Unexpected value"]], "G", /no column header/, { columns: [...headers, ""] });
});

test("duplicate IDs, including trimmed case and accent variants, abort the workbook", () => {
  for (const ids of [["001", " 001 "], ["SH-A", "sh-a"], ["José", "Jose"]]) {
    assert.throws(() => parse([[ids[0], ...valid.slice(1)], [ids[1], ...valid.slice(1)]]), (error) => {
      assert.ok(error.issues.some((issue) => issue.row === 3 && /first appears on row 2/.test(issue.message)));
      return true;
    });
  }
});

for (const [column, index] of [["Id", 0], ["Name", 1], ["Share Value", 5]]) {
  test(`missing ${column} values are rejected with row and column details`, () => {
    const row = [...valid];
    row[index] = undefined;
    expectIssue([row], column, /required/);
  });
}

for (const value of ["-1", -1, "NaN", "Infinity", "1,000", "$20", "1e3", "1.1234567", "1234567890123456789012345"]) {
  test(`invalid share value ${JSON.stringify(value)} is rejected before database insertion`, () => {
    expectIssue([[...valid.slice(0, 5), value]], "Share Value", /non-negative|at most/);
  });
}

test("valid decimal boundaries preserve exact precision without floating-point conversion", () => {
  for (const [value, expected] of [[0, "0"], [0.000001, "0.000001"], [123.125, "123.125"], [".5", "0.5"], ["000001.123456", "1.123456"], ["999999999999999999999999.999999", "999999999999999999999999.999999"]]) {
    assert.equal(parse([[...valid.slice(0, 5), value]]).shareholders[0].shareValue, expected);
  }
});

test("unsafe numeric IDs and high-precision numeric shares require text cells", () => {
  for (const value of [1e15, Number.MAX_SAFE_INTEGER + 1, 1.5]) {
    expectIssue([[value, ...valid.slice(1)]], "Id", /as text/);
  }
  expectIssue([[...valid.slice(0, 5), 1234567890123.125]], "Share Value", /as text/);
  expectIssue([[...valid.slice(0, 5), 1e15]], "Share Value", /as text/);
});

test("formulas, dates, boolean cells and Excel errors are rejected", () => {
  for (const address of ["A2", "B2", "C2", "D2", "E2", "F2"]) {
    assert.throws(() => parse([valid], { edit: (sheet) => { sheet[address] = { t: "n", v: 123, f: "SUM(1,2)" }; } }), /Fix the listed rows/);
  }
  for (const cell of [{ t: "d", v: new Date("2026-11-09T00:00:00Z") }, { t: "b", v: true }, { t: "e", v: 7 }]) {
    expectIssue([valid], "Name", /text value/, { edit: (sheet) => { sheet.B2 = cell; } });
  }
});

test("all text fields respect the registry's database length limits", () => {
  for (const [index, column] of headers.entries()) {
    if (index === 5) continue;
    const row = [...valid];
    row[index] = "a".repeat(192);
    expectIssue([row], column, /191 characters/);
  }
});

test("malformed, empty and mislabeled files return readable import errors", () => {
  for (const buffer of [Buffer.from("Id,Name,Share Value\n1,Name,20"), Buffer.from([0x50, 0x4b, 0x03, 0x04, 0])]) {
    assert.throws(() => parseShareholderWorkbook(buffer, "data.xlsx"), /valid Excel|could not be read/);
  }
  assert.throws(() => parse([]), /No shareholder data/);
  assert.throws(() => parseShareholderWorkbook(workbook([valid]), "data.xls"), /not a valid Excel/);
});

test("row limits prevent truncating an oversized workbook into an apparently successful import", () => {
  const rows = Array.from({ length: SHAREHOLDER_IMPORT_MAX_ROWS + 1 }, (_, index) => [String(index), "Name", "1"]);
  assert.throws(() => parse(rows, { columns: ["Id", "Name", "Share Value"] }), /at most 10,000/);
  rows.pop();
  assert.equal(parse(rows, { columns: ["Id", "Name", "Share Value"] }).shareholders.length, SHAREHOLDER_IMPORT_MAX_ROWS);
});

test("the API limits displayed errors while retaining the total issue count", () => {
  assert.throws(() => parse(Array.from({ length: 40 }, (_, i) => [String(i), "", "", "", "", ""])), (error) => {
    assert.equal(error.issueCount, 80);
    assert.equal(error.issues.length, SHAREHOLDER_IMPORT_MAX_ISSUES);
    return true;
  });
});

function upload(buffer = workbook([valid]), filename = "data.xlsx") {
  const body = new FormData();
  body.append("file", new Blob([buffer]), filename);
  return new Request("http://localhost/api/shareholders/bulk", { method: "POST", body });
}

function database({ existing = [], count = 1, writeError } = {}) {
  const calls = { transactions: 0, reads: 0, writes: 0, data: null };
  const transaction = {
    shareholder: {
      findMany: async () => { calls.reads++; return existing; },
      createMany: async (options) => {
        calls.writes++;
        calls.data = options;
        if (writeError) throw writeError;
        return { count };
      },
    },
  };
  const prisma = { $transaction: async (callback) => {
    calls.transactions++;
    return callback(transaction);
  } };
  return { calls, prisma };
}

test("successful API imports use a transaction, do not skip duplicates and report the actual inserted count", async () => {
  const { calls, prisma } = database({ count: 2 });
  const response = await loadTypescript("app/api/shareholders/bulk/route.ts", prisma).POST(upload(workbook([valid, ["SH-2", ...valid.slice(1)]])));
  assert.equal(response.status, 201);
  assert.deepEqual(await response.json(), { ok: true, count: 2 });
  assert.equal(calls.transactions, 1);
  assert.equal(calls.writes, 1);
  assert.equal(calls.data.skipDuplicates, undefined);
  assert.equal(calls.data.data[0].shareValue, "494.123456");
});

test("invalid rows abort before opening any database transaction", async () => {
  const { calls, prisma } = database();
  const response = await loadTypescript("app/api/shareholders/bulk/route.ts", prisma).POST(upload(workbook([valid, ["SH-2", "", ...valid.slice(2)]])));
  assert.equal(response.status, 400);
  const result = await response.json();
  assert.ok(result.issues.some((issue) => issue.row === 3 && issue.column === "Name"));
  assert.equal(calls.transactions, 0);
  assert.equal(calls.writes, 0);
});

test("existing IDs return conflicts with the correct row without writing any rows", async () => {
  const { calls, prisma } = database({ existing: [{ id: "sh-2" }] });
  const response = await loadTypescript("app/api/shareholders/bulk/route.ts", prisma).POST(upload(workbook([valid, ["SH-2", ...valid.slice(1)]])));
  assert.equal(response.status, 409);
  const result = await response.json();
  assert.equal(result.issues[0].row, 3);
  assert.match(result.error, /No shareholders were imported/);
  assert.equal(calls.writes, 0);
});

test("a concurrent duplicate insertion is reported as a conflict without exposing database internals", async () => {
  const { prisma } = database({ writeError: { code: "P2002", message: "Sensitive database diagnostics" } });
  const response = await loadTypescript("app/api/shareholders/bulk/route.ts", prisma).POST(upload());
  assert.equal(response.status, 409);
  const result = await response.json();
  assert.match(result.error, /No shareholders were imported/);
  assert.doesNotMatch(result.error, /Sensitive/);
});

test("unexpected database failures return a generic server error", async (t) => {
  t.mock.method(console, "error", () => {});
  const { prisma } = database({ writeError: new Error("Sensitive database diagnostics") });
  const response = await loadTypescript("app/api/shareholders/bulk/route.ts", prisma).POST(upload());
  assert.equal(response.status, 500);
  assert.doesNotMatch((await response.json()).error, /Sensitive/);
});

test("missing uploads, string fields and malformed forms are client errors", async () => {
  const { calls, prisma } = database();
  const route = loadTypescript("app/api/shareholders/bulk/route.ts", prisma);
  const form = new FormData();
  assert.equal((await route.POST(new Request("http://localhost", { method: "POST", body: form }))).status, 400);
  form.set("file", "not a file");
  assert.equal((await route.POST(new Request("http://localhost", { method: "POST", body: form }))).status, 400);
  assert.equal((await route.POST(new Request("http://localhost", { method: "POST", body: "{}" }))).status, 400);
  assert.equal(calls.transactions, 0);
});

test("unsupported, empty and oversized uploads are rejected before parsing or database access", async () => {
  const { calls, prisma } = database();
  const route = loadTypescript("app/api/shareholders/bulk/route.ts", prisma);
  assert.equal((await route.POST(upload(Buffer.from("data"), "data.csv"))).status, 400);
  assert.equal((await route.POST(upload(Buffer.alloc(0)))).status, 400);
  assert.equal((await route.POST(upload(Buffer.alloc(SHAREHOLDER_IMPORT_MAX_BYTES + 1)))).status, 413);
  assert.equal(calls.transactions, 0);
});

test("oversized chunked request bodies are cancelled before multipart parsing", async () => {
  const { calls, prisma } = database();
  let chunksRead = 0;
  let cancelled = false;
  const stream = new ReadableStream({
    pull(controller) {
      chunksRead++;
      controller.enqueue(new Uint8Array(1024 * 1024));
    },
    cancel() { cancelled = true; },
  });
  const request = new Request("http://localhost/api/shareholders/bulk", {
    method: "POST",
    headers: { "Content-Type": "multipart/form-data; boundary=large-upload" },
    body: stream,
    duplex: "half",
  });
  const response = await loadTypescript("app/api/shareholders/bulk/route.ts", prisma).POST(request);
  assert.equal(response.status, 413);
  assert.equal(cancelled, true);
  assert.ok(chunksRead <= 7);
  assert.equal(calls.transactions, 0);
});

test("multiple workbook attachments are rejected instead of silently importing the first", async () => {
  const { calls, prisma } = database();
  const body = new FormData();
  for (const filename of ["first.xlsx", "second.xlsx"]) {
    body.append("file", new Blob([workbook([valid])]), filename);
  }
  const response = await loadTypescript("app/api/shareholders/bulk/route.ts", prisma).POST(new Request("http://localhost", { method: "POST", body }));
  assert.equal(response.status, 400);
  assert.equal(calls.transactions, 0);
});
