"use client";

import { Filter, Plus, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ErrorNotice } from "@/components/workspace/Feedback";
import {
  ATTENDANCE_COLUMNS,
  type AttendanceColumnKey,
  type AttendanceFilters,
  type AttendanceSort,
} from "@/lib/attendance-report";

export type AttendanceExportScope = "matching" | "page";
export type AttendancePageSize = number | "all";

type Props = {
  filters: AttendanceFilters;
  onFilter: <K extends keyof AttendanceFilters>(key: K, value: AttendanceFilters[K]) => void;
  sorts: AttendanceSort[];
  onSorts: (sorts: AttendanceSort[]) => void;
  columns: AttendanceColumnKey[];
  onColumns: (columns: AttendanceColumnKey[]) => void;
  representatives: { value: string; label: string }[];
  pageSize: AttendancePageSize;
  onPageSize: (size: AttendancePageSize) => void;
  exportScope: AttendanceExportScope;
  onExportScope: (scope: AttendanceExportScope) => void;
  error: string;
  disabled: boolean;
  onReset: () => void;
};

const textFilters = [
  ["shareholderName", "Shareholder name"],
  ["shareholderNameAm", "Shareholder name (Amharic)"],
  ["representativeId", "Representative ID"],
  ["representativeName", "Representative name"],
] as const;

export function AttendanceReportControls({
  filters, onFilter, sorts, onSorts, columns, onColumns, representatives,
  pageSize, onPageSize, exportScope, onExportScope, error, disabled, onReset,
}: Props) {
  const changeSort = (index: number, change: Partial<AttendanceSort>) =>
    onSorts(sorts.map((sort, position) => position === index ? { ...sort, ...change } : sort));

  const sortField = (index: number) => (
    <label className="field-label">
      {index === 0 ? "Sort by" : `Then sort by (${index + 1})`}
      <select aria-label={index === 0 ? "Sort by" : `Then sort by (${index + 1})`} className="filter-select" value={sorts[index].key}
        onChange={(event) => changeSort(index, { key: event.target.value as AttendanceColumnKey })}>
        {ATTENDANCE_COLUMNS.map((column) => (
          <option key={column.key} value={column.key}
            disabled={sorts.some((sort, position) => position !== index && sort.key === column.key)}>
            {column.label}
          </option>
        ))}
      </select>
    </label>
  );

  const sortDirection = (index: number) => (
    <label className="field-label">
      {index === 0 ? "Sort direction" : `Sort direction (${index + 1})`}
      <select aria-label={index === 0 ? "Sort direction" : `Sort direction (${index + 1})`} className="filter-select" value={sorts[index].direction}
        onChange={(event) => changeSort(index, { direction: event.target.value as AttendanceSort["direction"] })}>
        <option value="asc">Ascending</option>
        <option value="desc">Descending</option>
      </select>
    </label>
  );

  return (
    <section className="panel" aria-label="Attendance report controls">
      <div className="panel-heading">
        <div>
          <h2>Filter and customize attendance</h2>
          <p>Changes update the table and both exports immediately. All times use East Africa Time (UTC+3).</p>
        </div>
        <Filter size={19} className="shrink-0 text-muted-foreground" />
      </div>
      <fieldset className="report-filters" disabled={disabled}>
        <legend className="sr-only">Attendance filters and export options</legend>
        <div className="filter-grid">
          <label className="field-label">
            Search attendance
            <div className="search-field w-full">
              <Search size={17} />
              <Input value={filters.search} onChange={(event) => onFilter("search", event.target.value)}
                placeholder="Search names, IDs, shares, or check-in" />
            </div>
          </label>
          <label className="field-label">
            Attendance type
            <select aria-label="Attendance type" className="filter-select" value={filters.attendanceType}
              onChange={(event) => onFilter("attendanceType", event.target.value as AttendanceFilters["attendanceType"])}>
              <option value="">All attendance types</option>
              <option value="self">Self</option>
              <option value="represented">Represented</option>
            </select>
          </label>
          <label className="field-label">
            Representative
            <select aria-label="Representative" className="filter-select" value={filters.representative}
              onChange={(event) => onFilter("representative", event.target.value)}>
              <option value="">All representatives</option>
              {representatives.map((representative) => (
                <option key={representative.value} value={representative.value}>{representative.label}</option>
              ))}
            </select>
          </label>
          <label className="field-label">
            Shareholder ID
            <Input value={filters.shareholderId} onChange={(event) => onFilter("shareholderId", event.target.value)}
              placeholder="Contains ID" />
          </label>
        </div>
        <details className="advanced-filters">
          <summary>Names, representative IDs, shares, and check-in dates</summary>
          <div className="filter-grid mt-4">
            {textFilters.map(([key, label]) => (
              <label className="field-label" key={key}>
                {label}
                <Input value={filters[key]} onChange={(event) => onFilter(key, event.target.value)}
                  placeholder={`Contains ${key.includes("Id") ? "ID" : "name"}`} />
              </label>
            ))}
            <label className="field-label">
              Minimum shares
              <Input type="number" min="0" step="0.000001" value={filters.minShares}
                onChange={(event) => onFilter("minShares", event.target.value)} />
            </label>
            <label className="field-label">
              Maximum shares
              <Input type="number" min="0" step="0.000001" value={filters.maxShares}
                onChange={(event) => onFilter("maxShares", event.target.value)} />
            </label>
            <label className="field-label">
              Check-in from (EAT)
              <Input type="datetime-local" value={filters.from}
                onChange={(event) => onFilter("from", event.target.value)} />
            </label>
            <label className="field-label">
              Check-in to (EAT)
              <Input type="datetime-local" value={filters.to}
                onChange={(event) => onFilter("to", event.target.value)} />
            </label>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Share ranges include both limits. Check-in ranges include the entire ending minute.</p>
        </details>
        <div className="filter-grid">
          {sortField(0)}
          {sortDirection(0)}
          <label className="field-label">
            Rows per page
            <select aria-label="Rows per page" className="filter-select" value={pageSize}
              onChange={(event) => onPageSize(event.target.value === "all" ? "all" : Number(event.target.value))}>
              {[10, 25, 50, 100].map((size) => <option key={size} value={size}>{size}</option>)}
              <option value="all">All matching records</option>
            </select>
          </label>
          <label className="field-label">
            Export records
            <select aria-label="Export records" className="filter-select" value={exportScope}
              onChange={(event) => onExportScope(event.target.value as AttendanceExportScope)}>
              <option value="matching">All matching records</option>
              <option value="page">Current page</option>
            </select>
          </label>
        </div>
        <details className="advanced-filters">
          <summary>Additional sorting ({Math.max(0, sorts.length - 1)}) and columns ({columns.length} selected)</summary>
          <div className="mt-4 grid gap-4">
            {sorts.slice(1).map((_, offset) => (
              <div key={offset + 1} className="flex flex-wrap items-end gap-3">
                <div className="min-w-0 flex-1">{sortField(offset + 1)}</div>
                <div className="min-w-0 flex-1">{sortDirection(offset + 1)}</div>
                <Button type="button" variant="outline" size="icon" aria-label={`Remove sort ${offset + 2}`}
                  onClick={() => onSorts(sorts.filter((_, index) => index !== offset + 1))}>
                  <X />
                </Button>
              </div>
            ))}
            <div>
              <Button type="button" variant="outline" size="sm" disabled={sorts.length === ATTENDANCE_COLUMNS.length}
                onClick={() => {
                  const next = ATTENDANCE_COLUMNS.find((column) => !sorts.some((sort) => sort.key === column.key));
                  if (next) onSorts([...sorts, { key: next.key, direction: "asc" }]);
                }}>
                <Plus /> Add sort
              </Button>
              <p className="mt-2 text-xs text-muted-foreground">Sorts apply in order. You can also click a table heading to change the primary sort.</p>
            </div>
            <fieldset className="min-w-0">
              <legend className="mb-3 text-xs font-semibold">Columns for the table, PDF, and Excel</legend>
              <div className="filter-grid">
                {ATTENDANCE_COLUMNS.map((column) => (
                  <label key={column.key} className="flex items-center gap-2 text-xs">
                    <Checkbox checked={columns.includes(column.key)}
                      disabled={columns.length === 1 && columns.includes(column.key)}
                      onCheckedChange={(checked) => onColumns(ATTENDANCE_COLUMNS
                        .filter((item) => item.key === column.key ? checked === true : columns.includes(item.key))
                        .map((item) => item.key))} />
                    {column.label}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        </details>
        {error && <ErrorNotice message={error} />}
        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" variant="outline" onClick={onReset}>Reset view</Button>
          <p className="text-xs text-muted-foreground">Clear filters to export the full attendance report.</p>
        </div>
      </fieldset>
    </section>
  );
}
