-- AlterTable
ALTER TABLE "files" ADD COLUMN     "isnote" BOOLEAN DEFAULT false,
ADD COLUMN     "ispinned" BOOLEAN DEFAULT false,
ALTER COLUMN "title" SET DATA TYPE TEXT;
