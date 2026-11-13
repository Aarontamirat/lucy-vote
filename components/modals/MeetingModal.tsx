"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ErrorNotice } from "@/components/workspace/Feedback";
import { getElectionRules } from "@/lib/election";

interface MeetingData {
  id: string;
  title: string;
  date: string;
  location: string | null;
  quorumPct: number | null;
  status: string;
  firstPassers: number | null;
  secondPassers: number | null;
  winnerCount: number | null;
}
interface MeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "add" | "edit";
  initialData?: MeetingData | null;
  onSuccess: () => void;
}

export default function MeetingModal({
  isOpen,
  onClose,
  mode,
  initialData,
  onSuccess,
}: MeetingModalProps) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [quorum, setQuorum] = useState("");
  const [grouped, setGrouped] = useState(false);
  const [firstPassers, setFirstPassers] = useState("");
  const [secondPassers, setSecondPassers] = useState("");
  const [winnerCount, setWinnerCount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const legacySetup =
    initialData?.status === "VOTINGOPEN" &&
    initialData.firstPassers == null &&
    initialData.secondPassers == null &&
    initialData.winnerCount == null;
  const locked =
    initialData?.status === "CLOSED" ||
    (initialData?.status === "VOTINGOPEN" && !legacySetup);

  useEffect(() => {
    setError("");
    const data = mode === "edit" ? initialData : null;
    setTitle(data?.title ?? "");
    if (data?.date) {
      const localDate = new Date(data.date);
      setDate(
        new Date(localDate.getTime() - localDate.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16),
      );
    } else setDate("");
    setLocation(data?.location ?? "");
    setQuorum(data?.quorumPct?.toString() ?? "");
    setGrouped(data?.firstPassers != null || data?.secondPassers != null);
    setFirstPassers(data?.firstPassers?.toString() ?? "");
    setSecondPassers(data?.secondPassers?.toString() ?? "");
    setWinnerCount(data?.winnerCount?.toString() ?? "");
  }, [mode, initialData, isOpen]);

  const handleSubmit = async () => {
    try {
      if (!legacySetup && (!title.trim() || !date || !location.trim()))
        throw new Error("Title, date, and location are required.");
      if (
        !legacySetup &&
        (Number(quorum) < 1 ||
          Number(quorum) > 100 ||
          !Number.isFinite(Number(quorum)))
      )
        throw new Error("Quorum must be between 1% and 100%.");
      const config = {
        firstPassers: grouped ? Number(firstPassers) : null,
        secondPassers: grouped ? Number(secondPassers) : null,
        winnerCount: grouped ? null : Number(winnerCount),
      };
      getElectionRules(config);
      setLoading(true);
      const res = await fetch(
        mode === "add" ? "/api/meetings" : `/api/meetings/${initialData!.id}`,
        {
          method: mode === "add" ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            legacySetup
              ? { winnerCount: config.winnerCount }
              : {
                  title: title.trim(),
                  date: new Date(date).toISOString(),
                  location: location.trim(),
                  quorum: Number(quorum),
                  ...config,
                },
          ),
        },
      );
      const data = await res.json();
      if (!res.ok)
        throw new Error(
          Array.isArray(data.error)
            ? data.error.map((e: { message: string }) => e.message).join("; ")
            : data.error || "Failed to save meeting",
        );
      toast.success(
        `Meeting ${mode === "add" ? "created" : "updated"} successfully`,
      );
      onSuccess();
      onClose();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to save meeting",
      );
    } finally {
      setLoading(false);
    }
  };

  const seats = grouped
    ? Number(firstPassers) + Number(secondPassers)
    : Number(winnerCount);
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !loading) onClose();
      }}
    >
      <DialogContent
        showCloseButton={!loading}
        className="max-h-[90dvh] overflow-y-auto sm:max-w-lg"
      >
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Add New Meeting" : "Edit Meeting"}
          </DialogTitle>
          <DialogDescription>
            Set the election rules before preparing voting cards.
          </DialogDescription>
        </DialogHeader>
        {locked && (
          <p className="text-sm text-amber-700 dark:text-amber-300">
            Meeting settings are locked once voting opens.
          </p>
        )}
        {legacySetup && (
          <p className="text-sm text-amber-700 dark:text-amber-300">
            This older meeting needs a winner count. It can be set before its
            first vote.
          </p>
        )}
        {error && <ErrorNotice message={error} />}
        <form
          id="meeting-form"
          onSubmit={(event) => {
            event.preventDefault();
            void handleSubmit();
          }}
        >
          <fieldset disabled={locked || loading} className="space-y-4">
            <fieldset disabled={legacySetup} className="space-y-4">
              <div>
                <label
                  htmlFor="meeting-title"
                  className="mb-1 block text-sm font-medium"
                >
                  Title
                </label>
                <Input
                  id="meeting-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div>
                <label
                  htmlFor="meeting-date"
                  className="mb-1 block text-sm font-medium"
                >
                  Date & time
                </label>
                <Input
                  id="meeting-date"
                  type="datetime-local"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div>
                <label
                  htmlFor="meeting-location"
                  className="mb-1 block text-sm font-medium"
                >
                  Location
                </label>
                <Input
                  id="meeting-location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <div>
                <label
                  htmlFor="meeting-quorum"
                  className="mb-1 block text-sm font-medium"
                >
                  Quorum (%)
                </label>
                <Input
                  id="meeting-quorum"
                  type="number"
                  min="1"
                  max="100"
                  value={quorum}
                  onChange={(e) => setQuorum(e.target.value)}
                />
              </div>
              <div>
                <label
                  htmlFor="election-mode"
                  className="mb-1 block text-sm font-medium"
                >
                  Election type
                </label>
                <select
                  id="election-mode"
                  value={grouped ? "GROUPED" : "STANDARD"}
                  onChange={(e) => setGrouped(e.target.value === "GROUPED")}
                  className="w-full rounded-md border bg-background p-2"
                >
                  <option value="STANDARD">Standard — one nominee list</option>
                  <option value="GROUPED">Two nominee groups</option>
                </select>
              </div>
            </fieldset>
            {grouped ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="firstPassersNumber"
                    className="mb-1 block text-sm font-medium"
                  >
                    Group 1 winners
                  </label>
                  <Input
                    id="firstPassersNumber"
                    type="number"
                    min="1"
                    max="200"
                    step="1"
                    value={firstPassers}
                    onChange={(e) => setFirstPassers(e.target.value)}
                  />
                </div>
                <div>
                  <label
                    htmlFor="secondPassersNumber"
                    className="mb-1 block text-sm font-medium"
                  >
                    Group 2 winners
                  </label>
                  <Input
                    id="secondPassersNumber"
                    type="number"
                    min="1"
                    max="200"
                    step="1"
                    value={secondPassers}
                    onChange={(e) => setSecondPassers(e.target.value)}
                  />
                </div>
              </div>
            ) : (
              <div>
                <label
                  htmlFor="winner-count"
                  className="mb-1 block text-sm font-medium"
                >
                  Number of winners <span className="text-red-600">*</span>
                </label>
                <Input
                  id="winner-count"
                  type="number"
                  min="1"
                  max="200"
                  step="1"
                  required
                  value={winnerCount}
                  onChange={(e) => setWinnerCount(e.target.value)}
                />
                <p className="mt-1 text-sm text-muted-foreground">
                  The highest ranked nominees fill these seats. Each card has
                  this many blank name spaces.
                </p>
              </div>
            )}
            {seats > 0 && (
              <p className="rounded-md bg-cyan-50 p-3 text-sm font-medium text-cyan-950 dark:bg-cyan-950 dark:text-cyan-100">
                {seats} winners · {seats} write-in spaces per shareholder card
              </p>
            )}
          </fieldset>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="meeting-form"
            disabled={loading || locked}
          >
            {loading ? "Saving…" : "Save meeting"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
