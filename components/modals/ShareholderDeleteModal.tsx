"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ErrorNotice } from "@/components/workspace/Feedback";
import { responseError } from "@/lib/response-error";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  shareholder: { id: string; name: string } | null;
  onSuccess: () => void;
};
export default function ShareholderDeleteModal({
  isOpen,
  onClose,
  shareholder,
  onSuccess,
}: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    setError("");
  }, [isOpen]);
  const remove = async () => {
    if (!shareholder || busy) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch(
        `/api/shareholders/${encodeURIComponent(shareholder.id)}`,
        { method: "DELETE" },
      );
      const result = await response.json();
      if (!response.ok)
        throw new Error(
          responseError(result.error, "The registry could not be updated."),
        );
      toast.success("Shareholder deleted");
      onSuccess();
      onClose();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "The registry could not be updated.",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(value) => {
        if (!value && !busy) onClose();
      }}
    >
      <DialogContent showCloseButton={!busy}>
        <DialogHeader>
          <DialogTitle>Delete shareholder?</DialogTitle>
          <DialogDescription>
            This permanently removes {shareholder?.name} ({shareholder?.id})
            from the registry. Shareholders connected to meeting records cannot
            be deleted.
          </DialogDescription>
        </DialogHeader>
        {error && <ErrorNotice message={error} />}
        <DialogFooter>
          <Button variant="outline" disabled={busy} onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={busy}
            onClick={() => void remove()}
          >
            {busy ? "Deleting…" : "Delete shareholder"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
