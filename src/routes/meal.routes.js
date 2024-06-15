const express = require('express');
const router = express.Router();
const mealController = require('../controllers/meal.controller');
const { authenticateToken } = require('../middleware/auth');

router.post('/api/meal', authenticateToken, mealController.create);
router.get('/api/meal', mealController.getAll); // Public access to retrieve all meals
router.get('/api/meal/:mealId', mealController.getById); // Public access to retrieve meal by ID
router.put('/api/meal/:mealId', authenticateToken, mealController.update); // Route for updating a meal
router.delete('/api/meal/:mealId', authenticateToken, mealController.delete); // Route for deleting a meal

module.exports = router;