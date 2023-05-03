/*
  Warnings:

  - The primary key for the `edges` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the `whiteboard` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "whiteboard" DROP CONSTRAINT "fk_file_id";

-- AlterTable
ALTER TABLE "edges" DROP CONSTRAINT "edges_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "edges_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "edges_id_seq";

-- AlterTable
ALTER TABLE "files" ADD COLUMN     "lastAccessed" TIMESTAMP(3);

-- DropTable
DROP TABLE "whiteboard";

-- CreateTable
CREATE TABLE "nodes" (
    "node_id" SERIAL NOT NULL,
    "location" DECIMAL[],
    "color" VARCHAR(7),
    "file_id" INTEGER,
    "x" DECIMAL,
    "y" DECIMAL,
    "width" DECIMAL,
    "height" DECIMAL,
    "text" TEXT,
    "type" TEXT,

    CONSTRAINT "nodes_pkey" PRIMARY KEY ("node_id")
);

-- AddForeignKey
ALTER TABLE "nodes" ADD CONSTRAINT "fk_file_id" FOREIGN KEY ("file_id") REFERENCES "files"("file_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
