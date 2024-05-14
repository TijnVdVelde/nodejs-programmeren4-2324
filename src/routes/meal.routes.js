const express = require('express');
const router = express.Router();
const mealController = require('../controllers/meal.controller');
const { authenticateToken } = require('../middleware/auth');

router.post('/api/meal', authenticateToken, mealController.create);
router.get('/api/meal', mealController.getAll); // Public access to retrieve all meals
router.put('/api/meal/:mealId', authenticateToken, mealController.update); // Route for updating a meal

module.exports = router;
