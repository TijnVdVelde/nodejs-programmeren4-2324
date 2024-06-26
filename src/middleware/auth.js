const jwt = require('jsonwebtoken');
const config = require('../util/config');
const logger = require('../util/logger');

// Middleware functie om het JWT te verifiëren.
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization']; // Haal de authorization header op.
    const token = authHeader && authHeader.split(' ')[1]; // Splits de header om het token te verkrijgen.

    // Controleer of er geen token is verstrekt.
    if (!token) {
        logger.warn('No token provided'); // Log een waarschuwing dat er geen token is verstrekt.
        return res.status(401).json({ status: 401, message: 'Unauthorized' }); // Stuur een 401 Unauthorized respons terug.
    }

    logger.info(`Token provided: ${token}`); // Log het verstrekte token.
    
    // Verifieer het token met behulp van de geheime sleutel uit de configuratie.
    jwt.verify(token, config.secretkey, (err, user) => {
        // Controleer of het token ongeldig is.
        if (err) {
            logger.warn(`Invalid token: ${token}`); // Log een waarschuwing dat het token ongeldig is.
            return res.status(403).json({ status: 403, message: 'Forbidden' }); // Stuur een 403 Forbidden respons terug.
        }

        logger.info(`User authenticated: ${user.id}`);
        req.userId = user.id; // Sla de gebruiker-ID op in het request object.
        next(); // Ga door naar de volgende middleware of route handler.
    });
};

module.exports = { authenticateToken };