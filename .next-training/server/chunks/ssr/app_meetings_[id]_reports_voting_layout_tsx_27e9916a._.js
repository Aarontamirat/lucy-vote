module.exports = [
"[project]/app/meetings/[id]/reports/voting/layout.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Layout
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$page$2d$access$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/page-access.ts [app-rsc] (ecmascript)");
;
async function Layout({ children, params }) {
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$page$2d$access$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["requirePageAccess"])("reports.voting", (await params).id);
    return children;
}
}),
];

//# sourceMappingURL=app_meetings_%5Bid%5D_reports_voting_layout_tsx_27e9916a._.js.map