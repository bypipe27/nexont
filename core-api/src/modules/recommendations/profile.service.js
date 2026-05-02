const prisma = require('../../config/database');

const mergePreferences = (current = {}, patch = {}) => {
  const hasAnswersPatch = Object.prototype.hasOwnProperty.call(patch.survey || {}, 'answers');
  const incomingAnswers = patch.survey?.answers;
  const shouldResetAnswers =
    hasAnswersPatch &&
    incomingAnswers &&
    typeof incomingAnswers === 'object' &&
    !Array.isArray(incomingAnswers) &&
    Object.keys(incomingAnswers).length === 0;

  return {
    ...current,
    ...patch,
    survey: {
      ...current.survey,
      ...patch.survey,
      answers: shouldResetAnswers
        ? {}
        : {
          ...current.survey?.answers,
          ...patch.survey?.answers,
        },
    },
    recommendation: {
      ...current.recommendation,
      ...patch.recommendation,
    },
  };
};

const getOrCreateProfile = async (usuarioId) => {
  return prisma.perfilUsuario.upsert({
    where: { usuarioId },
    update: {},
    create: {
      usuarioId,
      preferencias: {},
    },
  });
};

const getPreferences = async (usuarioId) => {
  const profile = await getOrCreateProfile(usuarioId);
  return profile.preferencias || {};
};

const updatePreferences = async (usuarioId, patch) => {
  const profile = await getOrCreateProfile(usuarioId);
  const merged = mergePreferences(profile.preferencias || {}, patch);
  const updated = await prisma.perfilUsuario.update({
    where: { usuarioId },
    data: { preferencias: merged },
  });
  return updated.preferencias || {};
};

module.exports = {
  getOrCreateProfile,
  getPreferences,
  updatePreferences,
  mergePreferences,
};
