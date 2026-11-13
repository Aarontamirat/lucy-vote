# Install Lucy Voting on another server

This guide installs a fresh copy of Lucy Voting on a Windows server or workstation and makes it available to browsers on the same network. An Ubuntu/Debian equivalent follows the Windows instructions. The application uses Next.js and **MySQL**; the current Prisma schema is not configured for PostgreSQL.

Use [deployment.md](deployment.md) for automatic startup and HTTPS, [configuration.md](configuration.md) for environment settings, [operations.md](operations.md) for backups and moving an existing database, [troubleshooting.md](troubleshooting.md) for failures, and [user-guide.md](user-guide.md) for daily use. The documentation index is [README.md](README.md).

## 1. Decide which device is the server

| Device | What it needs | What it does |
| --- | --- | --- |
| Application server | Application source, Node.js/npm, access to MySQL, and a running production process | Builds and serves the application, handles sign-in, and stores records in MySQL. |
| Database server | MySQL 8.x | Stores accounts, shareholders, meetings, attendance, ballots, and audit records. For this guide it is the application server itself. |
| Staff computer, tablet, or phone | A current Chrome, Edge, Firefox, or Safari browser and network access to the application server | Opens the application URL and signs in. It does not need Node.js, npm, MySQL, or a copy of the source. |
| Projector/display computer | A browser and access to the same application URL | Opens the meeting projection page. |

Keep one authoritative database for an installation. Installing a separate empty database on each staff computer creates independent systems whose data is not shared. Copying source files alone does not transfer accounts or election records.

Choose the appropriate path before continuing:

- **Brand-new system with no existing data:** follow this guide in order, including database creation and the first administrator.
- **Moving the existing system to another server:** use the backup/restore procedure in [operations.md](operations.md). Restore the database and its migration history, retain existing accounts, and skip the first-administrator bootstrap.
- **Another browser device accessing the existing server:** skip server installation and go directly to [Connect staff devices](#9-connect-staff-devices).
- **Another application process using the existing database:** plan it as a deployment in [deployment.md](deployment.md); do not create a new database or repeat bootstrap.

The example server address throughout this guide is `172.18.10.125`, with port `3000`. Replace it with the actual address of your server.

## 2. Prepare the Windows server

Install the following on the server:

1. **Node.js 24 LTS**, including npm, from [nodejs.org](https://nodejs.org/en/download). Repository verification used Node.js `24.21.0`. Node.js 22 LTS is an alternative; use a maintained LTS release and verify the build on the target machine.
2. **MySQL Community Server 8.x** and the MySQL command-line client from [mysql.com](https://dev.mysql.com/downloads/mysql/). Install MySQL as a Windows service, set a database-administrator password, and keep its network access local for this single-server setup. MySQL Workbench is optional.
3. **Git**, only if the source will be obtained from a repository. A complete source ZIP is also suitable.
4. A current browser for the first sign-in and validation.

Use a machine that can remain powered on during use. Disable sleep for meeting sessions, provide sufficient free disk space for dependencies/builds/backups, and arrange reliable power and network access. Administrative Windows access is needed to install software and configure a firewall rule; running the application itself does not require an administrator account.

Open a new PowerShell window after installing Node.js and check:

```powershell
node --version
npm.cmd --version
Get-Service -Name '*mysql*'
```

The MySQL service should be running. If it is stopped, start the service using the actual name reported above, through Windows Services or an elevated PowerShell window. Common names are `MySQL80` and `MySQL84`.

Windows commands below use `npm.cmd` and `npx.cmd` so PowerShell execution policy does not prevent the npm wrapper from running. In environments where `npm` and `npx` already work, those shorter forms are equivalent.

## 3. Copy the complete source to the server

Obtain an approved, complete release of the application. Use a folder such as `C:\Voting\voting-app`, outside a user's temporary downloads folder. With a source ZIP:

```powershell
New-Item -ItemType Directory -Path 'C:\Voting' -Force
Expand-Archive -LiteralPath 'C:\Downloads\LucyVoting-source.zip' -DestinationPath 'C:\Voting\voting-app'
Set-Location -LiteralPath 'C:\Voting\voting-app'
```

If the ZIP creates an extra top-level directory, change into that directory instead. The current folder must contain `package.json`, `package-lock.json`, and `prisma`.

A source package must include application directories such as `app`, `components`, `lib`, `public`, `config`, and `prisma` **with all migration directories**, plus `scripts`, `tests`, documentation, `.env.example`, the lockfile, and the Next.js/TypeScript/CSS build configuration. Preserve local fonts and other files under `public`. A Git checkout contains only committed source; confirm the release includes all intended changes before packaging or cloning it.

Exclude these machine-specific or private files from a shared source package:

- `.env`, `.env.local`, `.env.production`, and other environment files containing secrets; retain `.env.example`.
- `node_modules`, `.next`, every `.next-*` verification/build directory, `out`, and `build`.
- `.local`, temporary administrator credentials, database backups, private keys/certificates, and logs containing private information.
- Generated caches such as `*.tsbuildinfo` and local editor state.

Install dependencies on the target server rather than copying another machine's `node_modules` or production build. Native binaries and generated files can differ across operating systems and architectures.

In the application folder, run:

```powershell
npm.cmd ci --include=dev
```

`npm ci` installs the versions locked in `package-lock.json`. `--include=dev` explicitly includes TypeScript, Prisma CLI, and the other build tools, even if the shell has `NODE_ENV=production`. Do not use `--omit=dev` during initial installation.

The server needs outbound network access for npm packages and Prisma/Next.js binary downloads. The `xlsx` dependency is fetched from `https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz`, not solely from the npm registry. A restricted proxy or firewall must allow that host too. See [troubleshooting.md](troubleshooting.md) if dependency installation fails; do not replace the lockfile just to bypass a download failure.

## 4. Create the fresh MySQL database and application account

This step is for an empty installation. For an existing system, restore its backup according to [operations.md](operations.md) instead.

Open the MySQL command-line client. If it is not on `PATH`, use its installed path; replace `8.4` if your version differs:

```powershell
$mysqlClient = 'C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe'
& $mysqlClient --user=root --password
```

Enter the database-administrator password when prompted. At the MySQL prompt, run the following SQL, replacing `REPLACE_WITH_DATABASE_PASSWORD` with a unique database password before execution:

```sql
SHOW VARIABLES LIKE 'lower_case_table_names';

CREATE DATABASE votingdb
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER 'voting_app'@'localhost'
  IDENTIFIED BY 'REPLACE_WITH_DATABASE_PASSWORD';

GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, DROP, INDEX, REFERENCES
  ON votingdb.* TO 'voting_app'@'localhost';

SHOW GRANTS FOR 'voting_app'@'localhost';
EXIT;
```

The grants allow the application and its deployment migrations to operate only on `votingdb`. They do not give global privileges, user-management privileges, or access to unrelated databases. More advanced deployments can use a separate migration account and a narrower runtime account; coordinate those accounts with [configuration.md](configuration.md).

Windows MySQL usually reports `lower_case_table_names = 1`. The repository's historical migrations mix uppercase and lowercase table references, so that setting matters when deploying the migration chain. Do not change this variable on an initialized server; see the Linux instructions below and [operations.md](operations.md) for cross-platform moves.

Test the application database credentials without putting the password in a command argument:

```powershell
& $mysqlClient --host=localhost --port=3306 --user=voting_app --password votingdb
```

At the MySQL prompt, `SELECT DATABASE();` should report `votingdb`. Run `EXIT;` to return to PowerShell. If MySQL reports a host-account mismatch, check the server's account-host configuration rather than granting access from every network address.

MySQL listens on port `3306` by default. Browser clients access port `3000` in this example and do not connect to `3306`.

## 5. Set the database connection and browser address

Find the server's LAN IPv4 address:

```powershell
Get-NetIPAddress -AddressFamily IPv4 |
  Where-Object { $_.IPAddress -notlike '127.*' -and $_.IPAddress -notlike '169.254.*' } |
  Select-Object InterfaceAlias, IPAddress
```

Choose the address on the Ethernet/Wi-Fi adapter reachable by staff devices, rather than a disconnected or virtual adapter. Reserve that IP in DHCP or arrange a stable hostname so the URL does not change unexpectedly.

For this fresh installation, create the configuration file:

```powershell
Copy-Item -LiteralPath '.env.example' -Destination '.env'
notepad.exe '.env'
```

Edit the file to contain your actual values:

```dotenv
DATABASE_URL="mysql://voting_app:URL_ENCODED_DATABASE_PASSWORD@localhost:3306/votingdb"
AUTH_ORIGIN="http://172.18.10.125:3000"
```

`DATABASE_URL` is interpreted by the application server. Its `localhost` means MySQL on that server, even when a browser is on a different computer. `AUTH_ORIGIN` is the exact address users open in their browsers: protocol, hostname or IP, and port. Do not add `/login`, a path, comma-separated alternatives, or wildcards. Everyone, including an administrator using the server's own browser, must use the same configured origin for sign-in and changes.

Percent-encode special characters in the database username/password when embedding them in the URL. For example, `@` becomes `%40`, `:` becomes `%3A`, `#` becomes `%23`, `/` becomes `%2F`, `?` becomes `%3F`, and `%` becomes `%25`. Encode only each credential component, not the entire URL. The SQL password remains the original unencoded password. Avoid placing real passwords in shared screenshots or shell history.

Protect `.env` with Windows file permissions appropriate to the account that runs the application. Do not distribute it to client devices. Existing operating-system environment variables can override values loaded from `.env`; see [configuration.md](configuration.md) if changes do not appear to take effect.

Session cookie settings follow `AUTH_ORIGIN`. HTTP LAN hosting uses a browser-compatible session cookie; HTTPS uses a Secure, host-prefixed cookie. Both are host-only, HttpOnly, and SameSite=Strict. Restart the application after changing `AUTH_ORIGIN`. Use [deployment.md](deployment.md) when setting up HTTPS and a reverse proxy.

## 6. Deploy the schema and create the first administrator

From the application folder:

```powershell
npx.cmd prisma migrate deploy
npx.cmd prisma generate
npx.cmd prisma migrate status
```

`migrate deploy` applies the checked-in migration history to the configured database. `generate` creates the Prisma client used by the application. `migrate status` should report that the schema is up to date before continuing.

For installation and production upgrades, use **`migrate deploy`**, not `migrate dev`, `migrate reset`, or `db push`. Development/reset commands can change or erase a database and do not replace the release's migration procedure. If migrations fail, stop and resolve the reported issue using [troubleshooting.md](troubleshooting.md); do not delete migration history or reset a database containing real data.

Create the initial Super Admin, using the intended administrator's email address and display name:

```powershell
npm.cmd run setup:admin -- --email 'admin@example.com' --name 'Lucy Administrator' --credentials-file '.local/initial-admin.txt'
```

The script creates the seven default roles and one Super Admin, generates a temporary password, and saves the credentials in the specified local file. There is no shared default administrator password. Keep that file private; on Windows use folder/file permissions to restrict access to the installing administrator and the application account where needed. The `.local` folder is ignored by Git, but should also be excluded from manual source bundles and shared folders.

Bootstrap is disabled once accounts exist. A restored database uses its existing accounts. If setup was interrupted before the original administrator ever signed in, [operations.md](operations.md) explains the narrowly limited `--recover-pending` option; it does not reset an established administrator.

## 7. Build and start the production application

Build the release on the server:

```powershell
npm.cmd run build
```

Continue only after the command succeeds. `npm run build` creates the production output; it does not start a persistent web server.

Start the application and bind it to all network interfaces:

```powershell
npm.cmd start -- --hostname 0.0.0.0 --port 3000
```

Keep this terminal open while completing first-run validation. Closing it, pressing **Ctrl+C**, signing out of the Windows session in some hosting arrangements, or restarting the machine can stop the application. Configure automatic startup and restart through [deployment.md](deployment.md) before relying on the system for a meeting.

Leave `VOTING_BUILD_DIR` unset for ordinary installation. If you deliberately use a custom build directory, build and start with the same setting. A build saved under a verification directory is not automatically used by a normal `npm start`.

## 8. Allow browser traffic and finish first sign-in

For a trusted LAN, create an inbound Windows firewall rule in an **elevated** PowerShell window:

```powershell
New-NetFirewallRule -DisplayName 'Lucy Voting LAN TCP 3000' -Direction Inbound -Action Allow -Protocol TCP -LocalPort 3000 -Profile Private -RemoteAddress LocalSubnet
```

The server's trusted LAN adapter must use the **Private** profile for this example. If the organization uses a managed Domain profile, ask its network administrator to apply an equivalent scoped rule. Adapt the allowed client subnet if devices are on routed networks. Do not add a browser-client MySQL rule. HTTPS hosting has different listening ports and rules; follow [deployment.md](deployment.md).

In a browser on the server, open:

```text
http://172.18.10.125:3000/login
```

Use the email and temporary password from `.local/initial-admin.txt`. The application redirects the initial administrator to the password-change page. Set a new password of **12–128 characters**, different from the temporary password. Store it in your approved password manager, then remove the temporary credentials file from the application folder:

```powershell
Remove-Item -LiteralPath '.local/initial-admin.txt'
```

After password setup, the root address `http://172.18.10.125:3000/` should show the signed-in dashboard. Returning to that root address after login is expected; returning there with the anonymous “Sign in to your workspace” page indicates a session problem. Follow [troubleshooting.md](troubleshooting.md) if that occurs.

## 9. Connect staff devices

On each computer, tablet, or phone:

1. Connect to a network that can reach the server. Guest Wi-Fi/client isolation can prevent access even if the devices use the same router.
2. Open `http://172.18.10.125:3000/login`, substituting the server's configured URL.
3. Sign in with the individual account supplied by a Super Admin and change its temporary password when prompted.
4. Bookmark the shared address. `localhost` on a staff computer means that computer itself and does not point to the application server.

In **Users & Roles**, the Super Admin should create individual staff accounts, choose appropriate roles, and assign their meetings. Meeting-based staff need explicit meeting assignments even if they can see other workspace functions. Follow [user-guide.md](user-guide.md) for registry preparation, meeting setup, nominees, attendance, voting cards, ballot entry, projections, and reports.

No application installation is required on these browser devices. Android/iOS users also open the web application in a supported browser.

## 10. Validate before recording real votes

Complete these checks on the server and at least one other network device:

- The login page loads at the configured URL on both devices.
- A valid account signs in and displays the authenticated dashboard; reloading keeps it signed in.
- A temporary-password account is required to change its password before using protected functions.
- A staff account sees its permitted functions and assigned meetings; it cannot access unrelated meetings.
- Sign-out returns the browser to unauthenticated access.
- A small rehearsal meeting completes registry/nominee setup, attendance, independent shareholder ballot entry, and a report export. Keep rehearsal records clearly separate from the real election.
- The chosen printer produces readable A4 cards and the projector opens the intended live screen.
- The server survives a planned restart with the hosting procedure in [deployment.md](deployment.md), and a backup has been produced according to [operations.md](operations.md).

For a source-level check, `npm.cmd test` runs the unit tests without needing a real election. Optional browser integration verification is described in [troubleshooting.md](troubleshooting.md): it uses separate temporary databases and requires extra database permissions plus Playwright Chromium. Do not give the normal runtime database user global create/drop privileges merely to run that optional verifier.

## Ubuntu/Debian server equivalent

The application/database/configuration concepts above are the same on Linux. Run the application as a dedicated ordinary user, keep MySQL local for this setup, and use a service manager for ongoing hosting. Replace the example paths and LAN address with your installation's values.

### A. Install Node.js and MySQL with compatible table-name behavior

Install Node.js 24 LTS with npm using a maintained distribution method from [nodejs.org](https://nodejs.org/en/download); an older distribution package named `nodejs` may not supply the intended LTS version. Verify `node --version` and `npm --version`. Install basic utilities:

```bash
sudo apt update
sudo apt install ca-certificates curl git unzip
node --version
npm --version
```

**Check MySQL table-name behavior before initializing a new server.** The historical migration chain mixes `Meeting`/`meeting` and other table-name cases. Default Linux MySQL commonly uses `lower_case_table_names=0`; this release's full migration chain needs case-insensitive names, normally `lower_case_table_names=1`. MySQL 8 fixes that setting at data-directory initialization. Changing a config file after a database already exists is not a valid conversion.

For a brand-new MySQL installation, create its configuration before installing the server package so initialization can read it:

```bash
sudo install -d -m 755 /etc/mysql/conf.d
sudo tee /etc/mysql/conf.d/lucy-voting.cnf >/dev/null <<'EOF'
[mysqld]
lower_case_table_names=1
EOF
```

On Ubuntu releases whose repositories provide MySQL 8, install it:

```bash
sudo apt install mysql-server
sudo systemctl enable --now mysql
sudo mysql -e "SHOW VARIABLES LIKE 'lower_case_table_names';"
```

Confirm the result is `1` before deploying migrations. Package initialization procedures vary; confirm that `/etc/mysql/conf.d/lucy-voting.cnf` is included by the server's configuration. If an already initialized server reports `0`, do not continue the full fresh migration chain against it or delete its data directory. Provision a correctly initialized separate MySQL instance or follow a planned DBA-led migration in [operations.md](operations.md).

On Debian, `default-mysql-server` commonly installs MariaDB. This guide targets **MySQL 8**, not MariaDB. If the distribution does not supply MySQL 8, configure the [official MySQL APT repository](https://dev.mysql.com/doc/mysql-apt-repo-quick-guide/en/) for your Debian release, select MySQL 8, and ensure the `lower_case_table_names=1` configuration is read before its first initialization. Then install/enable the MySQL service and run the same setting check. Use package names appropriate to that repository and release.

### B. Create the database and install the source

Open an administrative MySQL session with `sudo mysql` if local socket authentication is enabled, or `mysql --user=root --password` if using a database-administrator password. Run the same fresh database/user/scoped-grant SQL from [step 4](#4-create-the-fresh-mysql-database-and-application-account).

Create a dedicated deployment account if one does not already exist, then create its application directory:

```bash
sudo adduser --disabled-password --gecos '' voting
sudo install -d -o voting -g voting -m 750 /opt/voting-app
sudo -iu voting
cd /opt/voting-app
```

For an existing account, skip the `adduser` command. From that account, unpack the complete source ZIP into the application directory or check out the approved release. For example, if the source ZIP is available to that account in `/tmp`:

```bash
unzip /tmp/LucyVoting-source.zip -d /opt/voting-app
```

If the ZIP contains a top-level directory, use that directory as the working directory. Confirm `package.json` is present before continuing as the deployment user:

```bash
npm ci --include=dev
cp .env.example .env
chmod 600 .env
nano .env
```

Use the same `DATABASE_URL`/`AUTH_ORIGIN` example from [step 5](#5-set-the-database-connection-and-browser-address), with your own credentials/address. The SheetJS and other dependency-download requirements also apply on Linux.

### C. Migrate, bootstrap, build, and start

For a new empty installation:

```bash
npx prisma migrate deploy
npx prisma generate
npx prisma migrate status
npm run setup:admin -- --email 'admin@example.com' --name 'Lucy Administrator' --credentials-file '.local/initial-admin.txt'
npm run build
npm start -- --hostname 0.0.0.0 --port 3000
```

A restored installation skips bootstrap and follows [operations.md](operations.md) for its migration checks. Use the application's exact configured LAN URL to sign in, change the temporary password, and remove the credentials file with `rm -- .local/initial-admin.txt` after password setup.

In a separate administrative shell, if UFW is already used by your server, allow only the intended client subnet, substituting the correct subnet:

```bash
sudo ufw allow from 172.18.10.0/24 to any port 3000 proto tcp
sudo ufw status
```

Coordinate firewall changes with existing SSH and organization rules. Run the same browser validation from [step 10](#10-validate-before-recording-real-votes), then configure a persistent systemd service and any HTTPS proxy using [deployment.md](deployment.md).

## Printable installation checklist

- [ ] Server chosen; client devices will use browsers against one shared installation.
- [ ] Fresh-install or existing-database restore path selected.
- [ ] Node.js LTS/npm and MySQL 8 installed; MySQL service running.
- [ ] `lower_case_table_names` checked before deploying the historical migration chain.
- [ ] Complete approved source copied; secrets, dependencies, and old builds excluded.
- [ ] `npm ci` finished successfully, including SheetJS downloads.
- [ ] Dedicated `votingdb` database/user created or verified; database grants scoped to that database.
- [ ] `.env` has the server's database connection and exact shared browser origin.
- [ ] Stable IP/hostname arranged and browser access permitted through the correct firewall profile/subnet.
- [ ] `prisma migrate deploy`, `prisma generate`, and migration-status check completed.
- [ ] Fresh installation: initial Super Admin created, temporary password changed, credentials file removed.
- [ ] Existing installation: database restored with accounts/migration history; bootstrap skipped.
- [ ] Production build succeeded and application started on the intended address/port.
- [ ] Sign-in, reload, sign-out, roles/assignments, printing, and projection checked from another device.
- [ ] Backup/recovery procedure and automatic startup tested.
- [ ] Staff receive individual accounts, the correct URL, and [user-guide.md](user-guide.md).
