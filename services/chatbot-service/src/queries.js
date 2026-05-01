import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CATEGORY_OPTIONS = [
  { value: 'ELECTRONICA_TECNOLOGIA', label: 'Electrónica y Tecnología' },
  { value: 'HOGAR_DECORACION', label: 'Hogar y Decoración' },
  { value: 'MODA_ACCESORIOS', label: 'Moda y Accesorios' },
  { value: 'SALUD_BELLEZA', label: 'Salud y Belleza' },
  { value: 'DEPORTES_FITNESS', label: 'Deportes y Fitness' },
  { value: 'JUGUETES_BEBES', label: 'Juguetes y Bebés' },
  { value: 'AUTOMOTRIZ', label: 'Automotriz' },
  { value: 'LIBROS_MUSICA_ENTRETENIMIENTO', label: 'Libros, Música y Entretenimiento' },
  { value: 'ALIMENTOS_BEBIDAS', label: 'Alimentos y Bebidas' },
  { value: 'SERVICIOS_OTROS', label: 'Servicios y Otros' },
];

const categoryEnumValues = new Set(CATEGORY_OPTIONS.map(option => option.value));

const categoryMap = {
  'electronica y tecnologia': 'ELECTRONICA_TECNOLOGIA',
  'electronica tecnologia': 'ELECTRONICA_TECNOLOGIA',
  'electronica': 'ELECTRONICA_TECNOLOGIA',
  'tecnologia': 'ELECTRONICA_TECNOLOGIA',
  'hogar y decoracion': 'HOGAR_DECORACION',
  'hogar decoracion': 'HOGAR_DECORACION',
  'hogar': 'HOGAR_DECORACION',
  'decoracion': 'HOGAR_DECORACION',
  'moda y accesorios': 'MODA_ACCESORIOS',
  'moda accesorios': 'MODA_ACCESORIOS',
  'moda': 'MODA_ACCESORIOS',
  'accesorios': 'MODA_ACCESORIOS',
  'salud y belleza': 'SALUD_BELLEZA',
  'salud belleza': 'SALUD_BELLEZA',
  'salud': 'SALUD_BELLEZA',
  'belleza': 'SALUD_BELLEZA',
  'deportes y fitness': 'DEPORTES_FITNESS',
  'deportes fitness': 'DEPORTES_FITNESS',
  'deportes': 'DEPORTES_FITNESS',
  'fitness': 'DEPORTES_FITNESS',
  'juguetes y bebes': 'JUGUETES_BEBES',
  'juguetes bebes': 'JUGUETES_BEBES',
  'juguetes': 'JUGUETES_BEBES',
  'bebes': 'JUGUETES_BEBES',
  'automotriz': 'AUTOMOTRIZ',
  'libros musica y entretenimiento': 'LIBROS_MUSICA_ENTRETENIMIENTO',
  'libros musica entretenimiento': 'LIBROS_MUSICA_ENTRETENIMIENTO',
  'libros': 'LIBROS_MUSICA_ENTRETENIMIENTO',
  'musica': 'LIBROS_MUSICA_ENTRETENIMIENTO',
  'entretenimiento': 'LIBROS_MUSICA_ENTRETENIMIENTO',
  'alimentos y bebidas': 'ALIMENTOS_BEBIDAS',
  'alimentos bebidas': 'ALIMENTOS_BEBIDAS',
  'alimentos': 'ALIMENTOS_BEBIDAS',
  'bebidas': 'ALIMENTOS_BEBIDAS',
  'servicios y otros': 'SERVICIOS_OTROS',
  'servicios otros': 'SERVICIOS_OTROS',
  'servicios': 'SERVICIOS_OTROS',
  'otros': 'SERVICIOS_OTROS',
};

const normalizeCategoryKey = (value = '') => String(value)
  .trim()
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9\s]/g, '')
  .replace(/\s+/g, ' ')
  .trim();

const normalizeCategory = (value) => {
  if (!value) return null;
  const upper = String(value).trim().toUpperCase();
  if (categoryEnumValues.has(upper)) return upper;
  const normalized = normalizeCategoryKey(value).replace(/_/g, ' ');
  return categoryMap[normalized] || null;
};

const formatCategoryLabel = (value) => {
  return CATEGORY_OPTIONS.find(option => option.value === value)?.label || 'Servicios y Otros';
};

// ─── QUERIES COMPRADOR ───────────────────────────────────────────────────────

export async function buscarProductos({ categoria = null, precio_max = null, precio_min = null, condicion = null, limite = 3 }) {
  const categoriaNormalizada = normalizeCategory(categoria);
  const precioMin = Number(precio_min);
  const precioMax = Number(precio_max);
  const hasPrecioMin = Number.isFinite(precioMin);
  const hasPrecioMax = Number.isFinite(precioMax);
  const condicionUpper = condicion ? String(condicion).toUpperCase() : null;
  const validConditions = new Set(['NUEVO', 'USADO', 'REACONDICIONADO']);

  if (categoria && !categoriaNormalizada) return [];
  if (condicionUpper && !validConditions.has(condicionUpper)) return [];
  if (hasPrecioMin && hasPrecioMax && precioMin > precioMax) return [];

  const select = {
    id:                 true,
    titulo:             true,
    descripcion:        true,
    precio:             true,
    stock:              true,
    condicion:          true,
    categoria:          true,
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
  };

  const productos = await prisma.producto.findMany({
    where: {
      estaActivo: true,
      stock:      { gt: 0 },
      ...(hasPrecioMax && { precio: { lte: precioMax } }),
      ...(hasPrecioMin && { precio: { gte: precioMin } }),
      ...(condicionUpper && { condicion: condicionUpper }),
      ...(categoriaNormalizada && { categoria: categoriaNormalizada }),
    },
    select,
    orderBy: { promedioCalificacion: 'desc' },
    take: limite,
  });

  return productos.map(p => ({
    ...p,
    imagen_principal: p.imagenes[0]?.url ?? null,
    categorias:       [formatCategoryLabel(p.categoria)],
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
      categoria:            true,
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
    categorias: [formatCategoryLabel(producto.categoria)],
  };
}

export async function obtenerProductosSimilares({ producto_id, limite = 3 }) {
  // Primero obtenemos las categorías del producto de referencia
  const referencia = await prisma.producto.findUnique({
    where:  { id: producto_id },
    select: {
      precio:     true,
      categoria:  true,
    },
  });

  if (!referencia?.categoria) return [];

  return prisma.producto.findMany({
    where: {
      estaActivo: true,
      stock:      { gt: 0 },
      id:         { not: producto_id },
      categoria:  referencia.categoria,
    },
    select: {
      id:                   true,
      titulo:               true,
      precio:               true,
      condicion:            true,
      categoria:            true,
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
      categoria:            true,
      promedioCalificacion: true,
      totalResenas:         true,
      creadoEn:             true,
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
    categoria:            p.categoria,
    promedioCalificacion: p.promedioCalificacion,
    totalResenas:         p.totalResenas,
    creadoEn:             p.creadoEn,
    categorias:           [formatCategoryLabel(p.categoria)],
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
  const categoriaNormalizada = normalizeCategory(categoria);
  const productos = await prisma.producto.findMany({
    where: {
      estaActivo: true,
      precio:     { gt: 0 },
      ...(categoriaNormalizada && { categoria: categoriaNormalizada }),
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

const quantile = (values, q) => {
  if (!values.length) return null;
  const pos = (values.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  const next = values[base + 1];
  return next !== undefined ? values[base] + rest * (next - values[base]) : values[base];
};

export async function sugerirPrecio({ categoria, condicion = null }) {
  const categoriaNormalizada = normalizeCategory(categoria);
  const vendidos = await prisma.producto.findMany({
    where: {
      estaActivo: true,
      ...(condicion && { condicion: condicion.toUpperCase() }),
      ...(categoriaNormalizada && { categoria: categoriaNormalizada }),
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
  const min = precios[0];
  const max = precios[precios.length - 1];
  const p25 = quantile(precios, 0.25);
  const p50 = quantile(precios, 0.5);
  const p75 = quantile(precios, 0.75);

  let precio_bajo = p25 ?? min;
  let precio_promedio = promedio;
  let precio_alto = p75 ?? max;

  if (!(precio_bajo < precio_promedio && precio_promedio < precio_alto)) {
    precio_bajo = Math.min(min, (p50 ?? promedio) * 0.95);
    precio_promedio = p50 ?? promedio;
    precio_alto = Math.max(max, (p50 ?? promedio) * 1.05);
  }

  if (!(precio_bajo < precio_promedio)) {
    precio_bajo = Math.max(min, precio_promedio * 0.9);
  }
  if (!(precio_promedio < precio_alto)) {
    precio_alto = Math.max(max, precio_promedio * 1.1);
  }

  return {
    precio_bajo:      precio_bajo.toFixed(2),
    precio_promedio:  precio_promedio.toFixed(2),
    precio_alto:      precio_alto.toFixed(2),
    precio_minimo:    min.toFixed(2),
    precio_maximo:    max.toFixed(2),
    precio_mediana:   (p50 ?? promedio).toFixed(2),
    rango_sugerido:   `$${(p25 ?? min).toFixed(2)} – $${(p75 ?? max).toFixed(2)}`,
    muestra:          precios.length,
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