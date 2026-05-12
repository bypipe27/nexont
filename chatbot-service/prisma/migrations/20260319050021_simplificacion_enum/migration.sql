/*
  Warnings:

  - The values [SEMINUEVO] on the enum `CondicionProducto` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "CondicionProducto_new" AS ENUM ('NUEVO', 'USADO', 'REACONDICIONADO');
ALTER TABLE "productos" ALTER COLUMN "condicion" DROP DEFAULT;
ALTER TABLE "productos" ALTER COLUMN "condicion" TYPE "CondicionProducto_new" USING ("condicion"::text::"CondicionProducto_new");
ALTER TYPE "CondicionProducto" RENAME TO "CondicionProducto_old";
ALTER TYPE "CondicionProducto_new" RENAME TO "CondicionProducto";
DROP TYPE "CondicionProducto_old";
ALTER TABLE "productos" ALTER COLUMN "condicion" SET DEFAULT 'NUEVO';
COMMIT;

-- DropEnum
DROP TYPE "EstadoEnvio";
