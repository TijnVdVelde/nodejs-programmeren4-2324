const mysql = require('mysql2/promise');
const config = require('../util/config');
const logger = require('../util/logger');

// Maak een verbindingspool aan met de opgegeven configuratie-instellingen.
const pool = mysql.createPool({
    host: config.dbHost,
    user: config.dbUser, 
    password: config.dbPassword, 
    port: config.dbPort,
    database: config.dbDatabase,
    waitForConnections: true, // Wacht op beschikbare verbindingen wanneer de limiet is bereikt.
    connectionLimit: 10, // Het maximale aantal verbindingen in de pool.
    queueLimit: 0 // De maximale lengte van de wachtrij voor verbindingen. 0 betekent onbeperkt.
});

// Probeer een verbinding te krijgen uit de pool om te controleren of de databaseverbinding succesvol is.
pool.getConnection()
    .then(connection => {
        logger.info('Connected to the MySQL database.'); // Log een bericht als de verbinding succesvol is.
        connection.release(); // Laat de verbinding vrij om terug te keren naar de pool.
    })
    .catch(err => {
        logger.error('Error connecting to the MySQL database:', err.message); // Log een foutbericht als de verbinding mislukt.
    });

module.exports = pool;