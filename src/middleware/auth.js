const jwt = require('jsonwebtoken');
const config = require('../util/config');
const logger = require('../util/logger');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        logger.warn('No token provided');
        return res.status(401).json({ status: 401, message: 'Unauthorized' });
    }

    logger.info(`Token provided: ${token}`);
    
    jwt.verify(token, config.secretkey, (err, user) => {
        if (err) {
            logger.warn(`Invalid token: ${token}`);
            return res.status(403).json({ status: 403, message: 'Forbidden' });
        }

        logger.info(`User authenticated: ${user.id}`);
        req.userId = user.id;
        next();
    });
};

module.exports = { authenticateToken };