-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('PHOTO', 'VIDEO');

-- CreateEnum
CREATE TYPE "MediaValidationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "media_posts" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "activityId" TEXT,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "mediaUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "mediaType" "MediaType" NOT NULL,
    "authorUserId" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "publishedByUserId" TEXT,
    "publishedOverridingConsent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_tag_validations" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "mediaPostId" TEXT NOT NULL,
    "taggedUserId" TEXT NOT NULL,
    "validatorUserId" TEXT NOT NULL,
    "status" "MediaValidationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validatedAt" TIMESTAMP(3),

    CONSTRAINT "media_tag_validations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "media_posts_organizationId_isPublic_publishedAt_idx" ON "media_posts"("organizationId", "isPublic", "publishedAt");

-- CreateIndex
CREATE INDEX "media_posts_organizationId_activityId_idx" ON "media_posts"("organizationId", "activityId");

-- CreateIndex
CREATE INDEX "media_posts_authorUserId_idx" ON "media_posts"("authorUserId");

-- CreateIndex
CREATE INDEX "media_tag_validations_organizationId_idx" ON "media_tag_validations"("organizationId");

-- CreateIndex
CREATE INDEX "media_tag_validations_taggedUserId_idx" ON "media_tag_validations"("taggedUserId");

-- CreateIndex
CREATE INDEX "media_tag_validations_validatorUserId_status_idx" ON "media_tag_validations"("validatorUserId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "media_tag_validations_mediaPostId_taggedUserId_key" ON "media_tag_validations"("mediaPostId", "taggedUserId");

-- AddForeignKey
ALTER TABLE "media_posts" ADD CONSTRAINT "media_posts_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_posts" ADD CONSTRAINT "media_posts_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "activities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_posts" ADD CONSTRAINT "media_posts_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_posts" ADD CONSTRAINT "media_posts_publishedByUserId_fkey" FOREIGN KEY ("publishedByUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_tag_validations" ADD CONSTRAINT "media_tag_validations_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_tag_validations" ADD CONSTRAINT "media_tag_validations_mediaPostId_fkey" FOREIGN KEY ("mediaPostId") REFERENCES "media_posts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_tag_validations" ADD CONSTRAINT "media_tag_validations_taggedUserId_fkey" FOREIGN KEY ("taggedUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_tag_validations" ADD CONSTRAINT "media_tag_validations_validatorUserId_fkey" FOREIGN KEY ("validatorUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

   ALTER TABLE "media_posts"
     ADD CONSTRAINT chk_post_published CHECK ("isPublic" = false OR "publishedAt" IS NOT NULL),
     ADD CONSTRAINT chk_post_has_media CHECK ("isPublic" = false OR cardinality("mediaUrls") > 0),
     ADD CONSTRAINT chk_post_override CHECK ("publishedOverridingConsent" = false OR "publishedByUserId" IS NOT NULL);

   ALTER TABLE "media_tag_validations"
     ADD CONSTRAINT chk_tag_validated CHECK (("status" = 'PENDING') = ("validatedAt" IS NULL));