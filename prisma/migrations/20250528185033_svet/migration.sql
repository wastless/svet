/*
  Warnings:

  - You are about to drop the column `text` on the `memory_photos` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "gifts" ADD COLUMN     "author" TEXT,
ADD COLUMN     "nickname" TEXT;

-- AlterTable
ALTER TABLE "memory_photos" DROP COLUMN "text";
