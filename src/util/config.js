require('dotenv').config();

const secretkey = process.env.SECRETKEY || 'DitIsEenGeheim';

const config = {
    secretkey: secretkey,
    dbHost: process.env.DB_HOST || 'localhost',
    dbUser: process.env.DB_USER || 'root',
    dbPassword: process.env.DB_PASSWORD || '',
    dbPort: process.env.DB_PORT || 3307,
    dbDatabase: process.env.DB_DATABASE || 'share_a_meal'
};

module.exports = config;