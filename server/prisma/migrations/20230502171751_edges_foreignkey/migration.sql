/*
  Warnings:

  - Added the required column `file_id` to the `edges` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "edges" ADD COLUMN     "file_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "edges" ADD CONSTRAINT "fk_file_id" FOREIGN KEY ("file_id") REFERENCES "files"("file_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
