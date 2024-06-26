const mysql = require('mysql2/promise'); // Importeer de mysql2/promise module om gebruik te maken van MySQL met async/await.
const config = require('./config'); // Importeer de configuratie-instellingen.
const logger = require('./logger'); // Importeer de logger module voor het loggen van informatie en fouten.

async function resetDatabase() {
    // Maak een verbinding met de database met behulp van de configuratie-instellingen.
    const connection = await mysql.createConnection({
        host: config.dbHost,
        user: config.dbUser,
        password: config.dbPassword,
        database: config.dbDatabase,
        port: config.dbPort
    });

    try {
        await connection.beginTransaction(); // Begin een nieuwe transactie.

        // Schakel de controle op buitenlandse sleutels uit.
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');

        // Leeg de tabellen door ze te trunceren.
        await connection.query('TRUNCATE TABLE meals');
        await connection.query('TRUNCATE TABLE users');

        // Schakel de controle op buitenlandse sleutels weer in.
        await connection.query('SET FOREIGN_KEY_CHECKS = 1');

        // Voeg de admin account gegevens in.
        const adminEmail = 'tmh.vandevelde@student.avans.nl';
        const adminPassword = '$2b$10$Or1NY6Jz7mC9XPzORshlsuHDuVHpu78GafUBRlEm3zr1dsb/TNOly'; // Gehashed wachtwoord
        const adminDetails = {
            firstName: 'Tijn',
            lastName: 'Van de Velde',
            street: 'Lovensdijkstraat 61',
            city: 'Breda',
            isActive: 1,
            phoneNumber: '06 12312345',
            token: null
        };

        await connection.query(
            `INSERT INTO users (firstName, lastName, street, city, isActive, emailAdress, password, phoneNumber, token) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [adminDetails.firstName, adminDetails.lastName, adminDetails.street, adminDetails.city, adminDetails.isActive, adminEmail, adminPassword, adminDetails.phoneNumber, adminDetails.token]
        );

        // Voeg een dummy gebruiker account in.
        const dummyEmail = 'name@email.com';
        const dummyPassword = '$2b$10$Or1NY6Jz7mC9XPzORshlsuHDuVHpu78GafUBRlEm3zr1dsb/TNOly'; // Gehashed wachtwoord
        const dummyDetails = {
            firstName: 'Voornaam',
            lastName: 'Achternaam',
            street: 'Straat 123',
            city: 'Stad',
            isActive: 1,
            phoneNumber: '0000000000',
            token: null
        };

        await connection.query(
            `INSERT INTO users (firstName, lastName, street, city, isActive, emailAdress, password, phoneNumber, token) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [dummyDetails.firstName, dummyDetails.lastName, dummyDetails.street, dummyDetails.city, dummyDetails.isActive, dummyEmail, dummyPassword, dummyDetails.phoneNumber, dummyDetails.token]
        );

        // Voeg een maaltijd in.
        const mealDetails = {
            name: 'Sushi Platter',
            description: 'A delicious assortment of fresh sushi',
            isActive: true,
            isVega: false,
            isVegan: false,
            isToTakeHome: true,
            dateTime: '2024-06-01T18:00:00',
            imageUrl: 'https://example.com/sushi.jpg',
            allergens: JSON.stringify(['fish', 'soy']),
            maxAmountOfParticipants: 15,
            price: 25.0,
            userId: 1 // Veronderstel dat de dummy gebruiker id 1 is.
        };

        await connection.query(
            `INSERT INTO meals (name, description, isActive, isVega, isVegan, isToTakeHome, dateTime, imageUrl, allergens, maxParticipants, price, userId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [mealDetails.name, mealDetails.description, mealDetails.isActive, mealDetails.isVega, mealDetails.isVegan, mealDetails.isToTakeHome, mealDetails.dateTime, mealDetails.imageUrl, mealDetails.allergens, mealDetails.maxAmountOfParticipants, mealDetails.price, mealDetails.userId]
        );

        await connection.commit(); // Commit de transactie.
        logger.info('Database reset successfully'); // Log een bericht dat de database succesvol is gereset.
    } catch (err) {
        await connection.rollback(); // Rol de transactie terug in geval van een fout.
        logger.error('Error resetting database:', err); // Log de fout.
        throw err; // Gooi de fout opnieuw op.
    } finally {
        await connection.end(); // Sluit de databaseverbinding.
    }
}

module.exports = { resetDatabase }; // Exporteer de resetDatabase functie zodat deze gebruikt kan worden in andere delen van de applicatie.