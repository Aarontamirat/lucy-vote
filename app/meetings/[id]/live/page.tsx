"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import {
  Crown,
  Maximize2,
  Minimize2,
  Settings2,
  Vote,
  Wifi,
  WifiOff,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import { ThemeToggle } from "@/components/general/theme-toggle";
import type { RankedResult } from "@/lib/election";
import {
  fitNomineeLeaderboard,
  orderNomineeBoard,
} from "@/lib/projection-layout";

type LiveData = {
  meetingTitle: string;
  meetingStatus: string;
  results: RankedResult[];
  totalSharesAttended: number;
  ballotsCast: number;
  winnerCount: number | null;
  meetingFirstPassers: number | null;
  meetingSecondPassers: number | null;
  votingMode: "STANDARD" | "GROUPED";
  configurationError: string | null;
};
type Language = "am" | "en" | "both";

// A nominee keeps the same color when their rank changes. Each pair has a
// darker light-theme ink and a brighter dark-theme ink for projection contrast.
const NOMINEE_COLORS = [
  ["#2463d5", "#76a9ff"],
  ["#087f72", "#54dbc2"],
  ["#8454c5", "#bc9aff"],
  ["#b85318", "#ffb16f"],
  ["#b23c72", "#f99ac5"],
  ["#127d99", "#63d6ef"],
];

function AnimatedMetric({ value }: { value: number }) {
  const reducedMotion = useReducedMotion();
  const displayValue = useMotionValue(value);
  const reservedCharacters = useRef(1);
  reservedCharacters.current = Math.max(
    reservedCharacters.current,
    Math.round(value).toLocaleString("en-GB").length,
  );
  const text = useTransform(displayValue, (number) =>
    Math.round(number).toLocaleString("en-GB"),
  );
  useEffect(() => {
    if (reducedMotion) {
      displayValue.set(value);
      return;
    }
    const animation = animate(displayValue, value, {
      duration: 1.5,
      ease: [0.4, 0, 0.2, 1],
    });
    return () => animation.stop();
  }, [displayValue, value, reducedMotion]);
  return (
    <motion.strong style={{ minWidth: `${reservedCharacters.current}ch` }}>
      {text}
    </motion.strong>
  );
}

function NomineeRow({
  result,
  number,
  language,
  grouped,
  attendedShares,
  fontSize,
  compact,
  hasVotes,
}: {
  result: RankedResult;
  number: number;
  language: Language;
  grouped: boolean;
  attendedShares: number;
  fontSize: number;
  compact: boolean;
  hasVotes: boolean;
}) {
  const rowRef = useRef<HTMLElement>(null);
  const nameRef = useRef<HTMLDivElement>(null);
  const selected =
    result.selectionStatus === "LEADING" || result.selectionStatus === "WINNER";
  const tied = result.selectionStatus === "TIED";
  const reducedMotion = useReducedMotion();
  const displayWeight = useMotionValue(result.totalWeight);
  const weightText = useTransform(displayWeight, (weight) =>
    weight.toLocaleString("en-GB", { maximumFractionDigits: 1 }),
  );
  const percentText = useTransform(displayWeight, (weight) =>
    (attendedShares > 0 ? (weight / attendedShares) * 100 : 0).toFixed(1),
  );
  const supportWidth = useTransform(
    displayWeight,
    (weight) =>
      `${Math.min(100, Math.max(0, attendedShares > 0 ? (weight / attendedShares) * 100 : 0))}%`,
  );
  // Reserve enough room for both ends of a count animation, including reversals.
  const largestWeight = Math.max(result.totalWeight, displayWeight.get());
  const weightCharacters =
    Math.ceil(largestWeight).toLocaleString("en-GB").length + 2;
  const percentCharacters = (
    attendedShares > 0 ? (largestWeight / attendedShares) * 100 : 0
  ).toFixed(1).length;
  useEffect(() => {
    if (reducedMotion) {
      displayWeight.set(result.totalWeight);
      return;
    }
    const progression = animate(displayWeight, result.totalWeight, {
      duration: 1.5,
      ease: [0.4, 0, 0.2, 1],
    });
    return () => progression.stop();
  }, [displayWeight, result.totalWeight, reducedMotion]);
  const english = language === "en";
  const primaryName = english ? result.name : result.nameAm || result.name;
  const secondaryName =
    language === "both" && result.nameAm ? result.name : null;
  const badge =
    result.selectionStatus === "WINNER"
      ? english
        ? "Elected"
        : "ተመርጧል"
      : selected
        ? english
          ? "Passing"
          : "እያለፈ"
        : tied
          ? english
            ? "Tied"
            : "እኩል ድምፅ"
          : "";
  const groupLabel =
    result.type === "first"
      ? english
        ? "Group 1"
        : "ቡድን 1"
      : english
        ? "Group 2"
        : "ቡድን 2";
  const rankNumber = hasVotes && !grouped ? result.rank : number;
  const color =
    NOMINEE_COLORS[
      Math.max(0, (result.registrationOrder ?? number) - 1) %
        NOMINEE_COLORS.length
    ];

  // Fit complete names after layout or font changes; voters need to copy them.
  useLayoutEffect(() => {
    const area = nameRef.current;
    const row = rowRef.current;
    if (!area || !row) return;
    let active = true;
    let frame = 0;
    let lastWidth = -1;
    let lastHeight = -1;
    const fit = () => {
      if (!active) return;
      const bounds = area.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      const names = area.querySelectorAll<HTMLElement>(
        ".nominee-full-name, .nominee-secondary-name",
      );
      let low = 8;
      let high = fontSize;
      let fitted = 8;
      while (low <= high) {
        const size = Math.floor((low + high) / 2);
        row.style.setProperty("--row-name-size", `${size}px`);
        const fits = [...names].every((name) => {
          const text = name.getBoundingClientRect();
          return (
            text.top >= bounds.top - 0.5 &&
            text.bottom <= bounds.bottom + 0.5 &&
            name.scrollWidth <= name.clientWidth + 1
          );
        });
        if (fits) {
          fitted = size;
          low = size + 1;
        } else high = size - 1;
      }
      row.style.setProperty("--row-name-size", `${fitted}px`);
    };
    fit();
    // Observe the fixed grid row, not the name area changed by fitting itself.
    const observer = new ResizeObserver(([entry]) => {
      const width = Math.floor(entry.contentRect.width);
      const height = Math.floor(entry.contentRect.height);
      if (width === lastWidth && height === lastHeight) return;
      lastWidth = width;
      lastHeight = height;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(fit);
    });
    observer.observe(row);
    void document.fonts.ready.then(fit);
    return () => {
      active = false;
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [fontSize, primaryName, secondaryName, grouped, tied, compact]);

  return (
    <motion.article
      ref={rowRef}
      data-nominee-id={result.nomineeId}
      layout={reducedMotion ? false : "position"}
      layoutDependency={number}
      initial={false}
      transition={{
        layout: {
          duration: 0.8,
          ease: [0.4, 0, 0.2, 1],
        },
      }}
      data-rank={hasVotes ? result.rank : undefined}
      data-registration-order={result.registrationOrder}
      className={`nominee-row ${selected ? "is-leading" : tied ? "is-tied" : ""}`}
      data-group={grouped ? result.type : "standard"}
      data-density={compact ? "compact" : "comfortable"}
      style={
        {
          "--row-name-size": fontSize + "px",
          "--nominee-light": color[0],
          "--nominee-dark": color[1],
          "--weight-characters": weightCharacters,
          "--percent-characters": percentCharacters,
        } as CSSProperties
      }>
      <div className="nominee-row-content">
        <span
          className="nominee-number"
          aria-label={`${hasVotes ? (grouped ? "Display position" : "Rank") : "Registration position"} ${rankNumber}`}>
          {String(rankNumber).padStart(2, "0")}
        </span>
        <div className="nominee-identity">
          <div ref={nameRef} className="nominee-name-area">
            <div className="nominee-primary-line">
              <h2
                className="nominee-full-name"
                lang={!english && result.nameAm ? "am" : "en"}>
                {primaryName}
              </h2>
            </div>
            {secondaryName && (
              <p className="nominee-secondary-name" lang="en">
                {secondaryName}
              </p>
            )}
          </div>
          {(grouped || tied) && (
            <div className="nominee-meta" lang={english ? "en" : "am"}>
              {grouped && (
                <span className="nominee-group">
                  {groupLabel}
                  {hasVotes && (
                    <span className="nominee-group-rank">
                      {" "}
                      · {english ? "Rank" : "ደረጃ"} {result.rank}
                    </span>
                  )}
                </span>
              )}
              {tied && <span className="nominee-status">{badge}</span>}
            </div>
          )}
        </div>
        <div className="nominee-votes">
          <span className="nominee-weight">
            <motion.span>{weightText}</motion.span>
          </span>
          <span className="nominee-percent">
            <motion.span>{percentText}</motion.span>
            <small>%</small>
          </span>
        </div>
      </div>
      <div className="nominee-support-track" aria-hidden="true">
        <motion.div className="live-vote-bar" style={{ width: supportWidth }} />
      </div>
    </motion.article>
  );
}

export default function LiveVotingPresentation() {
  const { id } = useParams();
  const [data, setData] = useState<LiveData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [now, setNow] = useState<number | null>(null);
  const [projection, setProjection] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [settings, setSettings] = useState(false);
  const [language, setLanguage] = useState<Language>("am");
  const [dimensions, setDimensions] = useState({ width: 1600, height: 800 });
  const containerRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setProjection(
      new URLSearchParams(window.location.search).get("projection") === "1",
    );
  }, []);
  useEffect(() => {
    const life = new AbortController();
    let timer: ReturnType<typeof setTimeout>;
    setLoading(true);
    setData(null);
    setLastUpdated(null);
    setError("");
    const poll = async () => {
      const request = new AbortController();
      const abort = () => request.abort();
      life.signal.addEventListener("abort", abort, { once: true });
      const deadline = setTimeout(abort, 10000);
      try {
        const res = await fetch(`/api/public/meetings/${id}/results`, {
          cache: "no-store",
          signal: request.signal,
        });
        const payload = await res.json();
        if (!res.ok) throw new Error(payload.error || "Failed to load results");
        if (life.signal.aborted) return;
        setData(payload);
        setError("");
        setLastUpdated(new Date());
      } catch (error) {
        if (!life.signal.aborted)
          setError(
            error instanceof Error ? error.message : "Connection unavailable",
          );
      } finally {
        clearTimeout(deadline);
        life.signal.removeEventListener("abort", abort);
        if (!life.signal.aborted) {
          setLoading(false);
          timer = setTimeout(poll, 3000);
        }
      }
    };
    void poll();
    return () => {
      life.abort();
      clearTimeout(timer);
    };
  }, [id]);
  useEffect(() => {
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  useLayoutEffect(() => {
    if (!boardRef.current) return;
    const observer = new ResizeObserver(([entry]) => {
      const width = Math.floor(entry.contentRect.width);
      const height = Math.floor(entry.contentRect.height);
      setDimensions((previous) =>
        previous.width === width && previous.height === height
          ? previous
          : { width, height },
      );
    });
    observer.observe(boardRef.current);
    return () => observer.disconnect();
  }, []);

  const results = useMemo(
    () =>
      orderNomineeBoard(data?.results ?? [], data?.votingMode === "GROUPED"),
    [data],
  );
  const layout = useMemo(
    () =>
      fitNomineeLeaderboard(
        dimensions.width,
        dimensions.height,
        results.length,
        language === "both",
      ),
    [dimensions, results.length, language],
  );
  const stale =
    !!error ||
    (!!lastUpdated && now !== null && now - lastUpdated.getTime() > 15000);
  const tied = data?.results.some((r) => r.selectionStatus === "TIED");
  const english = language === "en";
  const closed = data?.meetingStatus === "CLOSED";
  const voting = data?.meetingStatus === "VOTINGOPEN";
  const grouped = data?.votingMode === "GROUPED";
  const hasVotes = results.some((r) => r.totalWeight > 0);
  const passers = results.filter((r) =>
    ["LEADING", "WINNER"].includes(r.selectionStatus),
  );
  const statusEn = closed
    ? "Final results"
    : voting
      ? "Voting in progress"
      : "Awaiting votes";
  const boardStyle = {
    gridTemplateColumns: `repeat(${layout.columns}, minmax(0, 1fr))`,
    "--board-name-size": layout.fontSize + "px",
    "--board-row-height": layout.rowHeight + "px",
  } as CSSProperties;

  const toggleFullScreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else {
        setProjection(true);
        await containerRef.current?.requestFullscreen?.();
      }
    } catch {
      toast.error("Fullscreen unavailable. The nominee board remains visible.");
    }
  }, []);
  useEffect(() => {
    const sync = () =>
      setIsFullScreen(document.fullscreenElement === containerRef.current);
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);
  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if (
        (event.target as HTMLElement).closest(
          "input, select, textarea, button, [contenteditable]",
        ) ||
        event.ctrlKey ||
        event.metaKey ||
        event.altKey
      )
        return;
      if (event.key.toLowerCase() === "f") {
        event.preventDefault();
        void toggleFullScreen();
      }
      if (event.key === "Escape") setSettings(false);
    };
    window.addEventListener("keydown", keydown);
    return () => window.removeEventListener("keydown", keydown);
  }, [toggleFullScreen]);

  return (
    <div
      ref={containerRef}
      className={`election-wall ${projection ? "projection-screen" : ""}`}
      data-voting={voting}>
      <header className="election-wall-header">
        <div className="election-brand">
          <div className="election-logo">
            <Image
              src="/logo.svg"
              alt="Company logo"
              width={100}
              height={55}
              priority
            />
          </div>
          <div className="election-heading">
            <div className="election-kicker" lang={english ? "en" : "am"}>
              {english ? "SHAREHOLDER ELECTION" : "የባለአክሲዮኖች ምርጫ"}
            </div>
            <h1 lang={english ? "en" : "am"}>
              {english ? "Live voting" : "ምርጫ · ቀጥታ"}
            </h1>
          </div>
        </div>
        <div className="election-metrics">
          <div className="election-counted">
            <span lang={english ? "en" : "am"}>
              {english ? "Voters counted" : "ድምፅ የሰጡ"}
            </span>
            <AnimatedMetric value={data?.ballotsCast ?? 0} />
          </div>
          <div className="election-shares">
            <span lang={english ? "en" : "am"}>
              {english ? "Attended share value" : "የተገኙት አክሲዮን ዋጋ"}
            </span>
            <AnimatedMetric value={data?.totalSharesAttended ?? 0} />
          </div>
          <div className="election-seats">
            <span lang={english ? "en" : "am"}>
              {english ? "Seats to fill" : "የሚመረጡ"}
            </span>
            <strong>
              <Crown aria-hidden="true" />
              {data?.winnerCount ?? "—"}
            </strong>
          </div>
        </div>
        <div className="election-controls">
          <ThemeToggle />
          <button
            onClick={() => void toggleFullScreen()}
            title={isFullScreen ? "Exit fullscreen" : "Fullscreen (F)"}
            aria-label={isFullScreen ? "Exit fullscreen" : "Fullscreen (F)"}>
            {isFullScreen ? <Minimize2 /> : <Maximize2 />}
          </button>
          <button
            onClick={() => setSettings((value) => !value)}
            aria-label="Display settings"
            aria-expanded={settings}>
            <Settings2 />
          </button>
        </div>
      </header>
      {grouped && (
        <div className="election-passer-summary" lang={english ? "en" : "am"}>
          <span className="election-group-seats">
            <span data-group="first">
              {english ? "Group 1" : "ቡድን 1"}
              <strong>
                {passers.filter((r) => r.type === "first").length}/
                {data.meetingFirstPassers}
              </strong>
            </span>
            <span data-group="second">
              {english ? "Group 2" : "ቡድን 2"}
              <strong>
                {passers.filter((r) => r.type === "second").length}/
                {data.meetingSecondPassers}
              </strong>
            </span>
          </span>
        </div>
      )}
      {(error || data?.configurationError || tied) && (
        <div
          className="election-notice"
          role="status"
          lang={english ? "en" : "am"}>
          {error
            ? english
              ? "Connection interrupted. Showing the last count; reconnecting…"
              : "ግንኙነቱ ተቋርጧል። የመጨረሻው ውጤት እየታየ ነው፤ እንደገና በመገናኘት ላይ…"
            : data?.configurationError
              ? english
                ? data.configurationError
                : "በስብሰባው ቅንብር የሚመረጡትን ዕጩዎች ብዛት ያስገቡ።"
              : english
                ? "A tie crosses the winner cutoff. The tied seats need a decision."
                : "በመጨረሻው የምርጫ ቦታ ላይ ዕጩዎች እኩል ድምፅ አግኝተዋል። ውሳኔ ያስፈልጋል።"}
        </div>
      )}
      <div
        className="leaderboard-column-headings"
        data-density={layout.rowHeight < 64 ? "compact" : "comfortable"}
        style={{ ...boardStyle, width: dimensions.width }}
        aria-hidden="true">
        {Array.from({ length: layout.columns }, (_, index) => (
          <div
            key={index}
            className="leaderboard-column-heading"
            lang={english ? "en" : "am"}>
            <span>
              {hasVotes ? (grouped ? "#" : english ? "Rank" : "ደረጃ") : "#"}
            </span>
            <span>{english ? "Nominee name" : "የዕጩው ስም"}</span>
            <span>
              {english ? "Weighted votes · Support %" : "የድምፅ ክብደት · ድጋፍ %"}
            </span>
          </div>
        ))}
      </div>
      <div
        ref={boardRef}
        className="nominee-leaderboard"
        data-density={layout.rowHeight < 64 ? "compact" : "comfortable"}
        aria-label="All nominees and live vote totals, ordered down each column"
        style={{
          ...boardStyle,
          gridTemplateRows: `repeat(${layout.rows}, minmax(46px, 1fr))`,
          rowGap: layout.gap,
        }}>
        {!results.length ? (
          <div className="election-empty" role="status">
            <Vote />
            <p lang="am">
              {loading
                ? "ውጤቱን በመጫን ላይ…"
                : error
                  ? "ግንኙነት በመጠባበቅ ላይ…"
                  : "ዕጩዎች ገና አልተመዘገቡም"}
            </p>
            <span>{loading ? "Loading results…" : "Waiting for nominees"}</span>
          </div>
        ) : (
          results.map((result, index) => (
            <NomineeRow
              key={result.nomineeId}
              result={result}
              number={index + 1}
              language={language}
              grouped={grouped}
              attendedShares={data?.totalSharesAttended ?? 0}
              fontSize={layout.fontSize}
              compact={layout.rowHeight < 64}
              hasVotes={hasVotes}
            />
          ))
        )}
      </div>
      <footer className="election-wall-footer">
        <div className={`election-connection ${stale ? "is-stale" : ""}`}>
          {stale ? <WifiOff /> : <Wifi />}
          <span lang={english ? "en" : "am"}>
            {english
              ? stale
                ? "Reconnecting"
                : "Live · updates every 3s"
              : stale
                ? "በመገናኘት ላይ"
                : "ቀጥታ · በየ3 ሰከንዱ"}
          </span>
          <time>
            {lastUpdated?.toLocaleTimeString("en-GB", {
              timeZone: "Africa/Nairobi",
            }) ?? "—"}
          </time>
        </div>
        <p lang={english ? "en" : "am"}>
          {english
            ? "Support % = weighted votes ÷ attended share value"
            : "የድጋፍ መቶኛ = የድምፅ ክብደት ÷ የተገኙት አክሲዮን ዋጋ"}
        </p>
      </footer>
      {settings && (
        <aside className="election-settings" aria-label="Display settings">
          <div>
            <strong>
              <span lang="am">የማያ ቅንብሮች</span> / Display settings
            </strong>
            <button
              aria-label="Close display settings"
              onClick={() => setSettings(false)}>
              <X />
            </button>
          </div>
          <label htmlFor="results-language">
            <span lang="am">የስም ቋንቋ</span> / Name language
          </label>
          <select
            id="results-language"
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}>
            <option value="am">አማርኛ / Amharic</option>
            <option value="both">አማርኛ + English</option>
            <option value="en">English</option>
          </select>
          <button
            className="election-settings-action"
            onClick={async () => {
              if (document.fullscreenElement) await document.exitFullscreen();
              setProjection((value) => !value);
              setSettings(false);
            }}>
            {projection ? "Exit projection" : "Projection mode"}
          </button>
        </aside>
      )}
      <p aria-live="polite" aria-atomic="true" className="sr-only">
        {statusEn}. {data?.ballotsCast ?? 0} voters counted. {results.length}{" "}
        nominees visible. {stale ? "Connection delayed." : ""}
      </p>
    </div>
  );
}
