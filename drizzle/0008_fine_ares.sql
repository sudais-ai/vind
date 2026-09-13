ALTER TABLE `policies` ADD `workspaceId` int;--> statement-breakpoint
ALTER TABLE `policies` ADD CONSTRAINT `policies_workspaceId_workspaces_id_fk` FOREIGN KEY (`workspaceId`) REFERENCES `workspaces`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX `policies_workspace_idx` ON `policies` (`workspaceId`);