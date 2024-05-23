/*
  Warnings:

  - You are about to drop the column `first_name` on the `people` table. All the data in the column will be lost.
  - You are about to drop the column `last_name` on the `people` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `people` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `people` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "people_first_name_last_name_key";

-- AlterTable
ALTER TABLE "people" DROP COLUMN "first_name",
DROP COLUMN "last_name",
ADD COLUMN     "name" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "people_name_key" ON "people"("name");
