const database = require('../dao/inmem-db');
const logger = require('../util/logger');

const userService = {
    create: (user, callback) => {
        logger.info('create user', user);
        database.add(user, (err, data) => {
            if (err) {
                logger.info('error creating user: ', err.message || 'unknown error');
                callback(err, null);
            } else {
                logger.trace(`User created with id ${data.id}.`);
                callback(null, {
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
                    message: `Found ${data.length} users.`,
                    data: data
                });
            }
        });
    },

    getById: (id, callback) => {
        logger.info(`getById with id ${id}`);
        database.getById(id, (err, data) => {
            if (err) {
                logger.error('error getting user: ', err.message || 'unknown error');
                callback(err, null);
            } else if (!data) {
                logger.info(`User not found with id ${id}`);
                callback(new Error('User not found'), null);
            } else {
                callback(null, {
                    message: `User found with id ${id}.`,
                    data: data
                });
            }
        });
    },

    // Add to userService
    delete: (id, callback) => {
        logger.info(`delete user with id ${id}`);
        database.delete(id, (err, result) => {
            if (err) {
                logger.error('error deleting user: ', err.message || 'unknown error');
                callback(err, null);
            } else {
                callback(null, result);
            }
        });
    },

    update: (id, user, callback) => {
        logger.info(`update user with id ${id}`, user);
        database.update(id, user, (err, data) => {
            if (err) {
                logger.error('error updating user: ', err.message || 'unknown error');
                callback(err, null);
            } else {
                logger.trace(`User updated with id ${id}.`);
                callback(null, {
                    message: `User updated successfully.`,
                    data: data
                });
            }
        });
    }
    

};

module.exports = userService;