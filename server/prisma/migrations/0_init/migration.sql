-- CreateTable
CREATE TABLE "edges" (
    "id" SERIAL NOT NULL,
    "source" TEXT,
    "target" TEXT,
    "source_handle" TEXT,
    "target_handle" TEXT,

    CONSTRAINT "edges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "files" (
    "file_id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "body" TEXT,
    "user_id" INTEGER,

    CONSTRAINT "files_pkey" PRIMARY KEY ("file_id")
);

-- CreateTable
CREATE TABLE "users" (
    "user_id" SERIAL NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "whiteboard" (
    "whiteboard_id" SERIAL NOT NULL,
    "location" DECIMAL[],
    "color" VARCHAR(7),
    "file_id" INTEGER,
    "x" DECIMAL,
    "y" DECIMAL,
    "width" DECIMAL,
    "height" DECIMAL,

    CONSTRAINT "whiteboard_pkey" PRIMARY KEY ("whiteboard_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "fk_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "whiteboard" ADD CONSTRAINT "fk_file_id" FOREIGN KEY ("file_id") REFERENCES "files"("file_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

