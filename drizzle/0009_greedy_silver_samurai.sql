CREATE TABLE `sourceSnapshots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`researchSourceId` int NOT NULL,
	`sourceHash` varchar(128) NOT NULL,
	`retrievedAt` timestamp NOT NULL DEFAULT (now()),
	`normalizedContentRef` varchar(1024),
	`versionMetadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sourceSnapshots_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `citations` DROP FOREIGN KEY `citations_claimId_claims_id_fk`;
--> statement-breakpoint
ALTER TABLE `citations` DROP FOREIGN KEY `citations_evidenceId_evidence_id_fk`;
--> statement-breakpoint
ALTER TABLE `citations` ADD `researchSourceId` int;--> statement-breakpoint
ALTER TABLE `citations` ADD `sourceRetrievedAt` timestamp;--> statement-breakpoint
ALTER TABLE `citations` ADD `authoritySnapshot` varchar(255);--> statement-breakpoint
ALTER TABLE `citations` ADD `confidence` int;--> statement-breakpoint
ALTER TABLE `claims` ADD `statementType` enum('FACT','LAW','POLICY','SOURCE_STATEMENT','INFERENCE','RECOMMENDATION','UNKNOWN') DEFAULT 'UNKNOWN' NOT NULL;--> statement-breakpoint
ALTER TABLE `researchSources` ADD `retrievedAt` timestamp DEFAULT (now()) NOT NULL;--> statement-breakpoint
ALTER TABLE `researchSources` ADD `expirationDate` timestamp;--> statement-breakpoint
ALTER TABLE `researchSources` ADD `supersededBy` int;--> statement-breakpoint
ALTER TABLE `researchSources` ADD `version` int DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `researchSources` ADD `confidence` int;--> statement-breakpoint
ALTER TABLE `researchSources` ADD `verificationStatus` enum('UNVERIFIED','IN_REVIEW','VERIFIED','REJECTED') DEFAULT 'UNVERIFIED' NOT NULL;--> statement-breakpoint
ALTER TABLE `sourceSnapshots` ADD CONSTRAINT `sourceSnapshots_researchSourceId_researchSources_id_fk` FOREIGN KEY (`researchSourceId`) REFERENCES `researchSources`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX `source_snapshots_source_idx` ON `sourceSnapshots` (`researchSourceId`);--> statement-breakpoint
CREATE INDEX `source_snapshots_hash_idx` ON `sourceSnapshots` (`sourceHash`);--> statement-breakpoint
ALTER TABLE `citations` ADD CONSTRAINT `citations_claimId_claims_id_fk` FOREIGN KEY (`claimId`) REFERENCES `claims`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `citations` ADD CONSTRAINT `citations_evidenceId_evidence_id_fk` FOREIGN KEY (`evidenceId`) REFERENCES `evidence`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `citations_research_source_idx` ON `citations` (`researchSourceId`);--> statement-breakpoint
CREATE INDEX `research_sources_superseded_by_idx` ON `researchSources` (`supersededBy`);