"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  ClipboardList,
  FileText,
  MoreHorizontal,
  Pencil,
  Play,
  Plus,
  Printer,
  RefreshCw,
  Search,
  Square,
  Trash2,
  UserCheck,
  Users,
  Vote,
  Monitor,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/AuthProvider";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import MeetingModal from "@/components/modals/MeetingModal";
import AttendanceModal from "@/components/modals/AttendanceModal";
import NomineeModal from "@/components/modals/NomineeModal";
import { PageHeader } from "@/components/workspace/PageHeader";
import {
  EmptyState,
  ErrorNotice,
  LoadingState,
} from "@/components/workspace/Feedback";
import { Pagination } from "@/components/workspace/Pagination";
import { StatusBadge } from "@/components/workspace/StatusBadge";
import { ConfirmDialog } from "@/components/workspace/ConfirmDialog";
import { useResource } from "@/components/workspace/useResource";
import { formatDate } from "@/lib/display";

type Meeting = {
  id: string;
  title: string;
  date: string;
  location: string | null;
  status: string;
  quorumPct: number | null;
  winnerCount: number | null;
  firstPassers: number | null;
  secondPassers: number | null;
};
type Action = {
  meeting: Meeting;
  endpoint: string;
  method: "POST" | "DELETE";
  title: string;
  description: string;
  label: string;
  destructive?: boolean;
};
export default function MeetingsPage() {
  const { can } = useAuth();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [selected, setSelected] = useState<Meeting | null>(null);
  const [attendance, setAttendance] = useState<Meeting | null>(null);
  const [nominees, setNominees] = useState<Meeting | null>(null);
  const [action, setAction] = useState<Action | null>(null);
  const [busy, setBusy] = useState(false);
  const { data, loading, error, reload } = useResource<{
    items: Meeting[];
    total: number;
  }>(
    `/api/meetings?q=${encodeURIComponent(query)}&status=${status}&page=${page}&take=10`,
    250,
  );
  useEffect(() => {
    if (data && !loading && page > Math.max(1, Math.ceil(data.total / 10)))
      setPage(Math.max(1, Math.ceil(data.total / 10)));
  }, [data, loading, page]);
  const attendanceAccess =
    can("attendance.view") ||
    can("attendance.register") ||
    can("reports.attendance");
  const votingAccess = can("votes.record") || can("votes.reverse");
  const reportsAccess = can("reports.attendance") || can("reports.voting");
  async function confirmAction() {
    if (!action || busy) return;
    setBusy(true);
    try {
      const response = await fetch(
        `/api/meetings/${action.meeting.id}${action.endpoint}`,
        { method: action.method },
      );
      const body = await response.json();
      if (!response.ok)
        throw new Error(body.error || "The action could not be completed.");
      toast.success(`${action.title} completed`);
      setAction(null);
      reload();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "The action failed.",
      );
    } finally {
      setBusy(false);
    }
  }
  const openAction = (
    meeting: Meeting,
    kind: "open" | "voting" | "close" | "delete",
  ) => {
    const details = {
      open: {
        endpoint: "/open",
        method: "POST" as const,
        title: "Open attendance",
        description:
          "Shareholders can be registered as attending after this meeting opens.",
        label: "Open attendance",
      },
      voting: {
        endpoint: "/votingopen",
        method: "POST" as const,
        title: "Open voting",
        description:
          "Opening voting locks the meeting rules and nominee list. Confirm they are correct before continuing.",
        label: "Open voting",
      },
      close: {
        endpoint: "/close",
        method: "POST" as const,
        title: "Close meeting",
        description:
          "This ends voting and locks the meeting records. Review your ballots before closing.",
        label: "Close meeting",
        destructive: true,
      },
      delete: {
        endpoint: "",
        method: "DELETE" as const,
        title: "Delete meeting",
        description:
          "This draft meeting and its associated records will be permanently deleted.",
        label: "Delete meeting",
        destructive: true,
      },
    };
    setAction({ meeting, ...details[kind] });
  };
  return (
    <main className="work-page">
      <PageHeader
        eyebrow="MEETING WORKSPACE"
        title="Meetings"
        description="Prepare your elections, welcome shareholders and keep each meeting on track."
        actions={
          can("meetings.create") && (
            <Button
              onClick={() => {
                setSelected(null);
                setModal("add");
              }}
            >
              <Plus />
              Create meeting
            </Button>
          )
        }
      />
      {error && <ErrorNotice message={error} retry={reload} />}
      <section className="panel">
        <div className="toolbar">
          <div className="search-field">
            <Search />
            <Input
              aria-label="Search meetings"
              placeholder="Search meetings…"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
            />
          </div>
          <select
            className="filter-select"
            aria-label="Meeting status"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
          >
            <option value="">All statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="OPEN">Attendance open</option>
            <option value="VOTINGOPEN">Voting open</option>
            <option value="CLOSED">Closed</option>
          </select>
          <div className="toolbar-end">
            <span>{data?.total ?? 0} meetings</span>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Refresh meetings"
              disabled={loading}
              onClick={reload}
            >
              <RefreshCw className={loading ? "animate-spin" : ""} />
            </Button>
          </div>
        </div>
        {loading && !data ? (
          <LoadingState label="Loading meetings…" />
        ) : data?.items.length ? (
          <div aria-busy={loading}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Meeting</TableHead>
                  <TableHead>Date & location</TableHead>
                  <TableHead>Election</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Workspace</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((meeting) => (
                  <TableRow key={meeting.id}>
                    <TableCell>
                      <div className="person-cell">
                        <span className="quick-link-icon">
                          <CalendarDays size={18} />
                        </span>
                        <div>
                          <strong className="meeting-name">
                            {meeting.title}
                          </strong>
                          <span className="cell-subtitle">
                            Quorum: {meeting.quorumPct ?? 0}%
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs">
                        {formatDate(meeting.date, true)}
                      </span>
                      <span className="cell-subtitle">
                        {meeting.location || "Location not set"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs">
                        {meeting.firstPassers && meeting.secondPassers
                          ? "Two nominee groups"
                          : "Standard election"}
                      </span>
                      <span className="cell-subtitle">
                        {meeting.winnerCount ??
                          ((meeting.firstPassers ?? 0) +
                            (meeting.secondPassers ?? 0) ||
                            "Not configured")}{" "}
                        winners
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={meeting.status} />
                    </TableCell>
                    <TableCell>
                      <div className="meeting-primary-action">
                        {meeting.status === "VOTINGOPEN" && votingAccess ? (
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/meetings/${meeting.id}/vote`}>
                              <Vote />
                              Record votes
                            </Link>
                          </Button>
                        ) : ["OPEN", "VOTINGOPEN"].includes(meeting.status) &&
                          attendanceAccess ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setAttendance(meeting)}
                          >
                            <UserCheck />
                            Attendance
                          </Button>
                        ) : reportsAccess ? (
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/meetings/${meeting.id}/reports`}>
                              <FileText />
                              Reports
                            </Link>
                          </Button>
                        ) : (
                          can("projection.view") && (
                            <Button asChild variant="outline" size="sm">
                              <Link href={`/meetings/${meeting.id}/live`}>
                                <Monitor />
                                Projection
                              </Link>
                            </Button>
                          )
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label={`Actions for ${meeting.title}`}
                            >
                              <MoreHorizontal />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="min-w-56">
                            {can("meetings.edit") &&
                              meeting.status !== "CLOSED" && (
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelected(meeting);
                                    setModal("edit");
                                  }}
                                >
                                  <Pencil />
                                  Edit meeting
                                </DropdownMenuItem>
                              )}
                            {can("nominees.view") || can("nominees.manage") ? (
                              <DropdownMenuItem
                                onClick={() => setNominees(meeting)}
                              >
                                <Users />
                                {can("nominees.manage") &&
                                ["DRAFT", "OPEN"].includes(meeting.status)
                                  ? "Manage nominees"
                                  : "View nominees"}
                              </DropdownMenuItem>
                            ) : null}
                            {attendanceAccess && (
                              <DropdownMenuItem
                                onClick={() => setAttendance(meeting)}
                              >
                                <UserCheck />
                                View attendance
                              </DropdownMenuItem>
                            )}
                            {can("cards.print") && (
                              <DropdownMenuItem asChild>
                                <Link
                                  href={`/meetings/${meeting.id}/voting-cards`}
                                >
                                  <Printer />
                                  Print voting cards
                                </Link>
                              </DropdownMenuItem>
                            )}
                            {votingAccess && (
                              <DropdownMenuItem asChild>
                                <Link href={`/meetings/${meeting.id}/vote`}>
                                  <Vote />
                                  Record votes
                                </Link>
                              </DropdownMenuItem>
                            )}
                            {can("results.view") && (
                              <DropdownMenuItem asChild>
                                <Link href={`/meetings/${meeting.id}/results`}>
                                  <ClipboardList />
                                  Election results
                                </Link>
                              </DropdownMenuItem>
                            )}
                            {reportsAccess && (
                              <DropdownMenuItem asChild>
                                <Link href={`/meetings/${meeting.id}/reports`}>
                                  <FileText />
                                  Reports
                                </Link>
                              </DropdownMenuItem>
                            )}
                            {can("projection.view") && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() =>
                                    window.open(
                                      `/meetings/${meeting.id}/live?projection=1`,
                                      "_blank",
                                      "noopener,noreferrer",
                                    )
                                  }
                                >
                                  <Monitor />
                                  Open projection screen
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link
                                    href={`/meetings/${meeting.id}/attendance/live`}
                                  >
                                    <UserCheck />
                                    Live attendance
                                  </Link>
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuSeparator />
                            {meeting.status === "DRAFT" &&
                              can("meetings.open") && (
                                <DropdownMenuItem
                                  onClick={() => openAction(meeting, "open")}
                                >
                                  <Play />
                                  Open attendance
                                </DropdownMenuItem>
                              )}
                            {meeting.status === "OPEN" &&
                              can("meetings.openVoting") && (
                                <DropdownMenuItem
                                  onClick={() => openAction(meeting, "voting")}
                                >
                                  <Play />
                                  Open voting
                                </DropdownMenuItem>
                              )}
                            {["OPEN", "VOTINGOPEN"].includes(meeting.status) &&
                              can("meetings.close") && (
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => openAction(meeting, "close")}
                                >
                                  <Square />
                                  Close meeting
                                </DropdownMenuItem>
                              )}
                            {meeting.status === "DRAFT" &&
                              can("meetings.delete") && (
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => openAction(meeting, "delete")}
                                >
                                  <Trash2 />
                                  Delete meeting
                                </DropdownMenuItem>
                              )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          !error && (
            <EmptyState
              title={
                query || status
                  ? "No meetings match your filters"
                  : "Your meeting workspace starts here"
              }
              description={
                query || status
                  ? "Clear the search or choose another status to find your meeting."
                  : "Create your first meeting or ask your Super Admin to assign an existing one to you."
              }
              action={
                query || status ? (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setQuery("");
                      setStatus("");
                      setPage(1);
                    }}
                  >
                    Clear filters
                  </Button>
                ) : (
                  can("meetings.create") && (
                    <Button onClick={() => setModal("add")}>
                      <Plus />
                      Create meeting
                    </Button>
                  )
                )
              }
            />
          )
        )}
        <Pagination
          page={page}
          total={data?.total ?? 0}
          size={10}
          loading={loading}
          onPage={setPage}
        />
      </section>
      <MeetingModal
        isOpen={!!modal}
        onClose={() => setModal(null)}
        mode={modal ?? "add"}
        initialData={selected}
        onSuccess={reload}
      />
      <AttendanceModal
        isOpen={!!attendance}
        onClose={() => setAttendance(null)}
        meeting={
          attendance
            ? { ...attendance, quorumPct: attendance.quorumPct ?? undefined }
            : null
        }
        onSuccess={reload}
      />
      <NomineeModal
        isOpen={!!nominees}
        onClose={() => setNominees(null)}
        meeting={nominees}
        onSuccess={reload}
      />
      <ConfirmDialog
        open={!!action}
        title={action?.title ?? "Confirm action"}
        description={
          action ? `${action.meeting.title}. ${action.description}` : ""
        }
        label={action?.label}
        destructive={action?.destructive}
        busy={busy}
        onClose={() => setAction(null)}
        onConfirm={() => void confirmAction()}
      />
    </main>
  );
}
