-- CreateEnum
CREATE TYPE "FormulaBillingType" AS ENUM ('SUBSCRIPTION', 'PER_SESSION');

-- CreateEnum
CREATE TYPE "BillingPeriod" AS ENUM ('WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUAL');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('PENDING', 'ACTIVE', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SubscriptionCloseReason" AS ENUM ('FORMULA_CHANGED', 'CANCELLED_BY_ADMIN', 'PAYMENT_ABANDONED');

-- CreateTable
CREATE TABLE "activities" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "parentActivityId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_formulas" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "billingType" "FormulaBillingType" NOT NULL,
    "billingPeriod" "BillingPeriod",
    "sessionsPerWeek" INTEGER,
    "sessionsPerMonth" INTEGER,
    "durationDays" INTEGER NOT NULL,
    "applicableCategory" TEXT,
    "isPopular" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_formulas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "beneficiaryUserId" TEXT NOT NULL,
    "formulaId" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL,
    "agreedPrice" INTEGER,
    "agreedPriceSetByUserId" TEXT,
    "agreedPriceSetAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "closeReason" "SubscriptionCloseReason",
    "replacedBySubscriptionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_periods" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "payerUserId" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "catalogPrice" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "transactionId" TEXT,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_periods_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "activities_organizationId_idx" ON "activities"("organizationId");

-- CreateIndex
CREATE INDEX "activities_parentActivityId_idx" ON "activities"("parentActivityId");

-- CreateIndex
CREATE INDEX "subscription_formulas_organizationId_idx" ON "subscription_formulas"("organizationId");

-- CreateIndex
CREATE INDEX "subscription_formulas_activityId_idx" ON "subscription_formulas"("activityId");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_replacedBySubscriptionId_key" ON "subscriptions"("replacedBySubscriptionId");

-- CreateIndex
CREATE INDEX "subscriptions_organizationId_status_idx" ON "subscriptions"("organizationId", "status");

-- CreateIndex
CREATE INDEX "subscriptions_beneficiaryUserId_idx" ON "subscriptions"("beneficiaryUserId");

-- CreateIndex
CREATE INDEX "subscriptions_formulaId_idx" ON "subscriptions"("formulaId");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_periods_transactionId_key" ON "subscription_periods"("transactionId");

-- CreateIndex
CREATE INDEX "subscription_periods_organizationId_endDate_idx" ON "subscription_periods"("organizationId", "endDate");

-- CreateIndex
CREATE INDEX "subscription_periods_subscriptionId_idx" ON "subscription_periods"("subscriptionId");

-- CreateIndex
CREATE INDEX "subscription_periods_payerUserId_idx" ON "subscription_periods"("payerUserId");

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_parentActivityId_fkey" FOREIGN KEY ("parentActivityId") REFERENCES "activities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_formulas" ADD CONSTRAINT "subscription_formulas_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_formulas" ADD CONSTRAINT "subscription_formulas_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "activities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_beneficiaryUserId_fkey" FOREIGN KEY ("beneficiaryUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_formulaId_fkey" FOREIGN KEY ("formulaId") REFERENCES "subscription_formulas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_agreedPriceSetByUserId_fkey" FOREIGN KEY ("agreedPriceSetByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_replacedBySubscriptionId_fkey" FOREIGN KEY ("replacedBySubscriptionId") REFERENCES "subscriptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_periods" ADD CONSTRAINT "subscription_periods_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_periods" ADD CONSTRAINT "subscription_periods_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_periods" ADD CONSTRAINT "subscription_periods_payerUserId_fkey" FOREIGN KEY ("payerUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "subscription_formulas"
  ADD CONSTRAINT chk_formula_price CHECK ("price" > 0),
  ADD CONSTRAINT chk_formula_duration CHECK ("durationDays" > 0),
  ADD CONSTRAINT chk_formula_sessions CHECK (NOT ("sessionsPerWeek" IS NOT NULL AND "sessionsPerMonth" IS NOT NULL)),
  ADD CONSTRAINT chk_formula_billing CHECK (("billingType" = 'SUBSCRIPTION') = ("billingPeriod" IS NOT NULL));

ALTER TABLE "subscriptions"
  ADD CONSTRAINT chk_sub_agreed_price CHECK ("agreedPrice" IS NULL OR "agreedPrice" > 0),
  ADD CONSTRAINT chk_sub_agreed_meta CHECK (("agreedPrice" IS NULL) = ("agreedPriceSetAt" IS NULL)),
  ADD CONSTRAINT chk_sub_close CHECK (("closedAt" IS NULL) = ("closeReason" IS NULL));

ALTER TABLE "subscription_periods"
  ADD CONSTRAINT chk_period_amounts CHECK ("catalogPrice" > 0 AND "amount" >= 0),
  ADD CONSTRAINT chk_period_dates CHECK (("startDate" IS NULL) = ("endDate" IS NULL)),
  ADD CONSTRAINT chk_period_order CHECK ("startDate" IS NULL OR "endDate" > "startDate");