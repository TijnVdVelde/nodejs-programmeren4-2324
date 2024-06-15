require('dotenv').config();
const { URL } = require('url');

const dbUrl = process.env.DATABASE_URL || 'mysql://root:password@localhost:3307/share_a_meal';

// Parse the database URL
const parsedDbUrl = new URL(dbUrl);

const config = {
    secretkey: process.env.SECRETKEY || 'DitIsEenGeheim',
    dbHost: parsedDbUrl.hostname,
    dbUser: parsedDbUrl.username,
    dbPassword: parsedDbUrl.password,
    dbPort: parsedDbUrl.port || 3307,
    dbDatabase: parsedDbUrl.pathname.replace('/', '')
};

module.exports = config;