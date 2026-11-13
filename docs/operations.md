# Operations, backups, updates, and moving servers

[Documentation home](README.md) · [Installation](installation.md) · [Deployment](deployment.md) · [Troubleshooting](troubleshooting.md)

This guide is for the administrator maintaining a deployed application. Example paths use `C:\Voting\voting-app` and `C:\Voting\backups`; replace them with the actual installation paths. MySQL commands need the MySQL client tools on `PATH`, or their full executable paths.

## 1. What must be preserved

| Item | Why it matters |
| --- | --- |
| Complete MySQL application database | Registry, meetings, attendance/vote snapshots, users, roles, assignments, audit records, and `_prisma_migrations` |
| Exact source release and `package-lock.json` | Rebuild the application version that matches the database |
| `prisma/schema.prisma` and all migration folders | Diagnose and apply the correct schema history |
| Protected `.env` configuration | Reconnect to the correct database and serve the intended browser URL |
| Startup/proxy configuration and certificate renewal details | Restore automatic startup and HTTPS, if used |
| Final reports, approved paper cards, and organizational records | Retain election evidence outside the application according to your process |

The current application stores persistent business records in MySQL. Importing an Excel workbook adds database records; it does not create a permanent upload archive. Browser-exported PDFs and Excel files are downloaded to the client computer. Back them up separately if they are required records.

Do not use report exports as a substitute for a full database backup. Do not copy a live MySQL data directory between computers; use a logical dump and restore.

Keep backups outside `public` and outside a generally shared source folder. Database dumps contain personal information, password hashes, and authentication records. Limit access, keep a protected copy on a second device, and verify that restoration works.

## 2. Routine checks

Before an event, confirm:

1. MySQL and the application startup task/service are running.
2. A staff computer can open the exact configured `/login` URL.
3. A staff account can sign in, open its assigned meeting, and reload the page while remaining authenticated.
4. The registry and meeting totals agree with the approved preparation records.
5. Printer output is readable on A4 and the projection screen is reachable.
6. At least one usable Super Admin is available for account resets and corrections.
7. A recent backup exists and its location is known.

After an event, export the required reports, record the application version and meeting ID, and take a database backup. Choose a backup schedule appropriate to how much recorded work the organization can afford to re-enter; during an active election, a backup only from the previous day may be insufficient.

## 3. Back up MySQL

Use MySQL's `mysqldump` from a version compatible with the server. The examples dump one database without `--databases`, allowing it to be restored under another database name. They include `_prisma_migrations` automatically.

`--single-transaction` provides a consistent snapshot for InnoDB tables. Do not apply schema migrations or make other DDL changes during the dump. For a final transfer or an update, stop application writes first. Leave MySQL running.

### Windows PowerShell

Use a MySQL user with permission to read the application's tables. The scoped installation account can be used; a dedicated backup account is also possible.

```powershell
New-Item -ItemType Directory -Path 'C:\Voting\backups' -Force
$votingDumpFile = Join-Path 'C:\Voting\backups' ('votingdb-' + (Get-Date -Format 'yyyyMMdd-HHmmss') + '.sql')
mysqldump --host=localhost --port=3306 --user=voting_app --password --single-transaction --quick --skip-lock-tables --no-tablespaces --set-gtid-purged=OFF --default-character-set=utf8mb4 "--result-file=$votingDumpFile" votingdb
if ($LASTEXITCODE -ne 0) { throw 'Database backup failed. Check the MySQL error before continuing.' }
Get-Item -LiteralPath $votingDumpFile
Get-FileHash -LiteralPath $votingDumpFile -Algorithm SHA256
```

`--password` prompts for the MySQL password; do not append it to the command. `--result-file` makes MySQL write the SQL file directly and avoids PowerShell output-redirection encoding problems. A file existing, by itself, does not prove the backup succeeded: check the exit code and validate a restore.

### Linux shell

Choose a backup directory writable by the backup operator:

For the example `/opt` directory, an administrator can create it once for the `voting` account:

```bash
sudo install -d -o voting -g voting -m 700 /opt/voting-backups
```

Then run the dump as that account:

```bash
voting_dump_file="/opt/voting-backups/votingdb-$(date +%Y%m%d-%H%M%S).sql"
mysqldump --host=localhost --port=3306 --user=voting_app --password --single-transaction --quick --skip-lock-tables --no-tablespaces --set-gtid-purged=OFF --default-character-set=utf8mb4 --result-file="$voting_dump_file" votingdb
```

Continue only if `mysqldump` exits successfully, then inspect the file and record its checksum:

```bash
ls -lh "$voting_dump_file"
sha256sum "$voting_dump_file"
```

For scheduled backups, use a protected MySQL option/login file managed by the operator rather than embedding a password in a task command or script. Record backup failures and test restoration periodically. Apply the organization's retention policy to old dumps instead of deleting the only known working copy.

## 4. Test or perform a restore

A restore executes the SQL in the dump. **Use a new, empty database first.** Do not test by restoring over the currently used election database.

### Step 1: Prepare a compatible target

Confirm MySQL version compatibility and `lower_case_table_names=1`. The migration history contains mixed table-name casing, and a Linux instance initialized with `lower_case_table_names=0` is not a compatible fresh migration target. This setting is chosen at MySQL initialization; do not change it on a populated server. See [installation](installation.md).

Using a MySQL administrator connection, create a separate database and grant the intended account access to that database:

```sql
CREATE DATABASE votingdb_restore CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
GRANT ALL PRIVILEGES ON votingdb_restore.* TO 'voting_app'@'localhost';
```

The grant assumes the local `voting_app` MySQL user already exists. Use the installation guide to create it on a new server. Substitute the database host/account policy if MySQL is remote.

### Step 2: Import the dump

On Windows, launch the MySQL client with the restore database selected:

```powershell
mysql --host=localhost --port=3306 --user=voting_app --password --default-character-set=utf8mb4 votingdb_restore
```

Then enter this command **inside the MySQL client**, replacing the example filename:

```sql
SOURCE C:/Voting/backups/votingdb-YYYYMMDD-HHMMSS.sql;
SHOW TABLES;
```

Use forward slashes in this MySQL `SOURCE` path. The example backup path contains no spaces. Check the MySQL output for import errors; do not treat a partially imported database as ready.

On Linux, run the equivalent client command and use the absolute dump path:

```bash
mysql --host=localhost --port=3306 --user=voting_app --password --default-character-set=utf8mb4 votingdb_restore
```

```sql
SOURCE /opt/voting-backups/votingdb-YYYYMMDD-HHMMSS.sql;
SHOW TABLES;
```

### Step 3: Require fresh sign-ins on the restored copy

Restores can bring back sessions that were valid at backup time. In the **restored database only**, clear transient authentication records so users must sign in again:

```sql
DELETE FROM Session;
DELETE FROM LoginThrottle;
EXIT;
```

Retain the user, role, audit, meeting, attendance, and vote records. Do not rerun first-admin bootstrap against a restored database containing established accounts.

### Step 4: Verify against the matching application release

Use a separate application folder and `.env` pointing to `votingdb_restore`. If testing beside a live server, choose a different app port and matching `AUTH_ORIGIN`; do not change the live server's configuration.

```powershell
npm.cmd ci --include=dev
npx.cmd prisma migrate status
npx.cmd prisma generate
npm.cmd run build
npm.cmd start -- --hostname 0.0.0.0 --port 3100
```

For this example, the test `.env` must use `AUTH_ORIGIN="http://172.18.10.125:3100"` and the restore database. If the source release matches the dump, migration status should report the expected history. Apply pending migrations only when intentionally upgrading this restored copy.

Sign in with an established account, confirm shareholders, meeting statuses, attendance and vote totals, view reports, and inspect the audit history. Use read-only checks on a recovery copy before deciding to make it authoritative. Record the successful restore date and backup filename.

## 5. Update an existing installation

Plan the update outside an active ballot-entry period. Applying migrations can change schema/data; review the release and back up before proceeding.

1. Record the current source release, database name, MySQL version, `.env` settings, startup configuration, and build directory.
2. Obtain the new source release in a separate folder. Keep `package-lock.json`, all migrations, `config`, and `public` assets. Do not overwrite the current working release while it is running.
3. Stop the application and its automatic startup task/service so no client can write during the maintenance window. Stop the Next.js process, leaving MySQL running.
4. Take and verify a final database dump. Preserve the old application release and its configuration.
5. Create the new release's `.env` with the intended existing database and browser origin. Do not replace it with `.env.example` values.
6. Install dependencies and apply the checked-in database update from the new release:

```powershell
npm.cmd ci --include=dev
npx.cmd prisma migrate status
npx.cmd prisma migrate deploy
npx.cmd prisma generate
npm.cmd test
npm.cmd run build
```

7. If any command fails, stop and resolve its error before starting the new release. The production build skips lint; run `npm run lint` as a separate check when reviewing a release.
8. Point the startup task/service to the new application folder, with the correct working directory and build-directory setting. Start it using the deployment guide.
9. Sign in from another computer, reload a protected page, verify meeting/registry/report access, and confirm sign-out.
10. Keep the old release and pre-update backup until the new release and its records have been accepted.

Do not use `prisma migrate reset`, `prisma migrate dev`, or `prisma db push` as a deployment upgrade procedure. They do not provide the reviewed migration-history workflow used by this project. Do not mark a failed migration as applied without understanding and repairing the actual database state.

## 6. Roll back an update

Changing application files alone does not undo a database migration. There is no automatic down-migration procedure supplied by this project.

For a database-changing rollback, stop writes, preserve a dump of the current state for investigation, restore the pre-update backup into a new compatible database, and run the previous source release against that restored database. Confirm migration history, data totals, sign-in, and reports before changing the official service configuration.

A restore returns records to the backup's point in time. Work recorded after that backup is not automatically merged; reconcile it through the organization's approved process before continuing. Avoid alternating two servers that contain different copies of the election.

## 7. Move the application to another server

Opening the app from an additional staff computer needs only a browser; it does not require these transfer steps. Use them when replacing the machine that hosts Next.js/MySQL.

1. Prepare the new server using [installation](installation.md), including a compatible MySQL table-name setting. Transfer source and assets, not `node_modules`, `.next*`, the live MySQL data directory, or a public copy of `.env`.
2. Practice a restore and build on the new server using a recent dump. Check existing users, role assignments, meeting totals, reports, Amharic fonts, printing, and LAN sign-in.
3. Agree on the final transfer time. Stop the old application and disable its automatic restart.
4. Make a final consistent backup and transfer it with the matching release/configuration over an approved protected channel.
5. Restore to an empty database on the new server. Revoke restored sessions as described above. Existing application accounts remain; do not bootstrap a replacement administrator.
6. Set the new `DATABASE_URL` and exact browser `AUTH_ORIGIN`. Apply any intentionally pending migrations, generate Prisma, build, and start the new release.
7. Update DNS/DHCP reservation, app-port firewall rule, service/task, and proxy certificate as needed. If the URL changes, update staff bookmarks and projection URLs.
8. Verify from a separate client device, then declare the new server authoritative. Keep the old server stopped and preserve its backup for the agreed retention period.

If the database stays on its existing server, change only the app connection and allow the new app host's MySQL connection. Do not create a separate empty database unless a separate installation is intended.

## 8. Logs and startup

For a foreground `npm start`, errors appear in the terminal. For automatic startup, inspect the configured Task Scheduler log/helper output or the Linux service journal described in [deployment](deployment.md). MySQL startup/connectivity problems may require its own service logs.

The Windows helper appends to `.local/logs/server.log`. To rotate it, stop the startup task and confirm its Next.js listener stopped, copy the log to a dated file in the protected log archive, then clear the original log with `Clear-Content -LiteralPath 'C:\Voting\voting-app\.local\logs\server.log'`. Restart the task and confirm new entries appear. Choose a retention limit appropriate to available disk space. Linux systemd logs use the system journal; inspect its size with `sudo journalctl --disk-usage` and manage retention through the server's journald policy.

Record the timestamp, source release, affected URL, exact error, and whether the issue occurs on the server, client, or both. Redact passwords, connection strings, temporary credentials, session cookies, and private shareholder information before sharing diagnostics.

There is no dedicated health endpoint. `/login` returning HTTP 200 checks the app page; anonymous `/api/auth/me` returning HTTP 401 is expected. A successful staff sign-in plus an authenticated page reload is a stronger database/session check.

## 9. Recover interrupted administrator setup

For an established account, use another usable Super Admin's **Users & Roles** password-reset workflow. Bootstrap does not reset established accounts. Keep a second authorized Super Admin available and complete that account's password setup before disabling or demoting the first one.

If initial installation was interrupted before its original administrator ever signed in, the bootstrap script has a limited recovery option. It requires exactly the original active Super Admin account with the original email/name, an unchanged pending-password-setup state, no prior sessions or successful sign-ins, and the original bootstrap audit record. Use the same email and name as the original setup:

```powershell
npm.cmd run setup:admin -- --email 'admin@example.com' --name 'Lucy Administrator' --recover-pending --credentials-file '.local/initial-admin.txt'
```

If recovery succeeds, use the newly issued temporary password, complete the password change, and remove the temporary credential file. If it refuses, follow established account recovery with an authorized administrator; do not delete user/role/audit records or reset the database to force bootstrap to run. The application has no public email-based account recovery workflow.

## 10. Optional release verification

`npm test`, TypeScript, lint, and the production build are local code checks. The integration checks additionally create temporary MySQL databases and real Chromium sessions:

```powershell
npx.cmd playwright install chromium
npm.cmd run test:rbac
npm.cmd run build
npm.cmd run test:lan-login
```

Run integration checks from a separate verification checkout/configuration with a database account allowed to create and drop the uniquely named test databases. A production MySQL user granted only `votingdb.*` may not have these permissions; do not broaden its rights merely to make optional checks pass. The tests use synthetic accounts and remove the databases they create.

`test:rbac` runs a development verification server and a wide set of workflow/permission checks. `test:lan-login` uses the selected production build and an actual non-loopback LAN IPv4 address to check cookie acceptance, login, password rotation, reloads, and logout. Use `VOTING_VERIFY_HOST` to select that interface. Results are written under `.local/`.

These tests should be run during release preparation, not in place of an event rehearsal or a verified backup. See [configuration](configuration.md) for command and environment details.
