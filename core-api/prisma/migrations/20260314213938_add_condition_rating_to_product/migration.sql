-- AlterTable
ALTER TABLE "products" ADD COLUMN     "condition" TEXT DEFAULT 'nuevo',
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "rating" DOUBLE PRECISION DEFAULT 0;
