const recommendationsService = require('./recommendations.service');
const surveyService = require('./survey.service');
const profileService = require('./profile.service');

const getUserId = (req) => parseInt(req.user.userId, 10);

const getRecommendations = async (req, res) => {
  try {
    res.json({ recommendations: [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getSurveySetup = async (req, res) => {
  try {
    const usuarioId = getUserId(req);
    if (isNaN(usuarioId)) return res.status(401).json({ error: 'Usuario no válido en el token' });

    const state = await surveyService.getSurveySetup(usuarioId);
    // No llamar IA al abrir.
    res.json({ ...state, recommendations: [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const submitSurveyComplete = async (req, res) => {
  try {
    const usuarioId = getUserId(req);
    if (isNaN(usuarioId)) return res.status(401).json({ error: 'Usuario no válido en el token' });

    const { answers } = req.body || {};
    let normalized;
    try {
      normalized = surveyService.parseCompleteSurveyAnswers(answers);
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }

    const prefs = await profileService.getPreferences(usuarioId);
    const stored = prefs.survey?.answers || {};

    if (surveyService.answersEqual(stored, normalized)) {
      const state = surveyService.buildSurveyState(normalized);
      const recommendations = await recommendationsService.refreshSurveyRecommendationsFromAI({
        usuarioId,
        limit: 6,
      });
      return res.json({ ...state, answers: normalized, recommendations });
    }

    const state = await surveyService.submitSurveyComplete({ usuarioId, answers: normalized });
    const recommendations = state.done
      ? await recommendationsService.refreshSurveyRecommendationsFromAI({ usuarioId, limit: 6 })
      : [];
    res.json({ ...state, recommendations });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const resetSurvey = async (req, res) => {
  try {
    const usuarioId = getUserId(req);
    if (isNaN(usuarioId)) return res.status(401).json({ error: 'Usuario no válido en el token' });

    const state = await surveyService.resetSurvey(usuarioId);
    res.json(state);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getRecommendations,
  getSurveySetup,
  submitSurveyComplete,
  resetSurvey,
};
