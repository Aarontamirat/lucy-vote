module.exports = [
"[project]/.next-internal/server/app/api/public/meetings/[id]/results/route/actions.js [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__, module, exports) => {

}),
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/@prisma/client [external] (@prisma/client, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("@prisma/client", () => require("@prisma/client"));

module.exports = mod;
}),
"[project]/lib/prisma.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "prisma",
    ()=>prisma
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs)");
;
const prisma = global.prisma ?? new __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__["PrismaClient"]({
    log: [
        "error",
        "warn"
    ]
});
if ("TURBOPACK compile-time truthy", 1) global.prisma = prisma;
}),
"[project]/lib/election.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ballotLimitError",
    ()=>ballotLimitError,
    "getElectionRules",
    ()=>getElectionRules,
    "rankElectionResults",
    ()=>rankElectionResults
]);
const positiveInteger = (value)=>typeof value === "number" && Number.isSafeInteger(value) && value > 0;
function getElectionRules(config) {
    if (config.firstPassers != null || config.secondPassers != null) {
        if (!positiveInteger(config.firstPassers) || !positiveInteger(config.secondPassers)) {
            throw new Error("Set a positive whole number of winners for both nominee groups.");
        }
        return {
            mode: "GROUPED",
            winnerCount: config.firstPassers + config.secondPassers,
            sections: [
                {
                    key: "first",
                    label: "Group 1",
                    count: config.firstPassers
                },
                {
                    key: "second",
                    label: "Group 2",
                    count: config.secondPassers
                }
            ]
        };
    }
    if (!positiveInteger(config.winnerCount)) {
        throw new Error("Set the number of winners in Edit Meeting before printing cards or opening voting.");
    }
    return {
        mode: "STANDARD",
        winnerCount: config.winnerCount,
        sections: [
            {
                key: "standard",
                label: "Nominees you vote for",
                count: config.winnerCount
            }
        ]
    };
}
function rankElectionResults(results, rules, closed) {
    const sorted = [
        ...results
    ].sort((a, b)=>b.totalWeight - a.totalWeight || (a.registrationOrder ?? Number.MAX_SAFE_INTEGER) - (b.registrationOrder ?? Number.MAX_SAFE_INTEGER) || a.nomineeId.localeCompare(b.nomineeId));
    const ranked = new Map();
    const sections = rules?.sections ?? [
        {
            key: "standard",
            label: "",
            count: 0
        }
    ];
    for (const section of sections){
        const pool = rules?.mode === "GROUPED" ? sorted.filter((r)=>r.type === section.key) : sorted;
        const cutoff = pool[section.count - 1]?.totalWeight;
        const boundaryTie = cutoff != null && cutoff > 0 && pool[section.count]?.totalWeight === cutoff;
        for(let index = 0; index < pool.length; index++){
            const result = pool[index];
            const rank = index > 0 && pool[index - 1].totalWeight === result.totalWeight ? ranked.get(pool[index - 1].nomineeId).rank : index + 1;
            let selectionStatus = "NOT_SELECTED";
            if (!rules || result.totalWeight <= 0) selectionStatus = "PENDING";
            else if (boundaryTie && result.totalWeight === cutoff) selectionStatus = "TIED";
            else if (index < section.count) selectionStatus = closed ? "WINNER" : "LEADING";
            ranked.set(result.nomineeId, {
                ...result,
                rank,
                selectionStatus
            });
        }
    }
    return sorted.map((r, index)=>ranked.get(r.nomineeId) ?? {
            ...r,
            rank: index + 1,
            selectionStatus: "PENDING"
        });
}
function ballotLimitError(selected, rules) {
    if (selected.length > rules.winnerCount) return `This ballot allows up to ${rules.winnerCount} nominees in total.`;
    if (rules.mode === "GROUPED") {
        if (selected.some((n)=>!rules.sections.some((s)=>s.key === n.type))) {
            return "This ballot allows up to the configured nominees in Group 1 and Group 2 only.";
        }
        for (const section of rules.sections){
            if (selected.filter((n)=>n.type === section.key).length > section.count) {
                return `This ballot allows up to ${section.count} ${section.label} nominees.`;
            }
        }
    }
    return null;
}
}),
"[project]/app/api/public/meetings/[id]/results/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/prisma.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$election$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/election.ts [app-route] (ecmascript)");
;
;
;
async function GET(_req, { params }) {
    try {
        const { id } = await params;
        // Ignore query parameters and never return individual ballot records.
        const meeting = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].meeting.findUnique({
            where: {
                id
            },
            select: {
                title: true,
                status: true,
                winnerCount: true,
                firstPassers: true,
                secondPassers: true
            }
        });
        if (!meeting) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Meeting not found."
        }, {
            status: 404
        });
        const [nominees, totals, attendance, ballots] = await Promise.all([
            __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].nominee.findMany({
                where: {
                    meetingId: id
                },
                select: {
                    id: true,
                    name: true,
                    nameAm: true,
                    type: true
                },
                orderBy: [
                    {
                        createdAt: "asc"
                    },
                    {
                        id: "asc"
                    }
                ]
            }),
            __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].vote.groupBy({
                by: [
                    "nomineeId"
                ],
                where: {
                    meetingId: id
                },
                _sum: {
                    weight: true
                }
            }),
            __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].attendance.aggregate({
                where: {
                    meetingId: id
                },
                _sum: {
                    snapshotShareValue: true
                },
                _count: {
                    _all: true
                }
            }),
            __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].vote.groupBy({
                by: [
                    "voterId"
                ],
                where: {
                    meetingId: id
                }
            })
        ]);
        const weights = new Map(totals.map((item)=>[
                item.nomineeId,
                Number(item._sum.weight ?? 0)
            ]));
        const rows = nominees.map((item, index)=>({
                nomineeId: item.id,
                name: item.name,
                nameAm: item.nameAm,
                type: item.type,
                totalWeight: weights.get(item.id) ?? 0,
                registrationOrder: index + 1
            }));
        let rules = null;
        let configurationError = null;
        try {
            rules = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$election$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getElectionRules"])(meeting);
        } catch (error) {
            configurationError = error instanceof Error ? error.message : "Invalid election rules.";
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            meetingTitle: meeting.title,
            meetingStatus: meeting.status,
            results: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$election$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rankElectionResults"])(rows, rules, meeting.status === "CLOSED"),
            totalSharesAttended: Number(attendance._sum.snapshotShareValue ?? 0),
            attendeesCount: attendance._count._all,
            ballotsCast: ballots.length,
            winnerCount: rules?.winnerCount ?? null,
            configurationError,
            meetingFirstPassers: meeting.firstPassers,
            meetingSecondPassers: meeting.secondPassers,
            votingMode: rules?.mode ?? "STANDARD"
        }, {
            headers: {
                "Cache-Control": "no-store",
                "X-Content-Type-Options": "nosniff"
            }
        });
    } catch (error) {
        console.error("Election projection failed", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Projection is temporarily unavailable."
        }, {
            status: 503
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__a2e42be2._.js.map