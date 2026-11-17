"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Download,
  FileSpreadsheet,
  RefreshCw,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/workspace/PageHeader";
import {
  EmptyState,
  ErrorNotice,
  LoadingState,
} from "@/components/workspace/Feedback";
import { Pagination } from "@/components/workspace/Pagination";
import { MetricCard } from "@/components/workspace/MetricCard";
import { useResource } from "@/components/workspace/useResource";
import { formatNumber } from "@/lib/display";
import {
  ATTENDANCE_COLUMNS,
  DEFAULT_ATTENDANCE_COLUMNS,
  INITIAL_ATTENDANCE_FILTERS,
  INITIAL_ATTENDANCE_SORT,
  attendanceCell,
  attendanceFilterSummary,
  filterAttendance,
  formatAttendanceShares,
  paginateAttendance,
  representativeOptions,
  sumAttendanceShares,
  validateAttendanceFilters,
  type AttendanceColumnKey,
  type AttendanceFilters,
  type AttendanceReport,
  type AttendanceSort,
} from "@/lib/attendance-report";
import {
  AttendanceReportControls,
  type AttendanceExportScope,
  type AttendancePageSize,
} from "./AttendanceReportControls";

export default function AttendanceReportPage() {
  const { id } = useParams();
  const { data, loading, error, reload } = useResource<AttendanceReport>(
    `/api/meetings/${id}/reports/attendance`,
  );
  const [filters, setFilters] = useState<AttendanceFilters>(
    INITIAL_ATTENDANCE_FILTERS,
  );
  const [sorts, setSorts] = useState<AttendanceSort[]>(INITIAL_ATTENDANCE_SORT);
  const [columns, setColumns] = useState<AttendanceColumnKey[]>(
    DEFAULT_ATTENDANCE_COLUMNS,
  );
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<AttendancePageSize>(25);
  const [exportScope, setExportScope] =
    useState<AttendanceExportScope>("matching");
  const [exporting, setExporting] = useState<"pdf" | "excel" | null>(null);
  const filterError = validateAttendanceFilters(filters);
  const representatives = useMemo(
    () => representativeOptions(data?.attendance ?? []),
    [data],
  );
  const rows = useMemo(
    () =>
      filterError
        ? []
        : filterAttendance(data?.attendance ?? [], filters, sorts),
    [data, filters, sorts, filterError],
  );
  const pagination = paginateAttendance(rows, page, pageSize);
  const matchingShares = useMemo(() => sumAttendanceShares(rows), [rows]);
  const attendedShares = useMemo(() => sumAttendanceShares(data?.attendance ?? []), [data]);
  const activeFilters = attendanceFilterSummary(filters, representatives);
  const selectedColumns = ATTENDANCE_COLUMNS.filter((column) =>
    columns.includes(column.key),
  );
  const exportRows = exportScope === "page" ? pagination.rows : rows;
  const scopeLabel =
    exportScope === "page"
      ? `Current page (${pagination.page})`
      : "All matching records";
  const exportDisabled =
    !data ||
    loading ||
    !!error ||
    !!filterError ||
    !!exporting ||
    !exportRows.length;

  const updateFilter = <K extends keyof AttendanceFilters>(
    key: K,
    value: AttendanceFilters[K],
  ) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  };
  const updateSorts = (next: AttendanceSort[]) => {
    setSorts(next);
    setPage(1);
  };
  const sortColumn = (key: AttendanceColumnKey) =>
    updateSorts([
      {
        key,
        direction:
          sorts[0].key === key && sorts[0].direction === "asc" ? "desc" : "asc",
      },
      ...sorts.slice(1).filter((sort) => sort.key !== key),
    ]);
  const reset = () => {
    setFilters(INITIAL_ATTENDANCE_FILTERS);
    setSorts(INITIAL_ATTENDANCE_SORT);
    setColumns(DEFAULT_ATTENDANCE_COLUMNS);
    setPageSize(25);
    setExportScope("matching");
    setPage(1);
  };
  const exportReport = async (format: "pdf" | "excel") => {
    if (!data || exportDisabled) return;
    setExporting(format);
    try {
      const { downloadAttendancePDF, downloadAttendanceExcel } =
        await import("@/lib/attendance-report-export");
      const options = {
        report: data,
        rows: exportRows,
        matchingRows: rows,
        columns,
        filters,
        sorts,
        scopeLabel,
      };
      if (format === "pdf") await downloadAttendancePDF(options);
      else await downloadAttendanceExcel(options);
      toast.success(
        `Exported ${formatNumber(exportRows.length)} attendance records to ${format === "pdf" ? "PDF" : "Excel"}.`,
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : `Failed to export ${format === "pdf" ? "PDF" : "Excel"}.`,
      );
    } finally {
      setExporting(null);
    }
  };

  return (
    <main className="work-page">
      <PageHeader
        eyebrow="Meeting report"
        title="Attendance report"
        description={
          data?.meetingTitle ??
          "Shareholder attendance, representation, and quorum."
        }
        back={{ href: `/meetings/${id}/reports`, label: "Back to reports" }}
        actions={
          <>
            <Button
              variant="outline"
              disabled={loading || !!exporting}
              onClick={reload}>
              <RefreshCw /> Refresh
            </Button>
            <Button
              variant="outline"
              disabled={exportDisabled}
              onClick={() => void exportReport("excel")}>
              <FileSpreadsheet />{" "}
              {exporting === "excel" ? "Exporting..." : "Export Excel"}
            </Button>
            <Button
              disabled={exportDisabled}
              onClick={() => void exportReport("pdf")}>
              <Download />{" "}
              {exporting === "pdf" ? "Generating..." : "Generate PDF"}
            </Button>
          </>
        }
      />
      {error && <ErrorNotice message={error} retry={reload} />}
      {data && (
        <div>
          <p className="mb-3 text-xs text-muted-foreground">
            Meeting totals and quorum before attendance filters.
          </p>
          <div className="metric-grid [&_.metric-card]:min-w-0 [&_.metric-card]:[overflow-wrap:anywhere]">
            <MetricCard
              label="Attended shareholders"
              value={formatNumber(data.attendeesCount)}
              note={`Of ${formatNumber(data.totalShareholdersCount)} registered`}
              icon={Users}
            />
            <MetricCard
              label="Attended shares"
              value={formatAttendanceShares(attendedShares)}
              note={`Of ${formatNumber(data.totalShares, 6)} total shares`}
            />
            <MetricCard
              label="Quorum target"
              value={`${data.quorumPct}%`}
              note={`${formatNumber(data.required, 6)} shares required`}
            />
            <MetricCard
              label="Quorum status"
              value={data.quorumMet ? "Met" : "Not met"}
            />
          </div>
        </div>
      )}
      <AttendanceReportControls
        filters={filters}
        onFilter={updateFilter}
        sorts={sorts}
        onSorts={updateSorts}
        columns={columns}
        onColumns={setColumns}
        representatives={representatives}
        pageSize={pageSize}
        onPageSize={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        exportScope={exportScope}
        onExportScope={setExportScope}
        error={filterError}
        disabled={!!exporting}
        onReset={reset}
      />
      <section className="panel" aria-label="Attendance records">
        <div className="panel-heading">
          <div className="min-w-0">
            <h2>Attendance records</h2>
            <p aria-live="polite">
              {formatNumber(rows.length)} of{" "}
              {formatNumber(data?.attendance.length ?? 0)} records match
              {` · ${formatAttendanceShares(matchingShares)} matching shares`}
              {activeFilters.length > 0
                ? ` · ${activeFilters.length} active filters`
                : ""}
            </p>
            <p>
              PDF and Excel export {formatNumber(exportRows.length)} records (
              {scopeLabel.toLowerCase()}) with the selected columns and sorting.
            </p>
          </div>
        </div>
        {activeFilters.length > 0 && (
          <div
            className="flex flex-wrap gap-2 border-b px-6 py-3"
            aria-label="Active attendance filters">
            {activeFilters.map(([label, value]) => (
              <span
                key={label}
                className="max-w-full break-words rounded-md bg-accent px-2 py-1 text-xs">
                {label}: {value}
              </span>
            ))}
          </div>
        )}
        {loading ? (
          <LoadingState label="Loading attendance report..." />
        ) : !rows.length ? (
          <EmptyState
            title={
              filterError
                ? "Check the filter ranges"
                : activeFilters.length
                  ? "No matching attendance"
                  : "No attendance recorded"
            }
            description={
              filterError
                ? "Correct the filters above to view and export attendance."
                : activeFilters.length
                  ? "Adjust the filters or reset the view to see more records."
                  : "Attendance records appear after shareholders check in."
            }
          />
        ) : (
          <Table aria-label="Attendance records">
            <TableHeader>
              <TableRow>
                {selectedColumns.map((column) => {
                  const sortIndex = sorts.findIndex(
                    (sort) => sort.key === column.key,
                  );
                  const sort = sorts[sortIndex];
                  const SortIcon = sort
                    ? sort.direction === "asc"
                      ? ArrowUp
                      : ArrowDown
                    : ArrowUpDown;
                  return (
                    <TableHead
                      key={column.key}
                      className={
                        column.key === "shareValue" ? "text-right" : ""
                      }
                      aria-sort={
                        sortIndex === 0
                          ? sort.direction === "asc"
                            ? "ascending"
                            : "descending"
                          : undefined
                      }>
                      <button
                        type="button"
                        disabled={!!exporting}
                        onClick={() => sortColumn(column.key)}
                        aria-label={`Sort by ${column.label}${sort ? `, ${sort.direction === "asc" ? "ascending" : "descending"}, priority ${sortIndex + 1}` : ""}`}
                        className={`inline-flex items-center gap-2 rounded py-2 font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring ${column.key === "shareValue" ? "justify-end" : ""}`}>
                        {column.label}
                        <SortIcon size={14} className="shrink-0" />
                        {sorts.length > 1 && sort && (
                          <span className="text-xs text-muted-foreground">
                            {sortIndex + 1}
                          </span>
                        )}
                      </button>
                    </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagination.rows.map((row) => (
                <TableRow key={row.id}>
                  {selectedColumns.map((column) => (
                    <TableCell
                      key={column.key}
                      className={
                        column.key === "shareValue"
                          ? "text-right tabular-nums"
                          : column.key === "createdAt"
                            ? "whitespace-nowrap"
                            : column.key === "shareholderName" ||
                                column.key === "shareholderNameAm"
                              ? "cell-name"
                              : column.key === "shareholderId" ||
                                  column.key === "representedById"
                                ? "cell-id"
                                : ""
                      }>
                      {attendanceCell(row, column.key)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <Pagination
          page={pagination.page}
          total={rows.length}
          size={pagination.size}
          loading={loading || !!exporting}
          onPage={setPage}
        />
      </section>
    </main>
  );
}
