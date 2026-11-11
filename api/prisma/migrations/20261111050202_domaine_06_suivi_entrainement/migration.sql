-- CreateTable
CREATE TABLE "gym_exercise_categories" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gym_exercise_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gym_exercises" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "recommendedSeries" INTEGER,
    "recommendedReps" INTEGER,
    "recommendedWeightKg" DOUBLE PRECISION,
    "recommendedRestSeconds" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gym_exercises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gym_exercise_sessions" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "coachId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gym_exercise_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gym_exercise_session_participants" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "gym_exercise_session_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gym_exercise_session_entries" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "exerciseId" TEXT,
    "exerciseNameSnapshot" TEXT NOT NULL,
    "categoryNameSnapshot" TEXT,
    "series" INTEGER,
    "reps" INTEGER,
    "weightKg" DOUBLE PRECISION,
    "restSeconds" INTEGER,
    "rpe" INTEGER,
    "notes" TEXT,
    "setsDetail" JSONB,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "gym_exercise_session_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gym_body_measurements" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "recordedByUserId" TEXT NOT NULL,
    "measuredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "weightKg" DOUBLE PRECISION,
    "waistCm" DOUBLE PRECISION,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gym_body_measurements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "gym_exercise_categories_organizationId_sortOrder_idx" ON "gym_exercise_categories"("organizationId", "sortOrder");

-- CreateIndex
CREATE INDEX "gym_exercises_organizationId_idx" ON "gym_exercises"("organizationId");

-- CreateIndex
CREATE INDEX "gym_exercises_categoryId_idx" ON "gym_exercises"("categoryId");

-- CreateIndex
CREATE INDEX "gym_exercise_sessions_organizationId_date_idx" ON "gym_exercise_sessions"("organizationId", "date");

-- CreateIndex
CREATE INDEX "gym_exercise_sessions_coachId_date_idx" ON "gym_exercise_sessions"("coachId", "date");

-- CreateIndex
CREATE INDEX "gym_exercise_session_participants_organizationId_idx" ON "gym_exercise_session_participants"("organizationId");

-- CreateIndex
CREATE INDEX "gym_exercise_session_participants_userId_idx" ON "gym_exercise_session_participants"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "gym_exercise_session_participants_sessionId_userId_key" ON "gym_exercise_session_participants"("sessionId", "userId");

-- CreateIndex
CREATE INDEX "gym_exercise_session_entries_sessionId_idx" ON "gym_exercise_session_entries"("sessionId");

-- CreateIndex
CREATE INDEX "gym_exercise_session_entries_exerciseId_idx" ON "gym_exercise_session_entries"("exerciseId");

-- CreateIndex
CREATE INDEX "gym_exercise_session_entries_organizationId_idx" ON "gym_exercise_session_entries"("organizationId");

-- CreateIndex
CREATE INDEX "gym_body_measurements_userId_measuredAt_idx" ON "gym_body_measurements"("userId", "measuredAt");

-- CreateIndex
CREATE INDEX "gym_body_measurements_organizationId_idx" ON "gym_body_measurements"("organizationId");

-- CreateIndex
CREATE INDEX "gym_body_measurements_recordedByUserId_idx" ON "gym_body_measurements"("recordedByUserId");

-- AddForeignKey
ALTER TABLE "gym_exercise_categories" ADD CONSTRAINT "gym_exercise_categories_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gym_exercises" ADD CONSTRAINT "gym_exercises_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gym_exercises" ADD CONSTRAINT "gym_exercises_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "gym_exercise_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gym_exercise_sessions" ADD CONSTRAINT "gym_exercise_sessions_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gym_exercise_sessions" ADD CONSTRAINT "gym_exercise_sessions_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gym_exercise_session_participants" ADD CONSTRAINT "gym_exercise_session_participants_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gym_exercise_session_participants" ADD CONSTRAINT "gym_exercise_session_participants_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "gym_exercise_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gym_exercise_session_participants" ADD CONSTRAINT "gym_exercise_session_participants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gym_exercise_session_entries" ADD CONSTRAINT "gym_exercise_session_entries_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gym_exercise_session_entries" ADD CONSTRAINT "gym_exercise_session_entries_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "gym_exercise_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gym_exercise_session_entries" ADD CONSTRAINT "gym_exercise_session_entries_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "gym_exercises"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gym_body_measurements" ADD CONSTRAINT "gym_body_measurements_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gym_body_measurements" ADD CONSTRAINT "gym_body_measurements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gym_body_measurements" ADD CONSTRAINT "gym_body_measurements_recordedByUserId_fkey" FOREIGN KEY ("recordedByUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Contraintes CHECK (écrites à la main)
ALTER TABLE "gym_exercises"
  ADD CONSTRAINT chk_exercise_recommended CHECK (
    ("recommendedSeries" IS NULL OR "recommendedSeries" >= 0)
    AND ("recommendedReps" IS NULL OR "recommendedReps" >= 0)
    AND ("recommendedWeightKg" IS NULL OR "recommendedWeightKg" >= 0)
    AND ("recommendedRestSeconds" IS NULL OR "recommendedRestSeconds" >= 0)
  );

ALTER TABLE "gym_exercise_session_entries"
  ADD CONSTRAINT chk_entry_values CHECK (
    ("series" IS NULL OR "series" >= 0)
    AND ("reps" IS NULL OR "reps" >= 0)
    AND ("weightKg" IS NULL OR "weightKg" >= 0)
    AND ("restSeconds" IS NULL OR "restSeconds" >= 0)
  ),
  ADD CONSTRAINT chk_entry_rpe CHECK ("rpe" IS NULL OR "rpe" BETWEEN 1 AND 10);

ALTER TABLE "gym_body_measurements"
  ADD CONSTRAINT chk_measure_has_value CHECK ("weightKg" IS NOT NULL OR "waistCm" IS NOT NULL),
  ADD CONSTRAINT chk_measure_positive CHECK (
    ("weightKg" IS NULL OR "weightKg" > 0)
    AND ("waistCm" IS NULL OR "waistCm" > 0)
  );
