import assert from "node:assert/strict";
import { test } from "node:test";
import { loadTypescript } from "./helpers/load-typescript.mjs";

const { fitNomineeBoard, fitNomineeLeaderboard, orderNomineeBoard } = loadTypescript("lib/projection-layout.ts");
const { getElectionRules, rankElectionResults } = loadTypescript("lib/election.ts");
const nominee = (id, name, weight, type = "standard") => ({ nomineeId: id, name, type, totalWeight: weight, rank: 1, selectionStatus: "LEADING" });

test("all nominees have a visible grid position at projection resolutions", () => {
  for (const [width, height] of [[1864, 870], [1320, 575], [1228, 530]]) {
    for (const count of [1, 10, 11, 15, 21, 25, 36]) {
      for (const bilingual of [false, true]) {
        const board = fitNomineeBoard(width, height, count, bilingual);
        assert.ok(board.columns * board.rows >= count);
        assert.ok(board.fontSize >= 8);
        assert.ok(board.columns * 180 <= width || board.columns === 1);
      }
    }
  }
});
test("normal meeting counts retain readable names on a 720p projection", () => {
  for (const count of [10, 11, 15]) {
    assert.ok(fitNomineeBoard(1228, 530, count, false).fontSize >= 22);
  }
});

test("leaderboard adds columns instead of scrolling at projection sizes", () => {
  for (const [width, height] of [[1864, 810], [1320, 560], [1228, 530]]) {
    for (const count of [8, 10, 15, 21, 36]) {
      for (const bilingual of [false, true]) {
        const board = fitNomineeLeaderboard(width, height, count, bilingual);
        assert.ok(board.columns * board.rows >= count);
        assert.ok(board.fontSize >= 8);
        assert.ok(board.columns * 300 <= width || board.columns === 1);
        assert.ok(board.rowHeight >= 46);
      }
    }
    assert.ok(fitNomineeLeaderboard(width, height, 15, false).fontSize >= 22);
  }
});

test("dense elections use enough columns to leave space for text and progress bars", () => {
  const board = fitNomineeLeaderboard(1228, 530, 36, false);
  assert.equal(board.columns, 4);
  assert.ok(board.rowHeight >= 46);
  assert.ok(board.rows * board.rowHeight + (board.rows - 1) * board.gap <= 530);
});

test("small screens preserve readable row height when the board must scroll", () => {
  const board = fitNomineeLeaderboard(374, 580, 36, true);
  assert.equal(board.columns, 1);
  assert.equal(board.rowHeight, 46);
  assert.ok(board.fontSize >= 8);
});

test("leaderboard uses the extra column when it makes nominee names larger", () => {
  const short = fitNomineeLeaderboard(1864, 810, 8, false);
  assert.equal(short.columns, 2);
  assert.ok(short.fontSize >= 60);
  assert.equal(fitNomineeLeaderboard(1228, 530, 15, false).columns, 2);
  assert.ok(fitNomineeLeaderboard(1228, 530, 15, false).fontSize >= 34);
  assert.equal(fitNomineeLeaderboard(1864, 810, 3, false).columns, 1);
});
test("before voting, nominees follow registration rather than name or group order", () => {
  const input = [
    { ...nominee("a", "Alpha", 0, "first"), registrationOrder: 3 },
    { ...nominee("z", "Zeta", 0, "second"), registrationOrder: 1 },
    { ...nominee("b", "Beta", 0, "first"), registrationOrder: 2 },
  ];
  for (const grouped of [false, true]) {
    assert.deepEqual(orderNomineeBoard(input, grouped).map((r) => r.nomineeId), ["z", "b", "a"]);
  }
});
test("standard voting updates the board into weighted rank order", () => {
  const before = [nominee("a", "Alpha", 100), nominee("b", "Beta", 80), nominee("c", "Gamma", 10)];
  const after = [nominee("a", "Alpha", 100), nominee("b", "Beta", 80), nominee("c", "Gamma", 200)];
  assert.deepEqual(orderNomineeBoard(before, false).map((r) => r.nomineeId), ["a", "b", "c"]);
  assert.deepEqual(orderNomineeBoard(after, false).map((r) => r.nomineeId), ["c", "a", "b"]);
});
test("group passers appear first while retaining correct ranks in each group", () => {
  const input = [nominee("a", "A", 100, "first"), nominee("b", "B", 80, "first"), nominee("c", "C", 70, "first"), nominee("d", "D", 30, "second"), nominee("e", "E", 20, "second")];
  const rules = getElectionRules({ firstPassers: 2, secondPassers: 1 });
  const output = orderNomineeBoard(rankElectionResults(input, rules, false), true);
  assert.deepEqual(output.map((r) => r.nomineeId), ["a", "b", "d", "c", "e"]);
  assert.deepEqual(output.map((r) => r.rank), [1, 2, 1, 3, 2]);
  assert.equal(output.filter((r) => r.selectionStatus === "LEADING").length, 3);
  const updated = input.map((r) => r.nomineeId === "e" ? { ...r, totalWeight: 50 } : r);
  const next = orderNomineeBoard(rankElectionResults(updated, rules, false), true);
  assert.deepEqual(next.map((r) => r.nomineeId), ["a", "b", "e", "c", "d"]);
  assert.deepEqual(next.map((r) => r.rank), [1, 2, 1, 3, 2]);
  assert.equal(input[0].nomineeId, "a");
});
test("equal weights retain registration order while displaying tied ranks", () => {
  const input = [{ ...nominee("a", "A", 80), registrationOrder: 2 }, { ...nominee("z", "Z", 80), registrationOrder: 1 }, nominee("c", "C", 20)];
  const output = orderNomineeBoard(rankElectionResults(input, getElectionRules({ winnerCount: 2 }), false), false);
  assert.deepEqual(output.map((r) => r.nomineeId), ["z", "a", "c"]);
  assert.deepEqual(output.map((r) => r.rank), [1, 1, 3]);
});
