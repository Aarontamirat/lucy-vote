"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { Download, RefreshCw, Search, Users } from "lucide-react";
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

type AttendanceReport = {
  meetingTitle: string;
  meetingStatus: string;
  quorumPct: number;
  totalShares: number;
  attendedShares: number;
  quorumMet: boolean;
  required: number;
  attendeesCount: number;
  totalShareholdersCount: number;
  attendance: {
    id: string;
    shareholderId: string;
    shareholderName: string;
    shareValue: string;
    representedByName: string | null;
    createdAt: string;
  }[];
};
export default function AttendanceReportPage() {
  const { id } = useParams();
  const { data, loading, error, reload } = useResource<AttendanceReport>(
    `/api/meetings/${id}/reports/attendance`,
  );
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);
  const rows =
    data?.attendance.filter((row) =>
      [
        row.shareholderId,
        row.shareholderName,
        row.representedByName ?? "",
      ].some((value) =>
        value.toLowerCase().includes(search.trim().toLowerCase()),
      ),
    ) ?? [];
  const activePage = Math.min(page, Math.max(1, Math.ceil(rows.length / 25)));
  const exportPDF = async () => {
    if (!data) return;
    setExporting(true);
    try {
      const [{ jsPDF }, { default: autoTable }] = await Promise.all([
        import("jspdf"),
        import("jspdf-autotable"),
      ]);
      const response = await fetch("/logo.png");
      if (!response.ok) throw new Error("The report logo could not be loaded.");
      const logo = await response.blob();
      const logoUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () =>
          reject(new Error("The report logo could not be read."));
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(logo);
      });
      const doc = new jsPDF();
      doc.addImage(logoUrl, "PNG", 70, 10, 70, 15);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(17);
      doc.text("Meeting Attendance Report", 105, 36, { align: "center" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const title = doc.splitTextToSize(data.meetingTitle, 180);
      doc.text(title, 14, 45);
      const start = 45 + title.length * 5;
      doc.text(
        `Attendees: ${formatNumber(data.attendeesCount)} / ${formatNumber(data.totalShareholdersCount)}`,
        14,
        start + 5,
      );
      doc.text(
        `Attended shares: ${formatNumber(data.attendedShares)} / ${formatNumber(data.totalShares)}`,
        14,
        start + 11,
      );
      doc.text(
        `Quorum: ${data.quorumPct}% | Required shares: ${formatNumber(data.required)} | ${data.quorumMet ? "Met" : "Not met"}`,
        14,
        start + 17,
      );
      autoTable(doc, {
        head: [
          ["ID", "Shareholder", "Shares", "Represented by", "Check-in (EAT)"],
        ],
        body: data.attendance.map((row) => [
          row.shareholderId,
          row.shareholderName,
          formatNumber(row.shareValue),
          row.representedByName ?? "Self",
          formatDate(row.createdAt, true),
        ]),
        startY: start + 25,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [36, 95, 210] },
      });
      doc.save("Attendance_Report.pdf");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to generate PDF.",
      );
    } finally {
      setExporting(false);
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
            <Button variant="outline" disabled={loading} onClick={reload}>
              <RefreshCw />
              Refresh
            </Button>
            <Button
              disabled={!data || loading || exporting}
              onClick={() => void exportPDF()}
            >
              <Download />
              {exporting ? "Generating…" : "Generate PDF"}
            </Button>
          </>
        }
      />
      {error && <ErrorNotice message={error} retry={reload} />}
      {data && (
        <div className="metric-grid">
          <MetricCard
            label="Attended shareholders"
            value={formatNumber(data.attendeesCount)}
            note={`Of ${formatNumber(data.totalShareholdersCount)} registered`}
            icon={Users}
          />
          <MetricCard
            label="Attended shares"
            value={formatNumber(data.attendedShares)}
            note={`Of ${formatNumber(data.totalShares)} total shares`}
          />
          <MetricCard
            label="Quorum target"
            value={`${data.quorumPct}%`}
            note={`${formatNumber(data.required)} shares required`}
          />
          <MetricCard
            label="Quorum status"
            value={data.quorumMet ? "Met" : "Not met"}
          />
        </div>
      )}
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Attendance records</h2>
            <p>
              PDF exports include all attendance records. Times are shown in
              East Africa Time.
            </p>
          </div>
        </div>
        <div className="toolbar">
          <div className="search-field">
            <Search size={17} />
            <Input
              aria-label="Search attendance"
              placeholder="Search name, ID, or representative"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
          </div>
          <span className="text-xs text-muted-foreground">
            {formatNumber(rows.length)} records
          </span>
        </div>
        {loading ? (
          <LoadingState label="Loading attendance report…" />
        ) : !rows.length ? (
          <EmptyState
            title={search ? "No matching attendance" : "No attendance recorded"}
            description={
              search
                ? "Try another name or ID."
                : "Attendance records appear after shareholders check in."
            }
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Shareholder</TableHead>
                <TableHead className="text-right">Shares</TableHead>
                <TableHead>Represented by</TableHead>
                <TableHead>Check-in (EAT)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.slice((activePage - 1) * 25, activePage * 25).map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="cell-id">{row.shareholderId}</TableCell>
                  <TableCell className="cell-name">
                    {row.shareholderName}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatNumber(row.shareValue)}
                  </TableCell>
                  <TableCell>{row.representedByName ?? "Self"}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    {formatDate(row.createdAt, true)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <Pagination
          page={activePage}
          total={rows.length}
          size={25}
          loading={loading}
          onPage={setPage}
        />
      </section>
    </main>
  );
}
