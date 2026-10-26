-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('UNVERIFIED', 'PARTIALLY_VERIFIED', 'FULLY_VERIFIED', 'CACHED', 'STALE', 'REJECTED', 'QUARANTINED');

-- CreateTable Lottery
CREATE TABLE "Lottery" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameML" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Lottery_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Lottery_code_key" ON "Lottery"("code");
CREATE INDEX "Lottery_code_idx" ON "Lottery"("code");

-- CreateTable Draw
CREATE TABLE "Draw" (
    "id" TEXT NOT NULL,
    "lotteryId" TEXT NOT NULL,
    "drawNumber" TEXT NOT NULL,
    "drawDate" TIMESTAMP(3) NOT NULL,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "sourceDocumentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Draw_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Draw" ADD CONSTRAINT "Draw_lotteryId_fkey" FOREIGN KEY ("lotteryId") REFERENCES "Lottery"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Draw" ADD CONSTRAINT "Draw_sourceDocumentId_fkey" FOREIGN KEY ("sourceDocumentId") REFERENCES "SourceDocument"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE UNIQUE INDEX "Draw_lotteryId_drawNumber_key" ON "Draw"("lotteryId", "drawNumber");
CREATE INDEX "Draw_lotteryId_drawDate_idx" ON "Draw"("lotteryId", "drawDate");
CREATE INDEX "Draw_verificationStatus_idx" ON "Draw"("verificationStatus");
