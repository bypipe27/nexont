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

const CATEGORY_ENUM_VALUES = CATEGORY_OPTIONS.map(option => option.value);
const CATEGORY_ENUM_SET = new Set(CATEGORY_ENUM_VALUES);

const CATEGORY_MAP = {
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
  if (CATEGORY_ENUM_SET.has(upper)) return upper;
  const normalized = normalizeCategoryKey(value).replace(/_/g, ' ');
  return CATEGORY_MAP[normalized] || null;
};

const getCategoryLabel = (value) => {
  return CATEGORY_OPTIONS.find(option => option.value === value)?.label || 'Servicios y Otros';
};

module.exports = {
  CATEGORY_OPTIONS,
  CATEGORY_ENUM_VALUES,
  normalizeCategory,
  getCategoryLabel,
};
