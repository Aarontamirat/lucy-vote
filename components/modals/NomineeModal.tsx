"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  EmptyState,
  ErrorNotice,
  LoadingState,
} from "@/components/workspace/Feedback";
import { ConfirmDialog } from "@/components/workspace/ConfirmDialog";
import { useResource } from "@/components/workspace/useResource";
import { responseError } from "@/lib/response-error";

type Nominee = {
  id: string;
  shareholderId: string;
  name: string;
  type: string;
  description: string | null;
};
type NomineeData = {
  meetingStatus: string;
  items: Nominee[];
  shareholders: { id: string; name: string; nameAm?: string | null }[];
};
type Meeting = {
  id: string;
  title: string;
  status: string;
  firstPassers?: number | null;
  secondPassers?: number | null;
};
export default function NomineeModal({
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
  const { data, loading, error, reload } = useResource<NomineeData>(
    isOpen && meeting ? `/api/meetings/${meeting.id}/nominees` : null,
  );
  const [selected, setSelected] = useState("");
  const [group, setGroup] = useState("");
  const [description, setDescription] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Nominee | null>(null);
  const [busy, setBusy] = useState(false);
  const [saveError, setSaveError] = useState("");
  const grouped =
    meeting?.firstPassers != null && meeting?.secondPassers != null;
  const editable =
    !!data &&
    can("nominees.manage") &&
    !["VOTINGOPEN", "CLOSED"].includes(data.meetingStatus);
  const reset = () => {
    setSelected("");
    setGroup("");
    setDescription("");
    setEditing(null);
    setSaveError("");
  };
  useEffect(() => {
    setSelected("");
    setGroup("");
    setDescription("");
    setEditing(null);
    setDeleting(null);
    setSaveError("");
  }, [isOpen, meeting?.id]);
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!meeting || !data || busy || !editable) return;
    const shareholder = data.shareholders.find(
      (holder) => holder.id === selected,
    );
    if (!shareholder) {
      setSaveError("Select a shareholder.");
      return;
    }
    setBusy(true);
    setSaveError("");
    try {
      const response = await fetch(
        `/api/meetings/${meeting.id}/nominees${editing ? `/${editing}` : ""}`,
        {
          method: editing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            shareholderId: shareholder.id,
            name: shareholder.name,
            nameAm: shareholder.nameAm,
            type: grouped ? group : "standard",
            description,
          }),
        },
      );
      const result = await response.json();
      if (!response.ok)
        throw new Error(
          responseError(result.error, "The nominee could not be saved."),
        );
      toast.success(editing ? "Nominee updated" : "Nominee added");
      reset();
      reload();
      onSuccess();
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : "The nominee could not be saved.",
      );
    } finally {
      setBusy(false);
    }
  };
  const remove = async () => {
    if (!meeting || !deleting || busy || !editable) return;
    setBusy(true);
    setSaveError("");
    try {
      const response = await fetch(
        `/api/meetings/${meeting.id}/nominees/${deleting.id}`,
        { method: "DELETE" },
      );
      const result = await response.json();
      if (!response.ok)
        throw new Error(
          responseError(result.error, "The nominee could not be removed."),
        );
      if (editing === deleting.id) reset();
      setDeleting(null);
      reload();
      onSuccess();
      toast.success("Nominee removed");
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : "The nominee could not be removed.",
      );
      setDeleting(null);
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={(value) => {
          if (!value && !busy) onClose();
        }}
      >
        <DialogContent showCloseButton={!busy} className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nominees — {meeting?.title}</DialogTitle>
            <DialogDescription>
              Choose eligible shareholders and configure the election’s
              nominees.
            </DialogDescription>
          </DialogHeader>
          {error && <ErrorNotice message={error} retry={reload} />}
          {saveError && <ErrorNotice message={saveError} />}
          {loading ? (
            <LoadingState label="Loading nominees…" />
          ) : (
            <>
              {!editable && (
                <p className="modal-readonly">
                  Nominee details are read-only for this meeting and your access
                  level.
                </p>
              )}
              {!data?.items.length ? (
                <EmptyState
                  title="No nominees yet"
                  description="Add the shareholders who will stand in this election."
                />
              ) : (
                <div className="modal-list">
                  {data.items.map((nominee) => (
                    <div className="modal-list-item" key={nominee.id}>
                      <div>
                        <strong>{nominee.name}</strong>
                        <small>
                          {grouped
                            ? nominee.type === "first"
                              ? "Group 1"
                              : "Group 2"
                            : "Standard"}
                          {nominee.description && ` · ${nominee.description}`}
                        </small>
                      </div>
                      {editable && (
                        <>
                          <Button
                            size="icon"
                            variant="ghost"
                            disabled={busy}
                            aria-label={`Edit nominee ${nominee.name}`}
                            onClick={() => {
                              setEditing(nominee.id);
                              setSelected(nominee.shareholderId);
                              setGroup(nominee.type);
                              setDescription(nominee.description ?? "");
                              setSaveError("");
                            }}
                          >
                            <Pencil size={16} />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            disabled={busy}
                            aria-label={`Remove nominee ${nominee.name}`}
                            onClick={() => setDeleting(nominee)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {editable && (
                <form
                  id="nominee-form"
                  className="modal-section border-t pt-4"
                  onSubmit={save}
                >
                  <h3>{editing ? "Edit nominee" : "Add nominee"}</h3>
                  <fieldset className="modal-section" disabled={busy}>
                    <div className="field-label">
                      <label htmlFor="nominee-shareholder">Shareholder</label>
                      <select
                        id="nominee-shareholder"
                        required
                        disabled={!!editing}
                        className="filter-select"
                        value={selected}
                        onChange={(event) => setSelected(event.target.value)}
                      >
                        <option value="">Select a shareholder</option>
                        {data?.shareholders.map((holder) => (
                          <option key={holder.id} value={holder.id}>
                            {holder.name} ({holder.id})
                          </option>
                        ))}
                      </select>
                      {editing && (
                        <p className="text-xs text-muted-foreground">
                          To replace the shareholder, remove this nominee and
                          add the correct shareholder before voting opens.
                        </p>
                      )}
                    </div>
                    {grouped && (
                      <div className="field-label">
                        <label htmlFor="nominee-nominee-group">
                          Nominee group
                        </label>
                        <select
                          id="nominee-nominee-group"
                          required
                          className="filter-select"
                          value={group}
                          onChange={(event) => setGroup(event.target.value)}
                        >
                          <option value="">Select a group</option>
                          <option value="first">Group 1</option>
                          <option value="second">Group 2</option>
                        </select>
                      </div>
                    )}
                    <label className="field-label">
                      Description (optional)
                      <Input
                        value={description}
                        maxLength={500}
                        onChange={(event) => setDescription(event.target.value)}
                      />
                    </label>
                  </fieldset>
                </form>
              )}
            </>
          )}
          <DialogFooter>
            <Button variant="outline" disabled={busy} onClick={onClose}>
              Close
            </Button>
            {editing && (
              <Button variant="outline" disabled={busy} onClick={reset}>
                Cancel edit
              </Button>
            )}
            {editable && (
              <Button
                type="submit"
                form="nominee-form"
                disabled={busy || loading}
              >
                {busy ? "Saving…" : editing ? "Update nominee" : "Add nominee"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={!!deleting}
        title="Remove nominee?"
        description={`Remove ${deleting?.name ?? "this nominee"} from the election. This action cannot be undone.`}
        label="Remove nominee"
        destructive
        busy={busy}
        onClose={() => setDeleting(null)}
        onConfirm={() => void remove()}
      />
    </>
  );
}
