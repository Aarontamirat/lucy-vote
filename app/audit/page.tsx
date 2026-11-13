"use client";
import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/workspace/PageHeader";
import {
  EmptyState,
  ErrorNotice,
  LoadingState,
} from "@/components/workspace/Feedback";
import { Pagination } from "@/components/workspace/Pagination";
import { StatusBadge } from "@/components/workspace/StatusBadge";
import { useResource } from "@/components/workspace/useResource";
import { formatDate } from "@/lib/display";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Entry = {
  id: string;
  actorId: string | null;
  actorName: string | null;
  action: string;
  resource: string;
  status: string;
  details: unknown;
  createdAt: string;
};
export default function AuditPage() {
  const [page, setPage] = useState(1);
  const { data, loading, error, reload } = useResource<{
    entries: Entry[];
    total: number;
  }>(`/api/audit?page=${page}`);
  useEffect(() => {
    if (data && !loading && page > Math.max(1, Math.ceil(data.total / 50)))
      setPage(Math.max(1, Math.ceil(data.total / 50)));
  }, [data, loading, page]);
  return (
    <main className="work-page">
      <PageHeader
        eyebrow="ACCOUNTABILITY"
        title="Audit history"
        description="A traceable record of account changes, meeting activity and ballot corrections."
        actions={
          <Button variant="outline" disabled={loading} onClick={reload}>
            <RefreshCw className={loading ? "animate-spin" : ""} />
            Refresh
          </Button>
        }
      />
      {error && <ErrorNotice message={error} retry={reload} />}
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>
              Recorded activity
              <span className="count-chip">{data?.total ?? 0}</span>
            </h2>
            <p>
              Started entries show operations whose final outcome has not been
              recorded.
            </p>
          </div>
        </div>
        {loading && !data ? (
          <LoadingState label="Loading audit history…" />
        ) : data?.entries.length ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Action & resource</TableHead>
                <TableHead>Outcome</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="whitespace-nowrap text-xs">
                    {formatDate(entry.createdAt, true)}
                  </TableCell>
                  <TableCell>
                    <strong className="text-xs">
                      {entry.actorName ?? "Anonymous"}
                    </strong>
                    <span className="cell-subtitle font-mono">
                      {entry.actorId}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-lg whitespace-normal">
                    <strong className="text-xs">{entry.action}</strong>
                    <span className="cell-subtitle break-all font-mono">
                      {entry.resource}
                    </span>
                    {entry.details != null && (
                      <details className="mt-3">
                        <summary className="cursor-pointer text-xs text-primary">
                          View details
                        </summary>
                        <pre className="mt-2 rounded-lg bg-muted p-3 whitespace-pre-wrap break-all text-xs">
                          {JSON.stringify(entry.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={entry.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          !error && (
            <EmptyState
              title="No recorded activity yet"
              description="Changes and ballot activity for your accessible meetings will appear here."
            />
          )
        )}
        <Pagination
          page={page}
          total={data?.total ?? 0}
          size={50}
          loading={loading}
          onPage={setPage}
        />
      </section>
    </main>
  );
}
