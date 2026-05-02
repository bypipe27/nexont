const { CATEGORY_OPTIONS } = require('../../shared/utils/category.utils');

const BUDGET_RANGES = {
  '0-100': { min: 0, max: 100 },
  '100-300': { min: 100, max: 300 },
  '300-700': { min: 300, max: 700 },
  '700+': { min: 700, max: null },
};

const SURVEY_QUESTIONS = [
  {
    id: 'categoria',
    title: '¿Qué categoria te interesa más?',
    type: 'single',
    options: CATEGORY_OPTIONS,
  },
  {
    id: 'condicionPreferida',
    title: '¿Que condicion prefieres?',
    type: 'single',
    options: [
      { value: 'NUEVO', label: 'Nuevo' },
      { value: 'USADO', label: 'Usado' },
      { value: 'REACONDICIONADO', label: 'Reacondicionado' },
      { value: 'CUALQUIERA', label: 'Cualquiera' },
    ],
  },
  {
    id: 'presupuesto',
    title: '¿Cual es tu presupuesto aproximado?',
    type: 'single',
    options: [
      { value: '0-100', label: '$0 - $100' },
      { value: '100-300', label: '$100 - $300' },
      { value: '300-700', label: '$300 - $700' },
      { value: '700+', label: '$700+' },
    ],
  },
  {
    id: 'prioridad',
    title: 'Si debes priorizar, ¿que prefieres?',
    type: 'single',
    options: [
      { value: 'ahorro', label: 'Menor precio' },
      { value: 'calidad', label: 'Mayor calidad' },
      { value: 'disponibilidad', label: 'Mayor disponibilidad' },
      { value: 'novedad', label: 'Publicaciones mas recientes' },
    ],
  },
];

module.exports = {
  BUDGET_RANGES,
  SURVEY_QUESTIONS,
};
