const express = require('express'); // Importeer de express module om een router te maken.
const router = express.Router(); // Maak een nieuwe router instantie.
const mealController = require('../controllers/meal.controller'); // Importeer de mealController met alle meal gerelateerde functies.
const { authenticateToken } = require('../middleware/auth'); // Importeer de authenticateToken middleware voor het verifiëren van JWT's.

// Route voor het aanmaken van een nieuwe maaltijd. Vereist authenticatie.
router.post('/api/meal', authenticateToken, mealController.create);

// Route voor het ophalen van alle maaltijden. Publieke toegang.
router.get('/api/meal', mealController.getAll);

// Route voor het ophalen van een maaltijd op basis van ID. Publieke toegang.
router.get('/api/meal/:mealId', mealController.getById);

// Route voor het bijwerken van een maaltijd op basis van ID. Vereist authenticatie.
router.put('/api/meal/:mealId', authenticateToken, mealController.update);

// Route voor het verwijderen van een maaltijd op basis van ID. Vereist authenticatie.
router.delete('/api/meal/:mealId', authenticateToken, mealController.delete);

module.exports = router; // Exporteer de router zodat deze gebruikt kan worden in de hoofdapplicatie.