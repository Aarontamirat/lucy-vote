-- Existing standard meetings must have their winner count configured explicitly.
ALTER TABLE `Meeting` ADD COLUMN `winnerCount` INTEGER NULL;
