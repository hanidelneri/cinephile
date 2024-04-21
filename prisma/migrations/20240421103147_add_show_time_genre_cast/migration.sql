-- CreateEnum
CREATE TYPE "role" AS ENUM ('cast', 'director');

-- AlterTable
ALTER TABLE "cinema" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "movie" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAT" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "show_time" (
    "id" SERIAL NOT NULL,
    "movieId" INTEGER NOT NULL,
    "datetime" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAT" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "show_time_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movie_genre" (
    "id" SERIAL NOT NULL,
    "movieId" INTEGER NOT NULL,
    "genreId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAT" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "movie_genre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movie_people" (
    "id" SERIAL NOT NULL,
    "movieId" INTEGER NOT NULL,
    "peopleId" INTEGER NOT NULL,
    "role" "role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAT" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "movie_people_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "genre" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAT" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "genre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "people" (
    "id" SERIAL NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAT" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "people_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "genre_name_key" ON "genre"("name");

-- AddForeignKey
ALTER TABLE "show_time" ADD CONSTRAINT "show_time_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "movie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movie_genre" ADD CONSTRAINT "movie_genre_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "movie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movie_genre" ADD CONSTRAINT "movie_genre_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES "genre"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movie_people" ADD CONSTRAINT "movie_people_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "movie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movie_people" ADD CONSTRAINT "movie_people_peopleId_fkey" FOREIGN KEY ("peopleId") REFERENCES "people"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
