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
        logger.trace('getAll users');
        const criteria = req.query;
        userService.getAll(criteria, (error, success) => {
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
                    status: 200,
                    message: success.message,
                    data: success.data
                });
            }
        });
    },
    
    delete: (req, res, next) => {
        const userId = parseInt(req.params.userId, 10); // Convert the userId from string to integer
        const tokenUserId = req.userId;

        // Check if the user making the request is the owner of the data
        if (userId !== tokenUserId) {
            return res.status(403).json({
                status: 403,
                message: 'Forbidden',
                data: {}
            });
        }

        // Now, check if the user exists
        userService.getById(userId, (error, success) => {
            if (error) {
                return next({
                    status: error.status,
                    message: error.message,
                    data: {}
                });
            }

            // Proceed to delete the user
            userService.delete(userId, (error, success) => {
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
        });
    },

    update: (req, res, next) => {
        const userId = parseInt(req.params.userId, 10); // Fix parameter name to match the route
        const updatedData = req.body;
        const tokenUserId = req.userId;

        // Check if user exists
        userService.getById(userId, (err, result) => {
            if (err) {
                return next({
                    status: 404,
                    message: `User not found with id ${userId}`,
                    data: {}
                });
            }

            // Check if the user making the request is the owner of the data
            if (userId !== tokenUserId) {
                return res.status(403).json({
                    status: 403,
                    message: 'You are not authorized to update this user',
                    data: {}
                });
            }

            userService.update(userId, updatedData, (error, success) => {
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
        logger.info(`Fetching profile for user ID: ${userId}`);
        if (!userId || isNaN(userId)) {
            return next({
                status: 400,
                message: "Invalid user ID",
                data: {}
            });
        }
        userService.getProfile(userId, (error, success) => {
            if (error) {
                return next({
                    status: error.status,
                    message: error.message,
                    data: {}
                });
            }
            res.status(200).json({
                status: success.status,
                message: success.message,
                data: success.data
            });
        });
    }
};

module.exports = userController;
