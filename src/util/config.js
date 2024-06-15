require('dotenv').config();

const config = {
    secretkey: process.env.SECRETKEY || 'DitIsEenGeheim',
    dbHost: process.env.MYSQLHOST || 'localhost',
    dbUser: process.env.MYSQLUSER || 'root',
    dbPassword: process.env.MYSQLPASSWORD || '',
    dbPort: process.env.MYSQLPORT || 3307,
    dbDatabase: process.env.MYSQLDATABASE || 'share_a_meal'
};

module.exports = config;