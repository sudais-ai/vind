CREATE TABLE `cases` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`company` varchar(255),
	`category` enum('BILLING','CONTRACT','REFUND','SERVICE','COMPLIANCE','OTHER') NOT NULL DEFAULT 'OTHER',
	`priority` enum('LOW','MEDIUM','HIGH','URGENT') NOT NULL DEFAULT 'MEDIUM',
	`risk` enum('LOW','MEDIUM','HIGH','CRITICAL') NOT NULL DEFAULT 'MEDIUM',
	`status` enum('NEW','INGESTING','FACTS_EXTRACTED','EVIDENCE_VERIFIED','RESEARCHING','STRATEGY_READY','DRAFT_READY','AWAITING_APPROVAL','SENT','WAITING_RESPONSE','RESPONSE_RECEIVED','REANALYZING','ESCALATION_READY','RESOLVED','CLOSED') NOT NULL DEFAULT 'NEW',
	`desiredOutcome` text,
	`owner` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`closedAt` timestamp,
	`deletedAt` timestamp,
	CONSTRAINT `cases_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `citations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`claimId` int NOT NULL,
	`evidenceId` int NOT NULL,
	`factId` int,
	`excerpt` text,
	`locator` varchar(512),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `citations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `claims` (
	`id` int AUTO_INCREMENT NOT NULL,
	`caseId` int NOT NULL,
	`statement` text NOT NULL,
	`status` enum('PROPOSED','SUPPORTED','CONTRADICTED','REJECTED') NOT NULL DEFAULT 'PROPOSED',
	`confidence` int,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `claims_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `evidence` (
	`id` int AUTO_INCREMENT NOT NULL,
	`caseId` int NOT NULL,
	`type` enum('EMAIL','PDF','DOCUMENT','IMAGE','SCREENSHOT','ATTACHMENT','FORM','OTHER') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`source` varchar(255),
	`sourceIdentifier` varchar(512),
	`status` enum('ACTIVE','ARCHIVED','DELETED') NOT NULL DEFAULT 'ACTIVE',
	`verificationState` enum('UNVERIFIED','IN_REVIEW','VERIFIED','REJECTED') NOT NULL DEFAULT 'UNVERIFIED',
	`captureTime` timestamp,
	`uploadedBy` int,
	`originalFilename` varchar(512),
	`checksum` varchar(128),
	`processingStatus` enum('PENDING','PROCESSING','PROCESSED','FAILED') NOT NULL DEFAULT 'PENDING',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deletedAt` timestamp,
	CONSTRAINT `evidence_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `facts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`caseId` int NOT NULL,
	`statement` text NOT NULL,
	`status` enum('UNVERIFIED','VERIFIED','REJECTED') NOT NULL DEFAULT 'UNVERIFIED',
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `facts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `storedFiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`evidenceId` int NOT NULL,
	`storageProvider` varchar(80) NOT NULL,
	`storageKey` varchar(1024) NOT NULL,
	`mimeType` varchar(255) NOT NULL,
	`sizeBytes` bigint NOT NULL,
	`checksum` varchar(128) NOT NULL,
	`filename` varchar(512) NOT NULL,
	`uploadedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `storedFiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `stored_files_provider_key_unique` UNIQUE(`storageProvider`,`storageKey`)
);
--> statement-breakpoint
CREATE TABLE `timelineEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`caseId` int NOT NULL,
	`eventType` enum('CASE_CREATED','STATUS_CHANGED','EVIDENCE_CAPTURED','EVIDENCE_VERIFIED','FACT_RECORDED','CLAIM_RECORDED','NOTE','SYSTEM') NOT NULL,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	`title` varchar(255) NOT NULL,
	`description` text,
	`actor` int,
	`source` varchar(255),
	`relatedEvidence` int,
	`metadata` json,
	CONSTRAINT `timelineEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `cases` ADD CONSTRAINT `cases_workspaceId_workspaces_id_fk` FOREIGN KEY (`workspaceId`) REFERENCES `workspaces`(`id`) ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `cases` ADD CONSTRAINT `cases_owner_users_id_fk` FOREIGN KEY (`owner`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `citations` ADD CONSTRAINT `citations_claimId_claims_id_fk` FOREIGN KEY (`claimId`) REFERENCES `claims`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `citations` ADD CONSTRAINT `citations_evidenceId_evidence_id_fk` FOREIGN KEY (`evidenceId`) REFERENCES `evidence`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `citations` ADD CONSTRAINT `citations_factId_facts_id_fk` FOREIGN KEY (`factId`) REFERENCES `facts`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `claims` ADD CONSTRAINT `claims_caseId_cases_id_fk` FOREIGN KEY (`caseId`) REFERENCES `cases`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `claims` ADD CONSTRAINT `claims_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `evidence` ADD CONSTRAINT `evidence_caseId_cases_id_fk` FOREIGN KEY (`caseId`) REFERENCES `cases`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `evidence` ADD CONSTRAINT `evidence_uploadedBy_users_id_fk` FOREIGN KEY (`uploadedBy`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `facts` ADD CONSTRAINT `facts_caseId_cases_id_fk` FOREIGN KEY (`caseId`) REFERENCES `cases`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `facts` ADD CONSTRAINT `facts_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `storedFiles` ADD CONSTRAINT `storedFiles_evidenceId_evidence_id_fk` FOREIGN KEY (`evidenceId`) REFERENCES `evidence`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `storedFiles` ADD CONSTRAINT `storedFiles_uploadedBy_users_id_fk` FOREIGN KEY (`uploadedBy`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `timelineEvents` ADD CONSTRAINT `timelineEvents_caseId_cases_id_fk` FOREIGN KEY (`caseId`) REFERENCES `cases`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `timelineEvents` ADD CONSTRAINT `timelineEvents_actor_users_id_fk` FOREIGN KEY (`actor`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `timelineEvents` ADD CONSTRAINT `timelineEvents_relatedEvidence_evidence_id_fk` FOREIGN KEY (`relatedEvidence`) REFERENCES `evidence`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX `cases_workspace_status_idx` ON `cases` (`workspaceId`,`status`);--> statement-breakpoint
CREATE INDEX `cases_workspace_updated_idx` ON `cases` (`workspaceId`,`updatedAt`);--> statement-breakpoint
CREATE INDEX `cases_owner_idx` ON `cases` (`owner`);--> statement-breakpoint
CREATE INDEX `cases_deleted_at_idx` ON `cases` (`deletedAt`);--> statement-breakpoint
CREATE INDEX `citations_claim_idx` ON `citations` (`claimId`);--> statement-breakpoint
CREATE INDEX `citations_evidence_idx` ON `citations` (`evidenceId`);--> statement-breakpoint
CREATE INDEX `citations_fact_idx` ON `citations` (`factId`);--> statement-breakpoint
CREATE INDEX `claims_case_status_idx` ON `claims` (`caseId`,`status`);--> statement-breakpoint
CREATE INDEX `evidence_case_status_idx` ON `evidence` (`caseId`,`status`);--> statement-breakpoint
CREATE INDEX `evidence_case_verification_idx` ON `evidence` (`caseId`,`verificationState`);--> statement-breakpoint
CREATE INDEX `evidence_source_idx` ON `evidence` (`source`,`sourceIdentifier`);--> statement-breakpoint
CREATE INDEX `evidence_checksum_idx` ON `evidence` (`checksum`);--> statement-breakpoint
CREATE INDEX `evidence_deleted_at_idx` ON `evidence` (`deletedAt`);--> statement-breakpoint
CREATE INDEX `facts_case_status_idx` ON `facts` (`caseId`,`status`);--> statement-breakpoint
CREATE INDEX `stored_files_evidence_idx` ON `storedFiles` (`evidenceId`);--> statement-breakpoint
CREATE INDEX `stored_files_checksum_idx` ON `storedFiles` (`checksum`);--> statement-breakpoint
CREATE INDEX `timeline_events_case_time_idx` ON `timelineEvents` (`caseId`,`timestamp`);--> statement-breakpoint
CREATE INDEX `timeline_events_type_idx` ON `timelineEvents` (`eventType`);