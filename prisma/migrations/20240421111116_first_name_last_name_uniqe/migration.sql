/*
  Warnings:

  - A unique constraint covering the columns `[first_name,last_name]` on the table `people` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "people_first_name_last_name_key" ON "people"("first_name", "last_name");
