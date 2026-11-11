-- CreateEnum
CREATE TYPE "AccessResult" AS ENUM ('ALLOWED', 'WARNING', 'DENIED');

-- CreateTable
CREATE TABLE "membership_cards" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cardNumber" TEXT NOT NULL,
    "signedToken" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "membership_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "membership_cards_access_logs" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT,
    "scannedByUserId" TEXT NOT NULL,
    "gate" TEXT,
    "result" "AccessResult" NOT NULL,
    "activityId" TEXT,
    "subscriptionPeriodId" TEXT,
    "scannedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "membership_cards_access_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "membership_cards_cardNumber_key" ON "membership_cards"("cardNumber");

-- CreateIndex
CREATE INDEX "membership_cards_organizationId_idx" ON "membership_cards"("organizationId");

-- CreateIndex
CREATE INDEX "membership_cards_userId_idx" ON "membership_cards"("userId");

-- CreateIndex
CREATE INDEX "membership_cards_access_logs_organizationId_scannedAt_idx" ON "membership_cards_access_logs"("organizationId", "scannedAt");

-- CreateIndex
CREATE INDEX "membership_cards_access_logs_userId_scannedAt_idx" ON "membership_cards_access_logs"("userId", "scannedAt");

-- CreateIndex
CREATE INDEX "membership_cards_access_logs_scannedByUserId_idx" ON "membership_cards_access_logs"("scannedByUserId");

-- CreateIndex
CREATE INDEX "membership_cards_access_logs_activityId_idx" ON "membership_cards_access_logs"("activityId");

-- CreateIndex
CREATE INDEX "membership_cards_access_logs_subscriptionPeriodId_idx" ON "membership_cards_access_logs"("subscriptionPeriodId");

-- AddForeignKey
ALTER TABLE "membership_cards" ADD CONSTRAINT "membership_cards_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membership_cards" ADD CONSTRAINT "membership_cards_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membership_cards_access_logs" ADD CONSTRAINT "membership_cards_access_logs_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membership_cards_access_logs" ADD CONSTRAINT "membership_cards_access_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membership_cards_access_logs" ADD CONSTRAINT "membership_cards_access_logs_scannedByUserId_fkey" FOREIGN KEY ("scannedByUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membership_cards_access_logs" ADD CONSTRAINT "membership_cards_access_logs_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "activities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membership_cards_access_logs" ADD CONSTRAINT "membership_cards_access_logs_subscriptionPeriodId_fkey" FOREIGN KEY ("subscriptionPeriodId") REFERENCES "subscription_periods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;



-- Contraintes CHECK (écrites à la main)

-- Une seule carte active par personne : l'unicité ne porte que sur les cartes non révoquées
CREATE UNIQUE INDEX uq_card_one_active_per_user
  ON "membership_cards" ("userId") WHERE "revokedAt" IS NULL;

ALTER TABLE "membership_cards"
  ADD CONSTRAINT chk_card_number CHECK (length(btrim("cardNumber")) > 0),
  ADD CONSTRAINT chk_card_token CHECK (length(btrim("signedToken")) > 0),
  ADD CONSTRAINT chk_card_revoked_after_issue CHECK ("revokedAt" IS NULL OR "revokedAt" >= "issuedAt");

-- Un code inconnu (aucune personne reconnue) ne peut jamais être autorisé
ALTER TABLE "membership_cards_access_logs"
  ADD CONSTRAINT chk_access_unknown_denied CHECK ("userId" IS NOT NULL OR "result" = 'DENIED');