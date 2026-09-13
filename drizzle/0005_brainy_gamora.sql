CREATE TABLE `actions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`caseId` int NOT NULL,
	`type` enum('SEND_EMAIL','CREATE_DRAFT','SUBMIT_FORM','REQUEST_INFORMATION','ESCALATE','SCHEDULE_FOLLOWUP') NOT NULL,
	`status` enum('DRAFT','READY','AWAITING_APPROVAL','APPROVED','PROCESSING','COMPLETED','FAILED','CANCELLED') NOT NULL DEFAULT 'DRAFT',
	`requestedBy` int,
	`approvalId` int,
	`payloadMetadata` json,
	`scheduledAt` timestamp,
	`startedAt` timestamp,
	`completedAt` timestamp,
	`errorState` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `actions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `approvals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`caseId` int NOT NULL,
	`requestedBy` int,
	`reviewer` int,
	`action` enum('SEND_EMAIL','CREATE_DRAFT','SUBMIT_FORM','REQUEST_INFORMATION','ESCALATE','SCHEDULE_FOLLOWUP') NOT NULL,
	`risk` enum('LOW','MEDIUM','HIGH','CRITICAL') NOT NULL DEFAULT 'MEDIUM',
	`status` enum('PENDING','APPROVED','REJECTED','CHANGES_REQUESTED','CANCELLED') NOT NULL DEFAULT 'PENDING',
	`reason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`reviewedAt` timestamp,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `approvals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `auditLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`actor` int,
	`organizationId` int,
	`workspaceId` int,
	`action` varchar(120) NOT NULL,
	`resourceType` varchar(120) NOT NULL,
	`resourceId` int,
	`caseId` int,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	`metadata` json,
	`requestCorrelationId` varchar(120),
	CONSTRAINT `auditLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `deadlines` (
	`id` int AUTO_INCREMENT NOT NULL,
	`caseId` int NOT NULL,
	`type` enum('RESPONSE','FOLLOW_UP','REVIEW','SUBMISSION','ESCALATION','OTHER') NOT NULL,
	`dueAt` timestamp NOT NULL,
	`source` varchar(255),
	`status` enum('OPEN','COMPLETED','MISSED','CANCELLED') NOT NULL DEFAULT 'OPEN',
	`priority` enum('LOW','MEDIUM','HIGH','URGENT') NOT NULL DEFAULT 'MEDIUM',
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `deadlines_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `integrations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`provider` enum('GMAIL','OUTLOOK','API','WEBHOOK') NOT NULL,
	`status` enum('DISCONNECTED','PENDING','CONNECTED','ERROR','REVOKED') NOT NULL DEFAULT 'DISCONNECTED',
	`connectedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `integrations_id` PRIMARY KEY(`id`),
	CONSTRAINT `integrations_workspace_provider_unique` UNIQUE(`workspaceId`,`provider`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`recipient` int NOT NULL,
	`workspaceId` int NOT NULL,
	`type` enum('APPROVAL','ACTION','RESPONSE','DEADLINE','SYSTEM','SECURITY') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`severity` enum('INFO','WARNING','ERROR','CRITICAL') NOT NULL DEFAULT 'INFO',
	`readState` enum('UNREAD','READ','ARCHIVED') NOT NULL DEFAULT 'UNREAD',
	`relatedResourceType` varchar(120),
	`relatedResourceId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`readAt` timestamp,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `oauthConnections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`integrationId` int NOT NULL,
	`provider` enum('GMAIL','OUTLOOK','API','WEBHOOK') NOT NULL,
	`accountReference` varchar(512) NOT NULL,
	`scopes` json,
	`tokenStatus` enum('PENDING','ACTIVE','EXPIRED','REVOKED','ERROR') NOT NULL DEFAULT 'PENDING',
	`tokenExpiresAt` timestamp,
	`tokenMetadata` json,
	`encryptedSecretRef` varchar(1024) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `oauthConnections_id` PRIMARY KEY(`id`),
	CONSTRAINT `oauth_connections_integration_unique` UNIQUE(`integrationId`)
);
--> statement-breakpoint
CREATE TABLE `responses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`caseId` int NOT NULL,
	`actionId` int,
	`externalReference` varchar(512),
	`status` enum('PENDING','RECEIVED','NO_RESPONSE','CLOSED') NOT NULL DEFAULT 'PENDING',
	`receivedAt` timestamp,
	`contentMetadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `responses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `actions` ADD CONSTRAINT `actions_caseId_cases_id_fk` FOREIGN KEY (`caseId`) REFERENCES `cases`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `actions` ADD CONSTRAINT `actions_requestedBy_users_id_fk` FOREIGN KEY (`requestedBy`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `actions` ADD CONSTRAINT `actions_approvalId_approvals_id_fk` FOREIGN KEY (`approvalId`) REFERENCES `approvals`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `approvals` ADD CONSTRAINT `approvals_caseId_cases_id_fk` FOREIGN KEY (`caseId`) REFERENCES `cases`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `approvals` ADD CONSTRAINT `approvals_requestedBy_users_id_fk` FOREIGN KEY (`requestedBy`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `approvals` ADD CONSTRAINT `approvals_reviewer_users_id_fk` FOREIGN KEY (`reviewer`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `auditLogs` ADD CONSTRAINT `auditLogs_actor_users_id_fk` FOREIGN KEY (`actor`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `auditLogs` ADD CONSTRAINT `auditLogs_organizationId_organizations_id_fk` FOREIGN KEY (`organizationId`) REFERENCES `organizations`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `auditLogs` ADD CONSTRAINT `auditLogs_workspaceId_workspaces_id_fk` FOREIGN KEY (`workspaceId`) REFERENCES `workspaces`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `auditLogs` ADD CONSTRAINT `auditLogs_caseId_cases_id_fk` FOREIGN KEY (`caseId`) REFERENCES `cases`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `deadlines` ADD CONSTRAINT `deadlines_caseId_cases_id_fk` FOREIGN KEY (`caseId`) REFERENCES `cases`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `integrations` ADD CONSTRAINT `integrations_workspaceId_workspaces_id_fk` FOREIGN KEY (`workspaceId`) REFERENCES `workspaces`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `integrations` ADD CONSTRAINT `integrations_connectedBy_users_id_fk` FOREIGN KEY (`connectedBy`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_recipient_users_id_fk` FOREIGN KEY (`recipient`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_workspaceId_workspaces_id_fk` FOREIGN KEY (`workspaceId`) REFERENCES `workspaces`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `oauthConnections` ADD CONSTRAINT `oauthConnections_integrationId_integrations_id_fk` FOREIGN KEY (`integrationId`) REFERENCES `integrations`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `responses` ADD CONSTRAINT `responses_caseId_cases_id_fk` FOREIGN KEY (`caseId`) REFERENCES `cases`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `responses` ADD CONSTRAINT `responses_actionId_actions_id_fk` FOREIGN KEY (`actionId`) REFERENCES `actions`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX `actions_case_status_idx` ON `actions` (`caseId`,`status`);--> statement-breakpoint
CREATE INDEX `actions_approval_idx` ON `actions` (`approvalId`);--> statement-breakpoint
CREATE INDEX `approvals_case_status_idx` ON `approvals` (`caseId`,`status`);--> statement-breakpoint
CREATE INDEX `approvals_reviewer_idx` ON `approvals` (`reviewer`,`status`);--> statement-breakpoint
CREATE INDEX `audit_logs_resource_idx` ON `auditLogs` (`resourceType`,`resourceId`);--> statement-breakpoint
CREATE INDEX `audit_logs_tenant_time_idx` ON `auditLogs` (`organizationId`,`workspaceId`,`timestamp`);--> statement-breakpoint
CREATE INDEX `audit_logs_case_time_idx` ON `auditLogs` (`caseId`,`timestamp`);--> statement-breakpoint
CREATE INDEX `audit_logs_correlation_idx` ON `auditLogs` (`requestCorrelationId`);--> statement-breakpoint
CREATE INDEX `deadlines_case_due_idx` ON `deadlines` (`caseId`,`dueAt`);--> statement-breakpoint
CREATE INDEX `deadlines_status_due_idx` ON `deadlines` (`status`,`dueAt`);--> statement-breakpoint
CREATE INDEX `integrations_workspace_status_idx` ON `integrations` (`workspaceId`,`status`);--> statement-breakpoint
CREATE INDEX `notifications_recipient_state_idx` ON `notifications` (`recipient`,`readState`);--> statement-breakpoint
CREATE INDEX `notifications_workspace_created_idx` ON `notifications` (`workspaceId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `oauth_connections_provider_account_idx` ON `oauthConnections` (`provider`,`accountReference`);--> statement-breakpoint
CREATE INDEX `oauth_connections_token_status_idx` ON `oauthConnections` (`tokenStatus`);--> statement-breakpoint
CREATE INDEX `responses_case_status_idx` ON `responses` (`caseId`,`status`);--> statement-breakpoint
CREATE INDEX `responses_external_reference_idx` ON `responses` (`externalReference`);