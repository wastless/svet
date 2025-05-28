/*
  Warnings:

  - Made the column `author` on table `gifts` required. This step will fail if there are existing NULL values in that column.
  - Made the column `nickname` on table `gifts` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "gifts" ALTER COLUMN "codeText" DROP NOT NULL,
ALTER COLUMN "author" SET NOT NULL,
ALTER COLUMN "nickname" SET NOT NULL;
