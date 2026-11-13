(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/components/general/AttendanceClock.module.css [app-client] (css module)", ((__turbopack_context__) => {

__turbopack_context__.v({
  "bezel": "AttendanceClock-module__dUgQea__bezel",
  "bezel-orbit": "AttendanceClock-module__dUgQea__bezel-orbit",
  "clock": "AttendanceClock-module__dUgQea__clock",
  "clock-arrive": "AttendanceClock-module__dUgQea__clock-arrive",
  "clock-breathe": "AttendanceClock-module__dUgQea__clock-breathe",
  "colon": "AttendanceClock-module__dUgQea__colon",
  "date": "AttendanceClock-module__dUgQea__date",
  "dialLabel": "AttendanceClock-module__dUgQea__dialLabel",
  "dialTime": "AttendanceClock-module__dUgQea__dialTime",
  "dialWindow": "AttendanceClock-module__dUgQea__dialWindow",
  "eyebrow": "AttendanceClock-module__dUgQea__eyebrow",
  "face": "AttendanceClock-module__dUgQea__face",
  "halo": "AttendanceClock-module__dUgQea__halo",
  "hand": "AttendanceClock-module__dUgQea__hand",
  "hand-sweep": "AttendanceClock-module__dUgQea__hand-sweep",
  "handInset": "AttendanceClock-module__dUgQea__handInset",
  "hourHand": "AttendanceClock-module__dUgQea__hourHand",
  "hourMark": "AttendanceClock-module__dUgQea__hourMark",
  "innerRing": "AttendanceClock-module__dUgQea__innerRing",
  "liveDot": "AttendanceClock-module__dUgQea__liveDot",
  "minuteHand": "AttendanceClock-module__dUgQea__minuteHand",
  "minuteMark": "AttendanceClock-module__dUgQea__minuteMark",
  "numeral": "AttendanceClock-module__dUgQea__numeral",
  "pivot": "AttendanceClock-module__dUgQea__pivot",
  "readout": "AttendanceClock-module__dUgQea__readout",
  "reflection": "AttendanceClock-module__dUgQea__reflection",
  "secondHand": "AttendanceClock-module__dUgQea__secondHand",
  "seconds": "AttendanceClock-module__dUgQea__seconds",
  "time": "AttendanceClock-module__dUgQea__time",
  "watch": "AttendanceClock-module__dUgQea__watch",
  "windingCrown": "AttendanceClock-module__dUgQea__windingCrown",
  "zone": "AttendanceClock-module__dUgQea__zone",
});
}),
"[project]/components/general/AttendanceClock.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>AttendanceClock
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/components/AnimatePresence/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$utils$2f$reduced$2d$motion$2f$use$2d$reduced$2d$motion$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/utils/reduced-motion/use-reduced-motion.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$general$2f$AttendanceClock$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/components/general/AttendanceClock.module.css [app-client] (css module)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
const timeFormatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Nairobi",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
});
const dateFormatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Nairobi",
    weekday: "short",
    day: "2-digit",
    month: "short"
});
// Nairobi uses UTC+3 year-round. Fractions keep all three hands in continuous motion.
function secondsInDay(timestamp) {
    return ((timestamp / 1000 + 3 * 3600) % 86400 + 86400) % 86400;
}
function AttendanceClock() {
    _s();
    const [clock, setClock] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const reducedMotion = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$utils$2f$reduced$2d$motion$2f$use$2d$reduced$2d$motion$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useReducedMotion"])();
    const id = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useId"])().replace(/:/g, "");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AttendanceClock.useEffect": ()=>{
            const sync = {
                "AttendanceClock.useEffect.sync": ()=>{
                    const now = Date.now();
                    setClock({
                        now,
                        phase: now
                    });
                }
            }["AttendanceClock.useEffect.sync"];
            sync();
            let timer;
            const tick = {
                "AttendanceClock.useEffect.tick": ()=>{
                    const now = Date.now();
                    setClock({
                        "AttendanceClock.useEffect.tick": (previous)=>{
                            var _previous_phase;
                            return {
                                now,
                                phase: (_previous_phase = previous === null || previous === void 0 ? void 0 : previous.phase) !== null && _previous_phase !== void 0 ? _previous_phase : now
                            };
                        }
                    }["AttendanceClock.useEffect.tick"]);
                    timer = setTimeout(tick, 1000 - Date.now() % 1000);
                }
            }["AttendanceClock.useEffect.tick"];
            timer = setTimeout(tick, 1000 - Date.now() % 1000);
            const onVisibility = {
                "AttendanceClock.useEffect.onVisibility": ()=>{
                    if (!document.hidden) sync();
                }
            }["AttendanceClock.useEffect.onVisibility"];
            document.addEventListener("visibilitychange", onVisibility);
            window.addEventListener("focus", sync);
            return ({
                "AttendanceClock.useEffect": ()=>{
                    clearTimeout(timer);
                    document.removeEventListener("visibilitychange", onVisibility);
                    window.removeEventListener("focus", sync);
                }
            })["AttendanceClock.useEffect"];
        }
    }["AttendanceClock.useEffect"], []);
    const time = clock ? timeFormatter.format(clock.now) : "—:—:—";
    const [hours, minutes, seconds] = time.split(":");
    const date = clock ? dateFormatter.format(clock.now) : "East Africa Time";
    const phase = clock ? secondsInDay(clock.phase) : 0;
    const current = clock ? secondsInDay(clock.now) : 0;
    const handStyle = (period)=>({
            "--hand-delay": "".concat(-(phase % period), "s"),
            "--hand-angle": "".concat(current % period / period * 360, "deg")
        });
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
        className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$general$2f$AttendanceClock$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].clock,
        "aria-label": "Live clock, East Africa Time",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$general$2f$AttendanceClock$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].watch,
                "aria-hidden": "true",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$general$2f$AttendanceClock$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].halo
                    }, void 0, false, {
                        fileName: "[project]/components/general/AttendanceClock.tsx",
                        lineNumber: 72,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$general$2f$AttendanceClock$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].bezel,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$general$2f$AttendanceClock$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].face,
                            viewBox: "0 0 240 240",
                            focusable: "false",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("defs", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("radialGradient", {
                                            id: "".concat(id, "-dial"),
                                            cx: "36%",
                                            cy: "24%",
                                            r: "80%",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("stop", {
                                                    offset: "0",
                                                    stopColor: "var(--dial-highlight)"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/general/AttendanceClock.tsx",
                                                    lineNumber: 77,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("stop", {
                                                    offset: "1",
                                                    stopColor: "var(--dial-base)"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/general/AttendanceClock.tsx",
                                                    lineNumber: 78,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/general/AttendanceClock.tsx",
                                            lineNumber: 76,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("linearGradient", {
                                            id: "".concat(id, "-hands"),
                                            x1: "0",
                                            y1: "0",
                                            x2: "1",
                                            y2: "1",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("stop", {
                                                    offset: "0",
                                                    stopColor: "var(--hand-highlight)"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/general/AttendanceClock.tsx",
                                                    lineNumber: 81,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("stop", {
                                                    offset: "1",
                                                    stopColor: "var(--hand-ink)"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/general/AttendanceClock.tsx",
                                                    lineNumber: 82,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/general/AttendanceClock.tsx",
                                            lineNumber: 80,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/general/AttendanceClock.tsx",
                                    lineNumber: 75,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                    cx: "120",
                                    cy: "120",
                                    r: "115",
                                    fill: "url(#".concat(id, "-dial)")
                                }, void 0, false, {
                                    fileName: "[project]/components/general/AttendanceClock.tsx",
                                    lineNumber: 85,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$general$2f$AttendanceClock$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].innerRing,
                                    cx: "120",
                                    cy: "120",
                                    r: "89"
                                }, void 0, false, {
                                    fileName: "[project]/components/general/AttendanceClock.tsx",
                                    lineNumber: 86,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$general$2f$AttendanceClock$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].innerRing,
                                    cx: "120",
                                    cy: "120",
                                    r: "70"
                                }, void 0, false, {
                                    fileName: "[project]/components/general/AttendanceClock.tsx",
                                    lineNumber: 87,
                                    columnNumber: 13
                                }, this),
                                Array.from({
                                    length: 60
                                }, (_, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                                        x1: "120",
                                        y1: index % 5 === 0 ? "19" : "23",
                                        x2: "120",
                                        y2: index % 5 === 0 ? "33" : "29",
                                        transform: "rotate(".concat(index * 6, " 120 120)"),
                                        className: index % 5 === 0 ? __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$general$2f$AttendanceClock$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].hourMark : __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$general$2f$AttendanceClock$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].minuteMark
                                    }, index, false, {
                                        fileName: "[project]/components/general/AttendanceClock.tsx",
                                        lineNumber: 89,
                                        columnNumber: 15
                                    }, this)),
                                [
                                    {
                                        value: "12",
                                        x: 120,
                                        y: 55
                                    },
                                    {
                                        value: "3",
                                        x: 190,
                                        y: 126
                                    },
                                    {
                                        value: "6",
                                        x: 120,
                                        y: 197
                                    },
                                    {
                                        value: "9",
                                        x: 50,
                                        y: 126
                                    }
                                ].map((mark)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("text", {
                                        x: mark.x,
                                        y: mark.y,
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$general$2f$AttendanceClock$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].numeral,
                                        children: mark.value
                                    }, mark.value, false, {
                                        fileName: "[project]/components/general/AttendanceClock.tsx",
                                        lineNumber: 107,
                                        columnNumber: 15
                                    }, this)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("text", {
                                    x: "120",
                                    y: "82",
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$general$2f$AttendanceClock$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].dialLabel,
                                    children: "LIVE"
                                }, void 0, false, {
                                    fileName: "[project]/components/general/AttendanceClock.tsx",
                                    lineNumber: 115,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                                    x: "80",
                                    y: "156",
                                    width: "80",
                                    height: "24",
                                    rx: "6",
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$general$2f$AttendanceClock$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].dialWindow
                                }, void 0, false, {
                                    fileName: "[project]/components/general/AttendanceClock.tsx",
                                    lineNumber: 118,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("text", {
                                    x: "120",
                                    y: "173",
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$general$2f$AttendanceClock$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].dialTime,
                                    children: [
                                        hours,
                                        ":",
                                        minutes
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/general/AttendanceClock.tsx",
                                    lineNumber: 126,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("g", {
                                    className: "".concat(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$general$2f$AttendanceClock$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].hand, " ").concat(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$general$2f$AttendanceClock$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].hourHand),
                                    style: handStyle(43200),
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                            d: "M116 130 L114 81 Q120 69 126 81 L124 130 Z",
                                            fill: "url(#".concat(id, "-hands)")
                                        }, void 0, false, {
                                            fileName: "[project]/components/general/AttendanceClock.tsx",
                                            lineNumber: 133,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                            d: "M120 84 V112",
                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$general$2f$AttendanceClock$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].handInset
                                        }, void 0, false, {
                                            fileName: "[project]/components/general/AttendanceClock.tsx",
                                            lineNumber: 137,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, "hours-".concat(clock === null || clock === void 0 ? void 0 : clock.phase), true, {
                                    fileName: "[project]/components/general/AttendanceClock.tsx",
                                    lineNumber: 129,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("g", {
                                    className: "".concat(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$general$2f$AttendanceClock$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].hand, " ").concat(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$general$2f$AttendanceClock$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].minuteHand),
                                    style: handStyle(3600),
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                            d: "M117 133 L116 51 Q120 42 124 51 L123 133 Z",
                                            fill: "url(#".concat(id, "-hands)")
                                        }, void 0, false, {
                                            fileName: "[project]/components/general/AttendanceClock.tsx",
                                            lineNumber: 143,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                            d: "M120 54 V109",
                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$general$2f$AttendanceClock$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].handInset
                                        }, void 0, false, {
                                            fileName: "[project]/components/general/AttendanceClock.tsx",
                                            lineNumber: 147,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, "minutes-".concat(clock === null || clock === void 0 ? void 0 : clock.phase), true, {
                                    fileName: "[project]/components/general/AttendanceClock.tsx",
                                    lineNumber: 139,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("g", {
                                    className: "".concat(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$general$2f$AttendanceClock$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].hand, " ").concat(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$general$2f$AttendanceClock$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].secondHand),
                                    style: handStyle(60),
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                                            x1: "120",
                                            y1: "144",
                                            x2: "120",
                                            y2: "27"
                                        }, void 0, false, {
                                            fileName: "[project]/components/general/AttendanceClock.tsx",
                                            lineNumber: 153,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                            cx: "120",
                                            cy: "144",
                                            r: "5"
                                        }, void 0, false, {
                                            fileName: "[project]/components/general/AttendanceClock.tsx",
                                            lineNumber: 154,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, "seconds-".concat(clock === null || clock === void 0 ? void 0 : clock.phase), true, {
                                    fileName: "[project]/components/general/AttendanceClock.tsx",
                                    lineNumber: 149,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                    cx: "120",
                                    cy: "120",
                                    r: "7",
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$general$2f$AttendanceClock$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].pivot
                                }, void 0, false, {
                                    fileName: "[project]/components/general/AttendanceClock.tsx",
                                    lineNumber: 156,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                    cx: "120",
                                    cy: "120",
                                    r: "2.5",
                                    fill: "var(--second-ink)"
                                }, void 0, false, {
                                    fileName: "[project]/components/general/AttendanceClock.tsx",
                                    lineNumber: 157,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                    d: "M36 91 A90 90 0 0 1 172 42",
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$general$2f$AttendanceClock$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].reflection
                                }, void 0, false, {
                                    fileName: "[project]/components/general/AttendanceClock.tsx",
                                    lineNumber: 158,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/general/AttendanceClock.tsx",
                            lineNumber: 74,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/general/AttendanceClock.tsx",
                        lineNumber: 73,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$general$2f$AttendanceClock$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].windingCrown
                    }, void 0, false, {
                        fileName: "[project]/components/general/AttendanceClock.tsx",
                        lineNumber: 164,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/general/AttendanceClock.tsx",
                lineNumber: 71,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$general$2f$AttendanceClock$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].readout,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$general$2f$AttendanceClock$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].eyebrow,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$general$2f$AttendanceClock$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].liveDot
                            }, void 0, false, {
                                fileName: "[project]/components/general/AttendanceClock.tsx",
                                lineNumber: 168,
                                columnNumber: 11
                            }, this),
                            "LIVE TIME ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$general$2f$AttendanceClock$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].zone,
                                children: "EAT"
                            }, void 0, false, {
                                fileName: "[project]/components/general/AttendanceClock.tsx",
                                lineNumber: 169,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/general/AttendanceClock.tsx",
                        lineNumber: 167,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("time", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$general$2f$AttendanceClock$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].time,
                        dateTime: clock ? new Date(clock.now).toISOString() : undefined,
                        "aria-label": "".concat(time, " East Africa Time"),
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: [
                                    hours,
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$general$2f$AttendanceClock$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].colon,
                                        children: ":"
                                    }, void 0, false, {
                                        fileName: "[project]/components/general/AttendanceClock.tsx",
                                        lineNumber: 177,
                                        columnNumber: 13
                                    }, this),
                                    minutes
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/general/AttendanceClock.tsx",
                                lineNumber: 175,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$general$2f$AttendanceClock$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].seconds,
                                "aria-hidden": "true",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                                    initial: false,
                                    mode: "popLayout",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].span, {
                                        initial: reducedMotion ? false : {
                                            y: 10,
                                            opacity: 0
                                        },
                                        animate: {
                                            y: 0,
                                            opacity: 1
                                        },
                                        exit: reducedMotion ? undefined : {
                                            y: -10,
                                            opacity: 0
                                        },
                                        transition: {
                                            duration: 0.24
                                        },
                                        children: seconds
                                    }, seconds, false, {
                                        fileName: "[project]/components/general/AttendanceClock.tsx",
                                        lineNumber: 182,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/general/AttendanceClock.tsx",
                                    lineNumber: 181,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/general/AttendanceClock.tsx",
                                lineNumber: 180,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/general/AttendanceClock.tsx",
                        lineNumber: 171,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$general$2f$AttendanceClock$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].date,
                        children: date
                    }, void 0, false, {
                        fileName: "[project]/components/general/AttendanceClock.tsx",
                        lineNumber: 193,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/general/AttendanceClock.tsx",
                lineNumber: 166,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/general/AttendanceClock.tsx",
        lineNumber: 70,
        columnNumber: 5
    }, this);
}
_s(AttendanceClock, "jhNSFzrF/g3OhNYH157NciBwD84=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$utils$2f$reduced$2d$motion$2f$use$2d$reduced$2d$motion$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useReducedMotion"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useId"]
    ];
});
_c = AttendanceClock;
var _c;
__turbopack_context__.k.register(_c, "AttendanceClock");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/general/Loader.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// import React from 'react'
__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-client] (ecmascript)");
;
;
const Loader = ()=>{
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "h-screen flex flex-col items-center justify-center bg-gradient-to-br    from-gray-100 via-white to-gray-200    dark:from-gray-800 dark:via-gray-900 dark:to-gray-800",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative w-28 h-28",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                        className: "absolute inset-0 rounded-full border-4 border-blue-300/50",
                        animate: {
                            scale: [
                                1,
                                1.3,
                                1
                            ],
                            opacity: [
                                1,
                                0.5,
                                1
                            ]
                        },
                        transition: {
                            repeat: Infinity,
                            duration: 2
                        }
                    }, void 0, false, {
                        fileName: "[project]/components/general/Loader.tsx",
                        lineNumber: 12,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                        className: "absolute inset-4 rounded-full border-4 border-cyan-400/60",
                        animate: {
                            rotate: 360
                        },
                        transition: {
                            repeat: Infinity,
                            duration: 3,
                            ease: "linear"
                        }
                    }, void 0, false, {
                        fileName: "[project]/components/general/Loader.tsx",
                        lineNumber: 17,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                        className: "absolute inset-8 rounded-full border-2 border-sky-400/70",
                        animate: {
                            scale: [
                                1,
                                1.2,
                                1
                            ],
                            opacity: [
                                0.8,
                                0.4,
                                0.8
                            ]
                        },
                        transition: {
                            repeat: Infinity,
                            duration: 1.8
                        }
                    }, void 0, false, {
                        fileName: "[project]/components/general/Loader.tsx",
                        lineNumber: 22,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/components/general/Loader.tsx",
                lineNumber: 11,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-sky-600 text-sm mt-6 tracking-widest uppercase animate-pulse",
                children: "Initializing Live Attendance..."
            }, void 0, false, {
                fileName: "[project]/components/general/Loader.tsx",
                lineNumber: 28,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/components/general/Loader.tsx",
        lineNumber: 6,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_c = Loader;
const __TURBOPACK__default__export__ = Loader;
var _c;
__turbopack_context__.k.register(_c, "Loader");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/workspace/Feedback.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "EmptyState",
    ()=>EmptyState,
    "ErrorNotice",
    ()=>ErrorNotice,
    "LoadingState",
    ()=>LoadingState
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-alert.js [app-client] (ecmascript) <export default as AlertCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$inbox$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Inbox$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/inbox.js [app-client] (ecmascript) <export default as Inbox>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LoaderCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-client] (ecmascript) <export default as LoaderCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/button.tsx [app-client] (ecmascript)");
;
;
;
function EmptyState(param) {
    let { title, description, action } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "empty-state",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "empty-icon",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$inbox$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Inbox$3e$__["Inbox"], {
                    size: 26
                }, void 0, false, {
                    fileName: "[project]/components/workspace/Feedback.tsx",
                    lineNumber: 17,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/workspace/Feedback.tsx",
                lineNumber: 16,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                children: title
            }, void 0, false, {
                fileName: "[project]/components/workspace/Feedback.tsx",
                lineNumber: 19,
                columnNumber: 7
            }, this),
            description && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                children: description
            }, void 0, false, {
                fileName: "[project]/components/workspace/Feedback.tsx",
                lineNumber: 20,
                columnNumber: 23
            }, this),
            action
        ]
    }, void 0, true, {
        fileName: "[project]/components/workspace/Feedback.tsx",
        lineNumber: 15,
        columnNumber: 5
    }, this);
}
_c = EmptyState;
function ErrorNotice(param) {
    let { message, retry } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        role: "alert",
        className: "error-notice",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__["AlertCircle"], {
                size: 18
            }, void 0, false, {
                fileName: "[project]/components/workspace/Feedback.tsx",
                lineNumber: 34,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                children: message
            }, void 0, false, {
                fileName: "[project]/components/workspace/Feedback.tsx",
                lineNumber: 35,
                columnNumber: 7
            }, this),
            retry && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                type: "button",
                variant: "outline",
                size: "sm",
                onClick: retry,
                children: "Try again"
            }, void 0, false, {
                fileName: "[project]/components/workspace/Feedback.tsx",
                lineNumber: 37,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/workspace/Feedback.tsx",
        lineNumber: 33,
        columnNumber: 5
    }, this);
}
_c1 = ErrorNotice;
function LoadingState(param) {
    let { label = "Loading records…" } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        role: "status",
        className: "loading-state",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LoaderCircle$3e$__["LoaderCircle"], {
                className: "animate-spin",
                size: 21
            }, void 0, false, {
                fileName: "[project]/components/workspace/Feedback.tsx",
                lineNumber: 51,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                children: label
            }, void 0, false, {
                fileName: "[project]/components/workspace/Feedback.tsx",
                lineNumber: 52,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/workspace/Feedback.tsx",
        lineNumber: 50,
        columnNumber: 5
    }, this);
}
_c2 = LoadingState;
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "EmptyState");
__turbopack_context__.k.register(_c1, "ErrorNotice");
__turbopack_context__.k.register(_c2, "LoadingState");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/response-error.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "responseError",
    ()=>responseError
]);
function responseError(value, fallback) {
    if (typeof value === "string") return value;
    if (Array.isArray(value)) {
        const messages = value.flatMap((issue)=>issue && typeof issue.message === "string" ? [
                issue.message
            ] : []);
        if (messages.length) return messages.join("; ");
    }
    return fallback;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/workspace/usePollingResource.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "usePollingResource",
    ()=>usePollingResource
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$response$2d$error$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/response-error.ts [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
"use client";
;
;
function usePollingResource(url) {
    let interval = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 10000;
    _s();
    const [data, setData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [updatedAt, setUpdatedAt] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [revision, setRevision] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const reload = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "usePollingResource.useCallback[reload]": ()=>setRevision({
                "usePollingResource.useCallback[reload]": (value)=>value + 1
            }["usePollingResource.useCallback[reload]"])
    }["usePollingResource.useCallback[reload]"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "usePollingResource.useEffect": ()=>{
            const controller = new AbortController();
            let timer;
            const refresh = {
                "usePollingResource.useEffect.refresh": async ()=>{
                    const request = new AbortController();
                    const abort = {
                        "usePollingResource.useEffect.refresh.abort": ()=>request.abort()
                    }["usePollingResource.useEffect.refresh.abort"];
                    controller.signal.addEventListener("abort", abort, {
                        once: true
                    });
                    const deadline = setTimeout(abort, 15000);
                    setLoading(true);
                    try {
                        const response = await fetch(url, {
                            signal: request.signal,
                            cache: "no-store"
                        });
                        const result = await response.json();
                        if (!response.ok) throw new Error((0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$response$2d$error$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["responseError"])(result.error, "The connection could not be refreshed."));
                        if (!controller.signal.aborted) {
                            setData(result);
                            setUpdatedAt(new Date());
                            setError("");
                        }
                    } catch (error) {
                        if (!controller.signal.aborted) setError(request.signal.aborted ? "The connection timed out." : error instanceof Error ? error.message : "The connection could not be refreshed.");
                    } finally{
                        clearTimeout(deadline);
                        controller.signal.removeEventListener("abort", abort);
                        if (!controller.signal.aborted) {
                            setLoading(false);
                            timer = setTimeout(refresh, interval);
                        }
                    }
                }
            }["usePollingResource.useEffect.refresh"];
            void refresh();
            return ({
                "usePollingResource.useEffect": ()=>{
                    controller.abort();
                    clearTimeout(timer);
                }
            })["usePollingResource.useEffect"];
        }
    }["usePollingResource.useEffect"], [
        url,
        interval,
        revision
    ]);
    return {
        data,
        loading,
        error,
        updatedAt,
        reload
    };
}
_s(usePollingResource, "zULDblx7R+HNtOM/MXxLUrrBBa8=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/display.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "formatDate",
    ()=>formatDate,
    "formatNumber",
    ()=>formatNumber
]);
const formatNumber = function(value) {
    let digits = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 2;
    return new Intl.NumberFormat("en-GB", {
        maximumFractionDigits: digits
    }).format(Number(value));
};
const formatDate = function(value) {
    let time = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false;
    return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "Africa/Nairobi",
        ...time ? {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false
        } : {}
    }).format(new Date(value));
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/meetings/[id]/attendance/live/page.module.css [app-client] (css module)", ((__turbopack_context__) => {

__turbopack_context__.v({
  "background": "page-module__w_0ptW__background",
  "centerGlow": "page-module__w_0ptW__centerGlow",
  "content": "page-module__w_0ptW__content",
  "controls": "page-module__w_0ptW__controls",
  "fullscreenButton": "page-module__w_0ptW__fullscreenButton",
  "gauge": "page-module__w_0ptW__gauge",
  "gaugeGlow": "page-module__w_0ptW__gaugeGlow",
  "gaugeSection": "page-module__w_0ptW__gaugeSection",
  "header": "page-module__w_0ptW__header",
  "heading": "page-module__w_0ptW__heading",
  "logo": "page-module__w_0ptW__logo",
  "overlay": "page-module__w_0ptW__overlay",
  "progressbar": "page-module__w_0ptW__progressbar",
  "projection": "page-module__w_0ptW__projection",
  "quorumGlow": "page-module__w_0ptW__quorumGlow",
  "quorumMessage": "page-module__w_0ptW__quorumMessage",
  "quorumMet": "page-module__w_0ptW__quorumMet",
  "stat": "page-module__w_0ptW__stat",
  "stats": "page-module__w_0ptW__stats",
  "welcome": "page-module__w_0ptW__welcome",
  "welcomeMessage": "page-module__w_0ptW__welcomeMessage",
  "welcomeWave": "page-module__w_0ptW__welcomeWave",
  "welcomes": "page-module__w_0ptW__welcomes",
});
}),
"[project]/app/meetings/[id]/attendance/live/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>LiveAttendancePage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/image.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/components/AnimatePresence/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$utils$2f$reduced$2d$motion$2f$use$2d$reduced$2d$motion$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/utils/reduced-motion/use-reduced-motion.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$circular$2d$progressbar$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-circular-progressbar/dist/index.esm.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$auth$2f$AuthProvider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/auth/AuthProvider.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$general$2f$AttendanceClock$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/general/AttendanceClock.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$general$2f$Loader$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/general/Loader.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$general$2f$theme$2d$toggle$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/general/theme-toggle.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$workspace$2f$Feedback$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/workspace/Feedback.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$workspace$2f$usePollingResource$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/workspace/usePollingResource.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$display$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/display.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$meetings$2f5b$id$5d2f$attendance$2f$live$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/app/meetings/[id]/attendance/live/page.module.css [app-client] (css module)");
;
var _s = __turbopack_context__.k.signature();
"use client";
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
;
;
;
function LiveAttendancePage() {
    _s();
    const { id } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useParams"])();
    const { user, can } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$auth$2f$AuthProvider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"])();
    const { data, error, reload } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$workspace$2f$usePollingResource$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePollingResource"])("/api/public/meetings/".concat(encodeURIComponent(id), "/attendance"), 3000);
    const container = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const reducedMotion = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$utils$2f$reduced$2d$motion$2f$use$2d$reduced$2d$motion$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useReducedMotion"])();
    const [fullscreen, setFullscreen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [fullscreenError, setFullscreenError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [newArrivals, setNewArrivals] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const canViewAttendees = !!user && (user.superAdmin || user.meetingIds.includes(id)) && (can("attendance.view") || can("reports.attendance"));
    // Names stay behind the existing permission-protected endpoint. Public
    // projectors receive only the aggregate figures used by the gauge and cards.
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "LiveAttendancePage.useEffect": ()=>{
            setNewArrivals([]);
            if (!canViewAttendees) return;
            const controller = new AbortController();
            const welcomeTimers = new Set();
            let pollTimer;
            let previousIds = null;
            let denied = false;
            const refreshWelcomes = {
                "LiveAttendancePage.useEffect.refreshWelcomes": async ()=>{
                    const request = new AbortController();
                    const abortRequest = {
                        "LiveAttendancePage.useEffect.refreshWelcomes.abortRequest": ()=>request.abort()
                    }["LiveAttendancePage.useEffect.refreshWelcomes.abortRequest"];
                    controller.signal.addEventListener("abort", abortRequest, {
                        once: true
                    });
                    const deadline = setTimeout(abortRequest, 15000);
                    try {
                        const response = await fetch("/api/meetings/".concat(encodeURIComponent(id), "/attendance"), {
                            cache: "no-store",
                            signal: request.signal
                        });
                        if ([
                            401,
                            403
                        ].includes(response.status)) {
                            denied = true;
                            if (!controller.signal.aborted) setNewArrivals([]);
                            return;
                        }
                        if (!response.ok) return;
                        const result = await response.json();
                        if (controller.signal.aborted || !Array.isArray(result.attendance)) return;
                        const attendance = result.attendance.filter({
                            "LiveAttendancePage.useEffect.refreshWelcomes.attendance": (arrival)=>typeof arrival.id === "string" && typeof arrival.shareholderName === "string"
                        }["LiveAttendancePage.useEffect.refreshWelcomes.attendance"]);
                        if (previousIds) {
                            const lastIds = previousIds;
                            const arrivals = attendance.filter({
                                "LiveAttendancePage.useEffect.refreshWelcomes.arrivals": (arrival)=>!lastIds.has(arrival.id)
                            }["LiveAttendancePage.useEffect.refreshWelcomes.arrivals"]);
                            if (arrivals.length) {
                                setNewArrivals({
                                    "LiveAttendancePage.useEffect.refreshWelcomes": (current)=>[
                                            ...current,
                                            ...arrivals
                                        ]
                                }["LiveAttendancePage.useEffect.refreshWelcomes"]);
                                const timer = setTimeout({
                                    "LiveAttendancePage.useEffect.refreshWelcomes.timer": ()=>{
                                        welcomeTimers.delete(timer);
                                        setNewArrivals({
                                            "LiveAttendancePage.useEffect.refreshWelcomes.timer": (current)=>current.filter({
                                                    "LiveAttendancePage.useEffect.refreshWelcomes.timer": (arrival)=>!arrivals.includes(arrival)
                                                }["LiveAttendancePage.useEffect.refreshWelcomes.timer"])
                                        }["LiveAttendancePage.useEffect.refreshWelcomes.timer"]);
                                    }
                                }["LiveAttendancePage.useEffect.refreshWelcomes.timer"], 4200);
                                welcomeTimers.add(timer);
                            }
                        }
                        previousIds = new Set(attendance.map({
                            "LiveAttendancePage.useEffect.refreshWelcomes": (arrival)=>arrival.id
                        }["LiveAttendancePage.useEffect.refreshWelcomes"]));
                    } catch (e) {
                    // An interrupted private request must not affect the public totals.
                    } finally{
                        clearTimeout(deadline);
                        controller.signal.removeEventListener("abort", abortRequest);
                        if (!controller.signal.aborted && !denied) pollTimer = setTimeout(refreshWelcomes, 3000);
                    }
                }
            }["LiveAttendancePage.useEffect.refreshWelcomes"];
            void refreshWelcomes();
            return ({
                "LiveAttendancePage.useEffect": ()=>{
                    controller.abort();
                    clearTimeout(pollTimer);
                    welcomeTimers.forEach(clearTimeout);
                }
            })["LiveAttendancePage.useEffect"];
        }
    }["LiveAttendancePage.useEffect"], [
        id,
        canViewAttendees,
        user === null || user === void 0 ? void 0 : user.id
    ]);
    const toggleFullscreen = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "LiveAttendancePage.useCallback[toggleFullscreen]": async ()=>{
            try {
                if (document.fullscreenElement) await document.exitFullscreen();
                else {
                    var _container_current;
                    if (!((_container_current = container.current) === null || _container_current === void 0 ? void 0 : _container_current.requestFullscreen)) throw new Error("Fullscreen is unavailable.");
                    await container.current.requestFullscreen();
                }
                setFullscreenError("");
            } catch (e) {
                setFullscreenError("Fullscreen could not be opened. You can use the browser's fullscreen control instead.");
            }
        }
    }["LiveAttendancePage.useCallback[toggleFullscreen]"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "LiveAttendancePage.useEffect": ()=>{
            const changed = {
                "LiveAttendancePage.useEffect.changed": ()=>setFullscreen(!!container.current && document.fullscreenElement === container.current)
            }["LiveAttendancePage.useEffect.changed"];
            const keyboard = {
                "LiveAttendancePage.useEffect.keyboard": (event)=>{
                    if (event.key.toLowerCase() === "f" && !event.ctrlKey && !event.altKey && !event.metaKey && !event.repeat && !(event.target instanceof HTMLElement && event.target.closest("input, textarea, select, button, [contenteditable]"))) {
                        event.preventDefault();
                        void toggleFullscreen();
                    }
                }
            }["LiveAttendancePage.useEffect.keyboard"];
            document.addEventListener("fullscreenchange", changed);
            document.addEventListener("keydown", keyboard);
            return ({
                "LiveAttendancePage.useEffect": ()=>{
                    document.removeEventListener("fullscreenchange", changed);
                    document.removeEventListener("keydown", keyboard);
                }
            })["LiveAttendancePage.useEffect"];
        }
    }["LiveAttendancePage.useEffect"], [
        toggleFullscreen
    ]);
    const percentage = data && data.totalShares > 0 ? Math.max(0, Math.min(100, data.attendedShares / data.totalShares * 100)) : 0;
    const quorumMet = !!data && data.totalShares > 0 && data.quorumMet;
    const gaugeColor = quorumMet ? "#02a337" : "#0d45ff";
    const percentageText = "".concat(percentage.toFixed(percentage < 100 ? percentage < 34 ? 2 : 1 : 0), "%");
    if (!data && !error) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$general$2f$Loader$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
        fileName: "[project]/app/meetings/[id]/attendance/live/page.tsx",
        lineNumber: 156,
        columnNumber: 31
    }, this);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: container,
        className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$meetings$2f5b$id$5d2f$attendance$2f$live$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].projection,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$meetings$2f5b$id$5d2f$attendance$2f$live$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].background,
                "aria-hidden": "true"
            }, void 0, false, {
                fileName: "[project]/app/meetings/[id]/attendance/live/page.tsx",
                lineNumber: 160,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$meetings$2f5b$id$5d2f$attendance$2f$live$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].overlay,
                "aria-hidden": "true"
            }, void 0, false, {
                fileName: "[project]/app/meetings/[id]/attendance/live/page.tsx",
                lineNumber: 161,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                initial: reducedMotion ? false : {
                    opacity: 0
                },
                animate: {
                    opacity: 1
                },
                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$meetings$2f5b$id$5d2f$attendance$2f$live$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].content,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$meetings$2f5b$id$5d2f$attendance$2f$live$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].header,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$meetings$2f5b$id$5d2f$attendance$2f$live$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].logo,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    src: "/logo.svg",
                                    alt: "Lucy",
                                    width: 150,
                                    height: 150,
                                    priority: true
                                }, void 0, false, {
                                    fileName: "[project]/app/meetings/[id]/attendance/live/page.tsx",
                                    lineNumber: 169,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/meetings/[id]/attendance/live/page.tsx",
                                lineNumber: 168,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$meetings$2f5b$id$5d2f$attendance$2f$live$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].heading,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                        lang: "am",
                                        children: "የአቴንዳንስ መከታተያ (ቀጥታ)"
                                    }, void 0, false, {
                                        fileName: "[project]/app/meetings/[id]/attendance/live/page.tsx",
                                        lineNumber: 172,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        lang: "am",
                                        children: "የአሁን ሰዓት ባለአክሲዮኖች ተሳትፎ ዕይታ"
                                    }, void 0, false, {
                                        fileName: "[project]/app/meetings/[id]/attendance/live/page.tsx",
                                        lineNumber: 173,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/meetings/[id]/attendance/live/page.tsx",
                                lineNumber: 171,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$meetings$2f5b$id$5d2f$attendance$2f$live$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].controls,
                                children: [
                                    fullscreen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$general$2f$theme$2d$toggle$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ThemeToggle"], {}, void 0, false, {
                                        fileName: "[project]/app/meetings/[id]/attendance/live/page.tsx",
                                        lineNumber: 176,
                                        columnNumber: 28
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: ()=>void toggleFullscreen(),
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$meetings$2f5b$id$5d2f$attendance$2f$live$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fullscreenButton,
                                        "aria-label": fullscreen ? "Exit fullscreen" : "Enter fullscreen",
                                        title: fullscreen ? "Exit fullscreen (Esc)" : "Enter fullscreen (F)",
                                        children: fullscreen ? "Esc" : "F"
                                    }, void 0, false, {
                                        fileName: "[project]/app/meetings/[id]/attendance/live/page.tsx",
                                        lineNumber: 177,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/meetings/[id]/attendance/live/page.tsx",
                                lineNumber: 175,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/meetings/[id]/attendance/live/page.tsx",
                        lineNumber: 167,
                        columnNumber: 9
                    }, this),
                    (error || fullscreenError) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$workspace$2f$Feedback$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ErrorNotice"], {
                        message: error ? "".concat(error, " Reconnecting automatically; the last received figures remain visible.") : fullscreenError,
                        retry: error ? reload : undefined
                    }, void 0, false, {
                        fileName: "[project]/app/meetings/[id]/attendance/live/page.tsx",
                        lineNumber: 190,
                        columnNumber: 11
                    }, this),
                    data && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$meetings$2f5b$id$5d2f$attendance$2f$live$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].gaugeSection,
                                "aria-label": "Live attendance",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$meetings$2f5b$id$5d2f$attendance$2f$live$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].gauge,
                                        initial: reducedMotion ? false : {
                                            opacity: 0,
                                            scale: 0.8
                                        },
                                        animate: {
                                            opacity: 1,
                                            scale: 1
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$general$2f$AttendanceClock$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                                                fileName: "[project]/app/meetings/[id]/attendance/live/page.tsx",
                                                lineNumber: 205,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                                className: "".concat(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$meetings$2f5b$id$5d2f$attendance$2f$live$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].gaugeGlow, " ").concat(quorumMet ? __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$meetings$2f5b$id$5d2f$attendance$2f$live$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].quorumGlow : ""),
                                                animate: reducedMotion ? undefined : {
                                                    rotate: 360
                                                },
                                                transition: {
                                                    repeat: Infinity,
                                                    duration: 20,
                                                    ease: "linear"
                                                },
                                                "aria-hidden": "true"
                                            }, void 0, false, {
                                                fileName: "[project]/app/meetings/[id]/attendance/live/page.tsx",
                                                lineNumber: 206,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                role: "img",
                                                "aria-label": "".concat(percentageText, " of shares attending; quorum target ").concat(data.quorumPct, " percent"),
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$circular$2d$progressbar$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CircularProgressbar"], {
                                                    value: percentage,
                                                    text: percentageText,
                                                    styles: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$circular$2d$progressbar$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["buildStyles"])({
                                                        textColor: gaugeColor,
                                                        pathColor: gaugeColor,
                                                        trailColor: "#a1a4ad",
                                                        textSize: "18px",
                                                        strokeLinecap: "butt"
                                                    }),
                                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$meetings$2f5b$id$5d2f$attendance$2f$live$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].progressbar
                                                }, void 0, false, {
                                                    fileName: "[project]/app/meetings/[id]/attendance/live/page.tsx",
                                                    lineNumber: 216,
                                                    columnNumber: 17
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/meetings/[id]/attendance/live/page.tsx",
                                                lineNumber: 212,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$meetings$2f5b$id$5d2f$attendance$2f$live$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].centerGlow,
                                                animate: reducedMotion ? undefined : {
                                                    opacity: [
                                                        0.1,
                                                        0.9,
                                                        0.1
                                                    ]
                                                },
                                                transition: {
                                                    repeat: Infinity,
                                                    duration: 3
                                                },
                                                "aria-hidden": "true"
                                            }, void 0, false, {
                                                fileName: "[project]/app/meetings/[id]/attendance/live/page.tsx",
                                                lineNumber: 229,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/meetings/[id]/attendance/live/page.tsx",
                                        lineNumber: 200,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "".concat(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$meetings$2f5b$id$5d2f$attendance$2f$live$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].quorumMessage, " ").concat(quorumMet ? __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$meetings$2f5b$id$5d2f$attendance$2f$live$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].quorumMet : ""),
                                        children: quorumMet ? "Meeting Quorum Reached" : "Waiting for more Attendees ..."
                                    }, void 0, false, {
                                        fileName: "[project]/app/meetings/[id]/attendance/live/page.tsx",
                                        lineNumber: 236,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/meetings/[id]/attendance/live/page.tsx",
                                lineNumber: 199,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$meetings$2f5b$id$5d2f$attendance$2f$live$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].welcomes,
                                "aria-live": "polite",
                                "aria-atomic": "false",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                                    children: canViewAttendees && newArrivals.map((arrival)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                            initial: {
                                                opacity: 0,
                                                y: 30,
                                                scale: 0.85
                                            },
                                            animate: reducedMotion ? {
                                                opacity: 1,
                                                y: 0,
                                                scale: 1
                                            } : {
                                                opacity: [
                                                    0,
                                                    1,
                                                    1,
                                                    0
                                                ],
                                                y: [
                                                    -10,
                                                    -60,
                                                    -120,
                                                    -200
                                                ]
                                            },
                                            exit: {
                                                opacity: 0
                                            },
                                            transition: {
                                                duration: reducedMotion ? 0 : 4.2
                                            },
                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$meetings$2f5b$id$5d2f$attendance$2f$live$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].welcome,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$meetings$2f5b$id$5d2f$attendance$2f$live$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].welcomeWave,
                                                    viewBox: "0 0 200 80",
                                                    "aria-hidden": "true",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].path, {
                                                        fill: "rgba(255,255,255,0.1)",
                                                        stroke: "rgba(255,255,255,0.3)",
                                                        strokeWidth: "2",
                                                        animate: reducedMotion ? undefined : {
                                                            d: [
                                                                "M10,20 Q50,0 100,20 T190,20",
                                                                "M10,30 Q50,10 100,25 T190,35",
                                                                "M10,20 Q50,0 100,20 T190,20"
                                                            ]
                                                        },
                                                        d: "M10,20 Q50,0 100,20 T190,20",
                                                        transition: {
                                                            repeat: Infinity,
                                                            duration: 4
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/meetings/[id]/attendance/live/page.tsx",
                                                        lineNumber: 255,
                                                        columnNumber: 21
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/app/meetings/[id]/attendance/live/page.tsx",
                                                    lineNumber: 254,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$meetings$2f5b$id$5d2f$attendance$2f$live$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].welcomeMessage,
                                                    children: [
                                                        "Welcome ",
                                                        arrival.shareholderName,
                                                        "!"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/meetings/[id]/attendance/live/page.tsx",
                                                    lineNumber: 268,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, arrival.id, true, {
                                            fileName: "[project]/app/meetings/[id]/attendance/live/page.tsx",
                                            lineNumber: 244,
                                            columnNumber: 17
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/app/meetings/[id]/attendance/live/page.tsx",
                                    lineNumber: 242,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/meetings/[id]/attendance/live/page.tsx",
                                lineNumber: 241,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].section, {
                                initial: reducedMotion ? false : {
                                    opacity: 0,
                                    y: 20
                                },
                                animate: {
                                    opacity: 1,
                                    y: 0
                                },
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$meetings$2f5b$id$5d2f$attendance$2f$live$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].stats,
                                "aria-label": "Attendance totals",
                                children: [
                                    {
                                        label: "Total Shares",
                                        value: data.totalShares
                                    },
                                    {
                                        label: "Shareholders",
                                        value: data.totalShareholdersCount
                                    },
                                    {
                                        label: "Attendees",
                                        value: data.attendeesCount
                                    },
                                    {
                                        label: "Attendee Shares",
                                        value: data.attendedShares
                                    },
                                    {
                                        label: "Quorum Shares",
                                        value: data.required
                                    }
                                ].map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                        whileHover: reducedMotion ? undefined : {
                                            scale: 1.03
                                        },
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$meetings$2f5b$id$5d2f$attendance$2f$live$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].stat,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                children: item.label
                                            }, void 0, false, {
                                                fileName: "[project]/app/meetings/[id]/attendance/live/page.tsx",
                                                lineNumber: 292,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$display$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatNumber"])(item.value, 3)
                                            }, void 0, false, {
                                                fileName: "[project]/app/meetings/[id]/attendance/live/page.tsx",
                                                lineNumber: 293,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, item.label, true, {
                                        fileName: "[project]/app/meetings/[id]/attendance/live/page.tsx",
                                        lineNumber: 287,
                                        columnNumber: 15
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/app/meetings/[id]/attendance/live/page.tsx",
                                lineNumber: 274,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true)
                ]
            }, void 0, true, {
                fileName: "[project]/app/meetings/[id]/attendance/live/page.tsx",
                lineNumber: 162,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/meetings/[id]/attendance/live/page.tsx",
        lineNumber: 159,
        columnNumber: 5
    }, this);
}
_s(LiveAttendancePage, "te8eWTb8D8fWEzPyf6SIEkTgdRY=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useParams"],
        __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$auth$2f$AuthProvider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"],
        __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$workspace$2f$usePollingResource$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePollingResource"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$utils$2f$reduced$2d$motion$2f$use$2d$reduced$2d$motion$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useReducedMotion"]
    ];
});
_c = LiveAttendancePage;
var _c;
__turbopack_context__.k.register(_c, "LiveAttendancePage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_1a2e4a9d._.js.map