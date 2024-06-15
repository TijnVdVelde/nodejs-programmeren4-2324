require('dotenv').config();
const { URL } = require('url');

const dbUrl = process.env.DATABASE_URL || 'mysql://root:password@localhost:3307/share_a_meal';

// Parse the database URL
const parsedDbUrl = new URL(dbUrl);

const config = {
    secretkey: process.env.SECRETKEY || 'DitIsEenGeheim',
    dbHost: process.env.MYSQLHOST || 'localhost',
    dbUser: process.env.MYSQLUSER || 'root',
    dbPassword: process.env.MYSQLPASSWORD || '',
    dbPort: process.env.MYSQLPORT || 3307,
    dbDatabase: process.env.MYSQLDATABASE || 'share_a_meal'
};

console.log('Database Config:', config); // Add this line to print the config

module.exports = config;