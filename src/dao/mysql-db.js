const mysql = require('mysql2');
const logger = require('../util/logger');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    port: 3307,
    database: 'share_a_meal'
});

connection.connect(err => {
    if (err) {
        logger.error('Error connecting to the database:', err);
        return;
    }
    logger.info('Connected to the MySQL database.');
});

const database = {
    getAllUsers(callback) {
        connection.query('SELECT * FROM users', (err, results) => {
            if (err) {
                logger.error('Error fetching users:', err);
                return callback(err, null);
            }
            callback(null, results);
        });
    },

    getUserById(id, callback) {
        connection.query('SELECT * FROM users WHERE id = ?', [id], (err, results) => {
            if (err) {
                logger.error('Error fetching user:', err);
                return callback(err, null);
            }
            if (results.length === 0) {
                const errMsg = `User not found with id ${id}`;
                logger.error(errMsg);
                return callback({ status: 404, message: errMsg }, null);
            }
            callback(null, results[0]);
        });
    },

    getUserByEmail(email, callback) {
        connection.query('SELECT * FROM users WHERE emailAdress = ?', [email], (err, results) => {
            if (err) {
                logger.error('Error fetching user:', err);
                return callback(err, null);
            }
            if (results.length === 0) {
                const errMsg = `User not found with email ${email}`;
                logger.error(errMsg);
                return callback({ status: 404, message: errMsg }, null);
            }
            callback(null, results[0]);
        });
    },

    addUser(user, callback) {
        const { firstName, lastName, street, city, isActive, emailAdress, password, phoneNumber, token } = user;
        connection.query('INSERT INTO users (firstName, lastName, street, city, isActive, emailAdress, password, phoneNumber, token) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [firstName, lastName, street, city, isActive, emailAdress, password, phoneNumber, token], (err, results) => {
                if (err) {
                    logger.error('Error adding user:', err);
                    return callback(err, null);
                }
                callback(null, { id: results.insertId, ...user });
            });
    },

    updateUser(id, updatedUser, callback) {
        connection.query('UPDATE users SET ? WHERE id = ?', [updatedUser, id], (err, results) => {
            if (err) {
                logger.error('Error updating user:', err);
                return callback(err, null);
            }
            if (results.affectedRows === 0) {
                const errMsg = `Error: id ${id} does not exist!`;
                logger.error(errMsg);
                return callback({ status: 404, message: errMsg }, null);
            }
            callback(null, { id, ...updatedUser });
        });
    },

    deleteUser(id, callback) {
        connection.query('DELETE FROM users WHERE id = ?', [id], (err, results) => {
            if (err) {
                logger.error('Error deleting user:', err);
                return callback(err, null);
            }
            if (results.affectedRows === 0) {
                const errMsg = `Error: id ${id} does not exist!`;
                logger.error(errMsg);
                return callback({ status: 404, message: errMsg }, null);
            }
            callback(null, { message: `User with id ${id} deleted successfully.` });
        });
    }
};

module.exports = database;