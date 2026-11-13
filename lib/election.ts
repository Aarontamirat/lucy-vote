export type ElectionConfig = {
  firstPassers?: number | null;
  secondPassers?: number | null;
  winnerCount?: number | null;
};

export type ElectionRules = {
  mode: "STANDARD" | "GROUPED";
  winnerCount: number;
  sections: { key: string; label: string; count: number }[];
};

const positiveInteger = (value: unknown): value is number =>
  typeof value === "number" && Number.isSafeInteger(value) && value > 0;

export function getElectionRules(config: ElectionConfig): ElectionRules {
  if (config.firstPassers != null || config.secondPassers != null) {
    if (!positiveInteger(config.firstPassers) || !positiveInteger(config.secondPassers)) {
      throw new Error("Set a positive whole number of winners for both nominee groups.");
    }
    return {
      mode: "GROUPED",
      winnerCount: config.firstPassers + config.secondPassers,
      sections: [
        { key: "first", label: "Group 1", count: config.firstPassers },
        { key: "second", label: "Group 2", count: config.secondPassers },
      ],
    };
  }
  if (!positiveInteger(config.winnerCount)) {
    throw new Error("Set the number of winners in Edit Meeting before printing cards or opening voting.");
  }
  return {
    mode: "STANDARD",
    winnerCount: config.winnerCount,
    sections: [{ key: "standard", label: "Nominees you vote for", count: config.winnerCount }],
  };
}

export type NomineeResult = {
  nomineeId: string;
  name: string;
  nameAm?: string | null;
  type: string;
  totalWeight: number;
  registrationOrder?: number;
};

export type SelectionStatus = "PENDING" | "LEADING" | "WINNER" | "TIED" | "NOT_SELECTED";
export type RankedResult = NomineeResult & { rank: number; selectionStatus: SelectionStatus };

export function rankElectionResults(
  results: NomineeResult[],
  rules: ElectionRules | null,
  closed: boolean,
): RankedResult[] {
  const sorted = [...results].sort((a, b) => b.totalWeight - a.totalWeight ||
    (a.registrationOrder ?? Number.MAX_SAFE_INTEGER) - (b.registrationOrder ?? Number.MAX_SAFE_INTEGER) ||
    a.nomineeId.localeCompare(b.nomineeId));
  const ranked = new Map<string, RankedResult>();
  const sections = rules?.sections ?? [{ key: "standard", label: "", count: 0 }];
  for (const section of sections) {
    const pool = rules?.mode === "GROUPED" ? sorted.filter((r) => r.type === section.key) : sorted;
    const cutoff = pool[section.count - 1]?.totalWeight;
    const boundaryTie = cutoff != null && cutoff > 0 && pool[section.count]?.totalWeight === cutoff;
    for (let index = 0; index < pool.length; index++) {
      const result = pool[index];
      const rank = index > 0 && pool[index - 1].totalWeight === result.totalWeight
        ? ranked.get(pool[index - 1].nomineeId)!.rank : index + 1;
      let selectionStatus: SelectionStatus = "NOT_SELECTED";
      if (!rules || result.totalWeight <= 0) selectionStatus = "PENDING";
      else if (boundaryTie && result.totalWeight === cutoff) selectionStatus = "TIED";
      else if (index < section.count) selectionStatus = closed ? "WINNER" : "LEADING";
      ranked.set(result.nomineeId, { ...result, rank, selectionStatus });
    }
  }
  return sorted.map((r, index) => ranked.get(r.nomineeId) ?? { ...r, rank: index + 1, selectionStatus: "PENDING" });
}

export function ballotLimitError(
  selected: { type: string }[],
  rules: ElectionRules,
): string | null {
  if (selected.length > rules.winnerCount) return `This ballot allows up to ${rules.winnerCount} nominees in total.`;
  if (rules.mode === "GROUPED") {
    if (selected.some((n) => !rules.sections.some((s) => s.key === n.type))) {
      return "This ballot allows up to the configured nominees in Group 1 and Group 2 only.";
    }
    for (const section of rules.sections) {
      if (selected.filter((n) => n.type === section.key).length > section.count) {
        return `This ballot allows up to ${section.count} ${section.label} nominees.`;
      }
    }
  }
  return null;
}
