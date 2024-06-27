const mysql = require('mysql2/promise') // Import mysql2/promise module to use MySQL with async/await.
const config = require('./config') // Import configuration settings.
const logger = require('./logger') // Import logger module for logging information and errors.

async function resetDatabase() {
    // Create a connection to the database using configuration settings.
    const connection = await mysql.createConnection({
        host: config.dbHost,
        user: config.dbUser,
        password: config.dbPassword,
        database: config.dbDatabase,
        port: config.dbPort
    })

    try {
        await connection.beginTransaction() // Begin a new transaction.

        // Disable foreign key checks.
        await connection.query('SET FOREIGN_KEY_CHECKS = 0')

        // Truncate the tables.
        await connection.query('TRUNCATE TABLE meal')
        await connection.query('TRUNCATE TABLE user')
        await connection.query('TRUNCATE TABLE meal_participants_user')

        // Re-enable foreign key checks.
        await connection.query('SET FOREIGN_KEY_CHECKS = 1')

        // Insert admin account details.
        const adminEmail = 'tmh.vandevelde@student.avans.nl'
        const adminPassword =
            '$2b$10$Or1NY6Jz7mC9XPzORshlsuHDuVHpu78GafUBRlEm3zr1dsb/TNOly' // Hashed password
        const adminDetails = {
            firstName: 'Tijn',
            lastName: 'Van de Velde',
            street: 'Lovensdijkstraat 61',
            city: 'Breda',
            isActive: 1,
            phoneNumber: '06 12312345',
            token: null
        }

        await connection.query(
            `INSERT INTO user (firstName, lastName, street, city, isActive, emailAdress, password, phoneNumber, token) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                adminDetails.firstName,
                adminDetails.lastName,
                adminDetails.street,
                adminDetails.city,
                adminDetails.isActive,
                adminEmail,
                adminPassword,
                adminDetails.phoneNumber,
                adminDetails.token
            ]
        )

        // Insert a dummy user account.
        const dummyEmail = 'name@email.com'
        const dummyPassword =
            '$2b$10$Or1NY6Jz7mC9XPzORshlsuHDuVHpu78GafUBRlEm3zr1dsb/TNOly' // Hashed password
        const dummyDetails = {
            firstName: 'Voornaam',
            lastName: 'Achternaam',
            street: 'Straat 123',
            city: 'Stad',
            isActive: 1,
            phoneNumber: '0000000000',
            token: null
        }

        await connection.query(
            `INSERT INTO user (firstName, lastName, street, city, isActive, emailAdress, password, phoneNumber, token) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                dummyDetails.firstName,
                dummyDetails.lastName,
                dummyDetails.street,
                dummyDetails.city,
                dummyDetails.isActive,
                dummyEmail,
                dummyPassword,
                dummyDetails.phoneNumber,
                dummyDetails.token
            ]
        )

        // Insert a meal.
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
            userId: 1 // Assume the dummy user has ID 1.
        }

        await connection.query(
            `INSERT INTO meal (name, description, isActive, isVega, isVegan, isToTakeHome, dateTime, imageUrl, allergens, maxAmountOfParticipants, price, cookId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                mealDetails.name,
                mealDetails.description,
                mealDetails.isActive,
                mealDetails.isVega,
                mealDetails.isVegan,
                mealDetails.isToTakeHome,
                mealDetails.dateTime,
                mealDetails.imageUrl,
                mealDetails.allergens,
                mealDetails.maxAmountOfParticipants,
                mealDetails.price,
                mealDetails.userId
            ]
        )

        await connection.commit() // Commit the transaction.
        logger.info('Database reset successfully') // Log a message that the database was reset successfully.
    } catch (err) {
        await connection.rollback() // Roll back the transaction in case of an error.
        logger.error('Error resetting database:', err) // Log the error.
        throw err // Re-throw the error.
    } finally {
        await connection.end() // Close the database connection.
    }
}

module.exports = { resetDatabase } // Export the resetDatabase function so it can be used in other parts of the application.
