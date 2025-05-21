-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('Male', 'Female');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "code" VARCHAR(255),
    "firstname" VARCHAR(255) NOT NULL,
    "lastname" VARCHAR(255) NOT NULL,
    "actived" VARCHAR(50) NOT NULL DEFAULT 'A',
    "gender" "Gender" NOT NULL,
    "tel" VARCHAR(255),
    "userimg" VARCHAR(255),
    "roleId" INTEGER,
    "positionId" INTEGER,
    "unitId" INTEGER,
    "chuId" INTEGER,
    "datebirth" TIMESTAMPTZ(0),
    "tribe" VARCHAR(255),
    "religion" VARCHAR(255),
    "villagebirth" VARCHAR(255),
    "districtbirth" VARCHAR(255),
    "provincebirth" VARCHAR(255),
    "villagenow" VARCHAR(255),
    "districtnow" VARCHAR(255),
    "provincenow" VARCHAR(255),
    "edusaman" VARCHAR(255),
    "edulevel" VARCHAR(255),
    "edusubject" VARCHAR(255),
    "edutheory" VARCHAR(255),
    "phaksupport" TIMESTAMPTZ(0),
    "phakrule" TIMESTAMPTZ(0),
    "phaksamhong" TIMESTAMPTZ(0),
    "phaksomboun" TIMESTAMPTZ(0),
    "phakposition" VARCHAR(255),
    "phakcard" VARCHAR(255),
    "phakissuedcard" TIMESTAMPTZ(0),
    "phakbook" VARCHAR(255),
    "latcomein" TIMESTAMPTZ(0),
    "latposition" VARCHAR(255),
    "kammabancomein" TIMESTAMPTZ(0),
    "kammabanposition" VARCHAR(255),
    "youthcomein" TIMESTAMPTZ(0),
    "womencomein" TIMESTAMPTZ(0),
    "womenposition" VARCHAR(255),
    "arts" TEXT[],
    "sports" TEXT[],
    "fbusiness" TEXT[],
    "ideas" TEXT[],
    "createdAt" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(0) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Position" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,

    CONSTRAINT "Position_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Unit" (
    "id" SERIAL NOT NULL,
    "no" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,

    CONSTRAINT "Unit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chu" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,

    CONSTRAINT "Chu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "dateactive" TIMESTAMPTZ(0) NOT NULL,
    "createdAt" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(0) NOT NULL,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DetailAct" (
    "id" SERIAL NOT NULL,
    "activityId" INTEGER NOT NULL,
    "userCode" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "actimg" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(0) NOT NULL,

    CONSTRAINT "DetailAct_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_code_key" ON "User"("code");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Position"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_chuId_fkey" FOREIGN KEY ("chuId") REFERENCES "Chu"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetailAct" ADD CONSTRAINT "DetailAct_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetailAct" ADD CONSTRAINT "DetailAct_userCode_fkey" FOREIGN KEY ("userCode") REFERENCES "User"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
