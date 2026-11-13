import assert from "node:assert/strict";
import { test } from "node:test";
import { loadTypescript } from "./helpers/load-typescript.mjs";
const { getElectionRules, ballotLimitError, rankElectionResults } =
  loadTypescript("lib/election.ts");

const nominee = (id, weight, type = "standard") => ({
  nomineeId: id,
  name: id,
  type,
  totalWeight: weight,
});

test("grouped cards use the sum of the two winner limits", () => {
  const rules = getElectionRules({ firstPassers: 6, secondPassers: 3 });
  assert.equal(rules.winnerCount, 9);
  assert.deepEqual(
    rules.sections.map((s) => s.count),
    [6, 3],
  );
});
test("standard cards use an explicit winner count", () => {
  const rules = getElectionRules({ winnerCount: 4 });
  assert.equal(rules.mode, "STANDARD");
  assert.equal(rules.sections.length, 1);
  assert.equal(rules.sections[0].count, 4);
});
test("missing, partial, zero, and fractional limits are rejected", () => {
  for (const config of [
    {},
    { winnerCount: 0 },
    { winnerCount: 1.5 },
    { firstPassers: 3 },
    { firstPassers: 0, secondPassers: 2 },
  ]) {
    assert.throws(() => getElectionRules(config));
  }
});
test("standard elections limit choices regardless of nominee type", () => {
  const rules = getElectionRules({ winnerCount: 2 });
  assert.equal(
    ballotLimitError([{ type: "first" }, { type: "second" }], rules),
    null,
  );
  assert.match(
    ballotLimitError(
      [{ type: "first" }, { type: "second" }, { type: "standard" }],
      rules,
    ),
    /up to 2/,
  );
});
test("grouped elections enforce each group's seats and reject unassigned nominees", () => {
  const rules = getElectionRules({ firstPassers: 2, secondPassers: 1 });
  assert.equal(
    ballotLimitError(
      [{ type: "first" }, { type: "first" }, { type: "second" }],
      rules,
    ),
    null,
  );
  assert.match(
    ballotLimitError([{ type: "second" }, { type: "second" }], rules),
    /Group 2/,
  );
  assert.ok(ballotLimitError([{ type: "standard" }], rules));
});
test("standard winners are the top configured number and remain provisional until closing", () => {
  const results = [nominee("a", 100), nominee("b", 60), nominee("c", 80)];
  const rules = getElectionRules({ winnerCount: 2 });
  assert.deepEqual(
    rankElectionResults(results, rules, false).map((r) => r.selectionStatus),
    ["LEADING", "LEADING", "NOT_SELECTED"],
  );
  assert.deepEqual(
    rankElectionResults(results, rules, true)
      .filter((r) => r.selectionStatus === "WINNER")
      .map((r) => r.nomineeId),
    ["a", "c"],
  );
  assert.equal(results[1].nomineeId, "b", "Input order must be preserved");
});
test("each group fills its own seats even when its weights are lower", () => {
  const results = [
    nominee("a", 100, "first"),
    nominee("b", 90, "first"),
    nominee("c", 80, "first"),
    nominee("d", 10, "second"),
    nominee("e", 5, "second"),
  ];
  const winners = rankElectionResults(
    results,
    getElectionRules({ firstPassers: 2, secondPassers: 1 }),
    true,
  ).filter((r) => r.selectionStatus === "WINNER");
  assert.deepEqual(
    winners.map((r) => r.nomineeId),
    ["a", "b", "d"],
  );
  assert.equal(winners[2].rank, 1);
});
test("ties crossing the cutoff never produce arbitrary winners", () => {
  const results = [
    nominee("a", 100),
    nominee("b", 80),
    nominee("c", 80),
    nominee("d", 20),
  ];
  const ranked = rankElectionResults(
    results,
    getElectionRules({ winnerCount: 2 }),
    true,
  );
  assert.deepEqual(
    ranked.map((r) => r.selectionStatus),
    ["WINNER", "TIED", "TIED", "NOT_SELECTED"],
  );
  assert.deepEqual(
    ranked.map((r) => r.rank),
    [1, 2, 2, 4],
  );
});
test("ties entirely inside the winner slots still fill the configured seats", () => {
  const ranked = rankElectionResults(
    [nominee("a", 80), nominee("b", 80), nominee("c", 20)],
    getElectionRules({ winnerCount: 2 }),
    true,
  );
  assert.equal(ranked.filter((r) => r.selectionStatus === "WINNER").length, 2);
});
test("zero votes and missing configuration do not announce winners", () => {
  const rules = getElectionRules({ winnerCount: 2 });
  assert.ok(
    rankElectionResults([nominee("a", 0), nominee("b", 0)], rules, true).every(
      (r) => r.selectionStatus === "PENDING",
    ),
  );
  assert.equal(
    rankElectionResults([nominee("a", 100)], null, true)[0].selectionStatus,
    "PENDING",
  );
});
