import assert from "node:assert/strict";
import { test } from "node:test";
import { loadAuthenticatedRoute, loadTypescript } from "./helpers/load-typescript.mjs";

const context = { params: Promise.resolve({ id: "meeting" }) };
const request = (voterId, nomineeIds) => new Request("http://localhost/api", {
  method: "POST", headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ voterId, nomineeIds, reason: "Correct the original shareholder card" }),
});

function database() {
  const meeting = { id: "meeting", status: "VOTINGOPEN", winnerCount: 1, firstPassers: null, secondPassers: null };
  const rows = [
    { shareholderId: "a", snapshotName: "Holder A", snapshotShareValue: 120.25, representedById: "rep" },
    { shareholderId: "b", snapshotName: "Holder B", snapshotShareValue: 70.5, representedById: "rep" },
    { shareholderId: "own", snapshotName: "Own holder", snapshotShareValue: 50, representedById: null },
  ];
  const rep = { id: "rep", name: "Own holder", shareholderId: "own" };
  const votes = [];
  const matches = (v, where) => v.meetingId === where.meetingId &&
    (typeof where.voterId === "string" ? v.voterId === where.voterId : where.voterId.in.includes(v.voterId)) &&
    (!where.nomineeId || where.nomineeId.in.includes(v.nomineeId));
  const db = {
    meeting: { findUnique: async () => meeting },
    representative: { findMany: async ({ where }) => where.OR.some((entry) =>
      entry.id?.in.includes(rep.id) || entry.shareholderId?.in.includes(rep.shareholderId) ||
      rows.some((row) => row.representedById === rep.id && entry.representedBy?.some &&
        (!entry.representedBy.some.shareholderId || entry.representedBy.some.shareholderId.in.includes(row.shareholderId))),
    ) ? [rep] : [] },
    attendance: { findMany: async ({ where }) => rows.filter((row) =>
      typeof where.shareholderId === "string" ? row.shareholderId === where.shareholderId : where.shareholderId.in.includes(row.shareholderId)) },
    nominee: { findMany: async ({ where }) => where.id.in.map((id) => ({ id, type: "standard" })) },
    vote: {
      findMany: async ({ where }) => votes.filter((v) => matches(v, where)),
      create: async ({ data }) => { const vote = { ...data, nominee: { type: "standard" } }; votes.push(vote); return vote; },
      deleteMany: async ({ where }) => { const before = votes.length; for (let i = votes.length - 1; i >= 0; i--) if (matches(votes[i], where)) votes.splice(i, 1); return { count: before - votes.length }; },
    },
    $transaction: async (run) => run(db),
  };
  return { db, votes, rows, rep };
}

test("representation never aliases shareholder IDs and attendance lookup includes represented holdings", async () => {
  const identity = await loadTypescript("lib/voter-identity.ts").voterIdentity({}, "meeting", "a");
  assert.deepEqual(identity, { voterId: "a", aliases: ["a"] });
  let query;
  await loadTypescript("lib/voter-attendance.ts").voterAttendance({ attendance: { findMany: async (input) => { query = input; return []; } } }, "meeting", identity);
  assert.deepEqual(query.where, { meetingId: "meeting", shareholderId: "a" });
});

test("each represented shareholder and representative's own card records different choices with its own snapshots", async () => {
  const fixture = database();
  const route = loadAuthenticatedRoute("app/api/meetings/[id]/votes/route.ts", fixture.db);
  for (const [id, choice] of [["a", "n1"], ["b", "n2"], ["own", "n3"]]) {
    assert.equal((await route.POST(request(id, [choice]), context)).status, 200);
  }
  assert.deepEqual(fixture.votes.map((v) => [v.voterId, v.nomineeId, v.weight, v.snapshotVoterName]),
    [["a", "n1", 120.25, "Holder A"], ["b", "n2", 70.5, "Holder B"], ["own", "n3", 50, "Own holder"]]);
  assert.equal((await route.POST(request("a", ["n2"]), context)).status, 400);
  assert.equal((await route.POST(request("a", ["n1"]), context)).status, 200);
  assert.equal(fixture.votes.length, 3);
  const res = await route.GET(new Request("http://localhost/api?voterId=b"), context);
  assert.deepEqual((await res.json()).voted, ["n2"]);
  await route.DELETE(request("a", ["n1"]), context);
  assert.deepEqual(fixture.votes.map((v) => v.voterId), ["b", "own"]);
});

test("representative identities and absent own shareholders cannot borrow represented attendance", async () => {
  const fixture = database();
  fixture.rows.pop();
  const route = loadAuthenticatedRoute("app/api/meetings/[id]/votes/route.ts", fixture.db);
  for (const id of ["rep", "own", "external"]) assert.equal((await route.POST(request(id, ["n1"]), context)).status, 403);
  assert.equal((await route.POST(request("b", ["n2"]), context)).status, 200);
  assert.equal(fixture.votes[0].weight, 70.5);
});

test("case-insensitive card lookup persists the canonical shareholder ID for accurate representation reports", async () => {
  const fixture = database();
  const find = fixture.db.attendance.findMany;
  fixture.db.attendance.findMany = async (query) => find({ ...query, where: { ...query.where,
    shareholderId: typeof query.where.shareholderId === "string" ? query.where.shareholderId.toLowerCase() : query.where.shareholderId } });
  const route = loadAuthenticatedRoute("app/api/meetings/[id]/votes/route.ts", fixture.db);
  assert.equal((await route.POST(request(" A ", ["n1"]), context)).status, 200);
  assert.equal(fixture.votes[0].voterId, "a");
  assert.equal(fixture.votes[0].weight, 120.25);
});

for (const legacyId of ["rep", "own"]) test(`old combined ${legacyId} ballot blocks new cards until explicitly reversed without aliasing`, async () => {
  const fixture = database();
  fixture.votes.push({ meetingId: "meeting", voterId: legacyId, nomineeId: "n1", weight: 240.75, snapshotVoterName: "Own holder" });
  const route = loadAuthenticatedRoute("app/api/meetings/[id]/votes/route.ts", fixture.db);
  assert.equal((await route.POST(request("a", ["n2"]), context)).status, 409);
  const lookup = await route.GET(new Request("http://localhost/api?voterId=b"), context);
  const data = await lookup.json();
  assert.equal(data.correctionRequired, true);
  assert.equal(data.legacyBallots[0].voterId, legacyId);
  assert.deepEqual(data.voted, []);
  assert.equal((await route.DELETE(request("b", ["n1"]), context)).status, 200);
  assert.equal(fixture.votes.length, 1);
  await route.DELETE(request(legacyId, ["n1"]), context);
  assert.equal((await route.POST(request("a", ["n2"]), context)).status, 200);
  assert.equal(fixture.votes[0].weight, 120.25);
});

test("both closure endpoints reject unresolved combined records before finalizing the meeting", async () => {
  for (const [path, method] of [["app/api/meetings/[id]/close/route.ts", "POST"], ["app/api/meetings/[id]/votes/close/route.ts", "PATCH"]]) {
    const fixture = database();
    fixture.db.shareholder = { aggregate: async () => ({ _sum: { shareValue: 240.75 } }) };
    fixture.votes.push({ meetingId: "meeting", voterId: "rep", nomineeId: "n1", weight: 240.75 });
    const response = await loadAuthenticatedRoute(path, fixture.db)[method](request("rep", ["n1"]), context);
    assert.equal(response.status, 409);
    assert.match((await response.json()).error, /older combined/);
    assert.equal(fixture.votes.length, 1);
  }
});
