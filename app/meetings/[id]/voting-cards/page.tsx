"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import type { ElectionRules } from "@/lib/election";
import styles from "./voting-cards.module.css";

const CARDS_PER_PAGE = 3;

type CardBatch = {
  meeting: { id: string; title: string; date: string };
  votingRules: ElectionRules;
  shareholders: {
    id: string;
    name: string;
    nameAm: string | null;
    shareValue: string;
  }[];
};

export default function VotingCardsPage() {
  const { id } = useParams();
  const [batch, setBatch] = useState<CardBatch | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [reload, setReload] = useState(0);
  const [printing, setPrinting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    setBatch(null);
    fetch(`/api/meetings/${id}/voting-cards`, {
      signal: controller.signal,
      cache: "no-store",
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok)
          throw new Error(data.error || "Failed to load voting cards");
        setBatch(data);
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted)
          setError(
            error instanceof Error
              ? error.message
              : "Failed to load voting cards",
          );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [id, reload]);

  if (loading)
    return (
      <div className="p-8 text-center" role="status">
        Preparing cards for all shareholders… / የSHAREHOLDER ካርዶችን እዘጋጀ ነው…
      </div>
    );
  if (error || !batch)
    return (
      <div className="mx-auto max-w-2xl space-y-4 p-8">
        <h1 className="text-2xl font-bold">
          Voting cards unavailable / የድምጽ መስጫ ካርዶች የሉም
        </h1>
        <p role="alert">{error || "Failed to load voting cards"}</p>
        <div className="flex gap-3">
          <Button onClick={() => setReload((n) => n + 1)}>
            Try again / እንደገና ይሞክሩ
          </Button>
          <Button asChild variant="outline">
            <Link href="/meetings">
              Manage meeting settings / የስብሰባ ቅንብሮችን አስተዳድር
            </Link>
          </Button>
        </div>
      </div>
    );

  const sheets = Array.from(
    { length: Math.ceil(batch.shareholders.length / CARDS_PER_PAGE) },
    (_, index) =>
      batch.shareholders.slice(
        index * CARDS_PER_PAGE,
        (index + 1) * CARDS_PER_PAGE,
      ),
  );

  const printCards = async () => {
    setPrinting(true);
    try {
      await document.fonts.ready;
      await Promise.allSettled(
        Array.from(
          document.querySelectorAll<HTMLImageElement>(".print-area img"),
          (logo) => logo.decode(),
        ),
      );
      window.print();
    } finally {
      setPrinting(false);
    }
  };

  return (
    <div
      className={`${styles.page} min-h-screen bg-slate-100 px-4 py-8 text-slate-950 dark:bg-gray-900 dark:text-slate-100`}
    >
      <style jsx global>{`
        @media print {
          /* Zero browser margins suppress the browser's date, title, URL and page number. */
          @page {
            size: A4;
            margin: 0 !important;
          }
          body {
            margin: 0 !important;
            background: white !important;
            color: black !important;
          }
          body > nav,
          [data-sonner-toaster] {
            display: none !important;
          }
        }
      `}</style>

      <div className="no-print mx-auto mb-8 flex max-w-6xl flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/meetings" className="text-sm underline">
            ← Back to meetings / ወደ ስብሰባዎች ተመለስ
          </Link>
          <h1 className="mt-2 text-3xl font-bold">{batch.meeting.title}</h1>
          <p className="mt-2">
            {batch.shareholders.length.toLocaleString()} shareholder cards ·{" "}
            {CARDS_PER_PAGE} cards per A4 page · {batch.votingRules.winnerCount}{" "}
            blank name spaces per card
          </p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            All registered shareholders are included. Attendance is checked when
            votes are recorded. / የተመዘገቡ ባለአክሲዮኖች ሁሉ ተካተዋል፤ መገኘታቸው ድምጽ በሚሰጥበት ጊዜ
            ይረጋገጣል።
          </p>
        </div>
        <Button
          className="h-auto max-w-full whitespace-normal py-3 text-center"
          onClick={printCards}
          disabled={!batch.shareholders.length || printing}
        >
          {printing
            ? "Preparing print… / ለህትመት በማዘጋጀት ላይ…"
            : "Print all shareholder cards / ሁሉንም የድምጽ ካርዶች አትም"}
        </Button>
      </div>

      {!batch.shareholders.length ? (
        <p className="mx-auto max-w-6xl">
          No shareholders registered. Add shareholders before generating cards.
          / ምንም ባለአክሲዮን አልተመዘገበም።
        </p>
      ) : (
        <div className={`print-area ${styles.printArea}`}>
          {sheets.map((shareholders, sheetIndex) => (
            <div key={sheetIndex} className={styles.sheet}>
              {shareholders.map((voter) => (
                <article
                  key={voter.id}
                  className={styles.card}
                  style={
                    {
                      "--line-count": batch.votingRules.winnerCount,
                    } as CSSProperties
                  }
                >
                  <div className={styles.details} lang="am">
                    <header className={styles.cardHeader}>
                      <Image
                        src="/logo.svg"
                        alt="Company logo"
                        width={120}
                        height={62}
                        loading="eager"
                        className={styles.logo}
                      />
                      <p className={`${styles.identifier} text-xl`}>
                        <strong>መለያ ቁ.፦</strong>
                        <span>{voter.id}</span>
                      </p>
                    </header>

                    <dl className={styles.identity}>
                      <dt>የባለአክሲዮኑ ስም፦</dt>
                      <dd lang={voter.nameAm ? "am" : "en"}>
                        {voter.nameAm || voter.name}
                      </dd>
                    </dl>

                    <dl className={styles.shares}>
                      <dt>የአክሲዮን ብዛት፦</dt>
                      <dd>
                        {Number(voter.shareValue).toLocaleString("en-GB", {
                          maximumFractionDigits: 6,
                        })}
                      </dd>
                    </dl>

                    <p className={styles.instructions}>
                      የሚፈልጉትን እጩዎች ስም በተዘጋጀው ቦታ ላይ በመሙላት{" "}
                      <strong className="font-extrabold text-2xl">
                        ({batch.votingRules.winnerCount})
                      </strong>{" "}
                      እጩዎችን ይምረጡ።
                    </p>

                    <footer className={styles.signature}>
                      <strong>ፊርማ፦</strong>
                      <span aria-label="Shareholder signature space" />
                    </footer>
                  </div>

                  <div className={styles.ballot}>
                    <header className={styles.ballotHeader} lang="am">
                      <span>ተ.ቁ.</span>
                      <h2>የመረጧቸው እጩዎች ስም ዝርዝር</h2>
                    </header>
                    <div
                      className={styles.sections}
                      style={{
                        gridTemplateRows: batch.votingRules.sections
                          .map((section) => `${section.count}fr`)
                          .join(" "),
                      }}
                    >
                      {batch.votingRules.sections.map((section) => (
                        <section
                          key={section.key}
                          className={`ballot-section ${styles.section}`}
                        >
                          {batch.votingRules.mode === "GROUPED" && (
                            <h3 className={styles.groupLabel}>
                              {section.label}
                            </h3>
                          )}
                          <ol
                            className={styles.writeIns}
                            style={{
                              gridTemplateRows: `repeat(${section.count}, minmax(0, 1fr))`,
                            }}
                          >
                            {Array.from(
                              { length: section.count },
                              (_, index) => (
                                <li
                                  key={index}
                                  className={`ballot-write-in ${styles.writeIn}`}
                                >
                                  <span className={styles.lineNumber}>
                                    {index + 1}
                                  </span>
                                  <span
                                    className={styles.writingLine}
                                    aria-label={`${section.label}, blank name space ${index + 1}`}
                                  />
                                </li>
                              ),
                            )}
                          </ol>
                        </section>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
