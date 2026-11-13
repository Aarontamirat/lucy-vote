# Troubleshooting

Use the displayed error and the point at which the workflow fails to choose the relevant section. A browser that cannot reach `/login` has a network/server problem; a reachable login page with a rejected sign-in may have an account, origin, cookie, or database problem.

For the supported setup, see [Installation](installation.md), [Deployment](deployment.md), [Configuration](configuration.md), and [Operations](operations.md). Staff workflows are in the [User guide](user-guide.md), and the [README](../README.md) provides the documentation index.

## 1. The application cannot be reached from another device

### Check the address and network

1. Use the server's published URL, for example `http://172.18.10.125:3000/login`. Replace the example with the current server address.
2. Do not use `localhost`, `127.0.0.1`, or `0.0.0.0` on a client. `localhost` and `127.0.0.1` refer to that client; `0.0.0.0` is a server listening address.
3. Confirm the client is on a network or approved VPN that can reach the server. Guest Wi-Fi may isolate devices even when both have internet access.
4. Confirm the application server is powered on, awake, and still connected to the expected interface. A changed DHCP address invalidates old bookmarks and `AUTH_ORIGIN`.

On the Windows server, list IPv4 addresses and identify the actual office interface:

```powershell
Get-NetIPAddress -AddressFamily IPv4
```

From a Windows client, test the application port:

```powershell
Test-NetConnection -ComputerName '172.18.10.125' -Port 3000
```

If the port test fails, investigate the running server, listening interface, firewall, and network routing before changing credentials. A successful ping alone does not establish that port 3000 is reachable.

### Confirm the production server is listening

`npm run build` creates the production application but does not keep a server running. Start it from the project directory:

```powershell
npm.cmd start -- --hostname 0.0.0.0 --port 3000
```

The process must remain running, or be managed by the service/process arrangement in [Deployment](deployment.md). Closing its terminal or shutting down the host stops a manually launched server.

Check the listener on Windows:

```powershell
Get-NetTCPConnection -LocalPort 3000 -State Listen
```

If the app opens on the server but the client port test fails, have the server administrator review the inbound firewall rule for the application port and the intended network profile. Permit browser access to the app port, not direct client access to MySQL. See [Deployment](deployment.md) for firewall setup.

If the server says `EADDRINUSE`, another process already owns that port. Identify it and decide whether it is the existing voting server or another service. Stop only the known process you intend to replace, or use a different port. A changed port must also be reflected in `AUTH_ORIGIN` and the browser URL.

## 2. Correct credentials return to the public home page

The home URL `/` displays a dashboard for an authenticated account and a landing page for an anonymous visitor. Going to `http://server:3000/` after sign-in is normal; seeing the anonymous landing page afterward means the next request did not authenticate.

Older builds set a production `Secure` cookie even when served over an HTTP LAN address. Browsers reject that cookie on an ordinary HTTP LAN host, so sign-in could succeed on the server without retaining the browser session.

### Use the corrected build and matching configuration

1. Set `.env` to the exact browser-facing address, for example:

   ```dotenv
   AUTH_ORIGIN="http://172.18.10.125:3000"
   ```

2. Stop the known running application process, rebuild the updated code, and start the production server:

   ```powershell
   npm.cmd run build
   npm.cmd start -- --hostname 0.0.0.0 --port 3000
   ```

3. Open the configured address followed by `/login` on every device, including the server's browser. Reload the page before trying again.
4. If an old session or cached build remains, clear site data for that application origin or use a fresh browser profile, then sign in again.

The corrected cookie behavior follows `AUTH_ORIGIN`, independently of development/production mode:

| Browser-facing address | Expected cookie | Attributes |
| --- | --- | --- |
| HTTP, including LAN production | `voting-session` | HttpOnly, SameSite=Strict, Path=/, host-only; no Secure flag. |
| HTTPS, including a reverse proxy | `__Host-voting-session` | Secure, HttpOnly, SameSite=Strict, Path=/, host-only. |

For HTTPS behind a reverse proxy, configure the public HTTPS origin even if the proxy talks to Next.js over HTTP. Use HTTPS when encrypted network traffic is required. There is no separate cookie-security environment switch in this application.

### Inspect the browser session when the problem persists

In browser developer tools, inspect the login request under Network and the application's Cookies under Application/Storage:

- A successful `POST /api/auth/login` should return a session cookie of the expected name. Check browser messages explaining a blocked cookie.
- Opening `/api/auth/me` in the same browser after sign-in should return the signed-in user. `401` means no usable session authenticated that request.
- The address must remain the same hostname/IP and protocol. Cookies for `localhost` do not authenticate a LAN IP, and switching between HTTP/HTTPS or hostnames may require a new sign-in.
- Check whether browser policy or extensions block site cookies. Test a fresh profile before changing application code.
- Ensure the server's clock is correct, as session expiry uses server time.

Do not send session cookie values or passwords with a support report. The status code, cookie name, flags, and exact public URL are sufficient for initial diagnosis.

For administrator verification after a successful production build, run:

```powershell
npm.cmd run test:lan-login
```

This uses Chromium, a free server port, and its own temporary MySQL database. It requires create/drop permission for that temporary database and an installed Playwright Chromium. It checks real browser cookie storage, login, password rotation, reloads, and sign-out. See [Operations](operations.md) for verification prerequisites.

## 3. Sign-in displays an error

| Message or symptom | Likely cause | Action |
| --- | --- | --- |
| **Request origin is not allowed** | Browser protocol, hostname/IP, or port differs from `AUTH_ORIGIN`; or a request is cross-origin. | Use the exact configured browser address, correct the server configuration if the published address changed, and restart Next.js. |
| **Application origin has not been configured** | Production server has no `AUTH_ORIGIN`. | Set the exact HTTP/HTTPS browser origin in the server environment or `.env`, then restart. |
| **Invalid application origin configuration** | `AUTH_ORIGIN` cannot be parsed as a URL. | Supply one valid origin including protocol and port where needed. |
| **Invalid email or password** | Wrong credentials, disabled account, or a password replaced by a reset. | Check the account email and current password; ask a Super Admin to verify active status or reset the account. |
| **Too many sign-in attempts. Try again in 15 minutes.** | The database-backed attempt limit was reached. | Wait for the limit window and use the verified current credentials. |
| **Sign-in is temporarily unavailable** | Database connectivity, missing authentication tables, or another server error. | Server administrator checks logs and database/migrations; see sections 5 and 6. |
| Password-change page appears | New/reset account has mandatory password setup. | Complete the change with the supplied temporary password and a new 12–128-character password. |

One exact origin is supported; comma-separated addresses, wildcards, and different aliases are not an allowed-origins list. For HTTP LAN hosting, configuring the LAN IP means signing in through `localhost` is rejected. Use a stable hostname/IP and ensure all bookmarks agree.

The expected origin comes from the server environment. A process-level `AUTH_ORIGIN` can override `.env`; restart the process with the intended settings after a change. [Configuration](configuration.md) explains the precedence and deployment variables.

Successful authentication/password verification clears its corresponding attempt limit. Do not repeatedly guess a lost temporary password; use the account-reset workflow instead. There is no supported staff control to bypass authentication throttling.

## 4. npm, Node.js, build, or start commands fail

Run server commands from the repository directory containing `package.json`. Client computers do not run npm commands.

| Symptom | Check and resolution |
| --- | --- |
| `npm` or `node` is not recognized | Install the supported Node.js version on the server, reopen the terminal, and verify `node --version` and `npm --version`. Node.js 24 is the preferred verified version for this repository. |
| PowerShell blocks `npm.ps1` | Use `npm.cmd` for the command or have the administrator apply the organization's script-execution policy. Do not broadly disable workstation protections as a troubleshooting step. |
| `ENOENT` for `package.json` | Change to the extracted/cloned application root, not its parent directory or an `app/` subdirectory. |
| `npm build` is unrecognized | The script command is `npm run build`. |
| Cannot find Next.js or Prisma modules | Install locked dependencies with `npm ci`, then generate Prisma as documented in Installation. |
| Dependency download fails | Confirm network access to the npm registry and the SheetJS package source referenced in `package-lock.json`; check proxy/certificate configuration. Preserve the lockfile. |
| No production build found | Run `npm run build` successfully before `npm start`. |
| Build completes but browser still shows old behavior | Restart the process serving that build and reload the client. Confirm the process starts from the intended repository and build directory. |
| `EADDRINUSE` | The selected port is already in use; identify the owner and choose the intended process/port. |

`VOTING_BUILD_DIR` must be the same for build and start, or unset for both so both use `.next`. A build in `.next-verify` is not automatically used by a server starting from `.next`. Keep verification builds separate when another development server is running; see [Deployment](deployment.md).

The build script disables integrated lint, so a successful build is not evidence that `npm run lint` ran. Use the validation commands in [Operations](operations.md) when reviewing a deployment. Preserve actual error text and report the failing command; do not delete the database or reset migrations to fix a compilation error.

## 5. Database connection or missing-table errors

This repository's Prisma datasource is **MySQL**. A PostgreSQL connection string is not compatible with the supplied schema and migrations.

1. Confirm MySQL is running and reachable from the application server.
2. Check that `DATABASE_URL` identifies the intended server, port, existing database, username, and password. Special characters in URL credentials must be encoded correctly; see [Configuration](configuration.md).
3. Confirm the database user has the privileges needed for the operation. Application use, deployment migrations, and verification create/drop operations have different requirements.
4. From the application root, inspect migration status:

   ```powershell
   npx.cmd prisma migrate status
   ```

5. For a supported new installation or reviewed deployment, apply the included migrations and generate the client as described in [Installation](installation.md):

   ```powershell
   npx.cmd prisma migrate deploy
   npx.cmd prisma generate
   ```

6. Restart the application after correcting the database/client setup.

If `Session`, `User`, `Role`, `LoginThrottle`, `AuditLog`, or `SecurityLock` tables are missing, the authentication/RBAC migration has not completed in the database the application is actually using. If election fields are missing, the election migrations likewise need review. Check the configured database and migration history rather than creating tables by hand.

Use backup and deployment procedures from [Operations](operations.md) before changing an existing database. `prisma migrate reset` is not an upgrade or troubleshooting procedure for retained election data.

### Linux MySQL: table not found during migration / `P3018`

Historical SQL migrations and raw queries mix uppercase and lowercase table names. The supported MySQL instance must use `lower_case_table_names=1`, provisioned **before the MySQL data directory is initialized**. Many Linux MySQL installations default to case-sensitive `0`, unlike common Windows installations.

An administrator can inspect the running value:

```sql
SHOW VARIABLES LIKE 'lower_case_table_names';
```

If a fresh Linux installation fails with a missing table despite an earlier migration creating a differently cased name, follow the MySQL provisioning steps in [Installation](installation.md). For an existing populated instance or partially applied migration, preserve the database and logs, take a verified backup, and follow the recovery process in [Operations](operations.md). MySQL 8 cannot safely have this setting changed against an already initialized data directory.

Do not mark a failed migration applied merely to silence `P3018`, rename tables blindly, or change the live MySQL setting. A migration-history repair requires verifying the actual schema and completed SQL; it is not equivalent to creating the missing tables.

## 6. The first administrator cannot be created or its password is lost

There is no hardcoded default administrator password. On a new database, the setup command creates the selected account and generates a random temporary password. The email/name used in examples are placeholders; they are not guaranteed accounts in an existing installation.

If setup reports that the RBAC migration or security lock is missing, finish the database installation before bootstrapping. If it reports **Bootstrap is disabled after the first account is created**, the database already has accounts. Sign in as an existing Super Admin and use **Users & Roles** to add/reset users.

The limited `--recover-pending` option can reissue the original bootstrap password only when all of these remain true: it is the sole account, still active, still Super Admin, still requires password setup, has the exact original email and display name, and has never successfully signed in or had a session. It also requires the original bootstrap audit record. See [interrupted administrator setup recovery](operations.md#9-recover-interrupted-administrator-setup) for the command.

A server-side successful login followed by a browser-cookie failure still counts as a successful login for that recovery check. Correcting LAN cookie configuration does not turn an established account into an unused bootstrap account.

For an established user's lost password, another usable Super Admin resets it through **Users & Roles**. The current UI does not offer email recovery or let bootstrap replace established administrators. If every usable administrator credential is lost, involve the system owner and follow the controlled backup/recovery process in [Operations](operations.md); do not wipe the database to recover access.

## 7. A meeting, workspace, or action is missing

Ask a Super Admin to check the account's active state, role, individual overrides, and assigned meetings. Non-admin staff require a meeting assignment even when the role grants the action. Registry access applies to the shared registry and does not grant every meeting.

| Symptom | Explanation |
| --- | --- |
| Meeting absent from the list | Account is unassigned, or search/status filters exclude it. Clear filters and check assignments. |
| **Access denied** | The page/action permission or meeting assignment is missing. |
| **Users & Roles** unavailable | This workspace is for Super Admins. Custom role grants cannot delegate it. |
| **Reverse** or remove-attendance control missing | Those corrections are reserved for Super Admins. |
| Edit/nominee controls read-only | Rules/nominees are locked after voting opens; closed meetings are read-only. |
| **Open attendance** absent | It applies to Draft meetings and requires the opening permission. |
| **Open voting** absent | It applies to Attendance open meetings and requires the opening-voting permission. |
| **Delete meeting** absent | Only a Super Admin can delete a Draft meeting. |

Reload after an access change. Some account changes revoke sessions, so a fresh sign-in may be required. An individual **Revoke** takes precedence over an ordinary role grant. The last usable Super Admin cannot be disabled/demoted; another active Super Admin must have completed password setup first.

When account/role changes request **Confirm your password**, enter the signed-in Super Admin's own current password. This is the required recent verification for security changes, not the password of the account being edited.

## 8. Excel import or shareholder entry fails

Use **Download Excel template** from the live Import dialog. The recognized headers are `Id`, `Name`, `Name Am`, `Phone`, `Address`, and `Share Value`; `Id`, `Name`, and `Share Value` are required. A new individually entered shareholder additionally requires **Amharic Name** in the current Add form.

Check these causes:

- Workbook is not `.xlsx`/`.xls`, is empty, damaged, password protected, or larger than 5 MB.
- More than 10,000 data rows are present below the header; split the approved batch.
- Headers are missing, duplicated, or unrecognized. Preserve the downloaded template.
- IDs duplicate one another or an existing registry ID, including case/accent-equivalent identifiers. Import creates records rather than updating them.
- Excel changed leading zeros or long identifiers into numbers/dates. Format IDs, phone numbers, and exact share values as text before entering them.
- Formula cells remain. Replace formulas with their values.
- Share values contain commas, currency symbols, negative signs, or too many digits. Import permits at most 24 digits before the decimal and 6 after it.
- A text field exceeds 191 characters.

Use the reported worksheet row/column errors to correct the file. Validation failure imports none of that batch. If a network interruption occurred after submission, refresh the registry and reconcile which records exist before submitting again, since the server may have completed the import even if the client missed the response.

See the [User guide import instructions](user-guide.md#5-maintain-the-shareholder-registry) and the [training template](training/examples/Shareholder_Import_Template.xlsx).

## 9. Attendance or ballot entry is rejected

### Attendance

Registration requires Attendance open or Voting open status and the correct staff permission/assignment. A shareholder already registered cannot be checked in again. Search results show unregistered matches; check the existing attendee list if the holding disappears from the selection list.

For representation, select the right representative type. An external ID cannot be an existing shareholder ID; choose **Shareholder representative** for a holder acting as a representative. Existing representative records must be available for the meeting. Register each holding separately, even when one representative handles multiple cards.

To correct direct/represented attendance, a Super Admin removes the affected attendance and registers it correctly while open. First reverse that shareholder's choices if it has voted. Changing another independently owned card handled by the same representative is not required.

### Voting

| Message or symptom | Resolution |
| --- | --- |
| Shareholder not registered attending | Verify the card ID and register that holding's direct/represented attendance in this meeting. A printed card alone does not establish attendance. |
| Zero vote weight | Review the attendance snapshot and approved register. A zero-weight holding cannot record a ballot. |
| External representative ID rejected | Enter the shareholder ID printed on each card. External representatives do not have their own ballots. |
| Choice limit reached | Count already Recorded choices as well as current Selected choices. In grouped elections the per-group limits also apply. |
| Nominee cannot be selected again | That choice is already recorded for this shareholder; use a Super Admin reversal for a genuine correction. |
| Selection is visible but totals unchanged | **Selected** is unsaved. Record the choices and verify **Recorded**. |
| Meeting is not open for voting | An authorised manager must open voting; a closed meeting cannot accept changes. |

If the save response is interrupted, look up the same card again to inspect persisted choices before retrying. Repeating the same recorded choice does not duplicate it, but submitting different choices can fill remaining slots. Do not use another shareholder ID to bypass eligibility or limits.

### Older combined ballots

The **Correct older combined ballots** panel indicates preserved historical votes that combined holdings or used representative IDs. Affected new ballots, attendance changes, and closure remain blocked until a Super Admin reverses every listed old choice while voting is open, with a reason. Then enter each original shareholder card independently. Obtain the original instructions; the combined record cannot determine the separate choices.

Closed historical records remain read-only. See [Independent shareholder ballots](independent-shareholder-ballots.md) and the [Trainer guide](training/Trainer_Guide.md) before correction.

## 10. Closing the meeting fails, or results seem inconsistent

The normal **Close meeting** control requires an open meeting, the close permission and assignment, quorum, and no unresolved older combined ballots. It locks records and does not provide a reopening option.

If closure fails, check current status, quorum, outstanding legacy correction messages, and server logs. The normal UI may report **Failed to close meeting** without the detailed quorum calculation. The current close check uses live registry holdings, while attendance/report quorum displays use snapshots. Registry changes during the meeting can cause a disagreement. Reconcile against the approved register with the system owner; do not change shares merely to force closure.

When interpreting results:

- Aggregate nominee weight can exceed attended shares in a multi-choice election. Each chosen nominee receives the voter's own weight.
- Projection Support % uses attended shares; results-page percentage uses total weight across nominee choices.
- Leading status remains provisional while voting is open.
- Ties crossing the final seat cutoff are flagged; there is no manual tie-resolution/winner-override control.
- Zero-weight nominees are not declared winners.

Complete corrections and reconciliation before closure. The current normal UI cannot reopen a closed meeting or alter its ballots.

## 11. PDF, Excel, or print output is unexpected

### Attendance PDF and voting Excel

**Generate PDF** on Attendance report exports all attendance rows regardless of the on-screen search or page. If it fails, confirm the report loads, the browser can download files, and `/logo.png` is reachable from the same application origin.

**Export Excel** on Voting report exports every row matching the last **applied** filters, including additional pages beyond 500 rows. Changing filter fields without **Apply filters** does not change the export. Use **Clear filters** for a full-election workbook. A shareholder/representative search or date/weight filter can intentionally reduce the exported subset.

Report timestamps are formatted in East Africa Time; meeting inputs and date/time filter fields use browser-local time. A client in a different timezone can select a different time interval unless the local input is interpreted carefully. Check the machine timezone and entered range rather than expecting all local filter displays to say EAT.

Numerical screen formatting may round displayed shares/weights. Compare the approved exact values and export, not just a rounded metric. Review the **Summary**, **Nominee results**, and **Vote audit** workbook sheets for ownership/representation context.

### Voting cards

Cards require valid configured winner counts and registry records. The batch covers all registered shareholders, including people not attending. Printing does not check them in. A blank/no-card screen may mean the registry is empty or the account lacks card permission/assignment.

Use A4 print preview, verify three cards per page, and inspect the full name spaces and signatures. The application requests zero margins and hides navigation; if browser-generated URL/date/page headers remain, disable **Headers and footers** in the browser print dialog. Check printer scaling and margins rather than changing shareholder records to fit the page.

If Amharic screen/card glyphs are missing, confirm the deployed `public/fonts` assets are present and reachable, wait for loading, and reload in a supported browser. The application bundles the Ethiopic font locally; workstation font installation is not the primary fix.

## 12. Projection is blank, stale, or cannot go fullscreen

Confirm the meeting URL is correct and the application is reachable. Allow the application popup when **Open projection screen** is blocked, or open its `/meetings/{id}/live` URL directly using the real meeting ID. Move the window to the projector on an extended desktop, then press **F**; use **Esc** to leave fullscreen.

The public election projection refreshes every three seconds; the protected results page refreshes every ten seconds. Check connection/error status and wait for a successful update. If an error persists, verify the network and reload; a previously displayed total can remain on screen during a connection problem.

Public projection routes intentionally do not require staff login and show aggregate data. Absence of individual ballot/contact information is expected. Attendance welcome names additionally require a signed-in account with attendance/report permission and meeting access.

Use the election display controls to change nominee-name language and theme. The attendance heading and paper-card labels are primarily Amharic; not every screen has the election projection's language options.

## 13. Password copy fails or a hydration warning appears

On HTTP LAN hosts, the modern Clipboard API may be unavailable. The temporary-password dialog tries a legacy copy method and reports success/failure. If both are blocked, use **Select password**, then **Ctrl+C** on Windows/Linux or **Command+C** on macOS. Verify the pasted value privately and avoid adding spaces/newlines. See [User guide administration](user-guide.md#11-administer-accounts-roles-and-audit-history).

If the browser logs a hydration warning with an unexpected body attribute such as `location="172.18.10.125"`, the application does not add that attribute. Test a fresh browser profile or a private window with extensions disabled. An extension or injected script may have changed the document before React loaded.

If the warning remains in a clean profile, preserve the complete server/client difference and affected route, confirm the client and server use the current build, and report it. Do not suppress all hydration warnings or remove authentication controls to hide the symptom.

## 14. Prepare a useful support report

Record the exact public URL, affected route/workflow, visible message, HTTP status when available, approximate time with timezone, role, meeting identifier, browser/version, and whether another device or clean browser profile reproduces it. For server issues, record the command, Node.js version, operating system, build directory, migration status, and relevant redacted log lines.

Do not include passwords, temporary credentials, session tokens, full credential-bearing `DATABASE_URL` values, or unnecessary shareholder contact details. For an interrupted save or **Started** audit entry, check the actual stored state before retrying or changing data; Started is not a final success outcome.
