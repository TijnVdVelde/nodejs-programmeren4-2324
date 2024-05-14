const userService = require('../services/user.service');
const logger = require('../util/logger');

let userController = {
    create: (req, res, next) => {
        const user = req.body;
        logger.info('create user', user.firstName, user.lastName);
        userService.create(user, (error, success) => {
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
        logger.trace('getAll');
        userService.getAll((error, success) => {
            if (error) {
                return next({
                    status: error.status,
                    message: error.message,
                    data: {}
                });
            }
            if (success) {
                res.status(200).json({
                    status: 200,
                    message: success.message,
                    data: success.data
                });
            }
        });
    },

    getById: (req, res, next) => {
        const userId = parseInt(req.params.userId, 10); // Convert the userId from string to integer
        if (isNaN(userId)) {
            return next({
                status: 400,
                message: "Invalid user ID",
                data: {}
            });
        }
        logger.trace('userController: getById', userId);
        userService.getById(userId, (error, success) => {
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
        const userId = parseInt(req.params.userId, 10);
        if (isNaN(userId)) {
            return next({
                status: 400,
                message: "Invalid user ID",
                data: {}
            });
        }
        logger.trace('delete user', userId);
        userService.delete(userId, (error, success) => {
            if (error) {
                return next({
                    status: error.status || 500,
                    message: error.message,
                    data: {}
                });
            }
            res.status(200).json({
                status: 200,
                message: success.message,
                data: {}
            });
        });
    },

    update: (req, res, next) => {
        const userId = parseInt(req.params.userId, 10);
        if (isNaN(userId)) {
            return next({
                status: 400,
                message: "Invalid user ID",
                data: {}
            });
        }
        const userData = req.body;
        logger.trace('update user', userId);
        userService.update(userId, userData, (error, success) => {
            if (error) {
                return next({
                    status: error.status || 500,
                    message: error.message,
                    data: {}
                });
            }
            res.status(200).json({
                status: 200,
                message: success.message,
                data: success.data
            });
        });
    },

    login: (req, res, next) => {
        const { emailAdress, password } = req.body;
        logger.info('Login attempt by', emailAdress);
    
        userService.login(emailAdress, password, (error, success) => {
            if (error) {
                return next({
                    status: error.status || 500,
                    message: error.message,
                    data: {}
                });
            }
            if (success) {
                res.status(200).json({
                    status: 200,
                    message: success.message,
                    data: success.data
                });
            }
        });
    },

    getProfile: (req, res, next) => {
        const userId = req.userId; // This is set by the authentication middleware
        logger.info('Fetching profile for user ID:', userId);
        if (!userId || isNaN(userId)) {
            logger.error('Invalid user ID:', userId);
            return next({
                status: 400,
                message: "Invalid user ID",
                data: {}
            });
        }
        logger.trace('userController: getProfile', userId);
        userService.getById(userId, (error, success) => {
            if (error) {
                logger.error('Error getting profile for user ID:', userId, error.message);
                return next({
                    status: error.status || 500,
                    message: error.message,
                    data: {}
                });
            }
            if (success) {
                logger.info('Profile data retrieved:', success.data);
                res.status(200).json({
                    status: 200,
                    message: success.message,
                    data: success.data
                });
            }
        });
    }
    
};

module.exports = userController;
