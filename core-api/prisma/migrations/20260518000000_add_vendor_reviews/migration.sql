-- CreateTable
CREATE TABLE "resenas_vendedores" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "vendedorId" INTEGER NOT NULL,
    "pedidoId" INTEGER NOT NULL,
    "calificacion" INTEGER NOT NULL,
    "comentario" VARCHAR(300),
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resenas_vendedores_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "resenas_vendedores_vendedorId_creadoEn_idx" ON "resenas_vendedores"("vendedorId", "creadoEn");

-- CreateIndex
CREATE INDEX "resenas_vendedores_pedidoId_idx" ON "resenas_vendedores"("pedidoId");

-- CreateIndex
CREATE UNIQUE INDEX "resenas_vendedores_usuarioId_vendedorId_pedidoId_key" ON "resenas_vendedores"("usuarioId", "vendedorId", "pedidoId");

-- AddForeignKey
ALTER TABLE "resenas_vendedores" ADD CONSTRAINT "resenas_vendedores_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resenas_vendedores" ADD CONSTRAINT "resenas_vendedores_vendedorId_fkey" FOREIGN KEY ("vendedorId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resenas_vendedores" ADD CONSTRAINT "resenas_vendedores_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "pedidos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
