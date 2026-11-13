import type { RankedResult } from "./election";

// Registration order before the first vote; live passer/rank order thereafter.
export function orderNomineeBoard(
  results: RankedResult[],
  grouped: boolean,
): RankedResult[] {
  const registration = (a: RankedResult, b: RankedResult) =>
    (a.registrationOrder ?? Number.MAX_SAFE_INTEGER) -
      (b.registrationOrder ?? Number.MAX_SAFE_INTEGER) ||
    a.nomineeId.localeCompare(b.nomineeId);
  if (!results.some((r) => r.totalWeight > 0))
    return [...results].sort(registration);
  const priority = (result: RankedResult) =>
    ["LEADING", "WINNER"].includes(result.selectionStatus)
      ? 0
      : result.selectionStatus === "TIED"
        ? 1
        : 2;
  return [...results].sort(
    (a, b) =>
      (grouped ? priority(a) - priority(b) : 0) ||
      b.totalWeight - a.totalWeight ||
      registration(a, b),
  );
}

export function fitNomineeBoard(
  width: number,
  height: number,
  count: number,
  bilingual: boolean,
) {
  const total = Math.max(1, count);
  const gap = width < 1000 ? 10 : 16;
  let best = { columns: 1, rows: total, fontSize: 28, gap };
  let bestScore = -Infinity;
  const maxColumns = Math.min(total, Math.max(1, Math.floor(width / 180)));
  for (let columns = 1; columns <= maxColumns; columns++) {
    const rows = Math.ceil(total / columns);
    const tileWidth = Math.max(1, (width - gap * (columns - 1)) / columns);
    const tileHeight = Math.max(1, (height - gap * (rows - 1)) / rows);
    const fontSize = Math.max(
      8,
      Math.min(
        56,
        (tileWidth - 54) / 9.5,
        (tileHeight - 38) / (bilingual ? 4.1 : 3.4),
      ),
    );
    const occupancy = total / (columns * rows);
    const score =
      fontSize + occupancy * 2 - Math.abs(tileWidth / tileHeight - 2.5);
    if (score > bestScore) {
      bestScore = score;
      best = { columns, rows, fontSize: Math.floor(fontSize), gap };
    }
  }
  return best;
}

// Wide leaderboard rows read down each column. Choose the layout with the
// largest names, using fewer columns only when the available sizes are equal.
export function fitNomineeLeaderboard(
  width: number,
  height: number,
  count: number,
  bilingual: boolean,
) {
  const total = Math.max(1, count);
  const normalGap = height < 600 ? 6 : 8;
  const minimumRowHeight = 46;
  const maxColumns = Math.min(total, Math.max(1, Math.floor(width / 300)));
  let best: { columns: number; rows: number; fontSize: number; gap: number; rowHeight: number } | null = null;
  let bestFits = false;
  for (let columns = 1; columns <= maxColumns; columns++) {
    const rows = Math.ceil(total / columns);
    const gap = rows > 1
      ? Math.min(normalGap, Math.max(2, Math.floor((height - rows * minimumRowHeight) / (rows - 1))))
      : normalGap;
    const rowWidth = (width - 20 * (columns - 1)) / columns;
    const rowHeight = (height - gap * (rows - 1)) / rows;
    const fontSize = Math.floor(
      Math.max(
        8,
        Math.min(
          72,
          (rowWidth - 180) / 12,
          (rowHeight - 16) / (bilingual ? 1.95 : 1.3),
        ),
      ),
    );
    const fits = rowHeight >= minimumRowHeight;
    const candidate = { columns, rows, fontSize, gap, rowHeight };
    if (!best || (fits && !bestFits) || (fits === bestFits && (
      fits ? fontSize > best.fontSize : rowHeight > best.rowHeight
    ))) {
      best = candidate;
      bestFits = fits;
    }
  }
  const fitted = best!;
  // When a small screen cannot fit the election, preserve readable rows and
  // let the board scroll instead of letting text grow over neighbouring rows.
  const rowHeight = Math.max(minimumRowHeight, Math.floor(fitted.rowHeight));
  const rowWidth = (width - 20 * (fitted.columns - 1)) / fitted.columns;
  return {
    ...fitted,
    rowHeight,
    fontSize: Math.floor(Math.max(8, Math.min(72, (rowWidth - 180) / 12,
      (rowHeight - 16) / (bilingual ? 1.95 : 1.3)))),
  };
}
