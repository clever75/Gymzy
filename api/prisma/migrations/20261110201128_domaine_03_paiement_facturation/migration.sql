-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('FIRST_SUBSCRIPTION', 'RENEWAL', 'PER_SESSION', 'EVENT_TICKET');

-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('KKIAPAY');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'MOBILE_MONEY', 'CARD');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "beneficiaryUserId" TEXT NOT NULL,
    "payerUserId" TEXT,
    "amountOriginal" INTEGER NOT NULL,
    "discount" INTEGER NOT NULL DEFAULT 0,
    "amountFinal" INTEGER NOT NULL,
    "status" "TransactionStatus" NOT NULL,
    "type" "TransactionType" NOT NULL,
    "provider" "PaymentProvider",
    "paymentMethod" "PaymentMethod" NOT NULL,
    "providerReference" TEXT,
    "confirmedByUserId" TEXT,
    "confirmedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_records" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" "PaymentStatus" NOT NULL,
    "requestRaw" TEXT,
    "responseRaw" TEXT,
    "callbackRaw" TEXT,
    "deviceInfo" TEXT,
    "mobileNetwork" TEXT,
    "cardType" TEXT,
    "phone" TEXT,
    "reference" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL,
    "pdfUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "transactions_organizationId_createdAt_idx" ON "transactions"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "transactions_status_createdAt_idx" ON "transactions"("status", "createdAt");

-- CreateIndex
CREATE INDEX "transactions_beneficiaryUserId_idx" ON "transactions"("beneficiaryUserId");

-- CreateIndex
CREATE INDEX "transactions_payerUserId_idx" ON "transactions"("payerUserId");

-- CreateIndex
CREATE INDEX "transactions_confirmedByUserId_idx" ON "transactions"("confirmedByUserId");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_organizationId_providerReference_key" ON "transactions"("organizationId", "providerReference");

-- CreateIndex
CREATE INDEX "payment_records_organizationId_idx" ON "payment_records"("organizationId");

-- CreateIndex
CREATE INDEX "payment_records_transactionId_idx" ON "payment_records"("transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_transactionId_key" ON "invoices"("transactionId");

-- CreateIndex
CREATE INDEX "invoices_organizationId_idx" ON "invoices"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_organizationId_number_key" ON "invoices"("organizationId", "number");

-- AddForeignKey
ALTER TABLE "subscription_periods" ADD CONSTRAINT "subscription_periods_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_beneficiaryUserId_fkey" FOREIGN KEY ("beneficiaryUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_payerUserId_fkey" FOREIGN KEY ("payerUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_confirmedByUserId_fkey" FOREIGN KEY ("confirmedByUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_records" ADD CONSTRAINT "payment_records_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_records" ADD CONSTRAINT "payment_records_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

   ALTER TABLE "transactions"
     ADD CONSTRAINT chk_tx_amounts CHECK ("amountOriginal" > 0 AND "discount" >= 0 AND "amountFinal" >= 0),
     ADD CONSTRAINT chk_tx_total CHECK ("amountFinal" = "amountOriginal" - "discount"),
     ADD CONSTRAINT chk_tx_provider CHECK (("paymentMethod" = 'CASH') = ("provider" IS NULL)),
     ADD CONSTRAINT chk_tx_confirmed CHECK ("status" <> 'COMPLETED' OR "confirmedAt" IS NOT NULL),
     ADD CONSTRAINT chk_tx_cash_cashier CHECK (NOT ("paymentMethod" = 'CASH' AND "status" = 'COMPLETED') OR "confirmedByUserId" IS NOT NULL);

   ALTER TABLE "payment_records"
     ADD CONSTRAINT chk_record_amount CHECK ("amount" >= 0);