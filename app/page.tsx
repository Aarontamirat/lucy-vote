import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ClipboardList,
  FileCheck2,
  ShieldCheck,
  Users,
  Vote,
} from "lucide-react";
import { currentUser, can } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate, formatNumber } from "@/lib/display";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/workspace/PageHeader";
import { StatusBadge } from "@/components/workspace/StatusBadge";
import { EmptyState } from "@/components/workspace/Feedback";

export default async function Home() {
  const user = await currentUser();
  if (!user)
    return (
      <main className="landing">
        <div className="landing-hero">
          <div className="landing-copy">
            <p className="eyebrow">LUCY SHAREHOLDER WORKSPACE</p>
            <h1 className="landing-title">
              Clear decisions.
              <br />
              <span>Every share counts.</span>
            </h1>
            <p>
              Bring your shareholder registry, meeting attendance and weighted
              elections together in one organised workspace.
            </p>
            <div className="page-actions">
              <Button asChild size="lg">
                <Link href="/login">
                  Sign in to your workspace
                  <ArrowRight />
                </Link>
              </Button>
            </div>
          </div>
          <div className="ballot-illustration" aria-hidden="true">
            <div className="ballot-paper">
              <span>
                <Vote size={23} />A voice for every shareholder
              </span>
              {[true, false, true].map((checked, index) => (
                <div className="ballot-line" key={index}>
                  <span>{checked && <Check size={16} />}</span>
                  <i />
                </div>
              ))}
              <div className="ballot-seal">
                <ShieldCheck size={15} />
                Secure · Transparent · Accountable
              </div>
            </div>
          </div>
        </div>
        <div className="landing-features">
          {[
            {
              icon: Users,
              title: "An organised registry",
              text: "Maintain shareholder records, import Excel files and keep share values easy to find.",
            },
            {
              icon: CalendarDays,
              title: "Meetings that run smoothly",
              text: "Prepare elections, register attendance and track quorum from opening to close.",
            },
            {
              icon: FileCheck2,
              title: "Confidence in every result",
              text: "Record weighted ballots, show live totals and produce clear attendance and voting reports.",
            },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title}>
              <Icon size={25} />
              <h2>{title}</h2>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </main>
    );
  if (user.mustChangePassword) redirect("/account/password");
  const meetingAccess = can(user, "meetings.view");
  const registryAccess = can(user, "shareholders.view");
  const where = user.superAdmin
    ? {}
    : { userAssignments: { some: { userId: user.id } } };
  const [
    meetingCount,
    votingCount,
    recentMeetings,
    holders,
    totalShares,
    users,
  ] = await Promise.all([
    meetingAccess ? prisma.meeting.count({ where }) : 0,
    meetingAccess
      ? prisma.meeting.count({ where: { ...where, status: "VOTINGOPEN" } })
      : 0,
    meetingAccess
      ? prisma.meeting.findMany({
          where,
          orderBy: { date: "desc" },
          take: 5,
          select: {
            id: true,
            title: true,
            date: true,
            location: true,
            status: true,
          },
        })
      : [],
    registryAccess ? prisma.shareholder.count() : 0,
    registryAccess
      ? prisma.shareholder.aggregate({ _sum: { shareValue: true } })
      : null,
    user.superAdmin ? prisma.user.count({ where: { active: true } }) : 0,
  ]);
  const metrics = [
    ...(registryAccess
      ? [
          {
            label: "Registered shareholders",
            value: formatNumber(holders, 0),
            note: "Your shared shareholder registry",
            icon: Users,
          },
        ]
      : []),
    ...(meetingAccess
      ? [
          {
            label: "Accessible meetings",
            value: formatNumber(meetingCount, 0),
            note: user.superAdmin
              ? "Across your organisation"
              : "Meetings assigned to you",
            icon: CalendarDays,
          },
          {
            label: "Voting open",
            value: formatNumber(votingCount, 0),
            note: "Elections accepting ballots",
            icon: Vote,
          },
        ]
      : []),
    ...(user.superAdmin
      ? [
          {
            label: "Active team members",
            value: formatNumber(users, 0),
            note: "Accounts enabled for sign-in",
            icon: ShieldCheck,
          },
        ]
      : registryAccess
        ? [
            {
              label: "Total registered shares",
              value: formatNumber(
                totalShares?._sum.shareValue?.toString() ?? 0,
              ),
              note: "Current registry share value",
              icon: FileCheck2,
            },
          ]
        : []),
  ];
  const shortcuts = [
    ...(meetingAccess
      ? [
          {
            href: "/meetings",
            title: "Meeting workspace",
            text: "Attendance, ballots and election results",
            icon: CalendarDays,
          },
        ]
      : []),
    ...(registryAccess
      ? [
          {
            href: "/shareholders",
            title: "Shareholder registry",
            text: "Find and maintain shareholder records",
            icon: Users,
          },
        ]
      : []),
    ...(user.superAdmin
      ? [
          {
            href: "/admin",
            title: "Users & Roles",
            text: "Manage accounts and meeting access",
            icon: ShieldCheck,
          },
        ]
      : []),
    ...(can(user, "audit.view")
      ? [
          {
            href: "/audit",
            title: "Audit history",
            text: "Review recorded system activity",
            icon: ClipboardList,
          },
        ]
      : []),
  ];
  return (
    <main className="work-page">
      <PageHeader
        eyebrow="YOUR WORKSPACE"
        title={`Welcome, ${user.name.split(" ")[0]}`}
        description="A clear view of your meetings, records and next steps."
        actions={
          meetingAccess && (
            <Button asChild variant="outline">
              <Link href="/meetings">
                View meetings
                <ArrowRight />
              </Link>
            </Button>
          )
        }
      />
      <div className="metric-grid">
        {metrics.map(({ label, value, note, icon: Icon }) => (
          <div className="metric-card" key={label}>
            <div className="metric-top">
              <span>{label}</span>
              <Icon />
            </div>
            <strong>{value}</strong>
            <p>{note}</p>
          </div>
        ))}
      </div>
      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>{meetingAccess ? "Recent meetings" : "Your workspace"}</h2>
              <p>
                {meetingAccess
                  ? "Choose a meeting to continue your work."
                  : "Your role gives you access to the shareholder registry."}
              </p>
            </div>
            {meetingAccess && (
              <Button asChild variant="ghost" size="sm">
                <Link href="/meetings">
                  View all
                  <ArrowRight />
                </Link>
              </Button>
            )}
          </div>
          {recentMeetings.length ? (
            recentMeetings.map((meeting) => (
              <Link
                href={`/meetings?q=${encodeURIComponent(meeting.title)}`}
                key={meeting.id}
                className="meeting-summary">
                <div className="calendar-tile">
                  <span>{formatDate(meeting.date).split(" ")[1]}</span>
                  <strong>{formatDate(meeting.date).split(" ")[0]}</strong>
                </div>
                <div className="meeting-summary-info">
                  <strong>{meeting.title}</strong>
                  <p>
                    {formatDate(meeting.date)} ·{" "}
                    {meeting.location || "Location not set"}
                  </p>
                </div>
                <StatusBadge status={meeting.status} />
                <ArrowRight size={16} />
              </Link>
            ))
          ) : (
            <EmptyState
              title={
                meetingAccess
                  ? "Your meetings will appear here"
                  : "Ready to manage your registry"
              }
              description={
                meetingAccess
                  ? "Create a meeting or ask your Super Admin to assign an existing meeting to you."
                  : "Find a shareholder, update their details or import an Excel file."
              }
              action={
                registryAccess && (
                  <Button asChild>
                    <Link href="/shareholders">
                      Open registry
                      <ArrowRight />
                    </Link>
                  </Button>
                )
              }
            />
          )}
        </section>
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Quick access</h2>
              <p>The tools available to your role.</p>
            </div>
          </div>
          {shortcuts.length ? (
            shortcuts.map(({ href, title, text, icon: Icon }) => (
              <Link href={href} key={href} className="quick-link">
                <span className="quick-link-icon">
                  <Icon size={19} />
                </span>
                <div>
                  <strong>{title}</strong>
                  <p>{text}</p>
                </div>
                <ArrowRight size={15} />
              </Link>
            ))
          ) : (
            <EmptyState
              title="Access is being set up"
              description="Ask your Super Admin to assign permissions to your account."
            />
          )}
        </section>
      </div>
      <div className="dashboard-banner">
        <CheckCircle2 size={28} />
        <div>
          <h2>Your workspace is ready</h2>
          <p>
            Actions follow your role and meeting assignments. Account settings
            are available from your name in the top bar.
          </p>
        </div>
      </div>
    </main>
  );
}
