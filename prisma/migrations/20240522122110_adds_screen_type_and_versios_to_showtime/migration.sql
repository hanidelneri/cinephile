-- CreateEnum
CREATE TYPE "screentType" AS ENUM ('twoD', 'threeD');

-- CreateEnum
CREATE TYPE "version" AS ENUM ('df', 'omu', 'omeu', 'ov');

-- AlterTable
ALTER TABLE "show_time" ADD COLUMN     "screentType" "screentType" NOT NULL DEFAULT 'twoD',
ADD COLUMN     "versions" "version"[];
