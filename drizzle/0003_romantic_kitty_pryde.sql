CREATE TABLE `agentRuns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`caseId` int NOT NULL,
	`agentType` varchar(120) NOT NULL,
	`status` enum('QUEUED','RUNNING','SUCCEEDED','FAILED','CANCELLED') NOT NULL DEFAULT 'QUEUED',
	`provider` varchar(120),
	`model` varchar(255),
	`modelVersion` varchar(120),
	`startedAt` timestamp,
	`completedAt` timestamp,
	`inputTokens` int,
	`outputTokens` int,
	`estimatedCost` decimal(18,8),
	`errorState` text,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `agentRuns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `artifacts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`caseId` int NOT NULL,
	`agentRunId` int,
	`type` enum('ANALYSIS','RESEARCH','SUMMARY','STRATEGY','DRAFT','RISK_ASSESSMENT','VERIFICATION') NOT NULL,
	`status` enum('DRAFT','FINAL','ARCHIVED','SUPERSEDED') NOT NULL DEFAULT 'DRAFT',
	`version` int NOT NULL DEFAULT 1,
	`content` text NOT NULL,
	`author` int,
	`source` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `artifacts_id` PRIMARY KEY(`id`),
	CONSTRAINT `artifacts_case_type_version_unique` UNIQUE(`caseId`,`type`,`version`)
);
--> statement-breakpoint
CREATE TABLE `draftVersions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`draftId` int NOT NULL,
	`version` int NOT NULL,
	`author` int,
	`status` enum('DRAFT','IN_REVIEW','APPROVED','REJECTED','SENT','ARCHIVED') NOT NULL DEFAULT 'DRAFT',
	`content` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `draftVersions_id` PRIMARY KEY(`id`),
	CONSTRAINT `draft_versions_draft_version_unique` UNIQUE(`draftId`,`version`)
);
--> statement-breakpoint
CREATE TABLE `drafts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`caseId` int NOT NULL,
	`author` int,
	`status` enum('DRAFT','IN_REVIEW','APPROVED','REJECTED','SENT','ARCHIVED') NOT NULL DEFAULT 'DRAFT',
	`title` varchar(255) NOT NULL,
	`currentVersion` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `drafts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `embeddingMetadata` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sourceType` enum('EVIDENCE','RESEARCH_SOURCE','POLICY_CLAUSE','FACT','CLAIM','ARTIFACT','OTHER') NOT NULL,
	`sourceId` int NOT NULL,
	`provider` varchar(120) NOT NULL,
	`model` varchar(255) NOT NULL,
	`modelVersion` varchar(120),
	`dimensions` int,
	`status` enum('PENDING','READY','FAILED','DELETED') NOT NULL DEFAULT 'PENDING',
	`checksum` varchar(128),
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `embeddingMetadata_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `jurisdictions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`country` varchar(120),
	`stateProvince` varchar(120),
	`region` varchar(120),
	`regulatoryAuthority` varchar(255),
	`type` enum('COUNTRY','STATE_PROVINCE','REGION','REGULATORY_AUTHORITY','OTHER') NOT NULL,
	`code` varchar(80),
	`name` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `jurisdictions_id` PRIMARY KEY(`id`),
	CONSTRAINT `jurisdictions_code_type_unique` UNIQUE(`code`,`type`)
);
--> statement-breakpoint
CREATE TABLE `policies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`source` varchar(1024),
	`jurisdictionId` int,
	`status` enum('DRAFT','ACTIVE','RETIRED','ARCHIVED') NOT NULL DEFAULT 'DRAFT',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `policies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `policyClauses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`policyVersionId` int NOT NULL,
	`clauseNumber` varchar(80) NOT NULL,
	`title` varchar(255),
	`text` text NOT NULL,
	`checksum` varchar(128),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `policyClauses_id` PRIMARY KEY(`id`),
	CONSTRAINT `policy_clauses_version_number_unique` UNIQUE(`policyVersionId`,`clauseNumber`)
);
--> statement-breakpoint
CREATE TABLE `policyVersions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`policyId` int NOT NULL,
	`versionNumber` int NOT NULL,
	`effectiveDate` timestamp,
	`expirationDate` timestamp,
	`source` varchar(1024),
	`status` enum('DRAFT','ACTIVE','EXPIRED','RETIRED') NOT NULL DEFAULT 'DRAFT',
	`checksum` varchar(128),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `policyVersions_id` PRIMARY KEY(`id`),
	CONSTRAINT `policy_versions_policy_version_unique` UNIQUE(`policyId`,`versionNumber`)
);
--> statement-breakpoint
CREATE TABLE `researchRuns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`caseId` int NOT NULL,
	`query` text NOT NULL,
	`status` enum('PENDING','RUNNING','COMPLETED','FAILED','CANCELLED') NOT NULL DEFAULT 'PENDING',
	`startedAt` timestamp,
	`completedAt` timestamp,
	`requester` int,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `researchRuns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `researchSources` (
	`id` int AUTO_INCREMENT NOT NULL,
	`researchRunId` int NOT NULL,
	`url` varchar(2048),
	`reference` varchar(1024),
	`title` varchar(512) NOT NULL,
	`authority` varchar(255),
	`publicationDate` timestamp,
	`effectiveDate` timestamp,
	`freshness` enum('FRESH','AGING','STALE','UNKNOWN') NOT NULL DEFAULT 'UNKNOWN',
	`sourceType` enum('OFFICIAL','REGULATORY','JUDICIAL','ACADEMIC','NEWS','INTERNAL','OTHER') NOT NULL,
	`status` enum('ACTIVE','ARCHIVED','UNVERIFIED') NOT NULL DEFAULT 'UNVERIFIED',
	`jurisdictionId` int,
	`checksum` varchar(128),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `researchSources_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `agentRuns` ADD CONSTRAINT `agentRuns_caseId_cases_id_fk` FOREIGN KEY (`caseId`) REFERENCES `cases`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `artifacts` ADD CONSTRAINT `artifacts_caseId_cases_id_fk` FOREIGN KEY (`caseId`) REFERENCES `cases`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `artifacts` ADD CONSTRAINT `artifacts_agentRunId_agentRuns_id_fk` FOREIGN KEY (`agentRunId`) REFERENCES `agentRuns`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `artifacts` ADD CONSTRAINT `artifacts_author_users_id_fk` FOREIGN KEY (`author`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `draftVersions` ADD CONSTRAINT `draftVersions_draftId_drafts_id_fk` FOREIGN KEY (`draftId`) REFERENCES `drafts`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `draftVersions` ADD CONSTRAINT `draftVersions_author_users_id_fk` FOREIGN KEY (`author`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `drafts` ADD CONSTRAINT `drafts_caseId_cases_id_fk` FOREIGN KEY (`caseId`) REFERENCES `cases`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `drafts` ADD CONSTRAINT `drafts_author_users_id_fk` FOREIGN KEY (`author`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `policies` ADD CONSTRAINT `policies_jurisdictionId_jurisdictions_id_fk` FOREIGN KEY (`jurisdictionId`) REFERENCES `jurisdictions`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `policyClauses` ADD CONSTRAINT `policyClauses_policyVersionId_policyVersions_id_fk` FOREIGN KEY (`policyVersionId`) REFERENCES `policyVersions`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `policyVersions` ADD CONSTRAINT `policyVersions_policyId_policies_id_fk` FOREIGN KEY (`policyId`) REFERENCES `policies`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `researchRuns` ADD CONSTRAINT `researchRuns_caseId_cases_id_fk` FOREIGN KEY (`caseId`) REFERENCES `cases`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `researchRuns` ADD CONSTRAINT `researchRuns_requester_users_id_fk` FOREIGN KEY (`requester`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `researchSources` ADD CONSTRAINT `researchSources_researchRunId_researchRuns_id_fk` FOREIGN KEY (`researchRunId`) REFERENCES `researchRuns`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `researchSources` ADD CONSTRAINT `researchSources_jurisdictionId_jurisdictions_id_fk` FOREIGN KEY (`jurisdictionId`) REFERENCES `jurisdictions`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX `agent_runs_case_status_idx` ON `agentRuns` (`caseId`,`status`);--> statement-breakpoint
CREATE INDEX `agent_runs_agent_type_idx` ON `agentRuns` (`agentType`);--> statement-breakpoint
CREATE INDEX `artifacts_case_status_idx` ON `artifacts` (`caseId`,`status`);--> statement-breakpoint
CREATE INDEX `artifacts_agent_run_idx` ON `artifacts` (`agentRunId`);--> statement-breakpoint
CREATE INDEX `draft_versions_draft_created_idx` ON `draftVersions` (`draftId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `drafts_case_status_idx` ON `drafts` (`caseId`,`status`);--> statement-breakpoint
CREATE INDEX `embedding_metadata_source_idx` ON `embeddingMetadata` (`sourceType`,`sourceId`);--> statement-breakpoint
CREATE INDEX `embedding_metadata_model_idx` ON `embeddingMetadata` (`provider`,`model`);--> statement-breakpoint
CREATE INDEX `embedding_metadata_checksum_idx` ON `embeddingMetadata` (`checksum`);--> statement-breakpoint
CREATE INDEX `jurisdictions_country_region_idx` ON `jurisdictions` (`country`,`region`);--> statement-breakpoint
CREATE INDEX `policies_jurisdiction_idx` ON `policies` (`jurisdictionId`);--> statement-breakpoint
CREATE INDEX `policies_status_idx` ON `policies` (`status`);--> statement-breakpoint
CREATE INDEX `policy_versions_effective_date_idx` ON `policyVersions` (`effectiveDate`);--> statement-breakpoint
CREATE INDEX `research_runs_case_status_idx` ON `researchRuns` (`caseId`,`status`);--> statement-breakpoint
CREATE INDEX `research_runs_requester_idx` ON `researchRuns` (`requester`);--> statement-breakpoint
CREATE INDEX `research_sources_run_idx` ON `researchSources` (`researchRunId`);--> statement-breakpoint
CREATE INDEX `research_sources_jurisdiction_idx` ON `researchSources` (`jurisdictionId`);--> statement-breakpoint
CREATE INDEX `research_sources_freshness_idx` ON `researchSources` (`freshness`);