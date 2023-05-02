/*
  Warnings:

  - You are about to drop the column `body` on the `whiteboard` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "whiteboard" DROP COLUMN "body",
ADD COLUMN     "text" TEXT,
ADD COLUMN     "type" TEXT;
