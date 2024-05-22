/*
  Warnings:

  - You are about to drop the column `screentType` on the `show_time` table. All the data in the column will be lost.
  - Added the required column `cinemaId` to the `show_time` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "screenType" AS ENUM ('twoD', 'threeD');

-- AlterTable
ALTER TABLE "show_time" DROP COLUMN "screentType",
ADD COLUMN     "cinemaId" INTEGER NOT NULL,
ADD COLUMN     "screenType" "screenType" NOT NULL DEFAULT 'twoD';

-- DropEnum
DROP TYPE "screentType";

-- AddForeignKey
ALTER TABLE "show_time" ADD CONSTRAINT "show_time_cinemaId_fkey" FOREIGN KEY ("cinemaId") REFERENCES "cinema"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
