const database = require('../dao/inmem-db');
const logger = require('../util/logger');

const mealService = {
    create: (meal, userId, callback) => {
        logger.info('create meal', meal);
        
        // Add the owner ID to the meal
        meal.ownerId = userId;
        
        database.addMeal(meal, (err, data) => {
            if (err) {
                logger.info('error creating meal: ', err.message || 'unknown error');
                callback(err, null);
            } else {
                logger.trace(`Meal created with id ${data.id}.`);
                callback(null, {
                    status: 200,
                    message: `Meal created with id ${data.id}.`,
                    data: data
                });
            }
        });
    },

    getAll: (callback) => {
        logger.info('get all meals');
        database.getAllMeals((err, data) => {
            if (err) {
                callback(err, null);
            } else {
                callback(null, {
                    status: 200,
                    message: `Found ${data.length} meals.`,
                    data: data
                });
            }
        });
    },

    getById: (id, callback) => {
        logger.info(`get meal by id ${id}`);
        database.getMealById(id, (err, data) => {
            if (err) {
                logger.error('error getting meal: ', err.message || 'unknown error');
                callback(err, null);
            } else if (!data) {
                const errMsg = `Meal not found with id ${id}`;
                logger.info(errMsg);
                callback({ status: 404, message: errMsg }, null);
            } else {
                callback(null, {
                    status: 200,
                    message: `Meal found with id ${id}.`,
                    data: data
                });
            }
        });
    },

    update: (id, meal, userId, callback) => {
        logger.info(`update meal with id ${id}`, meal);

        database.getMealById(id, (err, existingMeal) => {
            if (err) {
                logger.error('error getting meal: ', err.message || 'unknown error');
                callback(err, null);
                return;
            }

            if (!existingMeal) {
                const errMsg = `Meal not found with id ${id}`;
                logger.info(errMsg);
                callback({ status: 404, message: errMsg }, null);
                return;
            }

            if (existingMeal.ownerId !== userId) {
                const errMsg = `User not authorized to update meal with id ${id}`;
                logger.info(errMsg);
                callback({ status: 403, message: errMsg }, null);
                return;
            }

            database.updateMeal(id, meal, (err, updatedMeal) => {
                if (err) {
                    logger.error('error updating meal: ', err.message || 'unknown error');
                    callback(err, null);
                } else {
                    logger.trace(`Meal updated with id ${id}.`);
                    callback(null, {
                        status: 200,
                        message: `Meal updated successfully.`,
                        data: updatedMeal
                    });
                }
            });
        });
    }
};

module.exports = mealService;
