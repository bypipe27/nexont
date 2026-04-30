const router = require('express').Router();
const recommendationsController = require('./recommendations.controller');

// GET /api/v1/recommendations
router.get('/', recommendationsController.getRecommendations);

// GET /api/v1/recommendations/survey/setup
router.get('/survey/setup', recommendationsController.getSurveySetup);

// POST /api/v1/recommendations/survey/complete
router.post('/survey/complete', recommendationsController.submitSurveyComplete);

// POST /api/v1/recommendations/survey/reset
router.post('/survey/reset', recommendationsController.resetSurvey);

module.exports = router;
