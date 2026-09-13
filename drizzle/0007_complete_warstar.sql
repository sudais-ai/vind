ALTER TABLE `approvals` ADD `draftId` int;--> statement-breakpoint
ALTER TABLE `approvals` ADD CONSTRAINT `approvals_draftId_drafts_id_fk` FOREIGN KEY (`draftId`) REFERENCES `drafts`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX `approvals_draft_idx` ON `approvals` (`draftId`);