ALTER TABLE `artifacts` ADD `researchSourceId` int;--> statement-breakpoint
ALTER TABLE `artifacts` ADD CONSTRAINT `artifacts_researchSourceId_researchSources_id_fk` FOREIGN KEY (`researchSourceId`) REFERENCES `researchSources`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX `artifacts_research_source_idx` ON `artifacts` (`researchSourceId`);