/*
  Warnings:

  - You are about to drop the `Gift` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Gift";

-- CreateTable
CREATE TABLE "gifts" (
    "id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "title" TEXT,
    "isSecret" BOOLEAN NOT NULL DEFAULT false,
    "openDate" TIMESTAMP(3) NOT NULL,
    "englishDescription" TEXT NOT NULL,
    "hintImageUrl" TEXT NOT NULL,
    "code" TEXT,
    "contentPath" TEXT NOT NULL,
    "memoryPhotoUrl" TEXT,

    CONSTRAINT "gifts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "gifts_number_key" ON "gifts"("number");
