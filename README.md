# **Weighted Voting & Shareholder Management System**

A professional workspace for shareholder records, meeting attendance, and weighted elections.

## Installation, deployment, and user documentation

Start with [the documentation index](docs/README.md) for detailed setup on a new server and access from other devices. It links the [installation guide](docs/installation.md), [LAN and HTTPS deployment guide](docs/deployment.md), [configuration reference](docs/configuration.md), [user guide](docs/user-guide.md), [backup/update/server-transfer guide](docs/operations.md), and [troubleshooting](docs/troubleshooting.md). Existing training slides, the PDF manual, and examples remain in `docs/training/`.

---

## **Overview**

This system empowers organizations to run transparent, fair, and
weighted elections where each shareholder's voting power corresponds to
their share value. Built with **Next.js**, **Prisma**, **TailwindCSS**,
and enhanced with live animations and real-time dashboards.

Created with precision and elegance by **Aaron Tamirat**.

---

## **Key Features**

### **Shareholder Registry**

- Add, update, and manage shareholders\
- Automatic share‑value‑based weighting\
- Fast lookup and smart search

### **Meeting Management**

- Create and manage meetings\
- Track attendance\
- Auto‑generated voter lists

### **Weighted Voting System**

- Live animated voting dashboard\
- Share‑based vote calculations\
- Real-time updates with futuristic visuals\
- Circular animated progress rings

### **Nominee Management**

- Add nominees linked to shareholders\
- Prevent double voting\
- Disable already‑voted options

### **Printable Voting Cards**

- Compact, elegant voting cards\
- Print the complete shareholder batch, with page layout adapting to the number of name spaces\
- Includes:
  - Voter ID\
  - Voter Name\
  - Share Value\
  - Blank name spaces matching the configured number of winners\
  - Signature line

### **Reports & Insights**

- Total shares registered\
- Shares present in meeting\
- Vote breakdown by weight\
- Attendance breakdown

---

## **Tech Stack**

Layer Technology

---

**Tech Stack**

- Frontend: Next.js 15, React, TailwindCSS, Framer Motion
- Backend: Next.js Route Handlers, Prisma ORM
- Database: MySQL (the checked-in Prisma schema and migrations target MySQL)
- UI Components: shadcn/ui
- Real-Time Optimistic updates + fast revalidation
- Visualization: Animated SVG circular progress bars

---

## **Live Voting Dashboard Preview**

    ○ ● Futuristic animated dashboard
    ○ ● Live weight updates
    ○ ● Auto-sorting by vote count

---

## **Design Philosophy**

> _"Clean, futuristic, minimalist --- built for large LED displays."_\
> Light backgrounds, glowing accents, smooth animations, and a
> professional corporate aesthetic.

---

## **Project Structure**

    /app
      /meetings
      /voting
      /api
    /prisma
    /components
    /public

---

## **Author**

**Aaron Tamirat**\
Full-stack Developer • System Architect\
Building modern enterprise tools with code and creativity.

---

## **Support & Showcase**

If you use this project in your organization, give credit to keep the
ecosystem inspiring and motivating.

---

## Election setup and projection

1. Create or edit a meeting and choose **Standard** or **Two nominee groups**.
2. For a standard election, enter **Number of winners**. For two groups, enter the winners for each group. The total of these limits determines the number of blank name spaces on each card.
3. Use **Print Cards for All Shareholders** to prepare the entire registered shareholder batch, including people who have not yet registered attendance. Cards can be prepared before voting opens.
4. Record attendance before accepting a shareholder's vote. The voting screen and API enforce the configured choice limits, including previously recorded choices. To correct an encoding mistake while voting is open, enter the voter ID and click **Reverse** beside the mistaken recorded choice, then select and record the correct nominee. Reversals free the ballot slot and update live results and reports; closed meetings cannot be changed.
5. From the meeting's Actions menu, choose **Open Projection Screen**. Move that window to the projector and press **F** for browser fullscreen. Names can be shown in English, Amharic, or both.
6. The projector view refreshes after every three seconds. Every nominee stays visible in a leaderboard of wide rows. The board chooses the column count that allows the largest names; read each column from top to bottom, then move to the next. Before voting, nominees appear in registration order. Once votes arrive, they move smoothly into live rank order, with each group's provisional passers at the top and each nominee's rank within their group shown explicitly. Gold crowns sit beside passing nominees' names, and group seat counts update during voting. Vote weights and support percentages share a column to leave more room for names. Each nominee keeps their progress color when their position changes, and complete names and large vote totals fit the screen automatically. Use the theme button for the project's light/dark theme and Display settings for Amharic, English, or both. Vote totals, percentages, and progress bars animate together; reduced-motion preferences are respected.

Printed cards include Amharic and English instructions, voter details, group headings, and signature labels. The bundled Noto Sans Ethiopic font is served locally for consistent Amharic screen and print rendering; its license is in `public/fonts`.

Voting cards use an A4 print layout with zero browser page margins and padding around the cards. Chrome's browser-generated date/time, app title, URL and page numbers are suppressed, and the navigation and screen controls are hidden.

Leaders remain provisional while voting is open. When the meeting closes, the highest weighted nominees fill the configured seats in each group or in the standard list. A tie crossing a seat cutoff is marked for resolution; the system does not select a tied winner arbitrarily. Nominees with no votes are not declared winners.

### Database update

Apply the included migration after starting MySQL:

```powershell
npx prisma migrate deploy
npx prisma generate
```

Existing standard meetings have no inferred default winner count: enter the actual count in Edit Meeting. An older meeting with voting already open can set its missing count before its first vote. Configured rules are locked after voting opens.

### Verification

```powershell
npm test
npx tsc --noEmit
npm run build
```

The automated tests cover grouped and standard election limits, winner cutoffs and ties, all-shareholder card batches, voting API eligibility and cumulative choices, and vote reversals with correction, isolated totals, retries, validation and closed-meeting protection. API tests use an isolated database double and do not modify meeting records.

## User accounts and role management

Sign in at `/login`. A fresh installation's first administrator is created with the email and name supplied to `npm run setup:admin`; there is no built-in default administrator password. Its generated temporary password must be changed before using protected features. Follow the [installation guide](docs/installation.md) for setup. **Users & Roles** is available to Super Admins in the navigation.

| Role               | Default access                                                                                                        |
| ------------------ | --------------------------------------------------------------------------------------------------------------------- |
| Super Admin        | All functions, meetings, users, roles, and permission settings                                                        |
| Election Manager   | Configure assigned meetings and nominees, open/close attendance and voting, print cards, read reports and projections |
| Registry Clerk     | View, add, edit, and import the shared shareholder registry                                                           |
| Attendance Officer | Look up shareholders and register attendance and representatives in assigned meetings                                 |
| Vote Operator      | Look up eligible voters and record ballots in assigned meetings                                                       |
| Auditor            | Read attendance, results, reports, and audit history for assigned meetings                                            |
| Projection Viewer  | Open aggregate attendance and election projections for assigned meetings                                              |

Super Admins create accounts, assign roles and meetings, disable accounts, reset passwords, create/edit roles, and grant or revoke individual permissions. An individual revocation takes precedence over the role. **Vote reversal, attendance removal, shareholder deletion, and meeting deletion are reserved for Super Admin**, including when a custom role or individual grant is submitted directly to the API. Security administration cannot be delegated. Staff access to meetings always requires an assignment; registry access applies to the shared registry. Election Managers are automatically assigned to meetings they create.

Role and permission changes apply on subsequent API requests. Disabling an account, changing its role/email, or resetting its password revokes its sessions. Sessions expire after eight hours or thirty minutes without authenticated activity; background account polling does not keep them alive. Changing a password revokes other sessions and replaces the current session. Super Admin security changes require password confirmation within the preceding ten minutes. The last usable Super Admin cannot be disabled or demoted. Security changes and ballot corrections leave audit records; staff audit access is limited to assigned meetings and their own sign-in activity.

The public `/meetings/{id}/live` and `/meetings/{id}/attendance/live` screens and their `/api/public/meetings/{id}/...` endpoints require no login. Anonymous views expose aggregate attendance and nominee totals, never shareholder contact information, representative identities, or individual ballots. The attendance screen can additionally show animated welcome names for signed-in staff with attendance/report permission and access to that meeting; those names come from the protected attendance endpoint. Private APIs and server-rendered protected pages enforce authentication and permissions independently of visible controls.

Every shareholder has an independent ballot, including represented shareholders. Register each shareholder's direct or represented attendance and enter the shareholder ID printed on their card. Each chosen nominee receives only that shareholder's attendance snapshot share value. A representative handling two shareholders uses two separate cards with potentially different choices; if the representative is also a shareholder registered attending, their own card uses only their own shares. External representative IDs cannot record new ballots. Choice limits, retries and reversals are scoped to each shareholder, and other cards handled by the same representative do not prevent additional attendance registration or removal of an unvoted shareholder.

Older combined representative ballots remain preserved. Affected new cards, attendance changes and meeting closure are blocked until those records are corrected, preventing double counting and premature finalization. While voting is open, a Super Admin can use the vote workspace's older-ballot correction panel to explicitly reverse every combined choice with a reason, then enter each original shareholder card separately. Do not infer individual instructions from a combined record. Closed historical records remain read-only. Voting reports and Excel exports show shareholder ownership, representation metadata and clearly labeled older combined entries.

### Setup

Copy `.env.example` to `.env`, configure `DATABASE_URL` and the exact browser `AUTH_ORIGIN`, then run:

```powershell
npx prisma migrate deploy
npx prisma generate
npm run setup:admin -- --email admin@lucy.com --name "Lucy Admin" --credentials-file .local/initial-admin.txt
npm run dev
```

Bootstrap is disabled once an account exists. If initial setup was interrupted before the original administrator ever signed in, the same command with `--recover-pending` can reissue that unused temporary password; it refuses established accounts. `.local/` is ignored by Git. Delete the credential file after changing the password.

For production, set `AUTH_ORIGIN` to the exact browser-facing address, then run `npm run build` and `npm start`. Session cookies follow that address's protocol: HTTPS uses `__Host-voting-session` with `Secure`; HTTP uses `voting-session` without `Secure`, including production builds served over a LAN. Both cookies are host-only, HttpOnly, and SameSite=Strict. Mutations reject missing or mismatched origins. Login and password verification have database-backed attempt limits.

### RBAC verification

```powershell
npm test
npx tsc --noEmit
npm run test:rbac
npm run build
npm run test:lan-login
```

The unit suite exercises the real authorization wrapper and verifies that every private API method rejects anonymous requests. `test:rbac` applies migrations to a new temporary MySQL database, provisions synthetic users for every role, and checks login, password setup, assignments, overrides, role management, revocation, audit isolation, sensitive actions, projection privacy, duplicate delegated ballots, CSRF, throttling, and browser workflows. It requires permission to create/drop that temporary database and an installed Playwright Chromium (`npx playwright install chromium`). It stops its verification server and drops only the database it created. Local verification results and a UI screenshot are saved under `.local/rbac-verification/`.

`test:lan-login` checks the production build in Chromium through a LAN IPv4 address, including stored session cookies, sign-in, password changes, authenticated page reloads, and sign-out. It uses its own temporary MySQL database and server port, with the same database and Chromium prerequisites as `test:rbac`. Set `VOTING_VERIFY_HOST` to the server's LAN IPv4 address to choose the interface explicitly. Results are saved under `.local/lan-login-verification/`.

### Access from local, LAN, and production environments

Set `AUTH_ORIGIN` to the exact address people use in their browsers, including protocol and port. Restart Next.js after changing it.

| Environment | Example `AUTH_ORIGIN` | How to serve the app |
| --- | --- | --- |
| Local development | `http://localhost:3000` | `npm run dev` |
| LAN development/testing | `http://172.18.10.125:3000` | `npm run dev -- --hostname 0.0.0.0 --port 3000` |
| LAN production over HTTP | `http://172.18.10.125:3000` | `npm run build`, then `npm start -- --hostname 0.0.0.0 --port 3000` |
| LAN production over HTTPS | `https://voting.lucy.internal` | Production app behind an HTTPS reverse proxy |
| Internet production | `https://vote.yourdomain.com` | Production deployment with HTTPS |

For the LAN example, everyone, including the server computer, opens `http://172.18.10.125:3000/login`. Replace that example IP with the server’s current LAN address. Permit the app port through the server firewall when needed. The app accepts one configured origin; comma-separated addresses and wildcards are unsupported.

“Request origin is not allowed” means the browser’s protocol, hostname/IP, or port differs from `AUTH_ORIGIN`. After configuring a LAN IP, signing in through `localhost` will fail that check. Using a stable LAN hostname avoids changes when the server’s IP changes.

For production access at `http://172.18.10.125:3000`, set `AUTH_ORIGIN="http://172.18.10.125:3000"` in `.env`, then run:

```powershell
npm run build
npm start -- --hostname 0.0.0.0 --port 3000
```

Open `http://172.18.10.125:3000/login` from each computer. After sign-in, the same origin's home page displays the authenticated dashboard. HTTP LAN production uses a session cookie that the browser can store over HTTP. Use HTTPS for encrypted traffic; with a reverse proxy, set `AUTH_ORIGIN` to the public HTTPS address even if the proxy connects to Next.js through `http://127.0.0.1:3000`.

Keep `DATABASE_URL` pointing to the database as reached by the app server. LAN clients access the app; they do not connect directly to MySQL.

### Copying temporary passwords

The password dialog supports both HTTPS/localhost and HTTP LAN addresses. It first uses the Clipboard API when available, then tries the browser's legacy copy command inside the dialog so modal focus does not interrupt selection. The dialog confirms success or displays an error. If the browser blocks both methods, choose **Select password**, then press **Ctrl+C** (Windows/Linux) or **Command+C** (macOS). This works after both creating an account and resetting its password.

## Workspace design and accessibility

The workspace uses Lucy’s blue branding with a desktop sidebar, mobile navigation, and persistent light/dark themes. Navigation backgrounds, text, active/hover states, account details, and mobile controls follow the selected theme, including system preference changes. The dashboard and available actions follow each account’s permissions and meeting assignments.

The registry, meetings, reports, and audit history provide search/filter controls, readable tables, pagination, and loading, empty, error, and retry states. Attendance and nominee dialogs use labelled controls; nominee edits disappear after voting opens. Ballot entry shows attendance eligibility, share weight, previously recorded choices, and remaining limits. Reversals use a reason dialog and retain server-side authorization and audit history.

Report timestamps use East Africa Time. Attendance reports use meeting/attendance snapshots and export all attendance records to PDF. Voting exports include all matching records, fetching additional batches when the result exceeds 500 rows. Public projections expose aggregate figures only and reconnect automatically after a failed request. Printed cards retain the A4 layout, local Ethiopic font, and all-shareholder batches.

The attendance projection follows the supplied reference: Amharic heading and subtitle, Lucy logo, blue/green circular gauge with glows, adjacent clock, quorum status, five bordered statistic cards, floating welcomes for authorized staff, and **F**/**Esc** fullscreen controls. It retains light/dark styling and accommodates small screens. Zero total shares display `0.00%` with quorum unmet.

Keyboard users can skip to workspace content, navigate menus and dialogs, and return focus to the mobile menu button after closing navigation. Reduced-motion preferences and print layouts are supported.

### Hydration warnings

The reported warning showed an unexpected body attribute:

```diff
<body className="font-sans antialiased"
- location="172.18.10.125"
>
```

The application does not add `location` to `<body>`. That attribute indicates the document was modified before React hydrated, commonly by a browser extension or injected browser script. Test `/login` in a fresh browser profile or a private window with extensions disabled. If the warning disappears, disable the extension that modifies the page, then reload your usual browser.

The theme toggle uses the same initial markup on the server and client; theme-dependent controls and live timestamps update after mounting. Deterministic date/number formatting is used for server-rendered workspace content. The root `<html suppressHydrationWarning>` remains for the theme provider’s class change. Body and workspace-shell warnings are kept visible so actual application mismatches can still be diagnosed.

The workspace skip link always renders `href="#workspace-content"` and `className="skip-link"`. A stack pointing to that line alone does not identify the changed attribute. If a warning remains, compare in a fresh browser profile and capture the full server/client attribute diff; do not suppress the entire workspace to hide it.

### UI verification

`npm run test:rbac` also runs the browser UI suite in the temporary test database. It checks desktop/mobile navigation, persisted and system themes, registry forms and pagination, connection errors, meeting creation, nominees, attendance, ballot corrections, report filters and downloads, A4 cards, projections, administration, and audit history. Copy checks cover Clipboard API success, missing API, denied permissions, and manual selection after both user creation and password reset. Hydration checks cover reloads and navigation, differing browser locale/timezone, reduced motion, skip links, and Radix portals. It captures both runtime errors and console hydration warnings.

To exercise the temporary verification server through the actual HTTP LAN address:

```powershell
$env:VOTING_VERIFY_HOST = '172.18.10.125'
npm run test:rbac
Remove-Item Env:VOTING_VERIFY_HOST
```

Use the server's current LAN IPv4 address. The verifier chooses a free port and sets its own matching `AUTH_ORIGIN`; it does not change `.env`.

Screenshots, sample report downloads, and the UI verification result are saved to `.local/ui-verification/`. Existing election data and administrator credentials are not used for browser test mutations.

To build while a development server is running, use a separate build directory:

```powershell
$env:VOTING_BUILD_DIR = '.next-verify'
npm run build
Remove-Item Env:VOTING_BUILD_DIR
```

That directory is for verification. A normal deployment should build and start with the same `VOTING_BUILD_DIR` setting (or leave it unset for both).
