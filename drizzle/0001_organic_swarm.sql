CREATE TABLE `assets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`documentId` int NOT NULL,
	`assetType` enum('real-estate','bank-account','investment','business','personal-item','vehicle','cryptocurrency') NOT NULL,
	`description` varchar(255) NOT NULL,
	`value` int,
	`location` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `assets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `beneficiaries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`documentId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`relationship` varchar(100),
	`allocationPercentage` int,
	`role` enum('beneficiary','executor','trustee','alternate-executor') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `beneficiaries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`documentType` enum('will','poa-property','poa-personal') NOT NULL,
	`title` varchar(255) NOT NULL,
	`status` enum('draft','completed','signed') NOT NULL DEFAULT 'draft',
	`testatorName` varchar(255),
	`testatorAge` int,
	`maritalStatus` varchar(100),
	`hasChildren` boolean DEFAULT false,
	`primaryBeneficiary` varchar(255),
	`alternateExecutor` varchar(255),
	`estateValue` int,
	`content` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `assets` ADD CONSTRAINT `assets_documentId_documents_id_fk` FOREIGN KEY (`documentId`) REFERENCES `documents`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `beneficiaries` ADD CONSTRAINT `beneficiaries_documentId_documents_id_fk` FOREIGN KEY (`documentId`) REFERENCES `documents`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `documents` ADD CONSTRAINT `documents_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;