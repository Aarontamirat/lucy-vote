"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { Download, Filter, RefreshCw, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { formatDate, formatNumber } from "@/lib/display";
import { responseError } from "@/lib/response-error";

type Filters = {
  search: string;
  nomineeId: string;
  nomineeType: string;
  voterKind: string;
  from: string;
  to: string;
  minWeight: string;
  maxWeight: string;
  sortBy: string;
  sortDirection: string;
};
const initialFilters: Filters = {
  search: "",
  nomineeId: "",
  nomineeType: "",
  voterKind: "",
  from: "",
  to: "",
  minWeight: "",
  maxWeight: "",
  sortBy: "createdAt",
  sortDirection: "desc",
};
type VoteRow = {
  id: string;
  createdAt: string;
  voterId: string;
  voterName: string;
  voterKind: string;
  representedById: string | null;
  representedByName: string | null;
  legacyCombined: boolean;
  nomineeName: string;
  nomineeType: string;
  weight: number;
};
type NomineeSummary = {
  nomineeId: string;
  rank: number;
  nomineeName: string;
  nomineeType: string;
  voteCount: number;
  totalWeight: number;
};
type VotingReport = {
  meeting: { title: string; status: string };
  votingMode: string;
  metrics: {
    voteCount: number;
    uniqueVoters: number;
    totalWeight: number;
    nomineesReceivingVotes: number;
    attendees: number;
    attendedShareValue: number;
  };
  rows: VoteRow[];
  nomineeSummary: NomineeSummary[];
  filterOptions: { nominees: { id: string; name: string }[] };
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};
function queryParams(filters: Filters, page: number, size = 25) {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(size),
  });
  for (const [key, value] of Object.entries(filters))
    if (value)
      params.set(
        key,
        key === "from" || key === "to" ? new Date(value).toISOString() : value,
      );
  return params;
}
const groupLabel = (type: string) =>
  type === "first" ? "Group 1" : type === "second" ? "Group 2" : "Standard";

export default function VotingReportPage() {
  const { id } = useParams();
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [applied, setApplied] = useState<Filters>(initialFilters);
  const [page, setPage] = useState(1);
  const [filterError, setFilterError] = useState("");
  const [exporting, setExporting] = useState(false);
  const {
    data: report,
    loading,
    error,
    reload,
  } = useResource<VotingReport>(
    `/api/meetings/${id}/reports/voting?${queryParams(applied, page)}`,
  );
  const update = (key: keyof Filters, value: string) =>
    setFilters((current) => ({ ...current, [key]: value }));
  const apply = (event: React.FormEvent) => {
    event.preventDefault();
    if (
      filters.from &&
      filters.to &&
      new Date(filters.from) > new Date(filters.to)
    ) {
      setFilterError("The start date must be before the end date.");
      return;
    }
    if (
      filters.minWeight &&
      filters.maxWeight &&
      Number(filters.minWeight) > Number(filters.maxWeight)
    ) {
      setFilterError("The minimum weight cannot exceed the maximum weight.");
      return;
    }
    setFilterError("");
    setPage(1);
    setApplied({ ...filters });
    reload();
  };
  const exportReport = async () => {
    setExporting(true);
    try {
      const XLSX = await import("xlsx");
      const response = await fetch(
        `/api/meetings/${id}/reports/voting?${queryParams(applied, 1, 500)}`,
        { cache: "no-store" },
      );
      const data: VotingReport & { error?: unknown } = await response.json();
      if (!response.ok)
        throw new Error(
          responseError(data.error, "Failed to export voting report."),
        );
      const records = [...data.rows];
      for (let next = 2; next <= data.pagination.totalPages; next++) {
        const response = await fetch(
          `/api/meetings/${id}/reports/voting?${queryParams(applied, next, 500)}`,
          { cache: "no-store" },
        );
        const batch: VotingReport & { error?: unknown } = await response.json();
        if (!response.ok)
          throw new Error(
            responseError(
              batch.error,
              "The full export could not be completed.",
            ),
          );
        records.push(...batch.rows);
      }
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.json_to_sheet([
          { Metric: "Meeting", Value: data.meeting.title },
          { Metric: "Status", Value: data.meeting.status },
          { Metric: "Voting mode", Value: data.votingMode },
          ...Object.entries(data.metrics).map(([key, value]) => ({
            Metric: key,
            Value: value,
          })),
        ]),
        "Summary",
      );
      XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.json_to_sheet(
          data.nomineeSummary.map((row) => ({
            Rank: row.rank,
            Nominee: row.nomineeName,
            Group: groupLabel(row.nomineeType),
            "Vote records": row.voteCount,
            "Total weight": row.totalWeight,
          })),
        ),
        "Nominee results",
      );
      XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.json_to_sheet(
          records.map((row) => ({
            "Submitted at (EAT)": formatDate(row.createdAt, true),
            "Shareholder / historical ballot ID": row.voterId,
            "Ballot owner": row.voterName,
            "Attendance type": row.voterKind,
            "Representative ID": row.representedById ?? "",
            "Representative name": row.representedByName ?? "",
            "Older combined ballot": row.legacyCombined ? "Yes" : "No",
            Nominee: row.nomineeName,
            "Nominee group": groupLabel(row.nomineeType),
            Weight: row.weight,
          })),
        ),
        "Vote audit",
      );
      XLSX.writeFile(
        workbook,
        `Voting_Report_${data.meeting.title.replace(/[^a-z0-9]+/gi, "_")}.xlsx`,
      );
      toast.success(`Exported ${formatNumber(records.length)} vote records.`);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to export voting report.",
      );
    } finally {
      setExporting(false);
    }
  };
  return (
    <main className="work-page">
      <PageHeader
        eyebrow="Meeting report"
        title="Voting report"
        description={
          report?.meeting.title ??
          "Auditable vote records and nominee outcomes."
        }
        back={{ href: `/meetings/${id}/reports`, label: "Back to reports" }}
        actions={
          <>
            <Button variant="outline" onClick={reload} disabled={loading}>
              <RefreshCw />
              Refresh
            </Button>
            <Button
              onClick={() => void exportReport()}
              disabled={!report || loading || exporting}
            >
              <Download />
              {exporting ? "Exporting…" : "Export Excel"}
            </Button>
          </>
        }
      />
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Filter vote records</h2>
            <p>
              Apply filters to update the metrics, tables, and Excel export.
            </p>
          </div>
          <Filter size={19} className="text-muted-foreground" />
        </div>
        <form className="report-filters" onSubmit={apply}>
          <div className="filter-grid">
            <label className="field-label">
              Shareholder or representative name / ID
              <div className="search-field">
                <Search size={17} />
                <Input
                  value={filters.search}
                  maxLength={100}
                  onChange={(event) => update("search", event.target.value)}
                  placeholder="Search voter records"
                />
              </div>
            </label>
            <div className="field-label">
              <label htmlFor="vote-report-nominee">Nominee</label>
              <select
                id="vote-report-nominee"
                className="filter-select"
                value={filters.nomineeId}
                onChange={(event) => update("nomineeId", event.target.value)}
              >
                <option value="">All nominees</option>
                {report?.filterOptions.nominees.map((nominee) => (
                  <option key={nominee.id} value={nominee.id}>
                    {nominee.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field-label">
              <label htmlFor="vote-report-nominee-group">Nominee group</label>
              <select
                id="vote-report-nominee-group"
                className="filter-select"
                value={filters.nomineeType}
                onChange={(event) => update("nomineeType", event.target.value)}
              >
                <option value="">All groups</option>
                <option value="first">Group 1</option>
                <option value="second">Group 2</option>
              </select>
            </div>
            <div className="field-label">
              <label htmlFor="vote-report-voter-type">Attendance type</label>
              <select
                id="vote-report-voter-type"
                className="filter-select"
                value={filters.voterKind}
                onChange={(event) => update("voterKind", event.target.value)}
              >
                <option value="">All types</option>
                <option value="direct">Directly attending shareholders</option>
                <option value="represented">Represented shareholders</option>
                <option value="legacy">Older combined ballots</option>
              </select>
            </div>
          </div>
          <details className="advanced-filters">
            <summary>Dates, weights, and sorting</summary>
            <div className="filter-grid mt-4">
              <label className="field-label">
                Submitted from (local time)
                <Input
                  type="datetime-local"
                  value={filters.from}
                  onChange={(event) => update("from", event.target.value)}
                />
              </label>
              <label className="field-label">
                Submitted to (local time)
                <Input
                  type="datetime-local"
                  value={filters.to}
                  onChange={(event) => update("to", event.target.value)}
                />
              </label>
              <label className="field-label">
                Minimum weight
                <Input
                  type="number"
                  min="0"
                  step="any"
                  value={filters.minWeight}
                  onChange={(event) => update("minWeight", event.target.value)}
                />
              </label>
              <label className="field-label">
                Maximum weight
                <Input
                  type="number"
                  min="0"
                  step="any"
                  value={filters.maxWeight}
                  onChange={(event) => update("maxWeight", event.target.value)}
                />
              </label>
              <div className="field-label">
                <label htmlFor="vote-report-sort-by">Sort by</label>
                <select
                  id="vote-report-sort-by"
                  className="filter-select"
                  value={filters.sortBy}
                  onChange={(event) => update("sortBy", event.target.value)}
                >
                  <option value="createdAt">Submitted time</option>
                  <option value="weight">Vote weight</option>
                  <option value="nominee">Nominee</option>
                </select>
              </div>
              <div className="field-label">
                <label htmlFor="vote-report-sort-direction">
                  Sort direction
                </label>
                <select
                  id="vote-report-sort-direction"
                  className="filter-select"
                  value={filters.sortDirection}
                  onChange={(event) =>
                    update("sortDirection", event.target.value)
                  }
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
              </div>
            </div>
          </details>
          {filterError && <ErrorNotice message={filterError} />}
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={loading}>
              Apply filters
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() => {
                setFilters(initialFilters);
                setApplied(initialFilters);
                setPage(1);
                setFilterError("");
                reload();
              }}
            >
              Clear filters
            </Button>
          </div>
        </form>
      </section>
      {error && <ErrorNotice message={error} retry={reload} />}
      {report && (
        <>
          <div className="metric-grid">
            <MetricCard
              label="Matching vote records"
              value={formatNumber(report.metrics.voteCount)}
            />
            <MetricCard
              label="Ballots with recorded choices"
              value={formatNumber(report.metrics.uniqueVoters)}
            />
            <MetricCard
              label="Total vote weight"
              value={formatNumber(report.metrics.totalWeight)}
            />
            <MetricCard
              label="Nominees receiving votes"
              value={formatNumber(report.metrics.nomineesReceivingVotes)}
            />
          </div>
          <section className="panel">
            <div className="panel-heading">
              <div>
                <h2>Nominee outcomes</h2>
                <p>Ranked by matching vote weight.</p>
              </div>
            </div>
            {loading ? (
              <LoadingState />
            ) : !report.nomineeSummary.length ? (
              <EmptyState
                title="No matching nominee outcomes"
                description="Clear or adjust the filters to see more results."
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Nominee</TableHead>
                    <TableHead>Group</TableHead>
                    <TableHead>Records</TableHead>
                    <TableHead className="text-right">Total weight</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.nomineeSummary.map((row) => (
                    <TableRow key={row.nomineeId}>
                      <TableCell>{row.rank}</TableCell>
                      <TableCell className="cell-name">
                        {row.nomineeName}
                      </TableCell>
                      <TableCell>{groupLabel(row.nomineeType)}</TableCell>
                      <TableCell>{formatNumber(row.voteCount)}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatNumber(row.totalWeight)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </section>
          <section className="panel">
            <div className="panel-heading">
              <div>
                <h2>Vote audit trail</h2>
                <p>
                  Submission times are shown in East Africa Time. Exports
                  include all matching records.
                </p>
              </div>
            </div>
            {loading ? (
              <LoadingState />
            ) : !report.rows.length ? (
              <EmptyState
                title="No matching vote records"
                description="Try a different voter, nominee, or date range."
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Submitted (EAT)</TableHead>
                    <TableHead>Ballot owner</TableHead>
                    <TableHead>Attendance / representative</TableHead>
                    <TableHead>Nominee</TableHead>
                    <TableHead>Group</TableHead>
                    <TableHead className="text-right">Weight</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.rows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="whitespace-nowrap">
                        {formatDate(row.createdAt, true)}
                      </TableCell>
                      <TableCell>
                        <span className="cell-name">{row.voterName}</span>
                        <span className="cell-detail">{row.voterId}</span>
                      </TableCell>
                      <TableCell className="capitalize">
                        <span>{row.legacyCombined ? "Older combined ballot" : row.voterKind}</span>
                        {row.representedById && <span className="cell-detail">{row.representedByName ?? row.representedById} · {row.representedById}</span>}
                      </TableCell>
                      <TableCell>{row.nomineeName}</TableCell>
                      <TableCell>{groupLabel(row.nomineeType)}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatNumber(row.weight)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            <Pagination
              page={page}
              size={25}
              total={report.pagination.total}
              loading={loading}
              onPage={setPage}
            />
          </section>
        </>
      )}
      {loading && !report && <LoadingState label="Loading voting report…" />}
    </main>
  );
}
