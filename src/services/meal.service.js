const mysql = require('mysql2/promise')
const config = require('../util/config')
const logger = require('../util/logger')

const pool = mysql.createPool({
    host: config.dbHost,
    user: config.dbUser,
    password: config.dbPassword,
    port: config.dbPort,
    database: config.dbDatabase,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
})

const mealService = {
    create: async (meal, userId, callback) => {
        logger.info('create meal', meal)
        if (!meal.name || !meal.description || !meal.dateTime || !meal.price) {
            const errMsg = 'Missing required fields'
            logger.info(errMsg)
            return callback({ status: 400, message: errMsg }, null)
        }
        meal.cookId = userId
        try {
            const allergenes = meal.allergenes ? meal.allergenes.join(',') : ''
            const [result] = await pool.query(
                'INSERT INTO meal (name, description, isActive, isVega, isVegan, isToTakeHome, dateTime, imageUrl, allergenes, maxAmountOfParticipants, price, cookId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [
                    meal.name,
                    meal.description,
                    meal.isActive,
                    meal.isVega,
                    meal.isVegan,
                    meal.isToTakeHome,
                    meal.dateTime,
                    meal.imageUrl,
                    allergenes,
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

    getAll: async (callback) => {
        logger.info('get all meal')
        try {
            const [results] = await pool.query('SELECT * FROM meal')
            callback(null, {
                status: 200,
                message: `Found ${results.length} meals.`,
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
    update: async (id, meal, userId, callback) => {
        logger.info(`update meal with id ${id}`, meal)
        logger.debug(`Incoming meal data: ${JSON.stringify(meal)}`)
        if (!meal.name || !meal.description || !meal.dateTime || !meal.price) {
            const errMsg = 'Missing required fields'
            logger.info(errMsg)
            return callback({ status: 400, message: errMsg }, null)
        }
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
            if (existingMeal.cookId !== userId) {
                const errMsg = `User not authorized to update meal with id ${id}`
                logger.info(errMsg)
                return callback({ status: 403, message: errMsg }, null)
            }
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
            logger.trace(`Meal updated with id ${id}.`)
            const [updatedMealResult] = await pool.query(
                'SELECT * FROM meal WHERE id = ?',
                [id]
            )
            const updatedMeal = updatedMealResult[0]
            callback(null, {
                status: 200,
                message: `Meal updated successfully.`,
                data: updatedMeal
            })
        } catch (err) {
            logger.error(
                'Error updating meal: ',
                err.message || 'unknown error'
            )
            callback({ status: 500, message: 'Internal Server Error' }, null)
        }
    },
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
            if (existingMeal.cookId !== userId) {
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

module.exports = mealService
