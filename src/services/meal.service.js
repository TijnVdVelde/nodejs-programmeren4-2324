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
    }
};

module.exports = mealService;
