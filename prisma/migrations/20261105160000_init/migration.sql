-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Provider" AS ENUM ('GITHUB', 'GITLAB', 'GITEA');

-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateEnum
CREATE TYPE "ChartStrategy" AS ENUM ('AUTO', 'TEMPLATE', 'HYBRID');

-- CreateEnum
CREATE TYPE "TemplateKind" AS ENUM ('WEB', 'API', 'WORKER', 'CRONJOB', 'STATEFUL');

-- CreateEnum
CREATE TYPE "BuildStatus" AS ENUM ('QUEUED', 'DISPATCHED', 'RUNNING', 'SUCCEEDED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ScanStatus" AS ENUM ('PASSED', 'WARNING', 'FAILED');

-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'UNKNOWN');

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "sourceProvider" "Provider" NOT NULL,
    "sourceRef" TEXT NOT NULL DEFAULT 'main',
    "visibility" "Visibility" NOT NULL DEFAULT 'PRIVATE',
    "chartStrategy" "ChartStrategy" NOT NULL DEFAULT 'HYBRID',
    "templateKind" "TemplateKind" NOT NULL DEFAULT 'WEB',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Build" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "status" "BuildStatus" NOT NULL DEFAULT 'QUEUED',
    "workflowRunId" TEXT,
    "commitSha" TEXT,
    "logUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Build_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Release" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "imageRef" TEXT,
    "imageDigest" TEXT,
    "chartRef" TEXT,
    "commitSha" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Release_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SecurityScan" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "releaseId" TEXT,
    "status" "ScanStatus" NOT NULL,
    "criticalCount" INTEGER NOT NULL DEFAULT 0,
    "highCount" INTEGER NOT NULL DEFAULT 0,
    "mediumCount" INTEGER NOT NULL DEFAULT 0,
    "lowCount" INTEGER NOT NULL DEFAULT 0,
    "scannerVersion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SecurityScan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vulnerability" (
    "id" TEXT NOT NULL,
    "scanId" TEXT NOT NULL,
    "cveId" TEXT NOT NULL,
    "packageName" TEXT NOT NULL,
    "installedVersion" TEXT NOT NULL,
    "fixedVersion" TEXT,
    "fixedAt" TIMESTAMP(3),
    "severity" "Severity" NOT NULL,
    "primaryUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vulnerability_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Project_name_key" ON "Project"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Release_projectId_version_key" ON "Release"("projectId", "version");

-- CreateIndex
CREATE INDEX "Vulnerability_cveId_idx" ON "Vulnerability"("cveId");

-- AddForeignKey
ALTER TABLE "Build" ADD CONSTRAINT "Build_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Release" ADD CONSTRAINT "Release_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecurityScan" ADD CONSTRAINT "SecurityScan_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecurityScan" ADD CONSTRAINT "SecurityScan_releaseId_fkey" FOREIGN KEY ("releaseId") REFERENCES "Release"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vulnerability" ADD CONSTRAINT "Vulnerability_scanId_fkey" FOREIGN KEY ("scanId") REFERENCES "SecurityScan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
