# Staff user guide

This guide describes the current Lucy voting application: staff maintain shareholder records, register attendance, and enter choices from paper voting cards. Shareholders do not need application accounts to cast a paper ballot. Each represented shareholder retains an independent ballot and share weight.

For server setup, use [Installation](installation.md), [Deployment](deployment.md), and [Configuration](configuration.md). Administrators should also read [Operations](operations.md). The [project README](../README.md) links the complete documentation set; [Troubleshooting](troubleshooting.md) covers errors encountered below.

## 1. Connect from another computer, phone, or tablet

Ask the administrator for the exact application URL and your assigned staff account. For example, a server on the local network might publish `http://172.18.10.125:3000`. This is an example address; use the address provided for your installation.

1. Connect the device to the network that can reach the application server. For an internal deployment this may be the office LAN or an approved VPN.
2. Open a current browser, such as Chrome or Edge, and enter the supplied URL followed by `/login`.
3. Bookmark that exact address. The protocol, hostname or IP, and port must match the configured application address.
4. Sign in and use the navigation appropriate to your role. On a narrow screen, open the navigation menu to switch workspaces.

Client devices need a browser and network access. They do not need Node.js, npm, Prisma, MySQL, a copy of the source code, or database credentials. The application runs on the server. Use desktop browsers for bulk Excel preparation, detailed report review, and printing when possible.

`localhost` always refers to the device running the browser. A client entering `http://localhost:3000` will look for a server on that client, not on the office server. Even the server operator should use the published LAN address when it is the configured origin.

## 2. Sign in, change a temporary password, and sign out

1. Enter the email address and password supplied for your own account. There is no shared default password or public registration page.
2. Select **Sign in**. An established account opens its dashboard, or the protected page that originally required sign-in.
3. New accounts and reset accounts must complete **Change password** first. Enter the temporary password as **Current password**, then enter and confirm a new password between 12 and 128 characters. It must differ from the current password.
4. Confirm the change and check that the dashboard and expected navigation appear.
5. Use **Sign out** when leaving a workstation. Closing a tab alone is not the same as signing out.

The password visibility button can help check an entry. If the temporary password is lost or no longer works, ask a Super Admin to reset your account. There is no email-based password-reset workflow in the current interface. Existing signed-in users can open `/account/password` to change their own password.

Sessions expire after eight hours, or after thirty minutes without authenticated activity. Background account polling does not keep a session alive. Sign in again when prompted. A password change revokes other sessions and replaces the current one; an administrator reset signs the account out and requires another password change at the next sign-in.

## 3. Understand your role and meeting assignments

The administrator assigns both a role and, for ordinary staff, the meetings the account may access. Permission to perform an action does not automatically give access to every meeting. Election Managers are automatically assigned to meetings they create; a Super Admin assigns other staff.

| Default role | Typical work |
| --- | --- |
| Super Admin | All meetings and functions; accounts, roles, permissions, reserved corrections, and deletion. |
| Election Manager | Create and configure assigned meetings, manage nominees, open attendance and voting, print cards, review results/reports, and close meetings. |
| Registry Clerk | View, add, edit, and import the shared shareholder registry. |
| Attendance Officer | Register direct or represented attendance in assigned meetings and review attendance. |
| Vote Operator | Look up eligible shareholder cards and record nominee choices in assigned meetings. |
| Auditor | Read assigned meeting attendance, nominees, results, reports, and permitted audit records. |
| Projection Viewer | Open aggregate projection screens for assigned meetings. |

Ordinary roles can be adjusted, and an account can have individual grants or revocations. **Revoke** overrides an ordinary role permission. Some actions remain reserved for Super Admins: reversing votes, removing attendance, deleting shareholders or the entire registry, and deleting draft meetings. Account and role administration also remains a fixed Super Admin capability.

If an expected meeting or button is missing, ask the administrator to review your active account, role, individual overrides, and assigned meetings. Do not assume the missing control means the meeting or its records were deleted.

## 4. Navigate the workspaces

| Workspace | Purpose |
| --- | --- |
| Home (`/`) | Dashboard and available tasks for the signed-in account. The same URL shows the public landing page to anonymous visitors. |
| Shareholders (`/shareholders`) | Shared shareholder registry, individual maintenance, and Excel import. |
| Meetings (`/meetings`) | Search/filter meetings and use each meeting's Actions menu. |
| Users & Roles (`/admin`) | Super Admin account, role, assignment, and permission management. |
| Audit history (`/audit`) | Permitted records of activity and corrections. |

Each meeting's Actions menu offers the workspaces and state changes available to the account. Depending on permissions and meeting status, these include **Manage nominees**, **View attendance**, **Print voting cards**, **Record votes**, **Election results**, **Reports**, **Open projection screen**, and **Live attendance**.

Use the theme control for light, dark, or system appearance. Keyboard users can use the skip link to move to workspace content. Refresh controls reload records; visible success messages and stored records are the evidence that a save completed.

## 5. Maintain the shareholder registry

Registry Clerk and Super Admin accounts can maintain the registry. The registry is shared by meetings, so complete and reconcile it before opening attendance.

### Add, search, and edit

1. Open **Shareholders** and select **Add shareholder**.
2. Enter a unique **ID**, **Name**, **Amharic Name**, and **Share Value**. The individual Add form requires an Amharic name; **Phone** and **Address** are optional. The Excel import has separate rules and permits a blank `Name Am`.
3. Save, then search for the ID and confirm the stored name and share value.
4. Use the row's edit action to change details. The existing shareholder ID is not changed by the edit form.
5. Search by name, ID, or phone. Use pagination and the records-per-page selector when reviewing a large registry.

Share values must be non-negative decimals. A shareholder with zero voting weight cannot record a ballot. Keep names and identifiers consistent with the organization's official register and paper-ballot procedure.

Attendance stores the shareholder's name, contact details, and share value at registration. Subsequent registry edits do not rewrite that attendance snapshot or an existing ballot's weight. Printed cards use the current registry, while attendance and voting use snapshots. Keep the registry stable during an active meeting and escalate discrepancies before closure.

### Import from Excel

1. Select **Import Excel**, then **Download Excel template**.
2. Fill the supplied **Shareholders** worksheet. Preserve the headers and use one shareholder per data row.
3. Format IDs, phone numbers, and share values as text to preserve leading zeros and exact digits.
4. Save an `.xlsx` or `.xls` workbook, select it under **Excel File**, and submit the import.
5. Read the confirmation and reconcile the resulting count, IDs, and total share value against the approved source.

| Template header | Required | Entry guidance |
| --- | --- | --- |
| `Id` | Yes | Unique shareholder identifier; preserve leading zeros. |
| `Name` | Yes | Registered name. |
| `Name Am` | No | Amharic name, if available. |
| `Phone` | No | Text, including any leading zero or country prefix. |
| `Address` | No | Text address. |
| `Share Value` | Yes | Non-negative decimal without commas or currency symbols. |

Files must be no larger than 5 MB, with at most 10,000 rows below the header. Split larger batches into separate validated imports. Text fields allow up to 191 characters. Share values allow at most 24 digits before the decimal and 6 after it. Replace Excel formulas with their values before import.

Import adds new shareholders; it does not update existing IDs. Duplicate IDs in a workbook or collisions with the registry are errors, including IDs equivalent under the database's case/accent rules. If any row fails validation, no shareholders from that import are saved. The error list shows spreadsheet row and column information; correct the file and try again. Use individual edit actions for existing records.

Deleting a shareholder or the entire registry is a Super Admin action with confirmation and record constraints. Treat it as data deletion, not as a way to clear a search or prepare a new meeting. A new meeting uses the existing registry.

## 6. Prepare a meeting, nominees, and voting cards

### Create the meeting

1. Open **Meetings** and select **Create meeting**.
2. Enter the title, date/time, location, and quorum percentage. Quorum must be between 1% and 100%.
3. Choose **Standard** or **Two nominee groups**.
4. For Standard, enter a positive whole **Number of winners**. For two groups, enter a positive whole winner count for each group.
5. Save and confirm the meeting appears as **Draft** with the correct date, location, election type, and seat counts.
6. Have a Super Admin assign the required officers, operators, auditors, and projection staff to the meeting.

The date/time input uses the browser's local time. Verify the workstation timezone before entering schedules. Displayed report timestamps use East Africa Time.

The configured seat count is also the cumulative maximum nominee choice count per shareholder. For example, Standard with 3 winners allows up to 3 distinct nominees. Group 1 with 2 winners and Group 2 with 1 winner allows up to 2 nominees from Group 1 and 1 from Group 2; unused Group 2 capacity cannot be moved to Group 1.

### Add and review nominees

1. Open the meeting's Actions menu and select **Manage nominees**.
2. Select a registered shareholder as the nominee. Review the English and Amharic names and add a description when required.
3. For grouped elections, select the correct nominee group.
4. Save and check the nominee list. Use edit/remove controls to correct it while the meeting is Draft or Attendance open.
5. Reconcile the final nominee list and election rules before opening voting.

Opening voting locks meeting rules and the nominee list. Closed meetings are read-only. Older standard meetings with a missing winner count must be configured through **Edit meeting**; the limited legacy setup path can supply that missing count after voting has opened only before the first vote. It does not permit general rule changes during voting.

### Print voting cards

1. Choose **Print voting cards** and review the meeting title, shareholder count, and name spaces per card.
2. Select **Print all shareholder cards**. The application prepares the complete current registry, including shareholders not yet checked in.
3. Preview A4 output. The layout uses three cards per A4 page, with blank name spaces matching the configured total and separate headings for grouped elections.
4. Check names, IDs, share values, signature areas, English/Amharic instructions, and print scaling before printing the full batch.
5. Distribute and complete cards according to the organization's identification, representation, and paper-ballot procedure.

Printing does not register attendance or establish eligibility. Card output waits for local fonts and images, hides workspace controls, and requests zero browser margins. Check the actual print preview and printer; if browser headers or footers remain visible, turn those off in the print dialog. Amharic rendering uses the bundled local Noto Sans Ethiopic font.

## 7. Open and register attendance

The normal meeting lifecycle is:

| Status | Available work |
| --- | --- |
| Draft | Prepare meeting configuration, nominees, and cards. A Super Admin may delete the draft. |
| Attendance open | Register attendance and representation; complete setup and review quorum. |
| Voting open | Enter ballots; attendance may still be registered; authorised corrections remain possible. Rules and nominees are locked. |
| Closed | Read results/reports and retained records. Normal UI workflows cannot reopen or modify the meeting. |

1. An Election Manager or Super Admin selects **Open attendance** from the Draft meeting's Actions menu and confirms.
2. An Attendance Officer or Super Admin opens **Attendance** or **View attendance**.
3. Choose **Representation**: **Attending directly**, **Existing representative**, **Shareholder representative**, or **New external representative**.
4. Select the representative, or enter the new external representative's name and unique ID as required.
5. Search for the attending shareholders by name or ID, select the correct unregistered holdings, and review the selected list.
6. Select **Register ... shareholders**. Confirm each holding appears under **Registered attendees** with the correct own share value and direct/represented status.
7. Review the attendance totals and quorum status. Hand over each shareholder's own paper card for ballot processing.

One shareholder can be registered only once in a meeting. A new external representative ID cannot be an existing shareholder ID. Existing representative choices are limited to the records available for that meeting and account.

Representation does not combine ballots. If one representative handles two shareholders, register both holdings and process two separate cards using the two shareholder IDs. A shareholder representative's own attendance must be registered separately for their own card. An external representative has no personal ballot. See [Independent shareholder ballots](independent-shareholder-ballots.md) for the full policy and examples.

If registration is wrong, a Super Admin can remove the affected attendance and register it correctly while the meeting remains open. First reverse that shareholder's recorded votes, if any. Removing one shareholder's attendance does not remove another shareholder's independent card handled by the same representative.

## 8. Open voting and record paper-card choices

Before opening voting, the Election Manager should verify the approved nominee list, seat limits, attendance/quorum position, staff assignments, and paper-ballot readiness. Select **Open voting** and confirm the lock of rules and nominees. Follow the organization's quorum procedure; the normal **Close meeting** action also checks quorum.

For each card, a Vote Operator or Super Admin performs these steps:

1. Open **Record votes** for the correct meeting.
2. Enter the **Shareholder ID on voting card**, not an external representative ID.
3. Wait for the eligibility lookup. Check the displayed shareholder name, representation, own share weight, and any previously recorded choices against the card.
4. Select the nominee choices on that card. The interface enforces the cumulative standard or per-group limits, including choices already recorded for that shareholder.
5. Review the selection, then select the recording button. **Selected** means an unsaved selection; **Recorded** means a persisted choice.
6. Confirm the success message and recorded choices before processing the next card.

Each chosen nominee receives that shareholder's own attendance snapshot weight. A 1,200-weight shareholder selecting three nominees adds 1,200 to each nominee, for 3,600 aggregate nominee weight. Aggregate nominee weight can therefore exceed attended shares.

If the response is interrupted, look up the same shareholder again and inspect recorded choices before retrying. The API treats repeated existing choices as already recorded rather than duplicating them. Do not select different nominees merely because a success message was missed.

### Correct a recorded choice

1. Escalate the exact card and wrong nominee to a Super Admin while voting is open.
2. The Super Admin enters the affected shareholder ID, selects **Reverse** beside the wrong recorded choice, enters a specific correction reason, and confirms.
3. Check that the slot is available and the wrong choice is no longer recorded.
4. Enter the correct original-card choice and verify the result and audit history.

A reversal changes only the specified shareholder/nominee choice. Operators cannot reverse votes. Closed meetings cannot be corrected through the normal interface.

When **Correct older combined ballots** is shown, a Super Admin must review and reverse every listed older combined choice before affected attendance, new entries, or closure can proceed. Then enter each original shareholder card separately. A combined historical record does not establish each shareholder's instructions; obtain the original cards. Closed historical combined records remain read-only.

## 9. Monitor attendance, results, and projection screens

Choose **Live attendance** to show aggregate attendance, total/attended share information, and quorum. Anonymous viewers see aggregate information. Signed-in staff with attendance/report permission and access to the meeting may also see authorised welcome names.

Choose **Open projection screen** to open the election display in a separate window. On a projector workstation, use an extended desktop, move that window to the projector, and press **F** for fullscreen; use **Esc** to leave fullscreen. Allow the application's popup if the browser blocks the new window. The election display offers English, Amharic, or both for nominee names, along with theme/display controls.

The election projection refreshes every three seconds. The protected **Election results** page refreshes every ten seconds and has a manual Refresh control. Wait for the displayed connection/refresh state when checking a recent vote. Public projection pages are intentionally accessible without staff sign-in and expose aggregate outcomes rather than individual ballot records or shareholder contacts.

Two percentage definitions are used:

| Display | Calculation |
| --- | --- |
| Projection **Support %** | Nominee weight divided by attended share value. |
| Results-page percentage | Nominee weight divided by total weight across all recorded nominee choices. |

These percentages need not match in a multi-choice election. Before closure, leading nominees are provisional. After closure, positive-weight nominees fill the configured seats in each group or the standard list. A tie crossing the last seat cutoff is marked for resolution; the app has no manual tie-resolution or winner-override control. Zero-weight nominees are not declared winners.

## 10. Review, export, and retain reports

Use the meeting's **Reports** workspace to open the attendance or voting report allowed by your account.

### Attendance report

Review snapshot totals, quorum, directly attending/represented holdings, and check-in times. Search and pagination help inspect the screen. **Generate PDF** includes all attendance rows even if the on-screen list is searched or showing one page. Check the downloaded PDF's meeting title and totals before retaining it.

### Voting report

1. Review the meeting, metrics, nominee summary, and vote records.
2. Filter by shareholder/representative name or ID, nominee, nominee group, or attendance type. Expand **Dates, weights, and sorting** when needed.
3. Enter date/time filters in the browser's local time, choose weight bounds and sorting, and select **Apply filters**.
4. Select **Export Excel**. The export uses the last applied filters and includes every matching page, including more than 500 rows.
5. For a full election export, use **Clear filters** first, then review and export the unfiltered report.

The workbook contains **Summary**, **Nominee results**, and **Vote audit** sheets. Vote audit includes shareholder/historical ballot ID, owner, representative metadata, attendance type, older-combined status, nominee, weight, and submission time. A filtered workbook is evidence of that subset, not a full-election record.

Displayed report and audit timestamps use East Africa Time (`Africa/Nairobi`, UTC+3). Dates use a day-month-year presentation and report time uses a 24-hour clock. Numeric displays may round for readability; consult the exported values and approved register when reconciling exact holdings.

### Close the meeting

1. Reconcile paper cards, recorded choices, attendance, quorum, nominee totals, and outstanding corrections.
2. Resolve older combined ballots while voting remains open.
3. The authorised manager or Super Admin selects **Close meeting**, reviews the confirmation, and confirms.
4. Confirm **Closed** status; review final results and save the required reports to the organization's approved archive.

The normal Close meeting action checks quorum using current registered holdings, while attendance/report displays use snapshots. Registry changes during a meeting can therefore produce discrepancies. Escalate them before closure rather than changing shares to force the check to pass. Closure locks the records; the current UI cannot reopen the meeting.

## 11. Administer accounts, roles, and audit history

### Create a staff account

1. As a Super Admin, open **Users & Roles** and select **Add user**.
2. Enter the display name and email, choose a role, keep **Account active** selected, and choose the required **Assigned meetings** for ordinary staff.
3. Review any individual permission overrides. **Inherit** follows the role; **Grant** allows an ordinary action; **Revoke** removes it even if the role allows it.
4. Save. If prompted by **Confirm your password**, enter your own current password to approve the security change.
5. Copy or select the generated temporary sign-in details and deliver them privately to that staff member. Confirm they can sign in and complete the required password change.

The generated credentials dialog offers copying and manual selection. On an HTTP LAN browser, if copying is blocked, select the password and use **Ctrl+C** on Windows/Linux or **Command+C** on macOS. Do not include temporary passwords in meeting records or public projections.

### Change access, disable an account, or reset a password

Search accounts by name/email, select the account, and update its role, active state, meeting assignments, or overrides. Save and confirm. Changes take effect on subsequent authenticated requests; disabling an account, changing role/email, and resetting a password revoke its sessions.

For another account's lost password, select **Reset password**, confirm, and privately supply the new temporary password. The user must change it at the next sign-in. Use **Change password** for your own account. The app protects the last usable Super Admin from being disabled or demoted; keep another active Super Admin with completed password setup for continuity.

Under **Roles & permissions**, use **Add role** or select an ordinary role to edit its name, description, and permissions, then **Save role**. Reserved actions and security administration cannot be delegated through a custom role or account grant. Super Admin security changes require password verification within the preceding ten minutes; complete the confirmation dialog when requested.

### Review audit history

Open **Audit history**, use **Refresh** and pagination, and expand **View details** for an entry. Review time, actor, action/resource, and outcome. **Started** means the final outcome has not been recorded; it is not proof of success. The current Audit page has no search, filter, or export controls.

Super Admins can review system-wide audit history. Permitted ordinary staff see assigned-meeting activity and their own sign-in activity, not all staff/account records.

## 12. Rehearse and train staff

Run a rehearsal using fictional identities and a separate training environment: prepare a registry, create standard/grouped meetings, print cards, check in direct and represented shareholders, verify quorum, enter independent cards, demonstrate a Super Admin correction, review reports, and close only after reconciliation. Do not use the examples as production accounts or credentials.

Existing training artifacts are available here:

- [Trainer guide](training/Trainer_Guide.md): role paths, workshop preparation, checkpoints, and current limitations.
- [Editable PowerPoint training](training/Lucy_Voting_User_Training.pptx): animations, module navigation, and trainer notes for desktop PowerPoint.
- [Printable PDF manual](training/Lucy_Voting_User_Manual.pdf): static instructions for reference.
- [Complete training package](training/Lucy_Voting_Training_Package.zip).
- [Import template example](training/examples/Shareholder_Import_Template.xlsx).
- [Standard card example](training/examples/Standard_Voting_Cards_Example.pdf) and [grouped card example](training/examples/Grouped_Voting_Cards_Example.pdf).
- [Attendance PDF example](training/examples/Attendance_Report_Example.pdf).
- [Full voting Excel example](training/examples/Full_Voting_Report_Example.xlsx) and [filtered voting Excel example](training/examples/Filtered_Voting_Report_Example.xlsx).

Use the live application template for new imports and review this guide whenever deployed labels, rules, or permissions change.
