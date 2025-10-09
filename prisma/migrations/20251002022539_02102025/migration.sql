/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `Chu` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Chu" ADD COLUMN     "code" VARCHAR(255);

-- AlterTable
ALTER TABLE "DetailAct" ADD COLUMN     "approved" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "userActionCode" VARCHAR(255);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "latdepartment" VARCHAR(255),
ADD COLUMN     "latdivision" VARCHAR(255),
ADD COLUMN     "latoffice" VARCHAR(255),
ADD COLUMN     "latunit" VARCHAR(255);

-- CreateTable
CREATE TABLE "Meeting" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "dateactive" TIMESTAMPTZ(0) NOT NULL,
    "createdAt" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(0) NOT NULL,

    CONSTRAINT "Meeting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DetailMeet" (
    "id" SERIAL NOT NULL,
    "meetingId" INTEGER NOT NULL,
    "userCode" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "meetimg" VARCHAR(255) NOT NULL,
    "approved" INTEGER NOT NULL DEFAULT 1,
    "userActionId" INTEGER,
    "createdAt" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(0) NOT NULL,

    CONSTRAINT "DetailMeet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Chu_code_key" ON "Chu"("code");

-- AddForeignKey
ALTER TABLE "DetailAct" ADD CONSTRAINT "DetailAct_userActionCode_fkey" FOREIGN KEY ("userActionCode") REFERENCES "User"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetailMeet" ADD CONSTRAINT "DetailMeet_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetailMeet" ADD CONSTRAINT "DetailMeet_userCode_fkey" FOREIGN KEY ("userCode") REFERENCES "User"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetailMeet" ADD CONSTRAINT "DetailMeet_userActionId_fkey" FOREIGN KEY ("userActionId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
