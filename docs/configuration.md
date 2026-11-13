# Configuration reference

[Documentation home](README.md) · [Installation](installation.md) · [Deployment](deployment.md)

This guide describes settings implemented by this application. Examples use `C:\Voting\voting-app`, database `votingdb`, and LAN address `172.18.10.125`; replace them with your own values. Run commands from the application directory unless a step says otherwise.

## 1. Environment file

Create `.env` in the application root from [.env.example](../.env.example). It belongs beside `package.json`, not inside `docs`, `app`, or `public`.

```dotenv
DATABASE_URL="mysql://voting_app:ENCODED_DATABASE_PASSWORD@localhost:3306/votingdb"
AUTH_ORIGIN="http://172.18.10.125:3000"
```

`ENCODED_DATABASE_PASSWORD` is a placeholder for the database user's actual password. It is different from a staff member's sign-in password. Keep `.env` private and transfer it separately from a source archive.

| Setting | Required? | Purpose | Example |
| --- | --- | --- | --- |
| `DATABASE_URL` | Yes | MySQL connection used by the application server, Prisma, and setup scripts | `mysql://voting_app:ENCODED_PASSWORD@localhost:3306/votingdb` |
| `AUTH_ORIGIN` | Yes for deployment | Exact browser-facing origin allowed to make changes; also selects session-cookie security | `http://172.18.10.125:3000` |
| `VOTING_BUILD_DIR` | Optional | Next.js build directory; defaults to `.next` | `.next-verify` for a separate verification build |
| `VOTING_VERIFY_HOST` | Optional, verification only | LAN IPv4 address used by the browser verification scripts | `172.18.10.125` |
| `NEXT_TELEMETRY_DISABLED` | Optional | Next.js telemetry preference; `1` disables telemetry | `1` |
| `NODE_ENV` | Managed by Next.js commands | `npm run dev` uses development behavior; build/start use production behavior | Do not force `development` for a production server |

No `NEXTAUTH_URL`, `AUTH_URL`, `SESSION_SECRET`, CORS wildcard, or public database variable is needed by the current implementation. Session tokens are random values whose hashes are stored in MySQL.

### Environment precedence

Keep deployment configuration in one `.env` file unless you intentionally manage process-level variables. Next.js also recognizes `.env.local`, `.env.production`, and `.env.production.local`; those files can override `.env` for a production build/server. Existing process environment variables have higher priority.

The `setup:admin`, `test:rbac`, and `test:lan-login` npm scripts explicitly use Node's `--env-file=.env`. They do not automatically read Next.js's `.env.local` files. Conflicting files can make the app and setup scripts connect to different databases. Inspect file names and process settings without publishing their contents.

Restart the actual running Next.js process after changing configuration. Restarting a terminal without restarting the app does not reload its session-cookie settings. An address change normally needs a restart; a code change needs a new build and restart.

## 2. Database connection

The Prisma datasource is **MySQL**. PostgreSQL connection strings are incompatible with the checked-in schema and migrations.

```text
mysql://USERNAME:PASSWORD@DATABASE_HOST:PORT/DATABASE_NAME
```

| Part | Meaning |
| --- | --- |
| `USERNAME` / `PASSWORD` | Dedicated MySQL account, separate from application users |
| `DATABASE_HOST` | Host reachable from the application server |
| `PORT` | Usually `3306`; use your actual MySQL listener port |
| `DATABASE_NAME` | Database containing shareholder, meeting, vote, user, session, audit, and migration tables |

When MySQL is installed on the same server, `localhost` refers to that server. Browser clients never use `DATABASE_URL` and do not need MySQL access. If MySQL is on another machine, use its address and permit database connections only from the application server.

Percent-encode reserved characters in the username or password component, rather than encoding the whole URL. For example, the fictional password `Demo@Pass#1` becomes `Demo%40Pass%231`. Common replacements are `@` → `%40`, `#` → `%23`, `%` → `%25`, `/` → `%2F`, `:` → `%3A`, and `?` → `%3F`. Do not paste your real password into a public URL encoder.

Use MySQL 8.x with `utf8mb4` for Amharic and other Unicode text. The historical migrations mix table-name capitalization, so provision MySQL with `lower_case_table_names=1` before its data directory is initialized. Windows commonly already uses this setting. Existing Linux instances initialized with `0` need a compatible separate instance; changing the setting and restarting an existing instance is not a supported conversion. See [installation prerequisites](installation.md) and [database transfer](operations.md).

## 3. Browser address and session cookies

`AUTH_ORIGIN` contains only the protocol, host/IP, and port when non-default. Do not include `/login`, an API path, a comma-separated list, or `*`.

| Deployment | `AUTH_ORIGIN` | Address opened by users | Cookie behavior |
| --- | --- | --- | --- |
| One-computer development | `http://localhost:3000` | `http://localhost:3000/login` | `voting-session`, HTTP-compatible |
| LAN production on port 3000 | `http://172.18.10.125:3000` | `http://172.18.10.125:3000/login` | `voting-session`, HTTP-compatible |
| LAN production on port 3100 | `http://172.18.10.125:3100` | `http://172.18.10.125:3100/login` | Same policy; app listener and firewall must also use `3100` |
| HTTPS reverse proxy | `https://voting.example.com` | `https://voting.example.com/login` | `__Host-voting-session`, `Secure` |

Both session-cookie variants are host-only, HttpOnly, SameSite=Strict, and use path `/`. The configured browser protocol determines `Secure`, including after `npm run build`. HTTP LAN production is supported; HTTPS encrypts traffic between users and the server.

The app accepts one configured origin. If it is a LAN IP, users on the server computer must use that same LAN IP too: signing in at `http://localhost:3000` will fail the origin check. A hostname and an IP are different origins even if they reach the same computer. Prefer a stable address or DNS name and give everyone the same URL.

`0.0.0.0` is a listener address for binding to network interfaces. It is not a browser address and must not be used for `AUTH_ORIGIN`.

With a reverse proxy, set `AUTH_ORIGIN` to the public HTTPS address even when Next.js listens internally at `http://127.0.0.1:3000`. Configure the proxy as described in [deployment](deployment.md).

## 4. Commands and build directories

| Command | Use |
| --- | --- |
| `npm ci --include=dev` | Install the exact locked dependencies on the target server, explicitly including build tools |
| `npx prisma migrate deploy` | Apply pending checked-in migrations to the configured database |
| `npx prisma generate` | Generate the Prisma client on the target system |
| `npm run setup:admin -- --email EMAIL --name "NAME" --credentials-file .local/initial-admin.txt` | Create the first administrator on a fresh database |
| `npm run build` | Create the production build |
| `npm start -- --hostname 0.0.0.0 --port 3000` | Serve the production build directly on the LAN |
| `npm run dev -- --hostname 0.0.0.0 --port 3000` | Development server, for development/testing |
| `npm test` | Unit/business/authorization checks; no live election data needed |
| `npx tsc --noEmit` | Type checking |
| `npm run lint` | ESLint; production build currently skips lint |
| `npm run test:rbac` | Full integration/browser checks in a temporary database |
| `npm run test:lan-login` | Production HTTP LAN sign-in check in a temporary database, after building |

The build needs development dependencies such as TypeScript, Prisma CLI, and Tailwind/PostCSS. `--include=dev` keeps those tools installed even if the shell has `NODE_ENV=production`. Do not install with `npm ci --omit=dev` before building this source distribution. The browser verification tools also need development dependencies. Windows examples use `npm.cmd` and `npx.cmd` to avoid PowerShell wrapper execution-policy failures; they run the same npm/Prisma tools.

For a separate verification build in PowerShell:

```powershell
$env:VOTING_BUILD_DIR = '.next-verify'
npm.cmd run build
npm.cmd run test:lan-login
Remove-Item Env:VOTING_BUILD_DIR
```

A server using a custom directory must start with that same setting. Do not build into a directory while a running server is using it; use another release directory or stop the server first. Keep generated `.next*` directories out of cross-platform source transfers and build again on the target.

## 5. Ports and access

| Port | Listener | Who needs access? |
| --- | --- | --- |
| `3000`, or your chosen app port | Next.js | LAN browser clients for direct HTTP deployment |
| `3306`, or your MySQL port | MySQL | Application server and approved database administration/backup tools |
| `443` | HTTPS reverse proxy | Browser clients when HTTPS is deployed |
| `80` | Optional HTTPS redirect/certificate validation | Depends on the chosen proxy and certificate setup |

For direct LAN hosting, permit the app port on the intended Windows network profile and subnet. For a proxy deployment, bind Next.js to loopback and expose the proxy ports. Detailed commands are in [deployment](deployment.md).

## 6. Application limits and time

These values are implemented in code; they are not environment settings in the current version:

| Behavior | Current value |
| --- | --- |
| Absolute session lifetime | 8 hours |
| Idle session timeout | 30 minutes without authenticated activity |
| Background account polling | Does not extend the idle session |
| Recent password confirmation for security administration | 10 minutes |
| Sign-in/password verification attempt window | Up to 5 attempts per scope per 15-minute window |
| Shareholder workbook extensions | `.xlsx` and `.xls` |
| Shareholder import limit | 5 MiB file size; 10,000 data rows |
| Import error display | Up to 50 detailed issues, plus the total issue count |
| Report timestamp formatting | East Africa Time, `Africa/Nairobi` |

Keep server and client clocks synchronized. Meeting date/time entry uses the browser's local time, so a workstation with the wrong timezone can enter the wrong meeting time.

## 7. Deployment record

Record these values privately for the operator who will support the installation:

- Application source release/commit and build date.
- Server name, LAN IP/DNS name, browser URL, and listening port.
- Application folder and build directory.
- MySQL host, port, version, database name, and table-name setting.
- MySQL user name and the protected location of its credentials.
- Administrator contact, startup method, log location, and backup location.

Keep passwords and database dumps out of a publicly shared deployment record. Continue with [deployment](deployment.md), [operations](operations.md), or [troubleshooting](troubleshooting.md).
