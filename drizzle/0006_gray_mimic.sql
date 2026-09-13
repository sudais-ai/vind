CREATE TABLE `retentionMetadata` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int,
	`resourceType` varchar(120) NOT NULL,
	`resourceId` int,
	`retentionDuration` int NOT NULL,
	`organizationPolicy` varchar(255) NOT NULL,
	`legalHold` boolean NOT NULL DEFAULT false,
	`deletionStatus` enum('ACTIVE','SCHEDULED','LEGAL_HOLD','DELETED') NOT NULL DEFAULT 'ACTIVE',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `retentionMetadata_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `retentionMetadata` ADD CONSTRAINT `retentionMetadata_organizationId_organizations_id_fk` FOREIGN KEY (`organizationId`) REFERENCES `organizations`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX `retention_metadata_resource_idx` ON `retentionMetadata` (`resourceType`,`resourceId`);--> statement-breakpoint
CREATE INDEX `retention_metadata_org_status_idx` ON `retentionMetadata` (`organizationId`,`deletionStatus`);--> statement-breakpoint
CREATE INDEX `retention_metadata_legal_hold_idx` ON `retentionMetadata` (`legalHold`);