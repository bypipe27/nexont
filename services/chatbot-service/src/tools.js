export const TOOLS_COMPRADOR = [
  {
    name: 'buscar_productos',
    description: 'Busca productos en el marketplace por texto, categoría y rango de precio. Úsala siempre que el usuario quiera encontrar algo.',
    input_schema: {
      type: 'object',
      properties: {
        categoria:  { type: 'string',  description: 'Categoría del producto (electrónica, ropa, hogar, etc.)' },
        condicion:  { type: 'string',  description: 'Condición del producto (nuevo, usado, reacondicionado)' },
        precio_max: { type: 'number',  description: 'Precio máximo en pesos' },
        precio_min: { type: 'number',  description: 'Precio mínimo en pesos' },
        limite:     { type: 'integer', description: 'Cuántos resultados traer (máximo 5)', default: 3 },
      },
    },
  },
  {
    name: 'obtener_detalle_producto',
    description: 'Obtiene todos los detalles de un producto específico, incluyendo info del vendedor.',
    input_schema: {
      type: 'object',
      properties: {
        producto_id: { type: 'integer', description: 'ID del producto' },
      },
      required: ['producto_id'],
    },
  },
  {
    name: 'obtener_productos_similares',
    description: 'Busca productos similares al indicado, de la misma categoría y precio parecido.',
    input_schema: {
      type: 'object',
      properties: {
        producto_id: { type: 'integer', description: 'ID del producto de referencia' },
        limite:      { type: 'integer', description: 'Cuántos similares mostrar', default: 3 },
      },
      required: ['producto_id'],
    },
  },
];

export const TOOLS_VENDEDOR = [
  ...TOOLS_COMPRADOR,
  {
    name: 'obtener_mis_productos',
    description: 'Lista todos los productos del vendedor con sus estadísticas de ventas y vistas.',
    input_schema: {
      type: 'object',
      properties: {
        usuario_id: { type: 'integer', description: 'ID del vendedor' },
      },
      required: ['usuario_id'],
    },
  },
  {
    name: 'obtener_estadisticas_vendedor',
    description: 'Obtiene el resumen de ventas, ingresos y rendimiento del vendedor en los últimos 30 días.',
    input_schema: {
      type: 'object',
      properties: {
        usuario_id: { type: 'integer', description: 'ID del vendedor' },
      },
      required: ['usuario_id'],
    },
  },
  {
    name: 'analizar_competencia',
    description: 'Analiza los precios de la competencia en una categoría. Muy útil para decidir a qué precio publicar.',
    input_schema: {
      type: 'object',
      properties: {
        categoria:         { type: 'string', description: 'Categoría a analizar' },
        precio_referencia: { type: 'number', description: 'Precio actual del vendedor para comparar (opcional)' },
      },
      required: ['categoria'],
    },
  },
  {
    name: 'sugerir_precio',
    description: 'Sugiere un rango de precio óptimo basado en productos similares que sí se han vendido.',
    input_schema: {
      type: 'object',
      properties: {
        categoria: { type: 'string', description: 'Categoría del producto' },
        condicion: { type: 'string', description: 'Condición: nuevo, usado, reacondicionado' },
      },
      required: ['categoria'],
    },
  },
];