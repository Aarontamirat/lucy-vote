export type AttendanceRow = {
  id: string;
  shareholderId: string;
  shareholderName: string;
  shareholderNameAm: string | null;
  shareValue: string;
  representedById: string | null;
  representedByName: string | null;
  representativeName: string | null;
  createdAt: string;
};

export type AttendanceReport = {
  meetingTitle: string;
  meetingStatus: string;
  quorumPct: number;
  totalShares: number;
  attendedShares: number;
  quorumMet: boolean;
  required: number;
  attendeesCount: number;
  totalShareholdersCount: number;
  attendance: AttendanceRow[];
};

export type AttendanceColumnKey =
  | "shareholderId"
  | "shareholderName"
  | "shareholderNameAm"
  | "shareValue"
  | "attendanceType"
  | "representedById"
  | "representedByName"
  | "createdAt";

export const ATTENDANCE_COLUMNS: { key: AttendanceColumnKey; label: string }[] = [
  { key: "shareholderId", label: "ID" },
  { key: "shareholderName", label: "Shareholder" },
  { key: "shareholderNameAm", label: "Shareholder (Amharic)" },
  { key: "shareValue", label: "Shares" },
  { key: "attendanceType", label: "Attendance type" },
  { key: "representedById", label: "Representative ID" },
  { key: "representedByName", label: "Represented by" },
  { key: "createdAt", label: "Check-in (EAT)" },
];

export const DEFAULT_ATTENDANCE_COLUMNS: AttendanceColumnKey[] = [
  "shareholderId",
  "shareholderName",
  "shareValue",
  "representedByName",
  "createdAt",
];

export type AttendanceFilters = {
  search: string;
  shareholderId: string;
  shareholderName: string;
  shareholderNameAm: string;
  representativeId: string;
  representativeName: string;
  representative: string;
  attendanceType: "" | "self" | "represented";
  minShares: string;
  maxShares: string;
  from: string;
  to: string;
};

export const INITIAL_ATTENDANCE_FILTERS: AttendanceFilters = {
  search: "",
  shareholderId: "",
  shareholderName: "",
  shareholderNameAm: "",
  representativeId: "",
  representativeName: "",
  representative: "",
  attendanceType: "",
  minShares: "",
  maxShares: "",
  from: "",
  to: "",
};

export type AttendanceSort = {
  key: AttendanceColumnKey;
  direction: "asc" | "desc";
};

export const INITIAL_ATTENDANCE_SORT: AttendanceSort[] = [
  { key: "createdAt", direction: "asc" },
];

const collator = new Intl.Collator("en", { numeric: true, sensitivity: "base" });
const SHARE_SCALE = BigInt(1_000_000);
const ZERO = BigInt(0);
const EAT_OFFSET_MS = 3 * 60 * 60 * 1000;
const checkInFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "Africa/Nairobi",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

type CachedAttendanceRow = {
  source: AttendanceRow;
  shares: bigint | null;
  checkedIn: number;
  checkedInLabel: string;
  searchValues: string[];
};
const rowCache = new WeakMap<AttendanceRow, CachedAttendanceRow>();

function decimalShares(value: string): bigint | null {
  const trimmed = value.trim();
  if (!/^(?:\d+(?:\.\d{0,6})?|\.\d{1,6})$/.test(trimmed)) return null;
  const [whole = "", fraction = ""] = trimmed.split(".");
  return BigInt(whole || "0") * SHARE_SCALE + BigInt(fraction.padEnd(6, "0"));
}

function incomingDecimalShares(value: string): bigint | null {
  const plain = decimalShares(value);
  if (plain !== null) return plain;
  const scientific = /^(\d+(?:\.\d*)?|\.\d+)[eE]([+-]?\d+)$/.exec(value.trim());
  if (!scientific) return null;
  const exponent = Number(scientific[2]);
  if (!Number.isSafeInteger(exponent)) return null;
  const [whole, fraction = ""] = scientific[1].split(".");
  const digits = `${whole}${fraction}`.replace(/^0+/, "") || "0";
  if (digits === "0") return ZERO;
  const shift = exponent - fraction.length + 6;
  if (shift < 0) {
    // Scientific notation can have a long mantissa while its value still fits Decimal(30,6).
    // Remove only zero digits; values smaller than a millionth must never be rounded.
    const discarded = -shift;
    if (discarded >= digits.length || !/^0+$/.test(digits.slice(-discarded))) return null;
    return BigInt(digits.slice(0, -discarded));
  }
  // Attendance shares have at most 24 whole digits and 6 fractional digits.
  if (digits.length + shift > 30) return null;
  return BigInt(digits + "0".repeat(shift));
}

function decimalString(value: bigint): string {
  const whole = (value / SHARE_SCALE).toString();
  const fraction = (value % SHARE_SCALE).toString().padStart(6, "0").replace(/0+$/, "");
  return fraction ? `${whole}.${fraction}` : whole;
}

export function formatAttendanceShares(value: string): string {
  const decimal = incomingDecimalShares(value);
  if (decimal === null) return value;
  const [whole, fraction] = decimalString(decimal).split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return fraction ? `${grouped}.${fraction}` : grouped;
}

function nonempty(value: string | null | undefined): string {
  return value?.trim() ?? "";
}

export function attendanceType(row: AttendanceRow): "self" | "represented" {
  return nonempty(row.representedById) || nonempty(row.representedByName) || nonempty(row.representativeName)
    ? "represented"
    : "self";
}

export function representativeLabel(row: AttendanceRow): string {
  if (attendanceType(row) === "self") return "Self";
  return nonempty(row.representedByName) || nonempty(row.representativeName) || "Unknown representative";
}

function cachedRow(row: AttendanceRow): CachedAttendanceRow {
  const cached = rowCache.get(row);
  if (cached &&
    cached.source.shareholderId === row.shareholderId &&
    cached.source.shareholderName === row.shareholderName &&
    cached.source.shareholderNameAm === row.shareholderNameAm &&
    cached.source.shareValue === row.shareValue &&
    cached.source.representedById === row.representedById &&
    cached.source.representedByName === row.representedByName &&
    cached.source.representativeName === row.representativeName &&
    cached.source.createdAt === row.createdAt) return cached;

  const checkedIn = Date.parse(row.createdAt);
  const checkedInLabel = Number.isFinite(checkedIn)
    ? checkInFormatter.format(new Date(checkedIn))
    : row.createdAt;
  const shares = incomingDecimalShares(row.shareValue);
  const value: CachedAttendanceRow = {
    source: { ...row },
    shares,
    checkedIn,
    checkedInLabel,
    searchValues: [
      row.shareholderId,
      row.shareholderName,
      row.shareholderNameAm,
      row.shareValue,
      shares !== null ? decimalString(shares) : "",
      formatAttendanceShares(row.shareValue),
      row.representedById,
      row.representedByName,
      row.representativeName,
      attendanceType(row),
      representativeLabel(row),
      checkedInLabel,
    ].map((field) => (field ?? "").toLocaleLowerCase()),
  };
  rowCache.set(row, value);
  return value;
}

function representativeToken(row: AttendanceRow): string {
  const id = nonempty(row.representedById);
  if (id) return `id:${encodeURIComponent(id)}`;
  if (attendanceType(row) === "self") return "";
  return `name:${encodeURIComponent(representativeLabel(row))}`;
}

export function representativeOptions(rows: AttendanceRow[]): { value: string; label: string }[] {
  const options = new Map<string, string>();
  for (const row of rows) {
    const value = representativeToken(row);
    if (!value || options.has(value)) continue;
    const id = nonempty(row.representedById);
    options.set(value, `${representativeLabel(row)}${id ? ` (${id})` : " (name only)"}`);
  }
  return Array.from(options, ([value, label]) => ({ value, label })).sort(
    (a, b) => collator.compare(a.label, b.label) || a.value.localeCompare(b.value),
  );
}

// datetime-local has no timezone. Explicit EAT keeps filters consistent on every device.
function eatTimestamp(value: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?$/.test(value)) return null;
  const timestamp = Date.parse(`${value}+03:00`);
  if (!Number.isFinite(timestamp)) return null;
  const local = new Date(timestamp + EAT_OFFSET_MS).toISOString();
  // Date.parse normalizes impossible dates such as 30 February; reject those inputs.
  if (local.slice(0, 16) !== value.slice(0, 16)) return null;
  return timestamp;
}

function endOfMinute(timestamp: number): number {
  return Math.floor(timestamp / 60_000) * 60_000 + 59_999;
}

export function validateAttendanceFilters(filters: AttendanceFilters): string {
  const minimum = filters.minShares.trim() ? decimalShares(filters.minShares) : null;
  const maximum = filters.maxShares.trim() ? decimalShares(filters.maxShares) : null;
  if ((filters.minShares.trim() && minimum === null) || (filters.maxShares.trim() && maximum === null)) {
    return "Enter non-negative share values with up to 6 decimal places, without commas or exponents.";
  }
  if (minimum !== null && maximum !== null && minimum > maximum) {
    return "The minimum shares cannot exceed the maximum shares.";
  }
  const from = filters.from ? eatTimestamp(filters.from) : null;
  const to = filters.to ? eatTimestamp(filters.to) : null;
  if ((filters.from && from === null) || (filters.to && to === null)) {
    return "Enter valid check-in dates and times in East Africa Time.";
  }
  if (from !== null && to !== null && from > endOfMinute(to)) {
    return "The check-in start must be before the end.";
  }
  return "";
}

function compareRows(a: AttendanceRow, b: AttendanceRow, key: AttendanceColumnKey): number {
  if (key === "shareValue") {
    const left = cachedRow(a).shares;
    const right = cachedRow(b).shares;
    if (left !== null && right !== null) return left < right ? -1 : left > right ? 1 : 0;
  }
  if (key === "createdAt") return cachedRow(a).checkedIn - cachedRow(b).checkedIn;
  return collator.compare(attendanceCell(a, key), attendanceCell(b, key));
}

export function filterAttendance(
  rows: AttendanceRow[],
  filters: AttendanceFilters,
  sorts: AttendanceSort[] = INITIAL_ATTENDANCE_SORT,
): AttendanceRow[] {
  if (validateAttendanceFilters(filters)) return [];
  const minimum = filters.minShares.trim() ? decimalShares(filters.minShares) : null;
  const maximum = filters.maxShares.trim() ? decimalShares(filters.maxShares) : null;
  const from = filters.from ? eatTimestamp(filters.from) : null;
  const to = filters.to ? eatTimestamp(filters.to) : null;
  const query = filters.search.trim().toLocaleLowerCase();
  const textQueries: ["shareholderId" | "shareholderName" | "shareholderNameAm" | "representedById" | "representedByName", string][] = [
    ["shareholderId", filters.shareholderId],
    ["shareholderName", filters.shareholderName],
    ["shareholderNameAm", filters.shareholderNameAm],
    ["representedById", filters.representativeId],
    ["representedByName", filters.representativeName],
  ];
  const activeTextQueries = textQueries
    .map(([key, value]) => [key, value.trim().toLocaleLowerCase()] as const)
    .filter(([, value]) => value);
  return rows.filter((row) => {
    if (query && !cachedRow(row).searchValues.some((value) => value.includes(query))) return false;
    if (!activeTextQueries.every(([key, value]) => attendanceCell(row, key).toLocaleLowerCase().includes(value))) return false;
    if (filters.attendanceType && attendanceType(row) !== filters.attendanceType) return false;
    if (filters.representative && representativeToken(row) !== filters.representative) return false;
    if (minimum !== null || maximum !== null) {
      const shares = cachedRow(row).shares;
      if (shares === null || (minimum !== null && shares < minimum) || (maximum !== null && shares > maximum)) return false;
    }
    if (from !== null || to !== null) {
      const checkedIn = cachedRow(row).checkedIn;
      if (!Number.isFinite(checkedIn) || (from !== null && checkedIn < from) || (to !== null && checkedIn > endOfMinute(to))) return false;
    }
    return true;
  }).sort((a, b) => {
    for (const sort of sorts) {
      const compared = compareRows(a, b, sort.key);
      if (compared) return sort.direction === "asc" ? compared : -compared;
    }
    return a.id.localeCompare(b.id);
  });
}

export function attendanceCell(row: AttendanceRow, key: AttendanceColumnKey): string {
  switch (key) {
    case "shareValue": return formatAttendanceShares(row.shareValue);
    case "attendanceType": return attendanceType(row) === "self" ? "Self" : "Represented";
    case "representedByName": return representativeLabel(row);
    case "createdAt": return cachedRow(row).checkedInLabel;
    default: return row[key] ?? "";
  }
}

export function sumAttendanceShares(rows: AttendanceRow[]): string {
  return decimalString(rows.reduce((sum, row) => sum + (cachedRow(row).shares ?? ZERO), ZERO));
}

export function attendanceFilterSummary(
  filters: AttendanceFilters,
  options: { value: string; label: string }[] = [],
): [string, string][] {
  const entries: [string, string][] = [
    ["Search", filters.search.trim()],
    ["Shareholder ID", filters.shareholderId.trim()],
    ["Shareholder name", filters.shareholderName.trim()],
    ["Shareholder name (Amharic)", filters.shareholderNameAm.trim()],
    ["Representative ID", filters.representativeId.trim()],
    ["Representative name", filters.representativeName.trim()],
    ["Representative", options.find((option) => option.value === filters.representative)?.label ?? filters.representative],
    ["Attendance type", filters.attendanceType ? filters.attendanceType === "self" ? "Self" : "Represented" : ""],
    ["Minimum shares", filters.minShares.trim()],
    ["Maximum shares", filters.maxShares.trim()],
    ["Check-in from (EAT)", filters.from.replace("T", " ")],
    ["Check-in to (EAT, inclusive minute)", filters.to.replace("T", " ")],
  ];
  return entries.filter(([, value]) => Boolean(value));
}

export function paginateAttendance(rows: AttendanceRow[], page: number, pageSize: number | "all") {
  const size = pageSize === "all" ? Math.max(1, rows.length) : Math.max(1, Math.floor(pageSize));
  const activePage = Math.min(Math.max(1, Math.floor(page)), Math.max(1, Math.ceil(rows.length / size)));
  return { page: activePage, size, rows: rows.slice((activePage - 1) * size, activePage * size) };
}

export function attendanceExcelValue(row: AttendanceRow, key: AttendanceColumnKey): string | number {
  if (key === "shareValue") {
    const decimal = cachedRow(row).shares;
    if (decimal === null) return row.shareValue;
    const exact = decimalString(decimal);
    const significant = exact.replace(".", "").replace(/^0+/, "").replace(/0+$/, "");
    return significant.length <= 15 ? Number(exact) : exact;
  }
  if (key === "createdAt") {
    return (cachedRow(row).checkedIn + EAT_OFFSET_MS) / 86_400_000 + 25_569;
  }
  return attendanceCell(row, key);
}
