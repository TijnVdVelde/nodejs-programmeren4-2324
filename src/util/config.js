const secretkey = process.env.SECRETKEY || 'DitIsEenGeheim';

const config = {
    secretkey: secretkey,
    dbHost: 'localhost',
    dbUser: 'root',
    dbPassword: '',
    dbPort: 3307,
    dbDatabase: 'share_a_meal'
};

module.exports = config;