-- AlterTable
ALTER TABLE "Table" ADD COLUMN     "hiddenSeats" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "linkedTableId" TEXT;
