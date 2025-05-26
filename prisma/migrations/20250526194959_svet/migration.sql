/*
  Warnings:

  - You are about to drop the column `memoryPhotoUrl` on the `gifts` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "gifts" DROP COLUMN "memoryPhotoUrl";

-- CreateTable
CREATE TABLE "memory_photos" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "photoUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "giftId" TEXT NOT NULL,

    CONSTRAINT "memory_photos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "memory_photos_giftId_key" ON "memory_photos"("giftId");

-- AddForeignKey
ALTER TABLE "memory_photos" ADD CONSTRAINT "memory_photos_giftId_fkey" FOREIGN KEY ("giftId") REFERENCES "gifts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
