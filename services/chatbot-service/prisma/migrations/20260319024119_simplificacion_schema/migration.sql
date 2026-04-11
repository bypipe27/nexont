/*
  Warnings:

  - You are about to drop the `envios` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `pagos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `permisos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `productos_atributos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `roles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `roles_permisos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `usuarios_roles` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "envios" DROP CONSTRAINT "envios_pedidoId_fkey";

-- DropForeignKey
ALTER TABLE "pagos" DROP CONSTRAINT "pagos_pedidoId_fkey";

-- DropForeignKey
ALTER TABLE "productos_atributos" DROP CONSTRAINT "productos_atributos_productoId_fkey";

-- DropForeignKey
ALTER TABLE "roles_permisos" DROP CONSTRAINT "roles_permisos_permisoId_fkey";

-- DropForeignKey
ALTER TABLE "roles_permisos" DROP CONSTRAINT "roles_permisos_rolId_fkey";

-- DropForeignKey
ALTER TABLE "usuarios_roles" DROP CONSTRAINT "usuarios_roles_rolId_fkey";

-- DropForeignKey
ALTER TABLE "usuarios_roles" DROP CONSTRAINT "usuarios_roles_usuarioId_fkey";

-- DropTable
DROP TABLE "envios";

-- DropTable
DROP TABLE "pagos";

-- DropTable
DROP TABLE "permisos";

-- DropTable
DROP TABLE "productos_atributos";

-- DropTable
DROP TABLE "roles";

-- DropTable
DROP TABLE "roles_permisos";

-- DropTable
DROP TABLE "usuarios_roles";
