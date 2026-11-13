import assert from "node:assert/strict";
import { test } from "node:test";
import { loadAuthenticatedRoute as loadRoute } from "./helpers/load-typescript.mjs";
const context = { params: Promise.resolve({ id: "meeting-1" }) };
const request = (body) =>
  new Request("http://localhost/api/meetings/meeting-1/votes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, reason: "Correcting a ballot encoding error" }),
  });

test("nominee lookup exposes grouped ballot limits before a voter is entered and preserves registration order", async () => {
  let nomineeQuery;
  const items = [
    { id: "second-1", name: "Second group nominee", type: "second" },
    { id: "first-1", name: "First group nominee", type: "first" },
  ];
  const prisma = {
    meeting: { findUnique: async () => ({
      title: "Grouped election", status: "VOTINGOPEN",
      firstPassers: 2, secondPassers: 1, winnerCount: null,
    }) },
    nominee: { findMany: async (query) => { nomineeQuery = query; return items; } },
    shareholder: { findMany: async () => [] },
  };
  const response = await loadRoute("app/api/meetings/[id]/nominees/route.ts", prisma)
    .GET(new Request("http://localhost"), context);
  const data = await response.json();
  assert.equal(response.status, 200);
  assert.deepEqual(data.items, items);
  assert.deepEqual(nomineeQuery.orderBy, [{ createdAt: "asc" }, { id: "asc" }]);
  assert.equal(data.electionRules.mode, "GROUPED");
  assert.equal(data.electionRules.winnerCount, 3);
  assert.deepEqual(data.electionRules.sections, [
    { key: "first", label: "Group 1", count: 2 },
    { key: "second", label: "Group 2", count: 1 },
  ]);
  assert.equal(data.electionRulesError, null);
});

test("nominees remain manageable while an older meeting's ballot limits need configuration", async () => {
  const prisma = {
    meeting: { findUnique: async () => ({
      title: "Older meeting", status: "DRAFT",
      firstPassers: null, secondPassers: null, winnerCount: null,
    }) },
    nominee: { findMany: async () => [] },
    shareholder: { findMany: async () => [] },
  };
  const response = await loadRoute("app/api/meetings/[id]/nominees/route.ts", prisma)
    .GET(new Request("http://localhost"), context);
  const data = await response.json();
  assert.equal(response.status, 200);
  assert.equal(data.electionRules, null);
  assert.match(data.electionRulesError, /number of winners/);
  assert.deepEqual(data.electionConfig, {
    firstPassers: null, secondPassers: null, winnerCount: null,
  });
});

test("attendance report preserves meeting snapshots and returns complete quorum totals", async () => {
  const prisma = {
    meeting: { findUnique: async () => ({ title: "Snapshot election", status: "OPEN", snapshotTotalShares: 1000, snapshotTotalHolders: 10, quorumPct: 50 }) },
    attendance: { findMany: async () => [{ id: "attendance-1", shareholderId: "holder", snapshotName: "Original name", snapshotNameAm: null, snapshotShareValue: 600, shareholder: { name: "Changed name", shareValue: 9000 }, representedById: null, representativeName: "Delegate", createdAt: new Date("2026-11-10T09:00:00Z") }] },
    shareholder: { aggregate: () => { throw new Error("A report must not use current registry values."); } },
  };
  const response = await loadRoute("app/api/meetings/[id]/reports/attendance/route.ts", prisma).GET(new Request("http://localhost"), context);
  const data = await response.json();
  assert.equal(response.status, 200);
  assert.equal(data.meetingTitle, "Snapshot election");
  assert.equal(data.totalShares, 1000);
  assert.equal(data.totalShareholdersCount, 10);
  assert.equal(data.attendeesCount, 1);
  assert.equal(data.attendedShares, 600);
  assert.equal(data.required, 500);
  assert.equal(data.quorumMet, true);
  assert.equal(data.attendance[0].shareholderName, "Original name");
  assert.equal(data.attendance[0].shareValue, "600");
  assert.equal(data.attendance[0].representedByName, "Delegate");
});

test("card API returns all shareholders in one batch with no attendance dependency", async () => {
  let query;
  const prisma = {
    meeting: {
      findUnique: async () => ({
        id: "meeting-1",
        title: "Election",
        date: new Date(),
        winnerCount: 3,
      }),
    },
    shareholder: {
      findMany: async (args) => {
        query = args;
        return [
          {
            id: "absent",
            name: "Absent shareholder",
            nameAm: null,
            shareValue: 10,
          },
          { id: "present", name: "Attendee", nameAm: null, shareValue: 20 },
        ];
      },
    },
    attendance: {
      findMany: () => {
        throw new Error("Cards must not query attendance");
      },
    },
  };
  const res = await loadRoute(
    "app/api/meetings/[id]/voting-cards/route.ts",
    prisma,
  ).GET(new Request("http://localhost"), context);
  const data = await res.json();
  assert.equal(res.status, 200);
  assert.equal(data.shareholders.length, 2);
  assert.equal(data.shareholders[0].id, "absent");
  assert.equal(data.shareholders[0].shareValue, "10");
  assert.equal(data.votingRules.winnerCount, 3);
  assert.equal(
    query.take,
    undefined,
    "No pagination limit may omit shareholder cards",
  );
  assert.equal(res.headers.get("Cache-Control"), "no-store");
});
test("card API gives a setup error when standard winner count is unknown", async () => {
  const prisma = {
    meeting: { findUnique: async () => ({ winnerCount: null }) },
  };
  const res = await loadRoute(
    "app/api/meetings/[id]/voting-cards/route.ts",
    prisma,
  ).GET(new Request("http://localhost"), context);
  assert.equal(res.status, 400);
  assert.match((await res.json()).error, /number of winners/);
});
test("standard meeting creation requires and saves the winner count", async () => {
  let saved;
  const prisma = {
    meeting: {
      create: async ({ data }) => {
        saved = data;
        return data;
      },
    },
  };
  const route = loadRoute("app/api/meetings/route.ts", prisma);
  const base = {
    title: "Election",
    date: "2026-10-28T09:00:00Z",
    location: "Hall",
    quorum: 50,
  };
  assert.equal((await route.POST(request(base))).status, 400);
  assert.equal(
    (await route.POST(request({ ...base, winnerCount: 4 }))).status,
    201,
  );
  assert.equal(saved.winnerCount, 4);
});
test("partial meeting edits preserve existing settings and cannot change lifecycle status", async () => {
  let saved;
  const prisma = {
    meeting: {
      findUnique: async () => ({
        id: "meeting-1",
        status: "OPEN",
        winnerCount: 3,
        firstPassers: null,
        secondPassers: null,
      }),
      update: async ({ data }) => {
        saved = data;
        return data;
      },
    },
  };
  const res = await loadRoute("app/api/meetings/[id]/route.ts", prisma).PUT(
    request({ title: "Updated", status: "VOTINGOPEN" }),
    context,
  );
  assert.equal(res.status, 200);
  assert.equal(saved.title, "Updated");
  assert.equal(saved.quorumPct, undefined);
  assert.equal(saved.status, undefined);
  assert.equal(saved.winnerCount, 3);
});

function votingDatabase({
  status = "VOTINGOPEN",
  winnerCount = 2,
  firstPassers = null,
  secondPassers = null,
  existing = [],
  attended = true,
} = {}) {
  let writes = 0;
  let locks = 0;
  const meeting = {
    id: "meeting-1",
    status,
    winnerCount,
    firstPassers,
    secondPassers,
  };
  const nominees = [
    { id: "a", type: firstPassers ? "first" : "standard" },
    { id: "b", type: firstPassers ? "second" : "standard" },
    { id: "c", type: firstPassers ? "second" : "standard" },
  ];
  const prisma = {
    meeting: { findUnique: async () => meeting },
    nominee: {
      findMany: async ({ where }) =>
        nominees.filter((n) => where.id.in.includes(n.id)),
    },
    representative: { findUnique: async () => null, findFirst: async () => null, findMany: async () => [] },
    shareholder: { findUnique: async () => ({ id: "voter", shareValue: 100 }) },
    attendance: {
      findMany: async () =>
        attended ? [{ snapshotName: "Voter", snapshotShareValue: 100 }] : [],
    },
    $transaction: async (run) =>
      run({
        $queryRaw: async () => {
          locks++;
          return [{ id: "meeting-1" }];
        },
        meeting: { findUnique: async () => meeting },
        representative: { findMany: async () => [] },
        attendance: { findMany: async () => attended ? [{ snapshotName: "Voter", snapshotShareValue: 100 }] : [] },
        vote: {
          findMany: async () => existing,
          create: async ({ data }) => {
            writes++;
            return data;
          },
        },
      }),
  };
  return { prisma, writes: () => writes, locks: () => locks };
}
test("API enforces standard total choices across earlier submissions", async () => {
  const db = votingDatabase({
    existing: [{ nomineeId: "a", nominee: { type: "standard" } }],
  });
  const res = await loadRoute(
    "app/api/meetings/[id]/votes/route.ts",
    db.prisma,
  ).POST(request({ voterId: "voter", nomineeIds: ["b", "c"] }), context);
  assert.equal(res.status, 400);
  assert.match((await res.json()).error, /up to 2/);
  assert.equal(db.writes(), 0);
  assert.equal(db.locks(), 1);
});
test("API accepts a standard ballot within its seat limit", async () => {
  const db = votingDatabase();
  const res = await loadRoute(
    "app/api/meetings/[id]/votes/route.ts",
    db.prisma,
  ).POST(request({ voterId: "voter", nomineeIds: ["a", "b"] }), context);
  assert.equal(res.status, 200);
  assert.equal(db.writes(), 2);
});
test("API enforces group limits even when the total choices would fit", async () => {
  const db = votingDatabase({ firstPassers: 2, secondPassers: 1 });
  const res = await loadRoute(
    "app/api/meetings/[id]/votes/route.ts",
    db.prisma,
  ).POST(request({ voterId: "voter", nomineeIds: ["b", "c"] }), context);
  assert.equal(res.status, 400);
  assert.match((await res.json()).error, /Group 2/);
  assert.equal(db.writes(), 0);
});
test("printing a card does not make an absent shareholder eligible to vote", async () => {
  const db = votingDatabase({ attended: false });
  const res = await loadRoute(
    "app/api/meetings/[id]/votes/route.ts",
    db.prisma,
  ).POST(request({ voterId: "voter", nomineeIds: ["a"] }), context);
  assert.equal(res.status, 403);
  assert.equal(db.writes(), 0);
});
test("meeting OPEN status alone does not accept votes", async () => {
  const db = votingDatabase({ status: "OPEN" });
  const res = await loadRoute(
    "app/api/meetings/[id]/votes/route.ts",
    db.prisma,
  ).POST(request({ voterId: "voter", nomineeIds: ["a"] }), context);
  assert.equal(res.status, 400);
  assert.equal(db.writes(), 0);
});

test("live results carry chronological registration order through vote ranking", async () => {
  let weights = [];
  const prisma = {
    meeting: { findUnique: async () => ({ status: "VOTINGOPEN", winnerCount: 1 }) },
    nominee: { findMany: async (query) => {
      assert.deepEqual(query.orderBy, [{ createdAt: "asc" }, { id: "asc" }]);
      return [{ id: "z", name: "First registered", type: "standard" }, { id: "a", name: "Second registered", type: "standard" }];
    } },
    vote: { groupBy: async (query) => query.by[0] === "nomineeId" ? weights : [] },
    attendance: { aggregate: async () => ({ _sum: { snapshotShareValue: 100 }, _count: { _all: 1 } }) },
  };
  const route = loadRoute("app/api/meetings/[id]/votes/route.ts", prisma);
  const response = await route.GET(new Request("http://localhost/api/meetings/meeting-1/votes"), context);
  const before = await response.json();
  assert.deepEqual(before.results.map((r) => [r.nomineeId, r.registrationOrder]), [["z", 1], ["a", 2]]);
  weights = [{ nomineeId: "a", _sum: { weight: 80 } }, { nomineeId: "z", _sum: { weight: 20 } }];
  const voted = await (await route.GET(new Request("http://localhost/api/meetings/meeting-1/votes"), context)).json();
  assert.deepEqual(voted.results.map((r) => [r.nomineeId, r.registrationOrder, r.rank]), [["a", 2, 1], ["z", 1, 2]]);
});

function correctionDatabase({ status = "VOTINGOPEN", missing = false } = {}) {
  const meeting = { id: "meeting-1", status, winnerCount: 1 };
  let votes = [
    { meetingId: "meeting-1", voterId: "voter", nomineeId: "a", weight: 100 },
    { meetingId: "meeting-1", voterId: "other-voter", nomineeId: "a", weight: 40 },
    { meetingId: "other-meeting", voterId: "voter", nomineeId: "a", weight: 200 },
  ];
  const matches = (vote, where) => vote.meetingId === where.meetingId &&
    (!where.voterId || (typeof where.voterId === "string" ? vote.voterId === where.voterId : where.voterId.in.includes(vote.voterId))) &&
    (!where.nomineeId || where.nomineeId.in.includes(vote.nomineeId));
  const events = [];
  const prisma = {
    meeting: { findUnique: async () => missing ? null : meeting },
    nominee: { findMany: async ({ where }) => [
      { id: "a", name: "Original nominee", type: "standard" },
      { id: "b", name: "Correct nominee", type: "standard" },
    ].filter((n) => !where.id || where.id.in.includes(n.id)) },
    representative: { findUnique: async () => null, findFirst: async () => null, findMany: async () => [] },
    shareholder: { findUnique: async () => ({ id: "voter", shareValue: 100 }) },
    attendance: {
      findFirst: async () => ({ snapshotName: "Voter", snapshotShareValue: 100 }),
      findMany: async () => [{ snapshotName: "Voter", snapshotShareValue: 100 }],
      aggregate: async () => ({ _sum: { snapshotShareValue: 140 }, _count: { _all: 2 } }),
    },
    vote: {
      findMany: async ({ where }) => votes.filter((vote) => matches(vote, where)),
      deleteMany: async ({ where }) => {
        events.push("delete");
        const count = votes.filter((vote) => matches(vote, where)).length;
        votes = votes.filter((vote) => !matches(vote, where));
        return { count };
      },
      create: async ({ data }) => {
        votes.push(data);
        return data;
      },
      groupBy: async ({ by, where }) => {
        const grouped = new Map();
        for (const vote of votes.filter((vote) => matches(vote, where))) {
          const key = vote[by[0]];
          grouped.set(key, (grouped.get(key) || 0) + vote.weight);
        }
        return [...grouped].map(([key, weight]) => ({ [by[0]]: key, _sum: { weight } }));
      },
    },
    $queryRaw: async () => { events.push("lock"); return [{ id: meeting.id }]; },
    $transaction: async (run) => run(prisma),
  };
  return { prisma, meeting, events, votes: () => votes };
}

test("reversing a recorded choice updates totals, frees the slot and allows a corrected vote", async () => {
  const db = correctionDatabase();
  const route = loadRoute("app/api/meetings/[id]/votes/route.ts", db.prisma);
  const body = { voterId: "voter", nomineeIds: ["a"] };
  const response = await route.DELETE(request(body), context);
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.reversedCount, 1);
  assert.deepEqual(result.voted, []);
  assert.deepEqual(db.events, ["lock", "delete"]);
  assert.equal(db.votes().length, 2);
  assert.ok(db.votes().some((v) => v.voterId === "other-voter"));
  assert.ok(db.votes().some((v) => v.meetingId === "other-meeting"));

  const totals = await (await route.GET(new Request("http://localhost/api/meetings/meeting-1/votes"), context)).json();
  assert.equal(totals.results.find((r) => r.nomineeId === "a").totalWeight, 40);
  assert.equal(totals.ballotsCast, 1);
  const corrected = await route.POST(request({ voterId: "voter", nomineeIds: ["b"] }), context);
  assert.equal(corrected.status, 200);
  assert.ok(db.votes().some((v) => v.voterId === "voter" && v.nomineeId === "b"));
});

test("reversal retries are harmless and representative IDs can also reverse choices", async () => {
  const db = correctionDatabase();
  const route = loadRoute("app/api/meetings/[id]/votes/route.ts", db.prisma);
  const representativeContext = { params: Promise.resolve({ id: "other-meeting" }) };
  db.votes()[2].voterId = "representative-1";
  const body = { voterId: "representative-1", nomineeIds: ["a"] };
  const first = await route.DELETE(request(body), representativeContext);
  assert.equal((await first.json()).reversedCount, 1);
  const retry = await route.DELETE(request(body), representativeContext);
  assert.equal((await retry.json()).reversedCount, 0);
  assert.equal(db.votes().length, 2);
});

test("reversal rejects non-voting meetings and missing meetings before deleting anything", async () => {
  for (const status of ["DRAFT", "OPEN", "CLOSED"]) {
    const db = correctionDatabase({ status });
    const route = loadRoute("app/api/meetings/[id]/votes/route.ts", db.prisma);
    const res = await route.DELETE(request({ voterId: "voter", nomineeIds: ["a"] }), context);
    assert.equal(res.status, 400);
    assert.equal(db.votes().length, 3);
    assert.deepEqual(db.events, ["lock"]);
  }
  const db = correctionDatabase({ missing: true });
  const res = await loadRoute("app/api/meetings/[id]/votes/route.ts", db.prisma)
    .DELETE(request({ voterId: "voter", nomineeIds: ["a"] }), context);
  assert.equal(res.status, 404);
  assert.equal(db.votes().length, 3);
});

test("reversal rejects incomplete, duplicate and malformed requests", async () => {
  const db = correctionDatabase();
  const route = loadRoute("app/api/meetings/[id]/votes/route.ts", db.prisma);
  for (const body of [{}, { voterId: "", nomineeIds: ["a"] }, { voterId: "voter", nomineeIds: [] }, { voterId: "voter", nomineeIds: ["a", "a"] }]) {
    assert.equal((await route.DELETE(request(body), context)).status, 400);
  }
  const malformed = new Request("http://localhost", { method: "DELETE", body: "{" });
  assert.equal((await route.DELETE(malformed, context)).status, 400);
  assert.equal(db.votes().length, 3);
  assert.deepEqual(db.events, []);
});

test("both close endpoints acquire the ballot lock before closing voting", async () => {
  for (const [path, method] of [
    ["app/api/meetings/[id]/close/route.ts", "POST"],
    ["app/api/meetings/[id]/votes/close/route.ts", "PATCH"],
  ]) {
    const events = [];
    const prisma = {
      $queryRaw: async () => { events.push("lock"); return []; },
      meeting: {
        findUnique: async () => { events.push("read"); return { status: "VOTINGOPEN", quorumPct: 0 }; },
        update: async ({ data }) => { events.push("close"); return data; },
      },
      shareholder: { aggregate: async () => ({ _sum: { shareValue: 100 } }) },
      representative: { findMany: async () => [] },
      $transaction: async (run) => run(prisma),
    };
    const res = await loadRoute(path, prisma)[method](request({}), context);
    assert.equal(res.status, 200);
    assert.deepEqual(events, ["lock", "read", "close"]);
  }
});
