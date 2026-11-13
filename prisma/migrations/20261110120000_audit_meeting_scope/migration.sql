-- No foreign key: audit records survive meeting deletion.
ALTER TABLE `AuditLog` ADD COLUMN `meetingId` VARCHAR(191) NULL;
CREATE INDEX `AuditLog_meetingId_createdAt_idx` ON `AuditLog`(`meetingId`, `createdAt`);
ALTER TABLE `Representative` ADD COLUMN `registeredForMeetingId` VARCHAR(191) NULL;
CREATE INDEX `Representative_registeredForMeetingId_idx` ON `Representative`(`registeredForMeetingId`);
