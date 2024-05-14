const database = require('../dao/inmem-db');
const logger = require('../util/logger');

const userService = {
    create: (user, callback) => {
        logger.info('create user', user);
        
        // Check if the email address already exists
        const existingUser = database._data.find(u => u.emailAdress === user.emailAdress);
        if (existingUser) {
            const errMsg = `Email address ${user.emailAdress} already exists.`;
            logger.error(errMsg);
            callback({ status: 400, message: errMsg }, null);
            return;
        }
        
        database.add(user, (err, data) => {
            if (err) {
                logger.info('error creating user: ', err.message || 'unknown error');
                callback(err, null);
            } else {
                logger.trace(`User created with id ${data.id}.`);
                callback(null, {
                    status: 200,
                    message: `User created with id ${data.id}.`,
                    data: data
                });
            }
        });
    },

    getAll: (callback) => {
        logger.info('getAll');
        database.getAll((err, data) => {
            if (err) {
                callback(err, null);
            } else {
                callback(null, {
                    status: 200,
                    message: `Found ${data.length} users.`,
                    data: data
                });
            }
        });
    },

    getById: (id, callback) => {
        logger.info(`getById with id ${id}`);
        if (isNaN(id)) {
            const errMsg = `Error: id ${id} is not a valid number!`;
            logger.error(errMsg);
            callback({ status: 400, message: errMsg }, null);
            return;
        }
        database.getById(id, (err, data) => {
            if (err) {
                logger.error('error getting user: ', err.message || 'unknown error');
                callback(err, null);
            } else if (!data) {
                const errMsg = `User not found with id ${id}`;
                logger.info(errMsg);
                callback({ status: 404, message: errMsg }, null);
            } else {
                const meals = database._data.filter(meal => meal.cookId === id && new Date(meal.date) >= new Date());
                callback(null, {
                    status: 200,
                    message: `User found with id ${id}.`,
                    data: { user: data, meals }
                });
            }
        });
    },

    delete: (id, callback) => {
        logger.info(`delete user with id ${id}`);
        if (isNaN(id)) {
            const errMsg = `Error: id ${id} is not a valid number!`;
            logger.error(errMsg);
            callback({ status: 400, message: errMsg }, null);
            return;
        }
        database.delete(id, (err, result) => {
            if (err) {
                logger.error('error deleting user: ', err.message || 'unknown error');
                callback(err, null);
            } else {
                callback(null, {
                    status: 200,
                    message: result.message
                });
            }
        });
    },

    update: (id, user, callback) => {
        logger.info(`update user with id ${id}`, user);
        if (isNaN(id)) {
            const errMsg = `Error: id ${id} is not a valid number!`;
            logger.error(errMsg);
            callback({ status: 400, message: errMsg }, null);
            return;
        }
        
        // Check if the email address already exists for a different user
        const existingUser = database._data.find(u => u.emailAdress === user.emailAdress && u.id !== id);
        if (existingUser) {
            const errMsg = `Email address ${user.emailAdress} already exists.`;
            logger.error(errMsg);
            callback({ status: 400, message: errMsg }, null);
            return;
        }
        
        database.update(id, user, (err, data) => {
            if (err) {
                logger.error('error updating user: ', err.message || 'unknown error');
                callback(err, null);
            } else {
                logger.trace(`User updated with id ${id}.`);
                callback(null, {
                    status: 200,
                    message: `User updated successfully.`,
                    data: data
                });
            }
        });
    },

    login: (email, password, callback) => {
        logger.info('Attempting login for', email);
        const user = database._data.find(user => user.emailAdress === email);

        if (!user) {
            logger.warn('User not found:', email);
            callback({ status: 404, message: 'User not found' }, null);
        } else if (user.password !== password) {
            logger.warn('Incorrect password for user:', email);
            callback({ status: 401, message: 'Incorrect password' }, null);
        } else {
            const token = Buffer.from(`${user.id}:${new Date().getTime()}`).toString('base64');
            user.token = token;
            logger.info('Login successful for', email, 'with token', token);
            callback(null, {
                status: 200,
                message: 'Login successful',
                data: {
                    user: {
                        id: user.id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        emailAdress: user.emailAdress
                    },
                    token
                }
            });
        }
    }
};

module.exports = userService;
