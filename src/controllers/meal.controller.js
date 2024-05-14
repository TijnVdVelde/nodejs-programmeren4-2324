const mealService = require('../services/meal.service');
const logger = require('../util/logger');

let mealController = {
    create: (req, res, next) => {
        const meal = req.body;
        const userId = req.userId;
        logger.info('create meal', meal);

        mealService.create(meal, userId, (error, success) => {
            if (error) {
                return next({
                    status: error.status,
                    message: error.message,
                    data: {}
                });
            }
            if (success) {
                res.status(200).json({
                    status: success.status,
                    message: success.message,
                    data: success.data
                });
            }
        });
    },

    getAll: (req, res, next) => {
        logger.info('get all meals');
        mealService.getAll((error, success) => {
            if (error) {
                return next({
                    status: error.status,
                    message: error.message,
                    data: {}
                });
            }
            if (success) {
                res.status(200).json({
                    status: success.status,
                    message: success.message,
                    data: success.data
                });
            }
        });
    },

    getById: (req, res, next) => {
        const mealId = parseInt(req.params.mealId, 10);

        if (isNaN(mealId)) {
            return next({
                status: 400,
                message: "Invalid meal ID",
                data: {}
            });
        }

        logger.info(`get meal by id ${mealId}`);

        mealService.getById(mealId, (error, success) => {
            if (error) {
                return next({
                    status: error.status,
                    message: error.message,
                    data: {}
                });
            }
            if (success) {
                res.status(200).json({
                    status: success.status,
                    message: success.message,
                    data: success.data
                });
            }
        });
    },

    update: (req, res, next) => {
        const mealId = parseInt(req.params.mealId, 10);
        const userId = req.userId;
        const meal = req.body;

        logger.info(`update meal with id ${mealId}`);

        if (isNaN(mealId)) {
            return next({
                status: 400,
                message: "Invalid meal ID",
                data: {}
            });
        }

        mealService.update(mealId, meal, userId, (error, success) => {
            if (error) {
                return next({
                    status: error.status,
                    message: error.message,
                    data: {}
                });
            }
            if (success) {
                res.status(200).json({
                    status: success.status,
                    message: success.message,
                    data: success.data
                });
            }
        });
    },

    delete: (req, res, next) => {
        const mealId = parseInt(req.params.mealId, 10);
        const userId = req.userId;

        logger.info(`delete meal with id ${mealId}`);

        if (isNaN(mealId)) {
            return next({
                status: 400,
                message: "Invalid meal ID",
                data: {}
            });
        }

        mealService.delete(mealId, userId, (error, success) => {
            if (error) {
                return next({
                    status: error.status,
                    message: error.message,
                    data: {}
                });
            }
            if (success) {
                res.status(200).json({
                    status: success.status,
                    message: success.message,
                    data: success.data
                });
            }
        });
    }
};

module.exports = mealController;
