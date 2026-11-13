module.exports = [
"[project]/.next-internal/server/app/api/shareholders/template/route/actions.js [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__, module, exports) => {

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
"[project]/lib/shareholder-import-config.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SHAREHOLDER_IMPORT_COLUMNS",
    ()=>SHAREHOLDER_IMPORT_COLUMNS,
    "SHAREHOLDER_IMPORT_MAX_BYTES",
    ()=>SHAREHOLDER_IMPORT_MAX_BYTES,
    "SHAREHOLDER_IMPORT_MAX_ISSUES",
    ()=>SHAREHOLDER_IMPORT_MAX_ISSUES,
    "SHAREHOLDER_IMPORT_MAX_ROWS",
    ()=>SHAREHOLDER_IMPORT_MAX_ROWS,
    "SHAREHOLDER_IMPORT_SHEET",
    ()=>SHAREHOLDER_IMPORT_SHEET,
    "SHAREHOLDER_TEMPLATE_FILENAME",
    ()=>SHAREHOLDER_TEMPLATE_FILENAME,
    "validateShareholderImportFile",
    ()=>validateShareholderImportFile
]);
const SHAREHOLDER_IMPORT_COLUMNS = [
    {
        key: "id",
        header: "Id",
        required: true
    },
    {
        key: "name",
        header: "Name",
        required: true
    },
    {
        key: "nameAm",
        header: "Name Am",
        required: false
    },
    {
        key: "phone",
        header: "Phone",
        required: false
    },
    {
        key: "address",
        header: "Address",
        required: false
    },
    {
        key: "shareValue",
        header: "Share Value",
        required: true
    }
];
const SHAREHOLDER_IMPORT_SHEET = "Shareholders";
const SHAREHOLDER_TEMPLATE_FILENAME = "shareholders-import-template.xlsx";
const SHAREHOLDER_IMPORT_MAX_BYTES = 5 * 1024 * 1024;
const SHAREHOLDER_IMPORT_MAX_ROWS = 10_000;
const SHAREHOLDER_IMPORT_MAX_ISSUES = 50;
function validateShareholderImportFile(file) {
    if (!/\.(xlsx|xls)$/i.test(file.name)) {
        return "Select an Excel workbook (.xlsx or .xls).";
    }
    if (file.size === 0) return "The selected file is empty.";
    if (file.size > SHAREHOLDER_IMPORT_MAX_BYTES) {
        return "The Excel workbook must be 5 MB or smaller.";
    }
    return null;
}
}),
"[project]/lib/shareholder-import.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ShareholderImportError",
    ()=>ShareholderImportError,
    "createShareholderTemplate",
    ()=>createShareholderTemplate,
    "parseShareholderWorkbook",
    ()=>parseShareholderWorkbook,
    "shareholderIdKey",
    ()=>shareholderIdKey
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/xlsx/xlsx.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$shareholder$2d$import$2d$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/shareholder-import-config.ts [app-route] (ecmascript)");
;
;
class ShareholderImportError extends Error {
    issues;
    issueCount;
    status;
    constructor(message, issues = [], issueCount = issues.length, status = 400){
        super(message), this.issues = issues, this.issueCount = issueCount, this.status = status;
        this.name = "ShareholderImportError";
    }
}
const normalizeHeader = (value)=>value.trim().replace(/\s+/g, " ").toLowerCase();
const shareholderIdKey = (id)=>id.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
const isBlank = (cell)=>!cell || !cell.f && (cell.v == null || String(cell.v).trim() === "");
function plainNumber(value) {
    const text = String(value);
    if (!/[eE]/.test(text)) return text;
    const [coefficient, exponent] = text.split(/[eE]/);
    const [integer, fraction = ""] = coefficient.split(".");
    const digits = integer + fraction;
    const point = integer.length + Number(exponent);
    if (point <= 0) return `0.${"0".repeat(-point)}${digits}`;
    if (point >= digits.length) return digits + "0".repeat(point - digits.length);
    return `${digits.slice(0, point)}.${digits.slice(point)}`;
}
function readText(cell, required, allowNumber = false) {
    if (isBlank(cell)) {
        if (required) throw new Error("This field is required.");
        return null;
    }
    if (!cell) return null;
    if (cell.f) throw new Error("Replace the formula with its value before importing.");
    let value;
    if (cell.t === "s" && typeof cell.v === "string") {
        value = cell.v.trim();
    } else if (allowNumber && cell.t === "n" && typeof cell.v === "number") {
        if (!Number.isSafeInteger(cell.v) || cell.v < 0 || cell.v >= 1e15) {
            throw new Error("Enter this value as text to preserve every digit.");
        }
        // Retain zero-padding from an existing workbook's format, such as 00000.
        value = typeof cell.z === "string" && /^0+$/.test(cell.z) ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["utils"].format_cell(cell) : String(cell.v);
    } else {
        throw new Error("Enter a text value, not a date, boolean, or Excel error.");
    }
    if (value.length > 382 || [
        ...value
    ].length > 191) {
        throw new Error("Use 191 characters or fewer.");
    }
    return value;
}
function readShareValue(cell) {
    if (isBlank(cell) || !cell) throw new Error("This field is required.");
    if (cell.f) throw new Error("Replace the formula with its value before importing.");
    let value;
    if (cell.t === "n" && typeof cell.v === "number") {
        if (!Number.isFinite(cell.v) || cell.v < 0) {
            throw new Error("Enter a non-negative share value.");
        }
        value = plainNumber(cell.v);
        const significantDigits = value.replace(".", "").replace(/^0+|0+$/g, "");
        if (significantDigits.length > 15 || cell.v >= 1e15) {
            throw new Error("Enter large or high-precision share values as text.");
        }
    } else if (cell.t === "s" && typeof cell.v === "string") {
        value = cell.v.trim();
    } else {
        throw new Error("Enter a non-negative decimal share value.");
    }
    if (!/^(?:\d+(?:\.\d+)?|\.\d+)$/.test(value)) {
        throw new Error("Enter a non-negative decimal without commas or currency symbols.");
    }
    const [integer = "", fraction = ""] = value.split(".");
    const whole = integer.replace(/^0+/, "") || "0";
    if (whole.length > 24 || fraction.length > 6) {
        throw new Error("Use at most 24 digits before the decimal and 6 after it.");
    }
    return fraction ? `${whole}.${fraction}` : whole;
}
function parseShareholderWorkbook(buffer, filename) {
    const signature = /\.xlsx$/i.test(filename) ? Buffer.from([
        0x50,
        0x4b,
        0x03,
        0x04
    ]) : Buffer.from([
        0xd0,
        0xcf,
        0x11,
        0xe0,
        0xa1,
        0xb1,
        0x1a,
        0xe1
    ]);
    if (!buffer.subarray(0, signature.length).equals(signature)) {
        throw new ShareholderImportError("The file is not a valid Excel workbook. Download the template and try again.");
    }
    let sheet;
    try {
        const metadata = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["read"](buffer, {
            type: "buffer",
            bookSheets: true
        });
        const sheetName = metadata.SheetNames.find((name)=>normalizeHeader(name) === normalizeHeader(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$shareholder$2d$import$2d$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SHAREHOLDER_IMPORT_SHEET"])) ?? metadata.SheetNames[0];
        if (!sheetName) throw new Error("No worksheets");
        const workbook = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["read"](buffer, {
            type: "buffer",
            sheets: sheetName,
            sheetRows: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$shareholder$2d$import$2d$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SHAREHOLDER_IMPORT_MAX_ROWS"] + 2,
            cellDates: true,
            cellNF: true,
            cellText: false
        });
        sheet = workbook.Sheets[sheetName];
    } catch  {
        throw new ShareholderImportError("The Excel workbook could not be read. It may be damaged or password protected.");
    }
    if (!sheet?.["!ref"]) {
        throw new ShareholderImportError("The worksheet is empty. Use the downloaded template.");
    }
    const range = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["utils"].decode_range(sheet["!fullref"] ?? sheet["!ref"]);
    if (range.e.r > __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$shareholder$2d$import$2d$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SHAREHOLDER_IMPORT_MAX_ROWS"]) {
        throw new ShareholderImportError(`Use at most ${__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$shareholder$2d$import$2d$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SHAREHOLDER_IMPORT_MAX_ROWS"].toLocaleString("en-GB")} rows below the header. Split larger files into separate imports.`);
    }
    if (range.e.c >= 64) {
        throw new ShareholderImportError("The worksheet has too many columns. Use the downloaded template.");
    }
    const issues = [];
    let issueCount = 0;
    const addIssue = (row, column, message)=>{
        issueCount++;
        if (issues.length < __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$shareholder$2d$import$2d$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SHAREHOLDER_IMPORT_MAX_ISSUES"]) issues.push({
            row,
            column,
            message
        });
    };
    const columns = new Map();
    for(let columnIndex = 0; columnIndex <= range.e.c; columnIndex++){
        const cell = sheet[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["utils"].encode_cell({
            r: 0,
            c: columnIndex
        })];
        if (isBlank(cell)) continue;
        if (cell?.f || cell?.t !== "s") {
            addIssue(1, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["utils"].encode_col(columnIndex), "Column headers must be text.");
            continue;
        }
        const column = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$shareholder$2d$import$2d$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SHAREHOLDER_IMPORT_COLUMNS"].find((item)=>normalizeHeader(item.header) === normalizeHeader(String(cell.v)));
        if (!column) {
            addIssue(1, String(cell.v).slice(0, 40), "Unrecognized column. Use the headers in the template.");
        } else if (columns.has(column.key)) {
            addIssue(1, column.header, "This column appears more than once.");
        } else {
            columns.set(column.key, columnIndex);
        }
    }
    for (const column of __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$shareholder$2d$import$2d$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SHAREHOLDER_IMPORT_COLUMNS"]){
        if (column.required && !columns.has(column.key)) {
            addIssue(1, column.header, "This required column is missing.");
        }
    }
    if (issueCount) {
        throw new ShareholderImportError("Fix the worksheet headers before importing. No shareholders were imported.", issues, issueCount);
    }
    const shareholders = [];
    const rowsById = new Map();
    const mappedColumns = new Set(columns.values());
    for(let rowIndex = 1; rowIndex <= range.e.r; rowIndex++){
        const rowCells = Array.from({
            length: range.e.c + 1
        }, (_, c)=>sheet[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["utils"].encode_cell({
                r: rowIndex,
                c
            })]);
        if (rowCells.every(isBlank)) continue;
        const row = rowIndex + 1;
        const before = issueCount;
        for(let c = 0; c < rowCells.length; c++){
            if (!isBlank(rowCells[c]) && !mappedColumns.has(c)) {
                addIssue(row, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["utils"].encode_col(c), "This value has no column header.");
            }
        }
        const values = {};
        for (const column of __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$shareholder$2d$import$2d$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SHAREHOLDER_IMPORT_COLUMNS"]){
            const index = columns.get(column.key);
            const cell = index == null ? undefined : rowCells[index];
            try {
                values[column.key] = column.key === "shareValue" ? readShareValue(cell) : readText(cell, column.required, column.key === "id" || column.key === "phone");
            } catch (error) {
                addIssue(row, column.header, error instanceof Error ? error.message : "Invalid value.");
            }
        }
        if (values.id) {
            const key = shareholderIdKey(values.id);
            const previous = rowsById.get(key);
            if (previous != null) {
                addIssue(row, "Id", `This ID is repeated; it first appears on row ${previous}.`);
            } else {
                rowsById.set(key, row);
            }
        }
        if (before === issueCount && values.id && values.name && values.shareValue != null) {
            shareholders.push({
                id: values.id,
                name: values.name,
                nameAm: values.nameAm ?? null,
                phone: values.phone ?? null,
                address: values.address ?? null,
                shareValue: values.shareValue
            });
        }
    }
    if (issueCount) {
        throw new ShareholderImportError("Fix the listed rows and upload the file again. No shareholders were imported.", issues, issueCount);
    }
    if (!shareholders.length) {
        throw new ShareholderImportError("No shareholder data was found. Fill in the Shareholders worksheet below the header.");
    }
    return {
        shareholders,
        rowsById
    };
}
function createShareholderTemplate() {
    const workbook = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["utils"].book_new();
    const sheet = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["utils"].aoa_to_sheet([
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$shareholder$2d$import$2d$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SHAREHOLDER_IMPORT_COLUMNS"].map((column)=>column.header)
    ]);
    // Blank text cells preserve zeros and exact decimals without sample records.
    for(let row = 1; row <= 1000; row++){
        for(let column = 0; column < __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$shareholder$2d$import$2d$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SHAREHOLDER_IMPORT_COLUMNS"].length; column++){
            sheet[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["utils"].encode_cell({
                r: row,
                c: column
            })] = {
                t: "s",
                v: "",
                z: "@"
            };
        }
    }
    sheet["!ref"] = "A1:F1001";
    sheet["!cols"] = [
        18,
        34,
        34,
        22,
        40,
        30
    ].map((wch)=>({
            wch
        }));
    sheet["!autofilter"] = {
        ref: "A1:F1001"
    };
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["utils"].book_append_sheet(workbook, sheet, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$shareholder$2d$import$2d$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SHAREHOLDER_IMPORT_SHEET"]);
    const instructions = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["utils"].aoa_to_sheet([
        [
            "Shareholder import instructions",
            ""
        ],
        [
            "Where to enter data",
            "Use the Shareholders worksheet. Keep the header on row 1 and enter one shareholder per row starting at row 2."
        ],
        [
            "Required columns",
            "Id, Name, Share Value"
        ],
        [
            "Optional columns",
            "Name Am, Phone, Address. Leave unused values blank."
        ],
        [
            "Id",
            "Use a unique ID, stored as text. Letters and leading zeros are supported. Existing IDs cannot be imported again."
        ],
        [
            "Name",
            "Enter the shareholder's full name."
        ],
        [
            "Name Am",
            "Enter the Amharic name if available."
        ],
        [
            "Phone",
            "Store phone numbers as text to retain leading zeros and the country code."
        ],
        [
            "Share Value",
            "Enter a non-negative decimal as text, with no commas or currency symbols. Maximum: 24 digits before the decimal and 6 after it. Zero is allowed."
        ],
        [
            "Text formatting",
            "The first 1,000 data rows are formatted as Text. Keep this format when pasting, and format further rows as Text before entering data."
        ],
        [
            "Limits",
            "Excel files (.xlsx or .xls), up to 5 MB and 10,000 rows below the header. Completely blank rows are ignored."
        ],
        [
            "Formulas",
            "Paste values instead of formulas. Dates, booleans and Excel errors are not shareholder data."
        ],
        [
            "Validation",
            "All rows are checked before saving. If any row is invalid or an ID already exists, no shareholders are imported."
        ],
        [],
        [
            "Examples (for guidance only; these rows are not imported)",
            ""
        ],
        [
            "Id",
            "000123 or SH-001"
        ],
        [
            "Name",
            "Abebe Bekele"
        ],
        [
            "Name Am",
            "አበበ በቀለ"
        ],
        [
            "Phone",
            "+251911000000"
        ],
        [
            "Share Value",
            "494 or 1234.123456"
        ]
    ]);
    instructions["!cols"] = [
        {
            wch: 35
        },
        {
            wch: 110
        }
    ];
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["utils"].book_append_sheet(workbook, instructions, "Instructions");
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["write"](workbook, {
        type: "buffer",
        bookType: "xlsx",
        compression: true
    });
}
}),
"[project]/app/api/shareholders/template/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "runtime",
    ()=>runtime
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$access$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/access.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$shareholder$2d$import$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/shareholder-import.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$shareholder$2d$import$2d$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/shareholder-import-config.ts [app-route] (ecmascript)");
;
;
;
;
const runtime = "nodejs";
function handleGET() {
    return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"](new Uint8Array((0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$shareholder$2d$import$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createShareholderTemplate"])()), {
        headers: {
            "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "Content-Disposition": `attachment; filename="${__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$shareholder$2d$import$2d$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SHAREHOLDER_TEMPLATE_FILENAME"]}"`,
            "Cache-Control": "no-store",
            "X-Content-Type-Options": "nosniff"
        }
    });
}
const GET = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$access$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withPermission"])("shareholders.import", handleGET);
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__d37edbb3._.js.map