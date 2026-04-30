const { SURVEY_QUESTIONS, BUDGET_RANGES } = require('./recommendation.constants');
const { normalizeCategory } = require('../../shared/utils/category.utils');
const profileService = require('./profile.service');

const buildSurveyState = (answers = {}) => {
  const answeredCount = SURVEY_QUESTIONS.filter((q) => answers[q.id]).length;
  const nextQuestion = SURVEY_QUESTIONS.find((q) => !answers[q.id]) || null;
  return {
    done: !nextQuestion,
    question: nextQuestion,
    progress: { current: answeredCount, total: SURVEY_QUESTIONS.length },
  };
};

const answersEqual = (a = {}, b = {}) => {
  for (const q of SURVEY_QUESTIONS) {
    if ((a[q.id] || null) !== (b[q.id] || null)) return false;
  }
  return true;
};

/** Valida y normaliza respuestas completas; lanza si falta algo. */
const parseCompleteSurveyAnswers = (answers = {}) => {
  if (!answers || typeof answers !== 'object' || Array.isArray(answers)) {
    throw new Error('answers debe ser un objeto con las respuestas de la encuesta');
  }
  const normalizedAnswers = {};
  for (const question of SURVEY_QUESTIONS) {
    const answer = answers[question.id];
    if (!answer) {
      throw new Error(`Falta respuesta para: ${question.id}`);
    }
    const validOption = question.options?.some((option) => option.value === answer);
    if (!validOption) {
      throw new Error(`Respuesta inválida para: ${question.id}`);
    }
    normalizedAnswers[question.id] = answer;
  }
  return normalizedAnswers;
};

const deriveRecommendationPrefs = (answers = {}) => {
  const categoria = normalizeCategory(answers.categoria || null);
  const presupuesto = answers.presupuesto || null;
  const condicionPreferida = answers.condicionPreferida || null;

  const priceRange = presupuesto ? BUDGET_RANGES[presupuesto] : null;

  return {
    categoria,
    condicionPreferida,
    priceRange,
  };
};

const getSurveyState = async (usuarioId) => {
  const preferences = await profileService.getPreferences(usuarioId);
  const answers = preferences.survey?.answers || {};
  return { ...buildSurveyState(answers), answers };
};

const getSurveySetup = async (usuarioId) => {
  const state = await getSurveyState(usuarioId);
  return {
    questions: SURVEY_QUESTIONS,
    ...state,
  };
};

const resetSurvey = async (usuarioId) => {
  const prefs = await profileService.updatePreferences(usuarioId, {
    survey: { answers: {}, recommendationCache: null },
  });

  return buildSurveyState(prefs.survey?.answers || {});
};

const submitSurveyComplete = async ({ usuarioId, answers = {} }) => {
  const normalizedAnswers = parseCompleteSurveyAnswers(answers);

  const derived = deriveRecommendationPrefs(normalizedAnswers);
  const updatedPrefs = await profileService.updatePreferences(usuarioId, {
    survey: {
      answers: normalizedAnswers,
    },
    recommendation: {
      categoria: derived.categoria,
      condicionPreferida: derived.condicionPreferida,
      priceRange: derived.priceRange,
    },
  });
  return buildSurveyState(updatedPrefs.survey?.answers || {});
};

module.exports = {
  getSurveyState,
  getSurveySetup,
  submitSurveyComplete,
  resetSurvey,
  deriveRecommendationPrefs,
  parseCompleteSurveyAnswers,
  answersEqual,
  buildSurveyState,
};
