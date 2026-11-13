module.exports = [
"[project]/.next-internal/server/app/api/meetings/[id]/attendance/route/actions.js [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__, module, exports) => {

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
async function voterIdentity(_db, _meetingId, voterId) {
    return {
        voterId,
        aliases: [
            voterId
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
    return db.attendance.findMany({
        where: {
            meetingId,
            shareholderId: identity.voterId
        },
        include: {
            representedBy: {
                select: {
                    id: true,
                    name: true
                }
            }
        }
    });
}
}),
"[project]/lib/legacy-ballots.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LEGACY_BALLOT_ERROR",
    ()=>LEGACY_BALLOT_ERROR,
    "legacyBallots",
    ()=>legacyBallots
]);
const LEGACY_BALLOT_ERROR = "An older combined representative ballot affects this shareholder. A Super Admin must reverse all its recorded choices while voting is open, then enter each shareholder's original card separately.";
async function legacyBallots(db, meetingId, scope) {
    const shareholderIds = scope?.shareholderIds ?? [];
    const representativeIds = scope?.representativeIds ?? [];
    if (scope && !shareholderIds.length && !representativeIds.length) return [];
    const representatives = await db.representative.findMany({
        where: scope ? {
            OR: [
                {
                    id: {
                        in: [
                            ...representativeIds,
                            ...shareholderIds
                        ]
                    }
                },
                {
                    shareholderId: {
                        in: shareholderIds
                    }
                },
                {
                    representedBy: {
                        some: {
                            meetingId,
                            shareholderId: {
                                in: shareholderIds
                            }
                        }
                    }
                }
            ]
        } : {
            OR: [
                {
                    registeredForMeetingId: meetingId
                },
                {
                    representedBy: {
                        some: {
                            meetingId
                        }
                    }
                }
            ]
        },
        select: {
            id: true,
            name: true,
            shareholderId: true
        }
    });
    if (!representatives.length) return [];
    const ownIds = representatives.flatMap((rep)=>rep.shareholderId ? [
            rep.shareholderId
        ] : []);
    const [votes, ownAttendance] = await Promise.all([
        db.vote.findMany({
            where: {
                meetingId,
                voterId: {
                    in: [
                        ...representatives.map((rep)=>rep.id),
                        ...ownIds
                    ]
                }
            },
            select: {
                voterId: true,
                nomineeId: true,
                weight: true,
                snapshotVoterName: true
            }
        }),
        db.attendance.findMany({
            where: {
                meetingId,
                shareholderId: {
                    in: ownIds
                }
            },
            select: {
                shareholderId: true,
                snapshotShareValue: true
            }
        })
    ]);
    const ownWeight = new Map(ownAttendance.map((row)=>[
            row.shareholderId,
            Number(row.snapshotShareValue)
        ]));
    const groups = new Map();
    for (const vote of votes){
        const rep = representatives.find((item)=>item.id === vote.voterId || item.shareholderId === vote.voterId);
        if (!rep) continue;
        if (vote.voterId !== rep.id && ownWeight.get(vote.voterId) === Number(vote.weight)) continue;
        const group = groups.get(vote.voterId) ?? {
            voterId: vote.voterId,
            voterName: vote.snapshotVoterName || rep.name,
            nomineeIds: [],
            weight: Number(vote.weight)
        };
        group.nomineeIds.push(vote.nomineeId);
        groups.set(vote.voterId, group);
    }
    return [
        ...groups.values()
    ];
}
}),
"[project]/lib/representative-access.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "representativeMeetingFilter",
    ()=>representativeMeetingFilter
]);
const representativeMeetingFilter = (meetingId)=>({
        OR: [
            {
                registeredForMeetingId: meetingId
            },
            {
                representedBy: {
                    some: {
                        meetingId
                    }
                }
            },
            {
                representations: {
                    some: {
                        meetingId
                    }
                }
            }
        ]
    });
}),
"[project]/lib/request-json.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "readJson",
    ()=>readJson
]);
async function readJson(req, limit = 16_384) {
    if (!req.headers.get("content-type")?.toLowerCase().startsWith("application/json")) throw new SyntaxError("Send an application/json request.");
    if (Number(req.headers.get("content-length")) > limit) throw new SyntaxError("Request is too large.");
    if (!req.body) throw new SyntaxError("A JSON body is required.");
    const reader = req.body.getReader();
    const chunks = [];
    let size = 0;
    try {
        while(true){
            const { done, value } = await reader.read();
            if (done) break;
            size += value.byteLength;
            if (size > limit) {
                await reader.cancel();
                throw new SyntaxError("Request is too large.");
            }
            chunks.push(value);
        }
    } finally{
        reader.releaseLock();
    }
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}
}),
"[project]/lib/security-admin.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AdminError",
    ()=>AdminError,
    "ensureAdminRemains",
    ()=>ensureAdminRemains,
    "securityTransaction",
    ()=>securityTransaction
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/prisma.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$permissions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/permissions.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth.ts [app-route] (ecmascript)");
;
;
;
class AdminError extends Error {
    status;
    code;
    constructor(message, status = 400, code){
        super(message), this.status = status, this.code = code;
    }
}
async function securityTransaction(actor, operation) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].$transaction(async (tx)=>{
        const lock = await tx.$queryRaw`SELECT id FROM SecurityLock WHERE id = 1 FOR UPDATE`;
        if (lock.length !== 1) throw new Error("The security lock has not been initialized.");
        // Recheck the actor after obtaining the lock; a concurrent demotion wins first.
        const current = await tx.user.findUnique({
            where: {
                id: actor.id
            }
        });
        if (!current?.active || current.mustChangePassword || current.roleId !== __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$permissions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SUPER_ADMIN_ROLE_ID"]) {
            throw new AdminError("Super Admin access is required.", 403);
        }
        const session = await tx.session.findUnique({
            where: {
                id: actor.sessionId
            }
        });
        const now = Date.now();
        if (!session || session.userId !== actor.id || session.expiresAt.getTime() <= now || session.lastSeenAt.getTime() + __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SESSION_IDLE_MS"] <= now) {
            throw new AdminError("Sign in to continue.", 401);
        }
        if (session.verifiedAt.getTime() + 10 * 60_000 <= now) {
            throw new AdminError("Confirm your password before changing security settings.", 403, "REAUTH_REQUIRED");
        }
        return operation(tx);
    }, {
        maxWait: 5000,
        timeout: 15000
    });
}
async function ensureAdminRemains(tx, id, next) {
    const current = await tx.user.findUnique({
        where: {
            id
        }
    });
    if (!current) throw new AdminError("User not found.", 404);
    if (current.active && current.roleId === __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$permissions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SUPER_ADMIN_ROLE_ID"] && (next.active === false || next.roleId !== undefined && next.roleId !== __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$permissions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SUPER_ADMIN_ROLE_ID"])) {
        const count = await tx.user.count({
            where: {
                id: {
                    not: id
                },
                active: true,
                roleId: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$permissions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SUPER_ADMIN_ROLE_ID"],
                mustChangePassword: false
            }
        });
        if (count === 0) throw new AdminError("The last active Super Admin cannot be disabled or demoted before another Super Admin has completed account setup.", 409);
    }
    return current;
}
}),
"[project]/lib/admin-response.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "adminErrorResponse",
    ()=>adminErrorResponse
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v4/classic/external.js [app-route] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$security$2d$admin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/security-admin.ts [app-route] (ecmascript)");
;
;
;
function adminErrorResponse(error) {
    if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$security$2d$admin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AdminError"]) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        error: error.message,
        ...error.code ? {
            code: error.code
        } : {}
    }, {
        status: error.status
    });
    if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].ZodError) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        error: error.issues.map((issue)=>issue.message).join(" ")
    }, {
        status: 400
    });
    if (error instanceof SyntaxError) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        error: "Send a valid JSON request."
    }, {
        status: 400
    });
    if (typeof error === "object" && error !== null && "code" in error) {
        if (error.code === "P2002") return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "That email or role name is already in use."
        }, {
            status: 409
        });
        if (error.code === "P2003") return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "The selected role or meeting is no longer available."
        }, {
            status: 409
        });
        if (error.code === "P2025") return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Record not found."
        }, {
            status: 404
        });
    }
    throw error;
}
}),
"[project]/app/api/meetings/[id]/attendance/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
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
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$legacy$2d$ballots$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/legacy-ballots.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$representative$2d$access$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/representative-access.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$request$2d$json$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/request-json.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$security$2d$admin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/security-admin.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$admin$2d$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/admin-response.ts [app-route] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
;
const BulkAddAttendanceSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    shareholderIds: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(191)).min(1).max(1000).optional(),
    shareholderId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(191).optional(),
    representativeId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(191).optional(),
    representativeShareholderId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(191).optional(),
    representativeName: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(191).optional()
}).strict().refine((value)=>!(value.representativeId && value.representativeShareholderId), "Choose one representative type.").refine((value)=>!value.representativeName || !!value.representativeId, "A representative ID is required with the name.");
async function handleGET(req, context) {
    const { id } = await context.params;
    try {
        const voterId = new URL(req.url).searchParams.get("voterId");
        if (new URL(req.url).searchParams.has("voterId")) {
            if (!voterId || voterId.length > 191) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "A valid voter ID is required."
            }, {
                status: 400
            });
            const identity = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$voter$2d$identity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["voterIdentity"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"], id, voterId);
            const attendance = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$voter$2d$attendance$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["voterAttendance"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"], id, identity);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                attendance: attendance.map((item)=>({
                        shareholderId: item.shareholderId,
                        shareholderName: item.snapshotName,
                        representedById: item.representedById,
                        representedByName: item.representativeName ?? item.representedBy?.name ?? null,
                        shareValue: item.snapshotShareValue.toString()
                    }))
            });
        }
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
                representedBy: true,
                shareholder: true
            },
            orderBy: {
                createdAt: "asc"
            }
        });
        const attendeesCount = attendanceList.length;
        // total shareholders for stats only
        const totalShareholdersCount = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].shareholder.count();
        // total shares in system (live value used only for quorum requirement)
        const totalSharesAgg = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].meeting.aggregate({
            where: {
                id: id
            },
            _sum: {
                snapshotTotalShares: true
            }
        });
        const totalShares = Number(totalSharesAgg._sum.snapshotTotalShares ?? 0);
        // attendedShares is now based on SNAPSHOT shareValue only
        const attendedShares = attendanceList.reduce((sum, a)=>sum + Number(a.snapshotShareValue), 0);
        const quorumPct = meeting.quorumPct ?? 0;
        const required = totalShares * quorumPct / 100;
        const quorumMet = totalShares > 0 && attendedShares >= required;
        // We now return snapshot data instead of live shareholder values
        const formatted = attendanceList.map((a)=>({
                id: a.id,
                shareholderId: a.shareholderId,
                shareholderName: a.snapshotName,
                shareholderNameAm: a.snapshotNameAm ?? null,
                shareValue: a.snapshotShareValue.toString(),
                representedById: a.representedById,
                representedByName: a.representedBy?.name ?? a.representativeName ?? null,
                representativeName: a.representativeName,
                createdAt: a.createdAt
            }));
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            meetingStatus: meeting.status,
            quorumPct,
            totalShares,
            attendedShares,
            quorumMet,
            attendance: formatted,
            attendeesCount,
            totalShareholdersCount,
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
async function handlePOST(req, context, actor) {
    const { id: meetingId } = await context.params;
    try {
        const parsed = BulkAddAttendanceSchema.parse(await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$request$2d$json$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readJson"])(req, 128_000));
        const shareholderIds = parsed.shareholderIds ?? (parsed.shareholderId ? [
            parsed.shareholderId
        ] : []);
        if (!shareholderIds.length || new Set(shareholderIds).size !== shareholderIds.length) throw new __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$security$2d$admin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AdminError"]("Select distinct shareholder IDs.");
        const created = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].$transaction(async (tx)=>{
            await tx.$queryRaw`SELECT id FROM Meeting WHERE id = ${meetingId} FOR UPDATE`;
            const meeting = await tx.meeting.findUnique({
                where: {
                    id: meetingId
                }
            });
            if (!meeting) throw new __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$security$2d$admin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AdminError"]("Meeting not found.", 404);
            if (![
                "OPEN",
                "VOTINGOPEN"
            ].includes(meeting.status)) throw new __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$security$2d$admin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AdminError"]("Open this meeting before registering attendance. Closed meetings cannot be changed.");
            if (await tx.attendance.count({
                where: {
                    meetingId,
                    shareholderId: {
                        in: shareholderIds
                    }
                }
            })) throw new __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$security$2d$admin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AdminError"]("One or more shareholders already attended this meeting.", 409);
            const shareholders = await tx.shareholder.findMany({
                where: {
                    id: {
                        in: shareholderIds
                    }
                }
            });
            if (shareholders.length !== shareholderIds.length) throw new __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$security$2d$admin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AdminError"]("One or more shareholder IDs do not exist.", 404);
            let representative = null;
            if (parsed.representativeShareholderId) {
                const sh = await tx.shareholder.findUnique({
                    where: {
                        id: parsed.representativeShareholderId
                    }
                });
                if (!sh) throw new __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$security$2d$admin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AdminError"]("Representative shareholder not found.", 404);
                representative = await tx.representative.findFirst({
                    where: {
                        shareholderId: sh.id
                    }
                });
                if (!representative) representative = await tx.representative.create({
                    data: {
                        name: sh.name,
                        phone: sh.phone,
                        shareholderId: sh.id,
                        registeredForMeetingId: meetingId
                    }
                });
            } else if (parsed.representativeId) {
                representative = await tx.representative.findUnique({
                    where: {
                        id: parsed.representativeId
                    }
                });
                if (representative) {
                    if (!actor.superAdmin && !await tx.representative.findFirst({
                        where: {
                            id: representative.id,
                            ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$representative$2d$access$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["representativeMeetingFilter"])(meetingId)
                        }
                    })) throw new __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$security$2d$admin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AdminError"]("This representative ID is unavailable for this meeting.", 403);
                    if (parsed.representativeName && parsed.representativeName !== representative.name) throw new __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$security$2d$admin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AdminError"]("This representative ID already exists. Select an existing representative.", 409);
                } else {
                    if (!parsed.representativeName) throw new __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$security$2d$admin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AdminError"]("Representative not found.", 404);
                    if (await tx.shareholder.findUnique({
                        where: {
                            id: parsed.representativeId
                        }
                    })) throw new __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$security$2d$admin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AdminError"]("An external representative ID cannot be a shareholder ID.", 409);
                    representative = await tx.representative.create({
                        data: {
                            id: parsed.representativeId,
                            name: parsed.representativeName,
                            registeredForMeetingId: meetingId
                        }
                    });
                }
            }
            if (await tx.vote.count({
                where: {
                    meetingId,
                    voterId: {
                        in: shareholderIds
                    }
                }
            })) throw new __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$security$2d$admin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AdminError"]("Attendance cannot change the weight of an already recorded shareholder ballot. Reverse that shareholder's votes first.", 409);
            if ((await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$legacy$2d$ballots$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["legacyBallots"])(tx, meetingId, {
                shareholderIds,
                representativeIds: representative ? [
                    representative.id
                ] : []
            })).length) throw new __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$security$2d$admin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AdminError"](__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$legacy$2d$ballots$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["LEGACY_BALLOT_ERROR"], 409);
            const rows = [];
            for (const sh of shareholders){
                const attendance = await tx.attendance.create({
                    data: {
                        meetingId,
                        shareholderId: sh.id,
                        representedById: representative?.id ?? null,
                        representativeName: representative?.name ?? null,
                        snapshotName: sh.name,
                        snapshotNameAm: sh.nameAm,
                        snapshotPhone: sh.phone,
                        snapshotAddress: sh.address,
                        snapshotShareValue: sh.shareValue
                    }
                });
                if (representative) await tx.representation.create({
                    data: {
                        meetingId,
                        representativeId: representative.id,
                        shareholderId: sh.id
                    }
                });
                rows.push({
                    id: attendance.id,
                    shareholderId: sh.id,
                    shareholderName: sh.name,
                    shareValue: sh.shareValue.toString(),
                    representedById: representative?.id ?? null,
                    representedByName: representative?.name ?? null,
                    createdAt: attendance.createdAt
                });
            }
            await tx.auditLog.create({
                data: {
                    actorId: actor.id,
                    actorName: actor.name,
                    action: "attendance.registered",
                    resource: meetingId,
                    meetingId,
                    status: "SUCCEEDED",
                    details: {
                        shareholderIds,
                        representativeId: representative?.id ?? null
                    }
                }
            });
            return rows;
        }, {
            timeout: 15000
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            ok: true,
            created,
            skipped: []
        });
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$admin$2d$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["adminErrorResponse"])(error);
    }
}
const GET = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$access$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withPermission"])((req)=>new URL(req.url).searchParams.has("voterId") ? "votes.lookup" : [
        "attendance.view",
        "reports.attendance"
    ], handleGET, {
    meeting: true
});
const POST = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$access$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withPermission"])("attendance.register", handlePOST, {
    meeting: true
});
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__f60b9861._.js.map