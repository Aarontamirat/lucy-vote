"use client";

import { useEffect, useId, useState, type CSSProperties } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import styles from "./AttendanceClock.module.css";

const timeFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Africa/Nairobi",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});
const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Africa/Nairobi",
  weekday: "short",
  day: "2-digit",
  month: "short",
});

// Nairobi uses UTC+3 year-round. Fractions keep all three hands in continuous motion.
function secondsInDay(timestamp: number) {
  return (((timestamp / 1000 + 3 * 3600) % 86400) + 86400) % 86400;
}

export default function AttendanceClock() {
  const [clock, setClock] = useState<{ now: number; phase: number } | null>(
    null,
  );
  const reducedMotion = useReducedMotion();
  const id = useId().replace(/:/g, "");

  useEffect(() => {
    const sync = () => {
      const now = Date.now();
      setClock({ now, phase: now });
    };
    sync();
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const now = Date.now();
      setClock((previous) => ({ now, phase: previous?.phase ?? now }));
      timer = setTimeout(tick, 1000 - (Date.now() % 1000));
    };
    timer = setTimeout(tick, 1000 - (Date.now() % 1000));
    const onVisibility = () => {
      if (!document.hidden) sync();
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", sync);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", sync);
    };
  }, []);

  const time = clock ? timeFormatter.format(clock.now) : "—:—:—";
  const [hours, minutes, seconds] = time.split(":");
  const date = clock ? dateFormatter.format(clock.now) : "East Africa Time";
  const phase = clock ? secondsInDay(clock.phase) : 0;
  const current = clock ? secondsInDay(clock.now) : 0;
  const handStyle = (period: number): CSSProperties =>
    ({
      "--hand-delay": `${-(phase % period)}s`,
      "--hand-angle": `${((current % period) / period) * 360}deg`,
    }) as CSSProperties;

  return (
    <aside className={styles.clock} aria-label="Live clock, East Africa Time">
      <div className={styles.watch} aria-hidden="true">
        <div className={styles.halo} />
        <div className={styles.bezel}>
          <svg className={styles.face} viewBox="0 0 240 240" focusable="false">
            <defs>
              <radialGradient id={`${id}-dial`} cx="36%" cy="24%" r="80%">
                <stop offset="0" stopColor="var(--dial-highlight)" />
                <stop offset="1" stopColor="var(--dial-base)" />
              </radialGradient>
              <linearGradient id={`${id}-hands`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="var(--hand-highlight)" />
                <stop offset="1" stopColor="var(--hand-ink)" />
              </linearGradient>
            </defs>
            <circle cx="120" cy="120" r="115" fill={`url(#${id}-dial)`} />
            <circle className={styles.innerRing} cx="120" cy="120" r="89" />
            <circle className={styles.innerRing} cx="120" cy="120" r="70" />
            {Array.from({ length: 60 }, (_, index) => (
              <line
                key={index}
                x1="120"
                y1={index % 5 === 0 ? "19" : "23"}
                x2="120"
                y2={index % 5 === 0 ? "33" : "29"}
                transform={`rotate(${index * 6} 120 120)`}
                className={
                  index % 5 === 0 ? styles.hourMark : styles.minuteMark
                }
              />
            ))}
            {[
              { value: "12", x: 120, y: 55 },
              { value: "3", x: 190, y: 126 },
              { value: "6", x: 120, y: 197 },
              { value: "9", x: 50, y: 126 },
            ].map((mark) => (
              <text
                key={mark.value}
                x={mark.x}
                y={mark.y}
                className={styles.numeral}>
                {mark.value}
              </text>
            ))}
            <text x="120" y="82" className={styles.dialLabel}>
              LIVE
            </text>
            <rect
              x="80"
              y="156"
              width="80"
              height="24"
              rx="6"
              className={styles.dialWindow}
            />
            <text x="120" y="173" className={styles.dialTime}>
              {hours}:{minutes}
            </text>
            <g
              key={`hours-${clock?.phase}`}
              className={`${styles.hand} ${styles.hourHand}`}
              style={handStyle(43200)}>
              <path
                d="M116 130 L114 81 Q120 69 126 81 L124 130 Z"
                fill={`url(#${id}-hands)`}
              />
              <path d="M120 84 V112" className={styles.handInset} />
            </g>
            <g
              key={`minutes-${clock?.phase}`}
              className={`${styles.hand} ${styles.minuteHand}`}
              style={handStyle(3600)}>
              <path
                d="M117 133 L116 51 Q120 42 124 51 L123 133 Z"
                fill={`url(#${id}-hands)`}
              />
              <path d="M120 54 V109" className={styles.handInset} />
            </g>
            <g
              key={`seconds-${clock?.phase}`}
              className={`${styles.hand} ${styles.secondHand}`}
              style={handStyle(60)}>
              <line x1="120" y1="144" x2="120" y2="27" />
              <circle cx="120" cy="144" r="5" />
            </g>
            <circle cx="120" cy="120" r="7" className={styles.pivot} />
            <circle cx="120" cy="120" r="2.5" fill="var(--second-ink)" />
            <path
              d="M36 91 A90 90 0 0 1 172 42"
              className={styles.reflection}
            />
          </svg>
        </div>
        <span className={styles.windingCrown} />
      </div>
      <div className={styles.readout}>
        <div className={styles.eyebrow}>
          <span className={styles.liveDot} />
          LIVE TIME <span className={styles.zone}>EAT</span>
        </div>
        <time
          className={styles.time}
          dateTime={clock ? new Date(clock.now).toISOString() : undefined}
          aria-label={`${time} East Africa Time`}>
          <span>
            {hours}
            <span className={styles.colon}>:</span>
            {minutes}
          </span>
          <span className={styles.seconds} aria-hidden="true">
            <AnimatePresence initial={false} mode="popLayout">
              <motion.span
                key={seconds}
                initial={reducedMotion ? false : { y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={reducedMotion ? undefined : { y: -10, opacity: 0 }}
                transition={{ duration: 0.24 }}>
                {seconds}
              </motion.span>
            </AnimatePresence>
          </span>
        </time>
        <div className={styles.date}>{date}</div>
      </div>
    </aside>
  );
}
