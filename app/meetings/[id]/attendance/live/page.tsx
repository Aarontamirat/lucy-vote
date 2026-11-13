"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { useAuth } from "@/components/auth/AuthProvider";
import AttendanceClock from "@/components/general/AttendanceClock";
import Loader from "@/components/general/Loader";
import { ThemeToggle } from "@/components/general/theme-toggle";
import { ErrorNotice } from "@/components/workspace/Feedback";
import { usePollingResource } from "@/components/workspace/usePollingResource";
import { formatNumber } from "@/lib/display";
import styles from "./page.module.css";

type AttendanceStats = {
  meetingTitle: string;
  meetingStatus: string;
  totalShares: number;
  attendedShares: number;
  attendeesCount: number;
  totalShareholdersCount: number;
  quorumPct: number;
  required: number;
  quorumMet: boolean;
};

type Arrival = { id: string; shareholderName: string };

export default function LiveAttendancePage() {
  const { id } = useParams<{ id: string }>();
  const { user, can } = useAuth();
  const { data, error, reload } = usePollingResource<AttendanceStats>(
    `/api/public/meetings/${encodeURIComponent(id)}/attendance`,
    3000,
  );
  const container = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const [fullscreen, setFullscreen] = useState(false);
  const [fullscreenError, setFullscreenError] = useState("");
  const [newArrivals, setNewArrivals] = useState<Arrival[]>([]);
  const canViewAttendees = !!user &&
    (user.superAdmin || user.meetingIds.includes(id)) &&
    (can("attendance.view") || can("reports.attendance"));

  // Names stay behind the existing permission-protected endpoint. Public
  // projectors receive only the aggregate figures used by the gauge and cards.
  useEffect(() => {
    setNewArrivals([]);
    if (!canViewAttendees) return;
    const controller = new AbortController();
    const welcomeTimers = new Set<ReturnType<typeof setTimeout>>();
    let pollTimer: ReturnType<typeof setTimeout>;
    let previousIds: Set<string> | null = null;
    let denied = false;

    const refreshWelcomes = async () => {
      const request = new AbortController();
      const abortRequest = () => request.abort();
      controller.signal.addEventListener("abort", abortRequest, { once: true });
      const deadline = setTimeout(abortRequest, 15000);
      try {
        const response = await fetch(
          `/api/meetings/${encodeURIComponent(id)}/attendance`,
          { cache: "no-store", signal: request.signal },
        );
        if ([401, 403].includes(response.status)) {
          denied = true;
          if (!controller.signal.aborted) setNewArrivals([]);
          return;
        }
        if (!response.ok) return;
        const result: { attendance?: Arrival[] } = await response.json();
        if (controller.signal.aborted || !Array.isArray(result.attendance)) return;
        const attendance = result.attendance.filter(
          (arrival) => typeof arrival.id === "string" &&
            typeof arrival.shareholderName === "string",
        );
        if (previousIds) {
          const lastIds = previousIds;
          const arrivals = attendance.filter((arrival) => !lastIds.has(arrival.id));
          if (arrivals.length) {
            setNewArrivals((current) => [...current, ...arrivals]);
            const timer = setTimeout(() => {
              welcomeTimers.delete(timer);
              setNewArrivals((current) => current.filter((arrival) => !arrivals.includes(arrival)));
            }, 4200);
            welcomeTimers.add(timer);
          }
        }
        previousIds = new Set(attendance.map((arrival) => arrival.id));
      } catch {
        // An interrupted private request must not affect the public totals.
      } finally {
        clearTimeout(deadline);
        controller.signal.removeEventListener("abort", abortRequest);
        if (!controller.signal.aborted && !denied)
          pollTimer = setTimeout(refreshWelcomes, 3000);
      }
    };
    void refreshWelcomes();
    return () => {
      controller.abort();
      clearTimeout(pollTimer);
      welcomeTimers.forEach(clearTimeout);
    };
  }, [id, canViewAttendees, user?.id]);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else {
        if (!container.current?.requestFullscreen)
          throw new Error("Fullscreen is unavailable.");
        await container.current.requestFullscreen();
      }
      setFullscreenError("");
    } catch {
      setFullscreenError(
        "Fullscreen could not be opened. You can use the browser's fullscreen control instead.",
      );
    }
  }, []);

  useEffect(() => {
    const changed = () => setFullscreen(!!container.current && document.fullscreenElement === container.current);
    const keyboard = (event: KeyboardEvent) => {
      if (
        event.key.toLowerCase() === "f" &&
        !event.ctrlKey && !event.altKey && !event.metaKey && !event.repeat &&
        !(event.target instanceof HTMLElement && event.target.closest(
          "input, textarea, select, button, [contenteditable]",
        ))
      ) {
        event.preventDefault();
        void toggleFullscreen();
      }
    };
    document.addEventListener("fullscreenchange", changed);
    document.addEventListener("keydown", keyboard);
    return () => {
      document.removeEventListener("fullscreenchange", changed);
      document.removeEventListener("keydown", keyboard);
    };
  }, [toggleFullscreen]);

  const percentage = data && data.totalShares > 0
    ? Math.max(0, Math.min(100, (data.attendedShares / data.totalShares) * 100))
    : 0;
  const quorumMet = !!data && data.totalShares > 0 && data.quorumMet;
  const gaugeColor = quorumMet ? "#02a337" : "#0d45ff";
  const percentageText = `${percentage.toFixed(percentage < 100 ? (percentage < 34 ? 2 : 1) : 0)}%`;

  if (!data && !error) return <Loader />;

  return (
    <div ref={container} className={styles.projection}>
      <div className={styles.background} aria-hidden="true" />
      <div className={styles.overlay} aria-hidden="true" />
      <motion.div
        initial={reducedMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        className={styles.content}
      >
        <header className={styles.header}>
          <div className={styles.logo}>
            <Image src="/logo.svg" alt="Lucy" width={150} height={150} priority />
          </div>
          <div className={styles.heading}>
            <h1 lang="am">የአቴንዳንስ መከታተያ (ቀጥታ)</h1>
            <p lang="am">የአሁን ሰዓት ባለአክሲዮኖች ተሳትፎ ዕይታ</p>
          </div>
          <div className={styles.controls}>
            {fullscreen && <ThemeToggle />}
            <button
              type="button"
              onClick={() => void toggleFullscreen()}
              className={styles.fullscreenButton}
              aria-label={fullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              title={fullscreen ? "Exit fullscreen (Esc)" : "Enter fullscreen (F)"}
            >
              {fullscreen ? "Esc" : "F"}
            </button>
          </div>
        </header>

        {(error || fullscreenError) && (
          <ErrorNotice
            message={error
              ? `${error} Reconnecting automatically; the last received figures remain visible.`
              : fullscreenError}
            retry={error ? reload : undefined}
          />
        )}

        {data && <>
          <section className={styles.gaugeSection} aria-label="Live attendance">
            <motion.div
              className={styles.gauge}
              initial={reducedMotion ? false : { opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <AttendanceClock />
              <motion.div
                className={`${styles.gaugeGlow} ${quorumMet ? styles.quorumGlow : ""}`}
                animate={reducedMotion ? undefined : { rotate: 360 }}
                transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                aria-hidden="true"
              />
              <div
                role="img"
                aria-label={`${percentageText} of shares attending; quorum target ${data.quorumPct} percent`}
              >
                <CircularProgressbar
                  value={percentage}
                  text={percentageText}
                  styles={buildStyles({
                    textColor: gaugeColor,
                    pathColor: gaugeColor,
                    trailColor: "#a1a4ad",
                    textSize: "18px",
                    strokeLinecap: "butt",
                  })}
                  className={styles.progressbar}
                />
              </div>
              <motion.div
                className={styles.centerGlow}
                animate={reducedMotion ? undefined : { opacity: [0.1, 0.9, 0.1] }}
                transition={{ repeat: Infinity, duration: 3 }}
                aria-hidden="true"
              />
            </motion.div>
            <p className={`${styles.quorumMessage} ${quorumMet ? styles.quorumMet : ""}`}>
              {quorumMet ? "Meeting Quorum Reached" : "Waiting for more Attendees ..."}
            </p>
          </section>

          <div className={styles.welcomes} aria-live="polite" aria-atomic="false">
            <AnimatePresence>
              {canViewAttendees && newArrivals.map((arrival) => (
                <motion.div
                  key={arrival.id}
                  initial={{ opacity: 0, y: 30, scale: 0.85 }}
                  animate={reducedMotion
                    ? { opacity: 1, y: 0, scale: 1 }
                    : { opacity: [0, 1, 1, 0], y: [-10, -60, -120, -200] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reducedMotion ? 0 : 4.2 }}
                  className={styles.welcome}
                >
                  <svg className={styles.welcomeWave} viewBox="0 0 200 80" aria-hidden="true">
                    <motion.path
                      fill="rgba(255,255,255,0.1)"
                      stroke="rgba(255,255,255,0.3)"
                      strokeWidth="2"
                      animate={reducedMotion ? undefined : { d: [
                        "M10,20 Q50,0 100,20 T190,20",
                        "M10,30 Q50,10 100,25 T190,35",
                        "M10,20 Q50,0 100,20 T190,20",
                      ] }}
                      d="M10,20 Q50,0 100,20 T190,20"
                      transition={{ repeat: Infinity, duration: 4 }}
                    />
                  </svg>
                  <div className={styles.welcomeMessage}>Welcome {arrival.shareholderName}!</div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <motion.section
            initial={reducedMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.stats}
            aria-label="Attendance totals"
          >
            {[
              { label: "Total Shares", value: data.totalShares },
              { label: "Shareholders", value: data.totalShareholdersCount },
              { label: "Attendees", value: data.attendeesCount },
              { label: "Attendee Shares", value: data.attendedShares },
              { label: "Quorum Shares", value: data.required },
            ].map((item) => (
              <motion.div
                key={item.label}
                whileHover={reducedMotion ? undefined : { scale: 1.03 }}
                className={styles.stat}
              >
                <p>{item.label}</p>
                <strong>{formatNumber(item.value, 3)}</strong>
              </motion.div>
            ))}
          </motion.section>
        </>}
      </motion.div>
    </div>
  );
}
