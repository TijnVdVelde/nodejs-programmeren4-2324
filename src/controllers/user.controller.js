const userService = require('../services/user.service');
const logger = require('../util/logger');

let userController = {
    // Beschrijving: Deze functie maakt een nieuwe gebruiker aan.
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

    // Beschrijving: Deze functie haalt alle gebruikers op.
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

    // Beschrijving: Deze functie haalt een gebruiker op basis van ID.
    getById: (req, res, next) => {
        const userId = parseInt(req.params.userId, 10); // Converteert de userId van string naar integer
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
    
    // Beschrijving: Deze functie verwijdert een gebruiker op basis van ID.
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

    // Beschrijving: Deze functie werkt een bestaande gebruiker bij.
    update: (req, res, next) => {
        const userId = parseInt(req.params.userId, 10); // Converteert de userId van string naar integer
        const updatedData = req.body;
        const tokenUserId = req.userId;

        // Controleert of de gebruiker bestaat
        userService.getById(userId, (err, result) => {
            if (err) {
                return next({
                    status: 404,
                    message: `User not found with id ${userId}`,
                    data: {}
                });
            }

            // Controleert of de gebruiker die het verzoek doet de eigenaar is van de gegevens
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

    // Beschrijving: Deze functie logt een gebruiker in.
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

    // Beschrijving: Deze functie haalt het profiel van een gebruiker op basis van de ingelogde gebruiker-ID.
    getProfile: (req, res, next) => {
        const userId = req.userId; // Dit is ingesteld door de authenticatiemiddleware
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