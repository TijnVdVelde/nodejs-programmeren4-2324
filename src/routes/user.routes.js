const express = require('express'); // Importeer de express module om een router te maken.
const router = express.Router(); // Maak een nieuwe router instantie.
const assert = require('assert'); // Importeer de assert module voor eenvoudige beweringen.
const chai = require('chai'); // Importeer de chai module voor uitgebreide asserties.
chai.should(); // Gebruik de should stijl van chai.
const userController = require('../controllers/user.controller'); // Importeer de userController met alle gebruikersgerelateerde functies.
const { authenticateToken } = require('../middleware/auth'); // Importeer de authenticateToken middleware voor het verifiëren van JWT's.

// Validatiemiddleware voor het aanmaken van een gebruiker
const validateUserCreateChaiExpect = (req, res, next) => {
    try {
        assert(req.body.firstName, 'Missing required fields'); // Controleer of het veld firstName aanwezig is.
        chai.expect(req.body.firstName).to.not.be.empty; // Controleer of het veld firstName niet leeg is.
        chai.expect(req.body.firstName).to.be.a('string'); // Controleer of het veld firstName een string is.
        chai.expect(req.body.firstName).to.match(
            /^[a-zA-Z]+$/, // Controleer of het veld firstName alleen letters bevat.
            'firstName must be a string'
        );
        next(); // Ga door naar de volgende middleware of route handler.
    } catch (ex) {
        next({
            status: 400,
            message: ex.message,
            data: {}
        }); // Stuur een foutbericht terug als de validatie faalt.
    }
};

// Validatiemiddleware voor login
const validateLogin = (req, res, next) => {
    const { emailAdress, password } = req.body; // Haal de emailAdress en password velden op uit het request body.
    if (!emailAdress || !password) { // Controleer of de velden emailAdress en password aanwezig zijn.
        next({
            status: 400,
            message: 'Email and password are required',
            data: {}
        }); // Stuur een foutbericht terug als een van de velden ontbreekt.
    } else {
        next(); // Ga door naar de volgende middleware of route handler.
    }
};

// Routes
router.post('/api/login', validateLogin, userController.login); // Route voor het inloggen van een gebruiker.
router.post('/api/user', validateUserCreateChaiExpect, userController.create); // Route voor het aanmaken van een nieuwe gebruiker.
router.get('/api/user', authenticateToken, userController.getAll); // Route voor het ophalen van alle gebruikers. Vereist authenticatie.
router.get('/api/user/profile', authenticateToken, userController.getProfile); // Route voor het ophalen van het profiel van de ingelogde gebruiker. Vereist authenticatie.
router.get('/api/user/:userId', authenticateToken, userController.getById); // Route voor het ophalen van een gebruiker op basis van ID. Vereist authenticatie.
router.delete('/api/user/:userId', authenticateToken, userController.delete); // Route voor het verwijderen van een gebruiker op basis van ID. Vereist authenticatie.
router.put('/api/user/:userId', authenticateToken, validateUserCreateChaiExpect, userController.update); // Route voor het bijwerken van een gebruiker op basis van ID. Vereist authenticatie en validatie.

module.exports = router; // Exporteer de router zodat deze gebruikt kan worden in de hoofdapplicatie.