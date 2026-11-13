"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, FileBarChart2, Users } from "lucide-react";
import { Can } from "@/components/auth/Can";
import { PageHeader } from "@/components/workspace/PageHeader";

export default function Reports() {
  const { id } = useParams();
  return (
    <main className="work-page">
      <PageHeader
        eyebrow="Meeting insights"
        title="Reports"
        description="Review attendance, nominee outcomes, and the records behind each vote."
        back={{ href: "/meetings", label: "Back to meetings" }}
      />
      <div className="report-links">
        <Can permission="reports.attendance">
          <Link
            className="panel report-link"
            href={`/meetings/${id}/reports/attendance`}
          >
            <span className="report-icon">
              <Users />
            </span>
            <h2>Attendance report</h2>
            <p>
              View registered shareholders, representation, share values, and
              quorum. Download a PDF for your meeting records.
            </p>
            <span>
              Open attendance report
              <ArrowRight size={17} />
            </span>
          </Link>
        </Can>
        <Can permission="reports.voting">
          <Link
            className="panel report-link"
            href={`/meetings/${id}/reports/voting`}
          >
            <span className="report-icon">
              <FileBarChart2 />
            </span>
            <h2>Voting report</h2>
            <p>
              Filter the vote audit trail, compare nominee outcomes, and export
              matching records to Excel.
            </p>
            <span>
              Open voting report
              <ArrowRight size={17} />
            </span>
          </Link>
        </Can>
      </div>
    </main>
  );
}
