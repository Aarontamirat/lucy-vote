"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ExternalLink, RefreshCw, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/workspace/PageHeader";
import {
  EmptyState,
  ErrorNotice,
  LoadingState,
} from "@/components/workspace/Feedback";
import { StatusBadge } from "@/components/workspace/StatusBadge";
import { usePollingResource } from "@/components/workspace/usePollingResource";
import { MetricCard } from "@/components/workspace/MetricCard";
import { formatNumber } from "@/lib/display";
import type { RankedResult } from "@/lib/election";

type Results = {
  results: RankedResult[];
  meetingStatus: string;
  winnerCount: number | null;
  configurationError?: string;
};
export default function ResultsPage() {
  const { id } = useParams();
  const { data, loading, error, reload } = usePollingResource<Results>(
    `/api/meetings/${id}/votes`,
  );
  const totalWeight =
    data?.results.reduce((sum, row) => sum + row.totalWeight, 0) ?? 0;
  return (
    <main className="work-page">
      <PageHeader
        eyebrow="Election results"
        title="Voting results"
        description="Results refresh every 10 seconds. Ties at the cutoff remain visible for review."
        back={{ href: "/meetings", label: "Back to meetings" }}
        actions={
          <>
            <Button variant="outline" disabled={loading} onClick={reload}>
              <RefreshCw />
              Refresh
            </Button>
            <Button asChild>
              <Link
                href={`/meetings/${id}/live`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink />
                Open projection
              </Link>
            </Button>
          </>
        }
      />
      {error && <ErrorNotice message={error} retry={reload} />}
      {!data ? (
        loading && <LoadingState label="Loading election results…" />
      ) : (
        <>
          <div className="metric-grid">
            <MetricCard
              label="Seats to fill"
              value={data.winnerCount ?? "Not configured"}
              icon={Trophy}
            />
            <MetricCard label="Nominees" value={data.results.length} />
            <MetricCard
              label="Total vote weight"
              value={formatNumber(totalWeight)}
              note="Across all recorded nominee choices"
            />
            <div className="metric-card">
              <p className="metric-top">Meeting status</p>
              <div className="mt-5">
                <StatusBadge status={data.meetingStatus} />
              </div>
            </div>
          </div>
          {data.configurationError && (
            <ErrorNotice message={data.configurationError} />
          )}
          <section className="panel">
            <div className="panel-heading">
              <div>
                <h2>Nominee rankings</h2>
                <p>
                  Percentages show each nominee’s share of total vote weight.
                </p>
              </div>
              <span className="text-xs text-muted-foreground" role="status">
                {loading ? "Refreshing…" : "Auto-refresh on"}
              </span>
            </div>
            {!data.results.length ? (
              <EmptyState
                title="No results yet"
                description="Nominee results appear as votes are recorded."
              />
            ) : (
              <div className="result-list">
                {data.results.map((row) => {
                  const percentage =
                    totalWeight > 0 ? (row.totalWeight / totalWeight) * 100 : 0;
                  return (
                    <article className="result-row" key={row.nomineeId}>
                      <span className="result-rank">{row.rank}</span>
                      <div className="min-w-0 flex-1">
                        <div className="result-heading">
                          <div>
                            <h3>{row.name}</h3>
                            {["LEADING", "WINNER", "TIED"].includes(
                              row.selectionStatus,
                            ) && (
                              <span
                                className={`status-badge ${row.selectionStatus === "TIED" ? "status-warning" : "status-success"}`}
                              >
                                {row.selectionStatus === "WINNER"
                                  ? "Winner"
                                  : row.selectionStatus === "LEADING"
                                    ? "Leading"
                                    : "Tie at cutoff"}
                              </span>
                            )}
                          </div>
                          <strong>
                            {formatNumber(row.totalWeight)}
                            <small> vote weight</small>
                          </strong>
                        </div>
                        <Progress
                          aria-label={`${row.name}: ${percentage.toFixed(2)} percent of vote weight`}
                          value={percentage}
                        />
                        <p className="mt-2 text-xs text-muted-foreground">
                          {percentage.toFixed(2)}% of total vote weight
                          {row.type === "first"
                            ? " · Group 1"
                            : row.type === "second"
                              ? " · Group 2"
                              : ""}
                        </p>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}
