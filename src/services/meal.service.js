const mysql = require('mysql2/promise') // Importeer de mysql2/promise module om gebruik te maken van MySQL met async/await.
const config = require('../util/config') // Importeer de configuratie-instellingen.
const logger = require('../util/logger') // Importeer de logger module voor het loggen van informatie en fouten.

// Maak een verbindingspool aan met de opgegeven configuratie-instellingen.
const pool = mysql.createPool({
    host: config.dbHost, // De hostnaam van de database.
    user: config.dbUser, // De gebruikersnaam voor de database.
    password: config.dbPassword, // Het wachtwoord voor de databasegebruiker.
    port: config.dbPort, // De poort waarop de database draait.
    database: config.dbDatabase, // De naam van de database.
    waitForConnections: true, // Wacht op beschikbare verbindingen wanneer de limiet is bereikt.
    connectionLimit: 10, // Het maximale aantal verbindingen in de pool.
    queueLimit: 0 // De maximale lengte van de wachtrij voor verbindingen. 0 betekent onbeperkt.
})

// De mealService object met methoden voor het aanmaken, ophalen, bijwerken en verwijderen van maaltijden.
const mealService = {
    // Methode om een nieuwe maaltijd aan te maken.
    create: async (meal, userId, callback) => {
        logger.info('create meal', meal)

        // Valideer verplichte velden
        if (!meal.name || !meal.description || !meal.dateTime || !meal.price) {
            const errMsg = 'Missing required fields'
            logger.info(errMsg)
            return callback({ status: 400, message: errMsg }, null)
        }

        // Wijs de ingelogde gebruiker toe als de eigenaar van de maaltijd
        meal.cook = { id: userId }

        try {
            const [result] = await pool.query(
                'INSERT INTO meal (name, description, isActive, isVega, isVegan, isToTakeHome, dateTime, imageUrl, allergens, maxParticipants, price, userId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [
                    meal.name,
                    meal.description,
                    meal.isActive,
                    meal.isVega,
                    meal.isVegan,
                    meal.isToTakeHome,
                    meal.dateTime,
                    meal.imageUrl,
                    JSON.stringify(meal.allergens),
                    meal.maxAmountOfParticipants,
                    meal.price,
                    userId
                ]
            )
            logger.trace(`Meal created with id ${result.insertId}.`)
            callback(null, {
                status: 200,
                message: `Meal created with id ${result.insertId}.`,
                data: { id: result.insertId, ...meal }
            })
        } catch (err) {
            logger.error(
                'Error creating meal: ',
                err.message || 'unknown error'
            )
            callback({ status: 500, message: 'Internal Server Error' }, null)
        }
    },

    // Methode om alle maaltijden op te halen.
    getAll: async (callback) => {
        logger.info('get all meal')
        try {
            const [results] = await pool.query('SELECT * FROM meal')
            callback(null, {
                status: 200,
                message: `Found ${results.length} meal.`,
                data: results
            })
        } catch (err) {
            logger.error(
                'Error fetching meal: ',
                err.message || 'unknown error'
            )
            callback({ status: 500, message: 'Internal Server Error' }, null)
        }
    },

    // Methode om een maaltijd op te halen op basis van ID.
    getById: async (id, callback) => {
        logger.info(`get meal by id ${id}`)
        try {
            const [results] = await pool.query(
                'SELECT * FROM meal WHERE id = ?',
                [id]
            )
            if (results.length === 0) {
                const errMsg = `Meal not found with id ${id}`
                logger.info(errMsg)
                callback({ status: 404, message: errMsg }, null)
            } else {
                callback(null, {
                    status: 200,
                    message: `Meal found with id ${id}.`,
                    data: results[0]
                })
            }
        } catch (err) {
            logger.error(
                'Error fetching meal: ',
                err.message || 'unknown error'
            )
            callback({ status: 500, message: 'Internal Server Error' }, null)
        }
    },

    // Methode om een bestaande maaltijd bij te werken.
    update: async (id, meal, userId, callback) => {
        // Log de update actie
        logger.info(`update meal with id ${id}`, meal)

        // Log de binnenkomende gegevens voor debugdoeleinden
        logger.debug(`Incoming meal data: ${JSON.stringify(meal)}`)

        // Controleer of er update gegevens zijn verstrekt
        if (Object.keys(meal).length === 0) {
            const errMsg = 'No data provided for update'
            logger.info(errMsg)
            return callback({ status: 400, message: errMsg }, null)
        }

        try {
            // Zoek de bestaande maaltijd in de database
            const [existingMealResult] = await pool.query(
                'SELECT * FROM meal WHERE id = ?',
                [id]
            )
            const existingMeal = existingMealResult[0]

            // Controleer of de maaltijd bestaat
            if (!existingMeal) {
                const errMsg = `Meal not found with id ${id}`
                logger.info(errMsg)
                return callback({ status: 404, message: errMsg }, null)
            }

            // Controleer of de gebruiker gemachtigd is om de maaltijd bij te werken
            if (existingMeal.userId !== userId) {
                const errMsg = `User not authorized to update meal with id ${id}`
                logger.info(errMsg)
                return callback({ status: 403, message: errMsg }, null)
            }

            // Valideer verplichte velden alleen als ze zijn opgegeven
            const requiredFields = ['name', 'description', 'dateTime', 'price']
            for (const field of requiredFields) {
                if (meal.hasOwnProperty(field) && !meal[field]) {
                    const errMsg = `Missing value for required field: ${field}`
                    logger.info(errMsg)
                    return callback({ status: 400, message: errMsg }, null)
                }
            }

            // Bouw de query dynamisch op basis van de opgegeven velden
            const updateFields = []
            const updateValues = []

            for (const [key, value] of Object.entries(meal)) {
                updateFields.push(`${key} = ?`)
                updateValues.push(value)
            }

            updateValues.push(id)

            const updateQuery = `UPDATE meal SET ${updateFields.join(
                ', '
            )} WHERE id = ?`

            await pool.query(updateQuery, updateValues)

            // Log de succesvolle update
            logger.trace(`Meal updated with id ${id}.`)

            // Haal de bijgewerkte maaltijdgegevens op om terug te sturen in de response
            const [updatedMealResult] = await pool.query(
                'SELECT * FROM meal WHERE id = ?',
                [id]
            )
            const updatedMeal = updatedMealResult[0]

            // Retourneer de response met de bijgewerkte maaltijdgegevens
            callback(null, {
                status: 200,
                message: `Meal updated successfully.`,
                data: updatedMeal
            })
        } catch (err) {
            // Log de fout en retourneer een interne serverfout
            logger.error(
                'Error updating meal: ',
                err.message || 'unknown error'
            )
            callback({ status: 500, message: 'Internal Server Error' }, null)
        }
    },

    // Methode om een maaltijd te verwijderen op basis van ID.
    delete: async (id, userId, callback) => {
        logger.info(`delete meal with id ${id}`)

        try {
            const [existingMealResult] = await pool.query(
                'SELECT * FROM meal WHERE id = ?',
                [id]
            )
            const existingMeal = existingMealResult[0]

            if (!existingMeal) {
                const errMsg = `Meal not found with id ${id}`
                logger.info(errMsg)
                return callback({ status: 404, message: errMsg }, null)
            }

            if (existingMeal.userId !== userId) {
                const errMsg = `User not authorized to delete meal with id ${id}`
                logger.info(errMsg)
                return callback({ status: 403, message: errMsg }, null)
            }

            await pool.query('DELETE FROM meal WHERE id = ?', [id])

            logger.trace(`Meal deleted with id ${id}.`)
            callback(null, {
                status: 200,
                message: `Meal deleted successfully.`,
                data: { message: `Meal with id ${id} deleted successfully.` }
            })
        } catch (err) {
            logger.error(
                'Error deleting meal: ',
                err.message || 'unknown error'
            )
            callback({ status: 500, message: 'Internal Server Error' }, null)
        }
    }
}

module.exports = mealService // Exporteer het mealService object zodat deze gebruikt kan worden in andere delen van de applicatie.
