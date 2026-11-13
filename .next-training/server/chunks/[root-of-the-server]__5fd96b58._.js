module.exports = [
"[project]/.next-internal/server/app/api/meetings/[id]/reports/attendance/route/actions.js [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__, module, exports) => {

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
"[externals]/node:crypto [external] (node:crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:crypto", () => require("node:crypto"));

module.exports = mod;
}),
"[project]/lib/permissions.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PERMISSIONS",
    ()=>PERMISSIONS,
    "PERMISSION_KEYS",
    ()=>PERMISSION_KEYS,
    "RESERVED_PERMISSIONS",
    ()=>RESERVED_PERMISSIONS,
    "SUPER_ADMIN_ROLE_ID",
    ()=>SUPER_ADMIN_ROLE_ID,
    "effectivePermissions",
    ()=>effectivePermissions,
    "isPermission",
    ()=>isPermission,
    "isReservedPermission",
    ()=>isReservedPermission
]);
const SUPER_ADMIN_ROLE_ID = "super-admin";
const PERMISSIONS = [
    {
        key: "shareholders.view",
        label: "View shareholder registry",
        group: "Registry"
    },
    {
        key: "shareholders.lookup",
        label: "Look up shareholder IDs, names, and shares for a meeting",
        group: "Registry"
    },
    {
        key: "shareholders.create",
        label: "Add shareholders",
        group: "Registry"
    },
    {
        key: "shareholders.edit",
        label: "Edit shareholders and share values",
        group: "Registry"
    },
    {
        key: "shareholders.import",
        label: "Import shareholders from Excel",
        group: "Registry"
    },
    {
        key: "shareholders.delete",
        label: "Delete a shareholder",
        group: "Registry"
    },
    {
        key: "shareholders.deleteAll",
        label: "Delete the entire shareholder registry",
        group: "Registry"
    },
    {
        key: "meetings.view",
        label: "View meetings",
        group: "Meetings"
    },
    {
        key: "meetings.create",
        label: "Create meetings",
        group: "Meetings"
    },
    {
        key: "meetings.edit",
        label: "Edit meeting configuration",
        group: "Meetings"
    },
    {
        key: "meetings.delete",
        label: "Delete draft meetings",
        group: "Meetings"
    },
    {
        key: "meetings.open",
        label: "Open attendance",
        group: "Meetings"
    },
    {
        key: "meetings.openVoting",
        label: "Open voting",
        group: "Meetings"
    },
    {
        key: "meetings.close",
        label: "Close meetings / voting",
        group: "Meetings"
    },
    {
        key: "nominees.view",
        label: "View nominees",
        group: "Nominees"
    },
    {
        key: "nominees.manage",
        label: "Add, edit, and remove nominees",
        group: "Nominees"
    },
    {
        key: "attendance.view",
        label: "View attendance records",
        group: "Attendance"
    },
    {
        key: "attendance.register",
        label: "Register attendance and representatives",
        group: "Attendance"
    },
    {
        key: "attendance.remove",
        label: "Remove attendance",
        group: "Attendance"
    },
    {
        key: "votes.lookup",
        label: "Look up a voter's eligibility and recorded choices",
        group: "Voting"
    },
    {
        key: "votes.record",
        label: "Record ballots",
        group: "Voting"
    },
    {
        key: "votes.reverse",
        label: "Reverse recorded votes",
        group: "Voting"
    },
    {
        key: "cards.print",
        label: "View and print voting cards",
        group: "Voting"
    },
    {
        key: "results.view",
        label: "View aggregate election results",
        group: "Reports"
    },
    {
        key: "reports.attendance",
        label: "View / export attendance reports",
        group: "Reports"
    },
    {
        key: "reports.voting",
        label: "View / export voting reports",
        group: "Reports"
    },
    {
        key: "projection.view",
        label: "View live projection screens",
        group: "Reports"
    },
    {
        key: "audit.view",
        label: "View audit history",
        group: "Security"
    }
];
const RESERVED_PERMISSIONS = [
    "shareholders.delete",
    "shareholders.deleteAll",
    "meetings.delete",
    "attendance.remove",
    "votes.reverse"
];
const isReservedPermission = (permission)=>RESERVED_PERMISSIONS.includes(permission);
const PERMISSION_KEYS = PERMISSIONS.map((item)=>item.key);
const isPermission = (value)=>PERMISSION_KEYS.includes(value);
function effectivePermissions(user) {
    if (user.roleId === SUPER_ADMIN_ROLE_ID) return [
        ...PERMISSION_KEYS
    ];
    const allowed = new Set(user.role.permissions.map((entry)=>entry.permission).filter(isPermission));
    for (const entry of user.overrides){
        if (!isPermission(entry.permission)) continue;
        if (entry.effect === "DENY") allowed.delete(entry.permission);
        else if (entry.effect === "GRANT") allowed.add(entry.permission);
    }
    return [
        ...allowed
    ].filter((permission)=>!isReservedPermission(permission));
}
}),
"[project]/lib/auth.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SESSION_COOKIE",
    ()=>SESSION_COOKIE,
    "SESSION_DURATION_MS",
    ()=>SESSION_DURATION_MS,
    "SESSION_IDLE_MS",
    ()=>SESSION_IDLE_MS,
    "can",
    ()=>can,
    "canAccessMeeting",
    ()=>canAccessMeeting,
    "checkOrigin",
    ()=>checkOrigin,
    "clearSessionCookie",
    ()=>clearSessionCookie,
    "createSession",
    ()=>createSession,
    "currentUser",
    ()=>currentUser,
    "publicUser",
    ()=>publicUser,
    "setSessionCookie",
    ()=>setSessionCookie,
    "tokenHash",
    ()=>tokenHash
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/headers.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/prisma.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$permissions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/permissions.ts [app-route] (ecmascript)");
;
;
;
;
;
const SESSION_COOKIE = ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : "voting-session";
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000;
const SESSION_IDLE_MS = 30 * 60 * 1000;
const tokenHash = (token)=>(0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHash"])("sha256").update(token).digest("hex");
function requestToken(req) {
    const matches = (req.headers.get("cookie") ?? "").split(";").map((item)=>item.trim()).filter((item)=>item.startsWith(`${SESSION_COOKIE}=`));
    // Ambiguous cookie values fail closed.
    return matches.length === 1 ? matches[0].slice(SESSION_COOKIE.length + 1) : null;
}
async function currentUser(req, touch = true) {
    const token = req ? requestToken(req) : (await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])()).get(SESSION_COOKIE)?.value;
    if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
    const session = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].session.findUnique({
        where: {
            tokenHash: tokenHash(token)
        },
        include: {
            user: {
                include: {
                    role: {
                        include: {
                            permissions: true
                        }
                    },
                    overrides: true,
                    meetingAssignments: true
                }
            }
        }
    });
    const now = Date.now();
    if (!session || !session.user.active || session.expiresAt.getTime() <= now || session.lastSeenAt.getTime() + SESSION_IDLE_MS <= now) return null;
    // Refresh activity without extending the absolute session expiry.
    if (touch && now - session.lastSeenAt.getTime() >= 60_000) {
        const touched = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].session.updateMany({
            where: {
                id: session.id,
                expiresAt: {
                    gt: new Date(now)
                },
                lastSeenAt: {
                    gt: new Date(now - SESSION_IDLE_MS)
                }
            },
            data: {
                lastSeenAt: new Date(now)
            }
        });
        if (!touched.count) return null;
    }
    const user = session.user;
    return {
        id: user.id,
        email: user.email,
        name: user.name,
        roleId: user.roleId,
        roleName: user.role.name,
        superAdmin: user.roleId === __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$permissions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SUPER_ADMIN_ROLE_ID"],
        accessScope: user.accessScope,
        mustChangePassword: user.mustChangePassword,
        permissions: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$permissions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["effectivePermissions"])(user),
        meetingIds: user.meetingAssignments.map((item)=>item.meetingId),
        sessionId: session.id,
        verifiedAt: session.verifiedAt.getTime()
    };
}
const can = (user, permission)=>user.superAdmin || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$permissions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isReservedPermission"])(permission) && user.permissions.includes(permission);
const canAccessMeeting = (user, id)=>user.superAdmin || user.meetingIds.includes(id);
function publicUser(user) {
    const { sessionId: _sessionId, ...safe } = user;
    return safe;
}
function checkOrigin(req) {
    const configured = process.env.AUTH_ORIGIN;
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    let expected;
    try {
        expected = new URL(configured ?? req.url).origin;
    } catch  {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Invalid application origin configuration."
        }, {
            status: 503
        });
    }
    const fetchSite = req.headers.get("sec-fetch-site");
    if (req.headers.get("origin") !== expected || fetchSite && ![
        "same-origin",
        "none"
    ].includes(fetchSite)) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Request origin is not allowed."
        }, {
            status: 403
        });
    }
    return null;
}
async function createSession(userId) {
    const token = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomBytes"])(32).toString("hex");
    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
    await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].session.create({
        data: {
            userId,
            tokenHash: tokenHash(token),
            expiresAt
        }
    });
    return {
        token,
        expiresAt
    };
}
function setSessionCookie(res, token, expiresAt) {
    res.cookies.set(SESSION_COOKIE, token, {
        httpOnly: true,
        secure: ("TURBOPACK compile-time value", "development") === "production",
        sameSite: "strict",
        path: "/",
        expires: expiresAt
    });
}
function clearSessionCookie(res) {
    setSessionCookie(res, "", new Date(0));
}
}),
"[project]/lib/access.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "withPermission",
    ()=>withPermission
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/prisma.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth.ts [app-route] (ecmascript)");
;
;
;
function withPermission(requirement, handler, options = {}) {
    return async (req, context)=>{
        let auditId;
        try {
            const mutation = ![
                "GET",
                "HEAD",
                "OPTIONS"
            ].includes(req.method);
            if (mutation) {
                const rejected = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["checkOrigin"])(req);
                if (rejected) return rejected;
            }
            const user = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["currentUser"])(req, options.touchSession !== false);
            if (!user) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Sign in to continue."
            }, {
                status: 401
            });
            if (user.mustChangePassword && !options.allowPasswordChange) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: "Change your temporary password before continuing.",
                    code: "PASSWORD_CHANGE_REQUIRED"
                }, {
                    status: 403
                });
            }
            const needed = typeof requirement === "function" ? requirement(req) : requirement;
            const allowed = needed === null || (Array.isArray(needed) ? needed.some((permission)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["can"])(user, permission)) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["can"])(user, needed));
            if (!allowed || options.superAdmin && !user.superAdmin) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: "You do not have permission for this action."
                }, {
                    status: 403
                });
            }
            if (mutation && options.superAdmin && user.verifiedAt + 10 * 60_000 <= Date.now()) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: "Confirm your password to change security settings.",
                    code: "REAUTH_REQUIRED"
                }, {
                    status: 403
                });
            }
            let meetingId;
            if (options.meeting) {
                const params = await context.params;
                if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["canAccessMeeting"])(user, params.id)) {
                    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                        error: "You do not have access to this meeting."
                    }, {
                        status: 403
                    });
                }
                meetingId = params.id;
            } else {
                const requestedMeeting = new URL(req.url).searchParams.get("meetingId");
                if (requestedMeeting && (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["canAccessMeeting"])(user, requestedMeeting)) meetingId = requestedMeeting;
            }
            if (mutation && options.audit !== false) {
                // Persist intent before business writes. A logging outage denies new mutations.
                const audit = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].auditLog.create({
                    data: {
                        actorId: user.id,
                        actorName: user.name,
                        action: `${req.method} ${typeof needed === "string" ? needed : options.superAdmin ? "security.manage" : "account"}`,
                        resource: new URL(req.url).pathname.slice(0, 500),
                        meetingId,
                        status: "STARTED"
                    }
                });
                auditId = audit.id;
            }
            let response = await handler(req, context, user);
            if (auditId) {
                // STARTED remains visible if a process stops before the outcome is recorded.
                try {
                    await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].auditLog.update({
                        where: {
                            id: auditId
                        },
                        data: {
                            status: response.ok ? "SUCCEEDED" : "REJECTED"
                        }
                    });
                } catch (error) {
                    console.error("Audit outcome could not be recorded", auditId, error);
                }
            }
            if (response.status >= 500) {
                response = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: "The request could not be completed. Please try again."
                }, {
                    status: response.status
                });
            }
            response.headers.set("Cache-Control", "private, no-store");
            response.headers.set("Vary", "Cookie");
            response.headers.set("X-Content-Type-Options", "nosniff");
            return response;
        } catch (error) {
            console.error("Authorized request failed", error);
            if (auditId) {
                try {
                    await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].auditLog.update({
                        where: {
                            id: auditId
                        },
                        data: {
                            status: "FAILED"
                        }
                    });
                } catch  {}
            }
            // Do not expose ORM messages, password hashes, or database configuration.
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "The request could not be completed. Please try again."
            }, {
                status: 500,
                headers: {
                    "Cache-Control": "no-store"
                }
            });
        }
    };
}
}),
"[project]/app/api/meetings/[id]/reports/attendance/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$access$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/access.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/prisma.ts [app-route] (ecmascript)");
;
;
;
async function handleGET(req, context) {
    const { id } = await context.params;
    try {
        const meeting = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].meeting.findUnique({
            where: {
                id
            }
        });
        if (!meeting) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Meeting not found"
        }, {
            status: 404
        });
        const attendanceList = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].attendance.findMany({
            where: {
                meetingId: id
            },
            include: {
                representedBy: true
            },
            orderBy: {
                createdAt: "asc"
            }
        });
        const totalShares = Number(meeting.snapshotTotalShares ?? 0);
        const attendedShares = attendanceList.reduce((sum, a)=>sum + Number(a.snapshotShareValue), 0);
        const quorumPct = meeting.quorumPct ?? 0;
        const required = totalShares * quorumPct / 100;
        const quorumMet = totalShares > 0 && attendedShares >= required;
        const formatted = attendanceList.map((a)=>({
                id: a.id,
                shareholderId: a.shareholderId,
                shareholderName: a.snapshotName,
                shareholderNameAm: a.snapshotNameAm,
                shareValue: a.snapshotShareValue.toString(),
                representedById: a.representedById,
                representedByName: a.representedBy?.name ?? a.representativeName ?? null,
                representativeName: a.representativeName,
                createdAt: a.createdAt
            }));
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            meetingTitle: meeting.title,
            meetingStatus: meeting.status,
            quorumPct,
            totalShares,
            attendedShares,
            quorumMet,
            attendance: formatted,
            attendeesCount: attendanceList.length,
            totalShareholdersCount: meeting.snapshotTotalHolders ?? 0,
            required
        });
    } catch (err) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to get attendance"
        }, {
            status: 500
        });
    }
}
const GET = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$access$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withPermission"])("reports.attendance", handleGET, {
    meeting: true
});
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__5fd96b58._.js.map