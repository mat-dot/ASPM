CREATE TABLE `activityLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`projectId` int,
	`action` varchar(100) NOT NULL,
	`entityType` varchar(50),
	`entityId` int,
	`details` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `activityLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `aiAnalyses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`vulnerabilityId` int,
	`analysisType` enum('risk_prioritization','false_positive_detection','anomaly_detection','remediation_suggestion','impact_assessment'),
	`model` varchar(100),
	`input` json,
	`output` json,
	`confidence` decimal(3,2),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `aiAnalyses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `discoveredAssets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`assetType` enum('api','service','database','container','function','other'),
	`name` varchar(255) NOT NULL,
	`endpoint` varchar(500),
	`technology` varchar(255),
	`confidenceScore` decimal(3,2),
	`discoveredVia` enum('sast','dast','sca','manual','ai_inference'),
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `discoveredAssets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`repositoryUrl` varchar(500),
	`cicdWebhookUrl` varchar(500),
	`cicdProvider` enum('github','gitlab','jenkins','azure','other'),
	`riskScore` decimal(5,2) DEFAULT '0',
	`status` enum('active','inactive','archived') DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `promptInjectionDetections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`scanRunId` int,
	`location` varchar(500),
	`riskLevel` enum('crítica','alta','média','baixa'),
	`detectionMethod` varchar(255),
	`description` text,
	`remediation` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `promptInjectionDetections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scanRuns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`scannerConfigId` int,
	`status` enum('pending','running','completed','failed'),
	`trigger` enum('manual','scheduled','cicd','webhook'),
	`cicdBuildId` varchar(255),
	`gitCommitSha` varchar(100),
	`gitBranch` varchar(255),
	`startedAt` timestamp,
	`completedAt` timestamp,
	`duration` int,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `scanRuns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scannerConfigs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`scannerType` enum('sast','dast','sca','pentest','custom'),
	`scannerName` varchar(255) NOT NULL,
	`apiKey` varchar(500),
	`endpoint` varchar(500),
	`isEnabled` boolean DEFAULT true,
	`schedule` varchar(100),
	`lastRun` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `scannerConfigs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sensitiveDataDetections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`scanRunId` int,
	`detectionType` enum('api_key','database_password','private_key','token','credit_card','ssn','pii','custom_pattern'),
	`location` varchar(500),
	`severity` enum('crítica','alta','média','baixa'),
	`detectedValue` text,
	`remediated` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sensitiveDataDetections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vulnerabilities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`scanRunId` int,
	`discoveredAssetId` int,
	`title` varchar(500) NOT NULL,
	`description` text,
	`severity` enum('crítica','alta','média','baixa','info'),
	`cvss` decimal(3,1),
	`cveId` varchar(50),
	`cweId` varchar(50),
	`scannerSource` varchar(100),
	`status` enum('aberta','em remediação','resolvida','falso positivo'),
	`falsePositiveScore` decimal(3,2),
	`riskPriority` int,
	`remediation` text,
	`detectedAt` timestamp,
	`resolvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vulnerabilities_id` PRIMARY KEY(`id`)
);
