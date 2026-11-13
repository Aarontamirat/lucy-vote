module.exports = [
"[project]/.next-internal/server/app/api/meetings/[id]/votes/route/actions.js [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__, module, exports) => {

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
"[project]/lib/voter-identity.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "voterIdentity",
    ()=>voterIdentity
]);
async function voterIdentity(db, meetingId, voterId) {
    const representative = await db.representative.findUnique({
        where: {
            id: voterId
        }
    }) ?? await db.representative.findFirst({
        where: {
            shareholderId: voterId,
            representedBy: {
                some: {
                    meetingId
                }
            }
        }
    });
    if (!representative) return {
        representative: null,
        voterId,
        aliases: [
            voterId
        ]
    };
    return {
        representative,
        voterId: representative.id,
        aliases: [
            ...new Set([
                representative.id,
                ...representative.shareholderId ? [
                    representative.shareholderId
                ] : []
            ])
        ]
    };
}
}),
"[project]/lib/voter-attendance.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "voterAttendance",
    ()=>voterAttendance
]);
async function voterAttendance(db, meetingId, identity) {
    const rep = identity.representative;
    return db.attendance.findMany({
        where: {
            meetingId,
            ...rep ? {
                OR: [
                    {
                        representedById: rep.id
                    },
                    ...rep.shareholderId ? [
                        {
                            shareholderId: rep.shareholderId,
                            representedById: null
                        }
                    ] : []
                ]
            } : {
                shareholderId: identity.voterId,
                representedById: null
            }
        }
    });
}
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
"[project]/app/api/meetings/[id]/votes/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DELETE",
    ()=>DELETE,
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$access$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/access.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/prisma.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v4/classic/external.js [app-route] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$voter$2d$identity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/voter-identity.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$voter$2d$attendance$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/voter-attendance.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$election$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/election.ts [app-route] (ecmascript)");
;
;
;
;
;
;
;
const SubmitVotesSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    voterId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1),
    nomineeIds: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1)).min(1).max(400).refine((ids)=>new Set(ids).size === ids.length, "Each nominee can only be selected once.")
});
const ReverseVotesSchema = SubmitVotesSchema.extend({
    reason: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(5).max(500)
}).strict();
async function handlePOST(req, context, actor) {
    const { id } = await context.params;
    const meetingId = id;
    try {
        const body = await req.json();
        const parsed = SubmitVotesSchema.parse(body);
        // Check if meeting exists and is open for voting
        const meeting = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].meeting.findUnique({
            where: {
                id: meetingId
            }
        });
        if (!meeting) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Meeting not found"
        }, {
            status: 404
        });
        if (meeting.status !== "VOTINGOPEN") {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Meeting not open for voting"
            }, {
                status: 400
            });
        }
        const selectedNominees = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].nominee.findMany({
            where: {
                meetingId,
                id: {
                    in: parsed.nomineeIds
                }
            },
            select: {
                id: true,
                type: true
            }
        });
        if (selectedNominees.length !== parsed.nomineeIds.length) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "One or more selected nominees do not belong to this meeting."
            }, {
                status: 400
            });
        }
        let votingRules;
        try {
            votingRules = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$election$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getElectionRules"])(meeting);
        } catch (error) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: error instanceof Error ? error.message : "Invalid election rules"
            }, {
                status: 400
            });
        }
        const identity = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$voter$2d$identity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["voterIdentity"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"], meetingId, parsed.voterId);
        const attendance = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$voter$2d$attendance$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["voterAttendance"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"], meetingId, identity);
        if (!attendance.length) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Voter did not attend directly or is represented by someone else and cannot vote with this ID."
            }, {
                status: 403
            });
        }
        const weight = attendance.reduce((sum, row)=>sum + Number(row.snapshotShareValue), 0);
        const attendedData = {
            snapshotVoterName: identity.representative?.name ?? attendance[0].snapshotName,
            snapshotVoterShareValue: weight
        };
        // Reject zero-weight votes
        if (weight <= 0) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Vote weight is zero; cannot submit vote."
            }, {
                status: 400
            });
        }
        // Transaction: Prevent duplicate votes, create only new ones
        const nomineeIds = parsed.nomineeIds;
        const result = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].$transaction(async (tx)=>{
            // Serialize ballot submissions so simultaneous requests cannot exceed the limits.
            await tx.$queryRaw`SELECT id FROM Meeting WHERE id = ${meetingId} FOR UPDATE`;
            const currentMeeting = await tx.meeting.findUnique({
                where: {
                    id: meetingId
                }
            });
            if (currentMeeting?.status !== "VOTINGOPEN") throw new Error("Meeting not open for voting");
            // Attendance changes use this same meeting lock. Recheck eligibility and
            // weight after acquiring it so a removal cannot race a ballot submission.
            const currentAttendance = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$voter$2d$attendance$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["voterAttendance"])(tx, meetingId, identity);
            if (!currentAttendance.length || currentAttendance.reduce((sum, row)=>sum + Number(row.snapshotShareValue), 0) !== weight) {
                throw new Error("Voter attendance changed. Look up the voter again before recording votes.");
            }
            const existing = await tx.vote.findMany({
                where: {
                    meetingId,
                    voterId: {
                        in: identity.aliases
                    }
                },
                select: {
                    nomineeId: true,
                    nominee: {
                        select: {
                            type: true
                        }
                    }
                }
            });
            const alreadyVotedSet = new Set(existing.map((e)=>e.nomineeId));
            const toCreate = nomineeIds.filter((id)=>!alreadyVotedSet.has(id));
            if (toCreate.length === 0) {
                return {
                    created: [],
                    already: nomineeIds
                };
            }
            const limitError = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$election$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ballotLimitError"])([
                ...existing.map((vote)=>vote.nominee),
                ...selectedNominees.filter((nominee)=>toCreate.includes(nominee.id))
            ], (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$election$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getElectionRules"])(currentMeeting));
            if (limitError) throw new Error(limitError);
            const created = [];
            for (const nomineeId of toCreate){
                const c = await tx.vote.create({
                    data: {
                        meetingId,
                        nomineeId,
                        voterId: identity.voterId,
                        weight,
                        snapshotVoterName: attendedData.snapshotVoterName ?? "",
                        snapshotVoterShareValue: attendedData.snapshotVoterShareValue ?? 0
                    }
                });
                created.push(c);
            }
            await tx.auditLog.create({
                data: {
                    actorId: actor.id,
                    actorName: actor.name,
                    action: "votes.recorded",
                    resource: meetingId,
                    meetingId,
                    status: "SUCCEEDED",
                    details: {
                        voterId: parsed.voterId,
                        nomineeIds: toCreate,
                        weight,
                        createdCount: created.length
                    }
                }
            });
            return {
                created,
                already: existing.map((e)=>e.nomineeId)
            };
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            ok: true,
            created: result.created,
            already: result.already
        });
    } catch (err) {
        if (err?.issues) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: err.issues
            }, {
                status: 400
            });
        }
        if (err?.message?.startsWith("This ballot allows up to") || err?.message === "Meeting not open for voting" || err?.message === "Voter attendance changed. Look up the voter again before recording votes.") {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: err.message
            }, {
                status: 400
            });
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to submit votes"
        }, {
            status: 500
        });
    }
}
async function handleDELETE(req, context, actor) {
    const { id: meetingId } = await context.params;
    try {
        const parsed = ReverseVotesSchema.parse(await req.json());
        const result = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].$transaction(async (tx)=>{
            // Use the submission lock so a correction cannot race another ballot write.
            await tx.$queryRaw`SELECT id FROM Meeting WHERE id = ${meetingId} FOR UPDATE`;
            const meeting = await tx.meeting.findUnique({
                where: {
                    id: meetingId
                }
            });
            if (!meeting) throw new Error("Meeting not found");
            if (meeting.status !== "VOTINGOPEN") {
                throw new Error("Votes can only be reversed while voting is open.");
            }
            // Scope every deletion to this meeting, voter and the explicit choices.
            // Repeated requests are harmless if a choice has already been reversed.
            const identity = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$voter$2d$identity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["voterIdentity"])(tx, meetingId, parsed.voterId);
            const previous = await tx.vote.findMany({
                where: {
                    meetingId,
                    voterId: {
                        in: identity.aliases
                    },
                    nomineeId: {
                        in: parsed.nomineeIds
                    }
                },
                select: {
                    nomineeId: true,
                    weight: true
                }
            });
            const reversed = await tx.vote.deleteMany({
                where: {
                    meetingId,
                    voterId: {
                        in: identity.aliases
                    },
                    nomineeId: {
                        in: parsed.nomineeIds
                    }
                }
            });
            const remaining = await tx.vote.findMany({
                where: {
                    meetingId,
                    voterId: {
                        in: identity.aliases
                    }
                },
                select: {
                    nomineeId: true
                }
            });
            await tx.auditLog.create({
                data: {
                    actorId: actor.id,
                    actorName: actor.name,
                    action: "votes.reversed",
                    resource: meetingId,
                    meetingId,
                    status: "SUCCEEDED",
                    details: {
                        voterId: parsed.voterId,
                        nomineeIds: parsed.nomineeIds,
                        previousChoices: previous,
                        reason: parsed.reason,
                        reversedCount: reversed.count
                    }
                }
            });
            return {
                reversedCount: reversed.count,
                voted: remaining.map((vote)=>vote.nomineeId)
            };
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            ok: true,
            ...result
        });
    } catch (error) {
        if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].ZodError) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: error.issues
            }, {
                status: 400
            });
        }
        if (error instanceof SyntaxError) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Invalid JSON request body"
            }, {
                status: 400
            });
        }
        const message = error instanceof Error ? error.message : "Failed to reverse votes";
        const status = message === "Meeting not found" ? 404 : message === "Votes can only be reversed while voting is open." ? 400 : 500;
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: message
        }, {
            status
        });
    }
}
async function handleGET(req, context) {
    const { id } = await context.params;
    const meetingId = id;
    try {
        // parse optional voterId query param
        const url = new URL(req.url);
        const voterId = url.searchParams.get("voterId");
        // If caller requests votes for a particular voter, return those nomineeIds
        if (url.searchParams.has("voterId")) {
            if (!voterId || voterId.length > 191) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "A valid voter ID is required."
            }, {
                status: 400
            });
            // ensure meeting exists
            const meeting = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].meeting.findUnique({
                where: {
                    id: meetingId
                }
            });
            if (!meeting) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Meeting not found"
            }, {
                status: 404
            });
            const identity = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$voter$2d$identity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["voterIdentity"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"], meetingId, voterId);
            // fetch votes by this voter for the meeting
            const votes = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].vote.findMany({
                where: {
                    meetingId,
                    voterId: {
                        in: identity.aliases
                    }
                },
                select: {
                    nomineeId: true,
                    weight: true
                }
            });
            const votedNomineeIds = votes.map((v)=>v.nomineeId);
            const voterWeight = votes.length ? Number(votes[0].weight) : undefined;
            let rules;
            try {
                rules = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$election$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getElectionRules"])(meeting);
            } catch (error) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: error instanceof Error ? error.message : "Invalid election rules"
                }, {
                    status: 400
                });
            }
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                meetingStatus: meeting.status,
                voterId,
                voted: votedNomineeIds,
                voterWeight,
                maxVotes: rules.winnerCount,
                votingRules: rules.mode === "GROUPED" ? {
                    mode: "GROUPED",
                    firstPassers: meeting.firstPassers,
                    secondPassers: meeting.secondPassers
                } : {
                    mode: "STANDARD",
                    winnerCount: rules.winnerCount
                }
            });
        }
        // Default behavior: aggregated results + total attended shares (unchanged)
        const meeting = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].meeting.findUnique({
            where: {
                id: meetingId
            }
        });
        if (!meeting) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Meeting not found"
        }, {
            status: 404
        });
        const [nominees, grouped, attendance, voterGroups] = await Promise.all([
            __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].nominee.findMany({
                where: {
                    meetingId
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
                    meetingId
                },
                _sum: {
                    weight: true
                }
            }),
            __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].attendance.aggregate({
                where: {
                    meetingId
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
                    meetingId
                }
            })
        ]);
        const weightByNominee = new Map(grouped.map((g)=>[
                g.nomineeId,
                Number(g._sum.weight ?? 0)
            ]));
        const results = nominees.map((n, index)=>{
            return {
                nomineeId: n.id,
                name: n.name,
                nameAm: n.nameAm,
                type: n.type,
                description: n.description,
                totalWeight: weightByNominee.get(n.id) ?? 0,
                registrationOrder: index + 1
            };
        });
        let rules = null;
        let configurationError = null;
        try {
            rules = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$election$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getElectionRules"])(meeting);
        } catch (error) {
            configurationError = error instanceof Error ? error.message : "Invalid election rules";
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            meetingStatus: meeting.status,
            meetingTitle: meeting.title,
            results: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$election$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rankElectionResults"])(results, rules, meeting.status === "CLOSED"),
            totalSharesAttended: Number(attendance._sum.snapshotShareValue ?? 0),
            attendeesCount: attendance._count._all,
            ballotsCast: voterGroups.length,
            winnerCount: rules?.winnerCount ?? null,
            configurationError,
            meetingFirstPassers: meeting.firstPassers,
            meetingSecondPassers: meeting.secondPassers,
            votingMode: meeting.firstPassers != null && meeting.secondPassers != null && meeting.firstPassers > 0 && meeting.secondPassers > 0 ? "GROUPED" : "STANDARD"
        }, {
            headers: {
                "Cache-Control": "no-store"
            }
        });
    } catch (err) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to fetch results"
        }, {
            status: 500
        });
    }
}
const GET = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$access$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withPermission"])((req)=>new URL(req.url).searchParams.has("voterId") ? "votes.lookup" : [
        "results.view",
        "projection.view"
    ], handleGET, {
    meeting: true
});
const POST = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$access$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withPermission"])("votes.record", handlePOST, {
    meeting: true
});
const DELETE = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$access$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withPermission"])("votes.reverse", handleDELETE, {
    meeting: true
});
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__86aa7721._.js.map