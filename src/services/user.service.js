const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const database = require('../dao/mysql-db');
const logger = require('../util/logger');
const config = require('../util/config');

const userService = {
    create: async (user, callback) => {
        logger.info('create user', user);

        try {
            const [existingUsers] = await database.query(
                'SELECT * FROM users WHERE emailAdress = ?',
                [user.emailAdress]
            );

            if (existingUsers.length > 0) {
                const errMsg = 'Email address already in use';
                logger.info(errMsg);
                return callback({ status: 400, message: errMsg }, null);
            }

            if (!user.firstName || !user.lastName || !user.emailAdress || !user.password || !user.street || !user.city || !user.phoneNumber) {
                const errMsg = 'Missing required fields';
                logger.info(errMsg);
                return callback({ status: 400, message: errMsg }, null);
            }

            user.password = await bcrypt.hash(user.password, 10);

            const [result] = await database.query(
                'INSERT INTO users (firstName, lastName, street, city, isActive, emailAdress, password, phoneNumber) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [user.firstName, user.lastName, user.street, user.city, user.isActive, user.emailAdress, user.password, user.phoneNumber]
            );

            logger.trace(`User created with id ${result.insertId}.`);
            callback(null, {
                status: 200,
                message: `User created with id ${result.insertId}.`,
                data: { id: result.insertId, ...user }
            });
        } catch (err) {
            logger.info('error creating user: ', err.message || 'unknown error');
            callback(err, null);
        }
    },

    getAll: async (criteria, callback) => {
        logger.info('getAll users');
        try {
            const [data] = await database.query('SELECT * FROM users');
            let filteredData = data;

            if (criteria) {
                if (criteria.isActive !== undefined) {
                    filteredData = filteredData.filter(
                        (user) => user.isActive === (criteria.isActive === 'true')
                    );
                }
                if (criteria.firstName) {
                    filteredData = filteredData.filter(
                        (user) => user.firstName === criteria.firstName
                    );
                }
                if (criteria.city) {
                    filteredData = filteredData.filter(
                        (user) => user.city === criteria.city
                    );
                }
            }

            callback(null, {
                status: 200,
                message: `Found ${filteredData.length} users.`,
                data: filteredData
            });
        } catch (err) {
            callback(err, null);
        }
    },

    getById: async (id, callback) => {
        logger.info(`getById with id ${id}`);
        if (isNaN(id)) {
            const errMsg = `Error: id ${id} is not a valid number!`;
            logger.error(errMsg);
            callback({ status: 400, message: errMsg }, null);
            return;
        }

        try {
            const [data] = await database.query('SELECT * FROM users WHERE id = ?', [id]);

            if (data.length === 0) {
                const errMsg = `User not found with id ${id}`;
                logger.info(errMsg);
                callback({ status: 404, message: errMsg }, null);
                return;
            }

            const user = data[0];

            callback(null, {
                status: 200,
                message: `User found with id ${id}.`,
                data: { user, meals: futureMeals }
            });
        } catch (err) {
            logger.error('error getting user: ', err.message || 'unknown error');
            callback(err, null);
        }
    },

    delete: async (id, callback) => {
        logger.info(`delete user with id ${id}`);
        if (isNaN(id)) {
            const errMsg = `Error: id ${id} is not a valid number!`;
            logger.error(errMsg);
            callback({ status: 400, message: errMsg }, null);
            return;
        }

        try {
            const [result] = await database.query('DELETE FROM users WHERE id = ?', [id]);

            if (result.affectedRows === 0) {
                const errMsg = `User not found with id ${id}`;
                logger.info(errMsg);
                callback({ status: 404, message: errMsg }, null);
                return;
            }

            callback(null, {
                status: 200,
                message: `User with id ${id} successfully deleted.`
            });
        } catch (err) {
            logger.error('error deleting user: ', err.message || 'unknown error');
            callback(err, null);
        }
    },

    update: async (userId, updatedData, callback) => {
        try {
            const [userResult] = await database.query('SELECT * FROM users WHERE id = ?', [userId]);

            if (userResult.length === 0) {
                return callback({ status: 404, message: `User not found with id ${userId}` }, null);
            }

            const user = userResult[0];

            if (updatedData.emailAdress) {
                const [existingUsers] = await database.query(
                    'SELECT * FROM users WHERE emailAdress = ? AND id != ?',
                    [updatedData.emailAdress, userId]
                );

                if (existingUsers.length > 0) {
                    return callback({ status: 400, message: 'Email address already in use' }, null);
                }
            }

            if (updatedData.password) {
                updatedData.password = await bcrypt.hash(updatedData.password, 10);
            }

            const updatedUser = { ...user, ...updatedData };
            await database.query(
                'UPDATE users SET firstName = ?, lastName = ?, street = ?, city = ?, isActive = ?, emailAdress = ?, password = ?, phoneNumber = ? WHERE id = ?',
                [updatedUser.firstName, updatedUser.lastName, updatedUser.street, updatedUser.city, updatedUser.isActive, updatedUser.emailAdress, updatedUser.password, updatedUser.phoneNumber, userId]
            );

            callback(null, {
                status: 200,
                message: 'User updated successfully',
                data: updatedUser
            });
        } catch (err) {
            callback(err, null);
        }
    },

    login: async (email, password, callback) => {
        logger.info('Attempting login for', email);

        try {
            const [userResult] = await database.query('SELECT * FROM users WHERE emailAdress = ?', [email]);

            if (userResult.length === 0) {
                logger.warn('User not found:', email);
                callback({ status: 404, message: 'User not found' }, null);
                return;
            }

            const user = userResult[0];
            const passwordMatch = await bcrypt.compare(password, user.password);

            if (!passwordMatch) {
                logger.warn('Incorrect password for user:', email);
                callback({ status: 401, message: 'Incorrect password' }, null);
                return;
            }

            const token = jwt.sign({ id: user.id }, config.secretkey, { expiresIn: '1h' });
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
        } catch (err) {
            logger.error('Error during login:', err.message || 'unknown error');
            callback(err, null);
        }
    },

    getProfile: async (userId, callback) => {
        logger.info(`getProfile for user with id ${userId}`);

        try {
            const [userResult] = await database.query('SELECT * FROM users WHERE id = ?', [userId]);

            if (userResult.length === 0) {
                return callback({ status: 404, message: `User not found with id ${userId}` }, null);
            }

            const user = userResult[0];
            const [futureMeals] = await database.query(
                'SELECT * FROM meals WHERE userId = ? AND dateTime >= NOW()',
                [userId]
            );

            callback(null, {
                status: 200,
                message: `Profile retrieved successfully.`,
                data: {
                    user: user,
                    meals: futureMeals
                }
            });
        } catch (err) {
            logger.error('Error getting profile:', err.message || 'unknown error');
            callback(err, null);
        }
    }
};

module.exports = userService;