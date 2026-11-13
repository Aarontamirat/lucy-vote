# Deployment and access from other devices

Deploy the production app on one server and let other computers, tablets, and phones connect through a browser. The server runs Node.js and reaches MySQL using `DATABASE_URL`. Client devices need neither Node.js nor MySQL, and they do not receive the server's `.env` file.

Complete [installation](installation.md) first, including dependencies, database migrations, Prisma generation, and the initial administrator account. See [configuration](configuration.md) for environment settings, [operations](operations.md) for backups and upgrades, [troubleshooting](troubleshooting.md) for failures, and the [user guide](user-guide.md) for daily work. The [README](../README.md) provides the short setup commands.

## Choose the address users will open

`AUTH_ORIGIN` must contain the single browser-facing origin: protocol, hostname or IP address, and any non-default port. Use the same address on the server computer and every client device.

| Deployment | Example `AUTH_ORIGIN` | Browser address |
| --- | --- | --- |
| Windows LAN using HTTP | `http://172.18.10.125:3000` | `http://172.18.10.125:3000/login` |
| LAN with an HTTPS reverse proxy | `https://voting.lucy.internal` | `https://voting.lucy.internal/login` |
| Deliberate public HTTPS deployment | `https://vote.example.com` | `https://vote.example.com/login` |

Replace every example IP address, hostname, and installation path with your actual values. Do not include `/login`, another path, a list of addresses, or a wildcard in `AUTH_ORIGIN`. `localhost` identifies the device opening the browser; `0.0.0.0` is a server listening address. Neither is the shared LAN address.

Production builds support HTTP LAN sign-in. Session settings follow the configured browser-facing protocol:

| Setting | HTTP origin | HTTPS origin |
| --- | --- | --- |
| Session cookie name | `voting-session` | `__Host-voting-session` |
| `Secure` cookie attribute | Absent, allowing HTTP LAN browsers to store it | Present |
| Other cookie settings | Host-only, HttpOnly, SameSite=Strict, path `/` | Host-only, HttpOnly, SameSite=Strict, path `/` |

HTTPS encrypts the traffic between the browser and server. An HTTPS reverse proxy can forward to Next.js over HTTP on the same machine; `AUTH_ORIGIN` still uses the public HTTPS address. Sign-in and other writes reject missing or mismatched request origins in both deployment modes.

After successful sign-in, navigating to the same address's `/` page is expected: it displays the authenticated dashboard. Returning to the public welcome page after accepted credentials means the session was not available; use the sign-in checks in [troubleshooting](troubleshooting.md).

## Windows: serve the production app on the LAN

The examples below use `C:\Voting\voting-app` as the application directory and TCP port `3000`. Use the directory containing this project's `package.json`, `.env`, `node_modules`, and production build.

### 1. Establish a stable LAN address

On the server, open PowerShell and run:

```powershell
ipconfig
Get-NetConnectionProfile
```

Choose the IPv4 address of the connected Ethernet or Wi-Fi adapter. Avoid loopback, disconnected adapters, VPN addresses that clients cannot reach, and automatic `169.254.x.x` addresses. In the running example, that address is `172.18.10.125`.

Reserve the server's address in the router or DHCP server so it remains stable after reboot. An administrator can alternatively assign a static address with the correct subnet, gateway, and DNS settings. Coordinate the address with the network administrator to avoid duplicate addresses.

A stable internal DNS hostname is another option. Configure DNS so that every client resolves it to the server's LAN address, then use that hostname in `AUTH_ORIGIN` and bookmarks. Merely renaming the computer does not ensure every device can resolve its name. For example:

```powershell
nslookup voting.lucy.internal
```

### 2. Configure the app and database connection

Edit the server's `.env`. If MySQL runs on the same server, keep the database address local:

```dotenv
DATABASE_URL="mysql://APP_USER:ENCODED_PASSWORD@127.0.0.1:3306/votingdb"
AUTH_ORIGIN="http://172.18.10.125:3000"
```

Use the actual database account, password, and database name established during [installation](installation.md). Encode special characters in URL credentials as described in [configuration](configuration.md). If MySQL runs on a separate database server, `DATABASE_URL` uses the address reachable from the app server, and the database firewall permits that app server.

LAN clients communicate with the app on port `3000`. Do not open MySQL port `3306` to client computers as part of this deployment. Configure the MySQL Windows service to start automatically if it is hosted locally.

### 3. Build and start

After installation and database setup, run these commands from a normal PowerShell terminal:

```powershell
Set-Location "C:\Voting\voting-app"
npm.cmd run build
npm.cmd start -- --hostname 0.0.0.0 --port 3000
```

`npm run build` produces the production build; `npm start` serves it. Keep the terminal running while testing. Closing it or pressing **Ctrl+C** stops that manually started app. Do not run a second server on the same port.

The default build directory is `.next`. If you intentionally set `VOTING_BUILD_DIR`, the build command and start command must use the same value. A scheduled task or service must receive that value too. Building into `.next-verify` and starting with the default `.next` serves a different build or fails to find one.

Rebuild after changing application code or dependencies. Changing `AUTH_ORIGIN` requires stopping and restarting the Node.js server so all authentication code uses the new setting.

### 4. Permit the app through the Windows firewall

For a trusted private LAN, confirm the server's network uses the **Private** profile. Network profile changes and firewall rules require an elevated PowerShell terminal and administrative permission. If the trusted adapter is incorrectly marked Public, the administrator can change that specific adapter:

```powershell
Set-NetConnectionProfile -InterfaceAlias "Ethernet" -NetworkCategory Private
```

Replace `Ethernet` with the adapter name shown by `Get-NetConnectionProfile`. Use the organization's network policy for managed Domain networks instead of changing their profile.

Create an inbound rule limited to the app port, private networks, and clients on the local subnet:

```powershell
New-NetFirewallRule -DisplayName "Lucy Voting LAN TCP 3000" -Direction Inbound -Action Allow -Protocol TCP -LocalPort 3000 -Profile Private -RemoteAddress LocalSubnet
```

Create the rule once; inspect or edit it when deployment settings change. If authorized clients use another routed subnet or VLAN, have the network administrator scope the rule to the required subnet addresses. Wi-Fi guest isolation can prevent devices from reaching the server even when this firewall rule exists.

### 5. Connect the other devices

From the server browser and every client browser, open:

```text
http://172.18.10.125:3000/login
```

The protocol, IP or hostname, and port must match `AUTH_ORIGIN`. Opening `http://localhost:3000` on the server after configuring the LAN IP uses a different origin and cannot sign in through that configuration.

From another Windows device, test connectivity if the page does not open:

```powershell
Test-NetConnection 172.18.10.125 -Port 3000
```

`TcpTestSucceeded: True` confirms the TCP connection, but complete the browser sign-in checks below to verify authentication. On phones and tablets, connect to the network that can reach the server and enter the same browser URL. Save that URL as the bookmark or home-screen shortcut.

## Windows: start automatically after reboot

Windows Task Scheduler can run the production app without an interactive terminal. This project does not install a Windows service automatically.

Set up automatic startup only after manual LAN sign-in works. Ensure the server stays powered on and does not sleep during meetings. A scheduled task does not keep a sleeping or shut-down computer available.

### Prepare the startup helper

Choose the Windows account that will run the task. It needs permission to read the application, dependencies, build, and `.env`, and write the app's cache and local log directory. It also needs access to MySQL through the configured database credentials. Keep `.env` and credential files accessible only to the deployment account and authorized administrators. The task normally does not need **Run with highest privileges**.

Check the installed executable paths:

```powershell
Get-Command node.exe
Get-Command npm.cmd
```

Create a file named `C:\Voting\run-voting.cmd` yourself, outside the source checkout if you want it retained across releases. Use the following contents, replacing the application and Node.js paths when necessary:

```bat
@echo off
setlocal
cd /d "C:\Voting\voting-app"
if errorlevel 1 exit /b 1
if not exist ".local\logs" mkdir ".local\logs"
set "NODE_ENV=production"
set "PATH=C:\Program Files\nodejs;%PATH%"
call "C:\Program Files\nodejs\npm.cmd" start -- --hostname 0.0.0.0 --port 3000 >> ".local\logs\server.log" 2>&1
exit /b %errorlevel%
```

Next.js loads the app's `.env` from the working directory. Do not copy database credentials into the helper. If the deployment uses a custom build directory, add its matching value before the `call` line, for example `set "VOTING_BUILD_DIR=.next-production"`. Preserve that value when building future releases.

Logs append to `C:\Voting\voting-app\.local\logs\server.log`. Review and rotate that file using the process in [operations](operations.md); it otherwise keeps growing.

### Create the scheduled task

Open **Task Scheduler** and choose **Create Task**:

1. **General:** name it `Lucy Voting`, select the deployment account, and choose **Run whether user is logged on or not**. Supply that account's Windows credentials when requested. The task then runs noninteractively without a visible terminal. Local policy may require **Log on as a batch job** for the account.
2. **Triggers:** add **At startup**. A short delay, such as 30 seconds, lets the network and local database service start. Confirm the database is available after reboot; a delay alone does not guarantee readiness.
3. **Actions:** choose **Start a program**. Set **Program/script** to `C:\Windows\System32\cmd.exe`, **Add arguments** to `/d /c "C:\Voting\run-voting.cmd"`, and **Start in** to `C:\Voting\voting-app`.
4. **Conditions:** choose the settings appropriate for an always-on server. Account for battery restrictions if using a laptop, and ensure any required network condition matches the actual connection.
5. **Settings:** enable **Allow task to be run on demand** and restart on failure, for example every minute for three attempts. Disable the default limit that stops the task after it has run for several days. For **If the task is already running**, choose **Do not start a new instance**.

Stop the manually started server with **Ctrl+C**, then select the new task and choose **Run**. Check its status, its log file, and the browser URL. A status of **Running** is expected while the app is serving requests.

Reboot the server during a planned maintenance window. Verify MySQL starts, the task runs without signing in to Windows, the page opens from a second device, and sign-in survives a page reload. If the task account's password changes, update its saved credentials. If the task fails, inspect **History**, **Last Run Result**, and `server.log` before starting extra copies of the app.

Use [operations](operations.md) to stop and upgrade the running deployment. Confirm the existing listener has stopped before starting another instance on port `3000`.

## Linux: persistent app with optional HTTPS reverse proxy

The following example uses systemd and Nginx on Ubuntu or Debian. Other distributions use their equivalent package and service tools. Complete [installation](installation.md) on the Linux server first. Use a non-root deployment account, shown here as `voting`, and an application directory, shown as `/opt/voting-app`.

The current migration history mixes the capitalization of table identifiers. Its MySQL server must use `lower_case_table_names=1`. On Linux, provision that setting **before initializing a new MySQL data directory**, following [installation](installation.md). Adding the setting and restarting an already initialized MySQL server is not a valid conversion. A Linux app server can also connect to a separate compatible MySQL server, with database access scoped to the app server. Confirm this prerequisite before applying migrations.

The account needs to read `.env` and the installed application and write Next.js cache/build files where required. Protect `.env` with restrictive ownership and permissions. Run dependency installation, database migrations, Prisma generation, and builds using the intended deployment account and configured database, following the installation and upgrade instructions.

The `User` and `Group` named in the unit below must exist. Replace `voting` with your established deployment account and group, or have an administrator create a dedicated account before transferring the application into its directory.

### Configure the browser-facing HTTPS origin

For the HTTPS example, configure:

```dotenv
DATABASE_URL="mysql://APP_USER:ENCODED_PASSWORD@127.0.0.1:3306/votingdb"
AUTH_ORIGIN="https://voting.example.com"
```

Replace `voting.example.com` with the hostname users will open. Configure public or internal DNS to resolve that hostname to the reverse proxy. For an internal hostname, every LAN device must be able to resolve it.

Obtain a TLS certificate and matching private key for that hostname before enabling the HTTPS configuration. A public certificate requires a domain and certificate-authority validation. A private hostname can use an internal certificate authority, with that authority trusted on each client device. The configuration below assumes you already have a certificate chain at `/etc/ssl/voting/fullchain.pem` and its private key at `/etc/ssl/voting/privkey.pem`; replace those paths with your actual files. Arrange certificate renewal through the chosen certificate provider or internal PKI.

### Run Next.js with systemd

Build from the application directory:

```bash
cd /opt/voting-app
npm run build
command -v node
```

Use the absolute Node.js path printed by `command -v node` in `ExecStart`. The example uses `/usr/bin/node`; some installations use another path. Ensure the `voting` account can execute it. systemd does not inherit your interactive shell's Node version-manager setup.

Create `/etc/systemd/system/voting-app.service` as an administrator:

```ini
[Unit]
Description=Lucy Voting application
Wants=network-online.target
After=network-online.target

[Service]
Type=simple
User=voting
Group=voting
WorkingDirectory=/opt/voting-app
Environment=NODE_ENV=production
ExecStart=/usr/bin/node /opt/voting-app/node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3000
Restart=on-failure
RestartSec=5
KillSignal=SIGTERM
TimeoutStopSec=30
NoNewPrivileges=true

[Install]
WantedBy=multi-user.target
```

Next.js loads `.env` from `WorkingDirectory`; this unit does not need database credentials embedded in it. If you use a custom build directory, add `Environment=VOTING_BUILD_DIR=YOUR_BUILD_DIRECTORY` with the exact value used during the build. Replace `YOUR_BUILD_DIRECTORY` before installing the unit.

If MySQL is local, enable its actual service to start automatically. You can add ordering for that service to the unit after confirming its installed name, commonly `mysql.service` or `mysqld.service` for MySQL.

Load and start the app:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now voting-app
sudo systemctl status voting-app --no-pager
sudo journalctl -u voting-app -n 50 --no-pager
curl --head http://127.0.0.1:3000/login
```

The loopback request checks that Next.js serves a page. Browser sign-in happens at the configured HTTPS origin through the proxy. Binding Next.js to `127.0.0.1` keeps its upstream port local to this server.

For a Linux HTTP LAN deployment without a proxy, configure the LAN HTTP `AUTH_ORIGIN` instead and change `--hostname 127.0.0.1` to `--hostname 0.0.0.0`. Permit port `3000` only from the intended client networks using the server's firewall, then run the same LAN browser checks as on Windows.

### Install and configure Nginx for HTTPS

If Nginx is not already installed, an administrator can install it on Ubuntu or Debian:

```bash
sudo apt update
sudo apt install nginx
```

Create `/etc/nginx/sites-available/voting-app` with the following configuration. Replace every `voting.example.com` occurrence and both certificate paths:

```nginx
server {
    listen 80;
    server_name voting.example.com;
    return 301 https://voting.example.com$request_uri;
}

server {
    listen 443 ssl;
    server_name voting.example.com;

    ssl_certificate /etc/ssl/voting/fullchain.pem;
    ssl_certificate_key /etc/ssl/voting/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    client_max_body_size 6m;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Port $server_port;
        proxy_set_header Connection "";
        proxy_buffering off;
    }
}
```

Nginx forwards `Origin` and `Sec-Fetch-Site` request headers by default. Preserve them and the browser-facing host; authentication compares the request origin with `AUTH_ORIGIN`. The app's HTTPS cookie settings come from that configured origin, even though the upstream connection is HTTP. `client_max_body_size 6m` allows the application's 5 MiB Excel upload plus multipart overhead; Nginx's default 1 MiB limit would reject larger valid imports before they reach the app.

Enable this site once, validate the entire Nginx configuration, and start or reload Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/voting-app /etc/nginx/sites-enabled/voting-app
sudo nginx -t
sudo systemctl enable --now nginx
sudo systemctl reload nginx
```

If the site is already enabled, edit its existing file and skip the symlink command. On a server with other sites, retain their configuration and use the established reload process after `nginx -t` succeeds. Resolve duplicate hostname/listener configurations before restarting.

Permit HTTPS port `443` and, if using the HTTP redirect, port `80` through the existing firewall for the intended client networks. Preserve administrative access when adjusting firewall rules. Port `3000` stays on loopback; MySQL remains reachable only by its required app/database administrators.

Open `https://voting.example.com/login` from a client. Confirm the hostname resolves, the browser trusts the certificate, the certificate matches the hostname, and sign-in survives reload. Avoid adding a proxy cache for authenticated pages or APIs. Follow [operations](operations.md) to monitor the service, maintain logs, and keep certificates current.

## Verify the deployment before a meeting

Run these checks through the exact URL configured in `AUTH_ORIGIN`, including at least one separate client device:

1. Open `/login`. Confirm the page loads and the expected app branding appears.
2. Try an incorrect password. The form should show an error and remain on sign-in.
3. Sign in with a real provisioned account. An account still using its temporary password must open `/account/password`; complete that change and confirm the dashboard appears.
4. Refresh the dashboard and open a permitted protected page, such as `/meetings`. The account should remain signed in. For HTTPS, the browser's cookie storage should show `__Host-voting-session` with `Secure`; for HTTP LAN, it should show `voting-session` without `Secure`.
5. As a Super Admin, verify **Users & Roles** opens. Check a representative staff account has only its intended actions and assigned meetings. Use a clearly identified test meeting for workflow checks.
6. Sign out. Opening a protected page should require sign-in again.
7. On a projection device, open the intended public live screen, such as `/meetings/MEETING_ID/live`, using an actual meeting ID. Confirm aggregate updates appear. See the [user guide](user-guide.md) for display and fullscreen controls.
8. If automatic startup is configured, verify the same checks after a planned server reboot without an interactive server terminal.

For an automated production HTTP LAN regression check, see `npm run test:lan-login` in the [README](../README.md). It requires Playwright Chromium and permission to create and drop its own temporary verification database. This is a separate test environment, not a way to provision production accounts.

## Change the address, protocol, or port

Plan an address change outside active voting. Update `AUTH_ORIGIN`, restart the app, and update all client bookmarks and shortcuts. If switching between HTTP and HTTPS, expect users to sign in at the new origin: the two modes use different session cookie names.

When changing the listening port, update all of these together:

- The `--port` argument in the manual command, Task Scheduler helper, or systemd unit.
- The browser port in `AUTH_ORIGIN` for direct LAN hosting.
- The firewall rule for direct LAN hosting.
- The `proxy_pass` upstream port if using a reverse proxy. The HTTPS browser origin stays the same when only the internal upstream port changes.

After editing a systemd unit, run `sudo systemctl daemon-reload` before restarting the app. After editing Nginx, run `sudo nginx -t` before reloading it. Recheck login, reload, sign-out, and access from another device. A DHCP reservation or stable DNS name reduces the need for address changes.

## Deliberate internet access

The LAN procedure serves devices that can reach the server's network. Public internet access is a separate deployment decision involving public DNS, routing or hosting, firewall access, and a trusted HTTPS certificate. Use the exact public HTTPS URL as `AUTH_ORIGIN`, and keep the database connection restricted to the app's required network access. A private LAN IP is not a public deployment address.

This application needs its Node.js server and database-backed API routes. Deploy it with a production Next.js server; a static website export does not provide sign-in, account management, attendance, or voting APIs.
