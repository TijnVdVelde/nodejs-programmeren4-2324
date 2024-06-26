require('dotenv').config(); // Importeer de dotenv module en laad de environment variabelen uit een .env bestand.

const dbUrl = process.env.DATABASE_URL || 'mysql://root:password@localhost:3307/share_a_meal'; 
// Definieer de database-URL, gebruik de waarde uit de environment variabelen of een standaardwaarde als fallback.

const config = {
    secretkey: process.env.SECRETKEY || 'DitIsEenGeheim', // De geheime sleutel voor het signeren van JWT's, haal uit de environment variabelen of gebruik een standaardwaarde.
    dbHost: process.env.MYSQLHOST || 'localhost', // De hostnaam van de database, haal uit de environment variabelen of gebruik een standaardwaarde.
    dbUser: process.env.MYSQLUSER || 'root', // De gebruikersnaam voor de database, haal uit de environment variabelen of gebruik een standaardwaarde.
    dbPassword: process.env.MYSQLPASSWORD || '', // Het wachtwoord voor de databasegebruiker, haal uit de environment variabelen of gebruik een standaardwaarde.
    dbPort: process.env.MYSQLPORT || 3307, // De poort waarop de database draait, haal uit de environment variabelen of gebruik een standaardwaarde.
    dbDatabase: process.env.MYSQLDATABASE || 'share_a_meal' // De naam van de database, haal uit de environment variabelen of gebruik een standaardwaarde.
};

console.log('Database Config:', config); // Voeg deze regel toe om de configuratie-instellingen naar de console te printen.

module.exports = config; // Exporteer de configuratie-instellingen zodat deze gebruikt kunnen worden in andere delen van de applicatie.