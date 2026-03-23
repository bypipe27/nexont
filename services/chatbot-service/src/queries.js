import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ─── QUERIES COMPRADOR ───────────────────────────────────────────────────────

export async function buscarProductos({ query = '', categoria = null, precio_max = null, precio_min = null, condicion = null, limite = 3 }) {
  const productos = await prisma.producto.findMany({
    where: {
      estaActivo: true,
      stock:      { gt: 0 },
      ...(query && {
        OR: [
          { titulo:      { contains: query, mode: 'insensitive' } },
          { descripcion: { contains: query, mode: 'insensitive' } },
          { etiquetas:   { has: query } },
        ],
      }),
      ...(precio_max !== null && { precio: { lte: precio_max } }),
      ...(precio_min !== null && { precio: { gte: precio_min } }),
      ...(condicion  && { condicion: condicion.toUpperCase() }),
      ...(categoria  && {
        categorias: {
          some: {
            categoria: { nombre: { contains: categoria, mode: 'insensitive' } },
          },
        },
      }),
    },
    select: {
      id:                 true,
      titulo:             true,
      descripcion:        true,
      precio:             true,
      stock:              true,
      condicion:          true,
      promedioCalificacion: true,
      totalResenas:       true,
      etiquetas:          true,
      vendedor: {
        select: { nombres: true, apellidos: true, esVendedorVerificado: true },
      },
      imagenes: {
        where:   { esPrincipal: true },
        select:  { url: true },
        take:    1,
      },
      categorias: {
        select: { categoria: { select: { nombre: true } } },
      },
    },
    orderBy: { promedioCalificacion: 'desc' },
    take: limite,
  });

  return productos.map(p => ({
    ...p,
    imagen_principal: p.imagenes[0]?.url ?? null,
    categorias:       p.categorias.map(c => c.categoria.nombre),
    imagenes:         undefined,
  }));
}

export async function obtenerDetalleProducto({ producto_id }) {
  const producto = await prisma.producto.findUnique({
    where: { id: producto_id },
    select: {
      id:                   true,
      titulo:               true,
      descripcion:          true,
      precio:               true,
      stock:                true,
      condicion:            true,
      promedioCalificacion: true,
      totalResenas:         true,
      etiquetas:            true,
      creadoEn:             true,
      vendedor: {
        select: {
          nombres:              true,
          apellidos:            true,
          esVendedorVerificado: true,
          perfil: {
            select: { ciudad: true, pais: true },
          },
        },
      },
      imagenes: {
        select:  { url: true, esPrincipal: true },
        orderBy: { orden: 'asc' },
      },
      categorias: {
        select: { categoria: { select: { nombre: true } } },
      },
      resenas: {
        select:  { calificacion: true, comentario: true, sentimiento: true },
        orderBy: { creadoEn: 'desc' },
        take:    3,
      },
    },
  });

  if (!producto) return null;

  return {
    ...producto,
    categorias: producto.categorias.map(c => c.categoria.nombre),
  };
}

export async function obtenerProductosSimilares({ producto_id, limite = 3 }) {
  // Primero obtenemos las categorías del producto de referencia
  const referencia = await prisma.producto.findUnique({
    where:  { id: producto_id },
    select: {
      precio:     true,
      categorias: { select: { categoriaId: true } },
    },
  });

  if (!referencia) return [];

  const categoriasIds = referencia.categorias.map(c => c.categoriaId);

  return prisma.producto.findMany({
    where: {
      estaActivo: true,
      stock:      { gt: 0 },
      id:         { not: producto_id },
      categorias: { some: { categoriaId: { in: categoriasIds } } },
    },
    select: {
      id:                   true,
      titulo:               true,
      precio:               true,
      condicion:            true,
      promedioCalificacion: true,
      imagenes: {
        where:  { esPrincipal: true },
        select: { url: true },
        take:   1,
      },
    },
    orderBy: { promedioCalificacion: 'desc' },
    take:    limite,
  });
}

// ─── QUERIES VENDEDOR ────────────────────────────────────────────────────────

export async function obtenerMisProductos({ usuario_id }) {
  const productos = await prisma.producto.findMany({
    where: { vendedorId: usuario_id },
    select: {
      id:                   true,
      titulo:               true,
      precio:               true,
      stock:                true,
      estaActivo:           true,
      condicion:            true,
      promedioCalificacion: true,
      totalResenas:         true,
      creadoEn:             true,
      categorias: {
        select: { categoria: { select: { nombre: true } } },
      },
      detallesPedido: {
        where: {
          pedido: { estado: { not: 'CANCELADO' } },
        },
        select: { subtotal: true },
      },
    },
    orderBy: { creadoEn: 'desc' },
  });

  return productos.map(p => ({
    id:                   p.id,
    titulo:               p.titulo,
    precio:               p.precio,
    stock:                p.stock,
    estaActivo:           p.estaActivo,
    condicion:            p.condicion,
    promedioCalificacion: p.promedioCalificacion,
    totalResenas:         p.totalResenas,
    creadoEn:             p.creadoEn,
    categorias:           p.categorias.map(c => c.categoria.nombre),
    total_ventas:         p.detallesPedido.length,
    ingresos_totales:     p.detallesPedido.reduce((acc, d) => acc + Number(d.subtotal), 0),
  }));
}

export async function obtenerEstadisticasVendedor({ usuario_id }) {
  const hace30dias = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [productos, pedidosRecientes, pedidosTotales] = await Promise.all([
    prisma.producto.findMany({
      where:  { vendedorId: usuario_id },
      select: {
        estaActivo:           true,
        promedioCalificacion: true,
        detallesPedido: {
          where:  { pedido: { estado: { not: 'CANCELADO' } } },
          select: { subtotal: true },
        },
      },
    }),
    // Ingresos últimos 30 días
    prisma.detallePedido.findMany({
      where: {
        producto:  { vendedorId: usuario_id },
        pedido:    { estado: { not: 'CANCELADO' }, creadoEn: { gte: hace30dias } },
      },
      select: { subtotal: true },
    }),
    // Pedidos totales
    prisma.pedido.findMany({
      where: {
        estado:   { not: 'CANCELADO' },
        detalles: { some: { producto: { vendedorId: usuario_id } } },
      },
      select: { id: true },
    }),
  ]);

  const todosDetalles    = productos.flatMap(p => p.detallesPedido);
  const ingresos_totales = todosDetalles.reduce((acc, d) => acc + Number(d.subtotal), 0);
  const ingresos_30_dias = pedidosRecientes.reduce((acc, d) => acc + Number(d.subtotal), 0);
  const calificaciones   = productos
    .map(p => p.promedioCalificacion)
    .filter(c => c !== null && c > 0);

  return {
    total_productos:      productos.length,
    productos_activos:    productos.filter(p => p.estaActivo).length,
    total_pedidos:        pedidosTotales.length,
    total_items_vendidos: todosDetalles.length,
    ingresos_30_dias:     ingresos_30_dias.toFixed(2),
    ingresos_totales:     ingresos_totales.toFixed(2),
    ticket_promedio:      todosDetalles.length > 0
      ? (ingresos_totales / todosDetalles.length).toFixed(2)
      : '0.00',
    calificacion_promedio: calificaciones.length > 0
      ? (calificaciones.reduce((a, b) => a + b, 0) / calificaciones.length).toFixed(2)
      : '0.00',
  };
}

export async function analizarCompetencia({ categoria, precio_referencia = null }) {
  const productos = await prisma.producto.findMany({
    where: {
      estaActivo: true,
      precio:     { gt: 0 },
      categorias: {
        some: {
          categoria: { nombre: { contains: categoria, mode: 'insensitive' } },
        },
      },
    },
    select: {
      titulo:               true,
      precio:               true,
      promedioCalificacion: true,
      totalResenas:         true,
    },
    orderBy: { promedioCalificacion: 'desc' },
  });

  if (productos.length === 0) {
    return { mensaje: `No se encontraron productos en la categoría "${categoria}"` };
  }

  const precios  = productos.map(p => Number(p.precio)).sort((a, b) => a - b);
  const promedio = precios.reduce((a, b) => a + b, 0) / precios.length;
  const mediana  = precios[Math.floor(precios.length / 2)];

  return {
    resumen: {
      precio_minimo:      precios[0].toFixed(2),
      precio_maximo:      precios[precios.length - 1].toFixed(2),
      precio_promedio:    promedio.toFixed(2),
      precio_mediana:     mediana.toFixed(2),
      total_productos:    productos.length,
    },
    mas_destacados: productos.slice(0, 5).map(p => ({
      titulo:               p.titulo,
      precio:               Number(p.precio).toFixed(2),
      promedioCalificacion: p.promedioCalificacion,
      totalResenas:         p.totalResenas,
    })),
    diferencia_vs_promedio: precio_referencia !== null
      ? (Number(precio_referencia) - promedio).toFixed(2)
      : null,
  };
}

export async function sugerirPrecio({ categoria, condicion = null }) {
  const vendidos = await prisma.producto.findMany({
    where: {
      estaActivo: true,
      ...(condicion && { condicion: condicion.toUpperCase() }),
      categorias: {
        some: {
          categoria: { nombre: { contains: categoria, mode: 'insensitive' } },
        },
      },
      detallesPedido: {
        some: { pedido: { estado: 'ENTREGADO' } },
      },
    },
    select: { precio: true },
  });

  if (vendidos.length === 0) {
    return { mensaje: `Sin datos de ventas para "${categoria}"${condicion ? ` en condición ${condicion}` : ''}. Intenta sin filtro de condición.` };
  }

  const precios = vendidos.map(p => Number(p.precio)).sort((a, b) => a - b);
  const promedio = precios.reduce((a, b) => a + b, 0) / precios.length;
  const p25 = precios[Math.floor(precios.length * 0.25)];
  const p75 = precios[Math.floor(precios.length * 0.75)];

  return {
    precio_promedio: promedio.toFixed(2),
    precio_minimo:   precios[0].toFixed(2),
    precio_maximo:   precios[precios.length - 1].toFixed(2),
    rango_sugerido:  `$${p25?.toFixed(2)} – $${p75?.toFixed(2)}`,
    muestra:         precios.length,
  };
}

// ─── REGISTRO DE INTERACCIONES IA ────────────────────────────────────────────

export async function registrarInteraccion({ usuario_id, canal, consulta, respuesta, tokens }) {
  try {
    await prisma.interaccionIA.create({
      data: {
        usuarioId:        usuario_id ?? null,
        canal:            canal,
        consulta:         consulta,
        respuesta:        respuesta ?? null,
        tokensConsumidos: tokens ?? null,
      },
    });
  } catch (err) {
    console.warn('No se pudo registrar interacción IA:', err.message);
  }
}