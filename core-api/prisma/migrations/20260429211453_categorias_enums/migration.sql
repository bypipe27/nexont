/*
  Warnings:

  - You are about to drop the column `fotoPerfil` on the `usuarios` table. All the data in the column will be lost.
  - You are about to drop the `categorias` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `productos_categorias` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "CategoriaProducto" AS ENUM ('ELECTRONICA_TECNOLOGIA', 'HOGAR_DECORACION', 'MODA_ACCESORIOS', 'SALUD_BELLEZA', 'DEPORTES_FITNESS', 'JUGUETES_BEBES', 'AUTOMOTRIZ', 'LIBROS_MUSICA_ENTRETENIMIENTO', 'ALIMENTOS_BEBIDAS', 'SERVICIOS_OTROS');

-- DropForeignKey
ALTER TABLE "productos_categorias" DROP CONSTRAINT "productos_categorias_categoriaId_fkey";

-- DropForeignKey
ALTER TABLE "productos_categorias" DROP CONSTRAINT "productos_categorias_productoId_fkey";

-- AlterTable
ALTER TABLE "productos" ADD COLUMN     "categoria" "CategoriaProducto" NOT NULL DEFAULT 'SERVICIOS_OTROS';

-- AlterTable
ALTER TABLE "usuarios" DROP COLUMN "fotoPerfil";

-- DropTable
DROP TABLE "categorias";

-- DropTable
DROP TABLE "productos_categorias";
