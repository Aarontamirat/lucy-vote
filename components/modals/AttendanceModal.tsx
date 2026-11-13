"use client";
import { useEffect, useState } from "react";
import { Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  EmptyState,
  ErrorNotice,
  LoadingState,
} from "@/components/workspace/Feedback";
import { ConfirmDialog } from "@/components/workspace/ConfirmDialog";
import { useResource } from "@/components/workspace/useResource";
import { formatNumber } from "@/lib/display";
import { responseError } from "@/lib/response-error";

type Meeting = {
  id: string;
  title: string;
  status?: string;
  quorumPct?: number;
};
type Shareholder = { id: string; name: string; shareValue: string };
type Representative = {
  id: string;
  name: string;
  shareholderId?: string | null;
};
type Attendee = {
  id: string;
  shareholderId: string;
  shareholderName: string;
  shareValue: string;
  representedByName: string | null;
};
type Attendance = {
  attendance: Attendee[];
  meetingStatus: string;
  totalShares: number;
  attendedShares: number;
  quorumPct: number;
  quorumMet: boolean;
};
type RepType = "none" | "existing" | "shareholder" | "new";
export default function AttendanceModal({
  isOpen,
  onClose,
  meeting,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  meeting: Meeting | null;
  onSuccess: () => void;
}) {
  const { can } = useAuth();
  const active = isOpen && !!meeting;
  const { data, loading, error, reload } = useResource<Attendance>(
    active ? `/api/meetings/${meeting?.id}/attendance` : null,
  );
  const register =
    can("attendance.register") &&
    can("shareholders.lookup") &&
    !!data &&
    ["OPEN", "VOTINGOPEN"].includes(data.meetingStatus);
  const lookup = useResource<{ items: Shareholder[] }>(
    active && register
      ? `/api/shareholders/lookup?meetingId=${meeting?.id}`
      : null,
  );
  const reps = useResource<{ items: Representative[] }>(
    active && register ? `/api/representatives?meetingId=${meeting?.id}` : null,
  );
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [repType, setRepType] = useState<RepType>("none");
  const [repId, setRepId] = useState("");
  const [repHolder, setRepHolder] = useState("");
  const [repName, setRepName] = useState("");
  const [busy, setBusy] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [deleting, setDeleting] = useState<Attendee | null>(null);
  const shareholders = lookup.data?.items ?? [];
  const attendedIds = new Set(data?.attendance.map((row) => row.shareholderId));
  const matches = shareholders
    .filter((holder) =>
      [holder.id, holder.name].some((value) =>
        value.toLowerCase().includes(search.trim().toLowerCase()),
      ),
    )
    .filter((holder) => !attendedIds.has(holder.id));
  useEffect(() => {
    setSelected([]);
    setSearch("");
    setRepType("none");
    setRepId("");
    setRepHolder("");
    setRepName("");
    setSaveError("");
    setDeleting(null);
  }, [isOpen, meeting?.id]);
  const toggle = (id: string) =>
    setSelected((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id],
    );
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!meeting || !register || busy || !selected.length) return;
    setBusy(true);
    setSaveError("");
    try {
      const payload = {
        shareholderIds: selected,
        ...(repType === "existing"
          ? { representativeId: repId }
          : repType === "shareholder"
            ? { representativeShareholderId: repHolder }
            : repType === "new"
              ? {
                  representativeId: repId.trim(),
                  representativeName: repName.trim(),
                }
              : {}),
      };
      const response = await fetch(`/api/meetings/${meeting.id}/attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(
          responseError(result.error, "Attendance could not be recorded."),
        );
      setSelected([]);
      setRepType("none");
      setRepId("");
      setRepHolder("");
      setRepName("");
      reload();
      onSuccess();
      toast.success("Attendance recorded");
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : "Attendance could not be recorded.",
      );
    } finally {
      setBusy(false);
    }
  };
  const remove = async () => {
    if (!meeting || !deleting || busy || !can("attendance.remove")) return;
    setBusy(true);
    setSaveError("");
    try {
      const response = await fetch(
        `/api/meetings/${meeting.id}/attendance/${deleting.id}`,
        { method: "DELETE" },
      );
      const result = await response.json();
      if (!response.ok)
        throw new Error(
          responseError(result.error, "Attendance could not be removed."),
        );
      reload();
      onSuccess();
      toast.success("Attendance removed");
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : "Attendance could not be removed.",
      );
    } finally {
      setBusy(false);
      setDeleting(null);
    }
  };
  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={(value) => {
          if (!value && !busy) onClose();
        }}>
        <DialogContent showCloseButton={!busy} className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Attendance — {meeting?.title}</DialogTitle>
            <DialogDescription>
              Check shareholders in directly or assign a representative.
            </DialogDescription>
          </DialogHeader>
          {error && <ErrorNotice message={error} retry={reload} />}
          {saveError && <ErrorNotice message={saveError} />}
          {data && (
            <div className="modal-summary">
              <span>
                Attended shares{" "}
                <strong>{formatNumber(data.attendedShares)}</strong>
              </span>
              <span>
                Total shares <strong>{formatNumber(data.totalShares)}</strong>
              </span>
              <span>
                Quorum{" "}
                <strong>
                  {data.quorumPct}% · {data.quorumMet ? "Met" : "Not met"}
                </strong>
              </span>
            </div>
          )}
          {loading ? (
            <LoadingState label="Loading attendance…" />
          ) : (
            <div className={register ? "modal-columns" : ""}>
              {register ? (
                <form
                  id="attendance-form"
                  className="modal-section"
                  onSubmit={submit}>
                  <h3>Register attendance</h3>
                  {lookup.error && (
                    <ErrorNotice message={lookup.error} retry={lookup.reload} />
                  )}
                  {reps.error && (
                    <ErrorNotice message={reps.error} retry={reps.reload} />
                  )}
                  <fieldset className="modal-section" disabled={busy}>
                    <div className="field-label">
                      <label htmlFor="attendance-representation">
                        Representation
                      </label>
                      <select
                        id="attendance-representation"
                        className="filter-select"
                        value={repType}
                        onChange={(event) => {
                          setRepType(event.target.value as RepType);
                          setRepId("");
                          setRepHolder("");
                          setRepName("");
                        }}>
                        <option value="none">Attending directly</option>
                        <option value="existing">
                          Existing representative
                        </option>
                        <option value="shareholder">
                          Shareholder representative
                        </option>
                        <option value="new">New external representative</option>
                      </select>
                    </div>
                    {repType === "existing" && (
                      <div className="field-label">
                        <label htmlFor="attendance-representative">
                          Representative
                        </label>
                        <select
                          id="attendance-representative"
                          required
                          className="filter-select"
                          value={repId}
                          onChange={(event) => setRepId(event.target.value)}>
                          <option value="">Select a representative</option>
                          {reps.data?.items.map((rep) => (
                            <option key={rep.id} value={rep.id}>
                              {rep.name} ({rep.id})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    {repType === "shareholder" && (
                      <div className="field-label">
                        <label htmlFor="attendance-representative-shareholder">
                          Representative shareholder
                        </label>
                        <select
                          id="attendance-representative-shareholder"
                          required
                          className="filter-select"
                          value={repHolder}
                          onChange={(event) =>
                            setRepHolder(event.target.value)
                          }>
                          <option value="">Select a shareholder</option>
                          {shareholders.map((holder) => (
                            <option key={holder.id} value={holder.id}>
                              {holder.name} ({holder.id})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    {repType === "new" && (
                      <>
                        <label className="field-label">
                          Representative name
                          <Input
                            required
                            value={repName}
                            maxLength={191}
                            onChange={(event) => setRepName(event.target.value)}
                          />
                        </label>
                        <label className="field-label">
                          Representative ID
                          <Input
                            required
                            value={repId}
                            maxLength={191}
                            onChange={(event) => setRepId(event.target.value)}
                          />
                        </label>
                      </>
                    )}
                    <label className="field-label">
                      Search shareholders
                      <div className="search-field">
                        <Search size={17} />
                        <Input
                          placeholder="Enter a name or ID"
                          value={search}
                          onChange={(event) => setSearch(event.target.value)}
                        />
                      </div>
                    </label>
                    {lookup.loading ? (
                      <LoadingState label="Loading registry…" />
                    ) : (
                      search.trim() && (
                        <div className="modal-list">
                          {!matches.length ? (
                            <p className="p-4 text-xs text-muted-foreground">
                              No unregistered shareholders match this search.
                            </p>
                          ) : (
                            matches.map((holder) => (
                              <label
                                key={holder.id}
                                className={`modal-list-item ${selected.includes(holder.id) ? "is-selected" : ""}`}>
                                <Checkbox
                                  checked={selected.includes(holder.id)}
                                  onCheckedChange={() => toggle(holder.id)}
                                  disabled={busy}
                                  aria-label={`Select ${holder.name} (${holder.id})`}
                                />
                                <div>
                                  <strong>{holder.name}</strong>
                                  <small>
                                    {holder.id} ·{" "}
                                    {formatNumber(holder.shareValue)} shares
                                  </small>
                                </div>
                              </label>
                            ))
                          )}
                        </div>
                      )
                    )}
                    {selected.length > 0 && (
                      <div className="modal-section">
                        <h3>{selected.length} selected shareholders</h3>
                        <div className="modal-list">
                          {shareholders
                            .filter((holder) => selected.includes(holder.id))
                            .map((holder) => (
                              <div className="modal-list-item" key={holder.id}>
                                <div>
                                  <strong>{holder.name}</strong>
                                  <small>{holder.id}</small>
                                </div>
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="ghost"
                                  disabled={busy}
                                  aria-label={`Unselect ${holder.name}`}
                                  onClick={() => toggle(holder.id)}>
                                  <X size={15} />
                                </Button>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </fieldset>
                </form>
              ) : (
                <p className="modal-readonly mb-4">
                  Attendance registration is unavailable for this meeting and
                  your access level.
                </p>
              )}
              <section className="modal-section">
                <h3>
                  Registered attendees{" "}
                  <span className="count-chip">
                    {data?.attendance.length ?? 0}
                  </span>
                </h3>
                {!data?.attendance.length ? (
                  <EmptyState
                    title="No attendees yet"
                    description="Registered shareholders appear here."
                  />
                ) : (
                  <div className="modal-list">
                    {data.attendance.map((row) => (
                      <div className="modal-list-item" key={row.id}>
                        <div>
                          <strong>{row.shareholderName}</strong>
                          <small>
                            {row.shareholderId} · {formatNumber(row.shareValue)}{" "}
                            shares
                          </small>
                          <small>
                            {row.representedByName
                              ? `Represented by ${row.representedByName}`
                              : "Attending directly"}
                          </small>
                        </div>
                        {can("attendance.remove") &&
                          data.meetingStatus !== "CLOSED" && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              disabled={busy}
                              aria-label={`Remove attendance for ${row.shareholderName}`}
                              onClick={() => setDeleting(row)}>
                              <Trash2 size={16} />
                            </Button>
                          )}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" disabled={busy} onClick={onClose}>
              Close
            </Button>
            {register && (
              <Button
                type="submit"
                form="attendance-form"
                disabled={
                  busy ||
                  loading ||
                  lookup.loading ||
                  !!lookup.error ||
                  !selected.length
                }>
                {busy
                  ? "Saving…"
                  : `Register ${selected.length || ""} ${selected.length === 1 ? "shareholder" : "shareholders"}`}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={!!deleting}
        title="Remove attendance?"
        description={`Remove the attendance record for ${deleting?.shareholderName ?? "this shareholder"}. Recorded ballots must be reversed before their attendance can be removed.`}
        label="Remove attendance"
        destructive
        busy={busy}
        onClose={() => setDeleting(null)}
        onConfirm={() => void remove()}
      />
    </>
  );
}
