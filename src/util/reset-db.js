const mysql = require('mysql2/promise');
const config = require('./config');
const logger = require('./logger');

async function resetDatabase() {
    const connection = await mysql.createConnection({
        host: config.dbHost,
        user: config.dbUser,
        password: config.dbPassword,
        database: config.dbDatabase,
        port: config.dbPort
    });

    try {
        await connection.beginTransaction();

        // Disable foreign key checks
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');

        // Truncate the tables
        await connection.query('TRUNCATE TABLE meals');
        await connection.query('TRUNCATE TABLE users');

        // Re-enable foreign key checks
        await connection.query('SET FOREIGN_KEY_CHECKS = 1');

        // Insert the admin account details
        const adminEmail = 'tmh.vandevelde@student.avans.nl';
        const adminPassword = '$2b$10$Or1NY6Jz7mC9XPzORshlsuHDuVHpu78GafUBRlEm3zr1dsb/TNOly'; // Hashed password
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

        // Insert a dummy user account
        const dummyEmail = 'name@email.com';
        const dummyPassword = '$2b$10$Or1NY6Jz7mC9XPzORshlsuHDuVHpu78GafUBRlEm3zr1dsb/TNOly'; // Hashed password
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

        await connection.commit();
        logger.info('Database reset successfully');
    } catch (err) {
        await connection.rollback();
        logger.error('Error resetting database:', err);
        throw err;
    } finally {
        await connection.end();
    }
}

module.exports = { resetDatabase };