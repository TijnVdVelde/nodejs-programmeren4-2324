const mysql = require('mysql2/promise');
const config = require('../util/config');
const logger = require('../util/logger');

const pool = mysql.createPool({
    host: config.dbHost,
    user: config.dbUser,
    password: config.dbPassword,
    port: config.dbPort,
    database: config.dbDatabase,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const mealService = {
    create: async (meal, userId, callback) => {
        logger.info('create meal', meal);

        // Validate required fields
        if (!meal.name || !meal.description || !meal.dateTime || !meal.price) {
            const errMsg = 'Missing required fields';
            logger.info(errMsg);
            return callback({ status: 400, message: errMsg }, null);
        }

        // Assign the logged-in user as the owner of the meal
        meal.cook = { id: userId };

        try {
            const [result] = await pool.query(
                'INSERT INTO meals (name, description, isActive, isVega, isVegan, isToTakeHome, dateTime, imageUrl, allergens, maxParticipants, price, userId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [meal.name, meal.description, meal.isActive, meal.isVega, meal.isVegan, meal.isToTakeHome, meal.dateTime, meal.imageUrl, JSON.stringify(meal.allergens), meal.maxAmountOfParticipants, meal.price, userId]
            );
            logger.trace(`Meal created with id ${result.insertId}.`);
            callback(null, {
                status: 200,
                message: `Meal created with id ${result.insertId}.`,
                data: { id: result.insertId, ...meal }
            });
        } catch (err) {
            logger.error('Error creating meal: ', err.message || 'unknown error');
            callback(err, null);
        }
    },

    getAll: async (callback) => {
        logger.info('get all meals');
        try {
            const [results] = await pool.query('SELECT * FROM meals');
            callback(null, {
                status: 200,
                message: `Found ${results.length} meals.`,
                data: results
            });
        } catch (err) {
            logger.error('Error fetching meals: ', err.message || 'unknown error');
            callback(err, null);
        }
    },

    getById: async (id, callback) => {
        logger.info(`get meal by id ${id}`);
        try {
            const [results] = await pool.query('SELECT * FROM meals WHERE id = ?', [id]);
            if (results.length === 0) {
                const errMsg = `Meal not found with id ${id}`;
                logger.info(errMsg);
                callback({ status: 404, message: errMsg }, null);
            } else {
                callback(null, {
                    status: 200,
                    message: `Meal found with id ${id}.`,
                    data: results[0]
                });
            }
        } catch (err) {
            logger.error('Error fetching meal: ', err.message || 'unknown error');
            callback(err, null);
        }
    },

    update: async (id, meal, userId, callback) => {
        logger.info(`update meal with id ${id}`, meal);

        try {
            const [existingMealResult] = await pool.query('SELECT * FROM meals WHERE id = ?', [id]);
            const existingMeal = existingMealResult[0];

            if (!existingMeal) {
                const errMsg = `Meal not found with id ${id}`;
                logger.info(errMsg);
                return callback({ status: 404, message: errMsg }, null);
            }

            if (existingMeal.userId !== userId) {
                const errMsg = `User not authorized to update meal with id ${id}`;
                logger.info(errMsg);
                return callback({ status: 403, message: errMsg }, null);
            }

            // Merge existing meal data with the new data
            const updatedMeal = {
                ...existingMeal,
                ...meal
            };

            await pool.query(
                'UPDATE meals SET name = ?, description = ?, isActive = ?, isVega = ?, isVegan = ?, isToTakeHome = ?, dateTime = ?, imageUrl = ?, allergens = ?, maxParticipants = ?, price = ? WHERE id = ?',
                [updatedMeal.name, updatedMeal.description, updatedMeal.isActive, updatedMeal.isVega, updatedMeal.isVegan, updatedMeal.isToTakeHome, updatedMeal.dateTime, updatedMeal.imageUrl, JSON.stringify(updatedMeal.allergens), updatedMeal.maxParticipants, updatedMeal.price, id]
            );

            logger.trace(`Meal updated with id ${id}.`);
            callback(null, {
                status: 200,
                message: `Meal updated successfully.`,
                data: updatedMeal
            });
        } catch (err) {
            logger.error('Error updating meal: ', err.message || 'unknown error');
            callback(err, null);
        }
    },

    delete: async (id, userId, callback) => {
        logger.info(`delete meal with id ${id}`);

        try {
            const [existingMealResult] = await pool.query('SELECT * FROM meals WHERE id = ?', [id]);
            const existingMeal = existingMealResult[0];

            if (!existingMeal) {
                const errMsg = `Meal not found with id ${id}`;
                logger.info(errMsg);
                return callback({ status: 404, message: errMsg }, null);
            }

            if (existingMeal.userId !== userId) {
                const errMsg = `User not authorized to delete meal with id ${id}`;
                logger.info(errMsg);
                return callback({ status: 403, message: errMsg }, null);
            }

            await pool.query('DELETE FROM meals WHERE id = ?', [id]);

            logger.trace(`Meal deleted with id ${id}.`);
            callback(null, {
                status: 200,
                message: `Meal deleted successfully.`,
                data: { message: `Meal with id ${id} deleted successfully.` }
            });
        } catch (err) {
            logger.error('Error deleting meal: ', err.message || 'unknown error');
            callback(err, null);
        }
    }
};

module.exports = mealService;