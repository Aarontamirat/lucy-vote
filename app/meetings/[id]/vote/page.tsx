"use client";
import { Can } from "@/components/auth/Can";
import { useAuth } from "@/components/auth/AuthProvider";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  EmptyState,
  ErrorNotice,
  LoadingState,
} from "@/components/workspace/Feedback";
import { StatusBadge } from "@/components/workspace/StatusBadge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatNumber } from "@/lib/display";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, LoaderCircle, Search, Undo2, X } from "lucide-react";
import { ballotLimitError, type ElectionConfig, type ElectionRules } from "@/lib/election";
import styles from "./page.module.css";

type Nominee = { id: string; name: string; nameAm?: string | null; type: string };
type Attendance = {
  shareholderId: string;
  shareholderName?: string;
  representedById: string | null;
  representedByName?: string | null;
  shareValue: string;
};
type LegacyBallot = { voterId: string; voterName: string; nomineeIds: string[]; weight: number };
type VoterData = {
  voted: string[];
  voterWeight?: number;
  maxVotes: number;
  legacyBallots?: LegacyBallot[];
  votingRules: {
    mode: "STANDARD" | "GROUPED";
    firstPassers?: number;
    secondPassers?: number;
  };
};

export default function VotePage() {
  const { id } = useParams<{ id: string }>();
  return <VoteWorkspace key={id} id={id} />;
}

function VoteWorkspace({ id }: { id: string }) {
  const { can } = useAuth();
  const [meeting, setMeeting] = useState<{
    title: string;
    status: string;
    electionRules: ElectionRules | null;
    electionRulesError: string | null;
    electionConfig: ElectionConfig;
  } | null>(null);
  const [nominees, setNominees] = useState<Nominee[]>([]);
  const [voterId, setVoterId] = useState("");
  const [previousVotes, setPreviousVotes] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [rules, setRules] = useState<ElectionRules | null>(null);
  const [eligible, setEligible] = useState(false);
  const [weight, setWeight] = useState(0);
  const [cardHolder, setCardHolder] = useState<Attendance | null>(null);
  const [olderBallots, setOlderBallots] = useState<LegacyBallot[]>([]);
  const [lookupVersion, setLookupVersion] = useState(0);
  const [checking, setChecking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [reversing, setReversing] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const [reverseTarget, setReverseTarget] = useState<string | null>(null);
  const [reverseVoterId, setReverseVoterId] = useState<string | null>(null);
  const [reverseReason, setReverseReason] = useState("");
  const [reverseError, setReverseError] = useState("");
  const [search, setSearch] = useState("");
  const operation = useRef(0);
  useEffect(() => () => { operation.current += 1; }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/meetings/${id}/nominees`, {
      signal: controller.signal,
      cache: "no-store",
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load meeting");
        if (controller.signal.aborted) return;
        setMeeting({
          title: data.meetingName,
          status: data.meetingStatus,
          electionRules: data.electionRules ?? null,
          electionRulesError: data.electionRulesError ?? null,
          electionConfig: data.electionConfig ?? {},
        });
        setNominees(data.items || []);
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted)
          setError(
            error instanceof Error ? error.message : "Failed to load meeting",
          );
      });
    return () => controller.abort();
  }, [id, reload]);

  useEffect(() => {
    const controller = new AbortController();
    if (!voterId.trim()) return;
    setChecking(true);
    const timer = setTimeout(async () => {
      try {
        const [attendanceRes, votesRes] = await Promise.all([
          fetch(
            `/api/meetings/${id}/attendance?voterId=${encodeURIComponent(voterId.trim())}`,
            { signal: controller.signal, cache: "no-store" },
          ),
          fetch(
            `/api/meetings/${id}/votes?voterId=${encodeURIComponent(voterId.trim())}`,
            { signal: controller.signal, cache: "no-store" },
          ),
        ]);
        const [attendanceData, votesData] = await Promise.all([
          attendanceRes.json(),
          votesRes.json(),
        ]);
        if (!attendanceRes.ok || !votesRes.ok)
          throw new Error(
            attendanceData.error || votesData.error || "Failed to check voter",
          );
        if (controller.signal.aborted) return;
        const attendance = attendanceData.attendance as Attendance[];
        const votes = votesData as VoterData;
        setOlderBallots(votes.legacyBallots ?? []);
        setCardHolder(attendance[0] ?? null);
        if (votes.legacyBallots?.length) throw new Error(
          "Older combined votes must be reversed by a Super Admin before entering each shareholder's original card separately.",
        );
        if (!attendance.length)
          throw new Error(
            "This shareholder is not registered attending. Register direct or represented attendance, then enter the shareholder ID on their card.",
          );
        const voterWeight = Number(attendance[0].shareValue);
        if (!Number.isFinite(voterWeight) || voterWeight <= 0)
          throw new Error("Vote weight is zero; this voter cannot record a ballot.");
        setMeeting((meeting) =>
          meeting ? { ...meeting, status: votesData.meetingStatus } : meeting,
        );
        setEligible(true);
        setPreviousVotes(votes.voted);
        setWeight(voterWeight);
        setRules({
          mode: votes.votingRules.mode,
          winnerCount: votes.maxVotes,
          sections:
            votes.votingRules.mode === "GROUPED"
              ? [
                  {
                    key: "first",
                    label: "Group 1",
                    count: votes.votingRules.firstPassers!,
                  },
                  {
                    key: "second",
                    label: "Group 2",
                    count: votes.votingRules.secondPassers!,
                  },
                ]
              : [{ key: "standard", label: "Nominees", count: votes.maxVotes }],
        });
        setError("");
      } catch (error) {
        if (!controller.signal.aborted) {
          setEligible(false);
          setError(
            error instanceof Error ? error.message : "Failed to check voter",
          );
        }
      } finally {
        if (!controller.signal.aborted) setChecking(false);
      }
    }, 350);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [id, voterId, lookupVersion]);

  const changeVoter = (value: string) => {
    operation.current += 1;
    setVoterId(value);
    setEligible(false);
    setPreviousVotes([]);
    setSelected([]);
    setRules(null);
    setWeight(0);
    setCardHolder(null);
    setOlderBallots([]);
    setError("");
    setChecking(!!value.trim());
    setReverseTarget(null);
    setReverseVoterId(null);
    setReverseReason("");
    setReverseError("");
  };
  const toggleNominee = (nomineeId: string) => {
    if (!can("votes.record") || !rules || !eligible || checking || saving || previousVotes.includes(nomineeId))
      return;
    if (selected.includes(nomineeId)) {
      setSelected((ids) => ids.filter((id) => id !== nomineeId));
      return;
    }
    const selection = nominees.filter((n) =>
      [...previousVotes, ...selected, nomineeId].includes(n.id),
    );
    const limitError = ballotLimitError(selection, rules);
    if (limitError) {
      toast.error(limitError);
      return;
    }
    setSelected((ids) => [...ids, nomineeId]);
  };
  const submit = async () => {
    if (
      !can("votes.record") ||
      !eligible ||
      !rules ||
      checking ||
      !selected.length ||
      saving
    )
      return;
    const owner = ++operation.current;
    const submitted = [...selected];
    setSaving(true);
    try {
      const res = await fetch(`/api/meetings/${id}/votes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voterId: voterId.trim(), nomineeIds: submitted }),
      });
      const data = await res.json();
      if (operation.current !== owner) return;
      if (!res.ok)
        throw new Error(
          Array.isArray(data.error)
            ? data.error.map((e: { message: string }) => e.message).join("; ")
            : data.error || "Failed to record votes",
        );
      const created = Array.isArray(data.created)
        ? data.created.map((vote: { nomineeId: string }) => vote.nomineeId)
        : [];
      const already = Array.isArray(data.already) ? data.already as string[] : [];
      setPreviousVotes((ids) => [...new Set([...ids, ...already, ...created, ...submitted])]);
      setSelected([]);
      toast.success("Votes recorded");
    } catch (error) {
      if (operation.current !== owner) return;
      toast.error(
        error instanceof Error ? error.message : "Failed to record votes",
      );
    } finally {
      if (operation.current === owner) setSaving(false);
    }
  };

  const reverseVote = async (nomineeId: string) => {
    if (
      !can("votes.reverse") ||
      (!eligible && !reverseVoterId) ||
      checking ||
      saving ||
      (reverseVoterId ? !olderBallots.some((ballot) => ballot.voterId === reverseVoterId && ballot.nomineeIds.includes(nomineeId)) : !previousVotes.includes(nomineeId))
    )
      return;
    const reason = reverseReason.trim();
    if (reason.length < 5 || reason.length > 500) {
      setReverseError("Enter a reason between 5 and 500 characters.");
      return;
    }
    setReverseError("");
    const owner = ++operation.current;
    setSaving(true);
    setReversing(nomineeId);
    try {
      const res = await fetch(`/api/meetings/${id}/votes`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voterId: reverseVoterId ?? voterId.trim(),
          nomineeIds: [nomineeId],
          reason: reason.trim(),
        }),
      });
      const data = await res.json();
      if (operation.current !== owner) return;
      if (!res.ok)
        throw new Error(
          Array.isArray(data.error)
            ? data.error.map((e: { message: string }) => e.message).join("; ")
            : data.error || "Failed to reverse vote",
        );
      if (!reverseVoterId) {
        setPreviousVotes(data.voted);
        setSelected((ids) => ids.filter((id) => !data.voted.includes(id)));
      } else {
        setEligible(false);
        setLookupVersion((value) => value + 1);
      }
      setReverseTarget(null);
      setReverseVoterId(null);
      setReverseReason("");
      toast.success("Vote reversed. You can now record the correct nominee.");
    } catch (error) {
      if (operation.current !== owner) return;
      setReverseError(
        error instanceof Error ? error.message : "Failed to reverse vote",
      );
    } finally {
      if (operation.current === owner) {
        setSaving(false);
        setReversing(null);
      }
    }
  };

  const registrationOrder = useMemo(
    () => new Map(nominees.map((nominee, index) => [nominee.id, index + 1])),
    [nominees],
  );
  const displayRules = rules ?? meeting?.electionRules ?? null;
  const grouped = displayRules?.mode === "GROUPED" ||
    (!displayRules && (meeting?.electionConfig.firstPassers != null ||
      meeting?.electionConfig.secondPassers != null));
  const sections = grouped
    ? displayRules?.sections ?? [
        { key: "first", label: "Group 1", count: meeting?.electionConfig.firstPassers ?? 0 },
        { key: "second", label: "Group 2", count: meeting?.electionConfig.secondPassers ?? 0 },
      ]
    : [{ key: "standard", label: "Nominee choices", count: displayRules?.winnerCount ?? 0 }];
  const query = search.trim().toLowerCase();
  const matches = (nominee: Nominee) => !query ||
    nominee.name.toLowerCase().includes(query) ||
    nominee.nameAm?.toLowerCase().includes(query);
  const usedIds = new Set([...previousVotes, ...selected]);
  const groups = sections.map((section) => ({
    ...section,
    unassigned: false,
    items: grouped ? nominees.filter((nominee) => nominee.type === section.key) : nominees,
  }));
  const unassigned = grouped
    ? nominees.filter((nominee) => !sections.some((section) => section.key === nominee.type))
    : [];
  if (unassigned.length) groups.push({
    key: "unassigned", label: "Unassigned nominees", count: 0,
    unassigned: true, items: unassigned,
  });

  if (!meeting)
    return error ? (
      <ErrorNotice
        message={error}
        retry={() => {
          setError("");
          setReload((value) => value + 1);
        }}
      />
    ) : (
      <LoadingState label="Loading ballot…" />
    );
  const open = meeting.status === "VOTINGOPEN";
  const usedCount = previousVotes.length + selected.length;
  return (
    <main className={styles.workspace} data-vote-workspace>
      <header className={styles.pageHeader}>
        <Link href="/meetings" className={styles.backLink} aria-label="Back to meetings" title="Back to meetings">
          <ArrowLeft size={18} />
        </Link>
        <div className={styles.meetingHeading}>
          <p>Vote recording</p>
          <h1>{meeting.title}</h1>
        </div>
        <StatusBadge status={meeting.status} />
      </header>
      <section className={styles.ballot} aria-label="Ballot entry">
        <div className={styles.toolbar}>
          <div className={styles.voterField}>
            <label htmlFor="voter-id">Shareholder ID on voting card</label>
            <Input
              id="voter-id"
              value={voterId}
              onChange={(event) => changeVoter(event.target.value)}
              disabled={saving || !open || !can("votes.lookup")}
              placeholder="Enter the ID on the voting card"
              autoComplete="off"
              aria-describedby="voter-help"
              maxLength={191}
            />
          </div>
          <div className={styles.voterStatus}>
            {checking ? (
              <div role="status" className={styles.checking}>
                <LoaderCircle size={16} className="animate-spin" />
                Checking attendance and ballot limits…
              </div>
            ) : eligible && rules ? (
              <div role="status" className={styles.ballotMeter}>
                <strong>
                  {usedCount} of {rules.winnerCount} choices used · Weight: {formatNumber(weight)} shares
                </strong>
                <span>{cardHolder?.shareholderName}{cardHolder?.shareholderName ? " · " : ""}{cardHolder?.representedById
                  ? `Represented by ${cardHolder.representedByName ?? cardHolder.representedById}`
                  : "Direct attendance"}</span>
              </div>
            ) : (
              <p id="voter-help">
                {voterId.trim() && error
                  ? "Check this voter ID before recording."
                  : "Enter each shareholder's card separately. A representative's own card uses only their own shares."}
              </p>
            )}
            {(checking || eligible) && <span id="voter-help" className="sr-only">
              Attendance and any previously recorded choices are checked automatically.
            </span>}
          </div>
          <div className={styles.searchField}>
            <label htmlFor="nominee-search">Search nominees</label>
            <div>
              <Search size={16} aria-hidden="true" />
              <Input
                id="nominee-search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Find a nominee by name"
                autoComplete="off"
              />
              {search && <button
                type="button"
                aria-label="Clear nominee search"
                onClick={() => setSearch("")}
                className={styles.clearSearch}
              ><X size={15} /></button>}
            </div>
          </div>
        </div>
        {!open && <div className={styles.closedNotice} role="status">
          <strong>{meeting.status === "CLOSED" ? "Voting is closed" : "Voting has not opened yet"}</strong>
          <span>Ballots can be recorded while voting is open.</span>
        </div>}
        {(error || meeting.electionRulesError) && <div className={styles.error}>
          <ErrorNotice message={error || meeting.electionRulesError!} />
        </div>}
        {!!olderBallots.length && <section className={styles.legacyNotice} aria-label="Older combined ballots">
          <strong>Correct older combined ballots</strong>
          <p>Keep the original cards. Reverse every choice listed below, then record each shareholder card using its own ID and choices. Closed meeting records remain preserved.</p>
          {olderBallots.map((ballot) => <div key={ballot.voterId}>
            <p>{ballot.voterName} · {ballot.voterId} · Previous weight: {formatNumber(ballot.weight)}</p>
            {ballot.nomineeIds.map((nomineeId) => <Can key={nomineeId} permission="votes.reverse">
              <Button variant="outline" size="sm" disabled={!open || saving || checking}
                aria-label={`Reverse older combined vote for ${nominees.find((item) => item.id === nomineeId)?.name ?? nomineeId}`}
                onClick={() => { setReverseVoterId(ballot.voterId); setReverseTarget(nomineeId); setReverseReason(""); setReverseError(""); }}>
                <Undo2 size={12} />Reverse {nominees.find((item) => item.id === nomineeId)?.name ?? nomineeId}
              </Button>
            </Can>)}
          </div>)}
        </section>}
        <div className={[styles.board, grouped ? styles.grouped : "", unassigned.length ? styles.hasUnassigned : ""].filter(Boolean).join(" ")}>
          {!nominees.length ? <EmptyState
            title="No nominees registered"
            description="Nominees must be configured before ballots can be recorded."
          /> : groups.map((group) => {
            const visible = group.items.filter(matches);
            const used = group.items.filter((nominee) => usedIds.has(nominee.id)).length;
            return <section
              key={group.key}
              className={styles.group}
              data-vote-section={group.key}
              aria-labelledby={"vote-group-" + group.key}
            >
              <header className={styles.groupHeader}>
                <div>
                  <h2 id={"vote-group-" + group.key}>{group.label}</h2>
                  <span>{group.items.length} nominees{query ? " · " + visible.length + " matching" : ""}</span>
                </div>
                {!group.unassigned && <div className={styles.groupLimit} aria-label={group.label + " ballot limit"}>
                  <strong>{group.count > 0 ? used + " of " + group.count + " used" : "Limit not configured"}</strong>
                  {group.count > 0 && <span>{Math.max(0, group.count - used)} remaining</span>}
                </div>}
              </header>
              {group.unassigned && <p className={styles.unassignedNotice}>
                These nominees have no valid group. Update their group before voting; they cannot be selected on this ballot.
              </p>}
              <div
                className={styles.nomineeScroll}
                data-vote-scroll={group.key}
                tabIndex={0}
                role="region"
                aria-label={group.label + " nominee list"}
              >
                {!visible.length ? <p className={styles.emptyGroup}>
                  {query ? "No nominees match your search." : "No nominees registered in this group."}
                </p> : <div className={styles.nomineeGrid}>
                  {visible.map((nominee) => {
                    const already = previousVotes.includes(nominee.id);
                    const chosen = selected.includes(nominee.id);
                    return <div
                      key={nominee.id}
                      className={styles.nominee}
                      data-nominee-id={nominee.id}
                      data-choice-state={already ? "recorded" : chosen ? "selected" : "available"}
                    >
                      <Checkbox
                        id={"choice-" + nominee.id}
                        aria-label={nominee.name}
                        checked={already || chosen}
                        disabled={!can("votes.record") || already || saving || !eligible || checking || !open || group.unassigned}
                        onCheckedChange={() => toggleNominee(nominee.id)}
                        className={styles.checkbox}
                      />
                      <label htmlFor={"choice-" + nominee.id} className={styles.nomineeName}>
                        <span>{nominee.name}</span>
                        {nominee.nameAm && nominee.nameAm !== nominee.name && <small lang="am">{nominee.nameAm}</small>}
                      </label>
                      <span className={styles.order} aria-hidden="true">{registrationOrder.get(nominee.id)}</span>
                      {(already || chosen) && <div className={styles.choiceStatus}>
                        <span className={styles.recordedLabel}>
                          <CheckCircle2 size={12} />{already ? "Recorded" : "Selected"}
                        </span>
                        {already && <Can permission="votes.reverse">
                          <Button
                            variant="outline"
                            size="sm"
                            className={styles.reverseButton}
                            disabled={saving || checking || !eligible || !open}
                            aria-label={"Reverse recorded vote for " + nominee.name}
                            onClick={() => {
                              setReverseTarget(nominee.id);
                              setReverseVoterId(null);
                              setReverseReason("");
                              setReverseError("");
                            }}
                          >
                            <Undo2 size={12} />Reverse
                          </Button>
                        </Can>}
                      </div>}
                    </div>;
                  })}
                </div>}
              </div>
            </section>;
          })}
        </div>
        <footer className={styles.recordingFooter}>
          <div>
            <strong>{selected.length ? selected.length + " new " + (selected.length === 1 ? "choice" : "choices") + " selected" : "Match the choices on the paper card"}</strong>
            <p>{eligible ? `${previousVotes.length} recorded · ${selected.length} selected` : "Check the shareholder card ID and choices before recording."}</p>
          </div>
          <Can permission="votes.record">
            <Button
              onClick={() => void submit()}
              className={styles.recordButton}
              disabled={!open || !eligible || checking || saving || !selected.length}
            >
              {saving
                ? reversing ? "Reversing…" : "Recording…"
                : selected.length
                  ? "Record " + selected.length + " " + (selected.length === 1 ? "choice" : "choices")
                  : "Select nominees to record"}
            </Button>
          </Can>
        </footer>
      </section>
      <Dialog
        open={!!reverseTarget}
        onOpenChange={(value) => {
          if (!value && !saving) setReverseTarget(null);
        }}
      >
        <DialogContent showCloseButton={!saving}>
          <DialogHeader>
            <DialogTitle>Reverse recorded choice</DialogTitle>
            <DialogDescription>
              This removes the recorded vote for{" "}
              {nominees.find((nominee) => nominee.id === reverseTarget)?.name} for ballot ID {reverseVoterId ?? voterId.trim()}.
              The reason is saved in the audit history.
            </DialogDescription>
          </DialogHeader>
          <label htmlFor="reversal-reason" className="text-sm font-medium">
            Reason for reversal
          </label>
          <textarea
            id="reversal-reason"
            className="form-textarea"
            value={reverseReason}
            onChange={(event) => setReverseReason(event.target.value)}
            minLength={5}
            maxLength={500}
            rows={3}
            disabled={saving}
            placeholder="Explain the correction (5–500 characters)"
          />
          {reverseError && <ErrorNotice message={reverseError} />}
          <DialogFooter>
            <Button
              variant="outline"
              disabled={saving}
              onClick={() => setReverseTarget(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={saving || reverseReason.trim().length < 5}
              onClick={() => {
                if (reverseTarget) void reverseVote(reverseTarget);
              }}
            >
              {saving ? "Reversing…" : "Reverse choice"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
