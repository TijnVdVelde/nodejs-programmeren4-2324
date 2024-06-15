const mysql = require('mysql2/promise');
const config = require('../util/config');
const logger = require('../util/logger');

const pool = mysql.createPool({
    host: config.dbHost,
    user: config.dbUser,
    password: config.dbPassword,
    port: config.dbPort,
    database: config.dbDatabase,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

pool.getConnection()
    .then(connection => {
        logger.info('Connected to the MySQL database.');
        connection.release();
    })
    .catch(err => {
        logger.error('Error connecting to the MySQL database:', err.message);
    });

module.exports = pool;